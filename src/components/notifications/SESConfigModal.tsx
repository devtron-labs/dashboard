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

import React, { useEffect, useState } from 'react'
import {
    showError,
    Progressing,
    Checkbox,
    Drawer,
    CustomInput,
    CHECKBOX_VALUE,
    ToastManager,
    ToastVariantType,
    SelectPicker,
    ComponentSizeType,
    Button,
    ButtonStyleType,
    ButtonVariantType,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Close } from '@Icons/ic-close.svg'
import { ReactComponent as Error } from '@Icons/ic-warning.svg'
import { useHistory } from 'react-router-dom'
import { saveEmailConfiguration, getSESConfiguration } from './notifications.service'
import { validateEmail } from '../common'
import awsRegionList from '../common/awsRegionList.json'
import { REQUIRED_FIELD_MSG } from '../../config/constantMessaging'
import { SESConfigModalProps } from './types'
import { getSESDefaultConfiguration } from './notifications.util'
import { ConfigurationsTabTypes, DEFAULT_MASKED_SECRET_KEY, DefaultSESValidationKeys, SESFieldKeys } from './constants'

const SESConfigModal = ({
    sesConfigId,
    shouldBeDefault,
    selectSESFromChild,
    onSaveSuccess,
    closeSESConfigModal,
}: SESConfigModalProps) => {
    const awsRegionListParsed = awsRegionList.map((region) => ({ label: region.name, value: region.value }))
    const history = useHistory()

    const [form, setForm] = useState(getSESDefaultConfiguration(shouldBeDefault))
    const [isValid, setValid] = useState(DefaultSESValidationKeys)

    const fetchSESConfiguration = async () => {
        setForm((prevForm) => ({ ...prevForm, isLoading: true }))
        try {
            const response = await getSESConfiguration(sesConfigId)
            const { region } = response.result
            const awsRegion = awsRegionListParsed.find((r) => r.value === region)

            setForm({
                ...response.result,
                isLoading: false,
                isError: true,
                region: awsRegion,
                secretKey: DEFAULT_MASKED_SECRET_KEY, // Masked secretKey for security
            })
            setValid(DefaultSESValidationKeys)
        } catch (error) {
            showError(error)
            setForm((prevForm) => ({ ...prevForm, isLoading: false }))
        }
    }

    useEffect(() => {
        if (sesConfigId) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            fetchSESConfiguration()
        }
    }, [sesConfigId])

    const handleBlur = (event: React.ChangeEvent<HTMLInputElement>, key: keyof typeof form): void => {
        const { value } = event.target
        setValid((prevValid) => ({
            ...prevValid,
            [key]: key === SESFieldKeys.REGION ? !!form.region.value.length : !!value.length,
        }))
    }

    const handleInputChange = (key, selected) => {
        if (key === SESFieldKeys.REGION) {
            setForm((prevForm) => ({
                ...prevForm,
                [key]: { label: selected.label, value: selected.value },
            }))
        }
        setForm((prevForm) => ({
            ...prevForm,
            [key]: selected,
        }))
        setValid((prevValid) => ({
            ...prevValid,
            [key]: !!selected,
        }))
    }

    const handleAWSRegionChange = (selected): void => {
        handleInputChange(SESFieldKeys.REGION, selected)
    }

    const handleCheckbox = (): void => {
        setForm((prevForm) => ({
            ...prevForm,
            default: !prevForm.default,
        }))
    }

    const getPayload = () => ({
        ...form,
        region: form.region.value,
    })

    const closeSESConfig = () => {
        if (typeof closeSESConfigModal === 'function') {
            closeSESConfigModal()
        } else {
            const newParams = {
                modal: ConfigurationsTabTypes.SES,
            }
            history.push({
                search: new URLSearchParams(newParams).toString(),
            })
        }
    }

    const onSaveSES = () => {
        onSaveSuccess()
        closeSESConfig()
    }

    const saveSESConfig = async () => {
        setForm((prevForm) => ({
            ...prevForm,
            isLoading: true,
            isError: false,
        }))
        const isFormValid = Object.keys(isValid).every((key) => isValid[key]) && validateEmail(form.fromEmail)

        if (!isFormValid) {
            setForm((prevForm) => ({
                ...prevForm,
                isLoading: false,
                isError: true,
            }))
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Some required fields are missing or Invalid',
            })
            return
        }

        try {
            const response = await saveEmailConfiguration(getPayload(), ConfigurationsTabTypes.SES)
            onSaveSES()
            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: 'Saved Successfully',
            })
            if (selectSESFromChild) selectSESFromChild(response?.result[0])
        } catch (error) {
            showError(error)
        } finally {
            setForm((prevForm) => ({ ...prevForm, isLoading: false }))
        }
    }

    const renderSESFooter = () => (
        <div className="form__button-group-bottom flex right dc__gap-16">
            <Button
                dataTestId="ses-config-modal-close-button"
                size={ComponentSizeType.medium}
                onClick={closeSESConfig}
                text="Cancel"
                disabled={form.isLoading}
                variant={ButtonVariantType.secondary}
                style={ButtonStyleType.neutral}
            />
            <Button
                dataTestId="add-ses-save-button"
                size={ComponentSizeType.medium}
                onClick={saveSESConfig}
                text="Save"
                isLoading={form.isLoading}
            />
        </div>
    )

    const renderSESContent = () => (
        <div className="flexbox-col flex-grow-1 h-100">
            <div className="dc__gap-16 flex-grow-1 flexbox-col mh-0 p-20 dc__overflow-auto">
                <CustomInput
                    label="Configuration Name"
                    data-testid="add-ses-configuration-name"
                    name="configName"
                    value={form.configName}
                    onChange={(e) => handleInputChange(SESFieldKeys.CONFIG_NAME, e.target.value)}
                    onBlur={(event) => handleBlur(event, SESFieldKeys.CONFIG_NAME)}
                    placeholder="Configuration name"
                    autoFocus
                    isRequiredField
                    error={!isValid.configName && REQUIRED_FIELD_MSG}
                />
                <CustomInput
                    data-testid="add-ses-access-key"
                    label="Access Key ID"
                    name="app-name"
                    value={form.accessKey}
                    onChange={(e) => handleInputChange(SESFieldKeys.ACCESS_KEY, e.target.value)}
                    onBlur={(event) => handleBlur(event, SESFieldKeys.ACCESS_KEY)}
                    placeholder="Access Key ID"
                    isRequiredField
                    error={!isValid.accessKey && REQUIRED_FIELD_MSG}
                />
                <CustomInput
                    label="Secret Access Key"
                    data-testid="add-ses-secret-access-key"
                    name="app-name"
                    value={form.secretKey}
                    onChange={(e) => handleInputChange(SESFieldKeys.SECRET_KEY, e.target.value)}
                    onBlur={(event) => handleBlur(event, SESFieldKeys.SECRET_KEY)}
                    placeholder="Secret Access Key"
                    isRequiredField
                    error={!isValid.secretKey && REQUIRED_FIELD_MSG}
                />
                <div className="">
                    <SelectPicker
                        inputId="aws-region"
                        label="AWS Region"
                        classNamePrefix="add-ses-aws-region"
                        required
                        value={form.region}
                        placeholder="Select AWS Region"
                        onBlur={(event) => handleBlur(event, SESFieldKeys.REGION)}
                        onChange={(selected) => handleAWSRegionChange(selected)}
                        options={awsRegionListParsed}
                        size={ComponentSizeType.large}
                    />
                    <span className="form__error">
                        {!isValid.region ? (
                            <>
                                <Error className="form__icon form__icon--error" />
                                {REQUIRED_FIELD_MSG} <br />
                            </>
                        ) : null}
                    </span>
                </div>
                <CustomInput
                    label="Send email from"
                    data-testid="add-ses-send-email"
                    type="email"
                    name="app-name"
                    value={form.fromEmail}
                    onBlur={(event) => handleBlur(event, SESFieldKeys.FROM_EMAIL)}
                    placeholder="Email"
                    onChange={(e) => handleInputChange(SESFieldKeys.FROM_EMAIL, e.target.value)}
                    isRequiredField
                    error={!isValid.fromEmail && REQUIRED_FIELD_MSG}
                    helperText="This email must be verified with SES."
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

            {renderSESFooter()}
        </div>
    )

    const renderLoadingState = () => (
        <div className="h-100">
            <Progressing pageLoader />
        </div>
    )
    return (
        <Drawer position="right">
            <div className="h-100 modal__body modal__body--w-600 modal__body--p-0 dc__no-border-radius mt-0 flex-grow-1 flexbox-col">
                <div className="h-48 flex flex-align-center dc__border-bottom flex-justify bcn-0 pb-12 pt-12 pl-20 pr-20">
                    <h1 className="fs-16 fw-6 lh-1-43 m-0 title-padding">Configure SES</h1>
                    <Button
                        ariaLabel="close-button"
                        icon={<Close />}
                        style={ButtonStyleType.negativeGrey}
                        size={ComponentSizeType.small}
                        onClick={closeSESConfig}
                        dataTestId="add-ses-close-button"
                        showAriaLabelInTippy={false}
                        variant={ButtonVariantType.borderLess}
                    />
                </div>
                {form.isLoading ? renderLoadingState() : renderSESContent()}
            </div>
        </Drawer>
    )
}

export default SESConfigModal
