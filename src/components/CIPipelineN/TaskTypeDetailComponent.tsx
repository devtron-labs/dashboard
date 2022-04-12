import React, { useState, useContext } from 'react'
import CodeEditor from '../CodeEditor/CodeEditor'
import { RadioGroup, RadioGroupItem } from '../common/formFields/RadioGroup'
import { ciPipelineContext } from './CIPipeline'

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

export function TaskTypeDetailComponent({ taskScriptType }: { taskScriptType: string }) {
    const { formData, setFormData, selectedTaskIndex, activeStageName } = useContext(ciPipelineContext)
    const [storeArtifact, setStoreArtifact] = useState<string>('')
    const [script, setScript] = useState<string>('')
    const [mountCodeToContainer, setMountCodeToContainer] = useState<boolean>(false)
    const [mountDirectoryFromHost, setMountDirectoryFromHost] = useState<boolean>(false)
    const [containerPath, setContainerPath] = useState<string>('')
    const [imagePullSecret, setImagePullSecret] = useState<string>('')

    const handleStoreArtifact = (ev) => {
        setStoreArtifact(ev.target.value)
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.mountPath = ev.target.value
        setFormData(_formData)
    }

    const handleContainer = (e: any, key: 'containerImagePath' | 'imagePullSecret'): void => {
        if (key === 'containerImagePath') {
            setContainerPath(e.target.value)
        }
        if (key === 'imagePullSecret') {
            setImagePullSecret(e.target.value)
        }
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[key] = e.target.value
        setFormData(_formData)
    }

    const handleChange = (
        event,
        stageId: number,
        stageType: 'beforeDockerBuildScripts' | 'afterDockerBuildScripts',
        key: 'script',
    ) => {
        let stages = formData[stageType]
        // stages[script][selectedTaskIndex] = event.target.value;
        // setFormData({
        //     ...formData,
        //     [stageType]: stages
        // } );
    }

    const handleMountChange = (e, key: 'mountCodeToContainer' | 'mountDirectoryFromHost') => {
        const _formData = { ...formData }
        console.log(e.target.value)
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
                                    handleChange(
                                        { target: { value } },
                                        formData[activeStageName].id,
                                        'beforeDockerBuildScripts',
                                        'script',
                                    )
                                }
                                inline
                                height={300}
                            ></CodeEditor>
                        </div>
                    </div>
                    <hr />
                    <div className="row-container mb-10">
                        <label className="fw-6 fs-13 cn-7 label-width">Output directory path</label>{' '}
                        <input
                            className="w-100 bcn-1 br-4 en-2 bw-1 pl-10 pr-10 pt-6 pb-6"
                            autoComplete="off"
                            placeholder="Enter directory path"
                            type="text"
                            value={storeArtifact}
                            onChange={handleStoreArtifact}
                        />
                    </div>
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
                    <div className="row-container mb-10">
                        <label className="fw-6 fs-13 cn-7 label-width">Port mapping</label>{' '}
                        <div className="custom-input__port-map">
                            <input
                                style={{ width: '80% !important' }}
                                className="w-100 bcn-1 br-4 en-2 bw-1 pl-10 pr-10 pt-6 pb-6"
                                autoComplete="off"
                                placeholder="Port"
                                type="text"
                                onChange={(e) => handlePort(e, PortMap.PORTONLOCAL)}
                                value={
                                    formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.portMap[0][
                                        PortMap.PORTONLOCAL
                                    ]
                                }
                            />
                            <div className="flex">:</div>
                            <input
                                style={{ width: '80% !important' }}
                                className="w-100 bcn-1 br-4 en-2 bw-1 pl-10 pr-10 pt-6 pb-6"
                                autoComplete="off"
                                placeholder="Port"
                                type="text"
                                onChange={(e) => handlePort(e, PortMap.PORTONCONTAINER)}
                                value={
                                    formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.portMap[0][
                                        PortMap.PORTONCONTAINER
                                    ]
                                }
                            />
                        </div>
                    </div>
                    <div className="row-container mb-10">
                        <label className="fw-6 fs-13 cn-7 label-width">Mount code to container</label>{' '}
                        <RadioGroup
                            className="no-border"
                            value={
                                formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.mountCodeToContainer
                            }
                            disabled={false}
                            name="task-type"
                            onChange={(event) => {
                                handleMountChange(event.target.value, 'mountCodeToContainer')
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
                            name="task-type"
                            onChange={(event) => {
                                handleMountChange(event.target.value, 'mountDirectoryFromHost')
                            }}
                        >
                            <RadioGroupItem value={MountPath.FALSE}> {MountPath.FALSE} </RadioGroupItem>
                            <RadioGroupItem value={MountPath.TRUE}> {MountPath.TRUE} </RadioGroupItem>
                        </RadioGroup>
                    </div>
                    <div className="row-container mb-10">
                        <label className="fw-6 fs-13 cn-7 label-width">Output directory path</label>{' '}
                        <input
                            className="w-100 bcn-1 br-4 en-2 bw-1 pl-10 pr-10 pt-6 pb-6"
                            autoComplete="off"
                            placeholder="Enter directory path"
                            type="text"
                            value={formData[activeStageName].steps[selectedTaskIndex].outputDirectoryPath}
                            onChange={handleStoreArtifact}
                        />
                    </div>
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
