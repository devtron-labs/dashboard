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

import { Navigate, NavLink, Route, Routes } from 'react-router-dom'

import {
    BreadCrumb,
    BreadcrumbText,
    DOCUMENTATION,
    getSecurityCenterBreadcrumb,
    PageHeader,
    ROUTER_URLS,
    useBreadcrumb,
} from '@devtron-labs/devtron-fe-common-lib'

import { SecurityPolicyGlobal } from './SecurityPolicyGlobal'
import SecurityPolicyClusterWithParams from './SecurityPolicyCluster'
import SecurityPolicyAppWithParams from './SecurityPolicyApp'
import SecurityPolicyEnvironmentWithParams from './SecurityPolicyEnvironment'
import { VulnerabilityExposure } from './AddCVEPolicy'

export const SecurityPoliciesTab = () => {
    const { breadcrumbs } = useBreadcrumb(ROUTER_URLS.SECURITY_CENTER_POLICIES, {
        alias: {
            ...getSecurityCenterBreadcrumb(),
            policies: {
                component: <BreadcrumbText heading="Security Policies" isActive />,
            },
        },
    })

    const renderBreadcrumbs = () => <BreadCrumb breadcrumbs={breadcrumbs} path={ROUTER_URLS.SECURITY_CENTER_POLICIES} />

    const renderRouter = () => (
        <Routes>
            <Route path="global" element={<SecurityPolicyGlobal />} />
            <Route path="clusters/:clusterId?" element={<SecurityPolicyClusterWithParams />} />
            <Route path="environments/:envId?" element={<SecurityPolicyEnvironmentWithParams />} />
            <Route path="apps/:appId?" element={<SecurityPolicyAppWithParams />} />
            <Route path="vulnerability" element={<VulnerabilityExposure />} />
            <Route path="*" element={<Navigate to="global" replace />} />
        </Routes>
    )

    return (
        <div className="security-scan-container bg__primary flexbox-col min-h-100">
            <PageHeader isBreadcrumbs breadCrumbs={renderBreadcrumbs} docPath={DOCUMENTATION.SECURITY_CENTER} />

            <div className="security-policy flex-grow-1">
                <div className="dc__secondary-nav">
                    <NavLink to="global" className="dc__secondary-nav__item" data-testid="click-on-security-global">
                        Global
                    </NavLink>
                    <NavLink to="clusters" className="dc__secondary-nav__item" data-testid="click-on-security-clusters">
                        Cluster
                    </NavLink>
                    <NavLink
                        to="environments"
                        className="dc__secondary-nav__item"
                        data-testid="click-on-security-environments"
                    >
                        Environments
                    </NavLink>
                    <NavLink to="apps" className="dc__secondary-nav__item" data-testid="click-on-security-application">
                        Applications
                    </NavLink>
                    <hr className="mt-8 mb-8" />
                    <NavLink
                        to="vulnerability"
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
