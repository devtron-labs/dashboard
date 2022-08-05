import React, { useContext, useState } from 'react'
import { SourceTypeMap, ViewType } from '../../config'
import { createWebhookConditionList } from '../ciPipeline/ciPipeline.service'
import { SourceMaterials } from '../ciPipeline/SourceMaterials'
import { ValidationRules } from '../ciPipeline/validationRules'
import { Progressing, showError, Toggle } from '../common'
import error from '../../assets/icons/misc/errorInfo.svg'
import { ciPipelineContext } from './CIPipeline'
import { CiPipelineSourceTypeOption, FormErrorObjectType, FormType, WebhookCIProps } from '../ciPipeline/types'
import { ReactComponent as Dropdown } from '../../assets/icons/ic-chevron-down.svg'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { ReactComponent as AlertTriangle } from '../../assets/icons/ic-alert-triangle.svg'
import { ReactComponent as BugScanner } from '../../assets/icons/scanner.svg'

export function Build({
    showFormError,
    isAdvanced,
    ciPipelineId,
    pageState,
}: {
    showFormError: boolean
    isAdvanced: boolean
    ciPipelineId: number
    pageState: string
}) {
    const {
        formData,
        setFormData,
        formDataErrorObj,
    }: {
        formData: FormType
        setFormData: React.Dispatch<React.SetStateAction<FormType>>
        formDataErrorObj: FormErrorObjectType
    } = useContext(ciPipelineContext)
    const [collapsedSection, setCollapsedSection] = useState<boolean>(true)
    const validationRules = new ValidationRules()

    const handleSourceChange = (event, gitMaterialId: number, sourceType: string): void => {
        const _formData = { ...formData }
        const allMaterials = _formData.materials.map((mat) => {
            if (mat.gitMaterialId === gitMaterialId) {
                if (sourceType === SourceTypeMap.BranchRegex) {
                    return {
                        ...mat,
                        regex: event.target.value,
                    }
                }
                return {
                    ...mat,
                    value: event.target.value,
                }
            } else {
                return mat
            }
        })
        _formData.materials = allMaterials
        setFormData(_formData)
    }

    const selectSourceType = (selectedSource: CiPipelineSourceTypeOption, gitMaterialId: number): void => {
        // update source type in material
        const _formData = { ...formData }
        const isMulti = formData.materials.length > 1
        let isVal
        if (!isMulti) {
            isVal = ''
        }
        const allMaterials = _formData.materials.map((mat) => {
            return {
                ...mat,
                type: gitMaterialId === mat.gitMaterialId ? selectedSource.value : mat.type,
                value: isVal,
            }
        })
        _formData.materials = allMaterials
        // update source type selected option in dropdown
        const _ciPipelineSourceTypeOptions = _formData.ciPipelineSourceTypeOptions.map((sourceTypeOption) => {
            return {
                ...sourceTypeOption,
                isSelected: sourceTypeOption.label === selectedSource.label,
            }
        })
        _formData.ciPipelineSourceTypeOptions = _ciPipelineSourceTypeOptions

        // if selected source is of type webhook, then set eventId in value, assume single git material, set condition list
        if (selectedSource.isWebhook) {
            const _material = _formData.materials[0]
            const _selectedWebhookEvent = _formData.webhookEvents.find((we) => we.name === selectedSource.label)
            const _condition = {}

            // create initial data with fix values
            if (_selectedWebhookEvent && _selectedWebhookEvent.selectors) {
                _selectedWebhookEvent.selectors.forEach((_selector) => {
                    if (_selector.fixValue) {
                        _condition[_selector.id] = _selector.fixValue
                    }
                })
            }

            _material.value = JSON.stringify({ eventId: _selectedWebhookEvent.id, condition: _condition })

            // update condition list
            _formData.webhookConditionList = createWebhookConditionList(_material.value)
        }
        setFormData(_formData)
    }
    const getSelectedWebhookEvent = (material) => {
        const _materialValue = JSON.parse(material.value)
        const _selectedEventId = _materialValue?.eventId
        return _selectedEventId && formData.webhookEvents.find((we) => we.id === _selectedEventId)
    }

    const addWebhookCondition = (): void => {
        const _form = { ...formData }
        _form.webhookConditionList.push({ selectorId: 0, value: '' })
        setFormData(_form)
    }

    const deleteWebhookCondition = (index: number): void => {
        const _form = { ...formData }
        _form.webhookConditionList.splice(index, 1)
        setFormData(_form)
    }

    const onWebhookConditionSelectorChange = (index: number, selectorId: number): void => {
        const _form = { ...formData }
        const _condition = _form.webhookConditionList[index]
        _condition.selectorId = selectorId
        _condition.value = ''
        setFormData(_form)
    }

    const onWebhookConditionSelectorValueChange = (index: number, value: string): void => {
        const _form = { ...formData }
        const _condition = _form.webhookConditionList[index]
        _condition.value = value
        setFormData(_form)
    }

    const copyToClipboard = (text: string, callback = () => {}): void => {
        const textarea = document.createElement('textarea')
        const main = document.getElementsByClassName('main')[0]
        main.appendChild(textarea)
        textarea.value = text
        textarea.select()
        document.execCommand('copy')
        main.removeChild(textarea)
        callback()
    }

    const addDockerArg = (): void => {
        const _form = { ...formData }
        _form.args.unshift({ key: '', value: '' })
        setFormData(_form)
    }

    const handleDockerArgChange = (event, index: number, key: 'key' | 'value'): void => {
        const _form = { ...formData }
        _form.args[index][key] = event.target.value
        setFormData(_form)
    }

    const removeDockerArgs = (index: number): void => {
        const _form = { ...formData }
        const newArgs = []
        for (let i = 0; i < _form.args.length; i++) {
            if (index != i) newArgs.push(_form.args[i])
        }
        _form.args = newArgs
        setFormData(_form)
    }

    const handleScanToggle = (): void => {
        const _formData = { ...formData }
        _formData.scanEnabled = !_formData.scanEnabled
        setFormData(_formData)
    }

    const renderBasicCI = () => {
        const _webhookData: WebhookCIProps = {
            webhookConditionList: formData.webhookConditionList,
            gitHost: formData.gitHost,
            getSelectedWebhookEvent: getSelectedWebhookEvent,
            copyToClipboard: copyToClipboard,
            addWebhookCondition: addWebhookCondition,
            deleteWebhookCondition: deleteWebhookCondition,
            onWebhookConditionSelectorChange: onWebhookConditionSelectorChange,
            onWebhookConditionSelectorValueChange: onWebhookConditionSelectorValueChange,
        }

        return (
            <>
                {isAdvanced && renderPipelineName()}
                <SourceMaterials
                    showError={showFormError}
                    validationRules={validationRules}
                    materials={formData.materials}
                    selectSourceType={selectSourceType}
                    handleSourceChange={handleSourceChange}
                    includeWebhookEvents={true}
                    ciPipelineSourceTypeOptions={formData.ciPipelineSourceTypeOptions}
                    webhookData={_webhookData}
                    canEditPipeline={formData.ciPipelineEditable}
                />
            </>
        )
    }

    const renderDockerArgs = () => {
        return (
            <div>
                <hr />
                <div
                    className="flexbox justify-space pointer"
                    onClick={(event) => {
                        setCollapsedSection(!collapsedSection)
                    }}
                >
                    <div>
                        <div className="fs-14 fw-6 cn-9">Docker build arguments</div>
                        <div className="fs-12 fw-4 cn-7">Override docker build configurations for this pipeline.</div>
                    </div>
                    <Dropdown
                        className="mt-10"
                        style={{ transform: collapsedSection ? 'rotate(180deg)' : 'rotate(0)' }}
                    />
                </div>
                {collapsedSection ? (
                    <div>
                        <div className="pointer cb-5 fw-6 fs-13 flexbox content-fit lh-32 mt-20" onClick={addDockerArg}>
                            <Add className="add-icon mt-6" />
                            Add parameter
                        </div>
                        {formData.args.map((arg, index) => {
                            return (
                                <div className="flexbox justify-space" key={`build-${index}`}>
                                    <div className="mt-8 w-100">
                                        <input
                                            className="w-100 top-radius-4 pl-10 pr-10 pt-6 pb-6 en-2 bw-1"
                                            autoComplete="off"
                                            placeholder="Key"
                                            type="text"
                                            value={arg.key}
                                            onChange={(event) => {
                                                handleDockerArgChange(event, index, 'key')
                                            }}
                                        />
                                        <textarea
                                            className="build__value w-100 bottom-radius-4 no-top-border pl-10 pr-10 pt-6 pb-6 en-2 bw-1"
                                            value={arg.value}
                                            onChange={(event) => {
                                                handleDockerArgChange(event, index, 'value')
                                            }}
                                            placeholder="Value"
                                        />
                                    </div>
                                    <Close
                                        className="icon-dim-24 pointer mt-6 ml-6"
                                        onClick={() => {
                                            removeDockerArgs(index)
                                        }}
                                    />
                                </div>
                            )
                        })}
                    </div>
                ) : null}
            </div>
        )
    }

    const handlePipelineName = (event): void => {
        const _form = { ...formData }
        _form.name = event.target.value
        setFormData(_form)
    }

    const renderPipelineName = () => {
        return (
            <label className="form__row">
                <span className="form__label">Pipeline Name*</span>
                <input
                    className="form__input"
                    autoComplete="off"
                    disabled={!!ciPipelineId}
                    placeholder="e.g. my-first-pipeline"
                    type="text"
                    value={formData.name}
                    onChange={handlePipelineName}
                />
                {formDataErrorObj.name && !formDataErrorObj.name.isValid && (
                    <span className="flexbox cr-5 mt-4 fw-5 fs-11 flexbox">
                        <AlertTriangle className="icon-dim-14 mr-5 ml-5 mt-2" />
                        <span>{formDataErrorObj.name.message}</span>
                    </span>
                )}
            </label>
        )
    }

    const renderScanner = () => {
        return (
            <>
                <hr />
                <div>
                    <div
                        className="en-2 bw-1 br-4 pt-12 pb-12 pl-16 pr-12"
                        style={{ display: 'grid', gridTemplateColumns: '52px auto 32px' }}
                    >
                        <BugScanner />
                        <div>
                            <p className="fs-13 lh-20 fw-6 cn-9 mb-4">Scan for vulnerabilities</p>
                            <p className="fs-13 lh-18 mb-0 fs-12">
                                Perform security scan after container image is built.
                            </p>
                        </div>
                        <div className="mt-4" style={{ width: '32px', height: '20px' }}>
                            <Toggle
                                disabled={window._env_.FORCE_SECURITY_SCANNING && formData.scanEnabled}
                                selected={formData.scanEnabled}
                                onSelect={handleScanToggle}
                            />
                        </div>
                    </div>
                </div>
            </>
        )
    }
    return pageState === ViewType.LOADING.toString() ? (
        <div style={{ minHeight: '200px' }} className="flex">
            <Progressing pageLoader />
        </div>
    ) : (
        <div className="p-20 ci-scrollable-content">
            {renderBasicCI()}
            {isAdvanced && (
                <>
                    {renderScanner()}
                    {renderDockerArgs()}
                </>
            )}
        </div>
    )
}
