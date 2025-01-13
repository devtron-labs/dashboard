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

import { useEffect, useRef, useState } from 'react'
import {
    showError,
    CustomInput,
    ToastManager,
    ToastVariantType,
    SelectPicker,
    ComponentSizeType,
    DEFAULT_SECRET_PLACEHOLDER,
    OptionType,
    SelectPickerProps,
    stringComparatorBySortOrder,
} from '@devtron-labs/devtron-fe-common-lib'
import { useHistory } from 'react-router-dom'
import { saveEmailConfiguration, getSESConfiguration } from './notifications.service'
import { SESConfigModalProps, SESFormType } from './types'
import {
    getSESDefaultConfiguration,
    getValidationFormConfig,
    renderErrorToast,
    validateKeyValueConfig,
} from './notifications.util'
import { ConfigurationFieldKeys, ConfigurationsTabTypes, DefaultSESValidations } from './constants'
import { ConfigurationTabDrawerModal } from './ConfigurationDrawerModal'
import { DefaultCheckbox } from './DefaultCheckbox'
import awsRegionList from '../common/awsRegionList.json'

const awsRegionListOption = awsRegionList
    .sort((a, b) => stringComparatorBySortOrder(a.name, b.name))
    .map((region) => ({ label: region.name, value: region.value }))

const SESConfigModal = ({
    sesConfigId,
    shouldBeDefault,
    selectSESFromChild,
    onSaveSuccess,
    closeSESConfigModal,
}: SESConfigModalProps) => {
    const history = useHistory()
    const selectRef = useRef(null)

    const [form, setForm] = useState<SESFormType>(getSESDefaultConfiguration(shouldBeDefault))
    const [isFormValid, setFormValid] = useState(DefaultSESValidations)
    const [unMaskedSecretKey, setUnMaskedSecretKey] = useState('')

    const fetchSESConfiguration = async () => {
        setForm((prevForm) => ({ ...prevForm, isLoading: true }))
        try {
            const response = await getSESConfiguration(sesConfigId)
            const { region } = response.result
            const awsRegion = awsRegionListOption.find((r) => r.value === region)

            setForm({
                ...response.result,
                isLoading: false,
                region: awsRegion,
                secretKey: DEFAULT_SECRET_PLACEHOLDER, // Masked secretKey for security
            })
            setUnMaskedSecretKey(response.result.secretKey)
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

    const handleInputChange = (e) => {
        const { name, value } = e.target
        if (name === ConfigurationFieldKeys.SECRET_KEY) {
            setUnMaskedSecretKey(value)
        }
        setForm((prevForm) => ({
            ...prevForm,
            [name]: value,
        }))
        setFormValid((prevValid) => ({
            ...prevValid,
            [name]: validateKeyValueConfig(name, value),
        }))
    }
    const handleBlur = (event): void => {
        const { name, value } = event.target
        setFormValid((prevValid) => ({
            ...prevValid,
            [name]: validateKeyValueConfig(name as ConfigurationFieldKeys, value),
        }))
    }

    const handleAWSRegionChange = (selected: OptionType): void => {
        setFormValid((prevValid) => ({
            ...prevValid,
            region: validateKeyValueConfig(ConfigurationFieldKeys.REGION, selected.value),
        }))
        setForm((prevForm) => ({
            ...prevForm,
            region: selected,
        }))
    }

    const handleAWSBlur: SelectPickerProps['onBlur'] = (): void => {
        const selectedValue = selectRef.current?.getValue()[0] || {}
        setFormValid((prevValid) => ({
            ...prevValid,
            region: validateKeyValueConfig(ConfigurationFieldKeys.REGION, selectedValue.value),
        }))
    }

    const handleCheckbox = (): void => {
        setForm((prevForm) => ({
            ...prevForm,
            default: !prevForm.default,
        }))
    }

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

    const validateSave = (): boolean => {
        const formConfig = [
            { key: ConfigurationFieldKeys.CONFIG_NAME, value: form.configName },
            { key: ConfigurationFieldKeys.ACCESS_KEY, value: form.accessKey },
            { key: ConfigurationFieldKeys.SECRET_KEY, value: form.secretKey },
            { key: ConfigurationFieldKeys.REGION, value: form.region?.value?.toString() },
            { key: ConfigurationFieldKeys.FROM_EMAIL, value: form.fromEmail },
        ]

        const { allValid, formValidations } = getValidationFormConfig(formConfig)
        setFormValid((prevValid) => ({ ...prevValid, ...formValidations }))
        return allValid
    }

    const saveSESConfig = async () => {
        if (!validateSave()) {
            renderErrorToast()
            return
        }
        setForm((prevForm) => ({
            ...prevForm,
            isLoading: true,
        }))

        const payload = {
            channel: ConfigurationsTabTypes.SES,
            configs: [
                {
                    configName: form.configName,
                    accessKey: form.accessKey,
                    secretKey: unMaskedSecretKey,
                    region: form.region?.value,
                    fromEmail: form.fromEmail,
                    default: form.default,
                    id: sesConfigId,
                },
            ],
        }

        try {
            const response = await saveEmailConfiguration(payload)
            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: 'Saved Successfully',
            })
            if (selectSESFromChild) selectSESFromChild(response?.result[0])
            onSaveSuccess()
            closeSESConfig()
        } catch (error) {
            showError(error)
        } finally {
            setForm((prevForm) => ({ ...prevForm, isLoading: false }))
        }
    }

    const renderSESContent = () => (
        <div className="dc__gap-16 flex-grow-1 flexbox-col mh-0 p-20 dc__overflow-auto h-100 mh-0">
            <CustomInput
                label="Configuration Name"
                dataTestid="add-ses-configuration-name"
                name={ConfigurationFieldKeys.CONFIG_NAME}
                value={form.configName}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Enter a name"
                autoFocus
                isRequiredField
                error={isFormValid[ConfigurationFieldKeys.CONFIG_NAME].message}
            />
            <CustomInput
                label="Access Key ID"
                dataTestid="add-ses-access-key"
                name={ConfigurationFieldKeys.ACCESS_KEY}
                value={form.accessKey}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Enter access key ID"
                isRequiredField
                error={isFormValid[ConfigurationFieldKeys.ACCESS_KEY].message}
            />
            <CustomInput
                label="Secret Access Key"
                dataTestid="add-ses-secret-access-key"
                name={ConfigurationFieldKeys.SECRET_KEY}
                value={form.secretKey}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Enter Secret access Key"
                isRequiredField
                error={isFormValid[ConfigurationFieldKeys.SECRET_KEY].message}
            />
            <SelectPicker
                inputId="aws-region"
                label="AWS Region"
                classNamePrefix="add-ses-aws-region"
                required
                value={form.region}
                placeholder="Select region"
                onBlur={handleAWSBlur}
                onChange={handleAWSRegionChange}
                options={awsRegionListOption}
                size={ComponentSizeType.large}
                name={ConfigurationFieldKeys.REGION}
                error={isFormValid[ConfigurationFieldKeys.REGION].message}
                selectRef={selectRef}
            />

            <CustomInput
                label="Send email from"
                dataTestid="add-ses-send-email"
                type="email"
                name={ConfigurationFieldKeys.FROM_EMAIL}
                value={form.fromEmail}
                onBlur={handleBlur}
                placeholder="Enter sender's email"
                onChange={handleInputChange}
                isRequiredField
                error={isFormValid[ConfigurationFieldKeys.FROM_EMAIL].message}
                helperText="This email must be verified with SES."
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
            renderContent={renderSESContent}
            closeModal={closeSESConfig}
            modal={ConfigurationsTabTypes.SES}
            isLoading={form.isLoading}
            saveConfigModal={saveSESConfig}
        />
    )
}

export default SESConfigModal
