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
import {
    Button,
    ButtonVariantType,
    ComponentSizeType,
    ErrorScreenNotAuthorized,
    FeatureTitleWithInfo,
    Icon,
    TabGroup,
    TOAST_ACCESS_DENIED,
    ToastManager,
    ToastVariantType,
} from '@devtron-labs/devtron-fe-common-lib'
import { ConfigurationTab } from './ConfigurationTab'
import { NotificationTab } from './NotificationTab'
import { ErrorBoundary } from '../common'
import { HEADER_TEXT, URLS } from '../../config'
import './notifications.scss'
import { NotificationsProps, NotificationsState } from './types'

export default class Notifications extends Component<NotificationsProps, NotificationsState> {

    constructor(props) {
        super(props)
        this.state = {
            disableEdit: false,
        }
    }

    createNewNotification = () => {
        if (this.state.disableEdit) {
            ToastManager.showToast({
                variant: ToastVariantType.notAuthorized,
                description: TOAST_ACCESS_DENIED.SUBTITLE,
            })
        } else {
            this.props.history.push(URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS_NOTIFICATIONS_ADD_NEW)
        }
    }

    toggleDisableEdit = (disableEdit: boolean) => {
        this.setState({ disableEdit })
    }

    renderNotificationHeader() {
        return (
            <div className="notification-page bg__primary flexbox-col h-100">
                <div className="notification-page__header">
                    <div className="flex dc__content-space">
                        <FeatureTitleWithInfo
                            title={HEADER_TEXT.NOTIFICATIONS.title}
                            renderDescriptionContent={() => HEADER_TEXT.NOTIFICATIONS.description}
                            docLink="GLOBAL_CONFIG_NOTIFICATION"
                            showInfoIconTippy
                            dataTestId="notifications-feature-title"
                        />
                        <div className="flex right">
                            <Button
                                variant={ButtonVariantType.primary}
                                text="Add Notification"
                                size={ComponentSizeType.medium}
                                onClick={this.createNewNotification}
                                dataTestId="delete-notification-button"
                                startIcon={<Icon name="ic-add" color={null} />}
                            />
                        </div>
                    </div>
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
                        <Route
                            path={`${this.props.match.url}/channels`}
                            render={() => (
                                <NotificationTab
                                    disableEdit={this.state.disableEdit}
                                    toggleDisableEdit={this.toggleDisableEdit}
                                />
                            )}
                        />
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
