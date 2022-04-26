import React, { useContext } from 'react'
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

export function TaskTypeDetailComponent() {
    const {
        selectedTaskIndex,
        formData,
        setFormData,
        activeStageName,
        formDataErrorObj,
    }: {
        selectedTaskIndex: number
        formData: FormType
        setFormData: React.Dispatch<React.SetStateAction<FormType>>
        activeStageName: string
        formDataErrorObj: FormErrorObjectType
    } = useContext(ciPipelineContext)

    const handleContainer = (e: any, key: 'containerImagePath' | 'imagePullSecret'): void => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[key] = e.target.value
        setFormData(_formData)
    }

    const handleCustomChange = (event, key: 'script' | 'storeScriptAt' | 'mountCodeToContainerPath') => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[key] = event.target.value
        setFormData(_formData)
    }

    const handleMountChange = (e, key: 'mountCodeToContainer' | 'mountDirectoryFromHost') => {
        const _formData = { ...formData }
        console.log(e.target.value)
        if (e.target.value === MountPath.TRUE) {
            _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[key] = true
            if (
                key === 'mountDirectoryFromHost' &&
                (!formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.mountPathMap ||
                    formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.mountPathMap.length === 0)
            ) {
                formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.mountPathMap = []
                _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.mountPathMap.push({
                    filePathOnDisk: null,
                    filePathOnContainer: null,
                })
            }
        } else {
            _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail[key] = false
        }
        setFormData(_formData)
    }

    const handleCommandArgs = (e, key: 'command' | 'args') => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.commandArgsMap[0][key] =
            key === 'command' ? e.target.value : e.target.value.replace(/\s+/g, '').split(',')
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
            return (
                <>
                    <CustomScript handleScriptChange={(e) => handleCustomChange(e, 'script')} />
                    <hr />
                    <OutputDirectoryPath />
                </>
            )
        }
    }

    const renderContainerScript = () => {
        if (
            formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.scriptType === ScriptType.CONTAINERIMAGE
        ) {
            return (
                <>
                    <div className="row-container mb-10">
                        <TaskFieldTippyDescription
                            taskField={TaskFieldLabel.CONTAINERIMAGEPATH}
                            contentDescription={TaskFieldDescription.CONTAINERIMAGEPATH}
                        />
                        <div style={{ width: '80% !important' }}>
                            <input
                                className="w-100 bcn-1 br-4 en-2 bw-1 pl-10 pr-10 pt-6 pb-6"
                                autoComplete="off"
                                placeholder="Enter image path *"
                                type="text"
                                onChange={(e) => handleContainer(e, 'containerImagePath')}
                                value={
                                    formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail
                                        .containerImagePath
                                }
                            />

                            {formDataErrorObj[activeStageName].steps[selectedTaskIndex].inlineStepDetail
                                ?.containerImagePath &&
                                !formDataErrorObj[activeStageName].steps[selectedTaskIndex].inlineStepDetail
                                    ?.containerImagePath.isValid && (
                                    <span className="flexbox cr-5 mb-4 mt-4 fw-5 fs-11 flexbox">
                                        <AlertTriangle className="icon-dim-14 mr-5 ml-5 mt-2" />
                                        <span>
                                            {
                                                formDataErrorObj[activeStageName].steps[selectedTaskIndex]
                                                    .inlineStepDetail?.containerImagePath.message
                                            }
                                        </span>
                                    </span>
                                )}
                        </div>
                    </div>
                    <div className="flex left pl-200 fs-13 fw-6 pb-18 pt-9 ">
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
                        >
                            <Tippy
                                className="default-tt"
                                arrow={false}
                                content="Enable this if you also want to mount scripts in the container"
                            >
                                <label>Mount custom script</label>
                            </Tippy>
                        </Checkbox>
                    </div>
                    {formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.isMountCustomScript && (
                        <>
                            <CustomScript handleScriptChange={(e) => handleCustomChange(e, 'script')} />
                            <div className="row-container mb-10">
                                <TaskFieldTippyDescription
                                    taskField={TaskFieldLabel.STORESCRIPTAT}
                                    contentDescription={TaskFieldDescription.STORESCRIPTAT}
                                />
                                <div style={{ width: '80% !important' }}>
                                    <input
                                        className="w-100 bcn-1 br-4 en-2 bw-1 pl-10 pr-10 pt-6 pb-6"
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

                                    {formDataErrorObj[activeStageName].steps[selectedTaskIndex].inlineStepDetail
                                        ?.storeScriptAt &&
                                        !formDataErrorObj[activeStageName].steps[selectedTaskIndex].inlineStepDetail
                                            ?.storeScriptAt.isValid && (
                                            <span className="flexbox cr-5 mb-4 mt-4 fw-5 fs-11 flexbox">
                                                <AlertTriangle className="icon-dim-14 mr-5 ml-5 mt-2" />
                                                <span>
                                                    {
                                                        formDataErrorObj[activeStageName].steps[selectedTaskIndex]
                                                            .inlineStepDetail?.storeScriptAt.message
                                                    }
                                                </span>
                                            </span>
                                        )}
                                </div>
                            </div>
                        </>
                    )}
                    <div className="row-container mb-10">
                        <TaskFieldTippyDescription
                            taskField={TaskFieldLabel.COMMAND}
                            contentDescription={TaskFieldDescription.COMMAND}
                        />
                        <input
                            style={{ width: '80% !important' }}
                            className="w-100 bcn-1 br-4 en-2 bw-1 pl-10 pr-10 pt-6 pb-6"
                            autoComplete="off"
                            placeholder="Eg. “echo”"
                            type="text"
                            onChange={(e) => handleCommandArgs(e, TaskFieldLabel.COMMAND)}
                            value={
                                formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.commandArgsMap[0][
                                    TaskFieldLabel.COMMAND
                                ]
                            }
                        />
                    </div>
                    <div className="row-container mb-10">
                        <TaskFieldTippyDescription
                            taskField={TaskFieldLabel.ARGS}
                            contentDescription={TaskFieldDescription.ARGS}
                        />
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
                    <MultiplePort />
                    <div className="row-container mb-10">
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
                                handleMountChange(event, 'mountCodeToContainer')
                            }}
                        >
                            <RadioGroupItem value={MountPath.FALSE}> {MountPath.FALSE} </RadioGroupItem>
                            <RadioGroupItem value={MountPath.TRUE}> {MountPath.TRUE} </RadioGroupItem>
                        </RadioGroup>
                    </div>
                    {formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.mountCodeToContainer && (
                        <>
                            <div className="row-container mb-10">
                                <label className="fw-6 fs-13 cn-7 label-width"></label>
                                <input
                                    style={{ width: '80% !important' }}
                                    className="w-100 bcn-1 br-4 en-2 bw-1 pl-10 pr-10 pt-6 pb-6"
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
                            <div className="pl-200 mb-20">
                                {formDataErrorObj[activeStageName].steps[selectedTaskIndex]?.inlineStepDetail[
                                    'mountCodeToContainerPath'
                                ] &&
                                    !formDataErrorObj[activeStageName].steps[selectedTaskIndex]?.inlineStepDetail[
                                        'mountCodeToContainerPath'
                                    ].isValid && (
                                        <span className="flexbox cr-5 mb-4 mt-4 fw-5 fs-11 flexbox">
                                            <AlertTriangle className="icon-dim-14 mr-5 ml-5 mt-2" />
                                            <span>
                                                {
                                                    formDataErrorObj[activeStageName].steps[selectedTaskIndex]
                                                        ?.inlineStepDetail['mountCodeToContainerPath'].message
                                                }
                                            </span>
                                        </span>
                                    )}
                            </div>
                        </>
                    )}
                    <div className="row-container mb-10">
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
                                handleMountChange(event, 'mountDirectoryFromHost')
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
                        <Tippy className="default-tt" arrow={false} content="Path where script should be mounted">
                            <label className="fw-6 fs-13 cn-7 label-width">Mount script at *</label>
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
            {/* {renderDockerScript()} */}
        </>
    )
}
