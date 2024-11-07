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

import { useContext, useState, useEffect } from 'react'
import Tippy from '@tippyjs/react'
import {
    Checkbox,
    CHECKBOX_VALUE,
    RadioGroup,
    RadioGroupItem,
    MountPath,
    ScriptType,
    CustomInput,
    ClipboardButton,
    SelectPicker,
} from '@devtron-labs/devtron-fe-common-lib'
import { components } from 'react-select'
import { TaskFieldDescription, TaskFieldLabel } from '../ciPipeline/types'
import OutputDirectoryPath from './OutputDirectoryPath'
import MultiplePort from './MultiplsPort'
import TaskFieldTippyDescription from './TaskFieldTippyDescription'
import MountFromHost from './MountFromHost'
import CustomScript from './CustomScript'
import { ReactComponent as AlertTriangle } from '../../assets/icons/ic-alert-triangle.svg'
import { getCustomOptionSelectionStyle } from '../v2/common/ReactSelect.utils'
import { OptionType } from '../app/types'
import { ValidationRules } from '../ciPipeline/validationRules'
import { ReactComponent as Info } from '../../assets/icons/ic-info-filled.svg'
import { pipelineContext } from '../workflowEditor/workflowEditor'

export const TaskTypeDetailComponent = () => {
    const {
        selectedTaskIndex,
        formData,
        setFormData,
        activeStageName,
        formDataErrorObj,
        setFormDataErrorObj,
        validateTask,
    } = useContext(pipelineContext)
    const validationRules = new ValidationRules()

    const containerImageOptions = ['alpine:latest', 'python:latest', 'node:lts-slim'].map((containerImage) => ({
        label: containerImage,
        value: containerImage,
    }))

    const [selectedContainerImage, setSelectedContainerImage] = useState<OptionType>()

    useEffect(() => {
        setSelectedContainerImage({
            label: formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.containerImagePath || '',
            value: formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.containerImagePath || '',
        })
    }, [selectedTaskIndex])

    useEffect(() => {
        if (formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.scriptType === ScriptType.SHELL) {
            if (!formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.script) {
                const _formData = { ...formData }
                _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.script =
                    '#!/bin/sh \nset -eo pipefail \n#set -v  ## uncomment this to debug the script \n' // default value for shell
                setFormData(_formData)
            }
        } else if (
            JSON.stringify(formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.script) ===
            '"#!/bin/sh \\nset -eo pipefail \\n#set -v  ## uncomment this to debug the script \\n"'
        ) {
            const _formData = { ...formData }
            _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.script = '' // default value for container image
            setFormData(_formData)
        }
    }, [formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.scriptType])

    const handleContainer = (e: any, key: 'containerImagePath' | 'imagePullSecret'): void => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[key] = e.target.value
        setFormData(_formData)
    }

    const handleCustomChange = (e, key: 'script' | 'storeScriptAt' | 'mountCodeToContainerPath') => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[key] = e.target.value
        const _formErrorObject = { ...formDataErrorObj }
        _formErrorObject[activeStageName].steps[selectedTaskIndex].inlineStepDetail[key] =
            validationRules.requiredField(e.target.value)
        _formErrorObject[activeStageName].steps[selectedTaskIndex].inlineStepDetail[key].isValid =
            _formErrorObject[activeStageName].steps[selectedTaskIndex].inlineStepDetail[key].isValid
        setFormDataErrorObj(_formErrorObject)
        setFormData(_formData)
    }

    const handleMountChange = (e) => {
        const _formData = { ...formData }
        if (e.target.value === MountPath.TRUE) {
            _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[e.target.name] = true
            let _mountPathMap = _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.mountPathMap
            if (e.target.name === 'mountDirectoryFromHost' && (!_mountPathMap || _mountPathMap.length === 0)) {
                _mountPathMap = []
                _mountPathMap.push({
                    filePathOnDisk: null,
                    filePathOnContainer: null,
                })
                _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.mountPathMap = _mountPathMap
            }
            if (
                e.target.name === 'mountCodeToContainer' &&
                !formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.mountCodeToContainerPath
            ) {
                formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.mountCodeToContainerPath =
                    '/sourcecode'
            }
        } else {
            _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[e.target.name] = false
        }
        setFormData(_formData)
    }

    const handleCommandArgs = (e, key: TaskFieldLabel.COMMAND | TaskFieldLabel.ARGS) => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.commandArgsMap[0][key] =
            key === TaskFieldLabel.COMMAND ? e.target.value : e.target.value.replace(/\s+/g, '').split(',')
        setFormData(_formData)
    }

    const handleCustomScript = () => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.isMountCustomScript =
            !_formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.isMountCustomScript
        setFormData(_formData)
    }

    const renderShellScript = () => {
        return (
            <>
                <CustomScript handleScriptChange={(e) => handleCustomChange(e, 'script')} />
                <div className="w-100 bcn-1 pt-7 br-8 flexbox h-32 pl-4 cn-9 fs-12">
                    <Info className="path-info mt-2 mb-2 mr-8 ml-14 icon-dim-16" />
                    <span>
                        Your source code will be available at: <span className="fw-6">/devtroncd</span>
                    </span>
                </div>
                <hr />
                <OutputDirectoryPath />
            </>
        )
    }

    const Option = (_props) => {
        const { selectProps, data } = _props
        selectProps.styles.option = getCustomOptionSelectionStyle({ padding: '4px 10px' })
        if (data.description) {
            return (
                <Tippy className="variable-description" arrow={false} placement="left" content={data.description}>
                    <div className="flex left">
                        <components.Option {..._props}>{_props.children}</components.Option>
                    </div>
                </Tippy>
            )
        }
        return (
            <div className="flex left">
                <components.Option {..._props}>{_props.children}</components.Option>
            </div>
        )
    }

    const handleContainerImageSelector = (selectedValue: OptionType) => {
        setSelectedContainerImage(selectedValue)
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail['containerImagePath'] = selectedValue.label
        const _formErrorObject = { ...formDataErrorObj }
        validateTask(
            _formData[activeStageName].steps[selectedTaskIndex],
            _formErrorObject[activeStageName].steps[selectedTaskIndex],
        )
        setFormDataErrorObj(_formErrorObject)
        setFormData(_formData)
    }

    function handleCreatableBlur(e) {
        if (e.target.value) {
            setSelectedContainerImage({
                label: e.target.value,
                value: e.target.value,
            })
            const _formData = { ...formData }
            _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail['containerImagePath'] = e.target.value
            setFormData(_formData)
        }
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === 'Tab') {
            event.target.blur()
        }
    }

    const renderMenuListFooter = () => (
        <div className="cn-5 pl-12 pt-4 pb-4 dc__italic-font-style">
            Type to enter a custom value. Press Enter to accept.
        </div>
    )

    const renderContainerScript = () => {
        const errorObj = formDataErrorObj[activeStageName].steps[selectedTaskIndex].inlineStepDetail

        return (
            <>
                <div className="row-container mb-12">
                    <TaskFieldTippyDescription
                        taskField={TaskFieldLabel.CONTAINERIMAGEPATH}
                        contentDescription={TaskFieldDescription.CONTAINERIMAGEPATH}
                    />

                    <div className="dc__position-rel">
                        <SelectPicker
                            inputId="containerImage"
                            value={selectedContainerImage}
                            options={containerImageOptions}
                            placeholder="Select container image or input value"
                            onChange={handleContainerImageSelector}
                            classNamePrefix="select"
                            onBlur={handleCreatableBlur}
                            onKeyDown={handleKeyDown}
                            isCreatable
                            renderMenuListFooter={renderMenuListFooter}
                        />
                        {selectedContainerImage?.label && (
                            <div className="flex icon-dim-32 dc__position-abs dc__top-0 dc__right-20">
                                <ClipboardButton content={selectedContainerImage.label} />
                            </div>
                        )}
                        {errorObj?.containerImagePath && !errorObj.containerImagePath.isValid && (
                            <span className="flexbox cr-5 mt-4 fw-5 fs-11 flexbox">
                                <AlertTriangle className="icon-dim-14 mr-5 ml-5 mt-2" />
                                <span>{errorObj?.containerImagePath.message}</span>
                            </span>
                        )}
                        <div className="w-100 bcb-1 pt-6 br-4 flexbox h-32 cn-9 fs-12 mt-8">
                            <Info className="container-image-info mt-2 mb-2 mr-8 ml-14 icon-dim-16" />
                            <span>Devtron only supports container image which include /bin/sh executable</span>
                        </div>
                    </div>
                </div>
                <div className="row-container mb-12 fs-13 fw-6">
                    <div />
                    <Checkbox
                        isChecked={
                            formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.isMountCustomScript
                        }
                        onClick={(e) => {
                            e.stopPropagation()
                        }}
                        rootClassName="top"
                        value={CHECKBOX_VALUE.CHECKED}
                        onChange={(e) => handleCustomScript()}
                        id="mountCustomScriptCheck"
                    >
                        <Tippy
                            className="default-tt w-220"
                            arrow={false}
                            content={TaskFieldDescription.MOUNTCODESNIPPET}
                        >
                            <label className="pt-4" htmlFor="mountCustomScriptCheck">
                                {TaskFieldLabel.MOUNTCODESNIPPET}
                            </label>
                        </Tippy>
                    </Checkbox>
                </div>
                {formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.isMountCustomScript && (
                    <>
                        <CustomScript handleScriptChange={(e) => handleCustomChange(e, 'script')} />
                        <div className="row-container mb-12">
                            <TaskFieldTippyDescription
                                taskField={TaskFieldLabel.MOUNTCODEAT}
                                contentDescription={TaskFieldDescription.MOUNTCODEAT}
                            />
                            <div style={{ width: '80% !important' }}>
                                <CustomInput
                                    rootClassName="w-100 br-4 en-2 bw-1 pl-10 pr-10 pt-5-imp pb-5-imp"
                                    placeholder="Eg. /directory/filename"
                                    name="storeScriptAt"
                                    onChange={(e) => handleCustomChange(e, 'storeScriptAt')}
                                    value={
                                        formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail
                                            .storeScriptAt
                                    }
                                    error={
                                        errorObj?.storeScriptAt &&
                                        !errorObj.storeScriptAt.isValid &&
                                        errorObj?.storeScriptAt.message
                                    }
                                />
                            </div>
                        </div>
                    </>
                )}
                <div className="row-container mb-12">
                    <TaskFieldTippyDescription taskField="Command" contentDescription={TaskFieldDescription.COMMAND} />
                    <CustomInput
                        data-testid="custom-script-container-image-command-textbox"
                        rootClassName="w-100 br-4 en-2 bw-1 pl-10 pr-10 pt-5-imp pb-5-imp"
                        name="command"
                        placeholder="Eg. “echo”"
                        onChange={(e) => handleCommandArgs(e, TaskFieldLabel.COMMAND)}
                        value={
                            formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.commandArgsMap?.[0][
                                TaskFieldLabel.COMMAND
                            ]
                        }
                    />
                </div>
                <div className="row-container mb-12">
                    <TaskFieldTippyDescription taskField="Args" contentDescription={TaskFieldDescription.ARGS} />
                    <CustomInput
                        name="args"
                        data-testid="custom-script-container-image-args-textbox"
                        rootClassName="w-100 br-4 en-2 bw-1 pl-10 pr-10 pt-5-imp pb-5-imp"
                        placeholder='Eg. "HOSTNAME", "KUBERNETES_PORT"'
                        onChange={(e) => handleCommandArgs(e, TaskFieldLabel.ARGS)}
                        value={
                            formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.commandArgsMap?.[0][
                                TaskFieldLabel.ARGS
                            ]
                        }
                    />
                </div>
                <MultiplePort />
                <div className="row-container mb-12">
                    <TaskFieldTippyDescription
                        taskField={TaskFieldLabel.MOUNTCODETOCONTAINER}
                        contentDescription={TaskFieldDescription.MOUNTCODETOCONTAINER}
                    />
                    <RadioGroup
                        className="no-border"
                        value={
                            formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.mountCodeToContainer
                                ? MountPath.TRUE
                                : MountPath.FALSE
                        }
                        disabled={false}
                        name="mountCodeToContainer"
                        onChange={(event) => {
                            handleMountChange(event)
                        }}
                    >
                        <RadioGroupItem dataTestId="build-stage-script-mount-container-false" value={MountPath.FALSE}>
                            {MountPath.FALSE}
                        </RadioGroupItem>
                        <RadioGroupItem dataTestId="build-stage-script-mount-container-true" value={MountPath.TRUE}>
                            {MountPath.TRUE}
                        </RadioGroupItem>
                    </RadioGroup>
                </div>
                {formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.mountCodeToContainer && (
                    <div className="mb-12">
                        <div className="row-container">
                            <div className="fw-6 fs-13 lh-32 cn-7 " />
                            <CustomInput
                                name="mountCodeToContainerPath"
                                rootClassName="w-100 br-4 en-2 bw-1 pl-10 pr-10 pt-5 pb-5"
                                data-testid="script-mount-container-textbox"
                                placeholder="Eg file/folder"
                                onChange={(e) => handleCustomChange(e, 'mountCodeToContainerPath')}
                                value={
                                    formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail
                                        .mountCodeToContainerPath
                                }
                                error={
                                    errorObj['mountCodeToContainerPath'] &&
                                    !errorObj['mountCodeToContainerPath'].isValid &&
                                    errorObj['mountCodeToContainerPath'].message
                                }
                            />
                        </div>
                    </div>
                )}
                <div className="row-container mb-12">
                    <TaskFieldTippyDescription
                        taskField={TaskFieldLabel.MOUNTDIRECTORYFROMHOST}
                        contentDescription={TaskFieldDescription.MOUNTDIRECTORYFROMHOST}
                    />
                    <RadioGroup
                        className="no-border"
                        value={
                            formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.mountDirectoryFromHost
                                ? MountPath.TRUE
                                : MountPath.FALSE
                        }
                        disabled={false}
                        name="mountDirectoryFromHost"
                        onChange={(event) => {
                            handleMountChange(event)
                        }}
                    >
                        <RadioGroupItem dataTestId="build-stage-script-mount-host-false" value={MountPath.FALSE}>
                            {MountPath.FALSE}
                        </RadioGroupItem>
                        <RadioGroupItem dataTestId="build-stage-script-mount-host-true" value={MountPath.TRUE}>
                            {MountPath.TRUE}
                        </RadioGroupItem>
                    </RadioGroup>
                </div>
                {formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.mountDirectoryFromHost && (
                    <MountFromHost />
                )}
                <OutputDirectoryPath />
            </>
        )
    }

    if (formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.scriptType === ScriptType.SHELL) {
        return renderShellScript()
    }
    if (formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.scriptType === ScriptType.CONTAINERIMAGE) {
        return renderContainerScript()
    }
    return <></>
}
