import React, { useState } from 'react'
import CodeEditor from '../CodeEditor/CodeEditor'
import { FormType, PluginVariableType } from '../ciPipeline/types'
import { RadioGroup, RadioGroupItem } from '../common/formFields/RadioGroup'
import OutputDirectoryPath from './OutputDirectoryPath'
import YAML from 'yaml'
import MultiplePort from './MultiplsPort'

export enum ScriptType {
    SHELL = 'SHELL',
    DOCKERFILE = 'DOCKERFILE',
    CONTAINERIMAGE = 'CONTAINERIMAGE',
}

enum MountPath {
    TRUE = 'Yes',
    FALSE = 'No',
}
enum PortMap {
    PORTONLOCAL = 'portOnLocal',
    PORTONCONTAINER = 'portOnContainer',
}

export function TaskTypeDetailComponent({
    selectedTaskIndex,
    formData,
    setFormData,
    activeStageName,
    taskScriptType,
}: {
    selectedTaskIndex: number
    formData: FormType
    setFormData: React.Dispatch<React.SetStateAction<FormType>>
    activeStageName: string
    taskScriptType: string
}) {
    const handleContainer = (e: any, key: 'containerImagePath' | 'imagePullSecret'): void => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[key] = e.target.value
        setFormData(_formData)
    }

    const handleScriptChange = (event, stageId: number) => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.script = event.target.value
        setFormData(_formData)
    }

    const handleMountChange = (e, key: 'mountCodeToContainer' | 'mountDirectoryFromHost') => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[key] = e.target.value
        setFormData(_formData)
    }

    const handleCommandArgs = (e, key: 'command' | 'args') => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.commandArgsMap[0][key] =
            key === 'command' ? e.target.value : e.target.value.replace(/\s+/g, '').split(',')
        setFormData(_formData)
    }

    const handlePort = (e, key: 'portOnLocal' | 'portOnContainer') => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.portMap[0][key] = e.target.value
        setFormData(_formData)
    }

    const renderShellScript = () => {
        if (taskScriptType === ScriptType.SHELL) {
            return (
                <>
                    <div className="row-container mb-10">
                        <label className="fw-6 fs-13 cn-7 label-width">Script*</label>{' '}
                        <div className="script-container">
                            <CodeEditor
                                mode="shell"
                                shebang="#!/bin/sh"
                                onChange={(value) =>
                                    handleScriptChange({ target: { value } }, formData[activeStageName].id)
                                }
                                inline
                                height={300}
                                value = {formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.script}
                            ></CodeEditor>
                        </div>
                    </div>
                    <hr />
                    <OutputDirectoryPath
                        type={PluginVariableType.INPUT}
                        selectedTaskIndex={selectedTaskIndex}
                        formData={formData}
                        setFormData={setFormData}
                        activeStageName={activeStageName}
                    />
                </>
            )
        }
    }

    const renderContainerScript = () => {
        if (taskScriptType === ScriptType.CONTAINERIMAGE) {
            return (
                <>
                    <div className="row-container mb-10">
                        <label className="fw-6 fs-13 cn-7 label-width">Container image path *</label>{' '}
                        <input
                            style={{ width: '80% !important' }}
                            className="w-100 bcn-1 br-4 en-2 bw-1 pl-10 pr-10 pt-6 pb-6"
                            autoComplete="off"
                            placeholder="Enter image path *"
                            type="text"
                            onChange={(e) => handleContainer(e, 'containerImagePath')}
                            value={
                                formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.containerImagePath
                            }
                        />
                    </div>
                    <div className="row-container mb-10">
                        <label className="fw-6 fs-13 cn-7 label-width">Image pull secret</label>{' '}
                        <input
                            style={{ width: '80% !important' }}
                            className="w-100 w-100 bcn-1 br-4 en-2 bw-1 pl-10 pr-10 pt-6 pb-6"
                            autoComplete="off"
                            placeholder="Select container registry or enter secret path"
                            type="text"
                            onChange={(e) => handleContainer(e, 'imagePullSecret')}
                            value={formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.imagePullSecret}
                        />
                    </div>
                    <div className="row-container mb-10">
                        <label className="fw-6 fs-13 cn-7 label-width">Command</label>{' '}
                        <input
                            style={{ width: '80% !important' }}
                            className="w-100 bcn-1 br-4 en-2 bw-1 pl-10 pr-10 pt-6 pb-6"
                            autoComplete="off"
                            placeholder="Eg. “echo”"
                            type="text"
                            onChange={(e) => handleCommandArgs(e, 'command')}
                            value={
                                formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.commandArgsMap[0][
                                    'command'
                                ]
                            }
                        />
                    </div>
                    <div className="row-container mb-10">
                        <label className="fw-6 fs-13 cn-7 label-width">Args</label>{' '}
                        <input
                            style={{ width: '80% !important' }}
                            className="w-100 bcn-1 br-4 en-2 bw-1 pl-10 pr-10 pt-6 pb-6"
                            autoComplete="off"
                            placeholder='Eg. "HOSTNAME", "KUBERNETES_PORT"'
                            type="text"
                            onChange={(e) => handleCommandArgs(e, 'args')}
                            value={
                                formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.commandArgsMap[0][
                                    'args'
                                ]
                            }
                        />
                    </div>
                    <MultiplePort
                        type={PluginVariableType.INPUT}
                        selectedTaskIndex={selectedTaskIndex}
                        formData={formData}
                        setFormData={setFormData}
                        activeStageName={activeStageName}
                    />
                    <div className="row-container mb-10">
                        <label className="fw-6 fs-13 cn-7 label-width">Mount code to container</label>{' '}
                        <RadioGroup
                            className="no-border"
                            value={
                                formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.mountCodeToContainer
                            }
                            disabled={false}
                            name="mountCodeToContainer"
                            onChange={(event) => {
                                handleMountChange(event, 'mountCodeToContainer')
                            }}
                        >
                            <RadioGroupItem value={MountPath.FALSE}> {MountPath.FALSE} </RadioGroupItem>
                            <RadioGroupItem value={MountPath.TRUE}> {MountPath.TRUE} </RadioGroupItem>
                        </RadioGroup>
                    </div>
                    <div className="row-container mb-10">
                        <label className="fw-6 fs-13 cn-7 label-width">Mount directory from host</label>{' '}
                        <RadioGroup
                            className="no-border"
                            value={
                                formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail
                                    .mountDirectoryFromHost
                            }
                            disabled={false}
                            name="mountDirectoryFromHost"
                            onChange={(event) => {
                                handleMountChange(event, 'mountDirectoryFromHost')
                            }}
                        >
                            <RadioGroupItem value={MountPath.FALSE}> {MountPath.FALSE} </RadioGroupItem>
                            <RadioGroupItem value={MountPath.TRUE}> {MountPath.TRUE} </RadioGroupItem>
                        </RadioGroup>
                    </div>
                    <OutputDirectoryPath
                        type={PluginVariableType.INPUT}
                        selectedTaskIndex={selectedTaskIndex}
                        formData={formData}
                        setFormData={setFormData}
                        activeStageName={activeStageName}
                    />
                </>
            )
        }
    }

    const renderDockerScript = () => {
        if (taskScriptType === ScriptType.DOCKERFILE) {
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
        <>
            {renderShellScript()}
            {renderContainerScript()}
            {renderDockerScript()}
        </>
    )
}
