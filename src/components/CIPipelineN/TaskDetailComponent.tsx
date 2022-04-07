import React, { useState, useEffect } from 'react'
import { ConfigurationType, ViewType } from '../../config'
import { RadioGroup, showError } from '../common'
import { ConditionContainerType, FormType, PluginType, PluginVariableType, ScriptType } from '../ciPipeline/types'
import { VariableContainer } from './VariableContainer'
import { ConditionContainer } from './ConditionContainer'
import { getPluginDetail } from '../ciPipeline/ciPipeline.service'
import { ServerErrors } from '../../modals/commonTypes'
import { YAMLScriptComponent } from './YAMLScriptComponent'
import YAML from 'yaml'
import CustomInputOutputVariables from './CustomInputOutputVariables'
import { TaskTypeDetailComponent } from './TaskTypeDetailComponent'

export function TaskDetailComponent({
    setPageState,
    selectedTaskIndex,
    formData,
    setFormData,
    activeStageName,
}: {
    setPageState: React.Dispatch<React.SetStateAction<string>>
    selectedTaskIndex: number
    formData: FormType
    setFormData: React.Dispatch<React.SetStateAction<FormType>>
    activeStageName: string
}) {
    const [configurationType, setConfigurationType] = useState<string>('GUI')
    const [taskScriptType, setTaskScriptType] = useState<string>(
        formData.preBuildStage.steps[selectedTaskIndex].inlineStepDetail
            ? formData.preBuildStage.steps[selectedTaskIndex].inlineStepDetail.scriptType
            : '',
    )
    const [editorValue, setEditorValue] = useState<string>('')
    const currentStepTypeVariable =
        formData[activeStageName].steps[selectedTaskIndex].stepType === PluginType.INLINE
            ? 'inlineStepDetail'
            : 'pluginRefStepDetail'
    useEffect(() => {
        if (formData[activeStageName].steps[selectedTaskIndex].stepType === PluginType.PLUGIN_REF) {
            setPageState(ViewType.LOADING)
            getPluginDetail(formData[activeStageName].steps[selectedTaskIndex].pluginRefStepDetail.pluginId)
                .then((response) => {
                    setPageState(ViewType.FORM)
                    processPluginData(response.result)
                })
                .catch((error: ServerErrors) => {
                    setPageState(ViewType.ERROR)
                    showError(error)
                })
        }
    }, [])

    const processPluginData = (pluginData) => {
        const _form = { ...formData }
        if (!_form[activeStageName].steps[selectedTaskIndex].pluginRefStepDetail.outputVariables) {
            _form[activeStageName].steps[selectedTaskIndex].pluginRefStepDetail.outputVariables =
                pluginData.outputVariables
        }
        if (!_form[activeStageName].steps[selectedTaskIndex].pluginRefStepDetail.inputVariables) {
            _form[activeStageName].steps[selectedTaskIndex].pluginRefStepDetail.inputVariables =
                pluginData.inputVariables
        }
        setFormData(_form)
    }
    const handleNameChange = (e: any): void => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].name = e.target.value
        setFormData(_formData)
    }
    const handleDescriptionChange = (e: any): void => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].description = e.target.value
        setFormData(_formData)
    }

    const handleEditorValueChange = (editorValue: string): void => {
        setEditorValue(editorValue)
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex] = YAML.parse(editorValue)
        setFormData(_formData)
    }

    const handleConfigurationChange = (ev: any): void => {
        setConfigurationType(ev.target.value)
        if (ev.target.value === ConfigurationType.YAML) {
            setEditorValue(YAML.stringify(formData[activeStageName].steps[selectedTaskIndex]))
        }
    }

    const handleTaskScriptTypeChange = (ev: any): void => {
        setTaskScriptType(ev.target.value)
        const _formData = { ...formData }
        _formData.preBuildStage.steps[selectedTaskIndex].inlineStepDetail.scriptType = ev.target.value
        setFormData(_formData)
    }

    return (
        <div>
            <div>
                <div className="row-container mb-10">
                    <label className="fw-6 fs-13 cn-7 label-width">Task name*</label>{' '}
                    <input
                        className="w-100"
                        type="text"
                        onChange={(e) => handleNameChange(e)}
                        value={formData[activeStageName].steps[selectedTaskIndex].name}
                    />
                </div>
                <div className="row-container mb-10">
                    <label className="fw-6 fs-13 cn-7 label-width">Description</label>{' '}
                    <input
                        className="w-100"
                        type="text"
                        onChange={(e) => handleDescriptionChange(e)}
                        value={formData[activeStageName].steps[selectedTaskIndex].description}
                        placeholder="Enter task description"
                    />
                </div>
                <div className="row-container mb-10">
                    <label className="fw-6 fs-13 cn-7 label-width">Configure task using</label>
                    <RadioGroup
                        className="configuration-container justify-start"
                        disabled={false}
                        initialTab={configurationType}
                        name="configuration-type"
                        onChange={handleConfigurationChange}
                    >
                        <RadioGroup.Radio className="left-radius" value={ConfigurationType.GUI}>
                            {ConfigurationType.GUI}
                        </RadioGroup.Radio>
                        <RadioGroup.Radio className="right-radius" value={ConfigurationType.YAML}>
                            {ConfigurationType.YAML}
                        </RadioGroup.Radio>
                    </RadioGroup>
                </div>

                {formData[activeStageName].steps[selectedTaskIndex].stepType === PluginType.INLINE && (
                    <div className="row-container mb-10">
                        <label className="fw-6 fs-13 cn-7 label-width">Task type</label>
                        <RadioGroup
                            className="configuration-container justify-start"
                            disabled={false}
                            initialTab={taskScriptType}
                            name="task-type"
                            onChange={handleTaskScriptTypeChange}
                        >
                            <RadioGroup.Radio className="left-radius" value={ScriptType.SHELL}>
                                {ScriptType.SHELL}
                            </RadioGroup.Radio>
                            <RadioGroup.Radio className="right-radius" value={ScriptType.DOCKERFILE}>
                                {ScriptType.DOCKERFILE}
                            </RadioGroup.Radio>
                        </RadioGroup>
                    </div>
                )}
            </div>
            {configurationType === ConfigurationType.GUI ? (
                <>
                    <hr />
                    {formData[activeStageName].steps[selectedTaskIndex].stepType === PluginType.INLINE ? (
                        <CustomInputOutputVariables
                            type={PluginVariableType.INPUT}
                            selectedTaskIndex={selectedTaskIndex}
                            formData={formData}
                            setFormData={setFormData}
                        />
                    ) : (
                        <VariableContainer
                            type={PluginVariableType.INPUT}
                            selectedTaskIndex={selectedTaskIndex}
                            formData={formData}
                            setFormData={setFormData}
                            activeStageName={activeStageName}
                        />
                    )}{' '}
                    <hr />
                    {formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable]?.inputVariables
                        ?.length > 0 && (
                        <>
                            <ConditionContainer
                                type={ConditionContainerType.TRIGGER_SKIP}
                                selectedTaskIndex={selectedTaskIndex}
                                formData={formData}
                                setFormData={setFormData}
                                activeStageName={activeStageName}
                            />
                            <hr />
                        </>
                    )}
                    {formData[activeStageName].steps[selectedTaskIndex].stepType === PluginType.INLINE && (
                        <TaskTypeDetailComponent
                            selectedTaskIndex={selectedTaskIndex}
                            formData={formData}
                            setFormData={setFormData}
                            activeStageName={activeStageName}
                            taskScriptType={taskScriptType}
                        />
                    )}
                    {formData[activeStageName].steps[selectedTaskIndex].stepType === PluginType.INLINE ? (
                        <CustomInputOutputVariables
                            type={PluginVariableType.OUTPUT}
                            selectedTaskIndex={selectedTaskIndex}
                            formData={formData}
                            setFormData={setFormData}
                        />
                    ) : (
                        <VariableContainer
                            type={PluginVariableType.OUTPUT}
                            selectedTaskIndex={selectedTaskIndex}
                            formData={formData}
                            setFormData={setFormData}
                            activeStageName={activeStageName}
                        />
                    )}
                    <hr />
                    {formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable]?.outputVariables
                        ?.length > 0 && (
                        <>
                            {' '}
                            <ConditionContainer
                                type={ConditionContainerType.PASS_FAILURE}
                                selectedTaskIndex={selectedTaskIndex}
                                formData={formData}
                                setFormData={setFormData}
                                activeStageName={activeStageName}
                            />
                            <hr />
                        </>
                    )}
                </>
            ) : (
                <YAMLScriptComponent
                    editorValue={editorValue}
                    handleEditorValueChange={handleEditorValueChange}
                    height="calc(100vh - 320px)"
                />
            )}
        </div>
    )
}
