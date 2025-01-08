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
import { SMTPConfigModalProps } from './types'
import { ConfigurationTabDrawerModal } from './ConfigurationDrawerModal'
import { getFormValidated, getSMTPDefaultConfiguration, validateKeyValueConfig } from './notifications.util'
import { DefaultCheckbox } from './DefaultCheckbox'

export const SMTPConfigModal = ({
    smtpConfigId,
    shouldBeDefault,
    closeSMTPConfigModal,
    onSaveSuccess,
    selectSMTPFromChild,
}: SMTPConfigModalProps) => {
    const history = useHistory()

    const [form, setForm] = useState(getSMTPDefaultConfiguration(shouldBeDefault))
    const [isFormValid, setFormValid] = useState(DefaultSMTPValidation)

    useEffect(() => {
        if (smtpConfigId) {
            getSMTPConfiguration(smtpConfigId)
                .then((response) => {
                    setForm({
                        ...response.result,
                        isLoading: false,
                        isError: true,
                        port: response.result.port.toString(),
                    })
                    setFormValid(DefaultSMTPValidation)
                })
                .catch(showError)
        } else {
            setForm((prevForm) => ({ ...prevForm, default: shouldBeDefault }))
        }
    }, [smtpConfigId, shouldBeDefault])

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

    const getAllFieldsValidated = () => {
        const { configName, host, port, authUser, authPassword, fromEmail } = form
        return (
            !!configName &&
            !!host &&
            !!port &&
            !!authUser &&
            !!authPassword &&
            !!fromEmail &&
            getFormValidated(isFormValid, fromEmail)
        )
    }

    const saveSMTPConfig = () => {
        if (!getAllFieldsValidated()) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Some required fields are missing or Invalid',
            })
            setFormValid((prevValid) => ({
                ...prevValid,
                configName: validateKeyValueConfig(ConfigurationFieldKeys.CONFIG_NAME, form.configName),
                host: validateKeyValueConfig(ConfigurationFieldKeys.HOST, form.host),
                port: validateKeyValueConfig(ConfigurationFieldKeys.PORT, form.port),
                authUser: validateKeyValueConfig(ConfigurationFieldKeys.AUTH_USER, form.authUser),
                authPassword: validateKeyValueConfig(ConfigurationFieldKeys.AUTH_PASSWORD, form.authPassword),
                fromEmail: validateKeyValueConfig(ConfigurationFieldKeys.FROM_EMAIL, form.fromEmail),
            }))
            setForm((prevForm) => ({ ...prevForm, isLoading: false, isError: true }))
            return
        }

        setForm((prevForm) => ({ ...prevForm, isLoading: true, isError: false }))

        saveEmailConfiguration(form, ConfigurationsTabTypes.SMTP)
            .then((response) => {
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
            })
            .catch((error) => {
                showError(error)
                setForm((prevForm) => ({ ...prevForm, isLoading: false }))
            })
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
                error={isFormValid.configName.message}
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
                error={isFormValid.port.message}
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
                error={isFormValid.host.message}
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
                error={isFormValid.authUser.message}
            />
            <div className="smtp-protected-input">
                <ProtectedInput
                    dataTestid="add-smtp-password"
                    name={ConfigurationFieldKeys.AUTH_PASSWORD}
                    value={form.authPassword}
                    onChange={handleInputChange}
                    error={isFormValid.authPassword.message}
                    label="SMTP Password"
                    labelClassName="form__label--fs-13 mb-8 fw-5 fs-13"
                    placeholder="Enter SMTP password"
                    isRequiredField
                    tabIndex={0}
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
                error={isFormValid.fromEmail.message}
            />
            <DefaultCheckbox
                shouldBeDefault={shouldBeDefault}
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
