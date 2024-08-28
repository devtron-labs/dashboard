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

import React, { useEffect, useContext } from 'react'
import {
    PluginType,
    ScriptType,
    VariableType,
    RefVariableType,
    Progressing,
    CDEmptyState,
    PluginListContainer,
} from '@devtron-labs/devtron-fe-common-lib'
import { PreBuildType } from '../ciPipeline/types'
import EmptyPreBuild from '../../assets/img/pre-build-empty.png'
import EmptyPostBuild from '../../assets/img/post-build-empty.png'
import EmptyPreDeployment from '../../assets/img/pre-deployment-empty.png'
import EmptyPostDeployment from '../../assets/img/post-deployment-empty.png'
import CustomScriptCard from './CustomScriptCard'
import { BuildStageVariable, ViewType } from '../../config'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { TaskDetailComponent } from './TaskDetailComponent'
import nojobs from '../../assets/img/empty-joblist@2x.png'
import { importComponentFromFELibrary } from '../common'
import { pipelineContext } from '../workflowEditor/workflowEditor'

const isRequired = importComponentFromFELibrary('isRequired', null, 'function')
export const PreBuild: React.FC<PreBuildType> = ({ isJobView }) => {
    const {
        formData,
        isCdPipeline,
        setFormData,
        addNewTask,
        selectedTaskIndex,
        setSelectedTaskIndex,
        activeStageName,
        formDataErrorObj,
        setFormDataErrorObj,
        calculateLastStepDetail,
        validateStage,
        pageState,
        pluginDataStore,
        handlePluginDataStoreUpdate,
        availableTags,
        handleUpdateAvailableTags,
        mandatoryPluginsMap = {},
    } = useContext(pipelineContext)

    useEffect(() => {
        setSelectedTaskIndex(0)
    }, [activeStageName])

    const setVariableStepIndexInPlugin = (variable): VariableType => {
        variable.refVariableStepIndex = 0
        variable.refVariableName = ''
        variable.variableType = RefVariableType.NEW
        variable.variableStepIndexInPlugin = variable.variableStepIndex
        delete variable.refVariableStage
        delete variable.variableStepIndex
        return variable
    }

    function setPluginType(
        pluginType: PluginType,
        pluginId: number,
        pluginName?: string,
        pluginDescription?: string,
        inputVariables?: VariableType[],
        outputVariables?: VariableType[],
    ): void {
        const _form = { ...formData }
        const _formDataErrorObj = { ...formDataErrorObj }
        let isPluginRequired = false
        _form[activeStageName].steps[selectedTaskIndex].stepType = pluginType
        if (pluginType === PluginType.INLINE) {
            _form[activeStageName].steps[selectedTaskIndex].inlineStepDetail = {
                scriptType: ScriptType.SHELL,
                script: '#!/bin/sh \nset -eo pipefail \n#set -v  ## uncomment this to debug the script \n', // default value for shell
                conditionDetails: [],
                inputVariables: [],
                outputVariables: [],
                commandArgsMap: [
                    {
                        command: '',
                        args: [],
                    },
                ],
                portMap: [],
                mountCodeToContainer: false,
                mountDirectoryFromHost: false,
            }
            _formDataErrorObj[activeStageName].steps[selectedTaskIndex] = {
                ..._formDataErrorObj[activeStageName].steps[selectedTaskIndex],
                inlineStepDetail: { inputVariables: [], outputVariables: [] },
            }
        } else {
            const parentPluginId = pluginDataStore.pluginVersionStore[pluginId].parentPluginId
            isPluginRequired =
                !isJobView &&
                isRequired &&
                !isCdPipeline &&
                isRequired(formData, mandatoryPluginsMap, activeStageName, parentPluginId, pluginDataStore, false)
            _form[activeStageName].steps[selectedTaskIndex].description = pluginDescription
            _form[activeStageName].steps[selectedTaskIndex].name = pluginName
            _form[activeStageName].steps[selectedTaskIndex].isMandatory = isPluginRequired
            _form[activeStageName].steps[selectedTaskIndex].pluginRefStepDetail = {
                id: 0,
                pluginId,
                conditionDetails: [],
                inputVariables: inputVariables.map(setVariableStepIndexInPlugin),
                outputVariables: outputVariables.map(setVariableStepIndexInPlugin),
            }
            _formDataErrorObj[activeStageName].steps[selectedTaskIndex] = {
                ..._formDataErrorObj[activeStageName].steps[selectedTaskIndex],
                pluginRefStepDetail: { inputVariables: [] },
            }
            if (_form[activeStageName].steps.length > selectedTaskIndex) {
                calculateLastStepDetail(false, _form, activeStageName, selectedTaskIndex)
            }
        }
        setFormData(_form)
        if (isPluginRequired) {
            validateStage(activeStageName, _form, _formDataErrorObj)
        } else {
            setFormDataErrorObj(_formDataErrorObj)
        }
    }

    const handlePluginSelection = (parentPluginId: number) => {
        const latestVersionPluginId = pluginDataStore.parentPluginStore[parentPluginId].latestVersionId
        const pluginDetails = pluginDataStore.pluginVersionStore[latestVersionPluginId]
        setPluginType(
            PluginType.PLUGIN_REF,
            pluginDetails.id,
            pluginDetails.name,
            pluginDetails.description,
            pluginDetails.inputVariables ?? [],
            pluginDetails.outputVariables ?? [],
        )
    }

    function renderPluginList(): JSX.Element {
        return (
            <div className="px-20 pb-20 dc__overflow-scroll flexbox-col">
                <div className="cn-9 fw-6 fs-14 pb-10 pt-20">What do you want this task to do?</div>
                <div onClick={() => setPluginType(PluginType.INLINE, 0)}>
                    <CustomScriptCard />
                </div>
                <PluginListContainer
                    availableTags={availableTags}
                    handleUpdateAvailableTags={handleUpdateAvailableTags}
                    pluginDataStore={pluginDataStore}
                    handlePluginDataStoreUpdate={handlePluginDataStoreUpdate}
                    handlePluginSelection={handlePluginSelection}
                    isSelectable={false}
                    persistFilters={false}
                    rootClassName="pt-8 pre-build-plugin-list-container dc__gap-4 pb-4 flex-grow-1"
                />
            </div>
        )
    }

    const getImgSource = () => {
        if (isJobView) {
            return nojobs
        }
        if (activeStageName === BuildStageVariable.PreBuild) {
            return isCdPipeline ? EmptyPreDeployment : EmptyPreBuild
        }
        return isCdPipeline ? EmptyPostDeployment : EmptyPostBuild
    }

    function renderGUI(): JSX.Element {
        if (formData[activeStageName].steps.length === 0) {
            const _postText = isCdPipeline ? 'deployment' : 'build'
            const _postSubtitleText = isCdPipeline ? 'deployment' : 'the container image is built'
            const _preBuildText =
                activeStageName === BuildStageVariable.PreBuild ? `pre-${_postText}` : `post-${_postText}`
            const _execOrderText = activeStageName === BuildStageVariable.PreBuild ? 'before' : 'after'
            const _title = isJobView ? 'No tasks configured' : `No ${_preBuildText} tasks configured`
            const _subtitle = isJobView
                ? 'Configure tasks to be executed by this job.'
                : `Here, you can configure tasks to be executed ${_execOrderText} ${_postSubtitleText}.`

            return (
                <CDEmptyState
                    imgSource={getImgSource()}
                    title={_title}
                    subtitle={_subtitle}
                    actionHandler={addNewTask}
                    actionButtonText="Add task"
                    ActionButtonIcon={Add}
                    dataTestId="pre-build-add-task-button"
                />
            )
        }

        if (!formData[activeStageName].steps[selectedTaskIndex]?.stepType) {
            return renderPluginList()
        }

        return (
            <div className="flexbox-col flex-grow-1 dc__overflow-scroll">
                <TaskDetailComponent />
            </div>
        )
    }

    const renderComponent = () => {
        if (pageState === ViewType.LOADING) {
            return (
                <div style={{ minHeight: '200px' }} className="flex">
                    <Progressing pageLoader />
                </div>
            )
        }

        return renderGUI()
    }

    return <React.Fragment key={activeStageName}>{renderComponent()}</React.Fragment>
}
