import React, { Component } from 'react';
import { Switch, Route, Redirect, NavLink, RouteComponentProps } from 'react-router-dom';
import { SecurityPolicyGlobal } from './SecurityPolicyGlobal';
import { SecurityPolicyCluster } from './SecurityPolicyCluster';
import { SecurityPolicyApp } from './SecurityPolicyApp';
import { SecurityPolicyEnvironment } from './SecurityPolicyEnvironment';
import { VulnerabilityExposure } from './VulnerabilityExposure';

export class SecurityPoliciesTab extends Component<RouteComponentProps<{}>> {

    renderRouter() {
        const path = this.props.match.path;
        return <Switch>
            <Route path={`${path}/global`} component={SecurityPolicyGlobal} />
            <Route path={`${path}/clusters/:clusterId?`} component={SecurityPolicyCluster} />
            <Route path={`${path}/environments/:envId?`} component={SecurityPolicyEnvironment} />
            <Route path={`${path}/apps/:appId?`} component={SecurityPolicyApp} />
            <Route path={`${path}/vulnerability`} component={VulnerabilityExposure} />
            <Redirect to={`${path}/global`} />
        </Switch>
    }

    render() {
        const path = this.props.match.path;
        return (
            <div className="security-policy">
                <div className="dc__secondary-nav">
                    <NavLink
                        to={`${path}/global`}
                        className="dc__secondary-nav__item"
                        data-testid="click-on-security-global"
                    >
                        Global
                    </NavLink>
                    <NavLink
                        to={`${path}/clusters`}
                        className="dc__secondary-nav__item"
                        data-testid="click-on-security-clusters"
                    >
                        Cluster
                    </NavLink>
                    <NavLink
                        to={`${path}/environments`}
                        className="dc__secondary-nav__item"
                        data-testid="click-on-security-environments"
                    >
                        Environments
                    </NavLink>
                    <NavLink
                        to={`${path}/apps`}
                        className="dc__secondary-nav__item"
                        data-testid="click-on-security-application"
                    >
                        Applications
                    </NavLink>
                    <hr className="mt-8 mb-8" />
                    <NavLink
                        to={`${path}/vulnerability`}
                        className="dc__secondary-nav__item"
                        data-testid="click-on-security-vulnerability"
                    >
                        Check CVE Policy
                    </NavLink>
                </div>
                <div className="security-policy__content">{this.renderRouter()}</div>
            </div>
        )
    }
}