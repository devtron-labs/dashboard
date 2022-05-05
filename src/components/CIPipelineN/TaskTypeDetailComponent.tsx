import React, { useContext, useState } from 'react'
import {
    FormErrorObjectType,
    FormType,
    MountPath,
    ScriptType,
    TaskFieldDescription,
    TaskFieldLabel,
} from '../ciPipeline/types'
import { RadioGroup, RadioGroupItem } from '../common/formFields/RadioGroup'
import OutputDirectoryPath from './OutputDirectoryPath'
import MultiplePort from './MultiplsPort'
import { ciPipelineContext } from './CIPipeline'
import Tippy from '@tippyjs/react'
import TaskFieldTippyDescription from './TaskFieldTippyDescription'
import MountFromHost from './MountFromHost'
import { Checkbox, CHECKBOX_VALUE } from '../common'
import CustomScript from './CustomScript'
import { ReactComponent as AlertTriangle } from '../../assets/icons/ic-alert-triangle.svg'
import CreatableSelect from 'react-select/creatable'
import { components } from 'react-select'
import { getCustomOptionSelectionStyle } from '../v2/common/ReactSelect.utils'
import { OptionType } from '../app/types'
import { containerImageSelectStyles } from './ciPipeline.utils'
import { ValidationRules } from '../ciPipeline/validationRules'

export function TaskTypeDetailComponent() {
    const {
        selectedTaskIndex,
        formData,
        setFormData,
        activeStageName,
        formDataErrorObj,
        setFormDataErrorObj,
    }: {
        selectedTaskIndex: number
        formData: FormType
        setFormData: React.Dispatch<React.SetStateAction<FormType>>
        activeStageName: string
        formDataErrorObj: FormErrorObjectType
        setFormDataErrorObj: React.Dispatch<React.SetStateAction<FormErrorObjectType>>
    } = useContext(ciPipelineContext)
    const validationRules = new ValidationRules()

    const containerImageOptions = ['alpine:latest', 'python:latest', 'node:lts-slim'].map((containerImage) => ({
        label: containerImage,
        value: containerImage,
    }))

    const [selectedContainerImage, setSelectedContainerImage] = useState<OptionType>({
        label: formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.containerImagePath || '',
        value: formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.containerImagePath || '',
    })

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
                    'sourcecode'
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
        if (formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.scriptType === ScriptType.SHELL) {
            if (!formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.script) {
                const _formData = { ...formData }
                _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.script =
                    '#!/bin/sh \nset -eo pipefail \n#set -v  ## uncomment this to debug the script \n' //default value for shell
                setFormData(_formData)
            }
            return (
                <>
                    <CustomScript handleScriptChange={(e) => handleCustomChange(e, 'script')} />
                    <hr />
                    <OutputDirectoryPath />
                </>
            )
        }
    }

    function Option(_props) {
        const { selectProps, data } = _props
        selectProps.styles.option = getCustomOptionSelectionStyle({ direction: 'none', padding: '4px 10px' })
        if (data.description) {
            return (
                <Tippy className="variable-description" arrow={false} placement="left" content={data.description}>
                    <div className="flex left">
                        <components.Option {..._props}>{_props.children}</components.Option>
                    </div>
                </Tippy>
            )
        } else {
            return (
                <div className="flex left">
                    <components.Option {..._props}>{_props.children}</components.Option>
                </div>
            )
        }
    }

    const handleContainerImageSelector = (selectedValue: OptionType) => {
        setSelectedContainerImage(selectedValue)
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail['containerImagePath'] = selectedValue.label
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
        switch (event.key) {
            case 'Enter':
            case 'Tab':
                event.target.blur()
        }
    }

    const ValueContainer = (props) => {
        let value = props.getValue()[0]?.label
        return (
            <components.ValueContainer {...props}>
                <>
                    {!props.selectProps.menuIsOpen &&
                        (value ? `${value}` : <span className="cn-5">Select or enter image</span>)}
                    {React.cloneElement(props.children[1])}
                </>
            </components.ValueContainer>
        )
    }

    const renderContainerScript = () => {
        if (
            formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.scriptType === ScriptType.CONTAINERIMAGE
        ) {
            const errorObj = formDataErrorObj[activeStageName].steps[selectedTaskIndex].inlineStepDetail
            if (
                JSON.stringify(formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.script) ===
                '"#!/bin/sh \\nset -eo pipefail \\n#set -v  ## uncomment this to debug the script \\n"'
            ) {
                const _formData = { ...formData }
                _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.script = '' //default value for container image
                setFormData(_formData)
            }
            return (
                <>
                    <div className="row-container mb-12">
                        <TaskFieldTippyDescription
                            taskField={TaskFieldLabel.CONTAINERIMAGEPATH}
                            contentDescription={TaskFieldDescription.CONTAINERIMAGEPATH}
                        />
                        <div style={{ width: '80% !important' }}>
                            <CreatableSelect
                                tabIndex={1}
                                value={selectedContainerImage}
                                options={containerImageOptions}
                                placeholder="Select container image or input value"
                                onChange={handleContainerImageSelector}
                                styles={containerImageSelectStyles}
                                classNamePrefix="select"
                                components={{
                                    MenuList: (props) => {
                                        return (
                                            <components.MenuList {...props}>
                                                <div className="cn-5 pl-12 pt-4 pb-4" style={{ fontStyle: 'italic' }}>
                                                    Type to enter a custom value. Press Enter to accept.
                                                </div>
                                                {props.children}
                                            </components.MenuList>
                                        )
                                    },
                                    Option,
                                    IndicatorSeparator: null,
                                    ValueContainer,
                                }}
                                noOptionsMessage={(): string => {
                                    return 'No matching options'
                                }}
                                onBlur={handleCreatableBlur}
                                isValidNewOption={() => false}
                                onKeyDown={handleKeyDown}
                            />

                            {errorObj?.containerImagePath && !errorObj.containerImagePath.isValid && (
                                <span className="flexbox cr-5 mt-4 fw-5 fs-11 flexbox">
                                    <AlertTriangle className="icon-dim-14 mr-5 ml-5 mt-2" />
                                    <span>{errorObj?.containerImagePath.message}</span>
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="row-container mb-12 fs-13 fw-6">
                        <div></div>
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
                                    <input
                                        className="w-100 br-4 en-2 bw-1 pl-10 pr-10 pt-5 pb-5"
                                        autoComplete="off"
                                        placeholder="Eg. directory/filename"
                                        type="text"
                                        name="storeScriptAt"
                                        onChange={(e) => handleCustomChange(e, 'storeScriptAt')}
                                        value={
                                            formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail
                                                .storeScriptAt
                                        }
                                    />

                                    {errorObj?.storeScriptAt && !errorObj.storeScriptAt.isValid && (
                                        <span className="flexbox cr-5 mt-4 fw-5 fs-11 flexbox">
                                            <AlertTriangle className="icon-dim-14 mr-5 ml-5 mt-2" />
                                            <span>{errorObj?.storeScriptAt.message}</span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                    <div className="row-container mb-12">
                        <TaskFieldTippyDescription
                            taskField={TaskFieldLabel.COMMAND}
                            contentDescription={TaskFieldDescription.COMMAND}
                        />
                        <input
                            style={{ width: '80% !important' }}
                            className="w-100 br-4 en-2 bw-1 pl-10 pr-10 pt-5 pb-5"
                            autoComplete="off"
                            placeholder="Eg. “echo”"
                            type="text"
                            onChange={(e) => handleCommandArgs(e, TaskFieldLabel.COMMAND)}
                            value={
                                formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.commandArgsMap?.[0][
                                    TaskFieldLabel.COMMAND
                                ]
                            }
                        />
                    </div>
                    <div className="row-container mb-12">
                        <TaskFieldTippyDescription
                            taskField={TaskFieldLabel.ARGS}
                            contentDescription={TaskFieldDescription.ARGS}
                        />
                        <input
                            style={{ width: '80% !important' }}
                            className="w-100 br-4 en-2 bw-1 pl-10 pr-10 pt-5 pb-5"
                            autoComplete="off"
                            placeholder='Eg. "HOSTNAME", "KUBERNETES_PORT"'
                            type="text"
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
                            <RadioGroupItem value={MountPath.FALSE}> {MountPath.FALSE} </RadioGroupItem>
                            <RadioGroupItem value={MountPath.TRUE}> {MountPath.TRUE} </RadioGroupItem>
                        </RadioGroup>
                    </div>
                    {formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.mountCodeToContainer && (
                        <div className="mb-12">
                            <div className="row-container">
                                <div className="fw-6 fs-13 lh-32 cn-7 "></div>
                                <input
                                    style={{ width: '80% !important' }}
                                    className="w-100 br-4 en-2 bw-1 pl-10 pr-10 pt-5 pb-5"
                                    autoComplete="off"
                                    placeholder="Eg file/folder"
                                    type="text"
                                    onChange={(e) => handleCustomChange(e, 'mountCodeToContainerPath')}
                                    value={
                                        formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail
                                            .mountCodeToContainerPath
                                    }
                                />
                            </div>
                            <div className="pl-220">
                                {errorObj['mountCodeToContainerPath'] && !errorObj['mountCodeToContainerPath'].isValid && (
                                    <span className="flexbox cr-5 mt-4 fw-5 fs-11 flexbox">
                                        <AlertTriangle className="icon-dim-14 mr-5 ml-5 mt-2" />
                                        <span>{errorObj['mountCodeToContainerPath'].message}</span>
                                    </span>
                                )}
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
                                formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail
                                    .mountDirectoryFromHost
                                    ? MountPath.TRUE
                                    : MountPath.FALSE
                            }
                            disabled={false}
                            name="mountDirectoryFromHost"
                            onChange={(event) => {
                                handleMountChange(event)
                            }}
                        >
                            <RadioGroupItem value={MountPath.FALSE}> {MountPath.FALSE} </RadioGroupItem>
                            <RadioGroupItem value={MountPath.TRUE}> {MountPath.TRUE} </RadioGroupItem>
                        </RadioGroup>
                    </div>
                    {formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.mountDirectoryFromHost && (
                        <MountFromHost />
                    )}
                    <OutputDirectoryPath />
                </>
            )
        }
    }

    const renderDockerScript = () => {
        if (formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.scriptType === ScriptType.DOCKERFILE) {
            return (
                <>
                    <div className="row-container mb-12">
                        <div className="fw-6 fs-13 lh-32 cn-7 ">Docker path *</div>{' '}
                        <input
                            style={{ width: '80% !important' }}
                            className="form__input bcn-1 w-80"
                            autoComplete="off"
                            placeholder="Enter Mount script path"
                            type="text"
                        />
                    </div>
                    <div className="row-container mb-12">
                        <Tippy className="default-tt" arrow={false} content="Path where script should be mounted">
                            <div className="fw-6 fs-13 lh-32 cn-7 ">Mount script at *</div>
                        </Tippy>
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
        </>
    )
}
