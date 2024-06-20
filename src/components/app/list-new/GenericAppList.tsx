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

import React, { useEffect, useState } from 'react'
import {
    showError,
    Progressing,
    ErrorScreenManager,
    ServerErrors,
    GenericEmptyState,
    AppStatus,
    AppListConstants,
    Host,
    useMainContext,
} from '@devtron-labs/devtron-fe-common-lib'
import { useLocation, useHistory } from 'react-router'
import { Link } from 'react-router-dom'
import Tippy from '@tippyjs/react'
import { OrderBy } from '../list/types'
import { buildClusterVsNamespace, getArgoInstalledExternalApps } from './AppListService'
import { LazyImage, Pagination } from '../../common'
import { Routes, URLS } from '../../../config'
import { AppListViewType } from '../config'
import NoClusterSelectImage from '../../../assets/gif/ic-empty-select-cluster.gif'
import defaultChartImage from '../../../assets/icons/ic-default-chart.svg'
import { Empty } from '../list/emptyView/Empty'
import { ReactComponent as InfoFill } from '../../../assets/icons/ic-info-filled.svg'
import noChartInClusterImage from '../../../assets/img/ic-no-chart-in-clusters@2x.png'
import '../list/list.scss'
import {
    APPLIST_EMPTY_STATE_MESSAGING,
    APP_LIST_HEADERS,
    ClearFiltersLabel,
    ENVIRONMENT_HEADER_TIPPY_CONTENT,
} from './Constants'
import { GenericAppListProps } from '../types'
import { ReactComponent as ICHelpOutline } from '../../../assets/icons/ic-help-outline.svg'
import { GenericAppListResponse, GenericAppType, FluxCDTemplateType } from './AppListType'
import { renderIcon } from './list.utils'

// This app list is currently used for ExternalArgoCD and ExternalFluxCD app listing
const GenericAppList = ({
    payloadParsedFromUrl,
    sortApplicationList,
    clearAllFilters,
    setShowPulsatingDotState,
    masterFilters,
    appType,
    isSSE = false,
}: GenericAppListProps) => {
    const [dataStateType, setDataStateType] = useState(null)
    const [errorResponseCode, setErrorResponseCode] = useState(0)
    const [appsList, setAppsList] = useState<GenericAppType[]>([])
    // TODO: Remove filteredAppsList state as it is derived from appsList state only
    const [filteredAppsList, setFilteredAppsList] = useState<GenericAppType[]>([])
    const [sortOrder, setSortOrder] = useState(OrderBy.ASC)
    const [clusterIdsCsv, setClusterIdsCsv] = useState('')
    const [appStatus, setAppStatus] = useState('')
    const [sseConnection, setSseConnection] = useState<EventSource>(null)
    const location = useLocation()
    const history = useHistory()
    const params = new URLSearchParams(location.search)
    const { isSuperAdmin } = useMainContext()

    const isArgoCDAppList = appType === AppListConstants.AppType.ARGO_APPS
    const isFluxCDAppList = appType === AppListConstants.AppType.FLUX_APPS

    const closeSseConnection = (sseConnection: EventSource) => {
        sseConnection.close()
        setSseConnection(null)
    }

    const getExternalInstalledFluxApps = (clusterIdsCsv: string) => {
        const fluxAppListURL = `${Host}/${Routes.FLUX_APPS}?clusterIds=${clusterIdsCsv}`

        return new Promise((resolve, reject) => {
            const _sseConnection = new EventSource(fluxAppListURL, {
                withCredentials: true,
            })

            _sseConnection.onmessage = function (message) {
                const externalAppData: GenericAppListResponse = JSON.parse(message.data)
                externalAppData.result.fluxApplication.forEach((fluxApp) => {
                    fluxApp.appStatus === 'True' ? (fluxApp.appStatus = 'Ready') : (fluxApp.appStatus = 'Not Ready')
                })
                const recievedExternalFluxApps = externalAppData?.result?.fluxApplication || []
                setAppsList((currAppList) => [...currAppList, ...recievedExternalFluxApps])
                resolve(null)
            }
            _sseConnection.onerror = function (err) {
                closeSseConnection(_sseConnection)
                reject(err)
            }
            setSseConnection(_sseConnection)
        })
    }

    // component load
    useEffect(() => {
        init()
    }, [])

    // filtering/sorting has been applied
    useEffect(() => {
        if (dataStateType === AppListViewType.LIST) {
            if (clusterIdsCsv === _getClusterIdsFromRequestUrl() && appStatus === _getAppStatusFromRequestUrl()) {
                handleFilteration()
            } else {
                init()
            }
        }
    }, [payloadParsedFromUrl, dataStateType, clusterIdsCsv])

    // when external app data comes
    useEffect(() => {
        if (dataStateType == AppListViewType.LIST) {
            handleFilteration()
        }
    }, [appsList])

    useEffect(() => {
        // fetch external apps list
        if (isArgoCDAppList) {
            setDataStateType(AppListViewType.LOADING)
            getArgoInstalledExternalApps(clusterIdsCsv)
                .then((appsListResponse) => {
                    setAppsList(appsListResponse.result)
                })
                .catch((errors: ServerErrors) => {
                    showError(errors)
                    setDataStateType(AppListViewType.ERROR)
                    setErrorResponseCode(errors.code)
                })
                .finally(() => {
                    setDataStateType(AppListViewType.LIST)
                })
        } else if (isFluxCDAppList && clusterIdsCsv) {
            setDataStateType(AppListViewType.LOADING)
            getExternalInstalledFluxApps(clusterIdsCsv)
                .catch((error) => {
                    showError(error)
                    setDataStateType(AppListViewType.ERROR)
                    setErrorResponseCode(error.code)
                })
                .finally(() => {
                    setDataStateType(AppListViewType.LIST)
                })
        }
    }, [clusterIdsCsv])

    // reset data
    function init() {
        if (!isSSE) {
            setDataStateType(AppListViewType.LOADING)
        } else {
            setDataStateType(AppListViewType.LIST)
        }
        setAppsList([])
        setFilteredAppsList([])
        setClusterIdsCsv(_getClusterIdsFromRequestUrl() ?? '')
        setAppStatus(_getAppStatusFromRequestUrl() ?? '')
        if (sseConnection) {
            sseConnection.close()
        }
        setSseConnection(null)
    }

    function _getClusterIdsFromRequestUrl() {
        return [...buildClusterVsNamespace(payloadParsedFromUrl.namespaces?.join(',')).keys()].join(',')
    }

    function _getAppStatusFromRequestUrl() {
        return payloadParsedFromUrl.appStatuses?.join(',')
    }

    function handleFilteration() {
        const _search = payloadParsedFromUrl.appNameSearch
        const _sortOrder = payloadParsedFromUrl.sortOrder
        const selectedTemplateTypes = payloadParsedFromUrl.templateType || []
        let _filteredAppsList = [...(appsList || [])]

        // handle search
        if (_search?.length) {
            const searchLowerCase = _search.toLowerCase()
            _filteredAppsList = _filteredAppsList.filter((app) => app.appName.toLowerCase().includes(searchLowerCase))
        }

        // handle sorting by ascending/descending order
        if (_sortOrder == OrderBy.ASC) {
            _filteredAppsList = _filteredAppsList.sort((a, b) => a.appName.localeCompare(b.appName))
        } else {
            _filteredAppsList = _filteredAppsList.sort((a, b) => b.appName.localeCompare(a.appName))
        }

        // handle deployment type
        if (selectedTemplateTypes.length === 1) {
            selectedTemplateTypes.includes(FluxCDTemplateType.HELM_RELEASE)
                ? (_filteredAppsList = _filteredAppsList.filter(
                      (app) => app.fluxAppDeploymentType === FluxCDTemplateType.HELM_RELEASE,
                  ))
                : (_filteredAppsList = _filteredAppsList.filter(
                      (app) => app.fluxAppDeploymentType === FluxCDTemplateType.KUSTOMIZATION,
                  ))
        }

        setSortOrder(_sortOrder)
        setFilteredAppsList(_filteredAppsList)
        setShowPulsatingDotState(_filteredAppsList.length == 0 && !clusterIdsCsv)
    }

    function _isAnyFilterationAppliedExceptClusterAndNs() {
        return (
            payloadParsedFromUrl.teams?.length ||
            payloadParsedFromUrl.appNameSearch?.length ||
            payloadParsedFromUrl.environments?.length ||
            payloadParsedFromUrl.templateType?.length
        )
    }

    function _isAnyFilterationApplied() {
        return _isAnyFilterationAppliedExceptClusterAndNs() || payloadParsedFromUrl.namespaces?.length
    }

    function _isOnlyAllClusterFilterationApplied() {
        const _isAllClusterSelected = !masterFilters.clusters.some((_cluster) => !_cluster.isChecked)
        const _isAnyNamespaceSelected = masterFilters.namespaces.some((_namespace) => _namespace.isChecked)
        return _isAllClusterSelected && !_isAnyFilterationAppliedExceptClusterAndNs() && !_isAnyNamespaceSelected
    }

    function handleImageError(e) {
        const target = e.target as HTMLImageElement
        target.onerror = null
        target.src = defaultChartImage
    }

    function _buildAppDetailUrl(app: GenericAppType) {
        return `${URLS.APP}/${isArgoCDAppList ? URLS.EXTERNAL_ARGO_APP : URLS.EXTERNAL_FLUX_APP}/${app.clusterId}/${app.appName}/${app.namespace}`
    }

    function sortByAppName(e) {
        e.preventDefault()
        sortApplicationList('appNameSort')
    }

    function renderAppListHeader() {
        return (
            <div
                className={`app-list__header app-list__header${isFluxCDAppList ? '__fluxcd' : ''} dc__position-sticky dc__top-47`}
            >
                <div className="app-list__cell--icon" />
                <div className="app-list__cell app-list__cell--name">
                    <button className="app-list__cell-header flex" onClick={sortByAppName}>
                        {APP_LIST_HEADERS.AppName}
                        <span className={`sort ${sortOrder == OrderBy.ASC ? '' : 'sort-up'} ml-4`} />
                    </button>
                </div>
                <div className="app-list__cell app-list__cell--app_status">
                    <span className="app-list__cell-header">
                        {/* In case of FluxCD AppStatus is shown as Status */}
                        {isFluxCDAppList ? APP_LIST_HEADERS.FluxCDStatus : APP_LIST_HEADERS.AppStatus}
                    </span>
                </div>
                {/* Template Tyoe is only shown in FluxCD */}
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
                to={_buildAppDetailUrl(app)}
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
                {isFluxCDAppList && <div>{app.fluxAppDeploymentType}</div>}
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
                    .slice(payloadParsedFromUrl.hOffset, payloadParsedFromUrl.hOffset + payloadParsedFromUrl.size)
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
                    image={NoClusterSelectImage}
                    title={APPLIST_EMPTY_STATE_MESSAGING.heading}
                    subTitle={APPLIST_EMPTY_STATE_MESSAGING.fluxCDInfoText}
                />
            </div>
        )
    }

    function askToClearFilters(showTipToSelectCluster?: boolean) {
        return (
            <Empty
                view={AppListViewType.NO_RESULT}
                title={APPLIST_EMPTY_STATE_MESSAGING.noAppsFound}
                message={APPLIST_EMPTY_STATE_MESSAGING.noAppsFoundInfoText}
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
                                <span>{APPLIST_EMPTY_STATE_MESSAGING.selectCluster}</span>
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
                        {APPLIST_EMPTY_STATE_MESSAGING.connectClusterLabel}
                    </button>
                </Link>
            )
        }
        return (
            <div className="dc__position-rel" style={{ height: 'calc(100vh - 150px)' }}>
                <GenericEmptyState
                    image={noChartInClusterImage}
                    title={APPLIST_EMPTY_STATE_MESSAGING.noHelmChartsFound}
                    subTitle={APPLIST_EMPTY_STATE_MESSAGING.connectClusterInfoText}
                    isButtonAvailable
                    renderButton={handleButton}
                />
            </div>
        )
    }

    function renderNoApplicationState() {
        if (_isAnyFilterationAppliedExceptClusterAndNs() && !clusterIdsCsv) {
            return askToClearFiltersWithSelectClusterTip()
        }
        if (_isOnlyAllClusterFilterationApplied()) {
            return askToConnectAClusterForNoResult()
        }
        if (_isAnyFilterationApplied()) {
            return askToClearFilters()
        }
        if (!clusterIdsCsv) {
            return askToSelectClusterId()
        }
    }

    function renderFullModeApplicationListContainer() {
        if (filteredAppsList.length === 0) {
            return renderNoApplicationState()
        }
        return renderApplicationList()
    }

    function changePageSize(size: number): void {
        params.set('pageSize', size.toString())
        params.set('offset', '0')
        params.set('hOffset', '0')
        history.push(`${URLS.APP}/${URLS.APP_LIST}/${appType}?${params.toString()}`)
    }

    function changePage(pageNo: number): void {
        const newOffset = payloadParsedFromUrl.size * (pageNo - 1)

        params.set('hOffset', newOffset.toString())

        history.push(`${URLS.APP}/${URLS.APP_LIST}/${appType}?${params.toString()}`)
    }

    function renderPagination(): JSX.Element {
        return (
            filteredAppsList.length > 20 && (
                <Pagination
                    size={filteredAppsList.length}
                    pageSize={payloadParsedFromUrl.size}
                    offset={payloadParsedFromUrl.hOffset}
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

    return (
        <>
            {dataStateType === AppListViewType.LOADING && (
                <div className="dc__loading-wrapper">
                    <Progressing pageLoader />
                </div>
            )}
            {dataStateType === AppListViewType.ERROR && (
                <div className="dc__loading-wrapper">
                    <ErrorScreenManager code={errorResponseCode} />
                </div>
            )}
            {dataStateType === AppListViewType.LIST && (
                <>
                    {renderFullModeApplicationListContainer()}
                    {renderPagination()}
                </>
            )}
        </>
    )
}

export default GenericAppList