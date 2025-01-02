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
import { Route, Switch, useHistory, useRouteMatch } from 'react-router-dom'
import { SlackConfigModal } from './SlackConfigModal'
import SESConfigModal from './SESConfigModal'
import {
    deleteNotification,
    getSESConfiguration,
    getConfigs,
    getSlackConfiguration,
    getSMTPConfiguration,
    getWebhookConfiguration,
} from './notifications.service'
import { ViewType } from '../../config/constants'
import { DC_CONFIGURATION_CONFIRMATION_MESSAGE, DeleteComponentsName } from '../../config/constantMessaging'
import { SMTPConfigModal } from './SMTPConfigModal'
import { WebhookConfigModal } from './WebhookConfigModal'
import { ConfigurationTabState } from './types'
import { SlackConfigurationTable } from './SlackConfigurationTable'
import { WebhookConfigurationTable } from './WebhookConfigurationTable'
import { SESConfigurationTable } from './SESConfigurationTable'
import { SMTPConfigurationTable } from './SMTPConfigurationTable'
import { ConfigurationTabSwitcher } from './ConfigurationTabsSwitcher'
import { ConfigurationsTabTypes } from './constants'

export const ConfigurationTab = () => {
    const { path } = useRouteMatch()
    const history = useHistory()
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
        activeTab: ConfigurationsTabTypes.SES,
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
        history.push(`${path}/ses`)
    }, [])

    const onSaveWebhook = () => {
        setState({ ...state, showWebhookConfigModal: false, webhookConfigId: 0 })
        getAllChannelConfigs()
    }

    const onCloseWebhookModal = () => {
        setState({ ...state, showWebhookConfigModal: false, webhookConfigId: 0 })
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

    const renderContent = () => (
        <div className="dc__overflow-auto">
            {renderSESConfigModal()}
            {renderSMTPConfigModal()}
            {renderSlackConfigModal()}
            {renderWebhookConfigModal()}
        </div>
    )
    return (
        <div className="bcn-0 h-100 flexbox-col dc__gap-16 pt-16">
            <ConfigurationTabSwitcher activeTab={state.activeTab} setState={setState} state={state} />
            <Switch>
                <Route
                    path={`${path}/${ConfigurationsTabTypes.SES}/:userId(\\d+)?`}
                    component={renderSESConfigurationTable}
                />
                <Route path={`${path}/${ConfigurationsTabTypes.SMTP}`} component={renderSMTPConfigurationTable} />
                <Route path={`${path}/${ConfigurationsTabTypes.SLACK}`} component={renderSlackConfigurationTable} />
                <Route path={`${path}/${ConfigurationsTabTypes.WEBHOOK}`} component={renderWebhookConfigurationTable} />
            </Switch>
            {renderContent()}

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
        </div>
    )
}
