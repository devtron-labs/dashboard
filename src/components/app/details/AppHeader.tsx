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

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { generatePath, useLocation, useNavigate, useParams } from 'react-router-dom'

import {
    BASE_ROUTES,
    BreadCrumb,
    DOCUMENTATION,
    getApplicationManagementBreadcrumb,
    handleAnalyticsEvent,
    noop,
    PageHeader,
    ROUTER_URLS,
    TabGroup,
    TabProps,
    useBreadcrumb,
} from '@devtron-labs/devtron-fe-common-lib'

import { AppFilterTabs } from '@Components/ApplicationGroup/Constants'

import { FilterParentType } from '../../ApplicationGroup/AppGroup.types'
import AppGroupAppFilter from '../../ApplicationGroup/AppGroupAppFilter'
import { AppGroupAppFilterContext } from '../../ApplicationGroup/AppGroupDetailsRoute'
import { AppSelector } from '../../AppSelector'
import { useAppContext } from '../../common'
import { importComponentFromFELibrary } from '../../common/helpers/Helpers'
import { AppHeaderType } from '../types'

import './appDetails/appDetails.scss'
import './app.scss'

const MandatoryTagWarning = importComponentFromFELibrary('MandatoryTagWarning')

const DEVTRON_APP_ROUTES = BASE_ROUTES.APPLICATION_MANAGEMENT.DEVTRON_APP.DETAIL

export const AppHeader = ({
    appName,
    appMetaInfo,
    reloadMandatoryProjects,
    appListOptions,
    selectedAppList,
    setSelectedAppList,
    groupFilterOptions,
    selectedGroupFilter,
    setSelectedGroupFilter,
    openCreateGroup,
    openDeleteGroup,
    isSuperAdmin,
}: AppHeaderType) => {
    const { appId } = useParams<{ appId: string }>()
    const navigate = useNavigate()
    const location = useLocation()
    const currentPathname = useRef('')
    const { setCurrentAppName } = useAppContext()

    const [isMenuOpen, setMenuOpen] = useState(false)
    const [selectedFilterTab, setSelectedFilterTab] = useState<AppFilterTabs>(AppFilterTabs.GROUP_FILTER)

    const contextValue = useMemo(
        () => ({
            resourceId: appId,
            appListOptions,
            isMenuOpen,
            setMenuOpen,
            selectedAppList,
            setSelectedAppList,
            selectedFilterTab,
            setSelectedFilterTab,
            groupFilterOptions,
            selectedGroupFilter,
            setSelectedGroupFilter,
            openCreateGroup,
            openDeleteGroup,
            isSuperAdmin,
            filterParentType: FilterParentType.app,
        }),
        [
            appListOptions,
            isMenuOpen,
            selectedAppList,
            selectedFilterTab,
            groupFilterOptions,
            selectedGroupFilter,
            isSuperAdmin,
            appId,
        ],
    )

    function onClickTabPreventDefault(event: React.MouseEvent<Element, MouseEvent>, className: string) {
        const linkDisabled = (event.target as Element)?.classList.contains(className)
        if (linkDisabled) {
            event.preventDefault()
        }
    }

    function handleEventClick(event) {
        handleAnalyticsEvent({ category: 'App', action: event.currentTarget.dataset.action })
        onClickTabPreventDefault(event, 'active')
    }

    useEffect(() => {
        currentPathname.current = location.pathname
    }, [location.pathname])

    useEffect(() => {
        setCurrentAppName(appName)
    }, [appName])

    const handleAppChange = useCallback(
        ({ value }) => {
            const currentAppUrl = generatePath(ROUTER_URLS.DEVTRON_APP_DETAILS.ROOT, { appId })
            const tab = currentPathname.current.replace(currentAppUrl, '').split('/')[1]
            const newUrl = generatePath(ROUTER_URLS.DEVTRON_APP_DETAILS.ROOT, { appId: value })
            navigate(`${newUrl}/${tab}`)
            handleAnalyticsEvent({
                category: 'App Selector',
                action: 'DA_SWITCH_SEARCHED_APP_CLICKED',
            })
        },
        [location.pathname],
    )

    const { breadcrumbs } = useBreadcrumb(
        ROUTER_URLS.DEVTRON_APP_DETAILS.ROOT,
        {
            alias: {
                ...getApplicationManagementBreadcrumb(),
                'devtron-app': {
                    component: <span className="cb-5 fs-16 dc__capitalize">Devtron Apps</span>,
                    linked: true,
                },
                ':appId': {
                    component: <AppSelector onChange={handleAppChange} appId={+appId} appName={appName} />,
                    linked: false,
                },
            },
        },
        [appId, appName],
    )

    const renderAppDetailsTabs = () => {
        const showWarning =
            MandatoryTagWarning &&
            MandatoryTagWarning({
                labelTags: appMetaInfo?.labels,
                handleAddTag: noop,
                selectedProjectId: appMetaInfo?.projectId,
                showOnlyIcon: true,
                reloadProjectTags: reloadMandatoryProjects,
            })

        const tabs: TabProps[] = [
            {
                id: 'overview-tab',
                label: 'Overview',
                tabType: 'navLink',
                showWarning: !!showWarning,
                props: {
                    to: DEVTRON_APP_ROUTES.OVERVIEW,
                    'data-action': 'Overview Clicked',
                    'data-testid': 'overview-click',
                    onClick: handleEventClick,
                },
            },
            {
                id: 'app-details-tab',
                label: 'App Details',
                tabType: 'navLink',
                props: {
                    to: DEVTRON_APP_ROUTES.APP_DETAILS,
                    'data-action': 'App Details Clicked',
                    'data-testid': 'app-details-tab',
                    onClick: handleEventClick,
                },
            },
            {
                id: 'build-deploy-tab',
                label: 'Build & Deploy',
                tabType: 'navLink',
                props: {
                    to: DEVTRON_APP_ROUTES.TRIGGER,
                    'data-action': 'Build & Deploy Clicked',
                    'data-testid': 'build-deploy-click',
                    onClick: handleEventClick,
                },
            },
            {
                id: 'build-history-tab',
                label: 'Build History',
                tabType: 'navLink',
                props: {
                    to: DEVTRON_APP_ROUTES.CI_DETAILS,
                    'data-action': 'Build History Clicked',
                    'data-testid': 'build-history-clicked',
                    onClick: handleEventClick,
                },
            },
            {
                id: 'deployment-history-tab',
                label: 'Deployment History',
                tabType: 'navLink',
                props: {
                    to: DEVTRON_APP_ROUTES.CD_DETAILS,
                    'data-action': 'Deployment History Clicked',
                    'data-testid': 'deployment-history-link',
                    onClick: handleEventClick,
                },
            },
            {
                id: 'deployment-metrics-tab',
                label: 'Deployment Metrics',
                tabType: 'navLink',
                props: {
                    to: DEVTRON_APP_ROUTES.DEPLOYMENT_METRICS,
                    'data-action': 'Deployment Metrics Clicked',
                    'data-testid': 'deployment-matrix',
                    onClick: handleEventClick,
                },
            },
            {
                id: 'app-configuration-tab',
                label: 'Configurations',
                tabType: 'navLink',
                icon: 'ic-sliders-vertical',
                props: {
                    to: DEVTRON_APP_ROUTES.CONFIGURATIONS,
                    'data-action': 'App Configuration Clicked',
                    'data-testid': 'app-config-link',
                    onClick: handleEventClick,
                },
            },
        ]

        return <TabGroup tabs={tabs} hideTopPadding />
    }

    const renderBreadcrumbs = () => (
        <>
            <BreadCrumb breadcrumbs={breadcrumbs} path={ROUTER_URLS.DEVTRON_APP_DETAILS.ROOT} />
            <div className="dc__border-right ml-8 mr-8 h-16" />
            <AppGroupAppFilterContext.Provider value={contextValue}>
                <AppGroupAppFilter />
            </AppGroupAppFilterContext.Provider>
        </>
    )

    return (
        <PageHeader
            breadCrumbs={renderBreadcrumbs}
            isBreadcrumbs
            showTabs
            renderHeaderTabs={renderAppDetailsTabs}
            docPath={DOCUMENTATION.APP_MANAGEMENT}
        />
    )
}
