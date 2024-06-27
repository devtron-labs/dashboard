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

import React, { useContext } from 'react'
import { BuildStageVariable } from '../../config'
import { ConditionContainerType, PluginVariableType } from '../ciPipeline/types'
import { VariableContainer } from './VariableContainer'
import { ConditionContainer } from './ConditionContainer'
import {
    CustomInput,
    PluginType,
    ScriptType,
    StyledRadioGroup as RadioGroup,
} from '@devtron-labs/devtron-fe-common-lib'
import CustomInputOutputVariables from './CustomInputOutputVariables'
import { TaskTypeDetailComponent } from './TaskTypeDetailComponent'
import { ValidationRules } from '../ciPipeline/validationRules'
import { pipelineContext } from '../workflowEditor/workflowEditor'

export const TaskDetailComponent = () => {
    const {
        formData,
        setFormData,
        selectedTaskIndex,
        activeStageName,
        formDataErrorObj,
        setFormDataErrorObj,
        isCdPipeline,
    } = useContext(pipelineContext)
    const validationRules = new ValidationRules()

    const currentStepTypeVariable =
        formData[activeStageName].steps[selectedTaskIndex].stepType === PluginType.INLINE
            ? 'inlineStepDetail'
            : 'pluginRefStepDetail'

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

    return (
        <div>
            <div>
                <div className="row-container mb-12">
                    <div className="fw-6 fs-13 lh-32 cn-7 dc__required-field">Task name</div>
                    <CustomInput
                        rootClassName="w-100 br-4 en-2 bw-1 pl-10 pr-10 pt-5-imp pb-5-imp"
                        data-testid="preBuild-task-name-textbox"
                        type="text"
                        onChange={(e) => handleNameChange(e)}
                        value={formData[activeStageName].steps[selectedTaskIndex].name}
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
                        value={formData[activeStageName].steps[selectedTaskIndex].description}
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
                            checked={formData[activeStageName].steps[selectedTaskIndex].triggerIfParentStageFail}
                            onChange={handleTriggerIfParentStageFailChange}
                        />
                    </div>
                )}

                {formData[activeStageName].steps[selectedTaskIndex].stepType === PluginType.INLINE && (
                    <div className="row-container mb-12">
                        <div className="fw-6 fs-13 lh-32 cn-7 ">Task type</div>
                        <RadioGroup
                            className="configuration-container justify-start"
                            disabled={false}
                            initialTab={
                                formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].scriptType
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
            {formData[activeStageName].steps[selectedTaskIndex].stepType === PluginType.INLINE ? (
                <CustomInputOutputVariables type={PluginVariableType.INPUT} />
            ) : (
                <VariableContainer type={PluginVariableType.INPUT} />
            )}{' '}
            <hr />
            {formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable]?.inputVariables?.length >
                0 && (
                <>
                    <ConditionContainer type={ConditionContainerType.TRIGGER_SKIP} />
                    <hr />
                </>
            )}
            {formData[activeStageName].steps[selectedTaskIndex].stepType === PluginType.INLINE ? (
                <>
                    <TaskTypeDetailComponent />
                    {formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].scriptType !==
                        ScriptType.CONTAINERIMAGE && <CustomInputOutputVariables type={PluginVariableType.OUTPUT} />}
                </>
            ) : (
                <VariableContainer type={PluginVariableType.OUTPUT} />
            )}
            {formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable]?.outputVariables?.length > 0 &&
                (formData[activeStageName].steps[selectedTaskIndex].stepType !== PluginType.INLINE ||
                    formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].scriptType !==
                        ScriptType.CONTAINERIMAGE) && (
                    <>
                        <hr />
                        <ConditionContainer type={ConditionContainerType.PASS_FAILURE} />
                        <hr />
                    </>
                )}
        </div>
    )
}
