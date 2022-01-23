import React, { Component } from 'react';
import { buildInitState, appListModal } from './appList.modal';
import { ServerErrors } from '../../../modals/commonTypes';
import { App, AppListProps, AppListState, OrderBy, SortBy } from './types';
import { URLS, ViewType } from '../../../config';
import { AppListView } from './AppListView';
import { getAppList } from '../service';
import { showError } from '../../common';
import { AppListViewType } from '../config';
import * as queryString from 'query-string';
import { withRouter } from 'react-router-dom';
import './list.css';

class DevtronAppListContainer extends Component<AppListProps, AppListState>{
    abortController: AbortController;

    constructor(props) {
        super(props);
        this.state = {
            code: 0,
            view: AppListViewType.LOADING,
            errors: [],
            apps: [],
            size: 0,
            sortRule: {
                key: SortBy.APP_NAME,
                order: OrderBy.ASC
            },
            showCommandBar: false,
            offset: 0,
            pageSize: 20,
            expandedRow: false,
            appData: null,
            isAppCreated: false,
            appChecklist: undefined,
            chartChecklist: undefined,
            appStageCompleted: 0,
            chartStageCompleted: 0
        }
    }

    componentDidMount() {
        buildInitState(this.props.payloadParsedFromUrl, this.props.appCheckListRes).then((response) => {
            this.setState({
                code: response.code,
                apps: [],
                offset: response.offset,
                size: 0,
                pageSize: response.size,
                sortRule: {
                    key: response.sortBy,
                    order: response.sortOrder,
                },
                isAppCreated: response.isAppCreated,
                appChecklist: response.appChecklist,
                chartChecklist: response.chartChecklist,
                appStageCompleted: response.appStageCompleted,
                chartStageCompleted: response.chartStageCompleted
            });
        }).then(() => {
            if (this.state.isAppCreated) {
                this.getAppList(this.props.payloadParsedFromUrl);
            }
            else {
                this.setState({ view: AppListViewType.EMPTY });
            }
        }).catch((errors: ServerErrors) => {
            showError(errors);
            this.setState({ view: AppListViewType.ERROR, code: errors.code });
        })
    }

    componentDidUpdate(prevProps) {
        if(prevProps.payloadParsedFromUrl !=  this.props.payloadParsedFromUrl){
            this.getAppList(this.props.payloadParsedFromUrl);
        }
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
        let url = `${URLS.APP}/${URLS.APP_LIST}/${URLS.APP_LIST_DEVTRON}?${queryStr}`;
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
        let url = `${URLS.APP}/${URLS.APP_LIST}/${URLS.APP_LIST_DEVTRON}?${queryStr}`;
        this.props.history.push(url);
    }

    expandRow = (app: App | null): void => {
        this.setState({ expandedRow: true, appData: app });
    }

    closeExpandedRow = (): void => {
        this.setState({ expandedRow: false, appData: null });
    }

    getAppList = (request): void => {
        let isSearchOrFilterApplied = request.environments?.length || request.teams?.length || request.namespaces?.length || request.appNameSearch?.length;
        let state = { ...this.state };
        state.view = AppListViewType.LOADING;
        state.sortRule = {
            key: request.sortBy,
            order: request.sortOrder,
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
            let view = AppListViewType.LIST;
            if (response.result.appCount === 0) {
                if (isSearchOrFilterApplied) view = AppListViewType.NO_RESULT;
                else view = AppListViewType.EMPTY;
            }
            let state = { ...this.state };
            state.code = response.code;
            state.apps = (response.result && !!response.result.appContainers) ? appListModal(response.result.appContainers) : [];
            state.view = view;
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
        this.props.updateLastDataSync();
    }

    handleEditApp = (appId: number): void => {
        let url = `/app/${appId}/edit`;
        this.props.history.push(url);
    }

    redirectToAppDetails = (app, envId: number): string => {
        if (envId) {
            return `/app/${app.id}/details/${envId}`;
        }
        return `/app/${app.id}/trigger`;
    }


    render() {
        return <AppListView
            {...this.state}
            match={this.props.match}
            location={this.props.location}
            history={this.props.history}
            expandRow={this.expandRow}
            closeExpandedRow={this.closeExpandedRow}
            sort={this.props.sortApplicationList}
            redirectToAppDetails={this.redirectToAppDetails}
            handleEditApp={this.handleEditApp}
            clearAll={this.props.clearAllFilters}
            changePage={this.changePage}
            changePageSize={this.changePageSize}
        />
    }
}

export default withRouter(DevtronAppListContainer)
