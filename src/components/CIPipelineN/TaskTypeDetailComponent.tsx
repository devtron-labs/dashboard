import React, { useState } from 'react'
import CodeEditor from '../CodeEditor/CodeEditor'
import { FormType } from '../ciPipeline/types'
import { RadioGroup , RadioGroupItem } from '../common/formFields/RadioGroup'

export enum ScriptType {
    SHELL = 'SHELL',
    DOCKERFILE = 'DOCKERFILE',
    CONTAINERIMAGE = 'CONTAINERIMAGE',
}

enum MountPath {
    TRUE = 'Yes',
    FALSE = 'No',
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
    const [storeArtifact, setStoreArtifact] = useState<string>('')
    const [script, setScript] = useState<string>('')
    const [mountCodeToContainer, setMountCodeToContainer] = useState<boolean>(false)
    const [mountDirectoryFromHost, setMountDirectoryFromHost] = useState<boolean>(false)
    const  [containerPath, setContainerPath] = useState<string>('')
    const [imagePullSecret, setImagePullSecret] = useState<string>('')

    const handleStoreArtifact = (ev) => {
        setStoreArtifact(ev.target.value)
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.mountPath = ev.target.value
        setFormData(_formData)
    }

    const handleContainer = (e: any, key: 'containerImagePath' | 'imagePullSecret'): void => {
        if(key === 'containerImagePath') {setContainerPath(e.target.value)}
        if(key === 'imagePullSecret') {setImagePullSecret(e.target.value)}
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
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[key] = e.target.value
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
                            className="form__input bcn-1 w-80"
                            autoComplete="off"
                            placeholder="Enter image path *"
                            type="text"
                            onChange= {(e)=>handleContainer(e, 'containerImagePath')}
                            value={containerPath}
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
                            onChange= {(e)=>handleContainer(e, 'imagePullSecret')}
                            value={imagePullSecret}

                        />
                    </div>
                    <div className="row-container mb-10">
                        <label className="fw-6 fs-13 cn-7 label-width">Command</label>{' '}
                        <input
                            style={{ width: '80% !important' }}
                            className="form__input bcn-1 w-80"
                            autoComplete="off"
                            placeholder="Eg. “echo”, “printenv”"
                            type="text"
                        />
                    </div>
                    <div className="row-container mb-10">
                        <label className="fw-6 fs-13 cn-7 label-width">Args</label>{' '}
                        <input
                            style={{ width: '80% !important' }}
                            className="form__input bcn-1 w-80"
                            autoComplete="off"
                            placeholder='Eg. "HOSTNAME", "KUBERNETES_PORT"'
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
                    <div className="row-container mb-10">
                        <label className="fw-6 fs-13 cn-7 label-width">Mount code to container</label>{' '}
                        
                        <RadioGroup
                            className="no-border"
                            value={MountPath.FALSE}
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
                            value={MountPath.FALSE}
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
                            value={storeArtifact}
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
