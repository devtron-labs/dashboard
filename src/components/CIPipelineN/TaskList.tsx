/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useState, useContext, Fragment } from 'react'
import {
    PopupMenu,
    BuildStageVariable,
    PluginType,
    RefVariableStageType,
    RefVariableType,
    PipelineFormType,
} from '@devtron-labs/devtron-fe-common-lib'
import TaskTitle from './TaskTitle'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { ReactComponent as Drag } from '../../assets/icons/drag.svg'
import { ReactComponent as Dots } from '../../assets/icons/appstatus/ic-menu-dots.svg'
import { ReactComponent as Trash } from '../../assets/icons/ic-delete-interactive.svg'
import { ReactComponent as AlertTriangle } from '../../assets/icons/ic-alert-triangle.svg'
import { ReactComponent as MoveToPre } from '../../assets/icons/ic-arrow-backward.svg'
import { TaskListType } from '../ciConfig/types'
import { pipelineContext } from '../workflowEditor/workflowEditor'

export const TaskList = ({
    withWarning,
    setInputVariablesListFromPrevStep,
    isJobView,
}: TaskListType) => {
    const {
        formData,
        setFormData,
        addNewTask,
        activeStageName,
        selectedTaskIndex,
        setSelectedTaskIndex,
        calculateLastStepDetail,
        formDataErrorObj,
        setFormDataErrorObj,
        validateTask,
        validateStage,
        handleValidateMandatoryPlugins,
    } = useContext(pipelineContext)
    const [dragItemStartIndex, setDragItemStartIndex] = useState<number>(0)
    const [dragItemIndex, setDragItemIndex] = useState<number>(0)
    const [dragAllowed, setDragAllowed] = useState<boolean>(false)
    const handleDragStart = (index: number): void => {
        setDragItemIndex(index)
        setDragItemStartIndex(index)
    }

    const handleDragEnter = (index: number): void => {
        const _formData = { ...formData }
        const newList = [..._formData[activeStageName].steps]
        const item = newList[dragItemIndex]
        newList.splice(dragItemIndex, 1)
        newList.splice(index, 0, item)
        setDragItemIndex(index)
        setSelectedTaskIndex(index)
        _formData[activeStageName].steps = newList
        const _formDataErrorObj = { ...formDataErrorObj }
        const newErrorList = [...formDataErrorObj[activeStageName].steps]
        const errorItem = newErrorList[dragItemIndex]
        newErrorList.splice(dragItemIndex, 1)
        newErrorList.splice(index, 0, errorItem)
        _formDataErrorObj[activeStageName].steps = newErrorList
        setFormData(_formData)
        setFormDataErrorObj(_formDataErrorObj)
    }

    const handleDrop = (index: number): void => {
        setDragAllowed(false)
        const _formData = { ...formData }
        calculateLastStepDetail(
            false,
            _formData,
            activeStageName,
            dragItemStartIndex < index ? dragItemStartIndex : index,
        )
        validateCurrentTask(index)
        setFormData(_formData)
        setDragItemStartIndex(index)
    }

    const deleteTask = (e): void => {
        const taskIndex = +e.currentTarget.dataset.index
        const _formData = { ...formData }
        const newList = [..._formData[activeStageName].steps]
        newList.splice(taskIndex, 1)
    
        _formData[activeStageName].steps = newList
        const newListLength = newList.length
        const newListIndex = newListLength > 1 ? newListLength - 1 : 0
        const newTaskIndex = taskIndex >= newListLength ? newListIndex : taskIndex
        calculateLastStepDetail(false, _formData, activeStageName, newTaskIndex)
        setTimeout(() => {
            setSelectedTaskIndex(newTaskIndex)
        }, 0)
        const _formDataErrorObj = { ...formDataErrorObj }
        if (activeStageName === BuildStageVariable.PreBuild && _formData[BuildStageVariable.PostBuild].steps?.length) {
            clearDependentPostVariables(_formData, taskIndex, _formDataErrorObj)
        } else {
            setFormData(_formData)
        }
        const newErrorList = [...formDataErrorObj[activeStageName].steps]
        newErrorList.splice(taskIndex, 1)
        _formDataErrorObj[activeStageName].steps = newErrorList

        setFormDataErrorObj(_formDataErrorObj)
        handleValidateMandatoryPlugins({
            newFormData: _formData,
        })
    }

    const moveTaskToOtherStage = (e): void => {
        const taskIndex = +e.currentTarget.dataset.index
        const moveToStage =
            activeStageName === BuildStageVariable.PreBuild ? BuildStageVariable.PostBuild : BuildStageVariable.PreBuild
        const _formData = { ...formData }
        const newList = [..._formData[activeStageName].steps]
        const _taskDetail = newList.splice(taskIndex, 1)

        if (_taskDetail[0].pluginRefStepDetail) {
            const pluginId = _taskDetail[0].pluginRefStepDetail.pluginId

            _taskDetail[0].pluginRefStepDetail = {
                id: 0,
                pluginId,
                conditionDetails: [],
                inputVariables: _taskDetail[0].pluginRefStepDetail.inputVariables ?? [],
                outputVariables: _taskDetail[0].pluginRefStepDetail.outputVariables ?? [],
            }
        }

        _formData[moveToStage].steps.push(_taskDetail[0])
        _formData[activeStageName].steps = newList
        const newListLength = newList.length
        const newTaskIndex = taskIndex >= newListLength ? (newListLength > 1 ? newListLength - 1 : 0) : taskIndex
        reCalculatePrevStepVar(_formData, newTaskIndex)
        setTimeout(() => {
            setSelectedTaskIndex(newTaskIndex)
        }, 0)
        const _formDataErrorObj = { ...formDataErrorObj }
        const newErrorList = [...formDataErrorObj[activeStageName].steps]
        newErrorList.splice(taskIndex, 1)
        _formDataErrorObj[activeStageName].steps = newErrorList
        _formDataErrorObj[moveToStage].steps.push({
            name: { isValid: true, message: null },
            isValid: true,
            [_taskDetail[0].stepType === PluginType.INLINE ? 'inlineStepDetail' : 'pluginRefStepDetail']: {
                inputVariables: [],
                outputVariables: [],
            },
        })
        if (activeStageName === BuildStageVariable.PreBuild && _formData[BuildStageVariable.PostBuild].steps?.length) {
            clearDependentPostVariables(_formData, taskIndex, _formDataErrorObj)
        } else {
            setFormData(_formData)
        }

        // FIXME: During review re-check should'nt it be from _formData?
        validateTask(formData[moveToStage].steps[taskIndex], _formDataErrorObj[moveToStage].steps[taskIndex])
        setFormDataErrorObj(_formDataErrorObj)
        handleValidateMandatoryPlugins({
            newFormData: _formData,
        })
    }

    const clearDependentPostVariables = (
        _formData: PipelineFormType,
        deletedTaskIndex: number,
        _formDataErrorObj,
    ): void => {
        const stepsLength = _formData[BuildStageVariable.PostBuild].steps?.length
        let reValidateStage = false
        for (let i = 0; i < stepsLength; i++) {
            if (!_formData[BuildStageVariable.PostBuild].steps[i].stepType) {
                continue
            }
            const currentStepTypeVariable =
                _formData[BuildStageVariable.PostBuild].steps[i].stepType === PluginType.INLINE
                    ? 'inlineStepDetail'
                    : 'pluginRefStepDetail'
            if (_formData[BuildStageVariable.PostBuild].steps[i][currentStepTypeVariable].inputVariables) {
                for (const key in _formData[BuildStageVariable.PostBuild].steps[i][currentStepTypeVariable]
                    .inputVariables) {
                    const variableDetail =
                        _formData[BuildStageVariable.PostBuild].steps[i][currentStepTypeVariable].inputVariables[key]
                    if (
                        variableDetail.refVariableStage === RefVariableStageType.PRE_CI &&
                        variableDetail.refVariableStepIndex === deletedTaskIndex + 1
                    ) {
                        variableDetail.refVariableStepIndex = 0
                        variableDetail.refVariableName = ''
                        variableDetail.variableType = RefVariableType.NEW
                        delete variableDetail.refVariableStage
                        reValidateStage = true
                    }
                }
            }
        }
        if (reValidateStage) {
            validateStage(BuildStageVariable.PostBuild, _formData, _formDataErrorObj)
        }
        setFormData(_formData)
    }

    const reCalculatePrevStepVar = (_formData: PipelineFormType, newTaskIndex: number): void => {
        let preBuildVariable
        let postBuildVariable
        if (activeStageName === BuildStageVariable.PreBuild) {
            preBuildVariable = calculateLastStepDetail(
                false,
                _formData,
                BuildStageVariable.PreBuild,
                newTaskIndex,
            ).calculatedStageVariables
            postBuildVariable = calculateLastStepDetail(
                true,
                _formData,
                BuildStageVariable.PostBuild,
                0,
            ).calculatedStageVariables
        } else {
            const preTaskLength = _formData[BuildStageVariable.PreBuild].steps.length
            preBuildVariable = calculateLastStepDetail(
                false,
                _formData,
                BuildStageVariable.PreBuild,
                preTaskLength > 1 ? preTaskLength - 1 : 0,
                true,
            ).calculatedStageVariables
            postBuildVariable = calculateLastStepDetail(
                false,
                _formData,
                BuildStageVariable.PostBuild,
                newTaskIndex,
            ).calculatedStageVariables
        }
        setInputVariablesListFromPrevStep({
            preBuildStage: preBuildVariable,
            postBuildStage: postBuildVariable,
        })
    }

    function validateCurrentTask(index?: number): void {
        const _formDataErrorObj = { ...formDataErrorObj }
        validateTask(
            formData[activeStageName].steps[index || selectedTaskIndex],
            _formDataErrorObj[activeStageName].steps[index || selectedTaskIndex],
        )
        setFormDataErrorObj(_formDataErrorObj)
    }

    const handleSelectedTaskChange = (index: number): void => {
        validateCurrentTask()
        setSelectedTaskIndex(index)
    }

    return (
        <>
            <div className={withWarning ? 'with-warning' : ''}>
                {formData[activeStageName].steps?.map((taskDetail, index) => (
                    <Fragment key={`task-item-${index}`}>
                        <div
                            className={`task-item fw-4 fs-13 pointer flex-justify ${
                                selectedTaskIndex === index ? 'task-item__selected-list' : ''
                            }`}
                            draggable={dragAllowed}
                            onDragStart={() => handleDragStart(index)}
                            onDragEnter={() => handleDragEnter(index)}
                            onDrop={() => handleDrop(index)}
                            onDragOver={(e) => e.preventDefault()}
                            onClick={() => handleSelectedTaskChange(index)}
                        >
                            <Drag className="dc__grabbable icon-dim-20 p-2 dc__no-shrink" onMouseDown={() => setDragAllowed(true)} />
                            <div className={`flex left dc__gap-6 dc__content-space w-100`}>
                                <TaskTitle taskDetail={taskDetail} />
                            </div>
                            {formDataErrorObj[activeStageName].steps[index] &&
                                !formDataErrorObj[activeStageName].steps[index].isValid && (
                                    <AlertTriangle className="icon-dim-16 mr-5 ml-5 mt-2 mw-16" />
                                )}
                            <PopupMenu autoClose>
                                <PopupMenu.Button isKebab>
                                    <Dots
                                        className="icon-dim-16 mt-2 rotate"
                                        style={{ ['--rotateBy' as any]: '90deg' }}
                                    />
                                </PopupMenu.Button>
                                <PopupMenu.Body>
                                    <div
                                        className="flex left p-8 pointer dc__hover-n50"
                                        data-index={index}
                                        onClick={deleteTask}
                                    >
                                        <Trash className="icon-dim-16 mr-10" />
                                        Remove
                                    </div>
                                    {!isJobView && taskDetail.stepType && (
                                        <div
                                            className="flex left p-8 pointer dc__hover-n50"
                                            data-index={index}
                                            onClick={moveTaskToOtherStage}
                                        >
                                            {activeStageName === BuildStageVariable.PreBuild ? (
                                                <>
                                                    <MoveToPre
                                                        className="rotate icon-dim-16 mr-10"
                                                        style={{ ['--rotateBy' as any]: '180deg' }}
                                                    />
                                                    Move to post-build stage
                                                </>
                                            ) : (
                                                <>
                                                    <MoveToPre className="icon-dim-16 mr-10" />
                                                    Move to pre-build stage
                                                </>
                                            )}
                                        </div>
                                    )}
                                </PopupMenu.Body>
                            </PopupMenu>
                        </div>
                        <div className="vertical-line-connector" />
                    </Fragment>
                ))}
            </div>
            <div
                data-testid="sidebar-add-task-button"
                className="task-item add-task-container cb-5 fw-6 fs-13 flexbox"
                onClick={addNewTask}
            >
                <Add className="add-icon" /> Add task
            </div>
        </>
    )
}
