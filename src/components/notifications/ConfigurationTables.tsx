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

import { Switch, Route, useRouteMatch } from 'react-router-dom'
import { DeleteComponentsName } from '@Config/constantMessaging'
import { showError } from '@devtron-labs/devtron-fe-common-lib'
import { ConfigurationsTabTypes } from './constants'
import SESConfigurationTable from './SESConfigurationTable'
import SlackConfigurationTable from './SlackConfigurationTable'
import { SMTPConfigurationTable } from './SMTPConfigurationTable'
import { WebhookConfigurationTable } from './WebhookConfigurationTable'
import { ConfigurationTablesTypes } from './types'
import {
    getSlackConfiguration,
    getSESConfiguration,
    getSMTPConfiguration,
    getWebhookConfiguration,
} from './notifications.service'

export const ConfigurationTables = ({ activeTab, state, setState }: ConfigurationTablesTypes) => {
    const { path } = useRouteMatch()

    const deleteClickHandler = (configId, type: ConfigurationsTabTypes) => async () => {
        try {
            if (type === ConfigurationsTabTypes.SLACK) {
                const { result } = await getSlackConfiguration(configId, true)
                setState({
                    ...state,
                    slackConfig: {
                        ...result,
                        channel: ConfigurationsTabTypes.SLACK,
                    },
                    confirmation: true,
                    activeTab: ConfigurationsTabTypes.SLACK,
                })
            } else if (type === ConfigurationsTabTypes.SES) {
                const { result } = await getSESConfiguration(configId)
                setState({
                    ...state,
                    sesConfig: {
                        ...result,
                        channel: ConfigurationsTabTypes.SES,
                    },
                    confirmation: true,
                    activeTab: ConfigurationsTabTypes.SES,
                })
            } else if (type === ConfigurationsTabTypes.SMTP) {
                const { result } = await getSMTPConfiguration(configId)
                setState({
                    ...state,
                    smtpConfig: {
                        ...result,
                        channel: ConfigurationsTabTypes.SMTP,
                    },
                    confirmation: true,
                    activeTab: ConfigurationsTabTypes.SMTP,
                })
            } else if (type === ConfigurationsTabTypes.WEBHOOK) {
                const { result } = await getWebhookConfiguration(configId)
                setState({
                    ...state,
                    webhookConfig: {
                        ...result,
                        channel: DeleteComponentsName.WebhookConfigurationTab,
                    },
                    confirmation: true,
                    activeTab: ConfigurationsTabTypes.WEBHOOK,
                })
            }
        } catch (e) {
            showError(e)
        }
    }
    const renderTableComponent = () => {
        switch (activeTab) {
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

    const renderTableRoute = () => (
        <Switch>
            <Route path={path} render={renderTableComponent} />
        </Switch>
    )

    return renderTableRoute()
}
