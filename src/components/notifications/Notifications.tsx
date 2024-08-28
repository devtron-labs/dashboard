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
import { Switch, NavLink, Route, Redirect, RouteComponentProps } from 'react-router-dom'
import { ErrorScreenNotAuthorized, FeatureTitleWithInfo } from '@devtron-labs/devtron-fe-common-lib'
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
            <div className="notification-page">
                <div className="notification-page__header">
                    <FeatureTitleWithInfo
                        title={HEADER_TEXT.NOTIFICATIONS.title}
                        renderDescriptionContent={() => HEADER_TEXT.NOTIFICATIONS.description}
                        docLink={DOCUMENTATION.GLOBAL_CONFIG_NOTIFICATION}
                        showInfoIconTippy
                        dataTestId="notifications-feature-title"
                    />
                    <ul className="tab-list">
                        <li className="tab-list__tab">
                            <NavLink
                                data-testid="notifications-link-button"
                                to={`${this.props.match.path}/channels`}
                                className="tab-list__tab-link"
                            >
                                Notifications
                            </NavLink>
                        </li>
                        <li className="tab-list__tab">
                            <NavLink
                                data-testid="configurations-link-button"
                                to={`${this.props.match.path}/configurations`}
                                className="tab-list__tab-link"
                            >
                                Configurations
                            </NavLink>
                        </li>
                    </ul>
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
