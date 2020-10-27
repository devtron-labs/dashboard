import React, { Component } from 'react';
import { Switch, Route, Redirect, NavLink, RouteComponentProps } from 'react-router-dom';
import { SecurityPoliciesTab } from './SecurityPoliciesTab';
import { SecurityScansTab } from './SecurityScansTab';
import './security.css';

export class Security extends Component<RouteComponentProps<{}>> {

    renderRouter() {
        const path = this.props.match.path;
        return <Switch>
            <Route path={`${path}/scans`} component={SecurityScansTab} />
            <Route path={`${path}/policies`} component={SecurityPoliciesTab} />
            <Redirect to={`${path}/scans`} />
        </Switch>
    }

    renderPageheader() {
        const path = this.props.match.path;
        return <div className="page-header page-header--security position-rel">
            <h1 className="page-header__title mt-8">Security</h1>
            <ul role="tablist" className="tab-list">
                <li className="tab-list__tab ellipsis-right">
                    <NavLink activeClassName="active" to={`${path}/scans`} className="tab-list__tab-link">Security Scans</NavLink>
                </li>
                <li className="tab-list__tab">
                    <NavLink activeClassName="active" to={`${path}/policies`} className="tab-list__tab-link">Security Policies</NavLink>
                </li>
            </ul>
        </div>
    }

    render() {
        return <>
            {this.renderPageheader()}
            {this.renderRouter()}
        </>
    }
}