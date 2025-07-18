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
import ReactGA from 'react-ga4'
import { generatePath, useHistory, useLocation, useParams, useRouteMatch } from 'react-router-dom'

import {
    BreadCrumb,
    handleAnalyticsEvent,
    noop,
    PageHeader,
    TabGroup,
    TabProps,
    URLS as CommonURLS,
    useBreadcrumb,
} from '@devtron-labs/devtron-fe-common-lib'

import { URLS } from '../../../config'
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

export const AppHeader = ({
    appName,
    appMetaInfo,
    reloadMandatoryProjects,
    appListOptions,
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
}: AppHeaderType) => {
    const { appId } = useParams<{ appId }>()
    const match = useRouteMatch()
    const history = useHistory()
    const location = useLocation()
    const currentPathname = useRef('')
    const { setCurrentAppName } = useAppContext()

    const [isMenuOpen, setMenuOpen] = useState(false)

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
            const tab = currentPathname.current.replace(match.url, '').split('/')[1]
            const newUrl = generatePath(match.path, { appId: value })
            history.push(`${newUrl}/${tab}`)
            ReactGA.event({
                category: 'App Selector',
                action: 'DA_SWITCH_SEARCHED_APP_CLICKED',
                label: tab,
            })
        },
        [location.pathname],
    )

    const { breadcrumbs } = useBreadcrumb(
        {
            alias: {
                ':appId(\\d+)': {
                    component: <AppSelector onChange={handleAppChange} appId={appId} appName={appName} />,
                    linked: false,
                },
                app: {
                    component: <span className="cb-5 fs-16 dc__capitalize">devtron apps</span>,
                    linked: true,
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
                    to: `${match.url}/${URLS.APP_OVERVIEW}`,
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
                    to: `${match.url}/${URLS.APP_DETAILS}`,
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
                    to: `${match.url}/${URLS.APP_TRIGGER}`,
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
                    to: `${match.url}/${URLS.APP_CI_DETAILS}`,
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
                    to: `${match.url}/${URLS.APP_CD_DETAILS}`,
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
                    to: `${match.url}/${URLS.APP_DEPLOYMENT_METRICS}`,
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
                    to: `${match.url}/${CommonURLS.APP_CONFIG}`,
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
            <BreadCrumb breadcrumbs={breadcrumbs} />
            <div className="dc__border-right ml-8 mr-8 h-16" />
            <AppGroupAppFilterContext.Provider value={contextValue}>
                <AppGroupAppFilter />
            </AppGroupAppFilterContext.Provider>
        </>
    )

    return <PageHeader breadCrumbs={renderBreadcrumbs} isBreadcrumbs showTabs renderHeaderTabs={renderAppDetailsTabs} />
}
