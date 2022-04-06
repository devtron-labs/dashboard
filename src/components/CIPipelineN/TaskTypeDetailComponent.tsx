import React, { useState } from 'react'
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
    const renderShellScript = () => {
        if (taskScriptType === ScriptType.SHELL) {
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
