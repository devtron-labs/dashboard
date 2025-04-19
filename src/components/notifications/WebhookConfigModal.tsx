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
import { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'

import {
    ClipboardButton,
    CodeEditor,
    CustomInput,
    MODES,
    showError,
    ToastManager,
    ToastVariantType,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ErrorIcon } from '@Icons/ic-warning.svg'

import { ReactComponent as Help } from '../../assets/icons/ic-help.svg'
import { ConfigurationTabDrawerModal } from './ConfigurationDrawerModal'
import {
    ConfigurationFieldKeys,
    ConfigurationsTabTypes,
    DefaultWebhookConfig,
    DefaultWebhookValidations,
} from './constants'
import { getWebhookAttributes, getWebhookConfiguration, saveUpdateWebhookConfiguration } from './notifications.service'
import {
    getEmptyVariableDataRow,
    getInitialWebhookKeyRow,
    getValidationFormConfig,
    renderErrorToast,
    validateKeyValueConfig,
    validatePayloadField,
} from './notifications.util'
import { WebhookConfigModalProps, WebhookDataRowType, WebhookFormTypes, WebhookValidations } from './types'
import { WebhookConfigDynamicDataTable } from './WebhookConfigDynamicDataTable'

export const WebhookConfigModal = ({
    webhookConfigId,
    closeWebhookConfigModal,
    onSaveSuccess,
}: WebhookConfigModalProps) => {
    const [form, setForm] = useState<WebhookFormTypes>(DefaultWebhookConfig)
    const [rows, setRows] = useState<WebhookDataRowType[]>()
    const [isFormValid, setFormValid] = useState<WebhookValidations>(DefaultWebhookValidations)

    const history = useHistory()
    const [webhookAttribute, setWebhookAttribute] = useState({})

    const fetchWebhookData = async () => {
        setForm((prev) => ({ ...prev, isLoading: true }))
        try {
            // Fetch webhook configuration
            const response = await getWebhookConfiguration(webhookConfigId)
            const { header = {}, payload = '' } = response?.result || {}
            // Update form state with response data
            setForm((prev) => ({
                ...prev,
                ...response?.result,
                header,
                payload,
                isLoading: false,
            }))
            setRows(getInitialWebhookKeyRow(header))
        } catch (error) {
            // Show error message and reset loading state
            showError(error)
            setForm((prev) => ({ ...prev, isLoading: false }))
        }
    }

    const fetchAttribute = async () => {
        setForm((prev) => ({ ...prev, isLoading: true }))
        try {
            // Fetch webhook attributes
            const attributesResponse = await getWebhookAttributes()
            setWebhookAttribute(attributesResponse?.result || {})
            setForm((prev) => ({ ...prev, isLoading: false }))
        } catch (error) {
            showError(error)
            setForm((prev) => ({ ...prev, isLoading: false }))
        }
    }

    useEffect(() => {
        // Fetch webhook attributes
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        fetchAttribute()
    }, [])

    useEffect(() => {
        if (webhookConfigId) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            fetchWebhookData()
        } else {
            setRows([getEmptyVariableDataRow()])
        }
    }, [webhookConfigId])

    const closeWebhookConfig = () => {
        if (typeof closeWebhookConfigModal === 'function') {
            closeWebhookConfigModal()
        } else {
            const newParams = {
                modal: ConfigurationsTabTypes.WEBHOOK,
            }
            history.push({
                search: new URLSearchParams(newParams).toString(),
            })
        }
    }

    const handleInputChange = (event) => {
        const { name, value } = event.target
        setForm((prev) => ({ ...prev, [name]: value }))
        setFormValid((prev) => ({ ...prev, [name]: validateKeyValueConfig(name, value) }))
    }

    const handleIncomingPayloadChange = (value) => {
        setForm((prev) => ({ ...prev, payload: value }))
        setFormValid((prev) => ({ ...prev, payload: validatePayloadField(value) }))
    }

    const renderDataList = () => (
        <div className="flexbox-col flex-grow-1 dc__overflow-auto dc__gap-8">
            {Object.keys(webhookAttribute).map((attribute, index) => (
                <div
                    className="dc__visible-hover dc__visible-hover--parent w-100-imp cn-8 flexbox data-container hover-trigger dc__gap-6"
                    data-testid={`${webhookAttribute[attribute]}-${index}`}
                    key={`${attribute}`}
                >
                    <p className="bcn-1 br-6 fs-14 lh-20 px-4 mono m-0">{webhookAttribute[attribute]}</p>
                    <div className="flex dc__visible-hover--child">
                        <ClipboardButton content={webhookAttribute[attribute]} />
                    </div>
                </div>
            ))}
        </div>
    )

    const renderConfigureLinkInfoColumn = () => (
        <div
            className="h-100 w-280 flexbox-col left mh-0 p-16 dc__overflow-auto dc__gap-16 fs-13"
            data-testid="available-webhook-data"
        >
            <div className="flexbox lh-20 fw-6">
                <Help className="icon-dim-18 fcv-5" />
                <span className="ml-8 fw-6 fs-13 lh-20"> Available data</span>
            </div>
            <p className="lh-20 m-0">
                Following data are available to be shared through Webhook. Use Payload to configure.
            </p>
            {renderDataList()}
        </div>
    )

    const validateSave = (): boolean => {
        const formConfig = [
            { key: ConfigurationFieldKeys.CONFIG_NAME, value: form.configName },
            { key: ConfigurationFieldKeys.WEBHOOK_URL, value: form.webhookUrl },
            { key: ConfigurationFieldKeys.PAYLOAD, value: form.payload },
        ]
        const { allValid, formValidations } = getValidationFormConfig(formConfig)
        setFormValid((prevValid) => ({ ...prevValid, ...formValidations }))
        return allValid
    }

    const saveWebhookConfig = async () => {
        if (!validateSave()) {
            renderErrorToast()
            return
        }

        const headers = rows?.reduce((acc, row) => {
            acc[row.data.key.value] = row.data.value.value
            return acc
        }, {})
        setForm((prev) => ({ ...prev, isLoading: true }))

        try {
            const requestBody = {
                channel: ConfigurationsTabTypes.WEBHOOK,
                configs: [
                    {
                        configName: form.configName,
                        webhookUrl: form.webhookUrl,
                        payload: form.payload,
                        id: webhookConfigId,
                        header: headers,
                    },
                ],
            }
            await saveUpdateWebhookConfiguration(requestBody)
            ToastManager.showToast({ variant: ToastVariantType.success, description: 'Saved Successfully' })
            onSaveSuccess()
            closeWebhookConfig()
        } catch (error) {
            showError(error)
        } finally {
            setForm((prev) => ({ ...prev, isLoading: false }))
        }
    }

    const handleBlur = (event) => {
        const { name, value } = event.target
        setFormValid((prev) => ({ ...prev, [name]: validateKeyValueConfig(name, value) }))
    }
    const renderWebhookModal = () => (
        <div className="webhook-config-modal webhook-config-modal h-100 cn-9 w-100 mh-0">
            <div className="p-20 flex-grow-1 flexbox-col mh-0 dc__overflow-auto dc__gap-16 dc__border-right">
                <CustomInput
                    label="Configuration name"
                    value={form.configName}
                    onChange={handleInputChange}
                    placeholder="Enter a name"
                    error={isFormValid[ConfigurationFieldKeys.CONFIG_NAME].message}
                    name={ConfigurationFieldKeys.CONFIG_NAME}
                    required
                    autoFocus
                    onBlur={handleBlur}
                />
                <CustomInput
                    label="Webhook URL"
                    value={form.webhookUrl}
                    onChange={handleInputChange}
                    placeholder="Enter incoming webhook URL"
                    error={isFormValid[ConfigurationFieldKeys.WEBHOOK_URL].message}
                    name={ConfigurationFieldKeys.WEBHOOK_URL}
                    required
                    onBlur={handleBlur}
                />
                <WebhookConfigDynamicDataTable rows={rows} setRows={setRows} />

                <div className="flexbox-col dc__gap-6">
                    <div className="fs-13 cn-7 lh-20 dc__required-field">Data to be shared through webhook</div>
                    <CodeEditor.Container overflowHidden>
                        <CodeEditor
                            mode={MODES.JSON}
                            codeEditorProps={{
                                value: form.payload,
                                onChange: handleIncomingPayloadChange,
                                inline: true,
                                adjustEditorHeightToContent: true,
                            }}
                            codeMirrorProps={{
                                value: form.payload,
                                onChange: handleIncomingPayloadChange,
                                height: '100%',
                            }}
                        />
                    </CodeEditor.Container>
                    {isFormValid[ConfigurationFieldKeys.PAYLOAD].message && (
                        <div className="flex left dc__gap-4 cr-5 fs-11 lh-16 fw-4">
                            <ErrorIcon className="icon-dim-16 p-1 form__icon--error dc__no-shrink dc__align-self-start" />
                            <span>{isFormValid[ConfigurationFieldKeys.PAYLOAD].message}</span>
                        </div>
                    )}
                </div>
            </div>
            {renderConfigureLinkInfoColumn()}
        </div>
    )

    return (
        <ConfigurationTabDrawerModal
            renderContent={renderWebhookModal}
            closeModal={closeWebhookConfig}
            modal={ConfigurationsTabTypes.WEBHOOK}
            isLoading={form.isLoading}
            saveConfigModal={saveWebhookConfig}
        />
    )
}
