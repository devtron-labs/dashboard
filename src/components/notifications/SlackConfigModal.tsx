import React, { useState, useEffect } from 'react'
import {
    showError,
    getTeamListMin as getProjectListMin,
    CustomInput,
    ToastManager,
    ToastVariantType,
    SelectPicker,
} from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'
import { useHistory } from 'react-router-dom'
import { saveSlackConfiguration, updateSlackConfiguration, getSlackConfiguration } from './notifications.service'
import { ReactComponent as ICHelpOutline } from '../../assets/icons/ic-help-outline.svg'
import { ReactComponent as Error } from '../../assets/icons/ic-warning.svg'
import { REQUIRED_FIELD_MSG } from '../../config/constantMessaging'
import { SlackConfigModalProps } from './types'
import { ConfigurationsTabTypes, DefaultSlackKeys, DefaultSlackValidationKeys, SlackRegion } from './constants'
import { ConfigurationTabDrawerModal } from './ConfigurationDrawerModal'

export const SlackConfigModal: React.FC<SlackConfigModalProps> = ({
    slackConfigId,
    onSaveSuccess,
    closeSlackConfigModal,
}: SlackConfigModalProps) => {
    const history = useHistory()

    const [projectList, setProjectList] = useState<Array<{ id: number; name: string; active: boolean }>>([])
    const [selectedProject, setSelectedProject] = useState<{ label: string; value: number }>({ label: '', value: 0 })
    const [form, setForm] = useState(DefaultSlackKeys)
    const [isValid, setIsValid] = useState(DefaultSlackValidationKeys)

    useEffect(() => {
        if (slackConfigId) {
            setForm((prevForm) => ({ ...prevForm, isLoading: true }))
            Promise.all([getSlackConfiguration(slackConfigId), getProjectListMin()])
                .then(([slackConfigRes, projectListRes]) => {
                    setProjectList(projectListRes.result || [])
                    setForm({ ...slackConfigRes.result, isLoading: false, isError: false })
                    setIsValid(DefaultSlackValidationKeys)
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

    const checkIsValid = (event, key: 'configName' | 'webhookUrl' | 'projectId') => {
        setIsValid((prevValid) => ({
            ...prevValid,
            [key]: !!event.target.value,
        }))
    }

    const handleSlackChannelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prevForm) => ({
            ...prevForm,
            configName: event.target.value,
        }))
        checkIsValid(event, 'configName')
    }

    const handleWebhookUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prevForm) => ({
            ...prevForm,
            webhookUrl: event.target.value,
        }))
        checkIsValid(event, 'webhookUrl')
    }

    const handleProjectChange = (_selectedProject) => {
        const projectId = Number(selectedProject.value)
        setSelectedProject(_selectedProject)
        setForm((prevForm) => ({
            ...prevForm,
            projectId,
        }))
        setIsValid((prevValid) => ({
            ...prevValid,
            projectId: !!_selectedProject.value,
        }))
    }

    const isFormValid = () => Object.keys(isValid).every((key) => isValid[key])

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
        if (!isFormValid()) {
            setForm((prevForm) => ({ ...prevForm, isLoading: false, isError: true }))
            return
        }

        let requestBody
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

    const renderWebhookUrlLabel = () => (
        <div className="flex">
            <div className="dc__required-field">Webhook URL </div>
            <div>
                <Tippy
                    className="default-tt"
                    arrow
                    trigger="click"
                    interactive
                    placement="top"
                    content={
                        <a
                            href="https://slack.com/intl/en-gb/help/articles/115005265063-Incoming-webhooks-for-Slack"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'white', textTransform: 'none' }}
                        >
                            Learn how to setup slack webhooks
                        </a>
                    }
                >
                    <div className="flex">
                        <ICHelpOutline className="ml-5 dc__vertical-align-middle icon-dim-16 cursor" />
                    </div>
                </Tippy>
            </div>
        </div>
    )

    const renderProjectLabel = () => (
        <div className="flexbox-imp">
            <span className="dc__required-field">Project</span>
            <Tippy
                className="default-tt"
                arrow
                trigger="click"
                interactive
                placement="top"
                content="Required to control user Access"
            >
                <div>
                    <ICHelpOutline className="ml-5 dc__vertical-align-middle icon-dim-16 cursor" />
                </div>
            </Tippy>
        </div>
    )

    const renderContent = () => (
        <div className="dc__gap-16 flex-grow-1 flexbox-col mh-0 p-20 dc__overflow-auto">
            <CustomInput
                data-testid="add-slack-channel"
                label="Slack Channel"
                name="app-name"
                value={form.configName}
                onChange={handleSlackChannelChange}
                onBlur={(event) => checkIsValid(event, 'configName')}
                placeholder="channel name"
                autoFocus
                isRequiredField
                error={!isValid.configName && REQUIRED_FIELD_MSG}
            />
            <CustomInput
                data-testid="add-webhook-url"
                label={renderWebhookUrlLabel()}
                name="app-name"
                value={form.webhookUrl}
                placeholder="Enter Incoming Webhook URL"
                onChange={handleWebhookUrlChange}
                onBlur={(event) => checkIsValid(event, 'webhookUrl')}
                isRequiredField
                error={!isValid.webhookUrl && REQUIRED_FIELD_MSG}
            />
            <div>
                <SelectPicker
                    label={renderProjectLabel()}
                    inputId="slack-project"
                    value={selectedProject}
                    onChange={handleProjectChange}
                    placeholder="Select Project"
                    options={projectList.map((p) => ({ label: p.name, value: p.id }))}
                />
                <span className="form__error">
                    {!isValid[SlackRegion.PROJECT_ID] && (
                        <>
                            <Error className="form__icon form__icon--error" />
                            <span className="form__error-text">{REQUIRED_FIELD_MSG}</span>
                        </>
                    )}
                </span>
            </div>
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
