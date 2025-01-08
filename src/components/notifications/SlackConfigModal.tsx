import React, { useState, useEffect, useRef } from 'react'
import {
    showError,
    getTeamListMin as getProjectListMin,
    CustomInput,
    ToastManager,
    ToastVariantType,
    SelectPicker,
    ComponentSizeType,
} from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'
import { useHistory } from 'react-router-dom'
import { saveSlackConfiguration, updateSlackConfiguration, getSlackConfiguration } from './notifications.service'
import { ReactComponent as ICHelpOutline } from '../../assets/icons/ic-help-outline.svg'
import { SlackConfigModalProps } from './types'
import { ConfigurationFieldKeys, ConfigurationsTabTypes, DefaultSlackKeys, DefaultSlackValidations } from './constants'
import { ConfigurationTabDrawerModal } from './ConfigurationDrawerModal'
import { getFormValidated, validateKeyValueConfig } from './notifications.util'

export const SlackConfigModal: React.FC<SlackConfigModalProps> = ({
    slackConfigId,
    onSaveSuccess,
    closeSlackConfigModal,
}: SlackConfigModalProps) => {
    const history = useHistory()
    const projectRef = useRef(null)

    const [projectList, setProjectList] = useState<Array<{ id: number; name: string; active: boolean }>>([])
    const [selectedProject, setSelectedProject] = useState<{ label: string; value: string }>()
    const [form, setForm] = useState(DefaultSlackKeys)
    const [isFormValid, setFormValid] = useState(DefaultSlackValidations)

    useEffect(() => {
        if (slackConfigId) {
            setForm((prevForm) => ({ ...prevForm, isLoading: true }))
            Promise.all([getSlackConfiguration(slackConfigId), getProjectListMin()])
                .then(([slackConfigRes, projectListRes]) => {
                    setProjectList(projectListRes.result || [])
                    setForm({ ...slackConfigRes.result, isLoading: false, isError: false })
                    setFormValid(DefaultSlackValidations)
                    setSelectedProject({
                        label: projectListRes.result.find((p) => p.id === slackConfigRes.result.projectId).name,
                        value: slackConfigRes.result.projectId,
                    })
                })
                .catch((error) => {
                    showError(error)
                })
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

    const saveSlackConfig = () => {
        if (!getFormValidated(isFormValid)) {
            setForm((prevForm) => ({ ...prevForm, isLoading: false, isError: true }))
            return
        }

        let requestBody = { ...form }
        if (slackConfigId) {
            requestBody = {
                ...form,
                id: slackConfigId,
            }
        }

        setForm((prevForm) => ({ ...prevForm, isLoading: true }))

        const promise = slackConfigId ? updateSlackConfiguration(requestBody) : saveSlackConfiguration(requestBody)

        promise
            .then(() => {
                setForm((prevForm) => ({ ...prevForm, isLoading: false, isError: false }))
                ToastManager.showToast({
                    variant: ToastVariantType.success,
                    description: 'Saved Successfully',
                })
                onSaveSuccess()
                closeSlackConfig()
            })
            .catch((error) => {
                showError(error)
            })
    }

    const renderInfoText = () => (
        <a
            href="https://slack.com/intl/en-gb/help/articles/115005265063-Incoming-webhooks-for-Slack"
            target="_blank"
            rel="noopener noreferrer"
        >
            <span className="dc__link">How to setup slack webhooks?</span>
        </a>
    )

    const renderWebhookUrlLabel = () => (
        <div className="flex left dc__gap-6">
            <div className="dc__required-field">Webhook URL </div>
            {renderInfoText()}
        </div>
    )

    const renderProjectLabel = () => (
        <div className="flex dc__gap-6 left">
            <span className="dc__required-field">Project</span>
            <Tippy
                className="default-tt"
                arrow
                trigger="click"
                interactive
                placement="top"
                content="Required to control user Access"
            >
                <span>
                    <ICHelpOutline className="icon-dim-16 cursor flex" />
                </span>
            </Tippy>
        </div>
    )

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
            projectId: Number(_selectedProject.value),
        }))
        setFormValid((prevValid) => ({
            ...prevValid,
            projectId: validateKeyValueConfig(ConfigurationFieldKeys.PROJECT_ID, _selectedProject.value),
        }))
    }

    const handleProjectBlur = () => {
        const selectedValue = projectRef.current?.getValue()[0] || {}
        setFormValid((prevValid) => ({
            ...prevValid,
            [ConfigurationFieldKeys.PROJECT_ID]: validateKeyValueConfig(
                ConfigurationFieldKeys.PROJECT_ID,
                selectedValue.value,
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
                placeholder="Channel name"
                autoFocus
                isRequiredField
                error={isFormValid[ConfigurationFieldKeys.CONFIG_NAME].message}
            />
            <CustomInput
                data-testid="add-webhook-url"
                label={renderWebhookUrlLabel()}
                name={ConfigurationFieldKeys.WEBHOOK_URL}
                value={form.webhookUrl}
                placeholder="Enter Incoming Webhook URL"
                onChange={handleInputChange}
                onBlur={handleBlur}
                isRequiredField
                error={isFormValid[ConfigurationFieldKeys.WEBHOOK_URL].message}
            />
            <SelectPicker
                name={ConfigurationFieldKeys.PROJECT_ID}
                label={renderProjectLabel()}
                inputId="slack-project"
                value={selectedProject}
                onChange={handleProjectChange}
                placeholder="Select Project"
                options={projectList.map((p) => ({ label: p.name, value: p.id.toString() }))}
                size={ComponentSizeType.large}
                error={isFormValid[ConfigurationFieldKeys.PROJECT_ID].message}
                onBlur={handleProjectBlur}
                selectRef={projectRef}
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
