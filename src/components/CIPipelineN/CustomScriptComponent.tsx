import React, { useState } from 'react'
import { ReactComponent as PreBuild } from '../../assets/icons/ic-cd-stage.svg'
import { not, RadioGroup } from '../common'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import CodeEditor from '../CodeEditor/CodeEditor'
import { ConfigurationType } from '../../config'
import { PluginVariableType, ConditionContainerType, FormType } from '../ciPipeline/types'
import CustomInputOutputVariables from './CustomInputOutputVariables'

export enum ScriptType {
    SHELL = 'SHELL',
    DOCKERFILE = 'DOCKERFILE',
    CONTAINERIMAGE = 'CONTAINERIMAGE',
}

export function CustomScriptComponent({
    setPageState,
    selectedTaskIndex,
    formData,
    setFormData,
    activeStageName,
}: {
    setPageState?: React.Dispatch<React.SetStateAction<string>>
    selectedTaskIndex?: number
    formData: FormType
    setFormData: React.Dispatch<React.SetStateAction<FormType>>
    activeStageName: string
}) {
    const [yamlMode, toggleYamlMode] = useState(false)
    const [configurationType, setConfigurationType] = useState<string>('GUI')
    const [scriptType, setScriptType] = useState<string>(ScriptType.SHELL)

    function changeScriptType(e) {
        if (e.target.value === ScriptType.SHELL) {
            setScriptType(ScriptType.SHELL)
        } else if (e.target.value === ScriptType.DOCKERFILE) {
            setScriptType(ScriptType.DOCKERFILE)
        } else if (e.target.value === ScriptType.CONTAINERIMAGE) {
            setScriptType(ScriptType.CONTAINERIMAGE)
        }
    }

    const renderShellScript = () => {
        if (scriptType === ScriptType.SHELL) {
            return (
                <>
                    <div className="row-container mb-10">
                        <label className="fw-6 fs-13 cn-7 label-width">Script to execute*</label>{' '}
                        <div className="script-container">
                            <CodeEditor mode="shell" shebang="#!/bin/sh" inline height={300}></CodeEditor>
                        </div>
                    </div>
                    <hr />
                    <div className="row-container mb-10">
                        <label className="fw-6 fs-13 cn-7 label-width">Store artifacts at </label>{' '}
                        <input
                            style={{ width: '80% !important' }}
                            className="form__input bcn-1 w-80"
                            autoComplete="off"
                            placeholder="Enter directory path"
                            type="text"
                        />
                    </div>
                </>
            )
        }
    }

    const renderContainerScript = () => {
        if (scriptType === ScriptType.CONTAINERIMAGE) {
            return (
                <>
                    <div className="row-container mb-10">
                        <label className="fw-6 fs-13 cn-7 label-width">Container image path *</label>{' '}
                        <input
                            style={{ width: '80% !important' }}
                            className="form__input bcn-1 w-80"
                            autoComplete="off"
                            placeholder="Enter image path *"
                            type="text"
                        />
                    </div>
                    <div className="row-container mb-10">
                        <label className="fw-6 fs-13 cn-7 label-width">Image pull secret</label>{' '}
                        <input
                            style={{ width: '80% !important' }}
                            className="form__input bcn-1 w-80"
                            autoComplete="off"
                            placeholder="Select container registry or enter secret path"
                            type="text"
                        />
                    </div>
                    <div className="row-container mb-10">
                        <label className="fw-6 fs-13 cn-7 label-width">Command</label>{' '}
                        <input
                            style={{ width: '80% !important' }}
                            className="form__input bcn-1 w-80"
                            autoComplete="off"
                            placeholder="Select container registry or enter secret path"
                            type="text"
                        />
                    </div>
                    <div className="row-container mb-10">
                        <label className="fw-6 fs-13 cn-7 label-width">Args</label>{' '}
                        <input
                            style={{ width: '80% !important' }}
                            className="form__input bcn-1 w-80"
                            autoComplete="off"
                            placeholder="Select container registry or enter secret path"
                            type="text"
                        />
                    </div>
                    <div className="row-container mb-10">
                        <label className="fw-6 fs-13 cn-7 label-width">Port mapping</label>{' '}
                        <input
                            style={{ width: '80% !important' }}
                            className="form__input bcn-1 w-80"
                            autoComplete="off"
                            placeholder="Select container registry or enter secret path"
                            type="text"
                        />
                    </div>
                </>
            )
        }
    }

    const renderDockerScript = () => {
        if (scriptType === ScriptType.DOCKERFILE) {
            return (
                <>
                    <div className="row-container mb-10">
                        <label className="fw-6 fs-13 cn-7 label-width">Docker path *</label>{' '}
                        <input
                            style={{ width: '80% !important' }}
                            className="form__input bcn-1 w-80"
                            autoComplete="off"
                            placeholder="Enter Mount script path"
                            type="text"
                        />
                    </div>
                    <div className="row-container mb-10">
                        <label className="fw-6 fs-13 cn-7 label-width">Mount script at *</label>{' '}
                        <input
                            style={{ width: '80% !important' }}
                            className="form__input bcn-1 w-80"
                            autoComplete="off"
                            placeholder="Enter Mount script path"
                            type="text"
                        />
                    </div>
                </>
            )
        }
    }

    return (
        <div className="p-20 ci-scrollable-content">
            <div>
                <div className="row-container mb-10">
                    <label className="fw-6 fs-13 cn-7 label-width">Task name*</label>{' '}
                    <input
                        style={{ width: '80% !important' }}
                        className="form__input bcn-1 w-80"
                        autoComplete="off"
                        placeholder="Task 1"
                        type="text"
                    />
                </div>
                <div className="row-container mb-10">
                    <label className="fw-6 fs-13 cn-7 label-width">Configure task using</label>
                    <RadioGroup
                        className="configuration-container justify-start"
                        disabled={false}
                        initialTab={configurationType}
                        name="configuration-type"
                        onChange={(event) => {
                            setConfigurationType(event.target.value)
                        }}
                    >
                        <RadioGroup.Radio className="left-radius" value={ConfigurationType.GUI}>
                            {ConfigurationType.GUI}
                        </RadioGroup.Radio>
                        <RadioGroup.Radio className="right-radius" value={ConfigurationType.YAML}>
                            {ConfigurationType.YAML}
                        </RadioGroup.Radio>
                    </RadioGroup>
                </div>
                <div className="row-container mb-10">
                    <label className="fw-6 fs-13 cn-7 label-width">Task type</label>
                    <RadioGroup
                        className="gui-yaml-switch"
                        name="yaml-mode"
                        initialTab={yamlMode ? 'yaml' : 'gui'}
                        disabled={false}
                        onChange={changeScriptType}
                    >
                        <RadioGroup.Radio value={ScriptType.SHELL}>{ScriptType.SHELL}</RadioGroup.Radio>
                        <RadioGroup.Radio value={ScriptType.CONTAINERIMAGE}>
                            {ScriptType.CONTAINERIMAGE}
                        </RadioGroup.Radio>
                        <RadioGroup.Radio value={ScriptType.CONTAINERIMAGE}>{ScriptType.CONTAINERIMAGE}</RadioGroup.Radio>
                    </RadioGroup>
                </div>
            </div>
            <hr />
            <CustomInputOutputVariables
                type={PluginVariableType.INPUT}
                selectedTaskIndex={selectedTaskIndex}
                formData={formData}
                setFormData={setFormData}
            />
            <hr />
            {renderShellScript()}
            {renderContainerScript()}
            {renderDockerScript()}
            <CustomInputOutputVariables
                type={PluginVariableType.OUTPUT}
                selectedTaskIndex={selectedTaskIndex}
                formData={formData}
                setFormData={setFormData}
            />
            <hr />
        </div>
    )
}
