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
import { DOCUMENTATION, getDocumentationUrl, PageHeader, TabGroup } from '@devtron-labs/devtron-fe-common-lib'
import { SecurityPoliciesTab } from './SecurityPoliciesTab'
import { SecurityScansTab } from './SecurityScansTab/SecurityScansTab'
import './security.scss'
import { SERVER_MODE_TYPE } from '../../config'

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
            <TabGroup
                tabs={[
                    {
                        id: 'security-scans-tab',
                        label: 'Security Scans',
                        tabType: 'navLink',
                        props: {
                            to: `${path}/scans`,
                        },
                    },
                    {
                        id: 'security-policies-tab',
                        label: 'Security Policies',
                        tabType: 'navLink',
                        props: {
                            to: `${path}/policies`,
                            'data-testid': 'security-policy',
                        },
                    },
                ]}
                hideTopPadding
            />
        )
    }

    getTippyContent = () => (
        <div className="px-12 pt-12 fs-13 fw-4">
            Devtron provides DevSecOps capabilities across your software development life cycle.
            <p className="pt-20 m-0">
                One of the key components of DevSecOps is the detection of security risks. Currently, Devtron supports
                the following types of scanning:
            </p>
            <ul className="pl-20">
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
                    tippyRedirectLink: getDocumentationUrl(DOCUMENTATION.SECURITY),
                    additionalContent: this.getTippyContent(),
                }}
                showTabs
                renderHeaderTabs={this.renderSecurityTabs}
            />
        )
    }

    render() {
        return (
            <div className="security-scan-container bg__primary flexbox-col min-h-100">
                <div className="security-scan flexbox-col flex-grow-1">
                    {this.renderPageheader()}
                    {this.renderRouter()}
                </div>
            </div>
        )
    }
}
