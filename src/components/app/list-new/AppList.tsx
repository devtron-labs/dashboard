import React, {useState, useEffect} from 'react';
import {useLocation, useHistory, useParams} from 'react-router';
import {Progressing, Filter, showError, FilterOption } from '../../common';
import {ReactComponent as Search} from '../../../assets/icons/ic-search.svg';
import {getInitData, getApplicationList, AppsList, buildClusterVsNamespace} from './AppListService'
import {ServerErrors} from '../../../modals/commonTypes';
import {AppListViewType} from '../config';
import {URLS} from '../../../config';
import {ReactComponent as Clear} from '../../../assets/icons/ic-error.svg';
import defaultChartImage from '../../../assets/icons/ic-plc-chart.svg'
import AppListContainer from '../list/AppListContainer';
import * as queryString from 'query-string';
import { OrderBy, SortBy } from '../list/types';
import '../list/list.css';

const APP_LIST_PARAM = {
    createApp: 'create-app',
}

const APP_TABS = {
    DEVTRON_APPS: 'Devtron Apps',
    HELM_APPS: 'Helm Apps'
}

const APP_TYPE = {
    DEVTRON_APPS: 'd',
    HELM_APPS: 'h'
}

const APP_LIST_FILTER_TYPE = {
    PROJECT: 'team',
    CLUTSER: 'cluster',
    NAMESPACE: 'namespace',
    ENVIRONMENT: 'environment'
}

export default function AppList() {
    const location = useLocation();
    const history = useHistory();
    const params = useParams<{ appType: string}>();
    const [dataStateType, setDataStateType] = useState(AppListViewType.LOADING);
    const [parsedPayloadOnUrlChange, setParsedPayloadOnUrlChange] = useState({});
    const [currentTab, setCurrentTab] = useState(undefined);

    // API master data
    const [appCheckListRes, setAppCheckListRes] = useState({});
    const [projectListRes, setProjectListRes] = useState({result : []});
    const [environmentListRes, setEnvironmentListRes] = useState({result : []});

    // search
    const [searchString, setSearchString] = useState(undefined);
    const [searchApplied, setSearchApplied] = useState(false);

    // filters
    const [masterFilters, setMasterFilters] = useState({projects : [], clusters :[], namespaces : [], environments : []});


    // on page load
    useEffect(() => {
        setCurrentTab(params.appType == APP_TYPE.DEVTRON_APPS ? APP_TABS.DEVTRON_APPS : APP_TABS.HELM_APPS);

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
            teams: teams.toString().split(",").map(team => +team).filter(item => item != 0),
            namespaces : clustersAndNamespaces.toString().split(",").filter(item => item != ""),
            appNameSearch: search,
            sortBy: sortBy,
            sortOrder: sortOrder,
            offset: offset,
            size: +pageSize,
        }
        return payload;
    }


    function openAppCreateModel(event: React.MouseEvent) {
        let url = `${URLS.APP}/${APP_LIST_PARAM.createApp}${location.search}`
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
        let url = `${currentTab == APP_TABS.DEVTRON_APPS ? URLS.APP_LIST_DEVTRON : URLS.APP_LIST_HELM}?${queryStr}`;
        history.push(url);
    }

    const applyFilter = (type: string, list: FilterOption[]): void => {
        let qs = queryString.parse(location.search);
        let keys = Object.keys(qs);
        let query = {};
        keys.map((key) => {
            query[key] = qs[key];
        })

        let queryParamType = (type == APP_LIST_FILTER_TYPE.CLUTSER || type == APP_LIST_FILTER_TYPE.NAMESPACE) ? 'namespace' : type;
        let checkedItems = list.filter(item => item.isChecked);
        let ids = checkedItems.map(item => item.key);
        let str = ids.toString();
        query[queryParamType] = str;
        query['offset'] = 0;
        let queryStr = queryString.stringify(query);
        let url = `${currentTab == APP_TABS.DEVTRON_APPS ? URLS.APP_LIST_DEVTRON : URLS.APP_LIST_HELM}?${queryStr}`;
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
        let queryParamType = (filterType == APP_LIST_FILTER_TYPE.CLUTSER || filterType == APP_LIST_FILTER_TYPE.NAMESPACE) ? 'namespace' : filterType;
        let appliedFilters = query[queryParamType];
        let arr = appliedFilters.split(",");
        if(filterType == APP_LIST_FILTER_TYPE.CLUTSER) {
            arr = arr.filter((item) => !item.startsWith(val.toString()));
        }else{
            arr = arr.filter((item) => item != val.toString());
        }
        query[queryParamType] = arr.toString();
        if (query[queryParamType] == "") delete query[queryParamType];
        let queryStr = queryString.stringify(query);
        let url = `${currentTab == APP_TABS.DEVTRON_APPS ? URLS.APP_LIST_DEVTRON : URLS.APP_LIST_HELM}?${queryStr}`;
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
        let url = `${currentTab == APP_TABS.DEVTRON_APPS ? URLS.APP_LIST_DEVTRON : URLS.APP_LIST_HELM}?${queryStr}`;
        history.push(url);
    }

    function changeAppTab(appTabType) {
        if (appTabType == currentTab){
            return;
        }
        let url = (appTabType == APP_TABS.DEVTRON_APPS) ? `${URLS.APP_LIST_DEVTRON}${location.search}` : `${URLS.APP_LIST_HELM}${location.search}`;
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
        return <div className="app-header">
            <div className="app-header__title">
                <h1 className="app-header__text">Applications</h1>
                <button type="button" className="cta" onClick={openAppCreateModel}>
                    <span className="round-button__icon"><i className="fa fa-plus" aria-hidden="true"></i></span>
                    Add new app
                </button>
            </div>
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
                            type={APP_LIST_FILTER_TYPE.PROJECT}
                            applyFilter={applyFilter} />
                    <Filter list={masterFilters.clusters}
                            labelKey="label"
                            buttonText="Cluster"
                            searchable multi
                            placeholder="Search Cluster"
                            type={APP_LIST_FILTER_TYPE.CLUTSER}
                            applyFilter={applyFilter} />
                    <Filter list={masterFilters.namespaces.filter(namespace => namespace.toShow)}
                            labelKey="label"
                            buttonText="Namespace"
                            searchable multi
                            placeholder="Search Namespace"
                            type={APP_LIST_FILTER_TYPE.NAMESPACE}
                            applyFilter={applyFilter} />
                    <Filter list={masterFilters.environments}
                            labelKey="label"
                            buttonText="Environment"
                            searchable multi
                            placeholder="Search Environment"
                            type={APP_LIST_FILTER_TYPE.ENVIRONMENT}
                            applyFilter={applyFilter} />
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
                    filterType = APP_LIST_FILTER_TYPE.PROJECT;
                }else if (key == 'clusters'){
                    filterType = APP_LIST_FILTER_TYPE.CLUTSER;
                }else if (key == 'namespaces'){
                    filterType = APP_LIST_FILTER_TYPE.NAMESPACE;
                }else if (key == 'environments'){
                    filterType = APP_LIST_FILTER_TYPE.ENVIRONMENT;
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
        return <>
            <ul className="tab-list" style={{paddingLeft: 30, background: 'white'}}>
                <li className="tab-list__tab">
                    <a className={`tab-list__tab-link ${currentTab == APP_TABS.DEVTRON_APPS ? 'active' : ''}`}
                       onClick={() => changeAppTab(APP_TABS.DEVTRON_APPS)}>Devtron Apps</a>
                </li>
                <li className="tab-list__tab">
                    <a className={`tab-list__tab-link ${currentTab == APP_TABS.HELM_APPS ? 'active' : ''}`}
                       onClick={() => changeAppTab(APP_TABS.HELM_APPS)}>Helm Apps</a>
                </li>
            </ul>
        </>
    }

    return (
        <div>
            {
                dataStateType == AppListViewType.LOADING &&
                <>
                    {renderPageHeader()}
                    <div className="loading-wrapper">
                        <Progressing pageLoader/>
                    </div>
                </>
            }
            {
                dataStateType != AppListViewType.LOADING &&
                <>
                    {renderPageHeader()}
                    {renderMasterFilters()}
                    {renderAppliedFilters()}
                    {renderAppTabs()}
                    {
                        params.appType == APP_TYPE.DEVTRON_APPS &&
                        <AppListContainer payloadParsedFromUrl={parsedPayloadOnUrlChange} appCheckListRes={appCheckListRes} environmentListRes={environmentListRes} teamListRes={projectListRes} clearAllFilters={removeAllFilters}/>
                    }
                </>
            }
        </div>
    )
}