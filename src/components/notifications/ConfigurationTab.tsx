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
import {
    showError,
    Progressing,
    ErrorScreenNotAuthorized,
    DeleteComponent,
    useSearchString,
} from '@devtron-labs/devtron-fe-common-lib'
import { Route, Switch, useHistory, useLocation, useRouteMatch } from 'react-router-dom'
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
import SlackConfigurationTable from './SlackConfigurationTable'
import { WebhookConfigurationTable } from './WebhookConfigurationTable'
import SESConfigurationTable from './SESConfigurationTable'
import { SMTPConfigurationTable } from './SMTPConfigurationTable'
import { ConfigurationTabSwitcher } from './ConfigurationTabsSwitcher'
import { ConfigurationsTabTypes } from './constants'
import { getDeleteConfigComponent } from './notifications.util'

export const ConfigurationTab = () => {
    const { path } = useRouteMatch()
    const history = useHistory()
    const location = useLocation()
    const { searchParams } = useSearchString()
    const queryString = new URLSearchParams(location.search)
    const modal = queryString.get('modal')

    const [state, setState] = useState<ConfigurationTabState>({
        view: ViewType.LOADING,
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
        showDeleteConfigModalType: ConfigurationsTabTypes.SES,
        activeTab: ConfigurationsTabTypes.SES,
    })

    const getAllChannelConfigs = async () => {
        try {
            const { result } = await getConfigs()
            setState({
                ...state,
                slackConfigurationList: result.slackConfigurationList,
                sesConfigurationList: result.sesConfigurationList,
                smtpConfigurationList: result.smtpConfigurationList,
                webhookConfigurationList: result.webhookConfigurationList,
                view: ViewType.FORM,
            })
        } catch (error) {
            showError(error, true, true)
            setState({ ...state, view: ViewType.ERROR })
        }
    }

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        getAllChannelConfigs()

        const newParams = {
            ...searchParams,
            modal: modal ?? ConfigurationsTabTypes.SES,
        }

        history.push({
            search: new URLSearchParams(newParams).toString(),
        })
    }, [])

    const deleteClickHandler = async (configId, type: ConfigurationsTabTypes) => {
        try {
            if (type === ConfigurationsTabTypes.SLACK) {
                const { result } = await getSlackConfiguration(configId, true)
                setState({
                    ...state,
                    slackConfigId: configId,
                    slackConfig: {
                        ...result,
                        channel: ConfigurationsTabTypes.SLACK,
                    },
                    confirmation: true,
                    showDeleteConfigModalType: ConfigurationsTabTypes.SLACK,
                })
            } else if (type === ConfigurationsTabTypes.SES) {
                const { result } = await getSESConfiguration(configId)
                setState({
                    ...state,
                    sesConfigId: configId,
                    sesConfig: {
                        ...result,
                        channel: ConfigurationsTabTypes.SES,
                    },
                    confirmation: true,
                    showDeleteConfigModalType: ConfigurationsTabTypes.SES,
                })
            } else if (type === ConfigurationsTabTypes.SMTP) {
                const { result } = await getSMTPConfiguration(configId)
                setState({
                    ...state,
                    smtpConfigId: configId,
                    smtpConfig: {
                        ...result,
                        channel: ConfigurationsTabTypes.SMTP,
                    },
                    confirmation: true,
                    showDeleteConfigModalType: ConfigurationsTabTypes.SMTP,
                })
            } else if (type === ConfigurationsTabTypes.WEBHOOK) {
                const { result } = await getWebhookConfiguration(configId)
                setState({
                    ...state,
                    webhookConfigId: configId,
                    webhookConfig: {
                        ...result,
                        channel: DeleteComponentsName.WebhookConfigurationTab,
                    },
                    confirmation: true,
                    showDeleteConfigModalType: ConfigurationsTabTypes.WEBHOOK,
                })
            }
        } catch (e) {
            showError(e)
        }
    }

    const toggleConfirmation = (confirmation) => {
        setState({
            ...state,
            confirmation,
            ...(!confirmation && { showDeleteConfigModalType: ConfigurationsTabTypes.SES }),
        })
    }

    const deleteConfigPayload = (): any => {
        const { showDeleteConfigModalType, slackConfig, sesConfig, webhookConfig, smtpConfig } = state
        if (showDeleteConfigModalType === ConfigurationsTabTypes.SLACK) {
            return slackConfig
        }
        if (showDeleteConfigModalType === ConfigurationsTabTypes.SES) {
            return sesConfig
        }
        if (showDeleteConfigModalType === ConfigurationsTabTypes.WEBHOOK) {
            return webhookConfig
        }
        return smtpConfig
    }

    const payload = deleteConfigPayload()

    if (state.view === ViewType.LOADING) {
        return (
            <div className="h-100">
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

    const renderModal = () => {
        if (queryString.get('configId') === null) return null
        const configId = parseInt(queryString.get('configId') || '0', 10)

        switch (modal) {
            case ConfigurationsTabTypes.SES:
                return (
                    <SESConfigModal
                        sesConfigId={configId}
                        shouldBeDefault={state.sesConfigurationList.length === 0}
                        onSaveSuccess={getAllChannelConfigs}
                    />
                )
            case ConfigurationsTabTypes.SMTP:
                return (
                    <SMTPConfigModal
                        smtpConfigId={configId}
                        shouldBeDefault={state.smtpConfigurationList.length === 0}
                        onSaveSuccess={getAllChannelConfigs}
                    />
                )
            case ConfigurationsTabTypes.SLACK:
                return <SlackConfigModal slackConfigId={configId} onSaveSuccess={getAllChannelConfigs} />
            case ConfigurationsTabTypes.WEBHOOK:
                return <WebhookConfigModal webhookConfigId={configId} onSaveSuccess={getAllChannelConfigs} />
            default:
                return null
        }
    }

    const reloadDeleteConfig = () => {
        setState({ ...state, deleting: false })
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        getAllChannelConfigs()
    }

    const renderTableComponent = () => {
        switch (modal) {
            case ConfigurationsTabTypes.SES:
                return <SESConfigurationTable state={state} deleteClickHandler={deleteClickHandler} />
            case ConfigurationsTabTypes.SMTP:
                return <SMTPConfigurationTable state={state} deleteClickHandler={deleteClickHandler} />
            case ConfigurationsTabTypes.SLACK:
                return <SlackConfigurationTable state={state} deleteClickHandler={deleteClickHandler} />
            case ConfigurationsTabTypes.WEBHOOK:
                return <WebhookConfigurationTable state={state} deleteClickHandler={deleteClickHandler} />
            default:
                return null
        }
    }

    return (
        <div className="configuration-tab__container bcn-0 h-100 flexbox-col dc__gap-16 pt-16">
            <ConfigurationTabSwitcher />
            <Switch>
                <Route path={path} render={renderTableComponent} />
            </Switch>
            {renderModal()}

            {state.confirmation && (
                <DeleteComponent
                    deleteComponent={deleteNotification}
                    payload={payload}
                    title={payload.configName}
                    toggleConfirmation={toggleConfirmation}
                    component={getDeleteConfigComponent(state.showDeleteConfigModalType)}
                    confirmationDialogDescription={DC_CONFIGURATION_CONFIRMATION_MESSAGE}
                    reload={reloadDeleteConfig}
                    configuration="configuration"
                />
            )}
        </div>
    )
}
