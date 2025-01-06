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
import { useState, useEffect } from 'react'
import {
    showError,
    CustomInput,
    ClipboardButton,
    CodeEditor,
    ToastVariantType,
    ToastManager,
} from '@devtron-labs/devtron-fe-common-lib'
import { useHistory } from 'react-router-dom'
import { ReactComponent as Help } from '../../assets/icons/ic-help.svg'
import { REQUIRED_FIELD_MSG } from '../../config/constantMessaging'
import { getWebhookAttributes, getWebhookConfiguration, saveUpdateWebhookConfiguration } from './notifications.service'
import { ConfigurationFieldKeys, ConfigurationsTabTypes, DefaultWebhookConfig } from './constants'
import { ConfigurationTabDrawerModal } from './ConfigurationDrawerModal'
import { WebhookConfigModalProps, WebhookDataRowType } from './types'
import { WebhookConfigDynamicDataTable } from './WebhookConfigDynamicDataTable'

export const WebhookConfigModal = ({
    webhookConfigId,
    closeWebhookConfigModal,
    onSaveSuccess,
}: WebhookConfigModalProps) => {
    const [form, setForm] = useState(DefaultWebhookConfig)
    const [isValid, setIsValid] = useState({
        configName: true,
        webhookUrl: true,
        payload: true,
    })

    const [rows, setRows] = useState<WebhookDataRowType[]>()

    const history = useHistory()
    const [webhookAttribute, setWebhookAttribute] = useState({})
    const fetchWebhookData = async () => {
        setForm((prev) => ({ ...prev, isLoading: true }))
        try {
            // Fetch webhook configuration
            const response = await getWebhookConfiguration(webhookConfigId)
            const { header = {}, payload = '' } = response?.result || {}
            const headers = Object.entries(header || {}).map(([key, value]) => ({
                key,
                value,
            }))
            // Update form state with response data
            setForm((prev) => ({
                ...prev,
                ...response?.result,
                header: headers,
                payload,
                isLoading: false,
            }))

            // Fetch webhook attributes
            const attributesResponse = await getWebhookAttributes()
            setWebhookAttribute(attributesResponse?.result || {})
        } catch (error) {
            // Show error message and reset loading state
            showError(error)
            setForm((prev) => ({ ...prev, isLoading: false }))
        }
    }

    useEffect(() => {
        if (webhookConfigId) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            fetchWebhookData()
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

    const validateField = (field, value) => {
        let isValidField = true
        if (field !== ConfigurationFieldKeys.PAYLOAD) {
            isValidField = value.trim().length > 0
        } else {
            try {
                JSON.parse(value)
            } catch {
                isValidField = false
            }
        }
        setIsValid((prev) => ({ ...prev, [field]: isValidField }))
    }

    const handleInputChange = (field) => (event) => {
        const { value } = event.target
        setForm((prev) => ({ ...prev, [field]: value }))
        if (field !== ConfigurationFieldKeys.PAYLOAD) {
            validateField(field, value)
        }
    }

    const handlePayloadChange = (value) => {
        setForm((prev) => ({ ...prev, payload: value }))
        validateField(ConfigurationFieldKeys.PAYLOAD, value)
    }

    const renderDataList = () => (
        <div className="flexbox-col flex-grow-1 dc__overflow-auto dc__gap-8">
            {Object.keys(webhookAttribute).map((attribute, index) => (
                <div
                    className="dc__visible-hover dc__visible-hover--parent w-100-imp cn-8 flexbox data-container hover-trigger dc__gap-6"
                    data-testid={`${webhookAttribute[attribute]}-${index}`}
                    key={`${attribute}`}
                >
                    <p className="bcn-1 br-6 fs-14 lh-20 px-4 dc__ff-monospace m-0">{webhookAttribute[attribute]}</p>
                    <div className="flex dc__visible-hover--child">
                        <ClipboardButton content={webhookAttribute[attribute]} />
                    </div>
                </div>
            ))}
        </div>
    )

    const renderConfigureLinkInfoColumn = () => (
        <div
            className="h-100 w-280 flexbox-col left mh-0 p-16 dc__overflow-scroll dc__gap-16 fs-13"
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

    const onSaveSES = () => {
        onSaveSuccess()
        closeWebhookConfig()
    }

    const saveWebhookConfig = async () => {
        setForm((prev) => ({ ...prev, isLoading: true }))

        if (!Object.values(isValid).every((v) => v)) {
            setForm((prev) => ({ ...prev, isLoading: false, isError: true }))
            return
        }

        try {
            const requestBody = {
                ...form,
                id: webhookConfigId || 0,
            }
            await saveUpdateWebhookConfiguration(requestBody)
            ToastManager.showToast({ variant: ToastVariantType.success, description: 'Saved Successfully' })
            onSaveSES()
        } catch (error) {
            showError(error)
        } finally {
            setForm((prev) => ({ ...prev, isLoading: false }))
        }
    }

    const renderWebhookModal = () => (
        <div className="flexbox h-100 cn-9 w-100 mh-0">
            <div className="w-600 p-20 flex-grow-1 flexbox-col mh-0 dc__overflow-auto dc__gap-16 dc__border-right">
                <CustomInput
                    label="Configuration name"
                    value={form.configName}
                    onChange={handleInputChange('configName')}
                    placeholder="Enter name"
                    error={!isValid.configName && REQUIRED_FIELD_MSG}
                    name={ConfigurationFieldKeys.CONFIG_NAME}
                    dataTestid="webhook-modal__name"
                    isRequiredField
                />
                <CustomInput
                    label="Webhook URL"
                    value={form.webhookUrl}
                    onChange={handleInputChange('webhookUrl')}
                    placeholder="Enter Incoming Webhook URL"
                    error={!isValid.webhookUrl && REQUIRED_FIELD_MSG}
                    name={ConfigurationFieldKeys.WEBHOOK_URL}
                    dataTestid="webhook-modal__url"
                    isRequiredField
                />
                <WebhookConfigDynamicDataTable headers={form.header} rows={rows} setRows={setRows} />

                <div className="flexbox-col dc__gap-6">
                    <div className="fs-13 cn-7 lh-20 dc__required-field">Data to be shared through webhook</div>
                    <div className="en-2 bw-1 br-4 p-6">
                        <CodeEditor
                            value={form.payload}
                            mode="json"
                            onChange={handlePayloadChange}
                            inline
                            height={150}
                        />
                    </div>
                    {!isValid.payload && <span className="form__error">Invalid JSON</span>}
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
