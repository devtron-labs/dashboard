import React from 'react'
import { ViewType } from '../../config'
import { createWebhookConditionList } from '../ciPipeline/ciPipeline.service'
import { SourceMaterials, WebhookCIProps } from '../ciPipeline/SourceMaterials'
import { FormType } from '../ciPipeline/types'
import { ValidationRules } from '../ciPipeline/validationRules'
import { Progressing } from '../common'
import error from '../../assets/icons/misc/errorInfo.svg'

export function Build({
    formData,
    pageState,
    setFormData,
    showFormError,
    isAdvanced,
    ciPipelineId
}: {
    formData: FormType
    pageState: string
    setFormData: React.Dispatch<React.SetStateAction<FormType>>
    showFormError: boolean
    isAdvanced: boolean
    ciPipelineId: number
}) {
    const validationRules = new ValidationRules()

    const handleSourceChange = (event, gitMaterialId: number): void => {
        let _formData = { ...formData }
        let allMaterials = _formData.materials.map((mat) => {
            if (mat.gitMaterialId == gitMaterialId) {
                return {
                    ...mat,
                    value: event.target.value,
                }
            } else return mat
        })
        _formData.materials = allMaterials
        setFormData(_formData)
    }

    const selectSourceType = (selectedSource, gitMaterialId: number): void => {
        // update source type in material
        let _formData = { ...formData }
        let allMaterials = _formData.materials.map((mat) => {
            return {
                ...mat,
                type: gitMaterialId === mat.gitMaterialId ? selectedSource.value : mat.type,
                value: '',
            }
        })
        _formData.materials = allMaterials
        // update source type selected option in dropdown
        let _ciPipelineSourceTypeOptions = _formData.ciPipelineSourceTypeOptions.map((sourceTypeOption) => {
            return {
                ...sourceTypeOption,
                isSelected: sourceTypeOption.label === selectedSource.label,
            }
        })
        _formData.ciPipelineSourceTypeOptions = _ciPipelineSourceTypeOptions

        // if selected source is of type webhook, then set eventId in value, assume single git material, set condition list
        if (selectedSource.isWebhook) {
            let _material = _formData.materials[0]
            let _selectedWebhookEvent = _formData.webhookEvents.find((we) => we.name === selectedSource.label)
            let _condition = {}

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
        let _materialValue = JSON.parse(material.value)
        let _selectedEventId = _materialValue.eventId
        return formData.webhookEvents.find((we) => we.id === _selectedEventId)
    }

    const addWebhookCondition = (): void => {
        let _form = { ...formData }
        _form.webhookConditionList.push({ selectorId: 0, value: '' })
        setFormData(_form)
    }

    const deleteWebhookCondition = (index: number): void => {
        let _form = { ...formData }
        _form.webhookConditionList.splice(index, 1)
        setFormData(_form)
    }

    const onWebhookConditionSelectorChange = (index: number, selectorId: number): void => {
        let _form = { ...formData }
        let _condition = _form.webhookConditionList[index]
        _condition.selectorId = selectorId
        _condition.value = ''
        setFormData(_form)
    }

    const onWebhookConditionSelectorValueChange = (index: number, value: string): void => {
        let _form = { ...formData }
        let _condition = _form.webhookConditionList[index]
        _condition.value = value
        setFormData(_form)
    }

    const noop = () => {}

    const copyToClipboard = (text: string, callback = noop): void => {
        let textarea = document.createElement('textarea')
        let main = document.getElementsByClassName('main')[0]
        main.appendChild(textarea)
        textarea.value = text
        textarea.select()
        document.execCommand('copy')
        main.removeChild(textarea)
        callback()
    }

    const renderBasicCI = () => {
        let _webhookData: WebhookCIProps = {
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
            <div className="pl-20 pr-20 pt-20 pb-20 scrollable-content">
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
            </div>
        )
    }

    const handlePipelineName=(event): void =>{
      let _form = { ...formData }
        _form.name = event.target.value;
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
                {showFormError && !validationRules.name(formData.name).isValid ? (
                    <span className="form__error">
                        <img src={error} className="form__icon" />
                        {validationRules.name(formData.name).message}
                    </span>
                ) : null}
            </label>
        )
    }

    return pageState.toString() == ViewType.LOADING ? (
        <div style={{ minHeight: '200px' }} className="flex">
            <Progressing pageLoader />
        </div>
    ) : (
        renderBasicCI()
    )
}
