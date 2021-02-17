import React, { Component } from 'react';
import { Switch, NavLink, Route, Redirect } from 'react-router-dom'
import { RouteComponentProps } from 'react-router'
import { ConfigurationTab } from './ConfigurationTab';
import { NotificationTab } from './NotificationTab';
import { ErrorBoundary } from '../common';
import './notifications.css';
import { DOCUMENTATION } from '../../config';

interface NotificationsProps extends RouteComponentProps<{}> {

}

export default class Notifications extends Component<NotificationsProps, {}> {

    renderNotificationHeader() {
        return <div className="notification-page">
            <div className="notification-page__header">
                <h2 className="form__title">Notifications</h2>
                <p className="form__subtitle">
                    Manage notifications for build and deployment pipelines.&nbsp;
                    <a className="learn-more__href" rel="noreferrer noopener" href={DOCUMENTATION.GLOBAL_CONFIG_NOTIFICATION} target="_blank">Learn more about notifications</a>
                </p>
                <ul className="tab-list">
                    <li className='tab-list__tab'>
                        <NavLink to={`${this.props.match.path}/channels`} className="tab-list__tab-link">
                            Notifications
                        </NavLink>
                    </li>
                    <li className='tab-list__tab'>
                        <NavLink to={`${this.props.match.path}/configurations`} className="tab-list__tab-link">
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
    }

    render() {
        return this.renderNotificationHeader()
    }
}
