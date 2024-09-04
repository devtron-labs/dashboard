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
    SearchBar,
    ComponentSizeType,
    FilterSelectPicker,
    SelectPickerOptionType,
    getNamespaceListMin,
    GroupedOptionsType,
    FilterChips,
    Tooltip,
    handleUTCTime,
    stringComparatorBySortOrder,
    ModuleNameMap,
} from '@devtron-labs/devtron-fe-common-lib'
import { getAppFilters, getClusterListMinWithoutAuth } from '@Services/service'
import { getProjectList } from '@Components/project/service'
import { useAppContext } from '../../common'
import { SERVER_MODE, DOCUMENTATION, URLS } from '../../../config'
import HelmAppList from './HelmAppList'
import { AppListPropType } from '../list/types'
import { AddNewApp } from '../create/CreateApp'
import '../list/list.scss'
import EAEmptyState, { EAEmptyStateType } from '../../common/eaEmptyState/EAEmptyState'
import ExportToCsv from '../../common/ExportToCsv/ExportToCsv'
import { FILE_NAMES } from '../../common/ExportToCsv/constants'
import { getUserRole } from '../../../Pages/GlobalConfigurations/Authorization/authorization.service'
import {
    APP_STATUS_FILTER_OPTIONS,
    APPS_WITH_NO_PROJECT_OPTION,
    TEMPLATE_TYPE_FILTER_OPTIONS,
    SELECT_CLUSTER_TIPPY,
    FLUX_CD_HELM_RELEASE_LABEL,
} from './Constants'
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
    AppStatuses,
    FluxCDTemplateType,
} from './AppListType'
import DevtronAppList from '../list/DevtronAppListContainer'
import { getDevtronAppListDataToExport } from './AppListService'

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
    const [currentTab, setCurrentTab] = useState(getCurrentTabName(params.appType))
    const [fetchingExternalApps, setFetchingExternalApps] = useState(false)
    const [appCount, setAppCount] = useState(0)
    const [showPulsatingDot, setShowPulsatingDot] = useState(false)

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
    const [, userRoleResponse] = useAsync(getUserRole, [])

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

    const [appListFilterLoading, appListFilterResponse, appListFiltersError, reloadAppFilters] = useAsync(
        getAppFilters,
        [],
        serverMode === SERVER_MODE.FULL,
    )

    const [projectListLoading, projectListResponse, projectListError, reloadProjectOptions] = useAsync(
        () => getProjectList(),
        [],
        serverMode === SERVER_MODE.EA_ONLY,
    )

    const [clusterListLoading, clusterListResponse, clusterListError, reloadClusterOptions] = useAsync(
        () => getClusterListMinWithoutAuth(),
        [],
        serverMode === SERVER_MODE.EA_ONLY,
    )

    const clusterIdsArray = cluster.map((clusterId) => +clusterId)
    const clusterIdsCsv = cluster.join()

    const [namespaceListLoading, namespaceListResponse, namespaceListError, reloadNamespaceOptions] = useAsync(
        () => getNamespaceListMin(clusterIdsCsv),
        [clusterIdsCsv],
        !!clusterIdsCsv,
    )

    const getFormattedFilterValue = (filterKey: AppListUrlFilters, filterValue: string) => {
        switch (filterKey) {
            case AppListUrlFilters.cluster:
                return appListFilterResponse?.result.clusters.find((clusterItem) => clusterItem.id === +filterValue)
                    ?.cluster_name
            case AppListUrlFilters.project:
                return +filterValue
                    ? appListFilterResponse?.result.teams.find((team) => team.id === +filterValue)?.name
                    : 'Apps with no project'
            case AppListUrlFilters.environment:
                return appListFilterResponse?.result.environments.find((env) => env.id === +filterValue)
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

    const projectOptions: GroupedOptionsType[] = useMemo(
        () =>
            appListFilterResponse?.result
                ? [
                      { label: '', options: [APPS_WITH_NO_PROJECT_OPTION] },
                      appListFilterResponse?.result.teams.length > 0 && {
                          label: 'Projects',
                          options: [
                              ...(appListFilterResponse?.result?.teams.map((team) => ({
                                  label: team.name,
                                  value: String(team.id),
                              })) ?? []),
                              ...(projectListResponse?.result?.map((team) => ({
                                  label: team.name,
                                  value: String(team.id),
                              })) ?? []),
                          ].sort((a, b) => stringComparatorBySortOrder(a.label, b.label)),
                      },
                  ]
                : [],
        [appListFilterResponse],
    )

    const clusterGroupedEnvOptions: GroupedOptionsType[] = useMemo(
        () =>
            appListFilterResponse?.result.environments.reduce((prev, curr) => {
                if (!prev.find((clusterItem) => clusterItem.label === curr.cluster_id)) {
                    prev.push({ label: curr.cluster_id, options: [] })
                }
                prev.find((clusterItem) => clusterItem.label === curr.cluster_id).options.push({
                    label: curr.environment_name,
                    value: String(curr.id),
                })

                return prev
            }, []),
        [appListFilterResponse],
    )

    const environmentOptions: GroupedOptionsType[] = useMemo(
        () =>
            clusterGroupedEnvOptions?.map((clusterItem) => ({
                label: getFormattedFilterValue(AppListUrlFilters.cluster, clusterItem.label),
                options: clusterItem.options,
            })) ?? [],
        [clusterGroupedEnvOptions],
    )

    const clusterOptions: SelectPickerOptionType[] = useMemo(
        () => [
            ...(appListFilterResponse?.result.clusters.map((clusterItem) => ({
                label: clusterItem.cluster_name,
                value: String(clusterItem.id),
            })) ?? []),
            ...(clusterListResponse?.result.map((clusterItem) => ({
                label: clusterItem.cluster_name,
                value: clusterItem.id,
            })) ?? []),
        ],
        [appListFilterResponse],
    )

    const namespaceOptions: GroupedOptionsType[] = useMemo(
        () =>
            namespaceListResponse?.result
                ?.map((clusterItem) => ({
                    label: clusterItem.clusterName,
                    options: clusterItem.environments
                        .filter((env) => !!env.namespace)
                        .sort((a, b) => stringComparatorBySortOrder(a.namespace, b.namespace))
                        .map((env) => ({
                            label: env.namespace,
                            value: `${clusterItem.clusterId}_${env.namespace}`,
                        })),
                }))
                .sort((a, b) => stringComparatorBySortOrder(a.label, b.label)),
        [namespaceListResponse],
    )

    const selectedAppStatus = appStatus.map((status) => ({ label: status, value: status })) || []

    const selectedProjects =
        project.map((team) => ({
            label: getFormattedFilterValue(AppListUrlFilters.project, team),
            value: team,
        })) || []

    const selectedEnvironments =
        environment.map((env) => ({
            label: getFormattedFilterValue(AppListUrlFilters.environment, env),
            value: env,
        })) || []

    const selectedClusters =
        cluster.map((clusterId) => ({
            label: getFormattedFilterValue(AppListUrlFilters.cluster, clusterId),
            value: clusterId,
        })) || []

    const selectedNamespaces =
        namespace.map((namespaceOption) => ({
            label: getFormattedFilterValue(AppListUrlFilters.namespace, namespaceOption),
            value: namespaceOption,
        })) || []

    const selectedTemplateTypes =
        templateType.map((templateTypeItem) => ({
            label: templateTypeItem,
            value: templateTypeItem,
        })) || []

    const handleUpdateFilters = (filterKey: AppListUrlFilters) => (selectedOptions: SelectPickerOptionType[]) => {
        updateSearchParams({ [filterKey]: selectedOptions.map((option) => String(option.value)) })
    }

    useEffect(() => {
        // To check whether namespaces are to be updated in url after cluster selection is changed
        if (!appListFilterLoading) {
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
        if (serverMode === SERVER_MODE.EA_ONLY && appListFilterResponse?.result.clusters?.length === 1) {
            updateSearchParams({ cluster: [String(appListFilterResponse?.result.clusters[0].id)] })
        }
    }, [appListFilterResponse])

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

    const renderFilters = () => {
        const appStatusFilters: SelectPickerOptionType[] =
            params.appType === AppListConstants.AppType.HELM_APPS
                ? APP_STATUS_FILTER_OPTIONS.filter((status) => status.label !== AppStatuses.NOT_DEPLOYED)
                : APP_STATUS_FILTER_OPTIONS

        const showExportCsvButton =
            userRoleResponse?.result?.roles?.indexOf('role:super-admin___') !== -1 &&
            params.appType === AppListConstants.AppType.DEVTRON_APPS &&
            serverMode !== SERVER_MODE.EA_ONLY

        return (
            <div className="search-filter-section">
                <SearchBar
                    containerClassName="w-250"
                    dataTestId="search-by-app-name"
                    initialSearchText={searchKey}
                    inputProps={{
                        placeholder: `${
                            params.appType === AppListConstants.AppType.HELM_APPS
                                ? 'Search by app or chart name'
                                : 'Search by app name'
                        }`,
                    }}
                    handleEnter={handleSearch}
                    size={ComponentSizeType.medium}
                />
                <div className="flexbox dc__gap-8 dc__align-items-center">
                    {!isGenericAppListView && (
                        <>
                            {isArgoInstalled && (
                                <>
                                    <FilterSelectPicker
                                        placeholder="App Status"
                                        inputId="app-list-app-status-select"
                                        options={appStatusFilters}
                                        appliedFilterOptions={selectedAppStatus}
                                        handleApplyFilter={handleUpdateFilters(AppListUrlFilters.appStatus)}
                                        isDisabled={false}
                                        isLoading={false}
                                    />
                                    <div className="dc__border-right h-16" />
                                </>
                            )}
                            <FilterSelectPicker
                                placeholder="Project"
                                inputId="app-list-project-select"
                                options={projectOptions}
                                appliedFilterOptions={selectedProjects}
                                handleApplyFilter={handleUpdateFilters(AppListUrlFilters.project)}
                                isDisabled={appListFilterLoading || projectListLoading}
                                isLoading={appListFilterLoading || projectListLoading}
                                optionListError={appListFiltersError || projectListError}
                                reloadOptionList={reloadAppFilters || reloadProjectOptions}
                            />
                            <div className="dc__border-right h-16" />
                            {serverMode === SERVER_MODE.FULL && (
                                <>
                                    <Tooltip
                                        content="Remove cluster filters to use environment filter"
                                        alwaysShowTippyOnHover={!!clusterIdsCsv}
                                        wordBreak={false}
                                    >
                                        <div>
                                            <FilterSelectPicker
                                                placeholder="Environment"
                                                inputId="app-list-environment-select"
                                                options={environmentOptions}
                                                appliedFilterOptions={selectedEnvironments}
                                                handleApplyFilter={handleUpdateFilters(AppListUrlFilters.environment)}
                                                isDisabled={appListFilterLoading || !!clusterIdsCsv}
                                                isLoading={appListFilterLoading}
                                                optionListError={appListFiltersError}
                                                reloadOptionList={reloadAppFilters}
                                            />
                                        </div>
                                    </Tooltip>
                                    <div className="dc__border-right h-16" />
                                </>
                            )}
                        </>
                    )}
                    {isExternalFlux && (
                        <>
                            <Tooltip content={SELECT_CLUSTER_TIPPY} alwaysShowTippyOnHover={!clusterIdsCsv}>
                                <div>
                                    <FilterSelectPicker
                                        placeholder="Template Type"
                                        inputId="app-list-template-type-filter"
                                        options={TEMPLATE_TYPE_FILTER_OPTIONS}
                                        appliedFilterOptions={selectedTemplateTypes}
                                        handleApplyFilter={handleUpdateFilters(AppListUrlFilters.templateType)}
                                        isDisabled={!clusterIdsCsv}
                                        isLoading={false}
                                    />
                                </div>
                            </Tooltip>
                            <div className="dc__border-right h-16" />
                        </>
                    )}
                    <Tooltip
                        content="Remove environment filters to use cluster filter"
                        alwaysShowTippyOnHover={!!environment.length}
                        wordBreak={false}
                    >
                        <div className="flexbox dc__position-rel">
                            <FilterSelectPicker
                                placeholder="Cluster"
                                inputId="app-list-cluster-filter"
                                options={clusterOptions}
                                appliedFilterOptions={selectedClusters}
                                isDisabled={!!environment.length}
                                isLoading={appListFilterLoading || clusterListLoading}
                                handleApplyFilter={handleUpdateFilters(AppListUrlFilters.cluster)}
                                optionListError={appListFiltersError || clusterListError}
                                reloadOptionList={reloadAppFilters || reloadClusterOptions}
                            />
                            {showPulsatingDot && <div className="dc__pulsating-dot dc__position-abs" />}
                        </div>
                    </Tooltip>
                    <Tooltip content={SELECT_CLUSTER_TIPPY} alwaysShowTippyOnHover={!clusterIdsCsv}>
                        <div>
                            <FilterSelectPicker
                                placeholder="Namespace"
                                inputId="app-list-namespace-filter"
                                options={namespaceOptions}
                                appliedFilterOptions={selectedNamespaces}
                                isDisabled={namespaceListLoading || !clusterIdsCsv}
                                isLoading={namespaceListLoading}
                                handleApplyFilter={handleUpdateFilters(AppListUrlFilters.namespace)}
                                shouldMenuAlignRight={!showExportCsvButton}
                                optionListError={namespaceListError}
                                reloadOptionList={reloadNamespaceOptions}
                            />
                        </div>
                    </Tooltip>
                    {showExportCsvButton && (
                        <>
                            <div className="dc__border-right h-16" />
                            <ExportToCsv
                                apiPromise={() =>
                                    getDevtronAppListDataToExport(
                                        filterConfig,
                                        appListFilterResponse?.result.environments,
                                        namespaceListResponse?.result,
                                        appListFilterResponse?.result.clusters,
                                        appListFilterResponse?.result.teams,
                                    )
                                }
                                fileName={FILE_NAMES.Apps}
                                disabled={!appCount}
                            />
                        </>
                    )}
                </div>
            </div>
        )
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

    function renderAppTabs() {
        return (
            <div className="dc__border-bottom flexbox dc__content-space px-20 dc__align-items-center">
                <ul className="tab-list">
                    {serverMode !== SERVER_MODE.EA_ONLY && (
                        <li className="tab-list__tab">
                            <a
                                className={`tab-list__tab-link ${
                                    currentTab === AppListConstants.AppTabs.DEVTRON_APPS ? 'active' : ''
                                }`}
                                onClick={() => changeAppTab(AppListConstants.AppTabs.DEVTRON_APPS)}
                            >
                                Devtron Apps
                            </a>
                        </li>
                    )}
                    <li className="tab-list__tab">
                        <a
                            className={`tab-list__tab-link ${
                                currentTab === AppListConstants.AppTabs.HELM_APPS ? 'active' : ''
                            }`}
                            onClick={() => changeAppTab(AppListConstants.AppTabs.HELM_APPS)}
                            data-testid="helm-app-list-button"
                        >
                            Helm Apps
                        </a>
                    </li>
                    {window._env_?.ENABLE_EXTERNAL_ARGO_CD && (
                        <li className="tab-list__tab">
                            <a
                                className={`tab-list__tab-link ${
                                    currentTab === AppListConstants.AppTabs.ARGO_APPS ? 'active' : ''
                                }`}
                                onClick={() => changeAppTab(AppListConstants.AppTabs.ARGO_APPS)}
                                data-testid="argo-app-list-button"
                            >
                                {AppListConstants.AppTabs.ARGO_APPS}
                            </a>
                        </li>
                    )}
                    {window._env_?.FEATURE_EXTERNAL_FLUX_CD_ENABLE && (
                        <li className="tab-list__tab">
                            <a
                                className={`tab-list__tab-link ${
                                    currentTab === AppListConstants.AppTabs.FLUX_APPS ? 'active' : ''
                                }`}
                                onClick={() => changeAppTab(AppListConstants.AppTabs.FLUX_APPS)}
                                data-testid="flux-app-list-button"
                            >
                                {AppListConstants.AppTabs.FLUX_APPS}
                            </a>
                        </li>
                    )}
                </ul>
                <div className="app-tabs-sync fs-13">
                    {lastDataSyncTimeString &&
                        (params.appType === AppListConstants.AppType.DEVTRON_APPS ||
                            (params.appType === AppListConstants.AppType.HELM_APPS && !fetchingExternalApps)) && (
                            <span data-testid="sync-now-text">
                                {lastDataSyncTimeString}&nbsp;
                                {!isDataSyncing && (
                                    <button
                                        className="btn btn-link p-0 fw-6 cb-5 mb-2"
                                        type="button"
                                        onClick={syncNow}
                                        data-testid="sync-now-button"
                                    >
                                        Sync now
                                    </button>
                                )}
                            </span>
                        )}
                    {params.appType === AppListConstants.AppType.HELM_APPS &&
                        fetchingExternalApps &&
                        renderDataSyncingText()}
                </div>
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
            {renderFilters()}
            {renderAppliedFilters()}
            {renderAppTabs()}
            {serverMode === SERVER_MODE.FULL && renderAppCreateRouter()}
            {params.appType === AppListConstants.AppType.DEVTRON_APPS && serverMode === SERVER_MODE.FULL && (
                <DevtronAppList
                    filterConfig={filterConfig}
                    environmentList={appListFilterResponse?.result.environments}
                    namespaceList={namespaceListResponse?.result}
                    appFiltersResponseLoading={appListFilterLoading || namespaceListLoading}
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
                        clusterList={appListFilterResponse?.result.clusters}
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
                    clusterList={appListFilterResponse?.result.clusters}
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
