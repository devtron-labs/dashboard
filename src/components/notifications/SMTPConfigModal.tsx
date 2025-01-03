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
import { useState, useEffect, useCallback } from 'react'
import {
    showError,
    Progressing,
    Checkbox,
    Drawer,
    CustomInput,
    CHECKBOX_VALUE,
    ToastManager,
    ToastVariantType,
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
} from '@devtron-labs/devtron-fe-common-lib'
import { useHistory } from 'react-router-dom'
import { validateEmail } from '../common'
import { getSMTPConfiguration, saveEmailConfiguration } from './notifications.service'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ViewType } from '../../config/constants'
import { ProtectedInput } from '../globalConfigurations/GlobalConfiguration'
import { REQUIRED_FIELD_MSG } from '../../config/constantMessaging'
import { ConfigurationsTabTypes } from './constants'
import { SMTPConfigModalProps } from './types'

export const SMTPConfigModal = ({
    smtpConfigId,
    shouldBeDefault,
    closeSMTPConfigModal,
    onSaveSuccess,
    selectSMTPFromChild,
}: SMTPConfigModalProps) => {
    const history = useHistory()

    const [view, setView] = useState(ViewType.LOADING)
    const [form, setForm] = useState({
        configName: '',
        port: null,
        host: '',
        authUser: '',
        authPassword: '',
        fromEmail: '',
        default: shouldBeDefault,
        isLoading: false,
        isError: true,
    })
    const [isValid, setIsValid] = useState({
        configName: true,
        port: true,
        host: true,
        authUser: true,
        authPassword: true,
        fromEmail: true,
    })

    const resetValidation = () => {
        setIsValid({
            configName: true,
            port: true,
            host: true,
            authUser: true,
            authPassword: true,
            fromEmail: true,
        })
    }
    useEffect(() => {
        if (smtpConfigId) {
            getSMTPConfiguration(smtpConfigId)
                .then((response) => {
                    setForm({ ...response.result, isLoading: false, isError: true })
                    setView(ViewType.FORM)
                    resetValidation()
                })
                .catch(showError)
        } else {
            setForm((prevForm) => ({ ...prevForm, default: shouldBeDefault }))
            setView(ViewType.FORM)
        }
    }, [smtpConfigId, shouldBeDefault])

    const handleBlur = (e) => {
        const { name, value } = e.target
        setIsValid((prevValid) => ({ ...prevValid, [name]: !!value.length }))
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setForm((prevForm) => ({ ...prevForm, [name]: value }))
        setIsValid((prevValid) => ({ ...prevValid, [name]: !!value.length }))
    }

    const handleCheckbox = () => {
        setForm((prevForm) => ({ ...prevForm, default: !prevForm.default }))
    }

    const validateForm = useCallback(() => {
        const allValid = Object.keys(isValid).every((key) => isValid[key])
        return allValid && validateEmail(form.fromEmail)
    }, [isValid, form.fromEmail])

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
        if (!validateForm()) {
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

    const renderWithBackdrop = (body) => (
        <Drawer position="right">
            <div className="h-100 modal__body modal__body--w-600 modal__body--p-0 dc__no-border-radius mt-0 flex-grow-1 flexbox-col">
                <div className="h-48 flex flex-align-center dc__border-bottom flex-justify bcn-0 pb-12 pt-12 pl-20 pr-20">
                    <h1 className="fs-16 fw-6 lh-1-43 m-0 title-padding">Configure SMTP</h1>
                    <Button
                        ariaLabel="close-button"
                        icon={<Close />}
                        style={ButtonStyleType.negativeGrey}
                        size={ComponentSizeType.small}
                        onClick={closeSMTPConfig}
                        dataTestId="add-ses-close-button"
                        showAriaLabelInTippy={false}
                        variant={ButtonVariantType.borderLess}
                    />
                </div>
                {body}
            </div>
        </Drawer>
    )

    const renderSMTPFooter = () => (
        <div className="form__button-group-bottom flex right dc__gap-16">
            <Button
                dataTestId="ses-config-modal-close-button"
                size={ComponentSizeType.medium}
                onClick={closeSMTPConfig}
                text="Cancel"
                disabled={form.isLoading}
                variant={ButtonVariantType.secondary}
                style={ButtonStyleType.neutral}
            />
            <Button
                dataTestId="add-ses-save-button"
                size={ComponentSizeType.medium}
                onClick={saveSMTPConfig}
                text="Save"
                isLoading={form.isLoading}
            />
        </div>
    )

    const renderForm = () => (
        <div className="flexbox-col flex-grow-1 h-100 h-100">
            <div className="dc__gap-16 flex-grow-1 flexbox-col mh-0 p-20 dc__overflow-auto">
                {['configName', 'host', 'port', 'authUser'].map((field, index) => (
                    <div key="field">
                        <CustomInput
                            name={field}
                            label={field === 'configName' ? 'Configuration name' : `SMTP ${field}`}
                            value={form[field]}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            placeholder={`Enter ${field}`}
                            isRequiredField
                            error={!isValid[field] && REQUIRED_FIELD_MSG}
                            tabIndex={index + 1}
                        />
                    </div>
                ))}
                <div className="smtp-protected-input">
                    <ProtectedInput
                        dataTestid="add-smtp-password"
                        name="authPassword"
                        value={form.authPassword}
                        onChange={handleInputChange}
                        error={!isValid.authPassword}
                        label="SMTP Password *"
                        labelClassName="form__label--fs-13 mb-8 fw-5 fs-13"
                        placeholder="Enter SMTP password"
                    />
                </div>

                <CustomInput
                    type="email"
                    name="fromEmail"
                    label="Send email from"
                    value={form.fromEmail}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Email"
                    isRequiredField
                    error={!isValid.fromEmail && REQUIRED_FIELD_MSG}
                />
                <Checkbox
                    isChecked={form.default}
                    value={CHECKBOX_VALUE.CHECKED}
                    disabled={shouldBeDefault}
                    onChange={handleCheckbox}
                >
                    Set as default configuration to send emails
                </Checkbox>
            </div>
            {renderSMTPFooter()}
        </div>
    )

    return renderWithBackdrop(view === ViewType.LOADING ? <Progressing pageLoader /> : renderForm())
}
