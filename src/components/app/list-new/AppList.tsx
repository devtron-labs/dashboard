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

/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
    Switch,
    Route,
    useHistory,
    useParams,
    useRouteMatch,
    useLocation,
    Redirect,
    RedirectProps,
} from 'react-router-dom'
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
import { Cluster } from '@Services/service.types'
import { CreateAppModal } from '@Pages/App/CreateAppModal'
import { useAppContext } from '../../common'
import { SERVER_MODE } from '../../../config'
import HelmAppList from './HelmAppList'
import { AppListPropType } from '../list/types'
import '../list/list.scss'
import { APP_LIST_LOCAL_STORAGE_KEY, APP_LISTING_URLS, FLUX_CD_HELM_RELEASE_LABEL } from './Constants'
import { getModuleInfo } from '../../v2/devtronStackManager/DevtronStackManager.service'
import {
    getAppStatusFormattedValue,
    getChangeAppTabURL,
    getFilterChipConfig,
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
    const history = useHistory()
    const location = useLocation()
    const { url } = useRouteMatch()
    const params = useParams<{ appType: string }>()
    const { serverMode, isSuperAdmin } = useMainContext()
    const { setCurrentAppName } = useAppContext()

    const [lastDataSyncTimeString, setLastDataSyncTimeString] = useState<React.ReactNode>('')
    const [isDataSyncing, setDataSyncing] = useState(false)
    const [syncListData, setSyncListData] = useState<boolean>()
    const [fetchingExternalApps, setFetchingExternalApps] = useState<boolean>(false)
    const [appCount, setAppCount] = useState<number>(0)
    const [showPulsatingDot, setShowPulsatingDot] = useState<boolean>(false)

    const appListContainerRef = useRef<HTMLDivElement>(null)

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
        localStorageKey: APP_LIST_LOCAL_STORAGE_KEY,
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

    const getClusterList = (): Cluster[] => {
        if (appListFiltersResponse) {
            return appListFiltersResponse.isFullMode
                ? appListFiltersResponse.appListFilters.result.clusters
                : appListFiltersResponse.clusterList.result
        }
        return []
    }

    const getProjectList = () => {
        if (appListFiltersResponse) {
            return appListFiltersResponse.isFullMode
                ? appListFiltersResponse.appListFilters.result.teams
                : appListFiltersResponse.projectList.result
        }
        return []
    }

    const getFormattedClusterValue = (filterValue: string) =>
        getClusterList().find((clusterItem) => clusterItem.id === +filterValue)?.cluster_name

    const getFormattedProjectValue = (filterValue: string) => {
        if (!+filterValue) return 'Apps with no project'
        return getProjectList().find((team) => team.id === +filterValue)?.name
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
            // To clear template type filter if cluster filter is cleared
            // and clear environment filter if cluster is selected
            updateSearchParams({
                namespace: updatedNamespaces,
                templateType: clusterIdsCsv ? templateType : [],
                environment: clusterIdsCsv ? [] : environment,
            })
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

    const syncNow = (): void => {
        setSyncListData(!syncListData)
    }

    const setFetchingExternalAppsState = (fetching: boolean): void => {
        setFetchingExternalApps(fetching)
    }

    const renderAppliedFilters = () =>
        !appListFiltersLoading &&
        !appListFiltersError && (
            <FilterChips<Partial<AppListUrlFiltersType>>
                filterConfig={getFilterChipConfig(
                    { appStatus, project, environment, cluster, namespace, templateType },
                    params.appType,
                )}
                onRemoveFilter={updateSearchParams}
                clearFilters={clearFilters}
                className="px-20"
                getFormattedLabel={getFormattedFilterLabel}
                getFormattedValue={getFormattedFilterValue}
            />
        )

    const tabs: TabProps[] = [
        ...(serverMode === SERVER_MODE.FULL
            ? [
                  {
                      id: AppListConstants.AppType.DEVTRON_APPS,
                      label: 'Devtron Apps',
                      tabType: 'navLink' as const,
                      props: {
                          to: {
                              pathname: getChangeAppTabURL(AppListConstants.AppTabs.DEVTRON_APPS),
                              search: location.search,
                          },
                          'data-testid': 'devtron-app-list-button',
                      },
                  },
              ]
            : []),
        {
            id: AppListConstants.AppType.HELM_APPS,
            label: 'Helm Apps',
            tabType: 'navLink',
            props: {
                to: {
                    pathname: getChangeAppTabURL(AppListConstants.AppTabs.HELM_APPS),
                    search: location.search,
                },
                'data-testid': 'helm-app-list-button',
            },
        },
        ...(window._env_?.ENABLE_EXTERNAL_ARGO_CD && isSuperAdmin
            ? [
                  {
                      id: AppListConstants.AppType.ARGO_APPS,
                      label: AppListConstants.AppTabs.ARGO_APPS,
                      tabType: 'navLink' as const,
                      props: {
                          to: {
                              pathname: getChangeAppTabURL(AppListConstants.AppTabs.ARGO_APPS),
                              search: location.search,
                          },
                          'data-testid': 'argo-app-list-button',
                      },
                  },
              ]
            : []),
        ...(window._env_?.FEATURE_EXTERNAL_FLUX_CD_ENABLE && isSuperAdmin
            ? [
                  {
                      id: AppListConstants.AppType.FLUX_APPS,
                      label: AppListConstants.AppTabs.FLUX_APPS,
                      tabType: 'navLink' as const,
                      props: {
                          to: {
                              pathname: getChangeAppTabURL(AppListConstants.AppTabs.FLUX_APPS),
                              search: location.search,
                          },
                          'data-testid': 'flux-app-list-button',
                      },
                  },
              ]
            : []),
    ]

    const renderAppTabs = () => {
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
        history.push(`${url}${location.search}`)
    }

    function renderAppCreateRouter() {
        return (
            <Switch>
                {APP_LISTING_URLS.map((currentUrl) => (
                    <Route path={`${currentUrl}/${AppListConstants.CREATE_DEVTRON_APP_URL}`} key={currentUrl}>
                        <CreateAppModal handleClose={closeDevtronAppCreateModal} isJobView={false} />
                    </Route>
                ))}
            </Switch>
        )
    }

    return (
        <div ref={appListContainerRef} className="flexbox-col h-100 dc__overflow-auto">
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
                    appListContainerRef={appListContainerRef}
                />
            )}
            {params.appType === AppListConstants.AppType.HELM_APPS && (
                <>
                    <HelmAppList
                        serverMode={serverMode}
                        filterConfig={filterConfig}
                        clusterList={getClusterList()}
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
                        appListContainerRef={appListContainerRef}
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
                    clusterList={getClusterList()}
                    clusterIdsCsv={clusterIdsCsv}
                    appType={params.appType}
                    changePage={changePage}
                    changePageSize={changePageSize}
                    handleSorting={handleSorting}
                    setShowPulsatingDot={setShowPulsatingDot}
                    appListContainerRef={appListContainerRef}
                />
            )}
            {tabs.every((tab) => tab.id !== params.appType) && <Redirect {...(tabs[0].props as RedirectProps)} />}
        </div>
    )
}

export default AppList
