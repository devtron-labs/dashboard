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

import React, { useContext, useState } from 'react'
import { useParams } from 'react-router-dom'
import { BuildStageVariable } from '../../config'
import { ConditionContainerType, PluginVariableType, VariableType } from '../ciPipeline/types'
import { VariableContainer } from './VariableContainer'
import { ConditionContainer } from './ConditionContainer'
import {
    CustomInput,
    PluginType,
    ScriptType,
    StyledRadioGroup as RadioGroup,
    Progressing,
    getPluginsDetail,
    StepType,
    PluginDataStoreType,
    getUpdatedPluginStore,
} from '@devtron-labs/devtron-fe-common-lib'
import { PluginDetailHeader } from './PluginDetailHeader'
import { TaskTypeDetailComponent } from './TaskTypeDetailComponent'
import { ValidationRules } from '../ciPipeline/validationRules'
import { pipelineContext } from '../workflowEditor/workflowEditor'
import { PluginDetailHeaderProps, TaskDetailComponentParamsType } from './types'
import { filterInvalidConditionDetails } from '@Components/cdPipeline/cdpipeline.util'
import { VariableDataTable } from './VariableDataTable'

export const TaskDetailComponent = () => {
    const {
        formData,
        setFormData,
        selectedTaskIndex,
        activeStageName,
        formDataErrorObj,
        setFormDataErrorObj,
        isCdPipeline,
        pluginDataStore,
        handlePluginDataStoreUpdate,
        calculateLastStepDetail,
        validateStage,
    } = useContext(pipelineContext)
    const validationRules = new ValidationRules()
    const { appId } = useParams<TaskDetailComponentParamsType>()

    const [isLoadingPluginVersionDetails, setIsLoadingPluginVersionDetails] = useState<boolean>(false)

    const selectedStep: StepType = formData[activeStageName].steps[selectedTaskIndex]
    const currentStepTypeVariable =
        selectedStep.stepType === PluginType.INLINE ? 'inlineStepDetail' : 'pluginRefStepDetail'

    const handleNameChange = (e: any): void => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].name = e.target.value
        const _formErrorObject = { ...formDataErrorObj }
        _formErrorObject[activeStageName].steps[selectedTaskIndex].name = validationRules.requiredField(e.target.value)
        _formErrorObject[activeStageName].steps[selectedTaskIndex].isValid =
            _formErrorObject[activeStageName].steps[selectedTaskIndex].name.isValid
        setFormDataErrorObj(_formErrorObject)
        setFormData(_formData)
    }

    const handleDescriptionChange = (e: any): void => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].description = e.target.value
        setFormData(_formData)
    }

    const handleTriggerIfParentStageFailChange = (): void => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].triggerIfParentStageFail =
            !_formData[activeStageName].steps[selectedTaskIndex].triggerIfParentStageFail
        setFormData(_formData)
    }

    const handleTaskScriptTypeChange = (ev: any): void => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.scriptType = ev.target.value
        setFormData(_formData)
    }

    const renderTaskNameError = (): string => {
        if (
            formDataErrorObj[activeStageName].steps[selectedTaskIndex]?.name &&
            !formDataErrorObj[activeStageName].steps[selectedTaskIndex]?.name.isValid
        ) {
            return formDataErrorObj[activeStageName].steps[selectedTaskIndex]?.name.message
        }
    }

    const getFormDataWithReplacedPluginVersion = (
        newPluginVersionData: PluginDataStoreType['pluginVersionStore'][0],
        pluginId: number,
        clonedPluginDataStore: typeof pluginDataStore,
    ): typeof formData => {
        const _formData = structuredClone(formData)

        const oldPluginInputVariables: VariableType[] =
            _formData[activeStageName].steps[selectedTaskIndex].pluginRefStepDetail.inputVariables || []

        const oldPluginInputVariablesMap = oldPluginInputVariables.reduce(
            (acc, inputVariable) => {
                acc[inputVariable.name] = inputVariable
                return acc
            },
            {} as Record<string, VariableType>,
        )

        // newPluginVersionData.inputVariables is never null since parsed through DTO and it is always an array
        // But formData steps inputVariables can be null

        // In inputVariables we are going to traverse, the inputVariables of newPluginVersion and
        // if in older one it is present we would keep its struct else we would remove it
        const newInputVariables = newPluginVersionData.inputVariables.map((inputVariable) => {
            const oldInputVariable = oldPluginInputVariablesMap[inputVariable.name]
            if (oldInputVariable) {
                return {
                    ...inputVariable,
                    value: oldInputVariable.value,
                    variableType: oldInputVariable.variableType,
                    refVariableStepIndex: oldInputVariable.refVariableStepIndex,
                    refVariableName: oldInputVariable.refVariableName,
                    refVariableStage: oldInputVariable.refVariableStage,
                    variableStepIndexInPlugin: oldInputVariable.variableStepIndexInPlugin,
                }
            }

            return inputVariable
        })

        _formData[activeStageName].steps[selectedTaskIndex].pluginRefStepDetail = {
            ..._formData[activeStageName].steps[selectedTaskIndex].pluginRefStepDetail,
            pluginId,
            inputVariables: newInputVariables,
            outputVariables: newPluginVersionData.outputVariables,
            conditionDetails: filterInvalidConditionDetails(
                _formData[activeStageName].steps[selectedTaskIndex].pluginRefStepDetail.conditionDetails,
                newInputVariables.length,
                newPluginVersionData.outputVariables.length,
            ),
        } as StepType['pluginRefStepDetail']

        calculateLastStepDetail(false, _formData, activeStageName)
        validateStage(BuildStageVariable.PreBuild, _formData, undefined, clonedPluginDataStore)
        validateStage(BuildStageVariable.PostBuild, _formData, undefined, clonedPluginDataStore)

        return _formData
    }

    const handlePluginVersionChange: PluginDetailHeaderProps['handlePluginVersionChange'] = async (pluginId) => {
        if (pluginDataStore.pluginVersionStore[pluginId]) {
            const newPluginVersionData = pluginDataStore.pluginVersionStore[pluginId]
            const _formData = getFormDataWithReplacedPluginVersion(newPluginVersionData, pluginId, pluginDataStore)
            setFormData(_formData)
            return
        }

        setIsLoadingPluginVersionDetails(true)
        try {
            const {
                pluginStore: { parentPluginStore, pluginVersionStore },
            } = await getPluginsDetail({
                appId: +appId,
                pluginIds: [pluginId],
            })
            const clonedPluginDataStore = getUpdatedPluginStore(pluginDataStore, parentPluginStore, pluginVersionStore)
            const newPluginVersionData = clonedPluginDataStore.pluginVersionStore[pluginId]
            const _formData = getFormDataWithReplacedPluginVersion(
                newPluginVersionData,
                pluginId,
                clonedPluginDataStore,
            )

            handlePluginDataStoreUpdate(clonedPluginDataStore)
            setFormData(_formData)
        } catch (error) {
            // Do nothing
        } finally {
            setIsLoadingPluginVersionDetails(false)
        }
    }

    if (isLoadingPluginVersionDetails) {
        return <Progressing pageLoader />
    }

    return (
        <>
            <PluginDetailHeader handlePluginVersionChange={handlePluginVersionChange} />

            <div className="p-20 dc__overflow-scroll">
                <div>
                    <div className="row-container mb-12">
                        <div className="fw-6 fs-13 lh-32 cn-7 dc__required-field">Task name</div>
                        <CustomInput
                            rootClassName="w-100 br-4 en-2 bw-1 pl-10 pr-10 pt-5-imp pb-5-imp"
                            data-testid="preBuild-task-name-textbox"
                            type="text"
                            onChange={(e) => handleNameChange(e)}
                            value={selectedStep.name}
                            name="task-name"
                            error={renderTaskNameError()}
                        />
                    </div>
                    <div className="row-container mb-12">
                        <div className="fw-6 fs-13 lh-32 cn-7 ">Description</div>
                        <CustomInput
                            rootClassName="w-100 br-4 en-2 bw-1 pl-10 pr-10 pt-5-imp pb-5-imp"
                            data-testid="preBuild-task-description-textbox"
                            type="text"
                            onChange={(e) => handleDescriptionChange(e)}
                            value={selectedStep.description}
                            placeholder="Enter task description"
                            name="task-description"
                        />
                    </div>

                    {!isCdPipeline && activeStageName === BuildStageVariable.PostBuild && (
                        <div className="row-container mb-12">
                            <div className="fw-6 fs-13 lh-32 cn-7 ">Trigger even if build fails</div>
                            <input
                                type="checkbox"
                                className="cursor icon-dim-16"
                                checked={selectedStep.triggerIfParentStageFail}
                                onChange={handleTriggerIfParentStageFailChange}
                            />
                        </div>
                    )}

                    {selectedStep.stepType === PluginType.INLINE && (
                        <div className="row-container mb-12">
                            <div className="fw-6 fs-13 lh-32 cn-7 ">Task type</div>
                            <RadioGroup
                                className="configuration-container justify-start"
                                disabled={false}
                                initialTab={
                                    formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable]
                                        .scriptType
                                }
                                name="task-type"
                                onChange={handleTaskScriptTypeChange}
                            >
                                <RadioGroup.Radio
                                    className="left-radius"
                                    value={ScriptType.SHELL}
                                    dataTestId="custom-script-task-name-shell"
                                >
                                    Shell
                                </RadioGroup.Radio>
                                <RadioGroup.Radio
                                    className="right-radius dc__no-left-border"
                                    value={ScriptType.CONTAINERIMAGE}
                                    dataTestId="custom-script-task-name-container-image"
                                >
                                    Container Image
                                </RadioGroup.Radio>
                            </RadioGroup>
                        </div>
                    )}
                </div>
                <hr />
                {selectedStep.stepType === PluginType.INLINE ? (
                    <VariableDataTable key={selectedTaskIndex} type={PluginVariableType.INPUT} isCustomTask />
                ) : (
                    <VariableContainer type={PluginVariableType.INPUT} />
                )}
                <hr />
                {selectedStep[currentStepTypeVariable]?.inputVariables?.length > 0 && (
                    <>
                        <ConditionContainer type={ConditionContainerType.TRIGGER_SKIP} />
                        <hr />
                    </>
                )}
                {selectedStep.stepType === PluginType.INLINE ? (
                    <>
                        <TaskTypeDetailComponent />
                        {formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].scriptType !==
                            ScriptType.CONTAINERIMAGE && (
                            <VariableDataTable key={selectedTaskIndex} type={PluginVariableType.OUTPUT} isCustomTask />
                        )}
                    </>
                ) : (
                    <VariableContainer type={PluginVariableType.OUTPUT} />
                )}
                {selectedStep[currentStepTypeVariable]?.outputVariables?.length > 0 &&
                    (selectedStep.stepType !== PluginType.INLINE ||
                        formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].scriptType !==
                            ScriptType.CONTAINERIMAGE) && (
                        <>
                            <hr />
                            <ConditionContainer type={ConditionContainerType.PASS_FAILURE} />
                            <hr />
                        </>
                    )}
            </div>
        </>
    )
}
