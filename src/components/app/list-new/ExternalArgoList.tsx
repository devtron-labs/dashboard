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
} from '@devtron-labs/devtron-fe-common-lib'
import { useLocation, useHistory } from 'react-router'
import { Link } from 'react-router-dom'
import Tippy from '@tippyjs/react'
import { OrderBy } from '../list/types'
import { buildClusterVsNamespace, getArgoInstalledExternalApps } from './AppListService'
import { Pagination, LazyImage } from '../../common'
import { URLS } from '../../../config'
import { AppListViewType } from '../config'
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
import ArgoCDAppIcon from '../../../assets/icons/ic-argocd-app.svg'
import FluxCDAppIcon from '../../../assets/icons/ic-fluxcd-app.svg'
import { ExternalArgoListType } from '../types'
import { ReactComponent as ICHelpOutline } from '../../../assets/icons/ic-help-outline.svg'
import { ArgoAppListResult, FLUX_CD_DEPLOYMENT_TYPE, FluxCDApp, FluxCDAppListResponse } from './AppListType'

export default function ExternalArgoList({
    payloadParsedFromUrl,
    sortApplicationList,
    clearAllFilters,
    updateDataSyncing,
    masterFilters,
    appType,
}: ExternalArgoListType) {
    const [dataStateType, setDataStateType] = useState(AppListViewType.LOADING)
    const [errorResponseCode, setErrorResponseCode] = useState(0)
    const [appsList, setAppsList] = useState<(ArgoAppListResult | FluxCDApp)[]>([])
    const [filteredAppsList, setFilteredAppsList] = useState<(ArgoAppListResult | FluxCDApp)[]>([])
    const [sortOrder, setSortOrder] = useState(OrderBy.ASC)
    const [clusterIdsCsv, setClusterIdsCsv] = useState('')
    const [appStatus, setAppStatus] = useState('')
    const [sseConnection, setSseConnection] = useState<EventSource>(null)
    const location = useLocation()
    const history = useHistory()
    const params = new URLSearchParams(location.search)

    const isArgoCDAppList = appType === AppListConstants.AppType.ARGO_APPS
    const isFluxCDAppList = appType === AppListConstants.AppType.FLUX_APPS

    const closeSseConnection = (sseConnection: EventSource) => {
        sseConnection.close()
        setSseConnection(null)
    }

    const getExternalInstalledFluxApps = () => {
        return new Promise((resolve, reject) => {
            const _sseConnection = new EventSource(`${Host}/flux-application`, {
                withCredentials: true,
            })

            _sseConnection.onmessage = function (message) {
                const externalAppData: FluxCDAppListResponse = JSON.parse(message.data)
                const recievedExternalFluxApps = externalAppData?.result?.fluxApplication || []

                setAppsList([...recievedExternalFluxApps])
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
        updateDataSyncing(true)
        setDataStateType(AppListViewType.LOADING)
        if (isArgoCDAppList) {
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
                    updateDataSyncing(false)
                    setDataStateType(AppListViewType.LIST)
                })
        } else if (isFluxCDAppList) {
            getExternalInstalledFluxApps()
                .then(() => {
                    setDataStateType(AppListViewType.LIST)
                    updateDataSyncing(false)
                })
                .catch((error) => {
                    showError(error)
                    setDataStateType(AppListViewType.ERROR)
                    setErrorResponseCode(error.code)
                })
                .finally(() => {
                    updateDataSyncing(false)
                    setDataStateType(AppListViewType.LIST)
                })
        }
    }, [clusterIdsCsv])

    // reset data
    function init() {
        setDataStateType(AppListViewType.LOADING)
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
        const selectedDeploymentTypes = payloadParsedFromUrl.deploymentType || []
        let _filteredAppsList = [...(appsList || [])]

        // handle search
        if (_search?.length) {
            _filteredAppsList = _filteredAppsList.filter((app) =>
                app.appName.toLowerCase().includes(_search.toLowerCase()),
            )
        }

        // handle sorting by ascending/descending order
        if (_sortOrder == OrderBy.ASC) {
            _filteredAppsList = _filteredAppsList.sort((a, b) => a.appName.localeCompare(b.appName))
        } else {
            _filteredAppsList = _filteredAppsList.sort((a, b) => b.appName.localeCompare(a.appName))
        }

        // handle deployment type
        // if (selectedDeploymentTypes.length === 1) {
        //     if (selectedDeploymentTypes.includes('Helm Release')) {
        //         _filteredAppsList = _filteredAppsList.filter((app) => !app.isKustomizeApp)
        //     }
        //     if (selectedDeploymentTypes.includes('Kustomization')) {
        //         _filteredAppsList = _filteredAppsList.filter((app) => app.isKustomizeApp)
        //     }
        // }

        setSortOrder(_sortOrder)
        setFilteredAppsList(_filteredAppsList)
    }

    function _isAnyFilterationAppliedExceptClusterAndNs() {
        return (
            payloadParsedFromUrl.teams?.length ||
            payloadParsedFromUrl.appNameSearch?.length ||
            payloadParsedFromUrl.environments?.length
        )
    }

    function _isAnyFilterationApplied() {
        return _isAnyFilterationAppliedExceptClusterAndNs() || payloadParsedFromUrl.namespaces?.length
    }

    function _isOnlyAllClusterFilterationApplied() {
        const _isAllClusterSelected = !masterFilters.clusters.some((_cluster) => !_cluster.isChecked)
        const _isAnyNamespaceSelected = masterFilters.namespaces.some((_namespace) => _namespace.isChecked)
        return !_isAnyFilterationAppliedExceptClusterAndNs() && _isAllClusterSelected && !_isAnyNamespaceSelected
    }

    function handleImageError(e) {
        const target = e.target as HTMLImageElement
        target.onerror = null
        target.src = defaultChartImage
    }

    function _buildAppDetailUrl(app: ArgoAppListResult | FluxCDApp) {
        return `${URLS.APP}/${isArgoCDAppList ? URLS.EXTERNAL_ARGO_APP : URLS.EXTERNAL_FLUX_APP}/${app.clusterId}/${app.appName}/${app.namespace}`
    }

    function sortByAppName(e) {
        e.preventDefault()
        sortApplicationList('appNameSort')
    }

    function renderHeaders() {
        return (
            <div
                className={`app-list__header app-list__header${isFluxCDAppList ? '--fluxcd' : ''} dc__position-sticky dc__top-47`}
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
                        {isFluxCDAppList ? APP_LIST_HEADERS.FluxCDStatus : APP_LIST_HEADERS.AppStatus}
                    </span>
                </div>
                {isFluxCDAppList && (
                    <div className="app-list__cell">
                        <span>DEPLOYMENT TYPE</span>
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

    const renderIcon = () => {
        if (isArgoCDAppList) return ArgoCDAppIcon
        return FluxCDAppIcon
    }

    const renderAppRow = (app: FluxCDApp | ArgoAppListResult): JSX.Element => {
        return (
            <Link
                to={_buildAppDetailUrl(app)}
                className={`app-list__row ${isFluxCDAppList ? 'app-list__row--fluxcd' : ''}`}
                data-testid="app-list-row"
            >
                <div className="app-list__cell--icon">
                    <LazyImage
                        className="dc__chart-grid-item__icon icon-dim-24"
                        src={renderIcon()}
                        onError={handleImageError}
                    />
                </div>
                <div className="app-list__cell app-list__cell--name flex column left">
                    <div className="dc__truncate-text  m-0 value">{app.appName}</div>
                </div>
                <div className="app-list__cell app-list__cell--namespace">
                    <AppStatus
                        appStatus={isArgoCDAppList ? app.appStatus : app.appStatus === 'True' ? 'Ready' : 'Not Ready'}
                    />
                </div>
                {isFluxCDAppList && (
                    <div>
                        {/* {app.isKustomizeApp
                            ? FLUX_CD_DEPLOYMENT_TYPE.KUSTOMIZATION
                            : FLUX_CD_DEPLOYMENT_TYPE.HELM_RELEASE} */}
                        {FLUX_CD_DEPLOYMENT_TYPE.KUSTOMIZATION}
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
                {renderHeaders()}
                {filteredAppsList
                    .slice(payloadParsedFromUrl.hOffset, payloadParsedFromUrl.hOffset + payloadParsedFromUrl.size)
                    .map((app, index) => (
                        <div key={`${app.appName}-${index}`}>{renderAppRow(app)} </div>
                    ))}
            </div>
        )
    }

    function renderEmptyState() {
        return (
            <div className="dc__position-rel" style={{ height: 'calc(100vh - 150px)' }}>
                <GenericEmptyState
                    image={noChartInClusterImage}
                    title={
                        isArgoCDAppList
                            ? APPLIST_EMPTY_STATE_MESSAGING.noArgoCDApps
                            : APPLIST_EMPTY_STATE_MESSAGING.noFluxCDApps
                    }
                    subTitle={APPLIST_EMPTY_STATE_MESSAGING.noAppsFoundInfoText}
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
            return renderEmptyState()
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
