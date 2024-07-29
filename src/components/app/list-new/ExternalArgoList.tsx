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
    showError,
    Progressing,
    ErrorScreenManager,
    ServerErrors,
    GenericEmptyState,
    AppStatus,
    useMainContext,
    Pagination,
} from '@devtron-labs/devtron-fe-common-lib'
import { useLocation, useHistory } from 'react-router'
import { Link } from 'react-router-dom'
import Tippy from '@tippyjs/react'
import { OrderBy, SortBy } from '../list/types'
import { buildClusterVsNamespace, getArgoInstalledExternalApps } from './AppListService'
import { LazyImage } from '../../common'
import { URLS } from '../../../config'
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
import ArgoCDAppIcon from '../../../assets/icons/ic-argocd-app.svg'
import { ExternalArgoListType } from '../types'
import { ReactComponent as ICHelpOutline } from '../../../assets/icons/ic-help-outline.svg'
import { ArgoAppListResult } from './AppListType'

export default function ExternalArgoList({
    payloadParsedFromUrl,
    sortApplicationList,
    clearAllFilters,
    fetchingExternalApps,
    setFetchingExternalAppsState,
    updateDataSyncing,
    setShowPulsatingDotState,
    masterFilters,
    syncListData,
    isArgoInstalled,
}: ExternalArgoListType) {
    const [dataStateType, setDataStateType] = useState(AppListViewType.LOADING)
    const [errorResponseCode, setErrorResponseCode] = useState(0)
    const [argoAppsList, setArgoAppsList] = useState<ArgoAppListResult[]>([])
    const [filteredArgoAppsList, setFilteredArgoAppsList] = useState<ArgoAppListResult[]>([])
    const [sortBy, setSortBy] = useState(SortBy.APP_NAME)
    const [sortOrder, setSortOrder] = useState(OrderBy.ASC)
    const [clusterIdsCsv, setClusterIdsCsv] = useState('')
    const [appStatus, setAppStatus] = useState('')
    const location = useLocation()
    const history = useHistory()
    const params = new URLSearchParams(location.search)
    const { isSuperAdmin } = useMainContext()

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
    }, [argoAppsList])

    useEffect(() => {
        // fetch external apps list
        updateDataSyncing(true)
        setDataStateType(AppListViewType.LOADING)
        getArgoInstalledExternalApps(clusterIdsCsv, appStatus)
            .then((argoAppsListResponse) => {
                setArgoAppsList(argoAppsListResponse.result)
            })
            .catch((errors: ServerErrors) => {
                showError(errors)
                setDataStateType(AppListViewType.ERROR)
                setErrorResponseCode(errors.code)
            })
            .finally(() => {
                updateDataSyncing(false)
                setFetchingExternalAppsState(false)
                setDataStateType(AppListViewType.LIST)
            })
    }, [clusterIdsCsv])

    // reset data
    function init() {
        setDataStateType(AppListViewType.LOADING)
        setArgoAppsList([])
        setFilteredArgoAppsList([])
        setClusterIdsCsv(_getClusterIdsFromRequestUrl() ?? '')
        setAppStatus(_getAppStatusFromRequestUrl() ?? '')
        setFetchingExternalAppsState(false)
    }

    function _getClusterIdsFromRequestUrl() {
        return [...buildClusterVsNamespace(payloadParsedFromUrl.namespaces?.join(',')).keys()].join(',')
    }

    function _getAppStatusFromRequestUrl() {
        return payloadParsedFromUrl.appStatuses?.join(',')
    }

    function handleFilteration() {
        const _search = payloadParsedFromUrl.appNameSearch
        const _sortBy = payloadParsedFromUrl.sortBy
        const _sortOrder = payloadParsedFromUrl.sortOrder
        let _filteredArgoAppsList = [...(argoAppsList || [])]

        // handle search
        if (_search?.length) {
            _filteredArgoAppsList = _filteredArgoAppsList.filter((app) =>
                app.appName.toLowerCase().includes(_search.toLowerCase()),
            )
        }

        // handle sorting by ascending/descending order
        if (_sortOrder == OrderBy.ASC) {
            _filteredArgoAppsList = _filteredArgoAppsList.sort((a, b) => a.appName.localeCompare(b.appName))
        } else {
            _filteredArgoAppsList = _filteredArgoAppsList.sort((a, b) => b.appName.localeCompare(a.appName))
        }

        setSortBy(_sortBy)
        setSortOrder(_sortOrder)
        setFilteredArgoAppsList(_filteredArgoAppsList)
        setShowPulsatingDotState(_filteredArgoAppsList.length == 0 && !clusterIdsCsv)
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

    function _buildAppDetailUrl(app: ArgoAppListResult) {
        return `${URLS.APP}/${URLS.EXTERNAL_ARGO_APP}/${app.clusterId}/${app.appName}/${app.namespace}`
    }

    function sortByAppName(e) {
        e.preventDefault()
        sortApplicationList('appNameSort')
    }

    function renderHeaders() {
        return (
            <div className="app-list__header dc__position-sticky dc__top-47">
                <div className="app-list__cell--icon" />
                <div className="app-list__cell app-list__cell--name">
                    <button className="app-list__cell-header flex" onClick={sortByAppName}>
                        {APP_LIST_HEADERS.AppName}
                        {sortBy == SortBy.APP_NAME ? (
                            <span className={`sort ${sortOrder == OrderBy.ASC ? '' : 'sort-up'} ml-4`} />
                        ) : (
                            <span className="sort-col dc__opacity-0_5 ml-4" />
                        )}
                    </button>
                </div>
                {isArgoInstalled && (
                    <div className="app-list__cell app-list__cell--app_status">
                        <span className="app-list__cell-header">{APP_LIST_HEADERS.AppStatus}</span>
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

    const renderArgoListRow = (app: ArgoAppListResult): JSX.Element => {
        return (
            <Link to={_buildAppDetailUrl(app)} className="app-list__row" data-testid="app-list-row">
                <div className="app-list__cell--icon">
                    <LazyImage
                        className="dc__chart-grid-item__icon icon-dim-24"
                        src={ArgoCDAppIcon}
                        onError={handleImageError}
                    />
                </div>
                <div className="app-list__cell app-list__cell--name flex column left">
                    <div className="dc__truncate-text  m-0 value">{app.appName}</div>
                </div>
                {isArgoInstalled && (
                    <div className="app-list__cell app-list__cell--namespace">
                        <AppStatus appStatus={app.appStatus} />
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
                {filteredArgoAppsList
                    .slice(payloadParsedFromUrl.hOffset, payloadParsedFromUrl.hOffset + payloadParsedFromUrl.size)
                    .map((app, index) => (
                        <div key={`${app.appName}-${index}`}>{renderArgoListRow(app)} </div>
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
                    subTitle={APPLIST_EMPTY_STATE_MESSAGING.infoText}
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
        if (filteredArgoAppsList.length === 0) {
            return renderNoApplicationState()
        }
        return renderApplicationList()
    }

    function changePageSize(size: number): void {
        params.set('pageSize', size.toString())
        params.set('offset', '0')
        params.set('hOffset', '0')
        history.push(`${URLS.APP}/${URLS.APP_LIST}/${URLS.APP_LIST_ARGO}?${params.toString()}`)
    }

    function changePage(pageNo: number): void {
        const newOffset = payloadParsedFromUrl.size * (pageNo - 1)

        params.set('hOffset', newOffset.toString())

        history.push(`${URLS.APP}/${URLS.APP_LIST}/${URLS.APP_LIST_ARGO}?${params.toString()}`)
    }

    function renderPagination(): JSX.Element {
        return (
            filteredArgoAppsList.length > 20 &&
            !fetchingExternalApps && (
                <Pagination
                    rootClassName="pagination-wrapper"
                    size={filteredArgoAppsList.length}
                    pageSize={payloadParsedFromUrl.size}
                    offset={payloadParsedFromUrl.hOffset}
                    changePage={changePage}
                    changePageSize={changePageSize}
                />
            )
        )
    }

    // RBAC for SuperAdmin
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
