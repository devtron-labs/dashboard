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

import { useEffect, useMemo, useState } from 'react'
import {
    AppStatus,
    showError,
    ErrorScreenManager,
    ServerErrors,
    Host,
    GenericEmptyState,
    DEFAULT_BASE_PAGE_SIZE,
    Pagination,
    handleUTCTime,
    DATE_TIME_FORMATS,
    SortableTableHeaderCell,
    stringComparatorBySortOrder,
} from '@devtron-labs/devtron-fe-common-lib'
import { Link } from 'react-router-dom'
import Tippy from '@tippyjs/react'
import moment from 'moment'
import { getDevtronInstalledHelmApps } from './AppListService'
import { LazyImage } from '../../common'
import { SERVER_MODE, URLS, DOCUMENTATION, checkIfDevtronOperatorHelmRelease, ModuleNameMap } from '../../../config'
import { AppListViewType } from '../config'
import { ReactComponent as ICHelpOutline } from '../../../assets/icons/ic-help-outline.svg'
import NoClusterSelectImage from '../../../assets/icons/ic-select-cluster.svg'
import defaultChartImage from '../../../assets/icons/ic-default-chart.svg'
import HelmCluster from '../../../assets/img/guided-helm-cluster.png'
import DeployCICD from '../../../assets/img/guide-onboard.png'
import { AllCheckModal } from '../../checkList/AllCheckModal'
import { ReactComponent as InfoFillPurple } from '../../../assets/icons/ic-info-filled-purple.svg'
import { ReactComponent as ErrorExclamationIcon } from '../../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as CloseIcon } from '../../../assets/icons/ic-close.svg'
import { ReactComponent as AlertTriangleIcon } from '../../../assets/icons/ic-alert-triangle.svg'
import { ReactComponent as ArrowRight } from '../../../assets/icons/ic-arrow-right.svg'
import noChartInClusterImage from '../../../assets/img/ic-no-chart-in-clusters@2x.png'
import ContentCard from '../../common/ContentCard/ContentCard'
import { CardContentDirection, CardLinkIconPlacement } from '../../common/ContentCard/ContentCard.types'
import '../list/list.scss'
import {
    APP_LIST_EMPTY_STATE_MESSAGING,
    ENVIRONMENT_HEADER_TIPPY_CONTENT,
    EXTERNAL_HELM_APP_FETCH_CLUSTER_ERROR,
    EXTERNAL_HELM_APP_FETCH_ERROR,
    EXTERNAL_HELM_SSE_CONNECTION_ERROR,
    APP_LIST_HEADERS,
    HELM_PERMISSION_MESSAGE,
    SELECT_CLUSTER_FROM_FILTER_NOTE,
    appListLoadingArray,
} from './Constants'
import { LEARN_MORE } from '../../../config/constantMessaging'
import { HELM_GUIDED_CONTENT_CARDS_TEXTS } from '../../onboardingGuide/OnboardingGuide.constants'
import { HelmAppListResponse, HelmApp, AppListSortableKeys, HelmAppListProps } from './AppListType'
import AskToClearFilters from './AppListComponents'

const HelmAppList = ({
    serverMode,
    filterConfig,
    clusterList,
    clearAllFilters,
    fetchingExternalApps,
    setFetchingExternalAppsState,
    updateDataSyncing,
    syncListData,
    isArgoInstalled,
    clusterIdsCsv,
    handleSorting,
    changePage,
    changePageSize,
    setShowPulsatingDot,
}: HelmAppListProps) => {
    const [dataStateType, setDataStateType] = useState(AppListViewType.LOADING)
    const [errorResponseCode, setErrorResponseCode] = useState(0)
    const [devtronInstalledHelmAppsList, setDevtronInstalledHelmAppsList] = useState<HelmApp[]>([])
    const [externalHelmAppsList, setExternalHelmAppsList] = useState<HelmApp[]>([])
    const [sseConnection, setSseConnection] = useState<EventSource>(undefined)
    const [externalHelmListFetchErrors, setExternalHelmListFetchErrors] = useState<string[]>([])
    const [showGuidedContentCards, setShowGuidedContentCards] = useState(false)

    const { appStatus, environment, cluster, namespace, project, searchKey, sortBy, sortOrder, offset, pageSize } =
        filterConfig

    const handleAppListSorting = (a: HelmApp, b: HelmApp) =>
        sortBy === AppListSortableKeys.APP_NAME
            ? stringComparatorBySortOrder(a.appName, b.appName, sortOrder)
            : stringComparatorBySortOrder(a.lastDeployedAt, b.lastDeployedAt, sortOrder)

    const { filteredHelmAppList, filteredListTotalSize } = useMemo(() => {
        let filteredHelmAppList: HelmApp[] = [...devtronInstalledHelmAppsList, ...externalHelmAppsList]
        if (searchKey) {
            const searchLowerCase = searchKey.toLowerCase()
            filteredHelmAppList = filteredHelmAppList.filter(
                (app) => app.appName.includes(searchLowerCase) || app.chartName.includes(searchLowerCase),
            )
        }
        if (project.length) {
            const projectMap = new Map<string, true>(project.map((projectId) => [projectId, true]))
            filteredHelmAppList = filteredHelmAppList.filter((app) => projectMap.get(String(app.projectId)) ?? false)
        }
        if (environment.length) {
            const environmentMap = new Map<string, true>(environment.map((envId) => [envId, true]))
            filteredHelmAppList = filteredHelmAppList.filter(
                (app) => environmentMap.get(String(app.environmentDetail.environmentId)) ?? false,
            )
        }
        if (namespace.length) {
            const namespaceMap = new Map<string, true>(namespace.map((namespaceItem) => [namespaceItem, true]))
            filteredHelmAppList = filteredHelmAppList.filter(
                (app) =>
                    namespaceMap.get(`${app.environmentDetail.clusterId}_${app.environmentDetail.namespace}`) ?? false,
            )
        }
        filteredHelmAppList = filteredHelmAppList.sort((a, b) => handleAppListSorting(a, b))

        const filteredListTotalSize = filteredHelmAppList.length

        filteredHelmAppList = filteredHelmAppList.slice(offset, offset + pageSize)

        return { filteredHelmAppList, filteredListTotalSize }
    }, [devtronInstalledHelmAppsList, externalHelmAppsList, filterConfig])

    // component load
    useEffect(() => {
        init()
        return () => {
            setShowPulsatingDot(false)
        }
    }, [])

    useEffect(() => {
        updateDataSyncing(true)
        setDataStateType(AppListViewType.LOADING)
        setDevtronInstalledHelmAppsList([])
        setExternalHelmAppsList([])
        if (serverMode === SERVER_MODE.EA_ONLY) {
            setDataStateType(AppListViewType.LIST)
            if (clusterIdsCsv) {
                _getExternalHelmApps()
            }
            updateDataSyncing(false)
        } else {
            getDevtronInstalledHelmApps(clusterIdsCsv, appStatus.join())
                .then((devtronInstalledHelmAppsListResponse: HelmAppListResponse) => {
                    setDevtronInstalledHelmAppsList(devtronInstalledHelmAppsListResponse.result.helmApps ?? [])
                    setShowPulsatingDot(!devtronInstalledHelmAppsListResponse.result.helmApps?.length && !clusterIdsCsv)
                    setDataStateType(AppListViewType.LIST)
                    if (clusterIdsCsv && !appStatus.length) {
                        _getExternalHelmApps()
                    }
                })
                .catch((errors: ServerErrors) => {
                    showError(errors)
                    setDataStateType(AppListViewType.ERROR)
                    setErrorResponseCode(errors.code)
                })
                .finally(() => {
                    updateDataSyncing(false)
                })
        }
    }, [clusterIdsCsv, syncListData, `${appStatus}`])

    // reset data
    function init() {
        setDataStateType(AppListViewType.LOADING)
        setDevtronInstalledHelmAppsList([])
        setExternalHelmAppsList([])
        if (sseConnection) {
            sseConnection.close()
        }
        setSseConnection(undefined)
        setFetchingExternalAppsState(false)
        setExternalHelmListFetchErrors([])
    }

    function _closeSseConnection(_sseConnection: EventSource) {
        _sseConnection.close()
        setSseConnection(undefined)
        setFetchingExternalAppsState(false)
    }

    function _onExternalAppDataFromSse(
        message: MessageEvent,
        _externalAppRecievedClusterIds: string[],
        _externalAppRecievedHelmApps: HelmApp[],
        _externalAppFetchErrors: string[],
        _sseConnection: EventSource,
    ) {
        try {
            const externalAppData: HelmAppListResponse = JSON.parse(message.data)
            if (!externalAppData.result.clusterIds?.length) {
                return
            }

            const _clusterId = externalAppData.result.clusterIds[0].toString()
            if (_externalAppRecievedClusterIds.includes(_clusterId)) {
                return
            }

            if (externalAppData.result.errored) {
                const _cluster = cluster.find((clusterId) => clusterId === _clusterId)
                let _errorMsg = ''
                if (_cluster) {
                    _errorMsg = `${EXTERNAL_HELM_APP_FETCH_CLUSTER_ERROR} "${_cluster}". ERROR: `
                }
                _errorMsg += externalAppData.result.errorMsg || EXTERNAL_HELM_APP_FETCH_ERROR
                _externalAppFetchErrors.push(_errorMsg)
                setExternalHelmListFetchErrors([..._externalAppFetchErrors])
            }

            _externalAppRecievedClusterIds.push(_clusterId)
            const _newExternalAppList = externalAppData.result.helmApps || []
            _newExternalAppList.forEach((app) => {
                app.isExternal = true
            })

            _externalAppRecievedHelmApps.push(..._newExternalAppList)
            setExternalHelmAppsList([..._externalAppRecievedHelmApps])
        } catch (err) {
            showError(err)
        }

        // Show guided content card for connecting cluster or installing CI/CD integration
        // when there's only one cluster & no app other than devtron-operator is installed
        if (serverMode === SERVER_MODE.EA_ONLY) {
            setShowGuidedContentCards(
                cluster.length === 1 &&
                    _externalAppRecievedHelmApps.length === 1 &&
                    checkIfDevtronOperatorHelmRelease(
                        _externalAppRecievedHelmApps[0].appName,
                        _externalAppRecievedHelmApps[0].environmentDetail?.namespace,
                        `${_externalAppRecievedHelmApps[0].environmentDetail?.clusterId}`,
                    ),
            )
        }

        const _requestedSortedClusterIdsJson = JSON.stringify(
            clusterIdsCsv.split(',').sort((a, b) => a.localeCompare(b)),
        )
        const _receivedSortedClusterIdsJson = JSON.stringify(
            _externalAppRecievedClusterIds.sort((a, b) => a.localeCompare(b)),
        )

        if (_requestedSortedClusterIdsJson === _receivedSortedClusterIdsJson) {
            _closeSseConnection(_sseConnection)
        }
    }

    function _getExternalHelmApps() {
        setFetchingExternalAppsState(true)
        const _sseConnection = new EventSource(`${Host}/application?clusterIds=${clusterIdsCsv}`, {
            withCredentials: true,
        })
        const _externalAppReceivedClusterIds = []
        const _externalAppReceivedHelmApps = []
        const _externalAppFetchErrors: string[] = []
        _sseConnection.onmessage = function (message) {
            _onExternalAppDataFromSse(
                message,
                _externalAppReceivedClusterIds,
                _externalAppReceivedHelmApps,
                _externalAppFetchErrors,
                _sseConnection,
            )
        }
        _sseConnection.onerror = function (err) {
            _externalAppFetchErrors.push(EXTERNAL_HELM_SSE_CONNECTION_ERROR)
            setExternalHelmListFetchErrors([..._externalAppFetchErrors])
            _closeSseConnection(_sseConnection)
        }
        setSseConnection(_sseConnection)
    }

    function _isAnyFilterationAppliedExceptClusterAndNs() {
        return project.length || searchKey.length || environment.length || appStatus.length
    }

    function _isAnyFilterationApplied() {
        return _isAnyFilterationAppliedExceptClusterAndNs() || cluster.length || namespace.length
    }

    function _isOnlyAllClusterFilterationApplied() {
        const _isAllClusterSelected = cluster.length === clusterList?.length
        const _isAnyNamespaceSelected = !!namespace.length
        return !_isAnyFilterationAppliedExceptClusterAndNs() && _isAllClusterSelected && !_isAnyNamespaceSelected
    }

    function handleImageError(e) {
        const target = e.target as HTMLImageElement
        target.onerror = null
        target.src = defaultChartImage
    }

    function _buildAppDetailUrl(app: HelmApp) {
        if (app.isExternal) {
            return `${URLS.APP}/${URLS.EXTERNAL_APPS}/${app.appId}/${app.appName}`
        }
        return `${URLS.APP}/${URLS.DEVTRON_CHARTS}/deployments/${app.appId}/env/${app.environmentDetail.environmentId}`
    }

    function _removeExternalAppFetchError(e) {
        const index = Number(e.currentTarget.dataset.id)
        const _externalHelmListFetchErrors = [...externalHelmListFetchErrors]
        _externalHelmListFetchErrors.splice(index, 1)
        setExternalHelmListFetchErrors(_externalHelmListFetchErrors)
    }

    const handleAppNameSorting = () => handleSorting(AppListSortableKeys.APP_NAME)

    const handleLastDeployedSorting = () => handleSorting(AppListSortableKeys.LAST_DEPLOYED)

    function renderHeaders() {
        return (
            <div className="app-list__header dc__position-sticky dc__top-47">
                <div className="app-list__cell--icon" />
                <div className="app-list__cell app-list__cell--name">
                    {sseConnection && <span>{APP_LIST_HEADERS.ReleaseName}</span>}
                    {!sseConnection && (
                        <SortableTableHeaderCell
                            title={APP_LIST_HEADERS.ReleaseName}
                            isSortable
                            isSorted={sortBy === AppListSortableKeys.APP_NAME}
                            sortOrder={sortOrder}
                            triggerSorting={handleAppNameSorting}
                            disabled={dataStateType === AppListViewType.LOADING}
                        />
                    )}
                </div>
                {isArgoInstalled && (
                    <div className="app-list__cell app-list__cell--app_status">
                        <span className="app-list__cell-header">{APP_LIST_HEADERS.AppStatus}</span>
                    </div>
                )}
                <div className="app-list__cell app-list__cell--env">
                    <span className="app-list__cell-header mr-4">{APP_LIST_HEADERS.Environment}</span>
                    <Tippy
                        className="default-tt"
                        arrow={false}
                        placement="top"
                        content={ENVIRONMENT_HEADER_TIPPY_CONTENT}
                    >
                        <div className="flex">
                            <ICHelpOutline className="icon-dim-16" />
                        </div>
                    </Tippy>
                </div>
                <div className="app-list__cell app-list__cell--cluster">
                    <span className="app-list__cell-header">{APP_LIST_HEADERS.Cluster}</span>
                </div>
                <div className="app-list__cell app-list__cell--namespace">
                    <span className="app-list__cell-header">{APP_LIST_HEADERS.Namespace}</span>
                </div>
                <div className="app-list__cell app-list__cell--time">
                    <SortableTableHeaderCell
                        title={APP_LIST_HEADERS.LastDeployedAt}
                        isSortable
                        isSorted={sortBy === AppListSortableKeys.LAST_DEPLOYED}
                        sortOrder={sortOrder}
                        triggerSorting={handleLastDeployedSorting}
                        disabled={dataStateType === AppListViewType.LOADING}
                    />
                </div>
            </div>
        )
    }

    const renderFetchError = (externalHelmListFetchError: string, index: number) => (
        <div className="bg__primary" key={index}>
            <div className="h-8" />
            <div className="ea-fetch-error-message above-header-message flex left">
                <span className="mr-8 flex">
                    <ErrorExclamationIcon className="icon-dim-20" />
                </span>
                <span>{externalHelmListFetchError}</span>
                <CloseIcon
                    data-id={index}
                    className="icon-dim-24 dc__align-right cursor"
                    onClick={_removeExternalAppFetchError}
                />
            </div>
        </div>
    )

    const renderHelmAppLink = (app: HelmApp): JSX.Element => (
        <Link key={app.appId} to={_buildAppDetailUrl(app)} className="app-list__row" data-testid="app-list-row">
            <div className="app-list__cell--icon">
                <LazyImage
                    className="dc__chart-grid-item__icon icon-dim-24"
                    src={app.chartAvatar}
                    onError={handleImageError}
                />
            </div>
            <div className="app-list__cell app-list__cell--name flex column left">
                <div className="dc__truncate-text  m-0 value">{app.appName}</div>
                <div className="dc__truncate-text fs-12 m-0">{app.chartName}</div>
            </div>
            {isArgoInstalled && (
                <div className="app-list__cell app-list__cell--namespace">
                    <AppStatus status={app.appStatus} isVirtualEnv={app.environmentDetail.isVirtualEnvironment} />
                </div>
            )}
            <div className="app-list__cell app-list__cell--env">
                <p
                    className="dc__truncate-text  m-0"
                    data-testid={`${app.environmentDetail.environmentName}-environment`}
                >
                    {app.environmentDetail.environmentName
                        ? app.environmentDetail.environmentName
                        : `${app.environmentDetail.clusterName}__${app.environmentDetail.namespace}`}
                </p>
            </div>
            <div className="app-list__cell app-list__cell--cluster">
                <p className="dc__truncate-text  m-0" data-testid={`${app.environmentDetail.clusterName}`}>
                    {app.environmentDetail.clusterName}
                </p>
            </div>
            <div className="app-list__cell app-list__cell--namespace">
                <p className="dc__truncate-text  m-0" data-testid={`${app.environmentDetail.namespace}`}>
                    {app.environmentDetail.namespace}
                </p>
            </div>
            <div className="app-list__cell app-list__cell--time">
                {app.lastDeployedAt && (
                    <Tippy
                        className="default-tt"
                        arrow
                        placement="top"
                        content={moment(app.lastDeployedAt).format(DATE_TIME_FORMATS.TWELVE_HOURS_FORMAT)}
                    >
                        <p className="dc__truncate-text  m-0">{handleUTCTime(app.lastDeployedAt, true)}</p>
                    </Tippy>
                )}
            </div>
        </Link>
    )

    function renderApplicationList() {
        return (
            <div data-testid="helm-app-list-container">
                {!clusterIdsCsv && (
                    <div className="bg__primary" data-testid="helm-app-list">
                        <div className="h-8" />
                        <div className="cluster-select-message-strip above-header-message flex left">
                            <span className="mr-8 flex">
                                <InfoFillPurple className="icon-dim-20" />
                            </span>
                            <span>
                                {SELECT_CLUSTER_FROM_FILTER_NOTE}&nbsp;
                                <a
                                    className="dc__link cursor"
                                    target="_blank"
                                    href={DOCUMENTATION.HYPERION}
                                    rel="noreferrer"
                                >
                                    {LEARN_MORE}
                                </a>
                            </span>
                        </div>
                    </div>
                )}
                {externalHelmListFetchErrors.map((externalHelmListFetchError, index) =>
                    renderFetchError(externalHelmListFetchError, index),
                )}
                {filteredListTotalSize > 0 && renderHeaders()}
                {filteredHelmAppList.map((app) => renderHelmAppLink(app))}
                {showGuidedContentCards && (
                    <div className="helm-app-guided-cards-wrapper">
                        <ContentCard
                            redirectTo={URLS.GLOBAL_CONFIG_CLUSTER}
                            direction={CardContentDirection.Horizontal}
                            imgSrc={HelmCluster}
                            title={HELM_GUIDED_CONTENT_CARDS_TEXTS.GlobalConfigCluster.title}
                            linkText={HELM_GUIDED_CONTENT_CARDS_TEXTS.GlobalConfigCluster.linkText}
                            LinkIcon={ArrowRight}
                            linkIconClass="scb-5"
                            linkIconPlacement={CardLinkIconPlacement.AfterLinkApart}
                        />
                        <ContentCard
                            redirectTo={`${URLS.STACK_MANAGER_DISCOVER_MODULES_DETAILS}?id=${ModuleNameMap.CICD}`}
                            direction={CardContentDirection.Horizontal}
                            imgSrc={DeployCICD}
                            title={HELM_GUIDED_CONTENT_CARDS_TEXTS.StackManager.title}
                            linkText={HELM_GUIDED_CONTENT_CARDS_TEXTS.StackManager.installLinkText}
                            LinkIcon={ArrowRight}
                            linkIconClass="scb-5"
                            linkIconPlacement={CardLinkIconPlacement.AfterLinkApart}
                        />
                    </div>
                )}
            </div>
        )
    }

    function renderAllCheckModal() {
        return (
            <div
                style={{ width: '600px', margin: 'auto', marginTop: '20px' }}
                className="bg__primary pt-20 pb-20 pl-20 pr-20 br-8 en-1 bw-1 mt-20"
            >
                <AllCheckModal />
            </div>
        )
    }

    function askToSelectClusterId() {
        return (
            <div className="dc__position-rel flex-grow-1">
                <GenericEmptyState
                    image={NoClusterSelectImage}
                    title={APP_LIST_EMPTY_STATE_MESSAGING.heading}
                    subTitle={APP_LIST_EMPTY_STATE_MESSAGING.infoText}
                />
            </div>
        )
    }

    function askToClearFiltersWithSelectClusterTip() {
        return (
            <div className="flex column">
                <AskToClearFilters clearAllFilters={clearAllFilters} showTipToSelectCluster />
            </div>
        )
    }

    function askToConnectAClusterForNoResult() {
        const handleButton = () => (
            <Link to={URLS.GLOBAL_CONFIG_CLUSTER}>
                <button type="button" className="cta flex">
                    {APP_LIST_EMPTY_STATE_MESSAGING.connectClusterLabel}
                </button>
            </Link>
        )
        return (
            <div className="dc__position-rel flex-grow-1">
                <GenericEmptyState
                    image={noChartInClusterImage}
                    title={APP_LIST_EMPTY_STATE_MESSAGING.noHelmChartsFound}
                    subTitle={APP_LIST_EMPTY_STATE_MESSAGING.connectClusterInfoText}
                    isButtonAvailable
                    renderButton={handleButton}
                />
            </div>
        )
    }

    function renderHelmPermissionMessageStrip() {
        return (
            <>
                <div className="h-8" />
                <div className="helm-permission-message-strip above-header-message flex left">
                    <span className="mr-8 flex">
                        <AlertTriangleIcon className="icon-dim-20 icon" />
                    </span>
                    <span>{HELM_PERMISSION_MESSAGE}</span>
                </div>
            </>
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
            return <AskToClearFilters clearAllFilters={clearAllFilters} />
        }
        if (!clusterIdsCsv) {
            return askToSelectClusterId()
        }
        return renderAllCheckModal()
    }

    function renderFullModeApplicationListContainer() {
        if (!sseConnection && filteredListTotalSize === 0) {
            return (
                <>
                    {serverMode === SERVER_MODE.FULL && renderHelmPermissionMessageStrip()}
                    {renderNoApplicationState()}
                </>
            )
        }
        return renderApplicationList()
    }

    function renderPagination(): JSX.Element {
        return (
            filteredListTotalSize > DEFAULT_BASE_PAGE_SIZE &&
            !fetchingExternalApps && (
                <Pagination
                    rootClassName="flex dc__content-space px-20"
                    size={filteredListTotalSize}
                    pageSize={pageSize}
                    offset={offset}
                    changePage={changePage}
                    changePageSize={changePageSize}
                />
            )
        )
    }
    if (dataStateType === AppListViewType.ERROR) {
        return (
            <div className="flex-grow-1">
                <ErrorScreenManager code={errorResponseCode} />
            </div>
        )
    }
    return (
        <>
            {dataStateType === AppListViewType.LOADING && (
                <>
                    {renderHeaders()}
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
            {dataStateType === AppListViewType.LIST && (
                <div>
                    {renderFullModeApplicationListContainer()}
                    {renderPagination()}
                </div>
            )}
        </>
    )
}

export default HelmAppList
