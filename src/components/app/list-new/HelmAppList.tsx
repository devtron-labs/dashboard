import React, { useEffect, useState } from 'react';
import { ServerErrors } from '../../../modals/commonTypes';
import { OrderBy, SortBy } from '../list/types';
import { buildClusterVsNamespace, getDevtronInstalledHelmApps, AppListResponse, HelmApp } from './AppListService';
import { showError, Progressing, ErrorScreenManager, LazyImage, handleUTCTime, useEventSource } from '../../common';
import { Host } from '../../../config';
import { AppListViewType } from '../config';
import { Link, withRouter } from 'react-router-dom';
import { ReactComponent as HelpOutlineIcon } from '../../../assets/icons/ic-help-outline.svg';
import defaultChartImage from '../../../assets/icons/ic-plc-chart.svg';
import { Empty } from '../list/emptyView/Empty';
import { AllCheckModal } from '../../checkList/AllCheckModal';
import Tippy from '@tippyjs/react';
import '../list/list.css';

export default function HelmAppList({ serverMode, payloadParsedFromUrl, sortApplicationList, clearAllFilters }) {
    const [dataStateType, setDataStateType] = useState(AppListViewType.LOADING);
    const [errorResponseCode, setErrorResponseCode] = useState(0);
    const [devtronInstalledHelmAppsList, setDevtronInstalledHelmAppsList] = useState<HelmApp[]>([]);
    const [externalHelmAppsList, setExternalHelmAppsList] = useState<HelmApp[]>([]);
    const [filteredHelmAppsList, setFilteredHelmAppsList] = useState<HelmApp[]>([]);
    const [dataFetchInProgress, setDataFetchInProgress] = useState(true);
    const [sortBy, setSortBy] = useState(SortBy.APP_NAME);
    const [sortOrder, setSortOrder] = useState(OrderBy.ASC);
    const [clusterIdsCsv, setClusterIdsCsv] = useState('');
    const [sseConnection, setSseConnection] = useState<EventSource>(undefined);
    const [externalAppRecievedClusterIds, setExternalAppRecievedClusterIds] = useState([]);

    // component load
    useEffect(() => {
        init();
    }, []);

    // it means filter/sorting has been applied
    useEffect(() => {
        if (dataStateType == AppListViewType.LIST) {
            if (clusterIdsCsv == _getClusterIdsFromRequestUrl()) {
                handleFilteration();
            } else {
                init();
            }
        }
    }, [payloadParsedFromUrl]);

    // on data rendering first time
    useEffect(() => {
        if (dataStateType == AppListViewType.LIST) {
            handleFilteration();
        }
    }, [dataStateType]);

    // when external app data comes
    useEffect(() => {
        if (dataStateType == AppListViewType.LIST) {
            handleFilteration();
        }
    }, [externalHelmAppsList]);

    useEffect(() => {
        getDevtronInstalledHelmApps(clusterIdsCsv)
            .then((devtronInstalledHelmAppsListResponse: AppListResponse) => {
                setDevtronInstalledHelmAppsList(
                    devtronInstalledHelmAppsListResponse.result
                        ? devtronInstalledHelmAppsListResponse.result.helmApps
                        : [],
                );
                setDataStateType(AppListViewType.LIST);
                if (clusterIdsCsv) {
                    let _sseConnection = new EventSource(`${Host}/application?clusterIds=${clusterIdsCsv}`, {
                        withCredentials: true,
                    });
                    _sseConnection.onmessage = function (message) {
                        _onExternalAppDataFromSse(message, clusterIdsCsv, _sseConnection);
                    };
                    setSseConnection(_sseConnection);
                } else {
                    setDataFetchInProgress(false);
                }
            })
            .catch((errors: ServerErrors) => {
                showError(errors);
                setDataStateType(AppListViewType.ERROR);
                setErrorResponseCode(errors.code);
            });
    }, [clusterIdsCsv]);

    function init() {
        // reset data starts
        setDataStateType(AppListViewType.LOADING);
        setDevtronInstalledHelmAppsList([]);
        setFilteredHelmAppsList([]);
        setClusterIdsCsv(_getClusterIdsFromRequestUrl());
        setExternalAppRecievedClusterIds([]);
        setExternalHelmAppsList([]);
        if (sseConnection) {
            sseConnection.close();
        }
        setSseConnection(undefined);
        // reset data ends
    }

    function _getClusterIdsFromRequestUrl() {
        return [...buildClusterVsNamespace(payloadParsedFromUrl.namespaces.join(',')).keys()].join(',');
    }

    function _onExternalAppDataFromSse(message: MessageEvent, _clusterIdsCsv: string, _sseConnection: EventSource) {
        let externalAppData: AppListResponse = JSON.parse(message.data);
        if (externalAppData.result.errored || !externalAppData.result.clusterIds?.length) {
            return;
        }

        let _clusterId = externalAppData.result.clusterIds[0];

        let _externalAppRecievedClusterIds = [...externalAppRecievedClusterIds];
        _externalAppRecievedClusterIds.push(_clusterId.toString());
        setExternalAppRecievedClusterIds(_externalAppRecievedClusterIds);
        setExternalHelmAppsList([...externalHelmAppsList, ...externalAppData.result.helmApps]);

        let _requestedSortedClusterIdsJson = JSON.stringify(
            _clusterIdsCsv.split(',').sort((a, b) => a.localeCompare(b)),
        );
        let _recievedSortedClusterIdsJson = JSON.stringify(
            _externalAppRecievedClusterIds.sort((a, b) => a.localeCompare(b)),
        );
        if (_requestedSortedClusterIdsJson == _recievedSortedClusterIdsJson) {
            _sseConnection.close();
            setSseConnection(undefined);
            setDataFetchInProgress(false);
        }
    }

    function handleFilteration() {
        let _projects = payloadParsedFromUrl.teams || [];
        let _clusterVsNamespaces = payloadParsedFromUrl.namespaces || [];
        let _environments = payloadParsedFromUrl.environments || [];
        let _search = payloadParsedFromUrl.appNameSearch;
        let _sortBy = payloadParsedFromUrl.sortBy;
        let _sortOrder = payloadParsedFromUrl.sortOrder;

        let _filteredDevtronInstalledHelmAppsList = [...devtronInstalledHelmAppsList, ...externalHelmAppsList];

        // apply project filter
        if (_projects?.length) {
            _filteredDevtronInstalledHelmAppsList = _filteredDevtronInstalledHelmAppsList.filter((app) =>
                _projects.includes(app.projectId),
            );
        }

        // apply cluster_namespace filter with OR condition with environments
        if (_clusterVsNamespaces?.length || _environments?.length) {
            _filteredDevtronInstalledHelmAppsList = _filteredDevtronInstalledHelmAppsList.filter((app) => {
                let _includes = _environments.includes(app.environmentDetail.environmentId);
                _clusterVsNamespaces.map((_clusterVsNamespace) => {
                    let _clusterId = _clusterVsNamespace.split('_')[0];
                    let _namespace = _clusterVsNamespace.split('_')[1];
                    _includes =
                        _includes ||
                        (app.environmentDetail.clusterId == _clusterId &&
                            (!_namespace || app.environmentDetail.namespace == _namespace));
                });
                return _includes;
            });
        }

        // handle search
        if (_search?.length) {
            _filteredDevtronInstalledHelmAppsList = _filteredDevtronInstalledHelmAppsList.filter(
                (app) =>
                    app.appName.toLowerCase().includes(_search.toLowerCase()) ||
                    app.chartName.toLowerCase().includes(_search.toLowerCase()),
            );
        }

        // handle sort
        if (_sortOrder == OrderBy.ASC) {
            _filteredDevtronInstalledHelmAppsList = _filteredDevtronInstalledHelmAppsList.sort((a, b) =>
                a.appName.localeCompare(b.appName),
            );
        } else {
            _filteredDevtronInstalledHelmAppsList = _filteredDevtronInstalledHelmAppsList.sort((a, b) =>
                b.appName.localeCompare(a.appName),
            );
        }

        setSortBy(_sortBy);
        setSortOrder(_sortOrder);
        setFilteredHelmAppsList(_filteredDevtronInstalledHelmAppsList);
    }

    function _isAnyFilterationApplied() {
        return (
            payloadParsedFromUrl.environments?.length ||
            payloadParsedFromUrl.teams?.length ||
            payloadParsedFromUrl.namespaces?.length ||
            payloadParsedFromUrl.appNameSearch?.length
        );
    }

    function handleImageError(e) {
        const target = e.target as HTMLImageElement;
        target.onerror = null;
        target.src = defaultChartImage;
    }

    function renderHeaders() {
        let sortIcon = sortOrder == OrderBy.ASC ? 'sort-up' : 'sort-down';
        return (
            <div className="app-list__header">
                <div className="app-list__cell--icon"></div>
                <div className="app-list__cell app-list__cell--name">
                    {dataFetchInProgress && <span>App name</span>}
                    {!dataFetchInProgress && (
                        <button
                            className="app-list__cell-header"
                            onClick={(e) => {
                                e.preventDefault();
                                sortApplicationList('appNameSort');
                            }}
                        >
                            App name
                            {sortBy == SortBy.APP_NAME ? (
                                <span className={`${sortOrder == OrderBy.ASC ? 'sort-up' : 'sort-down'}`}></span>
                            ) : (
                                <span className="sort-col"></span>
                            )}
                        </button>
                    )}
                </div>
                <div className="app-list__cell app-list__cell--env">
                    <span className="app-list__cell-header">
                        Environment
                        <Tippy
                            arrow={true}
                            placement="top"
                            content="Environment is a unique combination of cluster and namespace"
                        >
                            <HelpOutlineIcon className="icon-dim-20" />
                        </Tippy>
                    </span>
                </div>
                <div className="app-list__cell app-list__cell--cluster">
                    <span className="app-list__cell-header">Cluster</span>
                </div>
                <div className="app-list__cell app-list__cell--namespace">
                    <span className="app-list__cell-header">Namespace</span>
                </div>
                <div className="app-list__cell app-list__cell--time">
                    <span className="app-list__cell-header">Last deployed at</span>
                </div>
            </div>
        );
    }

    function renderApplicationList() {
        return (
            <>
                {renderHeaders()}
                {filteredHelmAppsList.map((app) => {
                    return (
                        <React.Fragment key={app.appId}>
                            <Link
                                to={`/chart-store/deployments/${app.appId}/env/${app.environmentDetail.environmentId}`}
                                className="app-list__row"
                            >
                                <div className="app-list__cell--icon">
                                    <LazyImage
                                        className="chart-grid-item__icon"
                                        src={app.chartAvatar}
                                        onError={handleImageError}
                                    />
                                </div>
                                <div className="app-list__cell app-list__cell--name flex column left">
                                    <div className="truncate-text m-0 value">{app.appName}</div>
                                    <div className="truncate-text m-0">{app.chartName}</div>
                                </div>
                                <div className="app-list__cell app-list__cell--env">
                                    <p className="truncate-text m-0">
                                        {app.environmentDetail.environmentName
                                            ? app.environmentDetail.environmentName
                                            : '-'}
                                    </p>
                                </div>
                                <div className="app-list__cell app-list__cell--cluster-name">
                                    <p className="truncate-text m-0"> {app.environmentDetail.clusterName}</p>
                                </div>
                                <div className="app-list__cell app-list__cell--namespace">
                                    <p className="truncate-text m-0"> {app.environmentDetail.namespace}</p>
                                </div>
                                <div className="app-list__cell app-list__cell--time">
                                    {app.lastDeployedAt && (
                                        <Tippy
                                            arrow={true}
                                            placement="top"
                                            content={handleUTCTime(app.lastDeployedAt, false)}
                                        >
                                            <p className="truncate-text m-0">
                                                {handleUTCTime(app.lastDeployedAt, true)}
                                            </p>
                                        </Tippy>
                                    )}
                                </div>
                            </Link>
                        </React.Fragment>
                    );
                })}
            </>
        );
    }

    function renderApplicationListContainer() {
        return (
            <div className="app-list">
                {filteredHelmAppsList.length == 0 && _isAnyFilterationApplied() && (
                    <Empty
                        view={AppListViewType.NO_RESULT}
                        title={'No apps found'}
                        message={"We couldn't find any matching applications."}
                        buttonLabel={'Clear filters'}
                        clickHandler={clearAllFilters}
                    />
                )}
                {filteredHelmAppsList.length == 0 && !_isAnyFilterationApplied() && (
                    <div
                        style={{ width: '600px', margin: 'auto', marginTop: '20px' }}
                        className="bcn-0 pt-20 pb-20 pl-20 pr-20 br-8 en-1 bw-1 mt-20"
                    >
                        <AllCheckModal />
                    </div>
                )}
                {filteredHelmAppsList.length > 0 && renderApplicationList()}
            </div>
        );
    }

    return (
        <>
            {dataStateType == AppListViewType.LOADING && (
                <div className="loading-wrapper">
                    <Progressing pageLoader />
                </div>
            )}
            {dataStateType == AppListViewType.ERROR && (
                <div className="loading-wrapper">
                    <ErrorScreenManager code={errorResponseCode} />
                </div>
            )}
            {dataStateType == AppListViewType.LIST && renderApplicationListContainer()}
        </>
    );
}
