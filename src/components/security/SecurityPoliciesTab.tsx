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

import { Switch, Route, Redirect, NavLink, useRouteMatch } from 'react-router-dom'
import { SecurityPolicyGlobal } from './SecurityPolicyGlobal'
import { SecurityPolicyCluster } from './SecurityPolicyCluster'
import { SecurityPolicyApp } from './SecurityPolicyApp'
import { SecurityPolicyEnvironment } from './SecurityPolicyEnvironment'
import { VulnerabilityExposure } from './AddCVEPolicy'
import { SecurityPageHeader } from './SecurityPageHeader'

export const SecurityPoliciesTab = () => {
    const { path } = useRouteMatch()
    const renderRouter = () => {
        return (
            <Switch>
                <Route path={`${path}/global`} component={SecurityPolicyGlobal} />
                <Route path={`${path}/clusters/:clusterId?`} component={SecurityPolicyCluster} />
                <Route path={`${path}/environments/:envId?`} component={SecurityPolicyEnvironment} />
                <Route path={`${path}/apps/:appId?`} component={SecurityPolicyApp} />
                <Route path={`${path}/vulnerability`} component={VulnerabilityExposure} />
                <Redirect to={`${path}/global`} />
            </Switch>
        )
    }

    return (
        <div className="security-scan-container bg__primary flexbox-col min-h-100">
            <SecurityPageHeader />
            <div className="security-policy flex-grow-1">
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
                <div className="flexbox-col security-policy__content">{renderRouter()}</div>
            </div>
        </div>
    )
}
