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
import ReactGA from 'react-ga4'
import { Link, useRouteMatch } from 'react-router-dom'
import { AppListConstants, PageHeader, TabGroup, TabProps } from '@devtron-labs/devtron-fe-common-lib'
import { URLS } from '../../../config'
import './header.scss'
import IndexStore from '../appDetails/index.store'
import { ReactComponent as Settings } from '../../../assets/icons/ic-settings.svg'
import { ChartHeaderComponentType } from './appHeader.type'

const ChartHeaderComponent = ({ errorResponseCode }: ChartHeaderComponentType) => {
    const match = useRouteMatch()
    const appDetails = IndexStore.getAppDetails()

    const renderBreadcrumbs = () => {
        return (
            <div className="m-0 flex left ">
                <Link
                    to={`${URLS.APP}/${URLS.APP_LIST}/${AppListConstants.AppType.HELM_APPS}`}
                    className="dc__devtron-breadcrumb__item"
                >
                    <span className="cb-5 fs-16 cursor">Helm Apps </span>
                </Link>
                {Object.keys(appDetails).length > 0 && (
                    <>
                        <span className="fs-16 cn-9 ml-4 mr-4"> / </span>
                        <span className="fs-16 cn-9">{appDetails.appName}</span>
                    </>
                )}
            </div>
        )
    }

    const renderHelmDetailsTabs = () => {
        const tabs: TabProps[] = [
            {
                id: 'overview-tab',
                label: 'Overview',
                tabType: 'navLink',
                props: {
                    to: `${match.url}/${URLS.APP_OVERVIEW}`,
                    onClick: () => {
                        ReactGA.event({
                            category: 'App',
                            action: 'App Overview Clicked',
                        })
                    },
                },
            },
            {
                id: 'app-details-tab',
                label: 'App Details',
                tabType: 'navLink',
                props: {
                    to: `${match.url}/${URLS.APP_DETAILS}`,
                    onClick: () => {
                        ReactGA.event({
                            category: 'App',
                            action: 'App Details Clicked',
                        })
                    },
                },
            },
        ]

        if (!appDetails.deploymentAppDeleteRequest && !errorResponseCode) {
            tabs.push(
                {
                    id: 'configure-tab',
                    label: 'Configure',
                    tabType: 'navLink',
                    icon: Settings,
                    props: {
                        to: `${match.url}/${URLS.APP_VALUES}`,
                        onClick: () => {
                            ReactGA.event({
                                category: 'App',
                                action: 'Values Clicked',
                            })
                        },
                        ['data-testid']: 'helm-configure-link',
                    },
                },
                {
                    id: 'deployment-history-tab',
                    label: 'Deployment history',
                    tabType: 'navLink',
                    props: {
                        to: `${match.url}/${URLS.APP_DEPLOYMNENT_HISTORY}`,
                        onClick: () => {
                            ReactGA.event({
                                category: 'App',
                                action: 'Deployment history Clicked',
                            })
                        },
                    },
                },
            )
        }

        return <TabGroup tabs={tabs} hideTopPadding />
    }

    return (
        <div className="app-header-wrapper helm-app-page-header">
            <PageHeader
                isBreadcrumbs
                showTabs
                renderHeaderTabs={renderHelmDetailsTabs}
                breadCrumbs={renderBreadcrumbs}
                showAnnouncementHeader
            />
        </div>
    )
}

export default ChartHeaderComponent
