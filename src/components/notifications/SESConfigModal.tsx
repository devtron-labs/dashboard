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
    Checkbox,
    CustomInput,
    CHECKBOX_VALUE,
    ToastManager,
    ToastVariantType,
    SelectPicker,
    ComponentSizeType,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Error } from '@Icons/ic-warning.svg'
import { useHistory } from 'react-router-dom'
import { saveEmailConfiguration, getSESConfiguration } from './notifications.service'
import awsRegionList from '../common/awsRegionList.json'
import { SESConfigModalProps } from './types'
import { getFormValidated, getSESDefaultConfiguration, validateKeyValueConfig } from './notifications.util'
import {
    ConfigurationFieldKeys,
    ConfigurationsTabTypes,
    DEFAULT_MASKED_SECRET_KEY,
    DefaultSESValidations,
} from './constants'
import { ConfigurationTabDrawerModal } from './ConfigurationDrawerModal'

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
    const [isFormValid, setFormValid] = useState(DefaultSESValidations)

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
            setFormValid(DefaultSESValidations)
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

    const handleBlur = (event: React.ChangeEvent<HTMLInputElement>, key: ConfigurationFieldKeys): void => {
        const { value } = event.target
        setFormValid((prevValid) => ({
            ...prevValid,
            [key]:
                key === ConfigurationFieldKeys.REGION ? !!form.region.value.length : validateKeyValueConfig(key, value),
        }))
    }

    const handleInputChange = (key: ConfigurationFieldKeys, selected) => {
        if (key === ConfigurationFieldKeys.REGION) {
            setForm((prevForm) => ({
                ...prevForm,
                [key]: { label: selected.label, value: selected.value },
            }))
        }
        setForm((prevForm) => ({
            ...prevForm,
            [key]: selected,
        }))
        setFormValid((prevValid) => ({
            ...prevValid,
            [key]: validateKeyValueConfig(key, selected),
        }))
    }

    const handleAWSRegionChange = (selected): void => {
        handleInputChange(ConfigurationFieldKeys.REGION, selected)
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
            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: 'Saved Successfully',
            })
            if (selectSESFromChild) selectSESFromChild(response?.result[0])
            onSaveSES()
        } catch (error) {
            showError(error)
        } finally {
            setForm((prevForm) => ({ ...prevForm, isLoading: false }))
        }
    }

    const renderSESContent = () => (
        <div className="dc__gap-16 flex-grow-1 flexbox-col mh-0 p-20 dc__overflow-auto">
            <CustomInput
                label="Configuration Name"
                data-testid="add-ses-configuration-name"
                name={ConfigurationFieldKeys.CONFIG_NAME}
                value={form.configName}
                onChange={(e) => handleInputChange(ConfigurationFieldKeys.CONFIG_NAME, e.target.value)}
                onBlur={(event) => handleBlur(event, ConfigurationFieldKeys.CONFIG_NAME)}
                placeholder="Configuration name"
                autoFocus
                isRequiredField
                error={isFormValid.configName.message}
            />
            <CustomInput
                label="Access Key ID"
                data-testid="add-ses-access-key"
                name={ConfigurationFieldKeys.ACCESS_KEY}
                value={form.accessKey}
                onChange={(e) => handleInputChange(ConfigurationFieldKeys.ACCESS_KEY, e.target.value)}
                onBlur={(event) => handleBlur(event, ConfigurationFieldKeys.ACCESS_KEY)}
                placeholder="Access Key ID"
                isRequiredField
                error={isFormValid.accessKey.message}
            />
            <CustomInput
                label="Secret Access Key"
                data-testid="add-ses-secret-access-key"
                name={ConfigurationFieldKeys.SECRET_KEY}
                value={form.secretKey}
                onChange={(e) => handleInputChange(ConfigurationFieldKeys.SECRET_KEY, e.target.value)}
                onBlur={(event) => handleBlur(event, ConfigurationFieldKeys.SECRET_KEY)}
                placeholder="Secret Access Key"
                isRequiredField
                error={isFormValid.secretKey.message}
            />
            <div>
                <SelectPicker
                    inputId="aws-region"
                    label="AWS Region"
                    classNamePrefix="add-ses-aws-region"
                    required
                    value={form.region}
                    placeholder="Select AWS Region"
                    onBlur={(event) => handleBlur(event, ConfigurationFieldKeys.REGION)}
                    onChange={(selected) => handleAWSRegionChange(selected)}
                    options={awsRegionListParsed}
                    size={ComponentSizeType.large}
                    name={ConfigurationFieldKeys.REGION}
                />
                <span className="form__error">
                    {isFormValid.region?.message ? (
                        <>
                            <Error className="form__icon form__icon--error" />
                            {isFormValid.region.message}
                        </>
                    ) : null}
                </span>
            </div>
            <CustomInput
                label="Send email from"
                data-testid="add-ses-send-email"
                type="email"
                name={ConfigurationFieldKeys.FROM_EMAIL}
                value={form.fromEmail}
                onBlur={(event) => handleBlur(event, ConfigurationFieldKeys.FROM_EMAIL)}
                placeholder="Email"
                onChange={(e) => handleInputChange(ConfigurationFieldKeys.FROM_EMAIL, e.target.value)}
                isRequiredField
                error={isFormValid.fromEmail.message}
                helperText="This email must be verified with SES."
            />
            <Checkbox
                isChecked={form.default}
                value={CHECKBOX_VALUE.CHECKED}
                disabled={shouldBeDefault}
                onChange={handleCheckbox}
                data-testid="add-ses-default-checkbox"
                name="default"
            >
                Set as default configuration to send emails
            </Checkbox>
        </div>
    )

    return (
        <ConfigurationTabDrawerModal
            renderContent={renderSESContent}
            closeModal={closeSESConfig}
            modal={ConfigurationsTabTypes.SES}
            isLoading={form.isLoading}
            saveConfigModal={saveSESConfig}
            disableSave={!getFormValidated(isFormValid, form.fromEmail)}
        />
    )
}

export default SESConfigModal
