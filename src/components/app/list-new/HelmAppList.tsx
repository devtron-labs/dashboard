import React, { useEffect, useState } from 'react';
import { ServerErrors } from '../../../modals/commonTypes';
import { OrderBy, SortBy } from '../list/types';
import { buildClusterVsNamespace, getDevtronInstalledHelmApps, AppListResponse, HelmApp } from './AppListService';
import { showError, Progressing, ErrorScreenManager, LazyImage, handleUTCTime, useEventSource } from '../../common';
import { Host, SERVER_MODE } from '../../../config';
import { AppListViewType } from '../config';
import { Link, withRouter } from 'react-router-dom';
import { ReactComponent as HelpOutlineIcon } from '../../../assets/icons/ic-help-outline.svg';
import NoClusterSelectImage from '../../../assets/img/ic-no-cluster-select@2x.png';
import defaultChartImage from '../../../assets/icons/ic-plc-chart.svg';
import { Empty } from '../list/emptyView/Empty';
import { AllCheckModal } from '../../checkList/AllCheckModal';
import EmptyState from '../../EmptyState/EmptyState';
import Tippy from '@tippyjs/react';
import '../list/list.css';

export default function HelmAppList({ serverMode, payloadParsedFromUrl, sortApplicationList, clearAllFilters, setFetchingExternalAppsState }) {
    const [dataStateType, setDataStateType] = useState(AppListViewType.LOADING);
    const [errorResponseCode, setErrorResponseCode] = useState(0);
    const [devtronInstalledHelmAppsList, setDevtronInstalledHelmAppsList] = useState<HelmApp[]>([]);
    const [externalHelmAppsList, setExternalHelmAppsList] = useState<HelmApp[]>([]);
    const [filteredHelmAppsList, setFilteredHelmAppsList] = useState<HelmApp[]>([]);
    const [sortBy, setSortBy] = useState(SortBy.APP_NAME);
    const [sortOrder, setSortOrder] = useState(OrderBy.ASC);
    const [clusterIdsCsv, setClusterIdsCsv] = useState('');
    const [sseConnection, setSseConnection] = useState<EventSource>(undefined);

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
        if (serverMode == SERVER_MODE.EA_ONLY){
            setDataStateType(AppListViewType.LIST);
            if(clusterIdsCsv){
                _getExternalHelmApps();
            }
        }else{
            getDevtronInstalledHelmApps(clusterIdsCsv)
                .then((devtronInstalledHelmAppsListResponse: AppListResponse) => {
                    setDevtronInstalledHelmAppsList(devtronInstalledHelmAppsListResponse.result ? devtronInstalledHelmAppsListResponse.result.helmApps : []);
                    setDataStateType(AppListViewType.LIST);
                    _getExternalHelmApps();
                })
                .catch((errors: ServerErrors) => {
                    showError(errors);
                    setDataStateType(AppListViewType.ERROR);
                    setErrorResponseCode(errors.code);
                });
        }
    }, [clusterIdsCsv]);

    // reset data
    function init() {
        setDataStateType(AppListViewType.LOADING);
        setDevtronInstalledHelmAppsList([]);
        setFilteredHelmAppsList([]);
        setClusterIdsCsv(_getClusterIdsFromRequestUrl());
        setExternalHelmAppsList([]);
        if (sseConnection) {
            sseConnection.close();
        }
        setSseConnection(undefined);
        setFetchingExternalAppsState(false);
    }

    function _getExternalHelmApps() {
        if (clusterIdsCsv) {
            setFetchingExternalAppsState(true);
            let _sseConnection = new EventSource(`${Host}/application?clusterIds=${clusterIdsCsv}`, {
                withCredentials: true,
            });
            let _externalAppRecievedClusterIds = [];
            _sseConnection.onmessage = function (message) {
                _onExternalAppDataFromSse(message, _externalAppRecievedClusterIds, _sseConnection);
            };
            setSseConnection(_sseConnection);
        }
    }

    function _getClusterIdsFromRequestUrl() {
        return [...buildClusterVsNamespace(payloadParsedFromUrl.namespaces.join(',')).keys()].join(',');
    }

    function _onExternalAppDataFromSse(message: MessageEvent, _externalAppRecievedClusterIds : string[], _sseConnection: EventSource) {
        let externalAppData: AppListResponse = JSON.parse(message.data);
        if (externalAppData.result.errored || !externalAppData.result.clusterIds?.length) {
            return;
        }

        let _clusterId = externalAppData.result.clusterIds[0].toString();
        if (_externalAppRecievedClusterIds.includes(_clusterId)){
            return;
        }

        _externalAppRecievedClusterIds.push(_clusterId);
        setExternalHelmAppsList([...externalHelmAppsList, ...externalAppData.result.helmApps]);

        let _requestedSortedClusterIdsJson = JSON.stringify(
            clusterIdsCsv.split(',').sort((a, b) => a.localeCompare(b)),
        );
        let _recievedSortedClusterIdsJson = JSON.stringify(
            _externalAppRecievedClusterIds.sort((a, b) => a.localeCompare(b)),
        );

        if (_requestedSortedClusterIdsJson == _recievedSortedClusterIdsJson) {
            _sseConnection.close();
            setSseConnection(undefined);
            setFetchingExternalAppsState(false);
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
                    _includes = _includes || (app.environmentDetail.clusterId == _clusterId && (!_namespace || app.environmentDetail.namespace == _namespace));
                });
                return _includes;
            });
        }

        // handle search
        if (_search?.length) {
            _filteredDevtronInstalledHelmAppsList = _filteredDevtronInstalledHelmAppsList.filter(
                (app) => app.appName.toLowerCase().includes(_search.toLowerCase()) || app.chartName.toLowerCase().includes(_search.toLowerCase()),
            );
        }

        // handle sort
        if (_sortOrder == OrderBy.ASC) {
            _filteredDevtronInstalledHelmAppsList = _filteredDevtronInstalledHelmAppsList.sort((a, b) => a.appName.localeCompare(b.appName));
        } else {
            _filteredDevtronInstalledHelmAppsList = _filteredDevtronInstalledHelmAppsList.sort((a, b) => b.appName.localeCompare(a.appName));
        }

        setSortBy(_sortBy);
        setSortOrder(_sortOrder);
        setFilteredHelmAppsList(_filteredDevtronInstalledHelmAppsList);
    }

    function _isAnyFilterationAppliedExceptCluster() {
        let applied = payloadParsedFromUrl.teams?.length || payloadParsedFromUrl.appNameSearch?.length || payloadParsedFromUrl.environments?.length;
        if(applied){
            return true
        }
        if(payloadParsedFromUrl.namespaces?.length){
            applied = payloadParsedFromUrl.namespaces.some(_cluster => _cluster.includes("_"));
        }
        if(applied){
            return true
        }
        return false;
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
                    {sseConnection && <span>App name</span>}
                    {!sseConnection && (
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
                {
                    !clusterIdsCsv &&
                    <div>To view helm charts deployed from outside devtron, please select a cluster from above filters. Learn more</div>
                }
                {filteredHelmAppsList.length > 0 && renderHeaders()}
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

    function renderAllCheckModal(){
        return <div style={{ width: '600px', margin: 'auto', marginTop: '20px' }} className="bcn-0 pt-20 pb-20 pl-20 pr-20 br-8 en-1 bw-1 mt-20">
            <AllCheckModal />
        </div>
    }

    function askToSelectClusterId(){
        return <div style={{ height: "calc(100vh - 150px)" }}>
            <EmptyState>
                <img src={NoClusterSelectImage} width="250" height="250" alt="No Cluster Selected" />
                <h2 className="fs-16 fw-4 c-9">Select cluster to view deployed apps</h2>
                <p className="text-left">Helm charts deployed from devtron or other sources will be shown here. Learn more</p>
            </EmptyState>
        </div>
    }

    function askToClearFilters(){
        return <Empty
            view={AppListViewType.NO_RESULT}
            title={'No apps found'}
            message={"We couldn't find any matching applications."}
            buttonLabel={'Clear filters'}
            clickHandler={clearAllFilters}
        />
    }

    function renderFullModeApplicationListContainer() {
        if (!sseConnection && filteredHelmAppsList.length == 0){
            if(!clusterIdsCsv){
                return askToSelectClusterId()
            }else if(_isAnyFilterationAppliedExceptCluster()){
                return askToClearFilters()
            }else{
                return renderAllCheckModal()
            }
        }else{
            return renderApplicationList()
        }
    }


    function renderOnlyEAModeApplicationListContainer() {
        if (!clusterIdsCsv){
            return askToSelectClusterId()
        }else{
            if (!sseConnection && filteredHelmAppsList.length == 0){
                if(_isAnyFilterationAppliedExceptCluster()){
                    return askToClearFilters()
                }else{
                    return renderAllCheckModal()
                }
            }else{
                return renderApplicationList()
            }
        }
    }

    return (
        <>
            {dataStateType == AppListViewType.LOADING &&
                <div className="loading-wrapper">
                    <Progressing pageLoader />
                </div>
            }
            {dataStateType == AppListViewType.ERROR &&
                <div className="loading-wrapper">
                    <ErrorScreenManager code={errorResponseCode} />
                </div>
            }
            {
                dataStateType == AppListViewType.LIST &&
                <div className="app-list">
                    {
                        serverMode == SERVER_MODE.FULL &&
                        renderFullModeApplicationListContainer()
                    }
                    {
                        serverMode == SERVER_MODE.EA_ONLY &&
                        renderOnlyEAModeApplicationListContainer()
                    }
                </div>
            }
        </>
    );
}
