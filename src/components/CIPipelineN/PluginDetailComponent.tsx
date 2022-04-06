import React, { useState, useEffect } from 'react'
import { ConfigurationType, ViewType } from '../../config'
import { RadioGroup, showError } from '../common'
import { ConditionContainerType, FormType, PluginVariableType } from '../ciPipeline/types'
import { VariableContainer } from './VariableContainer'
import { ConditionContainer } from './ConditionContainer'
import { getPluginDetail } from '../ciPipeline/ciPipeline.service'
import { ServerErrors } from '../../modals/commonTypes'
import { YAMLScriptComponent } from './YAMLScriptComponent'
import YAML from 'yaml'

export function PluginDetailComponent({
    setPageState,
    selectedTaskIndex,
    formData,
    setFormData,
}: {
    setPageState: React.Dispatch<React.SetStateAction<string>>
    selectedTaskIndex: number
    formData: FormType
    setFormData: React.Dispatch<React.SetStateAction<FormType>>
}) {
    const [configurationType, setConfigurationType] = useState<string>('GUI')
    const [editorValue, setEditorValue] = useState<string>('')

    useEffect(() => {
        setPageState(ViewType.LOADING)
        getPluginDetail(formData.preBuildStage.steps[selectedTaskIndex].pluginRefStepDetail.pluginId)
            .then((response) => {
                setPageState(ViewType.FORM)
                processPluginData(response.result)
            })
            .catch((error: ServerErrors) => {
                setPageState(ViewType.ERROR)
                showError(error)
            })
    }, [])

    const processPluginData = (pluginData) => {
        const _form = { ...formData }
        if (!_form.preBuildStage.steps[selectedTaskIndex].pluginRefStepDetail.outputVariables) {
            _form.preBuildStage.steps[selectedTaskIndex].pluginRefStepDetail.outputVariables =
                pluginData.outputVariables
        }
        if (!_form.preBuildStage.steps[selectedTaskIndex].pluginRefStepDetail.inputVariables) {
            _form.preBuildStage.steps[selectedTaskIndex].pluginRefStepDetail.inputVariables = pluginData.inputVariables
        }
        setFormData(_form)
    }
    const handleNameChange = (e: any): void => {
        const _formData = { ...formData }
        _formData.preBuildStage.steps[selectedTaskIndex].name = e.target.value
        setFormData(_formData)
    }

    const handleEditorValueChange = (editorValue: string): void => {
        setEditorValue(editorValue)
        const _formData = { ...formData }
        _formData.preBuildStage.steps[selectedTaskIndex] = YAML.parse(editorValue)
        setFormData(_formData)
    }

    const handleConfigurationChange = (ev: any): void => {
        setConfigurationType(ev.target.value)
        if (ev.target.value === ConfigurationType.YAML) {
            setEditorValue(YAML.stringify(formData.preBuildStage.steps[selectedTaskIndex]))
        }
    }

    return (
        <div className="p-20 ci-scrollable-content">
            <div>
                <div className="row-container mb-10">
                    <label className="fw-6 fs-13 cn-7 label-width">Task name*</label>{' '}
                    <input
                        className="w-100"
                        type="text"
                        onChange={(e) => handleNameChange(e)}
                        value={formData.preBuildStage.steps[selectedTaskIndex].name}
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
            </div>
            {configurationType === ConfigurationType.GUI ? (
                <>
                    <hr />
                    <VariableContainer
                        type={PluginVariableType.INPUT}
                        selectedTaskIndex={selectedTaskIndex}
                        formData={formData}
                        setFormData={setFormData}
                    />
                    <hr />
                    <ConditionContainer
                        type={ConditionContainerType.TRIGGER_SKIP}
                        selectedTaskIndex={selectedTaskIndex}
                        formData={formData}
                        setFormData={setFormData}
                    />
                    <hr />
                    <VariableContainer
                        type={PluginVariableType.OUTPUT}
                        selectedTaskIndex={selectedTaskIndex}
                        formData={formData}
                        setFormData={setFormData}
                    />
                    <hr />
                    <ConditionContainer
                        type={ConditionContainerType.PASS_FAILURE}
                        selectedTaskIndex={selectedTaskIndex}
                        formData={formData}
                        setFormData={setFormData}
                    />
                    <hr />
                </>
            ) : (
                <YAMLScriptComponent editorValue={editorValue} handleEditorValueChange={handleEditorValueChange} />
            )}
        </div>
    )
}
