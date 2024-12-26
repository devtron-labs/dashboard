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

import { useEffect, useState } from 'react'
import { showError, Progressing, ErrorScreenNotAuthorized, DeleteComponent } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { SlackConfigModal } from './SlackConfigModal'
import { SESConfigModal } from './SESConfigModal'
import {
    deleteNotification,
    getSESConfiguration,
    getConfigs,
    getSlackConfiguration,
    getSMTPConfiguration,
    getWebhookConfiguration,
} from './notifications.service'
import slack from '../../assets/img/slack-logo.svg'
import ses from '../../assets/icons/ic-aws-ses.svg'
import webhook from '../../assets/icons/ic-CIWebhook.svg'
import { ReactComponent as SMTP } from '../../assets/icons/ic-smtp.svg'
import { ViewType } from '../../config/constants'
import { DC_CONFIGURATION_CONFIRMATION_MESSAGE, DeleteComponentsName } from '../../config/constantMessaging'
import { SMTPConfigModal } from './SMTPConfigModal'
import { WebhookConfigModal } from './WebhookConfigModal'
import { ConfigurationTabState } from './types'
import { SlackConfigurationTable } from './SlackConfigurationTable'
import { WebhookConfigurationTable } from './WebhookConfigurationTable'
import { SESConfigurationTable } from './SESConfigurationTable'
import { SMTPConfigurationTable } from './SMTPConfigurationTable'

export const ConfigurationTab = () => {
    const [state, setState] = useState<ConfigurationTabState>({
        view: ViewType.LOADING,
        showSlackConfigModal: false,
        showSESConfigModal: false,
        showSMTPConfigModal: false,
        showWebhookConfigModal: false,
        slackConfigId: 0,
        sesConfigId: 0,
        smtpConfigId: 0,
        webhookConfigId: 0,
        sesConfigurationList: [],
        smtpConfigurationList: [],
        slackConfigurationList: [],
        webhookConfigurationList: [],
        abortAPI: false,
        deleting: false,
        confirmation: false,
        sesConfig: {},
        smtpConfig: {},
        slackConfig: {},
        webhookConfig: {},
        showDeleteConfigModalType: '',
    })

    const getAllChannelConfigs = (): void => {
        getConfigs()
            .then((response) => {
                setState({
                    ...state,
                    slackConfigurationList: response.result.slackConfigurationList,
                    sesConfigurationList: response.result.sesConfigurationList,
                    smtpConfigurationList: response.result.smtpConfigurationList,
                    webhookConfigurationList: response.result.webhookConfigurationList,
                    view: ViewType.FORM,
                })
            })
            .catch((error) => {
                showError(error, true, true)
                setState({ ...state, view: ViewType.ERROR })
            })
    }
    useEffect(() => {
        getAllChannelConfigs()
    }, [])

    const onSaveWebhook = () => {
        setState({ ...state, showWebhookConfigModal: false, webhookConfigId: 0 })
        getAllChannelConfigs()
    }

    const onCloseWebhookModal = () => {
        setState({ ...state, showWebhookConfigModal: false, webhookConfigId: 0 })
    }

    const addWebhookConfigHandler = () => {
        setState({ ...state, showWebhookConfigModal: true, webhookConfigId: 0 })
    }

    const deleteClickHandler = async (configId, type) => {
        try {
            if (type === DeleteComponentsName.SlackConfigurationTab) {
                const { result } = await getSlackConfiguration(configId, true)
                setState({
                    ...state,
                    slackConfigId: configId,
                    slackConfig: {
                        ...result,
                        channel: DeleteComponentsName.SlackConfigurationTab,
                    },
                    confirmation: true,
                    showDeleteConfigModalType: DeleteComponentsName.SlackConfigurationTab,
                })
            } else if (type === DeleteComponentsName.SesConfigurationTab) {
                const { result } = await getSESConfiguration(configId)
                setState({
                    ...state,
                    sesConfigId: configId,
                    sesConfig: {
                        ...result,
                        channel: DeleteComponentsName.SesConfigurationTab,
                    },
                    confirmation: true,
                    showDeleteConfigModalType: DeleteComponentsName.SesConfigurationTab,
                })
            } else if (type === DeleteComponentsName.SMTPConfigurationTab) {
                const { result } = await getSMTPConfiguration(configId)
                setState({
                    ...state,
                    smtpConfigId: configId,
                    smtpConfig: {
                        ...result,
                        channel: DeleteComponentsName.SMTPConfigurationTab,
                    },
                    confirmation: true,
                    showDeleteConfigModalType: DeleteComponentsName.SMTPConfigurationTab,
                })
            } else if (type === DeleteComponentsName.WebhookConfigurationTab) {
                const { result } = await getWebhookConfiguration(configId)
                setState({
                    ...state,
                    webhookConfigId: configId,
                    webhookConfig: {
                        ...result,
                        channel: DeleteComponentsName.WebhookConfigurationTab,
                    },
                    confirmation: true,
                    showDeleteConfigModalType: DeleteComponentsName.WebhookConfigurationTab,
                })
            }
        } catch (e) {
            showError(e)
        }
    }

    const renderSlackConfigurationTable = () => (
        <SlackConfigurationTable state={state} setState={setState} deleteClickHandler={deleteClickHandler} />
    )

    const renderWebhookConfigurationTable = () => (
        <WebhookConfigurationTable state={state} setState={setState} deleteClickHandler={deleteClickHandler} />
    )

    const renderSESConfigurationTable = () => (
        <SESConfigurationTable state={state} setState={setState} deleteClickHandler={deleteClickHandler} />
    )

    const renderSMTPConfigurationTable = () => (
        <SMTPConfigurationTable state={state} setState={setState} deleteClickHandler={deleteClickHandler} />
    )

    const renderWebhookConfigurations = () => (
        <div key="webhook-config" className="dc__position-rel white-card white-card--configuration-tab mb-16">
            <div className="configuration-tab__header">
                <p data-testid="webhook-config-heading-title" className="configuration-tab__title">
                    <img src={webhook} alt="webhook" className="icon-dim-24 mr-10" />
                    Webhook Configurations
                </p>
                <button
                    type="button"
                    className="cta flex small"
                    onClick={addWebhookConfigHandler}
                    data-testid="webhook-config-add-button"
                >
                    <Add className="icon-dim-14 mr-5" />
                    Add
                </button>
            </div>
            {renderWebhookConfigurationTable()}
        </div>
    )

    const renderSlackConfigurations = () => (
        <div key="slack-config" className="dc__position-rel white-card white-card--configuration-tab mb-16">
            <div className="configuration-tab__header">
                <p data-testid="slack-heading-title" className="configuration-tab__title">
                    <img src={slack} alt="slack" className="icon-dim-24 mr-10" />
                    Slack Configurations
                </p>
                <button
                    type="button"
                    className="cta flex small"
                    onClick={() => {
                        setState({ ...state, showSlackConfigModal: true, slackConfigId: 0 })
                    }}
                    data-testid="slack-add-button"
                >
                    <Add className="icon-dim-14 mr-5" />
                    Add
                </button>
            </div>
            {renderSlackConfigurationTable()}
        </div>
    )
    const renderSESConfigurations = () => (
        <div key="ses-config" className="dc__position-rel white-card white-card--configuration-tab">
            <div className="configuration-tab__header">
                <p data-testid="ses-heading-title" className="configuration-tab__title">
                    <img alt="ses config" src={ses} className="icon-dim-24 mr-10" />
                    SES Configurations
                </p>
                <button
                    type="button"
                    className="cta flex small"
                    onClick={() => {
                        setState({ ...state, showSESConfigModal: true, sesConfigId: 0 })
                    }}
                    data-testid="ses-add-button"
                >
                    <Add className="icon-dim-14 mr-5" />
                    Add
                </button>
            </div>
            {renderSESConfigurationTable()}
        </div>
    )

    const renderSMTPConfigurations = () => (
        <div key="smtp-config" className="dc__position-rel white-card white-card--configuration-tab">
            <div className="configuration-tab__header">
                <p data-testid="smtp-heading-title" className="configuration-tab__title flexbox">
                    <SMTP className="icon-dim-24 mr-10" />
                    SMTP Configurations
                </p>
                <button
                    type="button"
                    className="cta flex small"
                    onClick={() => {
                        setState({ ...state, showSMTPConfigModal: true, smtpConfigId: 0 })
                    }}
                    data-testid="smtp-add-button"
                >
                    <Add className="icon-dim-14 mr-5" />
                    Add
                </button>
            </div>
            {renderSMTPConfigurationTable()}
        </div>
    )

    const setDeleting = () => {
        setState({
            ...state,
            deleting: true,
        })
    }

    const toggleConfirmation = (confirmation) => {
        setState({
            ...state,
            confirmation,
            ...(!confirmation && { showDeleteConfigModalType: '' }),
        })
    }

    const renderSESConfigModal = () => {
        const { showSESConfigModal, sesConfigId, sesConfigurationList } = state
        if (!showSESConfigModal) return null
        return (
            <SESConfigModal
                sesConfigId={sesConfigId}
                shouldBeDefault={sesConfigurationList.length === 0}
                onSaveSuccess={() => {
                    setState({ ...state, showSESConfigModal: false, sesConfigId: 0 })
                    getAllChannelConfigs()
                }}
                closeSESConfigModal={() => {
                    setState({ ...state, showSESConfigModal: false })
                }}
            />
        )
    }

    const renderSMTPConfigModal = () => {
        const { showSMTPConfigModal, smtpConfigId, smtpConfigurationList } = state
        if (!showSMTPConfigModal) return null
        return (
            <SMTPConfigModal
                smtpConfigId={smtpConfigId}
                shouldBeDefault={smtpConfigurationList.length === 0}
                onSaveSuccess={() => {
                    setState({ ...state, showSMTPConfigModal: false, smtpConfigId: 0 })
                    getAllChannelConfigs()
                }}
                closeSMTPConfigModal={() => {
                    setState({ ...state, showSMTPConfigModal: false })
                }}
            />
        )
    }

    const renderSlackConfigModal = () => {
        const { showSlackConfigModal, slackConfigId } = state
        if (!showSlackConfigModal) return null
        return (
            <SlackConfigModal
                slackConfigId={slackConfigId}
                onSaveSuccess={() => {
                    setState({ ...state, showSlackConfigModal: false, slackConfigId: 0 })
                    getAllChannelConfigs()
                }}
                closeSlackConfigModal={() => {
                    setState({ ...state, showSlackConfigModal: false, slackConfigId: 0 })
                }}
            />
        )
    }

    const renderWebhookConfigModal = () => {
        const { showWebhookConfigModal, webhookConfigId } = state
        if (!showWebhookConfigModal) return null
        return (
            <WebhookConfigModal
                webhookConfigId={webhookConfigId}
                onSaveSuccess={onSaveWebhook}
                closeWebhookConfigModal={onCloseWebhookModal}
            />
        )
    }

    const deleteConfigPayload = (): any => {
        const { showDeleteConfigModalType, slackConfig, sesConfig, webhookConfig, smtpConfig } = state
        if (showDeleteConfigModalType === DeleteComponentsName.SlackConfigurationTab) {
            return slackConfig
        }
        if (showDeleteConfigModalType === DeleteComponentsName.SesConfigurationTab) {
            return sesConfig
        }
        if (showDeleteConfigModalType === DeleteComponentsName.WebhookConfigurationTab) {
            return webhookConfig
        }
        return smtpConfig
    }

    const deleteConfigComponent = (): string => {
        const { showDeleteConfigModalType } = state
        if (showDeleteConfigModalType === DeleteComponentsName.SlackConfigurationTab) {
            return DeleteComponentsName.SlackConfigurationTab
        }
        if (showDeleteConfigModalType === DeleteComponentsName.SesConfigurationTab) {
            return DeleteComponentsName.SesConfigurationTab
        }
        if (showDeleteConfigModalType === DeleteComponentsName.WebhookConfigurationTab) {
            return DeleteComponentsName.WebhookConfigurationTab
        }
        return DeleteComponentsName.SMTPConfigurationTab
    }

    if (state.view === ViewType.LOADING) {
        return (
            <div className="dc__height-reduce-172">
                <Progressing pageLoader />
            </div>
        )
    }
    if (state.view === ViewType.ERROR) {
        return (
            <div className="dc__height-reduce-172">
                <ErrorScreenNotAuthorized />
            </div>
        )
    }
    const payload = deleteConfigPayload()
    return (
        <>
            <div className="configuration-tab">
                {renderSESConfigurations()}
                {renderSMTPConfigurations()}
                {renderSlackConfigurations()}
                {renderWebhookConfigurations()}
            </div>
            {renderSESConfigModal()}
            {renderSMTPConfigModal()}
            {renderSlackConfigModal()}
            {renderWebhookConfigModal()}
            {state.confirmation && (
                <DeleteComponent
                    setDeleting={setDeleting}
                    deleteComponent={deleteNotification}
                    payload={payload}
                    title={payload.configName}
                    toggleConfirmation={toggleConfirmation}
                    component={deleteConfigComponent()}
                    confirmationDialogDescription={DC_CONFIGURATION_CONFIRMATION_MESSAGE}
                    reload={getAllChannelConfigs}
                    configuration="configuration"
                />
            )}
        </>
    )
}
