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

import { useMemo, useState } from 'react'

import {
    ComponentSizeType,
    DEFAULT_PLUGIN_DATA_STORE,
    noop,
    PluginType,
    ScriptType,
    SegmentedControl,
    SegmentType,
} from '@devtron-labs/devtron-fe-common-lib'

import { calculateLastStepDetailsLogic, validateTask } from '@Components/cdPipeline/cdpipeline.util'
import { ConditionContainerType, PluginVariableType } from '@Components/ciPipeline/types'
import { ConditionContainer } from '@Components/CIPipelineN/ConditionContainer'
import { TaskTypeDetailComponent } from '@Components/CIPipelineN/TaskTypeDetailComponent'
import { VariableDataTable } from '@Components/CIPipelineN/VariableDataTable'
import { PipelineContext } from '@Components/workflowEditor/types'
import { pipelineContext } from '@Components/workflowEditor/workflowEditor'

import { PLUGIN_TASK_STAGE_NAME } from '../constants'
import { uploadGlobalPluginFile, useGetPluginGlobalVariables } from '../service'
import { PluginTaskEditorProps } from '../types'
import { SCRIPT_TYPE_SEGMENTS, SELECTED_TASK_INDEX } from './constants'

import '@Components/ciPipeline/ciPipeline.scss'

const PluginTaskEditor = ({ formData, setFormData, formDataErrorObj, setFormDataErrorObj }: PluginTaskEditorProps) => {
    const [inputVariablesListFromPrevStep, setInputVariablesListFromPrevStep] = useState<
        PipelineContext['inputVariablesListFromPrevStep']
    >({ preBuildStage: [], postBuildStage: [] })

    const { data: globalVariables } = useGetPluginGlobalVariables()

    const step = formData[PLUGIN_TASK_STAGE_NAME].steps[SELECTED_TASK_INDEX]
    const { scriptType, inputVariables, outputVariables } = step.inlineStepDetail
    const isContainerImage = scriptType === ScriptType.CONTAINERIMAGE

    const calculateLastStepDetail: PipelineContext['calculateLastStepDetail'] = (
        isFromAddNewTask,
        _formData,
        activeStageName,
        startIndex,
        isFromMoveTask,
    ) => {
        const clonedFormDataErrorObj = { ...formDataErrorObj }
        const { stepsLength, _inputVariablesListPerTask } = calculateLastStepDetailsLogic(
            _formData,
            activeStageName,
            clonedFormDataErrorObj,
            isFromAddNewTask,
            startIndex,
            isFromMoveTask,
        )
        setInputVariablesListFromPrevStep((prev) => ({ ...prev, [activeStageName]: _inputVariablesListPerTask }))
        setFormDataErrorObj(clonedFormDataErrorObj)
        return { index: stepsLength + 1, calculatedStageVariables: _inputVariablesListPerTask }
    }

    const contextValue = useMemo<PipelineContext>(
        () => ({
            formData,
            setFormData,
            formDataErrorObj,
            setFormDataErrorObj,
            selectedTaskIndex: SELECTED_TASK_INDEX,
            setSelectedTaskIndex: noop,
            activeStageName: PLUGIN_TASK_STAGE_NAME,
            calculateLastStepDetail,
            validateTask,
            validateStage: noop,
            addNewTask: noop,
            appId: null,
            isCdPipeline: false,
            inputVariablesListFromPrevStep,
            setInputVariablesListFromPrevStep,
            globalVariables: globalVariables ?? [],
            pluginDataStore: DEFAULT_PLUGIN_DATA_STORE,
            handlePluginDataStoreUpdate: noop,
            availableTags: [],
            handleUpdateAvailableTags: noop,
            handleValidateMandatoryPlugins: noop,
            mandatoryPluginData: null,
            uploadFile: uploadGlobalPluginFile,
        }),
        [formData, formDataErrorObj, inputVariablesListFromPrevStep, globalVariables],
    )

    const handleScriptTypeChange = ({ value }: SegmentType<ScriptType>) => {
        setFormData((prevFormData) => {
            const clonedFormData = structuredClone(prevFormData)
            clonedFormData[PLUGIN_TASK_STAGE_NAME].steps[SELECTED_TASK_INDEX].inlineStepDetail.scriptType = value
            return clonedFormData
        })
    }

    if (step.stepType !== PluginType.INLINE) {
        return null
    }

    return (
        <pipelineContext.Provider value={contextValue}>
            <div className="flexbox-col dc__gap-6">
                <span className="cn-7 fs-13 fw-4 lh-20">Plugin type</span>
                <div>
                    <SegmentedControl
                        segments={SCRIPT_TYPE_SEGMENTS}
                        value={scriptType}
                        name="plugin-script-type"
                        onChange={handleScriptTypeChange}
                        size={ComponentSizeType.xs}
                    />
                </div>
            </div>

            <div className="plugin-task-editor flexbox-col dc__border-top-n1 pt-16">
                <VariableDataTable type={PluginVariableType.INPUT} isCustomTask />

                {inputVariables?.length > 0 && (
                    <div className="dc__border-top-n1 mt-16 pt-16">
                        <ConditionContainer type={ConditionContainerType.TRIGGER_SKIP} />
                    </div>
                )}

                <div className="dc__border-top-n1 mt-16 pt-16">
                    <TaskTypeDetailComponent />
                </div>

                {!isContainerImage && (
                    <div className="dc__border-top-n1 mt-16 pt-16">
                        <VariableDataTable type={PluginVariableType.OUTPUT} isCustomTask />
                    </div>
                )}

                {!isContainerImage && outputVariables?.length > 0 && (
                    <div className="dc__border-top-n1 mt-16 pt-16">
                        <ConditionContainer type={ConditionContainerType.PASS_FAILURE} />
                    </div>
                )}
            </div>
        </pipelineContext.Provider>
    )
}

export default PluginTaskEditor
