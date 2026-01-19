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

import { useRef, useEffect, useMemo, useState, useCallback } from 'react'
import {
    ErrorScreenManager,
    ServerErrors,
    GenericEmptyState,
    AppStatus,
    Host,
    useMainContext,
    Pagination,
    ResponseType,
    SortableTableHeaderCell,
    DEFAULT_BASE_PAGE_SIZE,
    stringComparatorBySortOrder,
    showError,
    useStickyEvent,
    getClassNameForStickyHeaderWithShadow,
    InfrastructureManagementAppListType,
    URLS as CommonURLS,
    Table,
    PaginationEnum,
    FiltersTypeEnum,
    TableColumnType,
} from '@devtron-labs/devtron-fe-common-lib'
import { Link, useHistory } from 'react-router-dom'
import Tippy from '@tippyjs/react'
import { getArgoInstalledExternalApps } from './AppListService'
import { LazyImage } from '../../common'
import { Routes, URLS } from '../../../config'
import { AppListViewType } from '../config'
import SelectClusterImage from '../../../assets/icons/ic-select-cluster.svg'
import defaultChartImage from '../../../assets/icons/ic-default-chart.svg'
import noChartInClusterImage from '../../../assets/img/ic-no-chart-in-clusters@2x.png'
import '../list/list.scss'
import {
    APP_LIST_EMPTY_STATE_MESSAGING,
    APP_LIST_HEADERS,
    appListLoadingArray,
    FLUX_CD_HELM_RELEASE_LABEL,
} from './Constants'
import { ReactComponent as ICHelpOutline } from '../../../assets/icons/ic-help-outline.svg'
import {
    AppListSortableKeys,
    FluxCDTemplateType,
    GenericAppListProps,
    GenericAppListResponse,
    GenericAppType,
    GenericAppListRowType,
} from './AppListType'
import { renderIcon, getGenericAppListColumns } from './list.utils'
import { EXTERNAL_FLUX_APP_STATUS } from '../../../Pages/App/Details/ExternalFlux/types'
import AskToClearFilters from './AppListComponents'

import './styles.scss'

// This app list is currently used for ExternalArgoCD and ExternalFluxCD app listing
const GenericAppList = ({
    filterConfig,
    clearAllFilters,
    appType,
    clusterIdsCsv,
    clusterList,
    changePage,
    changePageSize,
    handleSorting,
    setShowPulsatingDot,
    appListContainerRef,
}: GenericAppListProps) => {
    const [dataStateType, setDataStateType] = useState(AppListViewType.LOADING)
    const [errorResponseCode, setErrorResponseCode] = useState(0)
    const [appsList, setAppsList] = useState<GenericAppType[]>([])
    const sseConnectionRef = useRef<EventSource>()
    const { isSuperAdmin } = useMainContext()

    const { push } = useHistory()

    const isArgoCDAppList = appType === InfrastructureManagementAppListType.ARGO_CD
    const isFluxCDAppList = appType === InfrastructureManagementAppListType.FLUX_CD

    const { searchKey, templateType, namespace, cluster } = filterConfig

    const rows = useMemo(() =>
        appsList.map((app) => ({
            id: `${app.appName}:${app.clusterName}:${app.namespace}`,
            data: {
                detail: app,
                [AppListSortableKeys.APP_NAME]: app.appName,
                [APP_LIST_HEADERS[isFluxCDAppList ? 'Status' : 'AppStatus']]: (
                    <AppStatus status={app.appStatus} />
                ),
                [APP_LIST_HEADERS.FluxCDTemplateType]: app.fluxAppDeploymentType,
                [APP_LIST_HEADERS.Environment]: `${app.clusterName}__${app.namespace}`,
                [APP_LIST_HEADERS.Cluster]: app.clusterName,
                [APP_LIST_HEADERS.Namespace]: app.namespace,
            },
        })),
        [appsList],
    )

    const closeCurrentSseConnection = () => {
        sseConnectionRef.current?.close()
        sseConnectionRef.current = null
    }

    const onSSEConnectionMessage = (message) => {
        try {
            const externalAppData: ResponseType<GenericAppListResponse> = JSON.parse(message.data)
            externalAppData.result.fluxApplication?.forEach((fluxApp) => {
                if (fluxApp.appStatus === 'True') {
                    fluxApp.appStatus = EXTERNAL_FLUX_APP_STATUS.READY
                } else if (fluxApp.appStatus === 'False') {
                    fluxApp.appStatus = EXTERNAL_FLUX_APP_STATUS.NOT_READY
                }
            })
            const receivedExternalFluxApps = externalAppData?.result?.fluxApplication || []
            setAppsList((currAppList) => [...currAppList, ...receivedExternalFluxApps])
            setDataStateType(AppListViewType.LIST)
        } catch (err) {
            showError(err)
            setDataStateType(AppListViewType.ERROR)
        }
    }


    const getExternalInstalledFluxApps = (clusterIdsCsv: string) => {
        const fluxAppListURL = `${Host}/${Routes.FLUX_APPS}?clusterIds=${clusterIdsCsv}`

        closeCurrentSseConnection()

        sseConnectionRef.current = new EventSource(fluxAppListURL, {
            withCredentials: true,
        })

        sseConnectionRef.current.onmessage = onSSEConnectionMessage
        sseConnectionRef.current.onerror = closeCurrentSseConnection
    }

    const init = () => {
        setDataStateType(clusterIdsCsv ? AppListViewType.LOADING : AppListViewType.LIST)
        setAppsList([])
        closeCurrentSseConnection()
    }

    // component load
    useEffect(() => {
        init()
        return () => {
            setShowPulsatingDot(false)
        }
    }, [])

    const handleArgoAppListing = () => {
        if (!clusterIdsCsv) return
        setDataStateType(AppListViewType.LOADING)
        getArgoInstalledExternalApps(clusterIdsCsv)
            .then((appsListResponse) => {
                setAppsList(appsListResponse.result)
                setDataStateType(AppListViewType.LIST)
            })
            .catch((errors: ServerErrors) => {
                setErrorResponseCode(errors.code)
                setDataStateType(AppListViewType.ERROR)
            })
    }

    const handleFluxAppListing = () => {
        closeCurrentSseConnection()
        setAppsList([])
        setDataStateType(AppListViewType.LOADING)
        getExternalInstalledFluxApps(clusterIdsCsv)
    }

    const handleAppListing = () => {
        if (isArgoCDAppList) {
            handleArgoAppListing()
            return
        }
        handleFluxAppListing()
    }

    useEffect(() => {
        if (!clusterIdsCsv) {
            setAppsList([])
            setShowPulsatingDot(true)
            return
        }
        setShowPulsatingDot(false)
        handleAppListing()
    }, [clusterIdsCsv])

    const isAnyFilterAppliedExceptCluster = !!searchKey || !!templateType.length || !!namespace.length

    const isAnyFilterApplied = isAnyFilterAppliedExceptCluster || !!clusterIdsCsv

    const isAllClusterSelected = cluster.length === clusterList?.filter((cluster) => !cluster.isVirtualCluster).length

    const isOnlyAllClusterFilterApplied = isAllClusterSelected && templateType.length === 0 && !searchKey && !namespace.length

    const buildAppDetailUrl = (app: GenericAppType): string => {
        if (isArgoCDAppList) {
            return `${CommonURLS.INFRASTRUCTURE_MANAGEMENT_APP}/${URLS.EXTERNAL_ARGO_APP}/${app.clusterId}/${app.appName}/${app.namespace}`
        }
        return `${CommonURLS.INFRASTRUCTURE_MANAGEMENT_APP}/${URLS.EXTERNAL_FLUX_APP}/${app.clusterId}/${app.appName}/${app.namespace}/${app.fluxAppDeploymentType}`
    }

    const askToSelectClusterId = () => (
        <div className="dc__position-rel flex-grow-1">
            <GenericEmptyState
                image={SelectClusterImage}
                title={APP_LIST_EMPTY_STATE_MESSAGING.heading}
                subTitle={
                    isArgoCDAppList
                        ? APP_LIST_EMPTY_STATE_MESSAGING.argoCDInfoText
                        : APP_LIST_EMPTY_STATE_MESSAGING.fluxCDInfoText
                }
            />
        </div>
    )

    const columns: TableColumnType<GenericAppListRowType, FiltersTypeEnum.URL>[] = useMemo(
        () => getGenericAppListColumns(isFluxCDAppList),
        [isFluxCDAppList],
    )

    const onRowClick = useCallback(({ data: app }) => {
        push(buildAppDetailUrl(app.detail))
    }, [])

    const filter = useCallback(({ data: app }) => {
        let isMatch = true

        if (searchKey) {
            const searchLowerCase = searchKey.toLowerCase()
            isMatch = isMatch && app.detail.appName.includes(searchLowerCase)
        }

        if (templateType.length) {
            isMatch = isMatch && templateType.includes(app.detail.fluxAppDeploymentType)
        }

        if (namespace.length) {
            isMatch = isMatch && namespace.includes(`${app.detail.clusterId}_${app.detail.namespace}`)
        }

        return !isAnyFilterAppliedExceptCluster || isMatch
    }, [searchKey, templateType, namespace, isAnyFilterAppliedExceptCluster])


    const askToConnectAClusterForNoResult = () => {
        return {
            imgName: 'img-no-chart-in-clusters',
            title: APP_LIST_EMPTY_STATE_MESSAGING.noAppsFound,
            subTitle: APP_LIST_EMPTY_STATE_MESSAGING.noAppsFoundInfoText,
            // NOTE: if handleClearFilters is provided renderButton is not rendered
            // therefore need to override this
            handleClearFilters: null,
            isButtonAvailable: true,
            renderButton: () => {
                return (
                    <Link to={URLS.GLOBAL_CONFIG_CLUSTER}>
                        <button type="button" className="cta flex">
                            {APP_LIST_EMPTY_STATE_MESSAGING.connectClusterLabel}
                        </button>
                    </Link>
                )
            },
        }
    }

    if (!isSuperAdmin) {
        return (
            <div className="flex-grow-1">
                <ErrorScreenManager code={403} />
            </div>
        )
    }


    if (!clusterIdsCsv) {
        return askToSelectClusterId()
    }

    if (dataStateType === AppListViewType.ERROR) {
        return (
            <div className="flex-grow-1">
                <ErrorScreenManager code={errorResponseCode} />
            </div>
        )
    }

    return (
        <Table<GenericAppListRowType, FiltersTypeEnum.URL>
            id="table__generic-app-list"
            columns={columns}
            loading={dataStateType === AppListViewType.LOADING}
            rows={rows}
            filter={filter}
            rowStartIconConfig={{
                name: isFluxCDAppList ? 'ic-fluxcd-app' : 'ic-argocd-app',
                color: null,
                size: 24,
            }}
            filtersVariant={FiltersTypeEnum.URL}
            paginationVariant={PaginationEnum.PAGINATED}
            emptyStateConfig={{
                noRowsForFilterConfig: isOnlyAllClusterFilterApplied ? askToConnectAClusterForNoResult() : {
                    title: APP_LIST_EMPTY_STATE_MESSAGING.noAppsFound,
                    subTitle: APP_LIST_EMPTY_STATE_MESSAGING.noAppsFoundInfoText,
                },
                // NOTE: handled externally;
                // since cluster Id filter has to be applied for table to be rendered
                noRowsConfig: null,
            }}
            clearFilters={clearAllFilters}
            onRowClick={onRowClick}
            additionalFilterProps={{
                initialSortKey: AppListSortableKeys.APP_NAME,
            }}
            areFiltersApplied={isAnyFilterApplied}
        />
    )
}

export default GenericAppList
