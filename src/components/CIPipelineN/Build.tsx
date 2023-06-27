import React, { useContext } from 'react'
import { SourceTypeMap, ViewType } from '../../config'
import { createWebhookConditionList } from '../ciPipeline/ciPipeline.service'
import { SourceMaterials } from '../ciPipeline/SourceMaterials'
import { ValidationRules } from '../ciPipeline/validationRules'
import { Progressing, Toggle, CiPipelineSourceTypeOption, FormType, FormErrorObjectType } from '@devtron-labs/devtron-fe-common-lib'
import { ciPipelineContext } from './CIPipeline'
import { BuildType, WebhookCIProps } from '../ciPipeline/types'
import { ReactComponent as AlertTriangle } from '../../assets/icons/ic-alert-triangle.svg'
import { ReactComponent as BugScanner } from '../../assets/icons/scanner.svg'
import AdvancedConfigOptions from './AdvancedConfigOptions'
import { LoadingState } from '../ciConfig/types'

export function Build({
    showFormError,
    isAdvanced,
    ciPipeline,
    pageState,
    isSecurityModuleInstalled,
    setDockerConfigOverridden,
    isJobView,
    getPluginData
}: BuildType) {
    const {
        formData,
        setFormData,
        formDataErrorObj,
        loadingState,
        setLoadingState,
        setFormDataErrorObj,
    }: {
        formData: FormType
        setFormData: React.Dispatch<React.SetStateAction<FormType>>
        formDataErrorObj: FormErrorObjectType
        loadingState: LoadingState
        setLoadingState: React.Dispatch<React.SetStateAction<LoadingState>>
        setFormDataErrorObj: React.Dispatch<React.SetStateAction<FormErrorObjectType>>
    } = useContext(ciPipelineContext)
    const validationRules = new ValidationRules()

    const handleSourceChange = (event, gitMaterialId: number, sourceType: string): void => {
        const _formData = { ...formData }
        const allMaterials = _formData.materials.map((mat) => {
            if (mat.gitMaterialId === gitMaterialId) {
                if (sourceType === SourceTypeMap.BranchRegex) {
                    return {
                        ...mat,
                        value: '',
                        regex: event.target.value,
                    }
                }
                return {
                    ...mat,
                    regex: '',
                    value: event.target.value,
                }
            } else {
                return mat
            }
        })
        _formData.materials = allMaterials
        setFormData(_formData)
    }

    const handleOnBlur = (event): void => {
      getPluginData()
    }


    const selectSourceType = (selectedSource: CiPipelineSourceTypeOption, gitMaterialId: number): void => {
        // update source type in material
        const _formData = { ...formData }
        let isPrevWebhook =
            _formData.ciPipelineSourceTypeOptions.find((sto) => sto.isSelected)?.value === SourceTypeMap.WEBHOOK

        const allMaterials = _formData.materials.map((mat) => {
            const sourceType = gitMaterialId === mat.gitMaterialId ? selectedSource.value : mat.type
            const isBranchRegexType = sourceType === SourceTypeMap.BranchRegex
            return {
                ...mat,
                type: sourceType,
                isRegex: isBranchRegexType,
                regex: isBranchRegexType ? mat.regex : '',
                value: isPrevWebhook && selectedSource.value !== SourceTypeMap.WEBHOOK ? '' : mat.value,
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
        getPluginData(_formData)
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
                    isAdvanced={isAdvanced}
                    handleOnBlur={handleOnBlur}
                />
            </>
        )
    }

    const handlePipelineName = (event): void => {
        const _form = { ...formData }
        _form.name = event.target.value
        setFormData(_form)
        const _formDataErrorObj = { ...formDataErrorObj }
        _formDataErrorObj.name = validationRules.name(_form.name)
        setFormDataErrorObj(_formDataErrorObj)
    }

    const renderPipelineName = () => {
        return (
            <label className="form__row">
                <span className="form__label dc__required-field">Pipeline Name</span>
                <input
                    className="form__input"
                    data-testid="build-pipeline-name-textbox"
                    autoComplete="off"
                    disabled={!!ciPipeline?.id}
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
                                dataTestId="create-build-pipeline-scan-vulnerabilities-toggle"
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
            {!isJobView && isAdvanced && (
                <>
                    {isSecurityModuleInstalled && renderScanner()}
                    <AdvancedConfigOptions
                        ciPipeline={ciPipeline}
                        formData={formData}
                        setFormData={setFormData}
                        setDockerConfigOverridden={setDockerConfigOverridden}
                        loadingState={loadingState}
                        setLoadingState={setLoadingState}
                    />
                </>
            )}
        </div>
    )
}
