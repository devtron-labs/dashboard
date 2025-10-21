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

import ReactGA from 'react-ga4'
import { useRouteMatch } from 'react-router-dom'
import { BreadCrumb, BreadcrumbText, getInfrastructureManagementBreadcrumb, PageHeader, TabGroup, TabProps, useBreadcrumb } from '@devtron-labs/devtron-fe-common-lib'
import { URLS } from '../../../config'
import './header.scss'
import IndexStore from '../appDetails/index.store'
import { ReactComponent as Settings } from '../../../assets/icons/ic-settings.svg'
import { ChartHeaderComponentType } from './appHeader.type'

const ChartHeaderComponent = ({ errorResponseCode }: ChartHeaderComponentType) => {
    const match = useRouteMatch()
    const appDetails = IndexStore.getAppDetails()

    const { breadcrumbs } = useBreadcrumb(
        {
            alias: {
                ...getInfrastructureManagementBreadcrumb(),
                app: {
                    component: <span className="cb-5 fs-16 dc__capitalize">Helm Apps</span>,
                    linked: true,
                },
                deployments: {
                    component: <BreadcrumbText heading={appDetails.appName} isActive />,
                    linked: false,
                },
                dc: null,
                env: null,
                ':appId(\\d+)':  null,
                ':envId(\\d+)': null
            },
        },
        [appDetails.appName],
    )

    const renderBreadcrumbs = () => <BreadCrumb breadcrumbs={breadcrumbs} />

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
            />
        </div>
    )
}

export default ChartHeaderComponent
