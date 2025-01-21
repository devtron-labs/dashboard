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
import { showError, CustomInput, ToastManager, ToastVariantType } from '@devtron-labs/devtron-fe-common-lib'
import { useHistory } from 'react-router-dom'
import { getSMTPConfiguration, saveEmailConfiguration } from './notifications.service'
import { ProtectedInput } from '../globalConfigurations/GlobalConfiguration'
import { ConfigurationFieldKeys, ConfigurationsTabTypes, DefaultSMTPValidation } from './constants'
import { SMTPConfigModalProps, SMTPFormType } from './types'
import { ConfigurationTabDrawerModal } from './ConfigurationDrawerModal'
import {
    getSMTPDefaultConfiguration,
    getValidationFormConfig,
    renderErrorToast,
    validateKeyValueConfig,
} from './notifications.util'
import { DefaultCheckbox } from './DefaultCheckbox'

export const SMTPConfigModal = ({
    smtpConfigId,
    shouldBeDefault,
    closeSMTPConfigModal,
    onSaveSuccess,
    selectSMTPFromChild,
}: SMTPConfigModalProps) => {
    const history = useHistory()

    const [form, setForm] = useState<SMTPFormType>(getSMTPDefaultConfiguration(shouldBeDefault))
    const [isFormValid, setFormValid] = useState(DefaultSMTPValidation)

    const fetchSMTPConfig = async () => {
        setForm((prevForm) => ({ ...prevForm, isLoading: true }))
        try {
            const response = await getSMTPConfiguration(smtpConfigId)
            setForm({
                ...response.result,
                isLoading: false,
                port: response.result.port.toString(),
            })
            setFormValid(DefaultSMTPValidation)
        } catch (error) {
            showError(error)
            setForm((prevForm) => ({ ...prevForm, isLoading: false }))
        }
    }

    useEffect(() => {
        if (smtpConfigId) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            fetchSMTPConfig()
        } else {
            setForm((prevForm) => ({ ...prevForm, default: shouldBeDefault }))
        }
    }, [smtpConfigId])

    const handleBlur = (e) => {
        const { name, value } = e.target
        setFormValid((prevValid) => ({ ...prevValid, [name]: validateKeyValueConfig(name, value) }))
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setForm((prevForm) => ({ ...prevForm, [name]: value }))
        setFormValid((prevValid) => ({ ...prevValid, [name]: validateKeyValueConfig(name, value) }))
    }

    const handleCheckbox = () => {
        setForm((prevForm) => ({ ...prevForm, default: !prevForm.default }))
    }

    const closeSMTPConfig = () => {
        if (typeof closeSMTPConfigModal === 'function') {
            closeSMTPConfigModal()
        } else {
            const newParams = {
                modal: ConfigurationsTabTypes.SMTP,
            }
            history.push({
                search: new URLSearchParams(newParams).toString(),
            })
        }
    }

    const validateSave = (): boolean => {
        const formConfig = [
            { key: ConfigurationFieldKeys.CONFIG_NAME, value: form.configName },
            { key: ConfigurationFieldKeys.HOST, value: form.host },
            { key: ConfigurationFieldKeys.PORT, value: form.port },
            { key: ConfigurationFieldKeys.AUTH_USER, value: form.authUser },
            { key: ConfigurationFieldKeys.AUTH_PASSWORD, value: form.authPassword },
            { key: ConfigurationFieldKeys.FROM_EMAIL, value: form.fromEmail },
        ]

        const { allValid, formValidations } = getValidationFormConfig(formConfig)
        setFormValid((prevValid) => ({ ...prevValid, ...formValidations }))
        return allValid
    }

    const saveSMTPConfig = async () => {
        if (!validateSave()) {
            renderErrorToast()
            return
        }
        setForm((prevForm) => ({ ...prevForm, isLoading: true }))

        const payload = {
            channel: ConfigurationsTabTypes.SMTP,
            configs: [
                {
                    configName: form.configName,
                    host: form.host,
                    port: form.port,
                    authUser: form.authUser,
                    authPassword: form.authPassword,
                    fromEmail: form.fromEmail,
                    default: form.default,
                    id: smtpConfigId,
                },
            ],
        }

        try {
            const response = await saveEmailConfiguration(payload)
            setForm((prevForm) => ({ ...prevForm, isLoading: false }))
            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: 'Saved Successfully',
            })
            onSaveSuccess()
            closeSMTPConfig()
            if (selectSMTPFromChild) {
                selectSMTPFromChild(response?.result[0])
            }
        } catch (error) {
            showError(error)
            setForm((prevForm) => ({ ...prevForm, isLoading: false }))
        }
    }

    const renderForm = () => (
        <div className="dc__gap-16 flex-grow-1 flexbox-col mh-0 p-20 dc__overflow-auto mh-0">
            <CustomInput
                dataTestid={`add-smtp-${ConfigurationFieldKeys.CONFIG_NAME}`}
                name={ConfigurationFieldKeys.CONFIG_NAME}
                label="Configuration name"
                value={form.configName}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Enter a name"
                isRequiredField
                error={isFormValid[ConfigurationFieldKeys.CONFIG_NAME].message}
                autoFocus
            />
            <CustomInput
                dataTestid={`add-smtp-${ConfigurationFieldKeys.PORT}`}
                name={ConfigurationFieldKeys.PORT}
                label="SMTP Port"
                value={form.port}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Enter SMTP port"
                isRequiredField
                error={isFormValid[ConfigurationFieldKeys.PORT].message}
            />
            <CustomInput
                dataTestid={`add-smtp-${ConfigurationFieldKeys.HOST}`}
                name={ConfigurationFieldKeys.HOST}
                label="SMTP Host address/Server"
                value={form.host}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Eg. smtp.gmail.com"
                isRequiredField
                error={isFormValid[ConfigurationFieldKeys.HOST].message}
            />

            <CustomInput
                dataTestid={`add-smtp-${ConfigurationFieldKeys.AUTH_USER}`}
                name={ConfigurationFieldKeys.AUTH_USER}
                label="SMTP Username"
                value={form.authUser}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Enter SMTP username"
                isRequiredField
                error={isFormValid[ConfigurationFieldKeys.AUTH_USER].message}
            />
            <div className="smtp-protected-input">
                <ProtectedInput
                    dataTestid="add-smtp-password"
                    name={ConfigurationFieldKeys.AUTH_PASSWORD}
                    value={form.authPassword}
                    onChange={handleInputChange}
                    error={isFormValid[ConfigurationFieldKeys.AUTH_PASSWORD].message}
                    label="SMTP Password"
                    labelClassName="form__label--fs-13 mb-8 fw-5 fs-13"
                    placeholder="Enter SMTP password"
                    isRequiredField
                    tabIndex={0}
                    onBlur={handleBlur}
                />
            </div>
            <CustomInput
                dataTestid="add-smtp-from-email"
                type="email"
                name={ConfigurationFieldKeys.FROM_EMAIL}
                label="Send email from"
                value={form.fromEmail}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Enter sender’s email"
                isRequiredField
                error={isFormValid[ConfigurationFieldKeys.FROM_EMAIL].message}
            />
            <DefaultCheckbox
                isDefaultDisable={shouldBeDefault}
                handleCheckbox={handleCheckbox}
                isDefault={form.default}
            />
        </div>
    )

    return (
        <ConfigurationTabDrawerModal
            renderContent={renderForm}
            closeModal={closeSMTPConfig}
            modal={ConfigurationsTabTypes.SMTP}
            isLoading={form.isLoading}
            saveConfigModal={saveSMTPConfig}
        />
    )
}
