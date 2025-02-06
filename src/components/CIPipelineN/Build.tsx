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

import React, { useContext } from 'react'
import { Progressing, Toggle, CiPipelineSourceTypeOption, CustomInput } from '@devtron-labs/devtron-fe-common-lib'
import { SourceTypeMap, ViewType } from '../../config'
import { createWebhookConditionList } from '../ciPipeline/ciPipeline.service'
import { SourceMaterials } from '../ciPipeline/SourceMaterials'
import { ValidationRules } from '../ciPipeline/validationRules'
import { BuildType, WebhookCIProps } from '../ciPipeline/types'
import { ReactComponent as BugScanner } from '../../assets/icons/scanner.svg'
import AdvancedConfigOptions from './AdvancedConfigOptions'
import { pipelineContext } from '../workflowEditor/workflowEditor'

export const Build = ({
    showFormError,
    isAdvanced,
    ciPipeline,
    pageState,
    isSecurityModuleInstalled,
    isJobView,
    getPluginData,
    appId,
}: BuildType) => {
    const { formData, setFormData, formDataErrorObj, setFormDataErrorObj } = useContext(pipelineContext)
    const validationRules = new ValidationRules()
    const handleSourceChange = (event, gitMaterialId: number, sourceType: string): void => {
        setFormData((prevFormData) => {
            const _formData = structuredClone(prevFormData)

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
                }
                return mat
            })
            _formData.materials = allMaterials

            return _formData
        })
    }

    const handleOnBlur = async (): Promise<void> => {
        await getPluginData()
    }

    const selectSourceType = (selectedSource: CiPipelineSourceTypeOption, gitMaterialId: number): void => {
        // update source type in material
        const _formData = structuredClone(formData)
        const isPrevWebhook =
            _formData.ciPipelineSourceTypeOptions.find((sto) => sto.isSelected)?.value === SourceTypeMap.WEBHOOK

        const materialIndexToUpdate = _formData.materials.findIndex((mat) => mat.gitMaterialId === gitMaterialId)
        if (materialIndexToUpdate !== -1) {
            const materialToUpdate = _formData.materials[materialIndexToUpdate]
            const sourceType =
                gitMaterialId === materialToUpdate.gitMaterialId ? selectedSource.value : materialToUpdate.type
            const isBranchRegexType = sourceType === SourceTypeMap.BranchRegex

            _formData.materials[materialIndexToUpdate] = {
                ...materialToUpdate,
                type: sourceType,
                isRegex: isBranchRegexType,
                regex: isBranchRegexType ? materialToUpdate.regex : '',
                value: isPrevWebhook && selectedSource.value !== SourceTypeMap.WEBHOOK ? '' : materialToUpdate.value,
            }
        }

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
            getSelectedWebhookEvent,
            copyToClipboard,
            addWebhookCondition,
            deleteWebhookCondition,
            onWebhookConditionSelectorChange,
            onWebhookConditionSelectorValueChange,
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
                    includeWebhookEvents
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
                <CustomInput
                    name="name"
                    label="Pipeline Name"
                    data-testid="build-pipeline-name-textbox"
                    autoComplete="off"
                    disabled={!!ciPipeline?.id}
                    placeholder="e.g. my-first-pipeline"
                    type="text"
                    value={formData.name}
                    onChange={handlePipelineName}
                    isRequiredField
                    error={formDataErrorObj.name && !formDataErrorObj.name.isValid && formDataErrorObj.name.message}
                />
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
                    <AdvancedConfigOptions ciPipeline={ciPipeline} appId={appId} />
                </>
            )}
        </div>
    )
}
