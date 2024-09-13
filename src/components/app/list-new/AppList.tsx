/* eslint-disable jsx-a11y/anchor-is-valid */
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

import React, { useState, useEffect, useMemo } from 'react'
import { Switch, Route, useLocation, useHistory, useParams } from 'react-router-dom'
import {
    Progressing,
    stopPropagation,
    useAsync,
    useMainContext,
    HeaderWithCreateButton,
    AppListConstants,
    useUrlFilters,
    TabGroup,
    TabProps,
    FilterChips,
    handleUTCTime,
    ModuleNameMap,
    getNamespaceListMin,
} from '@devtron-labs/devtron-fe-common-lib'
import { getCommonAppFilters } from '@Services/service'
import { useAppContext } from '../../common'
import { SERVER_MODE, DOCUMENTATION, URLS } from '../../../config'
import HelmAppList from './HelmAppList'
import { AppListPropType } from '../list/types'
import { AddNewApp } from '../create/CreateApp'
import '../list/list.scss'
import EAEmptyState, { EAEmptyStateType } from '../../common/eaEmptyState/EAEmptyState'
import { FLUX_CD_HELM_RELEASE_LABEL } from './Constants'
import { getModuleInfo } from '../../v2/devtronStackManager/DevtronStackManager.service'
import {
    getAppStatusFormattedValue,
    getChangeAppTabURL,
    getCurrentTabName,
    getFormattedFilterLabel,
    parseSearchParams,
} from './list.utils'
import GenericAppList from './GenericAppList'
import {
    AppListFilterConfig,
    AppListSortableKeys,
    AppListUrlFilters,
    AppListUrlFiltersType,
    FluxCDTemplateType,
} from './AppListType'
import DevtronAppList from '../list/DevtronAppListContainer'
import AppListFilters from './AppListFilters'

let interval

const AppList = ({ isArgoInstalled }: AppListPropType) => {
    const location = useLocation()
    const history = useHistory()
    const params = useParams<{ appType: string }>()
    const { serverMode } = useMainContext()
    const { setCurrentAppName } = useAppContext()

    const [lastDataSyncTimeString, setLastDataSyncTimeString] = useState<React.ReactNode>('')
    const [isDataSyncing, setDataSyncing] = useState(false)
    const [syncListData, setSyncListData] = useState<boolean>()
    const [currentTab, setCurrentTab] = useState<string>(getCurrentTabName(params.appType))
    const [fetchingExternalApps, setFetchingExternalApps] = useState<boolean>(false)
    const [appCount, setAppCount] = useState<number>(0)
    const [showPulsatingDot, setShowPulsatingDot] = useState<boolean>(false)

    // check for external argoCD app
    const isExternalArgo =
        window._env_?.ENABLE_EXTERNAL_ARGO_CD && params.appType === AppListConstants.AppType.ARGO_APPS

    // check for external fluxCD app
    const isExternalFlux =
        window._env_?.FEATURE_EXTERNAL_FLUX_CD_ENABLE && params.appType === AppListConstants.AppType.FLUX_APPS

    // view other than devtron or helm app list
    const isGenericAppListView = isExternalArgo || isExternalFlux

    // filters
    const urlFilters = useUrlFilters<AppListSortableKeys, AppListUrlFiltersType>({
        initialSortKey: AppListSortableKeys.APP_NAME,
        parseSearchParams,
    })
    const {
        searchKey,
        pageSize,
        offset,
        sortBy,
        sortOrder,
        appStatus,
        environment,
        namespace,
        cluster,
        project,
        templateType,
        handleSorting,
        changePage,
        changePageSize,
        clearFilters,
        handleSearch,
        updateSearchParams,
    } = urlFilters

    const filterConfig: AppListFilterConfig = useMemo(
        () => ({
            offset,
            pageSize,
            searchKey,
            sortBy,
            sortOrder,
            appStatus,
            project,
            environment,
            cluster,
            namespace,
            templateType,
        }),
        [
            offset,
            pageSize,
            searchKey,
            sortBy,
            sortOrder,
            JSON.stringify(appStatus),
            JSON.stringify(project),
            JSON.stringify(environment),
            JSON.stringify(cluster),
            JSON.stringify(namespace),
            JSON.stringify(templateType),
        ],
    )

    const [appListFiltersLoading, appListFiltersResponse, appListFiltersError, reloadAppListFilters] = useAsync(
        () => getCommonAppFilters(serverMode),
        [],
    )

    const clusterIdsArray = cluster.map((clusterId) => +clusterId)
    const clusterIdsCsv = cluster.join()

    const [namespaceListLoading, namespaceListResponse, namespaceListError, reloadNamespaceList] = useAsync(
        () => getNamespaceListMin(clusterIdsCsv),
        [clusterIdsCsv],
        !!clusterIdsCsv,
    )

    const getFormattedClusterValue = (filterValue: string) =>
        (appListFiltersResponse.isFullMode
            ? appListFiltersResponse.appListFilters.result.clusters
            : appListFiltersResponse.clusterList.result
        ).find((clusterItem) => clusterItem.id === +filterValue)?.cluster_name

    const getFormattedProjectValue = (filterValue: string) => {
        if (!+filterValue) return 'Apps with no project'
        return (
            appListFiltersResponse.isFullMode
                ? appListFiltersResponse.appListFilters.result.teams
                : appListFiltersResponse.projectList.result
        ).find((team) => team.id === +filterValue)?.name
    }

    const getFormattedFilterValue = (filterKey: AppListUrlFilters, filterValue: string): string => {
        switch (filterKey) {
            case AppListUrlFilters.cluster:
                return appListFiltersResponse ? getFormattedClusterValue(filterValue) : filterValue
            case AppListUrlFilters.project:
                return appListFiltersResponse ? getFormattedProjectValue(filterValue) : filterValue
            case AppListUrlFilters.environment:
                return appListFiltersResponse?.appListFilters.result.environments.find((env) => env.id === +filterValue)
                    ?.environment_name
            case AppListUrlFilters.namespace:
                return filterValue.split('_')[1]
            case AppListUrlFilters.templateType:
                return filterValue === FluxCDTemplateType.HELM_RELEASE ? FLUX_CD_HELM_RELEASE_LABEL : filterValue
            case AppListUrlFilters.appStatus:
                return getAppStatusFormattedValue(filterValue)
            default:
                return filterValue
        }
    }

    useEffect(() => {
        // To check whether namespaces are to be updated in url after cluster selection is changed
        if (!appListFiltersLoading) {
            const clusterIdsMap = new Map<number, boolean>()
            clusterIdsArray.forEach((clusterId) => {
                clusterIdsMap.set(clusterId, true)
            })
            const updatedNamespaces = namespace.filter(
                (currentNamespace) => clusterIdsMap.get(+currentNamespace.split('_')[0]) ?? false,
            )
            updateSearchParams({ namespace: updatedNamespaces })
        }
    }, [`${cluster}`])

    // In EA Mode if there is only one cluster select it
    useEffect(() => {
        if (serverMode === SERVER_MODE.EA_ONLY && appListFiltersResponse?.clusterList.result.length === 1) {
            updateSearchParams({ cluster: [String(appListFiltersResponse?.clusterList.result[0].id)] })
        }
    }, [appListFiltersResponse])

    // on page load
    useEffect(() => {
        setCurrentTab(getCurrentTabName(params.appType))
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        getModuleInfo(ModuleNameMap.CICD) // To check the latest status and show user reload toast
    }, [syncListData])

    const renderDataSyncingText = () => <span className="dc__loading-dots">Syncing</span>

    useEffect(() => {
        if (isDataSyncing) {
            setLastDataSyncTimeString(renderDataSyncingText)
        } else {
            const _lastDataSyncTime = Date()
            setLastDataSyncTimeString(`Last synced ${handleUTCTime(_lastDataSyncTime, true)}`)
            interval = setInterval(() => {
                setLastDataSyncTimeString(`Last synced ${handleUTCTime(_lastDataSyncTime, true)}`)
            }, 1000)
        }
        return () => {
            if (interval) {
                clearInterval(interval)
            }
        }
    }, [isDataSyncing])

    const updateDataSyncing = (loading: boolean): void => {
        setDataSyncing(loading)
    }

    function changeAppTab(appTabType) {
        if (appTabType === currentTab) {
            return
        }
        history.push(getChangeAppTabURL(appTabType))
        setCurrentTab(appTabType)
    }

    const syncNow = (): void => {
        setSyncListData(!syncListData)
    }

    const setFetchingExternalAppsState = (fetching: boolean): void => {
        setFetchingExternalApps(fetching)
    }

    const renderAppliedFilters = () => (
        <FilterChips<AppListUrlFiltersType>
            filterConfig={{ appStatus, project, cluster, environment, namespace, templateType }}
            onRemoveFilter={updateSearchParams}
            clearFilters={clearFilters}
            className="px-20"
            getFormattedLabel={getFormattedFilterLabel}
            getFormattedValue={getFormattedFilterValue}
        />
    )

    const renderAppTabs = () => {
        const tabs: TabProps[] = [
            ...(serverMode === SERVER_MODE.FULL
                ? [
                      {
                          id: 'devtron-apps',
                          label: 'Devtron Apps',
                          tabType: 'navLink' as const,
                          props: {
                              to: getChangeAppTabURL(AppListConstants.AppTabs.DEVTRON_APPS),
                              onClick: () => changeAppTab(AppListConstants.AppTabs.DEVTRON_APPS),
                          },
                      },
                  ]
                : []),
            {
                id: 'helm-apps',
                label: 'Helm Apps',
                tabType: 'navLink',
                props: {
                    to: getChangeAppTabURL(AppListConstants.AppTabs.HELM_APPS),
                    onClick: () => changeAppTab(AppListConstants.AppTabs.HELM_APPS),
                    'data-testid': 'helm-app-list-button',
                },
            },
            ...(window._env_?.ENABLE_EXTERNAL_ARGO_CD
                ? [
                      {
                          id: 'argo-cd-apps',
                          label: AppListConstants.AppTabs.ARGO_APPS,
                          tabType: 'navLink' as const,
                          props: {
                              to: getChangeAppTabURL(AppListConstants.AppTabs.ARGO_APPS),
                              onClick: () => changeAppTab(AppListConstants.AppTabs.ARGO_APPS),
                              'data-testid': 'argo-app-list-button',
                          },
                      },
                  ]
                : []),
            ...(window._env_?.FEATURE_EXTERNAL_FLUX_CD_ENABLE
                ? [
                      {
                          id: 'flux-cd-apps',
                          label: AppListConstants.AppTabs.FLUX_APPS,
                          tabType: 'navLink' as const,
                          props: {
                              to: getChangeAppTabURL(AppListConstants.AppTabs.FLUX_APPS),
                              onClick: () => changeAppTab(AppListConstants.AppTabs.FLUX_APPS),
                              'data-testid': 'flux-app-list-button',
                          },
                      },
                  ]
                : []),
        ]

        const rightComponent = (
            <div className="flex fs-13">
                {lastDataSyncTimeString &&
                    (params.appType === AppListConstants.AppType.DEVTRON_APPS ||
                        (params.appType === AppListConstants.AppType.HELM_APPS && !fetchingExternalApps)) && (
                        <>
                            <span data-testid="sync-now-text">{lastDataSyncTimeString}</span>
                            {!isDataSyncing && (
                                <>
                                    &nbsp;
                                    <button
                                        className="btn btn-link p-0 fw-6 cb-5 mb-2"
                                        type="button"
                                        onClick={syncNow}
                                        data-testid="sync-now-button"
                                    >
                                        Sync now
                                    </button>
                                </>
                            )}
                        </>
                    )}
                {params.appType === AppListConstants.AppType.HELM_APPS &&
                    fetchingExternalApps &&
                    renderDataSyncingText()}
            </div>
        )

        return (
            <div className="app-tabs-wrapper px-20">
                <TabGroup tabs={tabs} rightComponent={rightComponent} alignActiveBorderWithContainer />
            </div>
        )
    }

    const closeDevtronAppCreateModal = (e) => {
        stopPropagation(e)
        const _urlPrefix =
            currentTab === AppListConstants.AppTabs.DEVTRON_APPS ? URLS.DEVTRON_APP_LIST : URLS.HELM_APP_LIST
        history.push(`${_urlPrefix}${location.search}`)
    }

    function renderAppCreateRouter() {
        return (
            <Switch>
                <Route
                    path={`${URLS.DEVTRON_APP_LIST}/${AppListConstants.CREATE_DEVTRON_APP_URL}`}
                    render={(props) => (
                        <AddNewApp
                            close={closeDevtronAppCreateModal}
                            match={props.match}
                            location={props.location}
                            history={props.history}
                        />
                    )}
                />
                <Route
                    path={`${URLS.HELM_APP_LIST}/${AppListConstants.CREATE_DEVTRON_APP_URL}`}
                    render={(props) => (
                        <AddNewApp
                            close={closeDevtronAppCreateModal}
                            match={props.match}
                            location={props.location}
                            history={props.history}
                        />
                    )}
                />
            </Switch>
        )
    }

    return (
        <div className="flexbox-col h-100 dc__overflow-scroll">
            <HeaderWithCreateButton headerName="Applications" />
            <AppListFilters
                filterConfig={filterConfig}
                appCount={appCount}
                appListFiltersLoading={appListFiltersLoading}
                isArgoInstalled={isArgoInstalled}
                isExternalArgo={isExternalArgo}
                isExternalFlux={isExternalFlux}
                appListFiltersResponse={appListFiltersResponse}
                appListFiltersError={appListFiltersError}
                reloadAppListFilters={reloadAppListFilters}
                showPulsatingDot={showPulsatingDot}
                handleSearch={handleSearch}
                appType={params.appType}
                serverMode={serverMode}
                updateSearchParams={updateSearchParams}
                getFormattedFilterValue={getFormattedFilterValue}
                namespaceListError={namespaceListError}
                reloadNamespaceList={reloadNamespaceList}
                namespaceListResponse={namespaceListResponse}
            />
            {renderAppliedFilters()}
            {renderAppTabs()}
            {serverMode === SERVER_MODE.FULL && renderAppCreateRouter()}
            {params.appType === AppListConstants.AppType.DEVTRON_APPS && serverMode === SERVER_MODE.FULL && (
                <DevtronAppList
                    filterConfig={filterConfig}
                    environmentList={appListFiltersResponse?.appListFilters.result.environments}
                    namespaceList={namespaceListResponse?.result}
                    appFiltersResponseLoading={appListFiltersLoading || namespaceListLoading}
                    isArgoInstalled={isArgoInstalled}
                    clearAllFilters={clearFilters}
                    setCurrentAppName={setCurrentAppName}
                    changePage={changePage}
                    changePageSize={changePageSize}
                    handleSorting={handleSorting}
                    syncListData={syncListData}
                    updateDataSyncing={updateDataSyncing}
                    setAppCount={setAppCount}
                />
            )}
            {params.appType === AppListConstants.AppType.DEVTRON_APPS && serverMode === SERVER_MODE.EA_ONLY && (
                <div style={{ height: 'calc(100vh - 250px)' }}>
                    <EAEmptyState
                        title="Create, build, deploy and debug custom apps"
                        msg="Create custom application by connecting your code repository. Build and deploy images at the click of a button. Debug your applications using the interactive UI."
                        stateType={EAEmptyStateType.DEVTRONAPPS}
                        knowMoreLink={DOCUMENTATION.HOME_PAGE}
                    />
                </div>
            )}
            {params.appType === AppListConstants.AppType.HELM_APPS && (
                <>
                    <HelmAppList
                        serverMode={serverMode}
                        filterConfig={filterConfig}
                        clusterList={
                            appListFiltersResponse?.isFullMode
                                ? appListFiltersResponse.appListFilters.result.clusters
                                : appListFiltersResponse.clusterList.result
                        }
                        handleSorting={handleSorting}
                        clearAllFilters={clearFilters}
                        fetchingExternalApps={fetchingExternalApps}
                        setFetchingExternalAppsState={setFetchingExternalAppsState}
                        updateDataSyncing={updateDataSyncing}
                        syncListData={syncListData}
                        isArgoInstalled={isArgoInstalled}
                        clusterIdsCsv={clusterIdsCsv}
                        changePage={changePage}
                        changePageSize={changePageSize}
                        setShowPulsatingDot={setShowPulsatingDot}
                    />
                    {fetchingExternalApps && (
                        <div className="mt-16">
                            <Progressing size={32} />
                        </div>
                    )}
                </>
            )}
            {/* Currently Generic App List is used for ArgoCD and FluxCD app listing and can be used
                for further app lists too  */}
            {isGenericAppListView && (
                <GenericAppList
                    key={params.appType}
                    clearAllFilters={clearFilters}
                    filterConfig={filterConfig}
                    clusterList={
                        appListFiltersResponse?.isFullMode
                            ? appListFiltersResponse.appListFilters.result.clusters
                            : appListFiltersResponse.clusterList.result
                    }
                    clusterIdsCsv={clusterIdsCsv}
                    appType={params.appType}
                    changePage={changePage}
                    changePageSize={changePageSize}
                    handleSorting={handleSorting}
                    setShowPulsatingDot={setShowPulsatingDot}
                />
            )}
        </div>
    )
}

export default AppList
