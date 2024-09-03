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

import { useEffect, useState } from 'react'
import {
    ErrorScreenManager,
    ServerErrors,
    GenericEmptyState,
    AppStatus,
    AppListConstants,
    Host,
    useMainContext,
    Pagination,
    ResponseType,
    SortableTableHeaderCell,
    DEFAULT_BASE_PAGE_SIZE,
    stringComparatorBySortOrder,
} from '@devtron-labs/devtron-fe-common-lib'
import { Link } from 'react-router-dom'
import Tippy from '@tippyjs/react'
import { getArgoInstalledExternalApps } from './AppListService'
import { LazyImage } from '../../common'
import { Routes, URLS } from '../../../config'
import { AppListViewType } from '../config'
import SelectClusterImage from '../../../assets/icons/ic-select-cluster.svg'
import defaultChartImage from '../../../assets/icons/ic-default-chart.svg'
import { Empty } from '../list/emptyView/Empty'
import { ReactComponent as InfoFill } from '../../../assets/icons/ic-info-filled.svg'
import noChartInClusterImage from '../../../assets/img/ic-no-chart-in-clusters@2x.png'
import '../list/list.scss'
import {
    APP_LIST_EMPTY_STATE_MESSAGING,
    APP_LIST_HEADERS,
    ClearFiltersLabel,
    ENVIRONMENT_HEADER_TIPPY_CONTENT,
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
} from './AppListType'
import { renderIcon } from './list.utils'
import { EXTERNAL_FLUX_APP_STATUS } from '../../../Pages/App/Details/ExternalFlux/types'

// This app list is currently used for ExternalArgoCD and ExternalFluxCD app listing
const GenericAppList = ({
    filterConfig,
    appFiltersResponseLoading,
    clearAllFilters,
    appType,
    clusterIdsCsv,
    clusterList,
    changePage,
    changePageSize,
    handleSorting,
    setShowPulsatingDot,
}: GenericAppListProps) => {
    const [dataStateType, setDataStateType] = useState(AppListViewType.LOADING)
    const [errorResponseCode, setErrorResponseCode] = useState(0)
    const [appsList, setAppsList] = useState<GenericAppType[]>([])
    const [sseConnection, setSseConnection] = useState<EventSource>(null)
    const { isSuperAdmin } = useMainContext()

    const isArgoCDAppList = appType === AppListConstants.AppType.ARGO_APPS
    const isFluxCDAppList = appType === AppListConstants.AppType.FLUX_APPS

    const { searchKey, sortBy, sortOrder, templateType, namespace, cluster, offset, pageSize } = filterConfig

    // Filtering
    const getFilteredAppList = (): GenericAppType[] => {
        let tempFilteredList = appsList
        if (searchKey) {
            tempFilteredList = tempFilteredList.filter((app) => app.appName.includes(searchKey.toLowerCase()))
        }
        if (templateType?.length) {
            tempFilteredList = tempFilteredList.filter((app) => templateType.includes(app.fluxAppDeploymentType))
        }
        if (namespace?.length) {
            tempFilteredList = tempFilteredList.filter((app) => namespace.includes(`${app.clusterId}_${app.namespace}`))
        }
        tempFilteredList = tempFilteredList.sort((a, b) => stringComparatorBySortOrder(a.appName, b.appName, sortOrder)) // Sorting
        return tempFilteredList
    }

    const filteredAppsList: GenericAppType[] = getFilteredAppList()

    const closeSseConnection = (sseConnection: EventSource) => {
        sseConnection.close()
        setSseConnection(null)
    }

    const getExternalInstalledFluxApps = (clusterIdsCsv: string) => {
        const fluxAppListURL = `${Host}/${Routes.FLUX_APPS}?clusterIds=${clusterIdsCsv}`

        const sseConnection = new EventSource(fluxAppListURL, {
            withCredentials: true,
        })

        sseConnection.onmessage = (message) => {
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
                setDataStateType(AppListViewType.ERROR)
            }
        }
        sseConnection.onerror = () => {
            closeSseConnection(sseConnection)
        }
        setSseConnection(sseConnection)
    }

    // component load
    useEffect(() => {
        init()
    }, [])

    const handleArgoAppListing = () => {
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
        setAppsList([])
        setDataStateType(AppListViewType.LOADING)
        getExternalInstalledFluxApps(clusterIdsCsv)
    }

    useEffect(() => {
        if (!clusterIdsCsv) {
            setAppsList([])
            setShowPulsatingDot(true)
            return
        }
        setShowPulsatingDot(false)
        if (isArgoCDAppList) {
            handleArgoAppListing()
            return
        }
        if (isFluxCDAppList) {
            handleFluxAppListing()
        }
    }, [clusterIdsCsv])

    const init = () => {
        clusterIdsCsv ? setDataStateType(AppListViewType.LOADING) : setDataStateType(AppListViewType.LIST)
        setAppsList([])
        if (sseConnection) {
            sseConnection.close()
        }
        setSseConnection(null)
    }

    const handleAppNameSorting = () => handleSorting(AppListSortableKeys.APP_NAME)

    const isAnyFilterAppliedExceptCluster = !!searchKey?.length || !!templateType?.length

    const isAnyFilterApplied = isAnyFilterAppliedExceptCluster || !!clusterIdsCsv

    const isAllClusterSelected = cluster?.length === clusterList?.length

    const isOnlyAllClusterFilterApplied = isAllClusterSelected && templateType?.length === 0 && !searchKey

    function handleImageError(e) {
        const target = e.target as HTMLImageElement
        target.onerror = null
        target.src = defaultChartImage
    }

    const buildAppDetailUrl = (app: GenericAppType): string => {
        if (isArgoCDAppList) {
            return `${URLS.APP}/${URLS.EXTERNAL_ARGO_APP}/${app.clusterId}/${app.appName}/${app.namespace}`
        }
        return `${URLS.APP}/${URLS.EXTERNAL_FLUX_APP}/${app.clusterId}/${app.appName}/${app.namespace}/${app.fluxAppDeploymentType}`
    }

    function renderAppListHeader() {
        return (
            <div
                className={`app-list__header app-list__header${isFluxCDAppList ? '__fluxcd' : ''} dc__position-sticky dc__top-47`}
            >
                <div className="app-list__cell--icon" />
                <div className="app-list__cell app-list__cell--name">
                    <SortableTableHeaderCell
                        title={APP_LIST_HEADERS.AppName}
                        isSorted={sortBy === AppListSortableKeys.APP_NAME}
                        isSortable
                        triggerSorting={handleAppNameSorting}
                        sortOrder={sortOrder}
                        disabled={false}
                    />
                </div>
                <div className="app-list__cell app-list__cell--app_status">
                    <span className="app-list__cell-header">
                        {/* In case of FluxCD AppStatus is shown as Status */}
                        {isFluxCDAppList ? APP_LIST_HEADERS.Status : APP_LIST_HEADERS.AppStatus}
                    </span>
                </div>
                {/* Template Type is only shown in FluxCD */}
                {isFluxCDAppList && (
                    <div className="app-list__cell">
                        <span>{APP_LIST_HEADERS.FluxCDTemplateType}</span>
                    </div>
                )}
                <div className="app-list__cell app-list__cell--env">
                    <span className="app-list__cell-header mr-4">{APP_LIST_HEADERS.Environment}</span>
                    <Tippy className="default-tt" arrow placement="top" content={ENVIRONMENT_HEADER_TIPPY_CONTENT}>
                        <span>
                            <ICHelpOutline className="icon-dim-20" />
                        </span>
                    </Tippy>
                </div>

                <div className="app-list__cell app-list__cell--cluster">
                    <span className="app-list__cell-header">{APP_LIST_HEADERS.Cluster}</span>
                </div>
                <div className="app-list__cell app-list__cell--namespace">
                    <span className="app-list__cell-header">{APP_LIST_HEADERS.Namespace}</span>
                </div>
            </div>
        )
    }

    const renderAppRow = (app: GenericAppType): JSX.Element => {
        return (
            <Link
                to={buildAppDetailUrl(app)}
                className={`app-list__row ${isFluxCDAppList ? 'app-list__row__fluxcd' : ''}`}
                data-testid="app-list-row"
            >
                <div className="app-list__cell--icon">
                    <LazyImage
                        className="dc__chart-grid-item__icon icon-dim-24"
                        src={renderIcon(appType)}
                        onError={handleImageError}
                    />
                </div>
                <div className="app-list__cell app-list__cell--name flex column left">
                    <div className="dc__truncate-text  m-0 value">{app.appName}</div>
                </div>
                <div className="app-list__cell app-list__cell--namespace">
                    <AppStatus appStatus={app.appStatus} />
                </div>
                {/* Template Type is only shown in FluxCD */}
                {isFluxCDAppList && (
                    <div>
                        {app.fluxAppDeploymentType === FluxCDTemplateType.HELM_RELEASE
                            ? FLUX_CD_HELM_RELEASE_LABEL
                            : app.fluxAppDeploymentType}
                    </div>
                )}
                <div className="app-list__cell app-list__cell--env">
                    <p
                        className="dc__truncate-text  m-0"
                        data-testid={`${`${app.clusterName}__${app.namespace}`}-environment`}
                    >
                        {`${app.clusterName}__${app.namespace}`}
                    </p>
                </div>
                <div className="app-list__cell app-list__cell--cluster">
                    <p className="dc__truncate-text  m-0" data-testid={`${app.clusterName}`}>
                        {app.clusterName}
                    </p>
                </div>
                <div className="app-list__cell app-list__cell--namespace">
                    <p className="dc__truncate-text  m-0" data-testid={`${app.namespace}`}>
                        {app.namespace}
                    </p>
                </div>
            </Link>
        )
    }

    function renderApplicationList() {
        return (
            <div data-testid="external-argo-list-container">
                {renderAppListHeader()}
                {filteredAppsList
                    .slice(offset, offset + pageSize) // Pagination
                    .map((app, index) => (
                        <div key={`${app.appName}-${index}`}>{renderAppRow(app)} </div>
                    ))}
            </div>
        )
    }

    function askToSelectClusterId() {
        return (
            <div className="dc__position-rel" style={{ height: 'calc(100vh - 150px)' }}>
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
    }

    function askToClearFilters(showTipToSelectCluster?: boolean) {
        return (
            <Empty
                view={AppListViewType.NO_RESULT}
                title={APP_LIST_EMPTY_STATE_MESSAGING.noAppsFound}
                message={APP_LIST_EMPTY_STATE_MESSAGING.noAppsFoundInfoText}
                buttonLabel={ClearFiltersLabel}
                clickHandler={clearAllFilters}
            >
                {showTipToSelectCluster && (
                    <div className="mt-18">
                        <p
                            className="bcb-1 cn-9 fs-13 pt-10 pb-10 pl-16 pr-16 eb-2 bw-1 br-4 cluster-tip flex left top"
                            style={{ width: '300px' }}
                        >
                            <span>
                                <InfoFill className="icon-dim-20" />
                            </span>
                            <div className="ml-12 cn-9" style={{ textAlign: 'start' }}>
                                <span className="fw-6">Tip </span>
                                <span>{APP_LIST_EMPTY_STATE_MESSAGING.selectCluster}</span>
                            </div>
                        </p>
                    </div>
                )}
            </Empty>
        )
    }

    function askToClearFiltersWithSelectClusterTip() {
        return <div className="flex column">{askToClearFilters(true)}</div>
    }

    function askToConnectAClusterForNoResult() {
        const handleButton = () => {
            return (
                <Link to={URLS.GLOBAL_CONFIG_CLUSTER}>
                    <button type="button" className="cta flex">
                        {APP_LIST_EMPTY_STATE_MESSAGING.connectClusterLabel}
                    </button>
                </Link>
            )
        }
        return (
            <div className="dc__position-rel" style={{ height: 'calc(100vh - 150px)' }}>
                <GenericEmptyState
                    image={noChartInClusterImage}
                    title={APP_LIST_EMPTY_STATE_MESSAGING.noAppsFound}
                    subTitle={APP_LIST_EMPTY_STATE_MESSAGING.noAppsFoundInfoText}
                    isButtonAvailable
                    renderButton={handleButton}
                />
            </div>
        )
    }

    function renderNoApplicationState() {
        if (isAnyFilterAppliedExceptCluster && !clusterIdsCsv) {
            return askToClearFiltersWithSelectClusterTip()
        }
        if (isOnlyAllClusterFilterApplied) {
            return askToConnectAClusterForNoResult()
        }
        if (isAnyFilterApplied) {
            return askToClearFilters()
        }
    }

    function renderFullModeApplicationListContainer() {
        if (filteredAppsList.length === 0) {
            return renderNoApplicationState()
        }
        return renderApplicationList()
    }

    const renderPagination = (): JSX.Element => {
        return (
            filteredAppsList?.length > DEFAULT_BASE_PAGE_SIZE && (
                <Pagination
                    rootClassName="flex dc__content-space px-20"
                    size={filteredAppsList.length}
                    pageSize={pageSize}
                    offset={offset}
                    changePage={changePage}
                    changePageSize={changePageSize}
                />
            )
        )
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

    return (
        <>
            {(dataStateType === AppListViewType.LOADING || appFiltersResponseLoading) && (
                <>
                    {renderAppListHeader()}
                    <div className="cn-9 fs-13 fw-4 lh-20 show-shimmer-loading">
                        {appListLoadingArray.map((eachRow) => (
                            <div className="pl-20 resource-list__table-row" key={eachRow.id}>
                                {Object.keys(eachRow).map((eachKey) => (
                                    <div className="child child-shimmer-loading" key={eachKey} />
                                ))}
                            </div>
                        ))}
                    </div>
                </>
            )}
            {dataStateType === AppListViewType.ERROR && (
                <div className="dc__loading-wrapper">
                    <ErrorScreenManager code={errorResponseCode} />
                </div>
            )}
            {dataStateType === AppListViewType.LIST && !appFiltersResponseLoading && (
                <>
                    {renderFullModeApplicationListContainer()}
                    {renderPagination()}
                </>
            )}
        </>
    )
}

export default GenericAppList
