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

import React, { useState, useEffect, useRef } from 'react'
import {
    showError,
    getTeamListMin as getProjectListMin,
    CustomInput,
    ToastManager,
    ToastVariantType,
    SelectPicker,
    ComponentSizeType,
    OptionType,
} from '@devtron-labs/devtron-fe-common-lib'
import { useHistory } from 'react-router-dom'
import { saveSlackConfiguration, getSlackConfiguration } from './notifications.service'
import { ProjectListTypes, SlackConfigModalProps, SlackFormType } from './types'
import {
    ConfigurationFieldKeys,
    ConfigurationsTabTypes,
    DefaultSlackKeys,
    DefaultSlackValidations,
    SlackIncomingWebhookUrl,
} from './constants'
import { ConfigurationTabDrawerModal } from './ConfigurationDrawerModal'
import { getValidationFormConfig, renderErrorToast, validateKeyValueConfig } from './notifications.util'

export const SlackConfigModal: React.FC<SlackConfigModalProps> = ({
    slackConfigId,
    onSaveSuccess,
    closeSlackConfigModal,
}: SlackConfigModalProps) => {
    const history = useHistory()
    const projectRef = useRef(null)

    const [projectList, setProjectList] = useState<ProjectListTypes[]>([])
    const [selectedProject, setSelectedProject] = useState<OptionType>()
    const [form, setForm] = useState<SlackFormType>(DefaultSlackKeys)
    const [isFormValid, setFormValid] = useState(DefaultSlackValidations)

    const fetchSlackConfig = async () => {
        setForm((prevForm) => ({ ...prevForm, isLoading: true }))
        Promise.all([getSlackConfiguration(slackConfigId), getProjectListMin()])
            .then(([slackConfigRes, projectListRes]) => {
                setProjectList(projectListRes.result || [])
                setForm({ ...slackConfigRes.result, isLoading: false })
                setFormValid(DefaultSlackValidations)
                setSelectedProject({
                    label: projectListRes.result.find((p) => p.id === slackConfigRes.result.projectId).name,
                    value: slackConfigRes.result.projectId,
                })
            })
            .catch((error) => {
                showError(error)
                setForm((prevForm) => ({ ...prevForm, isLoading: false }))
            })
    }

    useEffect(() => {
        if (slackConfigId) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            fetchSlackConfig()
        } else {
            getProjectListMin()
                .then((response) => {
                    setProjectList(response.result || [])
                    setForm((prevForm) => ({ ...prevForm, isLoading: false }))
                })
                .catch((error) => {
                    showError(error)
                    setForm((prevForm) => ({ ...prevForm, isLoading: false }))
                })
        }
    }, [slackConfigId])

    const closeSlackConfig = () => {
        if (typeof closeSlackConfigModal === 'function') {
            closeSlackConfigModal()
        } else {
            const newParams = {
                modal: ConfigurationsTabTypes.SLACK,
            }
            history.push({
                search: new URLSearchParams(newParams).toString(),
            })
        }
    }

    const validateSave = (): boolean => {
        const formConfig = [
            { key: ConfigurationFieldKeys.CONFIG_NAME, value: form.configName },
            { key: ConfigurationFieldKeys.WEBHOOK_URL, value: form.webhookUrl },
            { key: ConfigurationFieldKeys.PROJECT_ID, value: selectedProject?.value ?? '' },
        ]
        const { allValid, formValidations } = getValidationFormConfig(formConfig)
        setFormValid((prevValid) => ({ ...prevValid, ...formValidations }))
        return allValid
    }

    const saveSlackConfig = async () => {
        if (!validateSave()) {
            renderErrorToast()
            return
        }

        const requestBody = {
            channel: ConfigurationsTabTypes.SLACK,
            configs: [
                {
                    id: slackConfigId,
                    configName: form.configName,
                    webhookUrl: form.webhookUrl,
                    teamId: form.projectId,
                },
            ],
        }
        setForm((prevForm) => ({ ...prevForm, isLoading: true }))

        try {
            await saveSlackConfiguration(requestBody)
            setForm((prevForm) => ({ ...prevForm, isLoading: false }))
            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: 'Saved Successfully',
            })
            onSaveSuccess()
            closeSlackConfig()
        } catch (error) {
            showError(error)
            setForm((prevForm) => ({ ...prevForm, isLoading: false }))
        }
    }

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target
        setForm((prevForm) => ({ ...prevForm, [name]: value }))
        setFormValid((prevValid) => ({
            ...prevValid,
            [name]: validateKeyValueConfig(name as ConfigurationFieldKeys, value),
        }))
    }

    const handleBlur = (e) => {
        const { name, value } = e.target
        setFormValid((prevValid) => ({ ...prevValid, [name]: validateKeyValueConfig(name, value) }))
    }

    const handleProjectChange = (_selectedProject) => {
        setSelectedProject(_selectedProject)
        setForm((prevForm) => ({
            ...prevForm,
            projectId: Number(_selectedProject?.value),
        }))
        setFormValid((prevValid) => ({
            ...prevValid,
            projectId: validateKeyValueConfig(ConfigurationFieldKeys.PROJECT_ID, _selectedProject?.value ?? ''),
        }))
    }

    const handleProjectBlur = () => {
        const selectedValue = selectedProject
        setFormValid((prevValid) => ({
            ...prevValid,
            [ConfigurationFieldKeys.PROJECT_ID]: validateKeyValueConfig(
                ConfigurationFieldKeys.PROJECT_ID,
                selectedValue?.value ?? '',
            ),
        }))
    }

    const renderContent = () => (
        <div className="dc__gap-16 flex-grow-1 flexbox-col mh-0 p-20 dc__overflow-auto">
            <CustomInput
                data-testid="add-slack-channel"
                label="Slack Channel"
                name={ConfigurationFieldKeys.CONFIG_NAME}
                value={form.configName}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Enter channel name"
                autoFocus
                required
                error={isFormValid[ConfigurationFieldKeys.CONFIG_NAME].message}
            />
            <CustomInput
                data-testid="add-webhook-url"
                label="Webhook URL"
                name={ConfigurationFieldKeys.WEBHOOK_URL}
                value={form.webhookUrl}
                placeholder="Enter incoming webhook URL"
                onChange={handleInputChange}
                onBlur={handleBlur}
                required
                error={isFormValid[ConfigurationFieldKeys.WEBHOOK_URL].message}
                labelTippyCustomizedConfig={{
                    heading: 'Setup webhooks',
                    infoText: (
                        <a href={SlackIncomingWebhookUrl} target="_blank" rel="noopener noreferrer">
                            <span className="dc__link">How to setup slack webhooks?</span>
                        </a>
                    ),
                }}
            />
            <SelectPicker
                name={ConfigurationFieldKeys.PROJECT_ID}
                label="Project"
                inputId="slack-project"
                value={selectedProject}
                onChange={handleProjectChange}
                placeholder="Select Project"
                options={projectList.map((p) => ({ label: p.name, value: p.id.toString() }))}
                size={ComponentSizeType.large}
                error={isFormValid[ConfigurationFieldKeys.PROJECT_ID].message}
                onBlur={handleProjectBlur}
                selectRef={projectRef}
                labelTippyCustomizedConfig={{
                    heading: 'Why is project required?',
                    infoText: 'Required to control user Access',
                }}
            />
        </div>
    )

    return (
        <ConfigurationTabDrawerModal
            renderContent={renderContent}
            closeModal={closeSlackConfig}
            modal={ConfigurationsTabTypes.SLACK}
            isLoading={form.isLoading}
            saveConfigModal={saveSlackConfig}
        />
    )
}
