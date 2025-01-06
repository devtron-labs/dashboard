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
    Checkbox,
    CustomInput,
    CHECKBOX_VALUE,
    ToastManager,
    ToastVariantType,
} from '@devtron-labs/devtron-fe-common-lib'
import { useHistory } from 'react-router-dom'
import { getSMTPConfiguration, saveEmailConfiguration } from './notifications.service'
import { ProtectedInput } from '../globalConfigurations/GlobalConfiguration'
import { ConfigurationsTabTypes, DefaultSMTPValidation, SESFieldKeys, SMTPFieldKeys } from './constants'
import { SMTPConfigModalProps } from './types'
import { ConfigurationTabDrawerModal } from './ConfigurationDrawerModal'
import { getFormValidated, getSMTPDefaultConfiguration, validateKeyValueConfig } from './notifications.util'

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

    const saveSMTPConfig = () => {
        if (!getFormValidated(isFormValid, form.fromEmail)) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Some required fields are missing or Invalid',
            })
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
        <div className="dc__gap-16 flex-grow-1 flexbox-col mh-0 p-20 dc__overflow-auto">
            {[SMTPFieldKeys.CONFIG_NAME, SMTPFieldKeys.HOST, SMTPFieldKeys.PORT, SMTPFieldKeys.AUTH_USER].map(
                (field, index) => (
                    <div key={field}>
                        <CustomInput
                            name={field}
                            label={field === SMTPFieldKeys.CONFIG_NAME ? 'Configuration name' : `SMTP ${field}`}
                            value={form[field] as string}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            placeholder={`Enter ${field}`}
                            isRequiredField
                            error={isFormValid[field].message}
                            tabIndex={index + 1}
                        />
                    </div>
                ),
            )}
            <div className="smtp-protected-input">
                <ProtectedInput
                    dataTestid="add-smtp-password"
                    name={SMTPFieldKeys.AUTH_PASSWORD}
                    value={form.authPassword}
                    onChange={handleInputChange}
                    error={isFormValid.authPassword.message}
                    label="SMTP Password *"
                    labelClassName="form__label--fs-13 mb-8 fw-5 fs-13"
                    placeholder="Enter SMTP password"
                />
            </div>

            <CustomInput
                type="email"
                name={SESFieldKeys.FROM_EMAIL}
                label="Send email from"
                value={form.fromEmail}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Email"
                isRequiredField
                error={isFormValid.fromEmail.message}
            />
            <Checkbox
                isChecked={form.default}
                value={CHECKBOX_VALUE.CHECKED}
                disabled={shouldBeDefault}
                onChange={handleCheckbox}
                name={SMTPFieldKeys.DEFAULT}
            >
                Set as default configuration to send emails
            </Checkbox>
        </div>
    )

    return (
        <ConfigurationTabDrawerModal
            renderContent={renderForm}
            closeModal={closeSMTPConfig}
            modal={ConfigurationsTabTypes.SMTP}
            isLoading={form.isLoading}
            saveConfigModal={saveSMTPConfig}
            disableSave={!getFormValidated(isFormValid, form.fromEmail)}
        />
    )
}
