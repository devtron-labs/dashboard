import './list.css';
import React, { Component } from 'react';
import { getInitState, appListModal } from './appList.modal';
import { ServerErrors } from '../../../modals/commonTypes';
import { App, AppListProps, AppListState, OrderBy, SortBy } from './types';
import { URLS, ViewType } from '../../../config';
import { AppListView } from './AppListView';
import { getAppList } from '../service';
import { FilterOption, showError } from '../../common';
import { AppListViewType } from '../config';
import * as queryString from 'query-string';
import { withRouter } from 'react-router-dom';
import { getDockerRegistryStatus } from '../../../services/service';

class AppListContainer extends Component<AppListProps, AppListState>{
    abortController: AbortController;

    constructor(props) {
        super(props);
        this.state = {
            code: 0,
            view: AppListViewType.LOADING,
            errors: [],
            apps: [],
            searchQuery: "",
            searchApplied: false,
            size: 0,
            filters: {
                environment: [],
                status: [],
                team: [],
            },
            sortRule: {
                key: SortBy.APP_NAME,
                order: OrderBy.ASC
            },
            showCommandBar: false,
            offset: 0,
            pageSize: 20,
            expandedRow: false,
            appData: null,
            isDockerRegistryEmpty: false,
        }
    }

    componentDidMount() {
        let payload = this.createPayloadFromURL(this.props.location.search);
        getDockerRegistryStatus().then((response) => {
            this.setState({
                isDockerRegistryEmpty: !(response.result),
            })
        }).catch((errors: ServerErrors) => {

        })
        getInitState(payload).then((response) => {
            let view;
            if (payload.appNameSearch || payload.environments.length || payload.teams.length || payload.statuses.length) {
                view = response.apps.length ? AppListViewType.LIST : AppListViewType.NO_RESULT;
            }
            else {
                view = response.apps.length ? AppListViewType.LIST : AppListViewType.EMPTY;
            }
            this.setState({
                code: response.code,
                filters: response.filters,
                apps: [],
                offset: response.offset,
                size: 0,
                pageSize: response.size,
                sortRule: {
                    key: response.sortBy,
                    order: response.sortOrder,
                },
                searchQuery: response.appNameSearch || "",
                searchApplied: !!response.appNameSearch?.length,
                view: view
            });
        }).then(() => {
            let payload = this.createPayloadFromURL(this.props.location.search);
            this.getAppList(payload);
        }).catch((errors: ServerErrors) => {
            showError(errors);
            this.setState({ view: AppListViewType.ERROR, code: errors.code });
        })
    }

    componentDidUpdate(nextProps) {
        if (nextProps.location.search !== this.props.location.search) {
            let payload = this.createPayloadFromURL(this.props.location.search);
            this.getAppList(payload);
        }
    }

    createPayloadFromURL(searchQuery: string) {
        let params = queryString.parse(searchQuery);
        let search = params.search || "";
        let environments = params.environment || "";
        let statuses = params.status || "";
        let teams = params.team || "";
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
        if (this.state.size > 0 && offset > this.state.size) {
            offset = 0;
        }

        let payload = {
            environments: environments.toString().split(",").map(env => +env).filter(item => item != 0),
            statuses: statuses.toString().split(",").filter(item => item != ""),
            teams: teams.toString().split(",").map(team => +team).filter(item => item != 0),
            appNameSearch: search,
            sortBy: sortBy,
            sortOrder: sortOrder,
            offset: offset,
            size: +pageSize,
        }
        return payload;
    }

    handleSearchStr = (event: React.ChangeEvent<HTMLInputElement>): void => {
        let str = event.target.value || "";
        str = str.toLowerCase();
        this.setState({ searchQuery: str });
    }

    applyFilter = (type: string, list: FilterOption[]): void => {
        let qs = queryString.parse(this.props.location.search);
        let keys = Object.keys(qs);
        let query = {};
        keys.map((key) => {
            query[key] = qs[key];
        })
        let items = list.filter(item => item.isChecked);
        let ids = items.map(item => item.key);
        let str = ids.toString();
        query[type] = str;
        query['offset'] = 0;
        let queryStr = queryString.stringify(query);
        let url = `${URLS.APP}?${queryStr}`;
        this.props.history.push(url);
    }

    removeFilter = (val, type: string): void => {
        let qs = queryString.parse(this.props.location.search);
        let keys = Object.keys(qs);
        let query = {};
        keys.map((key) => {
            query[key] = qs[key];
        })
        query['offset'] = 0;
        let appliedFilters = query[type];
        let arr = appliedFilters.split(",");
        arr = arr.filter((item) => item != val.toString());
        query[type] = arr.toString();
        if (query[type] == "") delete query[type];
        let queryStr = queryString.stringify(query);
        let url = `${URLS.APP}?${queryStr}`;
        this.props.history.push(url);
    }

    removeAllFilters = (): void => {
        let qs = queryString.parse(this.props.location.search);
        let keys = Object.keys(qs);
        let query = {};
        keys.map((key) => {
            query[key] = qs[key];
        })
        delete query['environment'];
        delete query['team'];
        delete query['status'];
        let queryStr = queryString.stringify(query);
        let url = `${URLS.APP}?${queryStr}`;
        this.props.history.push(url);
    }

    sort = (key: string): void => {
        let qs = queryString.parse(this.props.location.search);
        let keys = Object.keys(qs);
        let query = {};
        keys.map((key) => {
            query[key] = qs[key];
        })
        query["orderBy"] = key;
        query["sortOrder"] = query["sortOrder"] == OrderBy.ASC ? OrderBy.DESC : OrderBy.ASC;
        let queryStr = queryString.stringify(query);
        let url = `${URLS.APP}?${queryStr}`;
        this.props.history.push(url);
    }

    search = (event: React.FormEvent): void => {
        event.preventDefault();
        let qs = queryString.parse(this.props.location.search);
        let keys = Object.keys(qs);
        let query = {};
        keys.map((key) => {
            query[key] = qs[key];
        })
        query['search'] = this.state.searchQuery.trim();
        query['offset'] = 0;
        let queryStr = queryString.stringify(query);
        let url = `${URLS.APP}?${queryStr}`;
        this.props.history.push(url);
    }

    clearSearch = (): void => {
        let qs = queryString.parse(this.props.location.search);
        let keys = Object.keys(qs);
        let query = {};
        keys.map((key) => {
            query[key] = qs[key];
        })
        delete query['search'];
        delete query['offset'];
        let queryStr = queryString.stringify(query);
        let url = `${URLS.APP}?${queryStr}`;
        this.props.history.push(url);
    }

    clearAll = (): void => {
        let qs = queryString.parse(this.props.location.search);
        let keys = Object.keys(qs);
        let query = {};
        keys.map((key) => {
            query[key] = qs[key];
        })
        delete query['search'];
        delete query['environment'];
        delete query['team'];
        delete query['status'];
        let queryStr = queryString.stringify(query);
        let url = `${URLS.APP}?${queryStr}`;
        this.props.history.push(url);
    }

    changePage = (pageNo: number): void => {
        let offset = this.state.pageSize * (pageNo - 1);
        let qs = queryString.parse(this.props.location.search);
        let keys = Object.keys(qs);
        let query = {};
        keys.map((key) => {
            query[key] = qs[key];
        })
        query['offset'] = offset;
        let queryStr = queryString.stringify(query);
        let url = `${URLS.APP}?${queryStr}`;
        this.props.history.push(url);
    }

    changePageSize = (size: number): void => {
        let qs = queryString.parse(this.props.location.search);
        let keys = Object.keys(qs);
        let query = {};
        keys.map((key) => {
            query[key] = qs[key];
        })
        query['offset'] = 0;
        query['pageSize'] = size;
        let queryStr = queryString.stringify(query);
        let url = `${URLS.APP}?${queryStr}`;
        this.props.history.push(url);
    }

    expandRow = (app: App | null): void => {
        this.setState({ expandedRow: true, appData: app });
    }

    closeExpandedRow = (): void => {
        this.setState({ expandedRow: false, appData: null });
    }

    getAppList = (request): void => {
        let filterApplied = {
            environments: new Set(request.environments),
            statuses: new Set(request.statuses),
            teams: new Set(request.teams),
        }
        let state = { ...this.state };
        state.view = AppListViewType.LOADING;
        state.filters.environment = state.filters.environment.map((env) => {
            return {
                key: env.key,
                label: env.label,
                isSaved: true,
                isChecked: filterApplied.environments.has(env.key)
            }
        })
        state.filters.status = state.filters.status.map((status) => {
            return {
                key: status.key,
                label: status.label,
                isSaved: true,
                isChecked: filterApplied.statuses.has(status.key)
            }
        })
        state.filters.team = state.filters.team.map((team) => {
            return {
                key: team.key,
                label: team.label,
                isSaved: true,
                isChecked: filterApplied.teams.has(team.key)
            }
        })
        state.sortRule = {
            key: request.sortBy,
            order: request.sortOrder,
        }
        if (request.appNameSearch.length) {
            state.searchQuery = request.appNameSearch;
            state.searchApplied = true;
        }
        else {
            state.searchQuery = "";
            state.searchApplied = false;
        }
        state.expandedRow = false;
        state.appData = null;
        this.setState(state);
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }

        this.abortController = new AbortController();

        getAppList(request, { signal: this.abortController.signal }).then((response) => {
            let state = { ...this.state };
            state.code = response.code;
            state.apps = (response.result && !!response.result.appContainers) ? appListModal(response.result.appContainers) : [];
            state.view = state.apps.length ? AppListViewType.LIST : AppListViewType.NO_RESULT;
            state.offset = request.offset;
            state.size = response.result.appCount;
            state.pageSize = request.size;
            this.setState(state);
            this.abortController = null;
        }).catch((errors: ServerErrors) => {
            if (errors.code) {
                showError(errors);
                this.setState({ code: errors.code, view: ViewType.ERROR });
            }
        })
    }

    handleEditApp = (appId: number): void => {
        let url = `/app/${appId}/edit`;
        this.props.history.push(url);
    }

    redirectToAppDetails = (app, envId: number): string => {
        if (envId) {
            return `${this.props.match.url}/${app.id}/details/${envId}`;
        }
        return `${this.props.match.url}/${app.id}/trigger`;
    }

    closeModal = () => {
        let url = `${URLS.APP}${this.props.location.search}`;
        this.props.history.push(`${url}`);
    }

    openTriggerInfoModal = (appId: number | string, ciArtifactId: number, commit: string): void => {
        let url = `${URLS.APP}/${appId}/material-info/${ciArtifactId}/commit/${commit}${this.props.location.search}`;
        this.props.history.push(`${url}`);
    }

    render() {
        return <AppListView
            {...this.state}
            match={this.props.match}
            location={this.props.location}
            history={this.props.history}
            applyFilter={this.applyFilter}
            expandRow={this.expandRow}
            closeExpandedRow={this.closeExpandedRow}
            removeFilter={this.removeFilter}
            removeAllFilters={this.removeAllFilters}
            search={this.search}
            clearSearch={this.clearSearch}
            handleSearchStr={this.handleSearchStr}
            sort={this.sort}
            redirectToAppDetails={this.redirectToAppDetails}
            handleEditApp={this.handleEditApp}
            clearAll={this.clearAll}
            changePage={this.changePage}
            changePageSize={this.changePageSize}
            closeModal={this.closeModal}
            openTriggerInfoModal={this.openTriggerInfoModal}
        />
    }
}

export default withRouter(AppListContainer)
