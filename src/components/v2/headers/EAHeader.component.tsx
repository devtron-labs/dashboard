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

import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import ReactGA from 'react-ga4'
import { useParams, useRouteMatch } from 'react-router'
import { PageHeader, AppListConstants } from '@devtron-labs/devtron-fe-common-lib'
import { URLS } from '../../../config'
import './header.scss'
import { ReactComponent as Settings } from '../../../assets/icons/ic-settings.svg'
import { EAHeaderComponentType } from './appHeader.type'

const EAHeaderComponent = ({ title, redirectURL, appType }: EAHeaderComponentType) => {
    const match = useRouteMatch()
    const params = useParams<{ appId: string; appName: string }>()

    const renderBreadcrumbs = () => {
        return (
            <div className="m-0 flex left fs-12 cn-9fw-4 fs-16">
                <Link to={redirectURL} className="dc__devtron-breadcrumb__item">
                    <div className="cb-5">{title}</div>
                </Link>
                <span className="ml-4 mr-4">/</span>
                <span>{params.appName}</span>
            </div>
        )
    }
    const renderExternalHelmApp = () => {
        return (
            <ul role="tablist" className="tab-list">
                <li className="tab-list__tab">
                    <NavLink
                        activeClassName="active"
                        to={`${match.url}/${URLS.APP_DETAILS}`}
                        className="tab-list__tab-link"
                        onClick={(event) => {
                            ReactGA.event({
                                category: 'External App',
                                action: 'External App Details Clicked',
                            })
                        }}
                    >
                        App details
                    </NavLink>
                </li>
                {appType !== AppListConstants.AppType.ARGO_APPS && (
                    <>
                        <li className="tab-list__tab">
                            <NavLink
                                activeClassName="active"
                                to={`${match.url}/${URLS.APP_VALUES}`}
                                className="tab-list__tab-link flex"
                                onClick={(event) => {
                                    ReactGA.event({
                                        category: 'External App',
                                        action: 'External App Values Clicked',
                                    })
                                }}
                            >
                                <Settings className="tab-list__icon icon-dim-16 fcn-7 mr-4" />
                                Configure
                            </NavLink>
                        </li>
                        <li className="tab-list__tab">
                            <NavLink
                                activeClassName="active"
                                to={`${match.url}/${URLS.APP_DEPLOYMNENT_HISTORY}`}
                                className="tab-list__tab-link"
                                onClick={(event) => {
                                    ReactGA.event({
                                        category: 'External App',
                                        action: 'External App Deployment history Clicked',
                                    })
                                }}
                            >
                                Deployment history
                            </NavLink>
                        </li>
                    </>
                )}
            </ul>
        )
    }
    return (
        <div className="app-header-wrapper helm-app-page-header" style={{ gridTemplateColumns: 'unset' }}>
            <PageHeader
                isBreadcrumbs
                showTabs
                renderHeaderTabs={renderExternalHelmApp}
                breadCrumbs={renderBreadcrumbs}
                showAnnouncementHeader
            />
        </div>
    )
}

export default EAHeaderComponent
