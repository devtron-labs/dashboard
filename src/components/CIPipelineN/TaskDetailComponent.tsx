import React, { useState, useContext } from 'react'
import { ConfigurationType, BuildStageVariable } from '../../config'
import { RadioGroup } from '../common'
import { ConditionContainerType, PluginVariableType } from '../ciPipeline/types'
import { VariableContainer } from './VariableContainer'
import { ConditionContainer } from './ConditionContainer'
import { FormType, PluginType, ScriptType, FormErrorObjectType } from '@devtron-labs/devtron-fe-common-lib'
import { YAMLScriptComponent } from './YAMLScriptComponent'
import YAML from 'yaml'
import CustomInputOutputVariables from './CustomInputOutputVariables'
import { TaskTypeDetailComponent } from './TaskTypeDetailComponent'
import { ReactComponent as AlertTriangle } from '../../assets/icons/ic-alert-triangle.svg'
import { ValidationRules } from '../ciPipeline/validationRules'
import { pipelineContext } from '../workflowEditor/workflowEditor'

export function TaskDetailComponent() {
    const {
        formData,
        setFormData,
        selectedTaskIndex,
        activeStageName,
        formDataErrorObj,
        setFormDataErrorObj,
    }: {
        formData: FormType
        setFormData: React.Dispatch<React.SetStateAction<FormType>>
        selectedTaskIndex: number
        activeStageName: string
        formDataErrorObj: FormErrorObjectType
        setFormDataErrorObj: React.Dispatch<React.SetStateAction<FormErrorObjectType>>
    } = useContext(pipelineContext)
    const validationRules = new ValidationRules()
    const [configurationType, setConfigurationType] = useState<string>('GUI')
    const [editorValue, setEditorValue] = useState<string>('')

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

    const handleEditorValueChange = (editorValue: string): void => {
        try {
            setEditorValue(editorValue)
            const _formData = { ...formData }
            _formData[activeStageName].steps[selectedTaskIndex] = {
                ..._formData[activeStageName].steps[selectedTaskIndex],
                ...YAML.parse(editorValue),
            }
            setFormData(_formData)
        } catch (error) {}
    }

    const handleConfigurationChange = (ev: any): void => {
        setConfigurationType(ev.target.value)
        if (ev.target.value === ConfigurationType.YAML) {
            if (formData[activeStageName].steps[selectedTaskIndex].stepType === PluginType.INLINE) {
                setEditorValue(
                    YAML.stringify({
                        outputDirectoryPath: formData[activeStageName].steps[selectedTaskIndex].outputDirectoryPath,
                        inlineStepDetail: formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail,
                    }),
                )
            } else {
                setEditorValue(
                    YAML.stringify({
                        pluginRefStepDetail: formData[activeStageName].steps[selectedTaskIndex].pluginRefStepDetail,
                    }),
                )
            }
        }
    }

    const handleTaskScriptTypeChange = (ev: any): void => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.scriptType = ev.target.value
        setFormData(_formData)
    }

    return (
        <div>
            <div>
                <div className="row-container mb-12">
                    <div className="fw-6 fs-13 lh-32 cn-7 dc__required-field">Task name</div>
                    <div>
                        <input
                            className="w-100 br-4 en-2 bw-1 pl-10 pr-10 pt-5 pb-5"
                            data-testid="preBuild-task-name-textbox"
                            type="text"
                            onChange={(e) => handleNameChange(e)}
                            value={formData[activeStageName].steps[selectedTaskIndex].name}
                        />
                        {formDataErrorObj[activeStageName].steps[selectedTaskIndex]?.name &&
                            !formDataErrorObj[activeStageName].steps[selectedTaskIndex]?.name.isValid && (
                                <span className="flexbox cr-5 mt-4 fw-5 fs-11 flexbox">
                                    <AlertTriangle className="icon-dim-14 mr-5 ml-5 mt-2" />
                                    <span>
                                        {formDataErrorObj[activeStageName].steps[selectedTaskIndex]?.name.message}
                                    </span>
                                </span>
                            )}
                    </div>
                </div>
                <div className="row-container mb-12">
                    <div className="fw-6 fs-13 lh-32 cn-7 ">Description</div>{' '}
                    <input
                        className="w-100 br-4 en-2 bw-1 pl-10 pr-10 pt-5 pb-5"
                        data-testid="preBuild-task-description-textbox"
                        type="text"
                        onChange={(e) => handleDescriptionChange(e)}
                        value={formData[activeStageName].steps[selectedTaskIndex].description}
                        placeholder="Enter task description"
                    />
                </div>

                {activeStageName === BuildStageVariable.PostBuild && (
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
            {configurationType === ConfigurationType.GUI ? (
                <>
                    <hr />
                    {formData[activeStageName].steps[selectedTaskIndex].stepType === PluginType.INLINE ? (
                        <CustomInputOutputVariables type={PluginVariableType.INPUT} />
                    ) : (
                        <VariableContainer type={PluginVariableType.INPUT} />
                    )}{' '}
                    <hr />
                    {formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable]?.inputVariables
                        ?.length > 0 && (
                        <>
                            <ConditionContainer type={ConditionContainerType.TRIGGER_SKIP} />
                            <hr />
                        </>
                    )}
                    {formData[activeStageName].steps[selectedTaskIndex].stepType === PluginType.INLINE ? (
                        <>
                            <TaskTypeDetailComponent />
                            {formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].scriptType !==
                                ScriptType.CONTAINERIMAGE && (
                                <CustomInputOutputVariables type={PluginVariableType.OUTPUT} />
                            )}
                        </>
                    ) : (
                        <VariableContainer type={PluginVariableType.OUTPUT} />
                    )}
                    {formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable]?.outputVariables
                        ?.length > 0 &&
                        (formData[activeStageName].steps[selectedTaskIndex].stepType !== PluginType.INLINE ||
                            formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].scriptType !==
                                ScriptType.CONTAINERIMAGE) && (
                            <>
                                <hr />
                                <ConditionContainer type={ConditionContainerType.PASS_FAILURE} />
                                <hr />
                            </>
                        )}
                </>
            ) : (
                <YAMLScriptComponent
                    editorValue={editorValue}
                    handleEditorValueChange={handleEditorValueChange}
                    height="calc(100vh - 320px)"
                    showSample={true}
                />
            )}
        </div>
    )
}
