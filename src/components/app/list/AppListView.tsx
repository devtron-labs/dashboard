import React, { Component } from 'react';
import { AppListViewType } from '../config';
import { ErrorScreenManager, Filter, Pagination, FilterOption, Progressing } from '../../common';
import { ReactComponent as Commit } from '../../../assets/icons/ic-commit.svg';
import { Link, Switch, Route, RouteComponentProps } from 'react-router-dom';
import { ExpandedRow } from './expandedRow/ExpandedRow';
import { AppStatus } from './appStatus/AppStatus';
import { AddNewApp } from '../create/CreateApp';
import { Empty } from './emptyView/Empty';
import { URLS } from '../../../config';
import { App, AppListState, OrderBy, SortBy } from './types';
import { ReactComponent as Edit } from '../../../assets/icons/ic-settings.svg';
import { ReactComponent as Search } from '../../../assets/icons/ic-search.svg';
import { ReactComponent as Clear } from '../../../assets/icons/ic-error.svg';
import { TriggerInfoModal } from './TriggerInfo';
import { AppCheckListModal } from '../../checkList/AppCheckModal';

const APP_LIST_PARAM = {
    createApp: 'create-app',
}

interface AppListViewProps extends AppListState, RouteComponentProps<{}> {
    applyFilter: (type: string, list: FilterOption[]) => void;
    expandRow: (app: App | null) => void;
    closeExpandedRow: () => void;
    removeFilter: (val, type: string) => void;
    removeAllFilters: () => void;
    search: (event: React.FormEvent) => void;
    clearSearch: () => void;
    handleSearchStr: (event: React.ChangeEvent<HTMLInputElement>) => void;
    sort: (key: string) => void;
    redirectToAppDetails: (app, envId: number) => string;
    handleEditApp: (appId: number) => void;
    clearAll: () => void;
    changePage: (pageNo: number) => void;
    closeModal: () => void;
    openTriggerInfoModal: (appId: number | string, ciArtifactId: number, commit: string) => void;
    changePageSize: (size: number) => void;
}

export class AppListView extends Component<AppListViewProps>{

    openCreateModal = (event: React.MouseEvent): void => {
        let url = `${URLS.APP}/${APP_LIST_PARAM.createApp}${this.props.location.search}`
        this.props.history.push(`${url}`);
    }

    renderEnvironmentList(app) {
        let len = app.environments.length;
        if (len) {
            return <div className="app-list__cell app-list__cell--env">
                <p className="app-list__cell--env-text">{app.defaultEnv ? app.defaultEnv.name : ""}</p>
                {len > 1 ? <button type="button" className="cell__link"
                    onClick={(event) => { event.stopPropagation(); event.preventDefault(); this.props.expandRow(app); }}>
                    +{len - 1} more </button> : null}
            </div>
        }
        else return <div className="app-list__cell app-list__cell--env"></div>
    }

    renderPageHeader() {
        return <div className="app-header">
            <div className="app-header__title">
                <h1 className="app-header__text">Applications({this.props.size})</h1>
                {this.props.view != AppListViewType.EMPTY ? <button type="button" className="cta"
                    onClick={this.openCreateModal}>
                    <span className="round-button__icon"><i className="fa fa-plus" aria-hidden="true"></i></span>
                    Add new app
                </button> : null}
            </div>
            {this.renderFilters()}
        </div>
    }

    renderSavedFilters() {
        let count = 0;
        let keys = Object.keys(this.props.filters);
        let savedFilters = <div className="saved-filters">
            {keys.map((key) => {
                return this.props.filters[key].map((filter) => {
                    if (filter.isChecked) {
                        count++;
                        return <div key={filter.key} className="saved-filter">{filter.label}
                            <button type="button" className="saved-filter__clear-btn"
                                onClick={(event) => this.props.removeFilter(filter.key, key)} >
                                <i className="fa fa-times-circle" aria-hidden="true"></i>
                            </button>
                        </div>
                    }
                })
            })}
            <button type="button" className="saved-filters__clear-btn" onClick={() => { this.props.removeAllFilters() }}>
                Clear All Filters
            </button>
        </div>

        return <React.Fragment>
            {count > 0 ? savedFilters : null}
        </React.Fragment>
    }

    renderFilters() {
        return <div className="search-filter-section">
            <form style={{ display: "inline" }} onSubmit={this.props.search}>
                <div className="search">
                    <Search className="search__icon icon-dim-18" />
                    <input type="text" placeholder="Search apps" className="search__input bcn-1" value={this.props.searchQuery} onChange={this.props.handleSearchStr} />
                    {this.props.searchApplied ? <button className="search__clear-button" type="button" onClick={this.props.clearSearch}>
                        <Clear className="icon-dim-18 icon-n4 vertical-align-middle" />
                    </button> : null}
                </div>
            </form>
            <div className="filters">
                <span className="filters__label">Filter By</span>
                <Filter list={this.props.filters.environment}
                    labelKey="label"
                    buttonText="Environment"
                    searchable multi
                    placeholder="Search Environment"
                    type={"environment"}
                    applyFilter={this.props.applyFilter} />
                <Filter list={this.props.filters.status}
                    labelKey="label"
                    buttonText="Status"
                    placeholder="Search Status"
                    searchable multi
                    type={"status"}
                    applyFilter={this.props.applyFilter} />
                <Filter list={this.props.filters.team}
                    labelKey="label"
                    buttonText="Projects"
                    placeholder="Search Project"
                    searchable multi
                    type={"team"}
                    applyFilter={this.props.applyFilter} />
            </div>
        </div>
    }

    renderAppList() {
        if (this.props.apps.length) {
            let icon = this.props.sortRule.order == OrderBy.ASC ? "sort-up" : "sort-down";
            return <div className="app-list">
                <div className="app-list__header">
                    <div className="app-list__cell app-list__cell--name">
                        <button className="app-list__cell-header" onClick={e => { e.preventDefault(); this.props.sort('appNameSort') }}>App name
                            {this.props.sortRule.key == SortBy.APP_NAME ? <span className={icon}></span> : <span className="sort-col"></span>}
                        </button>
                    </div>
                    <div className="app-list__cell app-list__cell--status">
                        <span className="app-list__cell-header">Status</span>
                    </div>
                    <div className="app-list__cell app-list__cell--env">
                        <span className="app-list__cell-header">Environment</span>
                    </div>
                    <div className="app-list__cell app-list__cell--material-info">
                        <span className="app-list__cell-header">Commit</span>
                    </div>
                    <div className="app-list__cell app-list__cell--time">
                        <span className="app-list__cell-header">Last Deployed Time </span>
                    </div>
                    <div className="app-list__cell app-list__cell--action"></div>
                </div>
                {this.props.apps.map((app) => {
                    let commits = app.defaultEnv.materialInfo.map(mat => {
                        return <div key={mat.revision} className="app-commit">
                            <button type="button" className="app-commit__hash block mr-16" onClick={(event) => {
                                event.preventDefault();
                                this.props.openTriggerInfoModal(app.id, app.defaultEnv.ciArtifactId, mat.revision);
                            }}>
                                <Commit className="icon-dim-16" />{mat.revision.substr(0, 8)}
                            </button>
                        </div>
                    })
                    return <React.Fragment key={app.id} >
                        {!(this.props.appData && this.props.appData.id == app.id) ?
                            <Link to={this.props.redirectToAppDetails(app, app.defaultEnv.id)} className="app-list__row">
                                <div className="app-list__cell app-list__cell--name">
                                    <p className="truncate-text m-0">{app.name}</p>
                                </div>
                                <div className="app-list__cell app-list__cell--status">
                                    <AppStatus status={app.defaultEnv ? app.defaultEnv.status : "Not Deployed"} />
                                </div>
                                {this.renderEnvironmentList(app)}
                                <div className="app-list__cell app-list__cell--material-info">
                                    {commits}
                                </div>
                                <div className="app-list__cell app-list__cell--time">
                                    <p className="truncate-text m-0"> {app.defaultEnv ? app.defaultEnv.lastDeployedTime : ""}</p>
                                </div>
                                <div className="app-list__cell app-list__cell--action">
                                    <button type="button" className="button-edit" onClick={(event) => { event.stopPropagation(); event.preventDefault(); this.props.handleEditApp(app.id) }}>
                                        <Edit className="button-edit__icon" />
                                    </button>
                                </div>
                            </Link>
                            : null}
                        {(this.props.appData && this.props.appData.id == app.id) ?
                            <ExpandedRow app={this.props.appData}
                                openTriggerInfoModal={this.props.openTriggerInfoModal}
                                close={this.props.closeExpandedRow}
                                redirect={this.props.redirectToAppDetails}
                                handleEdit={(event) => this.props.handleEditApp(app.id)} />
                            : null}
                    </React.Fragment>
                })}
            </div>
        }
    }

    renderRouter() {
        return <Switch>
            <Route path={`${URLS.APP}/${APP_LIST_PARAM.createApp}`}
                render={(props) => <AddNewApp close={this.props.closeModal}
                    match={props.match} location={props.location} history={props.history} />}
            />
            <Route path={`${URLS.APP}/:appId(\\d+)/material-info/:ciArtifactId(\\d+)/commit/:commit`}
                render={(props) => <TriggerInfoModal {...props}
                    close={this.props.closeModal} />}
            />
        </Switch>
    }

    renderPagination() {
        if (this.props.size > 20) {
            return <Pagination size={this.props.size}
                pageSize={this.props.pageSize}
                offset={this.props.offset}
                changePage={this.props.changePage}
                changePageSize={this.props.changePageSize} />
        }
    }


    render() {
        if (this.props.view === AppListViewType.LOADING) {
            return <React.Fragment>
                {this.renderPageHeader()}
                <div className="loading-wrapper">
                    <Progressing pageLoader />
                </div>
            </React.Fragment>
        }
        else if (this.props.view === AppListViewType.EMPTY) {
            return <React.Fragment>
                {this.renderPageHeader()}
                {this.renderRouter()}
                <AppCheckListModal history={this.props.history}
                    location={this.props.location}
                    match={this.props.match}
                    appChecklist={this.props.appChecklist}
                    chartChecklist={this.props.chartChecklist}
                    appStageCompleted={this.props.appStageCompleted}
                    chartStageCompleted={this.props.chartStageCompleted}
                />
            </React.Fragment>
        }
        else if (this.props.view === AppListViewType.NO_RESULT) {
            return <React.Fragment>
                {this.renderPageHeader()}
                {this.renderSavedFilters()}
                {this.renderRouter()}
                <Empty view={this.props.view}
                    title={"No matching apps"}
                    message={"We couldn't find any matching applications."}
                    buttonLabel={"View All Apps"}
                    clickHandler={this.props.clearAll} />
            </React.Fragment>
        }
        else if (this.props.view === AppListViewType.ERROR) {
            return <React.Fragment>
                {this.renderPageHeader()}
                <ErrorScreenManager code={this.props.code} />
            </React.Fragment>
        }
        else {
            return <React.Fragment>
                {this.renderPageHeader()}
                {this.renderRouter()}
                {this.renderSavedFilters()}
                {this.renderAppList()}
                {this.renderPagination()}
            </React.Fragment>
        }
    }
}