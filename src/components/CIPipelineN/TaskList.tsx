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

import React, { useState, useContext, Fragment } from 'react'
import {
    PopupMenu,
    BuildStageVariable,
    PluginType,
    RefVariableStageType,
    RefVariableType,
    StepType,
    ActivityIndicator,
    ImageWithFallback,
} from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { ReactComponent as Drag } from '../../assets/icons/drag.svg'
import { ReactComponent as Dots } from '../../assets/icons/appstatus/ic-menu-dots.svg'
import { ReactComponent as Trash } from '../../assets/icons/ic-delete-interactive.svg'
import { ReactComponent as AlertTriangle } from '../../assets/icons/ic-alert-triangle.svg'
import { ReactComponent as MoveToPre } from '../../assets/icons/ic-arrow-backward.svg'
import { ReactComponent as ICLegoBlock } from '../../assets/icons/ic-lego-block.svg'
import { ReactComponent as ICEditFile } from '../../assets/icons/ic-edit-file.svg'
import { TaskListType } from '../ciConfig/types'
import { importComponentFromFELibrary } from '../common'
import { pipelineContext } from '../workflowEditor/workflowEditor'
import { PipelineFormType } from '../workflowEditor/types'

const MandatoryPluginMenuOptionTippy = importComponentFromFELibrary('MandatoryPluginMenuOptionTippy')
const isRequired = importComponentFromFELibrary('isRequired', null, 'function')
export const TaskList = ({
    withWarning,
    mandatoryPluginsMap,
    setInputVariablesListFromPrevStep,
    isJobView,
}: TaskListType) => {
    const {
        formData,
        setFormData,
        isCdPipeline,
        addNewTask,
        activeStageName,
        selectedTaskIndex,
        setSelectedTaskIndex,
        calculateLastStepDetail,
        formDataErrorObj,
        setFormDataErrorObj,
        validateTask,
        validateStage,
        pluginDataStore,
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
        const _taskDetail = newList.splice(taskIndex, 1)
        let isMandatoryMissing = false
        if (_taskDetail[0].isMandatory) {
            isMandatoryMissing = true
            const deletedTaskPluginId = _taskDetail[0].pluginRefStepDetail.pluginId
            const parentPluginId = pluginDataStore.pluginVersionStore[deletedTaskPluginId]?.parentPluginId

            for (const task of newList) {
                const currentTaskPluginId = task.pluginRefStepDetail?.pluginId
                const currentTaskParentPluginId =
                    pluginDataStore.pluginVersionStore[currentTaskPluginId]?.parentPluginId

                if (currentTaskParentPluginId === parentPluginId) {
                    task.isMandatory = true
                    isMandatoryMissing = false
                    break
                }
            }
        }
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

        if (isMandatoryMissing) {
            validateStage(activeStageName, _formData, _formDataErrorObj)
        } else {
            setFormDataErrorObj(_formDataErrorObj)
        }
    }

    const moveTaskToOtherStage = (e): void => {
        const taskIndex = +e.currentTarget.dataset.index
        const moveToStage =
            activeStageName === BuildStageVariable.PreBuild ? BuildStageVariable.PostBuild : BuildStageVariable.PreBuild
        const _formData = { ...formData }
        const newList = [..._formData[activeStageName].steps]
        const _taskDetail = newList.splice(taskIndex, 1)
        let isMandatoryMissing = false
        if (_taskDetail[0].pluginRefStepDetail) {
            const pluginId = _taskDetail[0].pluginRefStepDetail.pluginId
            const parentPluginId = pluginDataStore.pluginVersionStore[pluginId]?.parentPluginId
            const isPluginRequired =
                !isJobView &&
                isRequired &&
                !isCdPipeline &&
                // TODO: Test this change to shift newList to formData
                isRequired(_formData, mandatoryPluginsMap, moveToStage, parentPluginId, pluginDataStore, true)
            if (_taskDetail[0].isMandatory && !isPluginRequired) {
                isMandatoryMissing = true
                // FIXME: Fix this check and refactor this code
                for (const task of newList) {
                    const taskParentPluginId =
                        pluginDataStore.pluginVersionStore[task.pluginRefStepDetail?.pluginId]?.parentPluginId
                    if (!!parentPluginId && !!taskParentPluginId && taskParentPluginId === parentPluginId) {
                        task.isMandatory = true
                        isMandatoryMissing = false
                        break
                    }
                }
                _taskDetail[0].isMandatory = false
            } else {
                _taskDetail[0].isMandatory = isPluginRequired
            }

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
        if (isMandatoryMissing) {
            validateStage(activeStageName, _formData, _formDataErrorObj)
        } else {
            validateTask(formData[moveToStage].steps[taskIndex], _formDataErrorObj[moveToStage].steps[taskIndex])
            setFormDataErrorObj(_formDataErrorObj)
        }
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

    // TODO: A component would be better
    const renderTaskTitleTippyContent = (
        isLatest: boolean,
        pluginVersion: string,
        pluginName: string,
        displayName: string,
    ) => {
        return (
            <div className="flexbox-col dc__gap-6">
                <div className="flexbox-col dc__gap-4">
                    <h4 className="m-0 cn-0 fs-12 fw-6 lh-18 dc__truncate">{displayName}</h4>

                    <p className="m-0 dc__truncate c-n50">
                        {pluginName}({pluginVersion})
                    </p>
                </div>

                {!isLatest && (
                    <>
                        <div className="dc__border-bottom--n7" />

                        <div className="px-2 flexbox dc__align-items-center dc__gap-4">
                            <ActivityIndicator
                                rootClassName="dc__no-shrink"
                                backgroundColorClass="bcg-5"
                                iconSizeClass="icon-dim-8"
                            />
                            <span className="cg-5 fs-12 fw-6 lh-16">New version available </span>
                        </div>
                    </>
                )}
            </div>
        )
    }

    const renderTaskTitle = (taskDetail: StepType) => {
        const pluginId = taskDetail.pluginRefStepDetail?.pluginId
        const { isLatest, pluginVersion, name: pluginName } = pluginDataStore.pluginVersionStore[pluginId] || {}

        if (!pluginId) {
            return <span className="dc__ellipsis-right">{taskDetail.name}</span>
        }

        return (
            <Tippy
                arrow={false}
                className="default-tt w-200"
                content={renderTaskTitleTippyContent(isLatest, pluginVersion, pluginName, taskDetail.name)}
            >
                <span className="w-100 dc__ellipsis-right">{taskDetail.name}</span>
            </Tippy>
        )
    }

    // TODO: Ask for icon of inline as well
    const renderPluginIcon = (taskDetail: StepType) => {
        const pluginId = taskDetail.pluginRefStepDetail?.pluginId
        const { isLatest, icon, name } = pluginDataStore.pluginVersionStore[pluginId] || {}

        if (!pluginId) {
            return (
                <ICEditFile className="dc__no-shrink icon-dim-20" />
            )
        }

        if (isLatest) {
            return (
                <ImageWithFallback
                    fallbackImage={<ICLegoBlock className="dc__no-shrink icon-dim-20" />}
                    imageProps={{
                        src: icon,
                        alt: `${name} logo`,
                        width: 20,
                        height: 20,
                        className: 'dc__no-shrink',
                    }}
                />
            )
        }

        return (
            <div className="icon-dim-20 dc__no-shrink flexbox dc__position-rel dc__content-center">
                <ImageWithFallback
                    fallbackImage={<ICLegoBlock className="dc__no-shrink icon-dim-20" />}
                    imageProps={{
                        src: icon,
                        alt: `${name} logo`,
                        width: 20,
                        height: 20,
                        className: 'dc__no-shrink',
                    }}
                />

                <div className="icon-dim-8 dc__transparent dc__no-shrink dc__position-abs dc__bottom-0 dc__right-0 flex">
                    <ActivityIndicator
                        rootClassName="dc__no-shrink"
                        backgroundColorClass="bcg-5"
                        iconSizeClass="icon-dim-6"
                    />
                </div>
            </div>
        )
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
                            <Drag className="drag-icon mw-20" onMouseDown={() => setDragAllowed(true)} />
                            <div
                                className={`flex left dc__gap-6 ${
                                    formDataErrorObj[activeStageName].steps[index] &&
                                    !formDataErrorObj[activeStageName].steps[index].isValid
                                        ? 'w-70'
                                        : 'w-80'
                                }`}
                            >
                                {renderPluginIcon(taskDetail)}
                                {renderTaskTitle(taskDetail)}
                                {taskDetail.isMandatory && <span className="cr-5 ml-4">*</span>}
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
                                    {!isJobView &&
                                        !isCdPipeline &&
                                        taskDetail.isMandatory &&
                                        MandatoryPluginMenuOptionTippy && (
                                            <MandatoryPluginMenuOptionTippy
                                                pluginDetail={
                                                    mandatoryPluginsMap[
                                                        pluginDataStore.pluginVersionStore[
                                                            taskDetail.pluginRefStepDetail.pluginId
                                                        ].parentPluginId
                                                    ]
                                                }
                                            />
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
