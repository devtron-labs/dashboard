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
import { Switch, Route, Redirect, NavLink, RouteComponentProps } from 'react-router-dom'
import { SecurityPoliciesTab } from './SecurityPoliciesTab'
import { SecurityScansTab } from './SecurityScansTab/SecurityScansTab'
import './security.scss'
import { DOCUMENTATION, SERVER_MODE, SERVER_MODE_TYPE } from '../../config'
import EAEmptyState, { EAEmptyStateType } from '../common/eaEmptyState/EAEmptyState'
import { PageHeader } from '@devtron-labs/devtron-fe-common-lib'

interface SecurityProps extends RouteComponentProps<{}> {
    serverMode: SERVER_MODE_TYPE
}

export class Security extends Component<SecurityProps> {
    renderRouter() {
        const { path } = this.props.match
        return (
            <Switch>
                <Route path={`${path}/scans`} component={SecurityScansTab} />
                <Route path={`${path}/policies`} component={SecurityPoliciesTab} />
                <Redirect to={`${path}/scans`} />
            </Switch>
        )
    }

    renderSecurityTabs = () => {
        const { path } = this.props.match
        return (
            <ul role="tablist" className="tab-list">
                <li className="tab-list__tab dc__ellipsis-right">
                    <NavLink activeClassName="active" to={`${path}/scans`} className="tab-list__tab-link">
                        Security Scans
                    </NavLink>
                </li>
                <li className="tab-list__tab">
                    <NavLink
                        activeClassName="active"
                        to={`${path}/policies`}
                        className="tab-list__tab-link"
                        data-testid="security-policy"
                    >
                        Security Policies
                    </NavLink>
                </li>
            </ul>
        )
    }

    getTippyContent = () => (
        <div className="px-12 pt-12 fs-13 fw-4">
            Devtron provides DevSecOps capabilities across your software development life cycle.
            <p className="pt-20 m-0">
            One of the key components of DevSecOps is the detection of security risks. Currently, Devtron supports the following types of scanning:
            </p>
            <ul className='pl-20'>
                <li>Image Scan</li>
                <li>Code Scan</li>
                <li>Kubernetes Manifest Scan</li>
            </ul>
        </div>
    )

    renderPageheader() {
        return (
            <PageHeader
                headerName="Security"
                tippyProps={{
                    isTippyCustomized: true,
                    tippyRedirectLink: DOCUMENTATION.SECURITY,
                    additionalContent: this.getTippyContent()
                }}
                showTabs
                renderHeaderTabs={this.renderSecurityTabs}
            />
        )
    }

    renderEmptyStateForEAOnlyMode = () => {
        return (
            <div style={{ height: 'calc(100vh - 250px)' }}>
                <EAEmptyState
                    title="Integrated DevSecOps"
                    msg="Enable security scanning to identify vulnerabilities in your container and protect from external attacks. Manage security policies to allow or block specific vulnerabilities."
                    stateType={EAEmptyStateType.SECURITY}
                    knowMoreLink={DOCUMENTATION.SECURITY}
                />
            </div>
        )
    }

    render() {
        return (
            <div className="security-scan bcn-0 flexbox-col flex-grow-1">
                {this.renderPageheader()}
                {this.props.serverMode === SERVER_MODE.EA_ONLY
                    ? this.renderEmptyStateForEAOnlyMode()
                    : this.renderRouter()}
            </div>
        )
    }
}
