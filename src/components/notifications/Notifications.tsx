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

import { Component } from 'react'
import { Switch, Route, Redirect, RouteComponentProps } from 'react-router-dom'
import { ErrorScreenNotAuthorized, FeatureTitleWithInfo, TabGroup } from '@devtron-labs/devtron-fe-common-lib'
import { ConfigurationTab } from './ConfigurationTab'
import { NotificationTab } from './NotificationTab'
import { ErrorBoundary } from '../common'
import { DOCUMENTATION, HEADER_TEXT } from '../../config'
import './notifications.scss'

interface NotificationsProps extends RouteComponentProps<{}> {
    isSuperAdmin: boolean
}

export default class Notifications extends Component<NotificationsProps, {}> {
    renderNotificationHeader() {
        return (
            <div className="notification-page bg__primary flexbox-col h-100">
                <div className="notification-page__header">
                    <FeatureTitleWithInfo
                        title={HEADER_TEXT.NOTIFICATIONS.title}
                        renderDescriptionContent={() => HEADER_TEXT.NOTIFICATIONS.description}
                        docLink={DOCUMENTATION.GLOBAL_CONFIG_NOTIFICATION}
                        showInfoIconTippy
                        dataTestId="notifications-feature-title"
                    />
                    <TabGroup
                        tabs={[
                            {
                                id: 'notifications-tab',
                                label: 'Notifications',
                                tabType: 'navLink',
                                props: {
                                    to: `${this.props.match.path}/channels`,
                                    'data-testid': 'notifications-link-button',
                                },
                            },
                            {
                                id: 'configurations-tab',
                                label: 'Configurations',
                                tabType: 'navLink',
                                props: {
                                    to: `${this.props.match.path}/configurations`,
                                    'data-testid': 'configurations-link-button',
                                },
                            },
                        ]}
                    />
                </div>
                <ErrorBoundary>
                    <Switch>
                        <Route path={`${this.props.match.url}/channels`} component={NotificationTab} />
                        <Route path={`${this.props.match.url}/configurations`} component={ConfigurationTab} />
                        <Redirect to={`${this.props.match.url}/channels`} />
                    </Switch>
                </ErrorBoundary>
            </div>
        )
    }

    render() {
        if (!this.props.isSuperAdmin) {
            return <ErrorScreenNotAuthorized />
        }
        return this.renderNotificationHeader()
    }
}
