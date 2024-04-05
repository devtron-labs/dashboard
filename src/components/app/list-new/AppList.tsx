import React, { useState, useEffect, useContext } from 'react'
import { useLocation, useHistory, useParams } from 'react-router'
import { Switch, Route } from 'react-router-dom'
import {
    showError,
    Progressing,
    ErrorScreenManager,
    stopPropagation,
    ServerErrors,
    useAsync,
} from '@devtron-labs/devtron-fe-common-lib'
import * as queryString from 'query-string'
import moment from 'moment'
import { Filter, FilterOption, handleUTCTime } from '../../common'
import { ReactComponent as Search } from '../../../assets/icons/ic-search.svg'
import { getInitData, buildClusterVsNamespace, getNamespaces } from './AppListService'
import { AppListViewType } from '../config'
import { URLS, AppListConstants, SERVER_MODE, DOCUMENTATION, Moment12HourFormat, ModuleNameMap } from '../../../config'
import { ReactComponent as Clear } from '../../../assets/icons/ic-error.svg'
import DevtronAppListContainer from '../list/DevtronAppListContainer'
import HelmAppList from './HelmAppList'
import { AppListPropType, EnvironmentClusterList, OrderBy, SortBy } from '../list/types'
import { AddNewApp } from '../create/CreateApp'
import { mainContext } from '../../common/navigation/NavigationRoutes'
import '../list/list.scss'
import EAEmptyState, { EAEmptyStateType } from '../../common/eaEmptyState/EAEmptyState'
import ExportToCsv from '../../common/ExportToCsv/ExportToCsv'
import { FILE_NAMES } from '../../common/ExportToCsv/constants'
import { getAppList } from '../service'
import { getUserRole } from '../../../Pages/GlobalConfigurations/Authorization/authorization.service'
import { APP_LIST_HEADERS, StatusConstants } from './Constants'
import HeaderWithCreateButton from '../../common/header/HeaderWithCreateButton/HeaderWithCreateButton'
import { getModuleInfo } from '../../v2/devtronStackManager/DevtronStackManager.service'
import { createAppListPayload } from '../list/appList.modal'
import ExternalArgoList from './ExternalArgoList'
import {
    buildArgoAppListUrl,
    buildDevtronAppListUrl,
    buildHelmAppListUrl,
    getChangeAppTabURL,
    getCurrentTabName,
} from './list.utils'

export default function AppList({ isSuperAdmin, appListCount, isArgoInstalled }: AppListPropType) {
    const location = useLocation()
    const history = useHistory()
    const params = useParams<{ appType: string }>()
    const { serverMode, setPageOverflowEnabled } = useContext(mainContext)
    const [dataStateType, setDataStateType] = useState(AppListViewType.LOADING)
    const [errorResponseCode, setErrorResponseCode] = useState(0)
    const [lastDataSyncTimeString, setLastDataSyncTimeString] = useState<React.ReactNode>('')
    const [isDataSyncing, setDataSyncing] = useState(false)
    const [fetchingNamespaces, setFetchingNamespaces] = useState(false)
    const [fetchingNamespacesErrored, setFetchingNamespacesErrored] = useState(false)
    const [parsedPayloadOnUrlChange, setParsedPayloadOnUrlChange] = useState({})
    const [currentTab, setCurrentTab] = useState(undefined)
    const [syncListData, setSyncListData] = useState<boolean>()
    const [projectMap, setProjectMap] = useState(new Map())

    // check for external argoCD app
    const isExternalArgo = location.pathname === `${URLS.APP}/${URLS.APP_LIST}/${URLS.APP_LIST_ARGO}`

    // API master data
    const [environmentClusterListRes, setEnvironmentClusterListRes] = useState<EnvironmentClusterList>()

    // search
    const [searchString, setSearchString] = useState(undefined)
    const [searchApplied, setSearchApplied] = useState(false)

    // filters
    const [masterFilters, setMasterFilters] = useState({
        appStatus: [],
        projects: [],
        environments: [],
        clusters: [],
        namespaces: [],
    })
    const [showPulsatingDot, setShowPulsatingDot] = useState<boolean>(false)
    const [fetchingExternalApps, setFetchingExternalApps] = useState(false)
    const [appCount, setAppCount] = useState(0)
    const [, userRoleResponse] = useAsync(getUserRole, [])

    // on page load
    useEffect(() => {
        setCurrentTab(getCurrentTabName(params.appType, isExternalArgo))

        // set search data
        const searchQuery = location.search
        const queryParams = queryString.parse(searchQuery)
        if (queryParams.search) {
            setSearchString(queryParams.search)
            setSearchApplied(true)
        }

        // set payload parsed from url
        const payloadParsedFromUrl = onRequestUrlChange()
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
                        getCurrentTabName(params.appType, isExternalArgo),
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
        setParsedPayloadOnUrlChange(onRequestUrlChange())
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

        const params = queryString.parse(searchQuery)
        const search = params.search || ''
        const environments = params.environment || ''
        const appStatus = params.appStatus || ''
        const teams = params.team || ''
        const clustersAndNamespaces = params.namespace || ''

        const _clusterVsNamespaceMap = buildClusterVsNamespace(clustersAndNamespaces)
        const environmentsArr = environments
            .toString()
            .split(',')
            .map((env) => +env)
            .filter((item) => item != 0)
        const teamsArr = teams
            .toString()
            .split(',')
            .filter((team) => team != '')
            .map((team) => Number(team))
        const appStatusArr = appStatus
            .toString()
            .split(',')
            .filter((status) => status != '')
            .map((status) => status)

        // update master filters data (check/uncheck)
        const filterApplied = {
            environments: new Set<number>(environmentsArr),
            teams: new Set<number>(teamsArr),
            appStatus: new Set<string>(appStatusArr),
            clusterVsNamespaceMap: _clusterVsNamespaceMap,
        }

        const _masterFilters = { appStatus: [], projects: [], environments: [], clusters: [], namespaces: [] }

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
        setMasterFilters(_masterFilters)
        /// /// update master filters data ends (check/uncheck)

        const sortBy = params.orderBy || SortBy.APP_NAME
        const sortOrder = params.sortOrder || OrderBy.ASC
        let offset = +params.offset || 0
        let hOffset = +params.hOffset || 0
        let pageSize: number = +params.pageSize || 20
        const pageSizes = new Set([20, 40, 50])

        if (!pageSizes.has(pageSize)) {
            // handle invalid pageSize
            pageSize = 20
        }
        if (offset % pageSize != 0) {
            // pageSize must be a multiple of offset
            offset = 0
        }
        if (hOffset % pageSize != 0) {
            // pageSize must be a multiple of offset
            hOffset = 0
        }

        const payload = {
            environments: environmentsArr,
            teams: teamsArr,
            namespaces: clustersAndNamespaces
                .toString()
                .split(',')
                .filter((item) => item != ''),
            appNameSearch: search,
            appStatuses: appStatusArr,
            sortBy,
            sortOrder,
            offset,
            hOffset,
            size: showExportCsvButton ? appCount : +pageSize,
        }

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
            currentTab == AppListConstants.AppTabs.DEVTRON_APPS ? buildDevtronAppListUrl() : buildHelmAppListUrl()
        history.push(`${_urlPrefix}/${AppListConstants.CREATE_DEVTRON_APP_URL}${location.search}`)
    }

    const updateDataSyncing = (loading: boolean): void => {
        setDataSyncing(loading)
    }

    const updateAppListURL = (queryStr?: string, selectedAppTab?: string): void => {
        let url = ''
        const _currentTab = selectedAppTab || currentTab
        if (_currentTab === AppListConstants.AppTabs.DEVTRON_APPS) {
            url = buildDevtronAppListUrl()
        } else if (_currentTab === AppListConstants.AppTabs.ARGO_APPS) {
            url = buildArgoAppListUrl()
        } else if (_currentTab === AppListConstants.AppTabs.HELM_APPS) {
            url = buildHelmAppListUrl()
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
        history.push(`${getChangeAppTabURL(appTabType)}${location.search}`)
        setCurrentTab(appTabType)
    }

    const searchApp = (event: React.FormEvent) => {
        event.preventDefault()
        setSearchApplied(true)
        handleAppSearchOperation(searchString)
    }

    const clearSearch = (): void => {
        setSearchApplied(false)
        setSearchString('')
        handleAppSearchOperation('')
    }

    const onChangeSearchString = (event: React.ChangeEvent<HTMLInputElement>): void => {
        let str = event.target.value || ''
        str = str.toLowerCase()
        setSearchString(str)
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

        return (
            <div className="search-filter-section">
                <form style={{ display: 'inline' }} onSubmit={searchApp}>
                    <div className="search">
                        <Search className="search__icon icon-dim-18" />
                        <input
                            data-testid="Search-by-app-name"
                            type="text"
                            name="app_search_input"
                            autoComplete="off"
                            value={searchString}
                            placeholder={`${
                                currentTab === AppListConstants.AppTabs.DEVTRON_APPS
                                    ? 'Search by app name'
                                    : 'Search by app or chart name'
                            }`}
                            className="search__input bcn-1"
                            onChange={onChangeSearchString}
                        />
                        {searchApplied && (
                            <button className="search__clear-button flex" type="button" onClick={clearSearch}>
                                <Clear className="icon-dim-18 icon-n4 vertical-align-middle" />
                            </button>
                        )}
                    </div>
                </form>
                <div className="app-list-filters filters">
                    {!isExternalArgo && (
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
                    <Filter
                        list={masterFilters.clusters}
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
                    {!isExternalArgo && (
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

    function renderAppTabs() {
        return (
            <div className="app-tabs-wrapper">
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
                                data-testid="helm-app-list-button"
                            >
                                {AppListConstants.AppTabs.ARGO_APPS}
                            </a>
                        </li>
                    )}
                </ul>
                <div className="app-tabs-sync fs-13">
                    {lastDataSyncTimeString &&
                        (params.appType == AppListConstants.AppType.DEVTRON_APPS ||
                            (params.appType == AppListConstants.AppType.HELM_APPS && !fetchingExternalApps)) && (
                            <span data-testid="sync-now-text">
                                {lastDataSyncTimeString}&nbsp;
                                {!isDataSyncing && (
                                    <button
                                        className="btn btn-link p-0 fw-6 cb-5"
                                        onClick={syncNow}
                                        data-testid="sync-now-button"
                                    >
                                        Sync now
                                    </button>
                                )}
                            </span>
                        )}
                    {params.appType == AppListConstants.AppType.HELM_APPS &&
                        fetchingExternalApps &&
                        renderDataSyncingText()}
                </div>
            </div>
        )
    }

    const closeDevtronAppCreateModal = (e) => {
        stopPropagation(e)
        const _urlPrefix =
            currentTab == AppListConstants.AppTabs.DEVTRON_APPS ? buildDevtronAppListUrl() : buildHelmAppListUrl()
        history.push(`${_urlPrefix}${location.search}`)
    }

    function renderAppCreateRouter() {
        return (
            <Switch>
                <Route
                    path={`${buildDevtronAppListUrl()}/${AppListConstants.CREATE_DEVTRON_APP_URL}`}
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
                    path={`${buildHelmAppListUrl()}/${AppListConstants.CREATE_DEVTRON_APP_URL}`}
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
        <>
            <HeaderWithCreateButton headerName="Applications" isSuperAdmin={isSuperAdmin} />
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
        </>
    )
}
