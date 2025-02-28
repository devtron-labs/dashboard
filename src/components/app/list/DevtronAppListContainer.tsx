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

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Tippy from '@tippyjs/react'
import { Link, useHistory } from 'react-router-dom'
import moment from 'moment'
import {
    abortPreviousRequests,
    AppListConstants,
    AppStatus,
    DATE_TIME_FORMATS,
    DEFAULT_BASE_PAGE_SIZE,
    ErrorScreenManager,
    GenericFilterEmptyState,
    getIsRequestAborted,
    handleUTCTime,
    Pagination,
    SortableTableHeaderCell,
    useAsync,
    useStickyEvent,
} from '@devtron-labs/devtron-fe-common-lib'
import ContentCard from '@Components/common/ContentCard/ContentCard'
import { HELM_GUIDED_CONTENT_CARDS_TEXTS } from '@Components/onboardingGuide/OnboardingGuide.constants'
import { CardLinkIconPlacement } from '@Components/common/ContentCard/ContentCard.types'
import { ReactComponent as PlayMedia } from '@Icons/ic-play-outline.svg'
import { appListModal, getDevtronAppListPayload } from './appList.modal'
import { App, DevtronAppExpandedState, DevtronAppListProps } from './types'
import { DEVTRON_NODE_DEPLOY_VIDEO, Routes, URLS } from '../../../config'
import { getAppList } from '../service'
import './list.scss'
import { AppListSortableKeys } from '../list-new/AppListType'
import NodeAppThumbnail from '../../../assets/img/node-app-thumbnail.png'
import DeployCICD from '../../../assets/img/guide-onboard.png'
import { appListLoadingArray, APP_LIST_HEADERS } from '../list-new/Constants'
import { ReactComponent as ArrowRight } from '../../../assets/icons/ic-arrow-right.svg'
import { ReactComponent as Arrow } from '../../../assets/icons/ic-dropdown-filled.svg'
import { ReactComponent as DevtronAppIcon } from '../../../assets/icons/ic-devtron-app.svg'
import { ReactComponent as ICHelpOutline } from '../../../assets/icons/ic-help-outline.svg'
import { ReactComponent as Edit } from '../../../assets/icons/ic-settings.svg'
import { ExpandedRow } from './expandedRow/ExpandedRow'
import { INITIAL_EXPANDED_STATE } from './constants'

const DevtronAppList = ({
    filterConfig,
    environmentList,
    namespaceList,
    appFiltersResponseLoading,
    syncListData,
    updateDataSyncing,
    setCurrentAppName,
    clearAllFilters,
    handleSorting,
    isArgoInstalled,
    changePage,
    changePageSize,
    setAppCount,
    appListContainerRef,
}: DevtronAppListProps) => {
    const history = useHistory()
    const [isHeaderStuck, setIsHeaderStuck] = useState(false)

    const { stickyElementRef } = useStickyEvent({
        identifier: 'app-list',
        containerRef: appListContainerRef,
        callback: setIsHeaderStuck,
    })

    const [expandedState, setExpandedState] = useState<DevtronAppExpandedState>(INITIAL_EXPANDED_STATE)

    const { searchKey, offset, pageSize, appStatus, project, environment, namespace, cluster, sortBy, sortOrder } =
        filterConfig

    const isSearchOrFilterApplied =
        searchKey || appStatus.length || project.length || environment.length || namespace.length || cluster.length

    const abortControllerRef = useRef<AbortController>(new AbortController())
    const [appListResponseLoading, appListResponse, appListError, appListReload] = useAsync(
        () =>
            abortPreviousRequests(
                () =>
                    getAppList(getDevtronAppListPayload(filterConfig, environmentList, namespaceList), {
                        signal: abortControllerRef.current.signal,
                    }),
                abortControllerRef,
            ),
        [filterConfig, syncListData],
        !appFiltersResponseLoading, // We need to wait until environment filters are created from cluster and namespace
    )

    const appListLoading = appListResponseLoading || getIsRequestAborted(appListError)

    const parsedAppList: App[] = useMemo(
        () => (appListResponse?.result?.appContainers ? appListModal(appListResponse.result.appContainers) : []),
        [appListResponse],
    )

    useEffect(() => {
        if (appListResponseLoading) {
            updateDataSyncing(true)
            return
        }
        updateDataSyncing(false)
        setExpandedState({
            ...expandedState,
            isAllExpandable: parsedAppList.some((app) => app.environments.length > 1),
        })
        setAppCount(appListResponse?.result?.appCount || 0)
    }, [appListResponseLoading])

    const handleEditApp = (appId: number): void => {
        const url = `/${Routes.APP}/${appId}/${Routes.EDIT}`
        history.push(url)
    }

    const handleEditAppRedirect = (event): void => {
        event.stopPropagation()
        event.preventDefault()
        handleEditApp(event.currentTarget.dataset.key)
    }

    const redirectToAppDetails = (app, envId: number): string => {
        setCurrentAppName(app.name)

        if (envId) {
            return `/${Routes.APP}/${app.id}/details/${envId}`
        }
        return `/${Routes.APP}/${app.id}/trigger`
    }

    const expandRow = (id: number): void => {
        setExpandedState((prevState) => ({ ...prevState, expandedRow: { ...prevState.expandedRow, [id]: true } }))
    }

    const expandEnv = (event): void => {
        event.stopPropagation()
        event.preventDefault()
        expandRow(event.currentTarget.dataset.key)
    }

    const closeExpandedRow = (id: number): void => {
        setExpandedState((prevState) => ({ ...prevState, expandedRow: { ...prevState.expandedRow, [id]: false } }))
    }

    const handleCloseExpandedRow = (event): void => {
        closeExpandedRow(event.currentTarget.dataset.key)
    }

    const toggleExpandAllRow = (): void => {
        setExpandedState((prevState) => {
            const _expandedRow = {}
            if (!prevState.isAllExpanded) {
                parsedAppList.forEach((app) => {
                    _expandedRow[app.id] = app.environments.length > 1
                })
            }

            return { ...prevState, expandedRow: _expandedRow, isAllExpanded: !prevState.isAllExpanded }
        })
    }

    const handleAppNameSorting = () => {
        handleSorting(AppListSortableKeys.APP_NAME)
    }

    const handleLastDeployedSorting = () => {
        handleSorting(AppListSortableKeys.LAST_DEPLOYED)
    }

    const getArrowIconClass = (): string => {
        if (expandedState.isAllExpandable) {
            return `fcn-7 dc__transition--transform ${expandedState.isAllExpanded ? '' : 'dc__flip-n90'}`
        }
        return 'cursor-not-allowed dc__flip-n90'
    }

    const renderGuidedCards = () => (
        <div className="devtron-app-guided-cards-container">
            <h2 className="fs-24 fw-6 lh-32 m-0 pt-40 dc__align-center">Create your first application</h2>
            <div className="devtron-app-guided-cards-wrapper">
                <ContentCard
                    datatestid="deploy-basic-k8snode"
                    redirectTo={DEVTRON_NODE_DEPLOY_VIDEO}
                    isExternalRedirect
                    imgSrc={NodeAppThumbnail}
                    title={HELM_GUIDED_CONTENT_CARDS_TEXTS.WatchVideo.title}
                    linkText={HELM_GUIDED_CONTENT_CARDS_TEXTS.WatchVideo.linkText}
                    LinkIcon={PlayMedia}
                    linkIconClass="scb-5 mr-8"
                    linkIconPlacement={CardLinkIconPlacement.BeforeLink}
                />
                <ContentCard
                    datatestid="create-application"
                    redirectTo={`${URLS.APP}/${URLS.APP_LIST}/${AppListConstants.AppType.DEVTRON_APPS}/${AppListConstants.CREATE_DEVTRON_APP_URL}`}
                    rootClassName="ev-5"
                    imgSrc={DeployCICD}
                    title={HELM_GUIDED_CONTENT_CARDS_TEXTS.StackManager.title}
                    linkText={HELM_GUIDED_CONTENT_CARDS_TEXTS.StackManager.createLintText}
                    LinkIcon={ArrowRight}
                    linkIconClass="scb-5"
                    linkIconPlacement={CardLinkIconPlacement.AfterLinkApart}
                />
            </div>
        </div>
    )

    if (!appListLoading && appListError) {
        return <ErrorScreenManager code={appListError.code} reload={appListReload} />
    }

    if (isSearchOrFilterApplied && appListResponse?.result?.appCount === 0) {
        return <GenericFilterEmptyState handleClearFilters={clearAllFilters} />
    }

    if (appListResponse?.result.appCount === 0) {
        return renderGuidedCards()
    }

    const renderEnvironmentList = (app: App) => {
        const envCount = app.environments.length
        if (envCount) {
            const isEnvConfigured = app?.defaultEnv.name
            return (
                <div className="app-list__cell app-list__cell--env">
                    <p
                        data-testid={`${app.defaultEnv.name}-environment`}
                        className={`app-list__cell--env-text ${isEnvConfigured ? '' : 'not-configured'}`}
                    >
                        {isEnvConfigured ? app.defaultEnv.name : 'Not configured'}
                    </p>
                    {envCount > 1 ? (
                        <button
                            type="button"
                            className="cell__link fs-13 dc__truncate-text mw-18"
                            data-key={app.id}
                            onClick={expandEnv}
                        >
                            +{envCount - 1} more
                        </button>
                    ) : null}
                </div>
            )
        }
        return <div className="app-list__cell app-list__cell--env" />
    }

    const renderAppList = () => (
        <div className="app-list" data-testid="app-list-container">
            <div
                ref={stickyElementRef}
                className={`app-list__header ${!isArgoInstalled ? 'app-list__header--argo-not-installed' : ''} dc__position-sticky dc__top-47 ${
                    isHeaderStuck ? 'dc__box-shadow--header' : ''
                }`}
            >
                <div className="app-list__cell--icon flex left cursor" onClick={toggleExpandAllRow}>
                    <Arrow className={`icon-dim-24 p-2 ${getArrowIconClass()}`} />
                </div>
                <div className="app-list__cell app-list__cell--name">
                    <SortableTableHeaderCell
                        title={APP_LIST_HEADERS.AppName}
                        isSorted={sortBy === AppListSortableKeys.APP_NAME}
                        sortOrder={sortOrder}
                        isSortable
                        triggerSorting={handleAppNameSorting}
                        disabled={false}
                    />
                </div>
                {isArgoInstalled && (
                    <div className="app-list__cell app-list__cell--app_status">
                        <span className="app-list__cell-header" data-testid="appstatus">
                            {APP_LIST_HEADERS.AppStatus}
                        </span>
                    </div>
                )}
                <div className="app-list__cell app-list__cell--env">
                    <span className="app-list__cell-header mr-4" data-testid="environment">
                        {APP_LIST_HEADERS.Environment}
                    </span>
                    <Tippy
                        data-testid="env-tippy"
                        className="default-tt w-200"
                        arrow={false}
                        placement="top"
                        content="Environment is a unique combination of cluster and namespace"
                    >
                        <div className="flex">
                            <ICHelpOutline className="icon-dim-16" />
                        </div>
                    </Tippy>
                </div>
                <div className="app-list__cell app-list__cell--cluster">
                    <span className="app-list__cell-header" data-testid="cluster">
                        {APP_LIST_HEADERS.Cluster}
                    </span>
                </div>
                <div className="app-list__cell app-list__cell--namespace">
                    <span className="app-list__cell-header" data-testid="namespace">
                        {APP_LIST_HEADERS.Namespace}
                    </span>
                </div>
                <div className="app-list__cell app-list__cell--time ">
                    <SortableTableHeaderCell
                        title={APP_LIST_HEADERS.LastDeployedAt}
                        isSorted={sortBy === AppListSortableKeys.LAST_DEPLOYED}
                        sortOrder={sortOrder}
                        isSortable
                        triggerSorting={handleLastDeployedSorting}
                        disabled={false}
                    />
                </div>
                <div className="app-list__cell app-list__cell--action" />
            </div>
            {appListLoading || appFiltersResponseLoading ? (
                <div className="cn-9 fs-13 fw-4 lh-20 show-shimmer-loading">
                    {appListLoadingArray.map((eachRow) => (
                        <div className="pl-20 resource-list__table-row" key={eachRow.id}>
                            {Object.keys(eachRow).map((eachKey) => (
                                <div className="child child-shimmer-loading" key={eachKey} />
                            ))}
                        </div>
                    ))}
                </div>
            ) : (
                parsedAppList.map((app) => {
                    const len = app.environments.length > 1
                    return (
                        <React.Fragment key={app.id}>
                            {!expandedState.expandedRow[app.id] ? (
                                <Link
                                    to={redirectToAppDetails(app, app.defaultEnv.id)}
                                    className={`app-list__row ${!isArgoInstalled ? 'app-list__row--argo-not-installed' : ''} ${len ? 'dc__hover-icon' : ''}`}
                                    data-testid="app-list-row"
                                >
                                    <div className="app-list__cell--icon">
                                        <DevtronAppIcon className="icon-dim-24 dc__show-first--icon" />
                                        {len && (
                                            <Arrow
                                                className="icon-dim-24 p-2 dc__flip-270 fcn-7 dc__show-second--icon"
                                                onClick={expandEnv}
                                                data-key={app.id}
                                            />
                                        )}
                                    </div>
                                    <div className="app-list__cell app-list__cell--name">
                                        <p className="dc__truncate-text m-0 value" data-testid="app-list-for-sort">
                                            {app.name}
                                        </p>
                                    </div>
                                    {isArgoInstalled && (
                                        <div
                                            className="app-list__cell app-list__cell--app_status"
                                            data-testid="devtron-app-status"
                                        >
                                            <AppStatus
                                                status={app.defaultEnv.appStatus}
                                                isVirtualEnv={app.defaultEnv.isVirtualEnvironment}
                                            />
                                        </div>
                                    )}
                                    {renderEnvironmentList(app)}
                                    <div className="app-list__cell app-list__cell--cluster">
                                        <p
                                            data-testid={`${app.defaultEnv.clusterName}-cluster`}
                                            className="dc__truncate-text  m-0"
                                        >
                                            {app.defaultEnv ? app.defaultEnv.clusterName : ''}
                                        </p>
                                    </div>
                                    <div className="app-list__cell app-list__cell--namespace">
                                        <p
                                            data-testid={`${app.defaultEnv.namespace}-namespace`}
                                            className="dc__truncate-text  m-0"
                                        >
                                            {app.defaultEnv ? app.defaultEnv.namespace : ''}
                                        </p>
                                    </div>
                                    <div className="app-list__cell app-list__cell--time">
                                        {app.defaultEnv?.lastDeployedTime && (
                                            <Tippy
                                                className="default-tt"
                                                arrow
                                                placement="top"
                                                content={moment(app.defaultEnv.lastDeployedTime).format(
                                                    DATE_TIME_FORMATS.TWELVE_HOURS_FORMAT,
                                                )}
                                            >
                                                <p className="dc__truncate-text  m-0" data-testid="last-deployed-time">
                                                    {handleUTCTime(app.defaultEnv.lastDeployedTime, true)}
                                                </p>
                                            </Tippy>
                                        )}
                                    </div>
                                    <div className="app-list__cell app-list__cell--action">
                                        <button
                                            data-testid="edit-app-button"
                                            type="button"
                                            aria-label="redirect-to-app-config"
                                            data-key={app.id}
                                            className="button-edit"
                                            onClick={handleEditAppRedirect}
                                        >
                                            <Edit className="button-edit__icon" />
                                        </button>
                                    </div>
                                </Link>
                            ) : null}
                            {expandedState.expandedRow[app.id] && (
                                <ExpandedRow
                                    app={app}
                                    close={handleCloseExpandedRow}
                                    redirect={redirectToAppDetails}
                                    handleEdit={handleEditApp}
                                    isArgoInstalled={isArgoInstalled}
                                />
                            )}
                        </React.Fragment>
                    )
                })
            )}
        </div>
    )

    const renderPagination = () => {
        if (appListResponse?.result.appCount > DEFAULT_BASE_PAGE_SIZE) {
            return (
                <Pagination
                    rootClassName="flex dc__content-space px-20"
                    size={appListResponse?.result.appCount}
                    pageSize={pageSize}
                    offset={offset}
                    changePage={changePage}
                    changePageSize={changePageSize}
                />
            )
        }
        return null
    }

    return (
        <>
            {renderAppList()}
            {renderPagination()}
        </>
    )
}

export default DevtronAppList
