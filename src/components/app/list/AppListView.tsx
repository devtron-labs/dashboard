import React, { Component } from 'react';
import { AppListViewType } from '../config';
import { ErrorScreenManager, Pagination, Progressing, handleUTCTime } from '../../common';
import { Link, RouteComponentProps } from 'react-router-dom';
import { ExpandedRow } from './expandedRow/ExpandedRow';
import { Empty } from './emptyView/Empty';
import { App, AppListState, AppListViewProps, OrderBy, SortBy } from './types';
import { ReactComponent as Edit } from '../../../assets/icons/ic-settings.svg';
import {ReactComponent as DevtronAppIcon} from '../../../assets/icons/ic-devtron-app.svg';
import {ReactComponent as HelpOutlineIcon} from '../../../assets/icons/ic-help-outline.svg';
import Tippy from '@tippyjs/react';
import DevtronAppGuidePage from '../../onboardingGuide/DevtronAppGuidePage';
import AppStatus from '../AppStatus';
import { ReactComponent as Arrow} from '../../../assets/icons/ic-dropdown-filled.svg'

export class AppListView extends Component<AppListViewProps>{

    expandEnv = (event,id) => {
        event.stopPropagation()
        event.preventDefault()
        this.props.expandRow(id)
    }
    
    renderEnvironmentList(app) {
        let len = app.environments.length;
        if (len) {
            let isEnvConfigured = app.defaultEnv && app.defaultEnv.name;
            return <div className="app-list__cell app-list__cell--env">
                <p  className={`app-list__cell--env-text ${isEnvConfigured ? '' : 'not-configured'}`}>{isEnvConfigured ? app.defaultEnv.name  : "Not configured"}</p>
                {len > 1 ? <button type="button" className="cell__link"
                    onClick={(event) => this.expandEnv(event,app.id)}>
                    +{len - 1} more </button> : null}
            </div>
        }
        else return <div className="app-list__cell app-list__cell--env"></div>
    }

    renderAppList() {
        if (this.props.apps.length) {
            let icon = this.props.sortRule.order == OrderBy.ASC ? "sort-up" : "sort-down";
            return <div className="app-list">
                <div className="app-list__header">
                    <div className="app-list__cell--icon flex left cursor" onClick={ this.props.isAllExpandable && this.props.toggleExpandAllRow}><Arrow className={`icon-dim-20 ${this.props.isAllExpandable ? (this.props.isAllExpanded ? 'fcn-7' : 'fcn-7 dc__flip-90') : 'dc__flip-90'}`} /></div>
                    <div className="app-list__cell app-list__cell--name">
                        <button className="app-list__cell-header flex" onClick={e => { e.preventDefault(); this.props.sort('appNameSort') }}>App name
                            {this.props.sortRule.key == SortBy.APP_NAME ? <span className={`${icon} ml-4`}></span> : <span className="sort-col"></span>}
                        </button>
                    </div>
                    <div className="app-list__cell app-list__cell--app_status">
                        <span className="app-list__cell-header">App status</span>
                    </div>
                    <div className="app-list__cell app-list__cell--env">
                        <span className="app-list__cell-header mr-4">Environment</span>
                        <Tippy className="default-tt" arrow={true} placement="top" content="Environment is a unique combination of cluster and namespace">
                            <HelpOutlineIcon className="icon-dim-20"/>
                        </Tippy>
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
                    <div className="app-list__cell app-list__cell--action"></div>
                </div>
                {this.props.apps.map((app) => {
                    let len = app.environments.length > 1;
                    return <React.Fragment key={app.id} >
                        {!(this.props.expandedRow[app.id]) ?
                            <Link to={this.props.redirectToAppDetails(app, app.defaultEnv.id)} className={`app-list__row ${len ? 'dc__hover-icon' : ''}`}>
                                <div className="app-list__cell--icon">
                                    <DevtronAppIcon className="icon-dim-24 dc__show-first--icon"/>
                                    {len && <Arrow className="icon-dim-20 dc__flip-90 fcn-7 dc__show-second--icon" onClick={(event) => this.expandEnv(event,app.id)} />}
                                </div>
                                <div className="app-list__cell app-list__cell--name">
                                    <p className="dc__truncate-text  m-0 value">{app.name}</p>
                                </div>
                                <div className="app-list__cell app-list__cell--app_status">
                                    <AppStatus appStatus={app.defaultEnv.appStatus} />
                                </div>
                                {this.renderEnvironmentList(app)}
                                <div className="app-list__cell app-list__cell--cluster">
                                    <p className="dc__truncate-text  m-0"> {app.defaultEnv ? app.defaultEnv.clusterName : ""}</p>
                                </div>
                                <div className="app-list__cell app-list__cell--namespace">
                                    <p className="dc__truncate-text  m-0"> {app.defaultEnv ? app.defaultEnv.namespace : ""}</p>
                                </div>
                                <div className="app-list__cell app-list__cell--time">
                                    {app.defaultEnv && app.defaultEnv.lastDeployedTime &&
                                        <Tippy className="default-tt" arrow={true} placement="top" content={app.defaultEnv.lastDeployedTime}>
                                            <p className="dc__truncate-text  m-0">{handleUTCTime(app.defaultEnv.lastDeployedTime, true)}</p>
                                        </Tippy>
                                    }
                                </div>
                                <div className="app-list__cell app-list__cell--action">
                                    <button type="button" className="button-edit" onClick={(event) => { event.stopPropagation(); event.preventDefault(); this.props.handleEditApp(app.id) }}>
                                        <Edit className="button-edit__icon" />
                                    </button>
                                </div>
                            </Link>
                            : null}
                        {(this.props.expandedRow[app.id]) ?
                            <ExpandedRow app={app}
                                close={() => this.props.closeExpandedRow(app.id)}
                                redirect={this.props.redirectToAppDetails}
                                handleEdit={(event) => this.props.handleEditApp(app.id)} />
                            : null}
                    </React.Fragment>
                })}
            </div>
        }
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
                <div className="dc__loading-wrapper">
                    <Progressing pageLoader />
                </div>
            </React.Fragment>
        }

        else if (this.props.view === AppListViewType.EMPTY) {
            return <React.Fragment>
                <DevtronAppGuidePage openDevtronAppCreateModel={this.props.openDevtronAppCreateModel} />
            </React.Fragment>
        }

        else if (this.props.view === AppListViewType.NO_RESULT) {
            return <React.Fragment>
                <Empty view={this.props.view}
                    title={"No apps found"}
                    message={"We couldn't find any matching applications."}
                    buttonLabel={"Clear filters"}
                    clickHandler={this.props.clearAll} />
            </React.Fragment>
        }
        else if (this.props.view === AppListViewType.ERROR) {
            return <React.Fragment>
                <div className="dc__loading-wrapper">
                    <ErrorScreenManager code={this.props.code} />
                </div>
            </React.Fragment>
        }
        else {
            return <React.Fragment>
                {this.renderAppList()}
                {this.renderPagination()}
            </React.Fragment>
        }
    }
}