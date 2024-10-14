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

import React, { useState, useEffect } from 'react'
import { useLocation, useHistory, useParams, Switch, Route } from 'react-router-dom'
import {
    showError,
    Progressing,
    ErrorScreenManager,
    stopPropagation,
    ServerErrors,
    useAsync,
    useMainContext,
    HeaderWithCreateButton,
    AppListConstants,
    ModuleNameMap,
    TabGroup,
    TabProps,
    SearchBar,
} from '@devtron-labs/devtron-fe-common-lib'
import * as queryString from 'query-string'
import moment from 'moment'
import { Filter, FilterOption, handleUTCTime, useAppContext } from '../../common'
import { getInitData, buildClusterVsNamespace, getNamespaces } from './AppListService'
import { AppListViewType } from '../config'
import { SERVER_MODE, DOCUMENTATION, Moment12HourFormat, URLS } from '../../../config'
import DevtronAppListContainer from '../list/DevtronAppListContainer'
import HelmAppList from './HelmAppList'
import { AppListPropType, EnvironmentClusterList, OrderBy, SortBy } from '../list/types'
import { AddNewApp } from '../create/CreateApp'
import '../list/list.scss'
import EAEmptyState, { EAEmptyStateType } from '../../common/eaEmptyState/EAEmptyState'
import ExportToCsv from '../../common/ExportToCsv/ExportToCsv'
import { FILE_NAMES } from '../../common/ExportToCsv/constants'
import { getAppList } from '../service'
import { getUserRole } from '../../../Pages/GlobalConfigurations/Authorization/authorization.service'
import { APP_LIST_HEADERS, InitialEmptyMasterFilters, InitialEmptyUrlFilters, StatusConstants } from './Constants'
import { getModuleInfo } from '../../v2/devtronStackManager/DevtronStackManager.service'
import { createAppListPayload } from '../list/appList.modal'
import { getChangeAppTabURL, getCurrentTabName, getPayloadFromUrl } from './list.utils'
import GenericAppList from './GenericAppList'
import { PayloadParsedFromURL } from '../types'

export default function AppList({ isSuperAdmin, appListCount, isArgoInstalled }: AppListPropType) {
    const location = useLocation()
    const history = useHistory()
    const params = useParams<{ appType: string }>()
    const { serverMode, setPageOverflowEnabled } = useMainContext()
    const { setCurrentAppName } = useAppContext()

    const [dataStateType, setDataStateType] = useState(AppListViewType.LOADING)
    const [errorResponseCode, setErrorResponseCode] = useState(0)
    const [lastDataSyncTimeString, setLastDataSyncTimeString] = useState<React.ReactNode>('')
    const [isDataSyncing, setDataSyncing] = useState(false)
    const [fetchingNamespaces, setFetchingNamespaces] = useState(false)
    const [fetchingNamespacesErrored, setFetchingNamespacesErrored] = useState(false)
    const [currentTab, setCurrentTab] = useState(undefined)
    const [syncListData, setSyncListData] = useState<boolean>()
    const [projectMap, setProjectMap] = useState(new Map())

    // check for external argoCD app
    const isExternalArgo =
        window._env_?.ENABLE_EXTERNAL_ARGO_CD && params.appType === AppListConstants.AppType.ARGO_APPS

    // check for external fluxCD app
    const isExternalFlux =
        window._env_?.FEATURE_EXTERNAL_FLUX_CD_ENABLE && params.appType === AppListConstants.AppType.FLUX_APPS

    // view other than devtron or helm app list
    const isGenericAppListView = isExternalArgo || isExternalFlux

    // API master data
    const [environmentClusterListRes, setEnvironmentClusterListRes] = useState<EnvironmentClusterList>()

    // search
    const [searchString, setSearchString] = useState(undefined)
    const [searchApplied, setSearchApplied] = useState(false)

    // filters
    const [masterFilters, setMasterFilters] = useState(structuredClone(InitialEmptyMasterFilters))
    const [showPulsatingDot, setShowPulsatingDot] = useState<boolean>(false)
    const [fetchingExternalApps, setFetchingExternalApps] = useState(false)
    const [appCount, setAppCount] = useState(0)
    const [, userRoleResponse] = useAsync(getUserRole, [])
    const [parsedPayloadOnUrlChange, setParsedPayloadOnUrlChange] = useState<PayloadParsedFromURL>(
        getPayloadFromUrl(location.search, appCount, true).payload,
    )

    // on page load
    useEffect(() => {
        setCurrentTab(getCurrentTabName(params.appType))
        // set search data
        const searchQuery = location.search
        const queryParams = queryString.parse(searchQuery)
        if (queryParams.search) {
            setSearchString(queryParams.search)
            setSearchApplied(true)
        }

        // set payload parsed from url
        const payloadParsedFromUrl = onRequestUrlChange(false)
        setParsedPayloadOnUrlChange(payloadParsedFromUrl)

        // fetch master filters data and some master data
        getInitData(payloadParsedFromUrl, serverMode)
            .then((initData) => {
                setEnvironmentClusterListRes(initData.environmentClusterAppListData)
                setProjectMap(initData.projectMap)
                setMasterFilters(initData.filters)
                setDataStateType(AppListViewType.LIST)
                if (serverMode === SERVER_MODE.EA_ONLY) {
                    applyClusterSelectionFilterOnPageLoadIfSingle(
                        initData.filters.clusters,
                        getCurrentTabName(params.appType),
                    )
                    getModuleInfo(ModuleNameMap.CICD) // To check the latest status and show user reload toast
                }
            })
            .catch((errors: ServerErrors) => {
                showError(errors)
                setDataStateType(AppListViewType.ERROR)
                setErrorResponseCode(errors.code)
            })
    }, [syncListData])

    // update lasy sync time on tab change

    const renderDataSyncingText = () => {
        return <div className="dc__loading-dots">Syncing</div>
    }

    useEffect(() => {
        let interval
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
            interval && clearInterval(interval)
        }
    }, [isDataSyncing])

    useEffect(() => {
        setParsedPayloadOnUrlChange(onRequestUrlChange(false))
    }, [location.search])

    const applyClusterSelectionFilterOnPageLoadIfSingle = (clusterFilters: any[], currentTab: string): void => {
        // return if not single cluster
        if (clusterFilters.length != 1) {
            return
        }

        const _cluster = clusterFilters[0]

        // return if any cluster filter applied
        const _isAnyClusterFilterApplied = clusterFilters.some((_cluster) => _cluster.isChecked)
        if (_isAnyClusterFilterApplied) {
            return
        }

        // auto check cluster
        const _filterOptions: FilterOption[] = []
        _filterOptions.push({
            key: _cluster.key,
            label: _cluster.label,
            isSaved: _cluster.isSaved,
            isChecked: true,
        })

        applyFilter(AppListConstants.FilterType.CLUTSER, _filterOptions, currentTab)
    }

    const onRequestUrlChange = (showExportCsvButton?: boolean): any => {
        const searchQuery = location.search

        const { payload, filterApplied } = getPayloadFromUrl(searchQuery, appCount, showExportCsvButton)

        const _masterFilters = structuredClone(InitialEmptyMasterFilters)

        // set projects (check/uncheck)
        _masterFilters.projects = masterFilters.projects.map((project) => {
            return {
                key: project.key,
                label: project.label,
                isSaved: true,
                isChecked: filterApplied.teams.has(project.key),
            }
        })
        // set clusters (check/uncheck)
        _masterFilters.clusters = masterFilters.clusters.map((cluster) => {
            return {
                key: cluster.key,
                label: cluster.label,
                isSaved: true,
                isChecked: filterApplied.clusterVsNamespaceMap.has(cluster.key.toString()),
                optionMetadata: cluster.optionMetadata,
            }
        })

        // set namespace (check/uncheck)
        _masterFilters.namespaces = masterFilters.namespaces.map((namespace) => {
            return {
                key: namespace.key,
                label: namespace.label,
                isSaved: true,
                isChecked:
                    filterApplied.clusterVsNamespaceMap.has(namespace.clusterId.toString()) &&
                    filterApplied.clusterVsNamespaceMap
                        .get(namespace.clusterId.toString())
                        .includes(namespace.key.split('_')[1]),
                toShow:
                    filterApplied.clusterVsNamespaceMap.size == 0 ||
                    filterApplied.clusterVsNamespaceMap.has(namespace.clusterId.toString()),
                actualName: namespace.actualName,
                clusterName: namespace.clusterName,
                clusterId: namespace.clusterId,
            }
        })

        _masterFilters.appStatus = masterFilters.appStatus.map((status) => {
            return {
                key: status.key,
                label: status.label,
                isSaved: true,
                isChecked: filterApplied.appStatus.has(status.key),
            }
        })

        // set environments (check/uncheck)
        _masterFilters.environments = masterFilters.environments.map((env) => {
            return {
                key: env.key,
                label: env.label,
                isSaved: true,
                isChecked: filterApplied.environments.has(env.key),
            }
        })

        _masterFilters.templateType = masterFilters.templateType.map((templateType) => ({
            key: templateType.key,
            label: templateType.label,
            isSaved: true,
            isChecked: filterApplied.templateType.has(templateType.key),
        }))
        setMasterFilters(_masterFilters)
        // update master filters data ends (check/uncheck)

        // check whether to fetch namespaces from backend if any cluster is selected and not same as old
        // do it only for non page load, as on pageload getInitData is handling this logic
        if (dataStateType == AppListViewType.LIST) {
            const _oldClusterIdsCsv = _getClusterIdsFromRequestUrl(parsedPayloadOnUrlChange)
            const _newClusterIdsCsv = _getClusterIdsFromRequestUrl(payload)
            if (_newClusterIdsCsv) {
                // check if cluster selection is changed
                if (_oldClusterIdsCsv != _newClusterIdsCsv) {
                    // fetch namespaces
                    _fetchAndSetNamespaces(payload, _newClusterIdsCsv, _masterFilters)
                }
            } else {
                // if all clusters are unselected, then reset namespaces
                _masterFilters.namespaces = []
                setMasterFilters(_masterFilters)
            }
        }

        return payload
    }

    const _forceFetchAndSetNamespaces = () => {
        const _clusterIdsCsv = _getClusterIdsFromRequestUrl(parsedPayloadOnUrlChange)
        _fetchAndSetNamespaces(parsedPayloadOnUrlChange, _clusterIdsCsv, masterFilters)
    }

    const _fetchAndSetNamespaces = (_parsedPayloadOnUrlChange: any, _clusterIdsCsv: string, _masterFilters: any) => {
        // fetch namespaces
        setFetchingNamespaces(true)
        setFetchingNamespacesErrored(false)
        const _clusterVsNamespaceMap = buildClusterVsNamespace(_parsedPayloadOnUrlChange.namespaces.join(','))
        getNamespaces(_clusterIdsCsv, _clusterVsNamespaceMap)
            .then((_namespaces) => {
                _masterFilters.namespaces = _namespaces
                setMasterFilters(_masterFilters)
                setFetchingNamespaces(false)
                setFetchingNamespacesErrored(false)
            })
            .catch((errors: ServerErrors) => {
                setFetchingNamespaces(false)
                setFetchingNamespacesErrored(true)
            })
    }

    const _getClusterIdsFromRequestUrl = (parsedPayload: any): string => {
        const _namespaces = parsedPayload['namespaces'] || []
        return [...buildClusterVsNamespace(_namespaces.join(',')).keys()].join(',')
    }

    function openDevtronAppCreateModel() {
        const _urlPrefix =
            currentTab == AppListConstants.AppTabs.DEVTRON_APPS ? URLS.DEVTRON_APP_LIST : URLS.HELM_APP_LIST
        history.push(`${_urlPrefix}/${AppListConstants.CREATE_DEVTRON_APP_URL}${location.search}`)
    }

    const updateDataSyncing = (loading: boolean): void => {
        setDataSyncing(loading)
    }

    const updateAppListURL = (queryStr?: string, selectedAppTab?: string): void => {
        let url = ''
        const _currentTab = selectedAppTab || currentTab
        if (_currentTab === AppListConstants.AppTabs.DEVTRON_APPS) {
            url = URLS.DEVTRON_APP_LIST
        } else if (_currentTab === AppListConstants.AppTabs.ARGO_APPS) {
            url = URLS.ARGO_APP_LIST
        } else if (_currentTab === AppListConstants.AppTabs.HELM_APPS) {
            url = URLS.HELM_APP_LIST
        } else if (_currentTab === AppListConstants.AppTabs.FLUX_APPS) {
            url = URLS.FLUX_APP_LIST
        }

        history.push(`${url}${queryStr ? `?${queryStr}` : ''}`)
    }

    const handleAppSearchOperation = (_searchString: string): void => {
        const qs = queryString.parse(location.search)
        const keys = Object.keys(qs)
        const query = {}
        keys.map((key) => {
            query[key] = qs[key]
        })
        if (_searchString) {
            query['search'] = _searchString
            query['offset'] = 0
            query['hOffset'] = 0
        } else {
            delete query['search']
            delete query['offset']
            delete query['hOffset']
        }

        const queryStr = queryString.stringify(query)
        updateAppListURL(queryStr)
    }

    /**
     * This function will return filters to be applied for filter types - CLUSTER & NAMESPACE (query param - namespace)
     *
     * @param ids - currently selected/checked items from filters list
     * @param filterType - type of filter
     * @param query - current query params
     * @returns string - filters to be applied
     */
    const getUpdatedFiltersOnNamespaceChange = (
        ids: (string | number)[],
        filterType: string,
        query: Record<string, string>,
    ): string => {
        /**
         * Step 1: Return currently selected/checked items from filters list as string if
         * - There are no query params
         * - There is no namespace query param i.e. this is the first time selecting the cluster filter
         */
        if (!query || Object.keys(query).length <= 0 || !query[AppListConstants.FilterType.NAMESPACE]) {
            return ids.toString()
        }

        /**
         * Step 2: Create & init all required arrays
         * - currentlyAppliedFilters: Array of currently applied namespace filters in query param
         * - checkedItemIds: Array of currently selected/checked items from filters list
         * - updatedAppliedFilters: Array of new filters to be applied
         */
        const currentlyAppliedFilters = query[AppListConstants.FilterType.NAMESPACE].split(',')
        const checkedItemIds = ids.toString().split(',')
        const updatedAppliedFilters = []

        /**
         * Step 3: Iterate through checkedItemIds,
         * - Filter appliedFilters array & get filteredIds,
         *      - If filter is already applied & present in query param then keep it.
         *      - If filter type is CLUSTER & already has a related namespace filter then keep it.
         * - If filteredIds is empty (i.e. not matching above conditions), then push the item id in updatedAppliedFilters array.
         */
        checkedItemIds.forEach((id) => {
            const filterdIds = currentlyAppliedFilters.filter(
                (item) =>
                    id.toString() === item ||
                    (filterType === AppListConstants.FilterType.CLUTSER && item.startsWith(`${id}_`)),
            )
            updatedAppliedFilters.push(filterdIds.length > 0 ? filterdIds : id)
        })

        /**
         * Step 4: If filterType is NAMESPACE,
         * - Iterate through appliedFilters array
         * - Check if there's any namespace present related to a cluster in checkedItemIds array,
         *      - If yes then continue.
         *      - If no then get the Cluster Id from applied filter & push it to updatedAppliedFilters array.
         */
        if (filterType === AppListConstants.FilterType.NAMESPACE) {
            currentlyAppliedFilters.forEach((filter) => {
                if (!checkedItemIds.some((itemId) => itemId.startsWith(`${filter.split('_')[0]}_`))) {
                    updatedAppliedFilters.push(filter.split('_')[0])
                }
            })
        }

        /**
         * Step 5: Create array out of unique set of item ids & return as string.
         * - Check & filter out empty items from updatedAppliedFilters array
         * - Create a new Set out of filtered updatedAppliedFilters array to remove duplicate items.
         * - Create array out of new Set (as Set doesn't have toString() equivalent) and return as string.
         */
        return Array.from(new Set<string>(updatedAppliedFilters.filter((filter) => filter !== ''))).toString()
    }

    const applyFilter = (type: string, list: FilterOption[], selectedAppTab: string = undefined): void => {
        const qs = queryString.parse(location.search)
        const keys = Object.keys(qs)
        const query = {}
        keys.map((key) => {
            query[key] = qs[key]
        })

        const queryParamType =
            type == AppListConstants.FilterType.CLUTSER || type == AppListConstants.FilterType.NAMESPACE
                ? AppListConstants.FilterType.NAMESPACE
                : type
        const checkedItems = list.filter((item) => item.isChecked)
        const ids = checkedItems.map((item) => item.key)

        query[queryParamType] =
            queryParamType === AppListConstants.FilterType.NAMESPACE
                ? getUpdatedFiltersOnNamespaceChange(ids, type, query)
                : ids.toString()
        query['offset'] = 0
        query['hOffset'] = 0
        const queryStr = queryString.stringify(query)
        updateAppListURL(queryStr, selectedAppTab)
    }

    const removeFilter = (filter, filterType: string): void => {
        const val = filter.key.toString()
        const clustId = val.split('_')[0] // Specific to cluster & namespace filter removal
        const qs = queryString.parse(location.search)
        const keys = Object.keys(qs)
        const query = {}
        keys.map((key) => {
            query[key] = qs[key]
        })
        query['offset'] = 0
        query['hOffset'] = 0
        const queryParamType =
            filterType === AppListConstants.FilterType.CLUTSER || filterType === AppListConstants.FilterType.NAMESPACE
                ? AppListConstants.FilterType.NAMESPACE
                : filterType
        if (query[queryParamType]) {
            const appliedFilters = query[queryParamType]
            let arr = appliedFilters.split(',')
            if (filterType === AppListConstants.FilterType.CLUTSER) {
                arr = arr.filter((item) => !item.startsWith(val))
            } else {
                arr = arr.filter((item) => item !== val)

                /**
                 * Check if filterType is NAMESPACE & appliedFilters array doesn't contain any namespace
                 * related to a cluster then push Cluster Id to updatedAppliedFilters array (i.e. arr)
                 */
                if (
                    filterType === AppListConstants.FilterType.NAMESPACE &&
                    !arr.some((item) => item.startsWith(`${clustId}_`))
                ) {
                    arr.push(clustId)
                }
            }

            query[queryParamType] =
                filterType === AppListConstants.FilterType.NAMESPACE && !arr.toString() ? clustId : arr.toString()

            if (query[queryParamType] == '') {
                delete query[queryParamType]
            }
            const queryStr = queryString.stringify(query)
            updateAppListURL(queryStr)
        }
    }

    const removeAllFilters = (): void => {
        const qs = queryString.parse(location.search)
        const keys = Object.keys(qs)
        const query = {}
        keys.map((key) => {
            query[key] = qs[key]
        })
        query['offset'] = 0
        query['hOffset'] = 0
        delete query['environment']
        delete query['team']
        delete query['namespace']
        delete query['appStatus']
        delete query['search']
        delete query['templateType']

        // delete search string
        setSearchApplied(false)
        setSearchString('')

        const queryStr = queryString.stringify(query)
        updateAppListURL(queryStr)
    }

    const sortApplicationList = (key: string): void => {
        const qs = queryString.parse(location.search)
        const keys = Object.keys(qs)
        const query = {}
        keys.map((key) => {
            query[key] = qs[key]
        })
        query['orderBy'] = key
        query['sortOrder'] = query['sortOrder'] == OrderBy.DESC ? OrderBy.ASC : OrderBy.DESC
        const queryStr = queryString.stringify(query)
        updateAppListURL(queryStr)
    }

    function changeAppTab(appTabType) {
        if (appTabType == currentTab) {
            return
        }
        setParsedPayloadOnUrlChange(InitialEmptyUrlFilters)
        setCurrentTab(appTabType)
    }

    const handleEnterSearchApp = (_searchText: string): void => {
        setSearchString(_searchText.toLowerCase())
        handleAppSearchOperation(_searchText)
    }

    const syncNow = (): void => {
        setSyncListData(!syncListData)
    }

    const setFetchingExternalAppsState = (fetching: boolean): void => {
        setFetchingExternalApps(fetching)
    }

    const setShowPulsatingDotState = (show: boolean): void => {
        setShowPulsatingDot(show)
    }

    const onShowHideFilterContent = (show: boolean): void => {
        setPageOverflowEnabled(!show)
    }

    const getAppListDataToExport = () => {
        return getAppList(createAppListPayload(onRequestUrlChange(true), environmentClusterListRes)).then(
            ({ result }) => {
                if (result.appContainers) {
                    const _appDataList = []
                    for (const _app of result.appContainers) {
                        if (_app.environments) {
                            for (const _env of _app.environments) {
                                const _clusterId =
                                    _env.clusterName &&
                                    masterFilters.clusters.find((_cluster) => {
                                        return _cluster.label === _env.clusterName
                                    })?.key

                                _appDataList.push({
                                    appId: _env.appId,
                                    appName: _env.appName,
                                    projectId: _env.teamId,
                                    projectName: projectMap.get(_env.teamId),
                                    environmentId: (_env.environmentName && _env.environmentId) || '-',
                                    environmentName: _env.environmentName || '-',
                                    clusterId: `${(_clusterId ?? _clusterId) || '-'}`,
                                    clusterName: _env.clusterName || '-',
                                    namespaceId: _env.namespace && _clusterId ? `${_clusterId}_${_env.namespace}` : '-',
                                    namespace: _env.namespace || '-',
                                    status: _env.appStatus || '-',
                                    lastDeployedTime: _env.lastDeployedTime
                                        ? moment(_env.lastDeployedTime).format(Moment12HourFormat)
                                        : '-',
                                })
                            }
                        } else {
                            _appDataList.push({
                                appId: _app.appId,
                                appName: _app.appName,
                                projectId: _app.projectId,
                                projectName:
                                    masterFilters.projects.find((_proj) => _proj.id === _app.projectId)?.name || '-',
                                environmentId: '-',
                                environmentName: '-',
                                clusterId: '-',
                                clusterName: '-',
                                namespaceId: '-',
                                namespace: '-',
                                status: '-',
                                lastDeployedTime: '-',
                            })
                        }
                    }

                    return _appDataList
                }

                return []
            },
        )
    }

    function renderMasterFilters() {
        const _isAnyClusterFilterApplied = masterFilters.clusters.some((_cluster) => _cluster.isChecked)
        const appStatusFilters =
            params.appType === AppListConstants.AppType.HELM_APPS
                ? masterFilters.appStatus.slice(0, masterFilters.appStatus.length - 1)
                : masterFilters.appStatus
        const showExportCsvButton =
            userRoleResponse?.result?.roles?.indexOf('role:super-admin___') !== -1 &&
            currentTab === AppListConstants.AppTabs.DEVTRON_APPS &&
            serverMode !== SERVER_MODE.EA_ONLY

        // In case of apps other than devtron apps, we are hiding virtual clusters from filters
        const clusterFilters =
            isExternalArgo || isExternalFlux
                ? masterFilters.clusters.filter((cluster) => !cluster?.optionMetadata?.isVirtualCluster)
                : masterFilters.clusters

        const renderSearchText = (): JSX.Element => (
            <SearchBar
                initialSearchText={searchString}
                containerClassName="w-250"
                handleEnter={handleEnterSearchApp}
                inputProps={{
                    placeholder: `${
                        currentTab === AppListConstants.AppTabs.HELM_APPS
                            ? 'Search by app or chart name'
                            : 'Search by app name'
                    }`,
                    autoFocus: true,
                }}
                dataTestId="Search-by-app-name"
            />
        )

        return (
            <div className="search-filter-section">
                {renderSearchText()}
                <div className="app-list-filters filters">
                    {!isGenericAppListView && (
                        <>
                            {isArgoInstalled && (
                                <>
                                    <Filter
                                        list={appStatusFilters}
                                        labelKey="label"
                                        buttonText={APP_LIST_HEADERS.AppStatus}
                                        placeholder={APP_LIST_HEADERS.SearchAppStatus}
                                        isDisabled={dataStateType === AppListViewType.LOADING}
                                        searchable
                                        multi
                                        type={AppListConstants.FilterType.APP_STATUS}
                                        applyFilter={applyFilter}
                                        onShowHideFilterContent={onShowHideFilterContent}
                                        isFirstLetterCapitalize
                                        dataTestId="app-status-filter"
                                    />
                                    <span className="filter-divider" />
                                </>
                            )}
                            <Filter
                                list={masterFilters.projects}
                                labelKey="label"
                                buttonText="Projects"
                                placeholder="Search Project"
                                isDisabled={dataStateType === AppListViewType.LOADING}
                                searchable
                                multi
                                type={AppListConstants.FilterType.PROJECT}
                                applyFilter={applyFilter}
                                onShowHideFilterContent={onShowHideFilterContent}
                                dataTestId="projects-filter"
                            />
                            {serverMode == SERVER_MODE.FULL && (
                                <>
                                    <span className="filter-divider" />
                                    <Filter
                                        list={masterFilters.environments}
                                        isDisabled={dataStateType === AppListViewType.LOADING}
                                        labelKey="label"
                                        buttonText="Environment"
                                        searchable
                                        multi
                                        placeholder="Search Environment"
                                        type={AppListConstants.FilterType.ENVIRONMENT}
                                        applyFilter={applyFilter}
                                        onShowHideFilterContent={onShowHideFilterContent}
                                        dataTestId="environment-filter"
                                    />
                                </>
                            )}
                            <span className="filter-divider" />
                        </>
                    )}
                    {isExternalFlux && (
                        <>
                            <Filter
                                labelKey="label"
                                buttonText="Template Type"
                                multi
                                isDisabled={dataStateType === AppListViewType.LOADING}
                                list={masterFilters.templateType}
                                placeholder="Search Template Type"
                                type={AppListConstants.FilterType.TEMPLATE_TYPE}
                                applyFilter={applyFilter}
                                searchable
                                isFirstLetterCapitalize
                            />
                            <span className="filter-divider" />
                        </>
                    )}
                    <Filter
                        list={clusterFilters}
                        position={isGenericAppListView ? 'right' : 'left'}
                        labelKey="label"
                        buttonText="Cluster"
                        searchable
                        multi
                        placeholder="Search Cluster"
                        isDisabled={dataStateType === AppListViewType.LOADING}
                        type={AppListConstants.FilterType.CLUTSER}
                        applyFilter={applyFilter}
                        onShowHideFilterContent={onShowHideFilterContent}
                        showPulsatingDot={showPulsatingDot}
                        dataTestId="cluster-filter"
                        appType={params.appType}
                    />
                    {!isGenericAppListView && (
                        <Filter
                            rootClassName="ml-0-imp"
                            position={showExportCsvButton ? 'left' : 'right'}
                            list={masterFilters.namespaces.filter((namespace) => namespace.toShow)}
                            labelKey="label"
                            searchKey="actualName"
                            buttonText="Namespace"
                            searchable
                            multi
                            placeholder="Search Namespace"
                            type={AppListConstants.FilterType.NAMESPACE}
                            applyFilter={applyFilter}
                            isDisabled={!_isAnyClusterFilterApplied}
                            disableTooltipMessage="Select a cluster first"
                            isLabelHtml
                            onShowHideFilterContent={onShowHideFilterContent}
                            loading={fetchingNamespaces}
                            errored={fetchingNamespacesErrored}
                            errorMessage="Could not load namespaces"
                            errorCallbackFunction={_forceFetchAndSetNamespaces}
                            dataTestId="namespace-filter"
                        />
                    )}
                    {showExportCsvButton && (
                        <>
                            <span className="filter-divider" />
                            <ExportToCsv
                                className="ml-10"
                                apiPromise={getAppListDataToExport}
                                fileName={FILE_NAMES.Apps}
                                disabled={!appCount}
                            />
                        </>
                    )}
                </div>
            </div>
        )
    }

    function renderAppliedFilters() {
        let count = 0
        const keys = Object.keys(masterFilters)
        const appliedFilters = (
            <div className="saved-filters__wrap dc__position-rel">
                {keys.map((key) => {
                    let filterType = ''
                    let _filterKey = ''
                    if (key == StatusConstants.PROJECT.pluralLower) {
                        filterType = AppListConstants.FilterType.PROJECT
                        _filterKey = StatusConstants.PROJECT.lowerCase
                    } else if (key == StatusConstants.CLUSTER.pluralLower) {
                        filterType = AppListConstants.FilterType.CLUTSER
                        _filterKey = StatusConstants.CLUSTER.lowerCase
                    } else if (key == StatusConstants.NAMESPACE.pluralLower) {
                        filterType = AppListConstants.FilterType.NAMESPACE
                        _filterKey = StatusConstants.NAMESPACE.lowerCase
                    } else if (key == StatusConstants.ENVIRONMENT.pluralLower) {
                        filterType = AppListConstants.FilterType.ENVIRONMENT
                        _filterKey = StatusConstants.ENVIRONMENT.lowerCase
                    } else if (key == StatusConstants.APP_STATUS.noSpaceLower) {
                        filterType = AppListConstants.FilterType.APP_STATUS
                        _filterKey = StatusConstants.APP_STATUS.normalText
                    } else if (key == StatusConstants.TEMPLATE_TYPE.noSpaceLower) {
                        filterType = AppListConstants.FilterType.TEMPLATE_TYPE
                        _filterKey = StatusConstants.TEMPLATE_TYPE.normalCase
                    }
                    return masterFilters[key].map((filter) => {
                        if (filter.isChecked) {
                            count++
                            const _text =
                                filterType == AppListConstants.FilterType.NAMESPACE
                                    ? `${filter.actualName} (${filter.clusterName})`
                                    : filter.label
                            return (
                                <div key={filter.key} className="saved-filter">
                                    <span className="fw-6 mr-5">{_filterKey}</span>
                                    <span className="saved-filter-divider" />
                                    <span className="ml-5">{_text}</span>
                                    <button
                                        type="button"
                                        className="saved-filter__close-btn"
                                        onClick={(event) => removeFilter(filter, filterType)}
                                    >
                                        <i className="fa fa-times-circle" aria-hidden="true" />
                                    </button>
                                </div>
                            )
                        }
                    })
                })}
                <button
                    type="button"
                    className="saved-filters__clear-btn fs-13"
                    onClick={() => {
                        removeAllFilters()
                    }}
                >
                    Clear All Filters
                </button>
            </div>
        )

        return <>{count > 0 ? appliedFilters : null}</>
    }

    const renderAppTabs = () => {
        const tabs: TabProps[] = [
            ...(serverMode !== SERVER_MODE.EA_ONLY
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
                    ['data-testid']: 'helm-app-list-button',
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
                              ['data-testid']: 'argo-app-list-button',
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
                              ['data-testid']: 'flux-app-list-button',
                          },
                      },
                  ]
                : []),
        ]

        const rightComponent = (
            <div className="flex fs-13">
                {lastDataSyncTimeString &&
                    (params.appType == AppListConstants.AppType.DEVTRON_APPS ||
                        (params.appType == AppListConstants.AppType.HELM_APPS && !fetchingExternalApps)) && (
                        <>
                            <span data-testid="sync-now-text">{lastDataSyncTimeString}</span>
                            {!isDataSyncing && (
                                <>
                                    &nbsp;
                                    <button
                                        className="btn btn-link p-0 fw-6 cb-5"
                                        onClick={syncNow}
                                        data-testid="sync-now-button"
                                    >
                                        Sync now
                                    </button>
                                </>
                            )}
                        </>
                    )}
                {params.appType == AppListConstants.AppType.HELM_APPS &&
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
            currentTab == AppListConstants.AppTabs.DEVTRON_APPS ? URLS.DEVTRON_APP_LIST : URLS.HELM_APP_LIST
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

    if (dataStateType === AppListViewType.ERROR) {
        return <ErrorScreenManager code={errorResponseCode} />
    }

    return (
        <div className="flexbox-col h-100 dc__overflow-scroll">
            <HeaderWithCreateButton headerName="Applications" />
            {renderMasterFilters()}
            {renderAppliedFilters()}
            {renderAppTabs()}
            {serverMode === SERVER_MODE.FULL && renderAppCreateRouter()}
            {params.appType === AppListConstants.AppType.DEVTRON_APPS && serverMode === SERVER_MODE.FULL && (
                <DevtronAppListContainer
                    payloadParsedFromUrl={parsedPayloadOnUrlChange}
                    environmentClusterList={environmentClusterListRes}
                    clearAllFilters={removeAllFilters}
                    sortApplicationList={sortApplicationList}
                    appListCount={appListCount}
                    isSuperAdmin={isSuperAdmin}
                    openDevtronAppCreateModel={openDevtronAppCreateModel}
                    setAppCount={setAppCount}
                    updateDataSyncing={updateDataSyncing}
                    isArgoInstalled={isArgoInstalled}
                    setCurrentAppName={setCurrentAppName}
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
                        payloadParsedFromUrl={parsedPayloadOnUrlChange}
                        sortApplicationList={sortApplicationList}
                        clearAllFilters={removeAllFilters}
                        fetchingExternalApps={fetchingExternalApps}
                        setFetchingExternalAppsState={setFetchingExternalAppsState}
                        updateDataSyncing={updateDataSyncing}
                        setShowPulsatingDotState={setShowPulsatingDotState}
                        masterFilters={masterFilters}
                        syncListData={syncListData}
                        isArgoInstalled={isArgoInstalled}
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
                <>
                    <GenericAppList
                        key={params.appType}
                        payloadParsedFromUrl={parsedPayloadOnUrlChange}
                        sortApplicationList={sortApplicationList}
                        clearAllFilters={removeAllFilters}
                        setShowPulsatingDotState={setShowPulsatingDotState}
                        masterFilters={masterFilters}
                        isSSE={isExternalFlux}
                        appType={params.appType}
                    />
                    {fetchingExternalApps && (
                        <div className="mt-16">
                            <Progressing size={32} />
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
