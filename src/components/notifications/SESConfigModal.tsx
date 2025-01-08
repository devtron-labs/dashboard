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
    Checkbox,
    CustomInput,
    CHECKBOX_VALUE,
    ToastManager,
    ToastVariantType,
    SelectPicker,
    ComponentSizeType,
    DEFAULT_SECRET_PLACEHOLDER,
    stringComparatorBySortOrder,
    OptionType,
    SelectPickerProps,
} from '@devtron-labs/devtron-fe-common-lib'
import { useHistory } from 'react-router-dom'
import { saveEmailConfiguration, getSESConfiguration } from './notifications.service'
import awsRegionList from '../common/awsRegionList.json'
import { SESConfigModalProps } from './types'
import { getFormValidated, getSESDefaultConfiguration, validateKeyValueConfig } from './notifications.util'
import { ConfigurationFieldKeys, ConfigurationsTabTypes, DefaultSESValidations } from './constants'
import { ConfigurationTabDrawerModal } from './ConfigurationDrawerModal'

const SESConfigModal = ({
    sesConfigId,
    shouldBeDefault,
    selectSESFromChild,
    onSaveSuccess,
    closeSESConfigModal,
}: SESConfigModalProps) => {
    const history = useHistory()
    const selectRef = useRef(null)

    const [form, setForm] = useState(getSESDefaultConfiguration(shouldBeDefault))
    const [isFormValid, setFormValid] = useState(DefaultSESValidations)

    const awsRegionListParsed = awsRegionList
        .sort((a, b) => stringComparatorBySortOrder(a.name, b.name))
        .map((region) => ({ label: region.name, value: region.value }))

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
                secretKey: DEFAULT_SECRET_PLACEHOLDER, // Masked secretKey for security
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

    const handleInputChange = (e) => {
        const { name, value } = e.target
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

    const saveSESConfig = async () => {
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
                placeholder="Configuration name"
                autoFocus
                isRequiredField
                error={isFormValid.configName.message}
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
                error={isFormValid.accessKey.message}
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
                error={isFormValid.secretKey.message}
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
                options={awsRegionListParsed}
                size={ComponentSizeType.large}
                name={ConfigurationFieldKeys.REGION}
                error={isFormValid.region.message}
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
                error={isFormValid.fromEmail.message}
                helperText="This email must be verified with SES."
            />
            <Checkbox
                isChecked={form.default}
                value={CHECKBOX_VALUE.CHECKED}
                disabled={shouldBeDefault}
                onChange={handleCheckbox}
                dataTestId="add-ses-default-checkbox"
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
