import React, { useCallback, useRef, useEffect, useState, useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { BreadCrumb, useBreadcrumb, noop, stopPropagation } from '@devtron-labs/devtron-fe-common-lib'
import { useParams, useRouteMatch, useHistory, generatePath, useLocation } from 'react-router'
import { URLS } from '../../../config'
import { AppSelector } from '../../AppSelector'
import ReactGA from 'react-ga4'
import { AppHeaderType } from '../types'
import { ReactComponent as Settings } from '../../../assets/icons/ic-settings.svg'
import PageHeader from '../../common/header/PageHeader'
import { importComponentFromFELibrary, trackByGAEvent } from '../../common/helpers/Helpers'
import AppGroupAppFilter from '../../ApplicationGroup/AppGroupAppFilter'
import './appDetails/appDetails.scss'
import './app.scss'
import { AppGroupAppFilterContext } from '../../ApplicationGroup/AppGroupDetailsRoute'
import { CreateGroupAppListType, FilterParentType, GroupOptionType } from '../../ApplicationGroup/AppGroup.types'
import CreateAppGroup from '../../ApplicationGroup/CreateAppGroup'

const MandatoryTagWarning = importComponentFromFELibrary('MandatoryTagWarning')

export function AppHeader({
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
}: AppHeaderType) {
    const { appId } = useParams<{ appId }>()
    const match = useRouteMatch()
    const history = useHistory()
    const location = useLocation()
    const currentPathname = useRef('')
    const [isMenuOpen, setMenuOpen] = useState(false)

    const contextValue = useMemo(
        () => ({
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
        ],
    )

    function onClickTabPreventDefault(event: React.MouseEvent<Element, MouseEvent>, className: string) {
        const linkDisabled = (event.target as Element)?.classList.contains(className)
        if (linkDisabled) {
            event.preventDefault()
        }
    }

    function handleEventClick(event) {
        trackByGAEvent('App', event.currentTarget.dataset.action)
        onClickTabPreventDefault(event, 'active')
    }

    useEffect(() => {
        currentPathname.current = location.pathname
    }, [location.pathname])

    const handleAppChange = useCallback(
        ({ label, value }) => {
            const tab = currentPathname.current.replace(match.url, '').split('/')[1]
            const newUrl = generatePath(match.path, { appId: value })
            history.push(`${newUrl}/${tab}`)
            ReactGA.event({
                category: 'App Selector',
                action: 'App Selection Changed',
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
        return (
            <ul role="tablist" className="tab-list">
                <li className="tab-list__tab dc__ellipsis-right">
                    <NavLink
                        activeClassName="active"
                        to={`${match.url}/${URLS.APP_OVERVIEW}`}
                        className="tab-list__tab-link flex"
                        data-action="Overview Clicked"
                        data-testid="overview-click"
                        onClick={handleEventClick}
                    >
                        Overview
                        {MandatoryTagWarning && (
                            <MandatoryTagWarning
                                labelTags={appMetaInfo?.labels}
                                handleAddTag={noop}
                                selectedProjectId={appMetaInfo?.projectId}
                                showOnlyIcon={true}
                                reloadProjectTags={reloadMandatoryProjects}
                            />
                        )}
                    </NavLink>
                </li>
                <li className="tab-list__tab dc__ellipsis-right">
                    <NavLink
                        data-testid="app-details-tab"
                        activeClassName="active"
                        to={`${match.url}/${URLS.APP_DETAILS}`}
                        className="tab-list__tab-link"
                        data-action="App Details Clicked"
                        onClick={handleEventClick}
                    >
                        App Details
                    </NavLink>
                </li>
                <li className="tab-list__tab">
                    <NavLink
                        activeClassName="active"
                        to={`${match.url}/${URLS.APP_TRIGGER}`}
                        className="tab-list__tab-link"
                        data-action="Build & Deploy Clicked"
                        onClick={handleEventClick}
                        data-testid="build-deploy-click"
                        id="build-deploy"
                    >
                        Build & Deploy
                    </NavLink>
                </li>
                <li className="tab-list__tab">
                    <NavLink
                        activeClassName="active"
                        to={`${match.url}/${URLS.APP_CI_DETAILS}`}
                        className="tab-list__tab-link"
                        data-action="Build History Clicked"
                        data-testid="build-history-clicked"
                        onClick={handleEventClick}
                    >
                        Build History
                    </NavLink>
                </li>
                <li className="tab-list__tab">
                    <NavLink
                        activeClassName="active"
                        to={`${match.url}/${URLS.APP_CD_DETAILS}`}
                        className="tab-list__tab-link"
                        data-action="Deployment History Clicked"
                        data-testid="deployment-history-link"
                        onClick={handleEventClick}
                    >
                        Deployment History
                    </NavLink>
                </li>
                <li className="tab-list__tab">
                    <NavLink
                        activeClassName="active"
                        to={`${match.url}/${URLS.APP_DEPLOYMENT_METRICS}`}
                        className="tab-list__tab-link"
                        data-testid="deployment-matrix"
                        data-action="Deployment Metrics Clicked"
                        onClick={handleEventClick}
                    >
                        Deployment Metrics
                    </NavLink>
                </li>
                <li className="tab-list__tab">
                    <NavLink
                        data-testid="app-config-link"
                        activeClassName="active"
                        to={`${match.url}/${URLS.APP_CONFIG}`}
                        className="tab-list__tab-link flex"
                        data-action="App Configuration Clicked"
                        onClick={handleEventClick}
                    >
                        <Settings className="tab-list__icon icon-dim-16 fcn-9 mr-4" />
                        App Configuration
                    </NavLink>
                </li>
            </ul>
        )
    }

    const renderBreadcrumbs = () => {
        return (
            <>
                <BreadCrumb breadcrumbs={breadcrumbs} />
                <div className="dc__border-right ml-8 mr-8 h-16" />
                <AppGroupAppFilterContext.Provider value={contextValue}>
                    <AppGroupAppFilter />
                </AppGroupAppFilterContext.Provider>
            </>
        )
    }

    return (
        <PageHeader
            breadCrumbs={renderBreadcrumbs}
            isBreadcrumbs={true}
            showTabs={true}
            renderHeaderTabs={renderAppDetailsTabs}
        />
    )
}
