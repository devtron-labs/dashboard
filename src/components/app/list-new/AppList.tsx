import React, {useState, useEffect} from 'react';
import {useLocation, useHistory, useParams} from 'react-router';
import { Link, Switch, Route } from 'react-router-dom';
import {Progressing, Filter, showError, FilterOption, Modal, ErrorScreenManager } from '../../common';
import {ReactComponent as Search} from '../../../assets/icons/ic-search.svg';
import {ReactComponent as ChartIcon} from '../../../assets/icons/ic-charts.svg';
import {ReactComponent as AddIcon} from '../../../assets/icons/ic-add.svg';
import InstallDevtronFullImage from '../../../assets/img/install-devtron-full@2x.png';
import EmptyState from '../../EmptyState/EmptyState';
import {getInitData, getApplicationList, AppsList, buildClusterVsNamespace} from './AppListService'
import {ServerErrors} from '../../../modals/commonTypes';
import {AppListViewType} from '../config';
import {URLS, AppListConstants} from '../../../config';
import {ReactComponent as Clear} from '../../../assets/icons/ic-error.svg';
import defaultChartImage from '../../../assets/icons/ic-plc-chart.svg'
import DevtronAppListContainer from '../list/DevtronAppListContainer';
import * as queryString from 'query-string';
import { OrderBy, SortBy } from '../list/types';
import { AddNewApp } from '../create/CreateApp';
import '../list/list.css';

export default function AppList() {
    const location = useLocation();
    const history = useHistory();
    const params = useParams<{ appType: string}>();
    const [dataStateType, setDataStateType] = useState(AppListViewType.LOADING);
    const [errorResponseCode, setErrorResponseCode] = useState(0);

    const [parsedPayloadOnUrlChange, setParsedPayloadOnUrlChange] = useState({});
    const [currentTab, setCurrentTab] = useState(undefined);
    const [showCreateNewAppSelectionModal, setShowCreateNewAppSelectionModal] = useState(false);

    // API master data
    const [appCheckListRes, setAppCheckListRes] = useState({});
    const [projectListRes, setProjectListRes] = useState({result : []});
    const [environmentListRes, setEnvironmentListRes] = useState({result : []});

    // search
    const [searchString, setSearchString] = useState(undefined);
    const [searchApplied, setSearchApplied] = useState(false);

    // filters
    const [masterFilters, setMasterFilters] = useState({projects : [], clusters :[], namespaces : [], environments : []});

    //
    let serverMode = 'FULL';

    // on page load
    useEffect(() => {
        setCurrentTab(params.appType == AppListConstants.AppType.DEVTRON_APPS ? AppListConstants.AppTabs.DEVTRON_APPS : AppListConstants.AppTabs.HELM_APPS);

        // set search data
        let searchQuery = location.search;
        let queryParams = queryString.parse(searchQuery);
        if (queryParams.search){
            setSearchString(queryParams.search);
            setSearchApplied(true);
        }

        // set payload parsed from url
        let payloadParsedFromUrl = onRequestUrlChange();
        setParsedPayloadOnUrlChange(payloadParsedFromUrl);

        // fetch master filters data and some master data
        getInitData(payloadParsedFromUrl).then((initData) => {
            setAppCheckListRes(initData.appCheckListRes);
            setProjectListRes(initData.projectsRes);
            setEnvironmentListRes(initData.environmentListRes);
            setMasterFilters(initData.filters)
            setDataStateType(AppListViewType.LIST);
        }).catch((errors: ServerErrors) => {
            showError(errors);
            setDataStateType(AppListViewType.ERROR);
            setErrorResponseCode(errors.code);
        })
    }, [])


    useEffect(() => {
        setParsedPayloadOnUrlChange(onRequestUrlChange());
    }, [location.search])


    const onRequestUrlChange = () : any => {
        let searchQuery = location.search;

        let params = queryString.parse(searchQuery);
        let search = params.search || "";
        let environments = params.environment || "";
        let teams = params.team || "";
        let clustersAndNamespaces = params.namespace || "";

        let _clusterVsNamespaceMap = buildClusterVsNamespace(clustersAndNamespaces);

        ////// update master filters data (check/uncheck)
        let filterApplied = {
            environments: new Set(environments),
            teams: new Set(teams),
            clusterVsNamespaceMap : _clusterVsNamespaceMap
        }

        let _masterFilters = {projects :[], clusters :[], namespaces :[], environments : []};

        // set projects (check/uncheck)
        _masterFilters.projects = masterFilters.projects.map((project) => {
            return {
                key: project.key,
                label: project.label,
                isSaved: true,
                isChecked: filterApplied.teams.has(project.key.toString())
            }
        })

        // set clusters (check/uncheck)
        _masterFilters.clusters = masterFilters.clusters.map((cluster) => {
            return {
                key: cluster.key,
                label: cluster.label,
                isSaved: true,
                isChecked: filterApplied.clusterVsNamespaceMap.has(cluster.key.toString())
            }
        })

        // set namespace (check/uncheck)
        _masterFilters.namespaces = masterFilters.namespaces.map((namespace) => {
            return {
                key: namespace.key,
                label: namespace.label,
                isSaved: true,
                isChecked: filterApplied.clusterVsNamespaceMap.has(namespace.clusterId.toString()) && filterApplied.clusterVsNamespaceMap.get(namespace.clusterId.toString()).includes(namespace.key.split("_")[1]),
                toShow : filterApplied.clusterVsNamespaceMap.size == 0 || filterApplied.clusterVsNamespaceMap.has(namespace.clusterId.toString()),
                clusterId : namespace.clusterId
            }
        })

        // set environments (check/uncheck)
        _masterFilters.environments = masterFilters.environments.map((env) => {
            return {
                key: env.key,
                label: env.label,
                isSaved: true,
                isChecked: filterApplied.environments.has(env.key.toString())
            }
        })
        setMasterFilters(_masterFilters);
        ////// update master filters data ends (check/uncheck)

        let sortBy = params.orderBy || SortBy.APP_NAME;
        let sortOrder = params.sortOrder || OrderBy.ASC;
        let offset = +params.offset || 0;
        let pageSize: number = +params.pageSize || 20;
        let pageSizes = new Set([20, 40, 50]);

        if (!pageSizes.has(pageSize)) { //handle invalid pageSize
            pageSize = 20;
        }
        if ((offset % pageSize != 0)) { //pageSize must be a multiple of offset
            offset = 0;
        }

        let payload = {
            environments: environments.toString().split(",").map(env => +env).filter(item => item != 0),
            teams: teams.toString().split(",").filter(team => team != '').map(team => Number(team)),
            namespaces : clustersAndNamespaces.toString().split(",").filter(item => item != ""),
            appNameSearch: search,
            sortBy: sortBy,
            sortOrder: sortOrder,
            offset: offset,
            size: +pageSize,
        }
        return payload;
    }


    function openDevtronAppCreateModel(event: React.MouseEvent) {
        let url = `${URLS.APP_LIST_DEVTRON}/${AppListConstants.CREATE_APP_URL}${location.search}`
        history.push(`${url}`);
    }

    function redirectToHelmAppDiscover(event: React.MouseEvent) {
        let url = `${URLS.CHARTS_DISCOVER}`
        history.push(`${url}`);
    }

    const redirectToAppDetails = (appId : string | number, envId: number): string => {
        if (envId) {
            return `/app/${appId}/details/${envId}`;
        }
        return `/app/${appId}/trigger`;
    }

    const handleAppSearchOperation = (_searchString : string): void => {
        let qs = queryString.parse(location.search);
        let keys = Object.keys(qs);
        let query = {};
        keys.map((key) => {
            query[key] = qs[key];
        })
        if (_searchString){
            query['search'] = _searchString;
            query['offset'] = 0;
        }else{
            delete query['search'];
            delete query['offset'];
        }

        let queryStr = queryString.stringify(query);
        let url = `${currentTab == AppListConstants.AppTabs.DEVTRON_APPS ? URLS.APP_LIST_DEVTRON : URLS.APP_LIST_HELM}?${queryStr}`;
        history.push(url);
    }

    const applyFilter = (type: string, list: FilterOption[]): void => {
        let qs = queryString.parse(location.search);
        let keys = Object.keys(qs);
        let query = {};
        keys.map((key) => {
            query[key] = qs[key];
        })

        let queryParamType = (type == AppListConstants.FilterType.CLUTSER || type == AppListConstants.FilterType.NAMESPACE) ? 'namespace' : type;
        let checkedItems = list.filter(item => item.isChecked);
        let ids = checkedItems.map(item => item.key);
        let str = ids.toString();
        query[queryParamType] = str;
        query['offset'] = 0;
        let queryStr = queryString.stringify(query);
        let url = `${currentTab == AppListConstants.AppTabs.DEVTRON_APPS ? URLS.APP_LIST_DEVTRON : URLS.APP_LIST_HELM}?${queryStr}`;
        history.push(url);
    }

    const removeFilter = (filter, filterType: string): void => {
        let val = filter.key;
        let qs = queryString.parse(location.search);
        let keys = Object.keys(qs);
        let query = {};
        keys.map((key) => {
            query[key] = qs[key];
        })
        query['offset'] = 0;
        let queryParamType = (filterType == AppListConstants.FilterType.CLUTSER || filterType == AppListConstants.FilterType.NAMESPACE) ? 'namespace' : filterType;
        let appliedFilters = query[queryParamType];
        let arr = appliedFilters.split(",");
        if(filterType == AppListConstants.FilterType.CLUTSER) {
            arr = arr.filter((item) => !item.startsWith(val.toString()));
        }else{
            arr = arr.filter((item) => item != val.toString());
        }
        query[queryParamType] = arr.toString();
        if (query[queryParamType] == "") delete query[queryParamType];
        let queryStr = queryString.stringify(query);
        let url = `${currentTab == AppListConstants.AppTabs.DEVTRON_APPS ? URLS.APP_LIST_DEVTRON : URLS.APP_LIST_HELM}?${queryStr}`;
        history.push(url);
    }

    const removeAllFilters = (): void => {
        let qs = queryString.parse(location.search);
        let keys = Object.keys(qs);
        let query = {};
        keys.map((key) => {
            query[key] = qs[key];
        })
        delete query['environment'];
        delete query['team'];
        delete query['namespace'];
        let queryStr = queryString.stringify(query);
        let url = `${currentTab == AppListConstants.AppTabs.DEVTRON_APPS ? URLS.APP_LIST_DEVTRON : URLS.APP_LIST_HELM}?${queryStr}`;
        history.push(url);
    }

    function changeAppTab(appTabType) {
        if (appTabType == currentTab){
            return;
        }
        let url = (appTabType == AppListConstants.AppTabs.DEVTRON_APPS) ? `${URLS.APP_LIST_DEVTRON}${location.search}` : `${URLS.APP_LIST_HELM}${location.search}`;
        history.push(url);
        setCurrentTab(appTabType);
    }

    function handleImageError(e) {
        const target = e.target as HTMLImageElement
        target.onerror = null
        target.src = defaultChartImage
    }

    const searchApp = (event: React.FormEvent) => {
        event.preventDefault();
        setSearchApplied(true);
        handleAppSearchOperation(searchString);
    }

    const clearSearch = (): void => {
        setSearchApplied(false);
        setSearchString("");
        handleAppSearchOperation("");
    }

    const onChangeSearchString = (event: React.ChangeEvent<HTMLInputElement>): void => {
        let str = event.target.value || "";
        str = str.toLowerCase();
        setSearchString(str);
    }

    function renderPageHeader() {
        return <div className="app-header__title">
                <h1 className="app-header__text">Applications</h1>
                {serverMode == 'FULL' &&
                    <button type="button" className="cta"
                            onClick={() => setShowCreateNewAppSelectionModal(!showCreateNewAppSelectionModal)}>
                        Create new
                        <span className="round-button__icon"><i className="fa fa-caret-down" aria-hidden="true"></i></span>
                    </button>
                }
                {showCreateNewAppSelectionModal && renderAppCreateSelectionModal()}
            </div>
    }

    function renderMasterFilters() {
        return <div className="search-filter-section">
                    <form style={{ display: "inline" }} onSubmit={searchApp}>
                       <div className="search">
                            <Search className="search__icon icon-dim-18"/>
                            <input type="text" name="app_search_input" autoComplete="off" value={searchString} placeholder="Search apps" className="search__input bcn-1" onChange={onChangeSearchString} />
                            {searchApplied &&
                                <button className="search__clear-button" type="button" onClick={clearSearch}>
                                    <Clear className="icon-dim-18 icon-n4 vertical-align-middle"/>
                                </button>
                            }
                        </div>
                    </form>
                <div className="filters">
                    <span className="filters__label">Filter By</span>
                    <Filter list={masterFilters.projects}
                            labelKey="label"
                            buttonText="Projects"
                            placeholder="Search Project"
                            searchable multi
                            type={AppListConstants.FilterType.PROJECT}
                            applyFilter={applyFilter} />
                    <Filter list={masterFilters.clusters}
                            labelKey="label"
                            buttonText="Cluster"
                            searchable multi
                            placeholder="Search Cluster"
                            type={AppListConstants.FilterType.CLUTSER}
                            applyFilter={applyFilter} />
                    <Filter list={masterFilters.namespaces.filter(namespace => namespace.toShow)}
                            labelKey="label"
                            buttonText="Namespace"
                            searchable multi
                            placeholder="Search Namespace"
                            type={AppListConstants.FilterType.NAMESPACE}
                            applyFilter={applyFilter} />
                    {
                        serverMode == 'FULL' &&
                        <Filter list={masterFilters.environments}
                                labelKey="label"
                                buttonText="Environment"
                                searchable multi
                                placeholder="Search Environment"
                                type={AppListConstants.FilterType.ENVIRONMENT}
                                applyFilter={applyFilter} />
                    }
                </div>
            </div>
    }

    function renderAppliedFilters() {
        let count = 0;
        let keys = Object.keys(masterFilters);
        let appliedFilters = <div className="saved-filters">
            {keys.map((key) => {
                let filterType = '';
                if (key == 'projects'){
                    filterType = AppListConstants.FilterType.PROJECT;
                }else if (key == 'clusters'){
                    filterType = AppListConstants.FilterType.CLUTSER;
                }else if (key == 'namespaces'){
                    filterType = AppListConstants.FilterType.NAMESPACE;
                }else if (key == 'environments'){
                    filterType = AppListConstants.FilterType.ENVIRONMENT;
                }
                return masterFilters[key].map((filter) => {
                    if (filter.isChecked) {
                        count++;
                        return <div key={filter.key} className="saved-filter">{key} : {filter.label}
                            <button type="button" className="saved-filter__clear-btn"
                                    onClick={(event) => removeFilter(filter, filterType)} >
                                <i className="fa fa-times-circle" aria-hidden="true"></i>
                            </button>
                        </div>
                    }
                })
            })}
            <button type="button" className="saved-filters__clear-btn" onClick={() => { removeAllFilters() }}>
                Clear All Filters
            </button>
        </div>

        return <React.Fragment>
            {count > 0 ? appliedFilters : null}
        </React.Fragment>
    }

    function renderAppTabs() {
        return <div className="app-tabs-wrapper">
            <ul className="tab-list">
                <li className="tab-list__tab">
                    <a className={`tab-list__tab-link ${currentTab == AppListConstants.AppTabs.DEVTRON_APPS ? 'active' : ''}`}
                       onClick={() => changeAppTab(AppListConstants.AppTabs.DEVTRON_APPS)}>Devtron Apps</a>
                </li>
                <li className="tab-list__tab">
                    <a className={`tab-list__tab-link ${currentTab == AppListConstants.AppTabs.HELM_APPS ? 'active' : ''}`}
                       onClick={() => changeAppTab(AppListConstants.AppTabs.HELM_APPS)}>Helm Apps</a>
                </li>
            </ul>
            <div className="app-tabs-sync">
                Last synced 1 hour ago hello <button className="text-primary btn btn-link p-0">sync now</button>
            </div>
        </div>
    }

    const closeDevtronAppCreateModal = () => {
        let url = `${URLS.APP_LIST_DEVTRON}${location.search}`;
        history.push(`${url}`);
    }

    function renderAppCreateRouter() {
        return <Switch>
            <Route path={`${URLS.APP_LIST_DEVTRON}/${AppListConstants.CREATE_APP_URL}`}
                   render={(props) => <AddNewApp close={closeDevtronAppCreateModal}  match={props.match} location={props.location} history={props.history} />}
            />
        </Switch>
    }

    function renderAppCreateSelectionModal() {
        return <Modal rootClassName="app-create-model-wrapper" onClick={ () => setShowCreateNewAppSelectionModal(!showCreateNewAppSelectionModal)} >
                <div className="app-create-child c-pointer" onClick={openDevtronAppCreateModel}>
                    <AddIcon className="icon-dim-20 fcn-9"/>
                    <div className="ml-5">
                        <strong>Custom app</strong>
                        <div>Connect a git repository to deploy <br/> a custom application</div>
                    </div>
                </div>
                <div className="app-create-child c-pointer" onClick={redirectToHelmAppDiscover}>
                    <ChartIcon className="icon-dim-20"/>
                    <div className="ml-5">
                        <strong>From Chart store</strong>
                        <div>Deploy apps using third party helm <br/> charts (eg. prometheus, redis etc.)</div>
                    </div>
                </div>
        </Modal>
    }

    return (
        <div>
            {
                dataStateType == AppListViewType.LOADING &&
                <div className="loading-wrapper">
                    <Progressing pageLoader/>
                </div>
            }
            {
                dataStateType == AppListViewType.ERROR &&
                <div className="loading-wrapper">
                    <ErrorScreenManager code={errorResponseCode} />
                </div>
            }
            {
                dataStateType == AppListViewType.LIST &&
                 <>
                    <div className="app-header">
                        {renderPageHeader()}
                        {renderMasterFilters()}
                        {renderAppliedFilters()}
                        {renderAppTabs()}
                    </div>
                    {serverMode == 'FULL' && renderAppCreateRouter()}
                    {
                        serverMode == 'FULL' && params.appType == AppListConstants.AppType.DEVTRON_APPS &&
                        <DevtronAppListContainer payloadParsedFromUrl={parsedPayloadOnUrlChange} appCheckListRes={appCheckListRes} environmentListRes={environmentListRes} teamListRes={projectListRes} clearAllFilters={removeAllFilters}/>
                    }
                    {
                        serverMode == 'ONLY_EA' && params.appType == AppListConstants.AppType.DEVTRON_APPS &&
                        <div style={{ height: "calc(100vh - 250px)" }}>
                            <EmptyState>
                                <img src={InstallDevtronFullImage} width="250" height="200" alt="Install devtron" />
                                <h2 className="fs-16 fw-4 c-9">Create, build, deploy, debug</h2>
                                <p className="text-left">Use Discover, Sentry’s powerful built-in query language interface, to uncover patterns and trends in your event data - all in one place. Measuring the health of your application is just a few simple clicks away. Learn more</p>
                                <p>Run below command to install</p>
                            </EmptyState>
                        </div>
                    }
                 </>
            }
        </div>
    )
}