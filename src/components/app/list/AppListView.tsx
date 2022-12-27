import React, { Component } from 'react';
import { AppListViewType } from '../config';
import { ErrorScreenManager, Pagination, Progressing, handleUTCTime } from '../../common';
import { Link } from 'react-router-dom';
import { ExpandedRow } from './expandedRow/ExpandedRow';
import { Empty } from './emptyView/Empty';
import { AppListViewProps, OrderBy, SortBy } from './types';
import NodeAppThumbnail from '../../../assets/img/node-app-thumbnail.png'
import DeployCICD from '../../../assets/img/guide-onboard.png'
import { ReactComponent as Edit } from '../../../assets/icons/ic-settings.svg';
import {ReactComponent as DevtronAppIcon} from '../../../assets/icons/ic-devtron-app.svg';
import {ReactComponent as HelpOutlineIcon} from '../../../assets/icons/ic-help-outline.svg';
import { ReactComponent as ArrowRight } from '../../../assets/icons/ic-arrow-right.svg'
import { ReactComponent as PlayMedia } from '../../../assets/icons/ic-play-media.svg'
import Tippy from '@tippyjs/react';
import ContentCard from '../../common/ContentCard/ContentCard';
import { AppListConstants, DEVTRON_NODE_DEPLOY_VIDEO, URLS } from '../../../config';
import { CardLinkIconPlacement } from '../../common/ContentCard/ContentCard.types';
import { HELM_GUIDED_CONTENT_CARDS_TEXTS } from '../../onboardingGuide/OnboardingGuide.constants';

export class AppListView extends Component<AppListViewProps>{

    renderEnvironmentList(app) {
        let len = app.environments.length;
        if (len) {
            let isEnvConfigured = app.defaultEnv && app.defaultEnv.name;
            return <div className="app-list__cell app-list__cell--env">
                <p  className={`app-list__cell--env-text ${isEnvConfigured ? '' : 'not-configured'}`}>{isEnvConfigured ? app.defaultEnv.name  : "Not configured"}</p>
                {len > 1 ? <button type="button" className="cell__link"
                    onClick={(event) => { event.stopPropagation(); event.preventDefault(); this.props.expandRow(app); }}>
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
                    <div className="app-list__cell--icon"></div>
                    <div className="app-list__cell app-list__cell--name">
                        <button className="app-list__cell-header" onClick={e => { e.preventDefault(); this.props.sort('appNameSort') }}>App name
                            {this.props.sortRule.key == SortBy.APP_NAME ? <span className={icon}></span> : <span className="sort-col"></span>}
                        </button>
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
                    return <React.Fragment key={app.id} >
                        {!(this.props.appData && this.props.appData.id == app.id) ?
                            <Link to={this.props.redirectToAppDetails(app, app.defaultEnv.id)} className="app-list__row">
                                <div className="app-list__cell--icon">
                                    <DevtronAppIcon className="icon-dim-24"/>
                                </div>
                                <div className="app-list__cell app-list__cell--name">
                                    <p className="dc__truncate-text  m-0 value">{app.name}</p>
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
                        {(this.props.appData && this.props.appData.id == app.id) ?
                            <ExpandedRow app={this.props.appData}
                                close={this.props.closeExpandedRow}
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

    renderGuidedCards() {
        return (
            <div className="devtron-app-guided-cards-container">
                <h2 className="fs-24 fw-6 lh-32 m-0 pt-40 dc__align-center">Create your first application</h2>
                <div className="devtron-app-guided-cards-wrapper">
                    <ContentCard
                        redirectTo={DEVTRON_NODE_DEPLOY_VIDEO}
                        isExternalRedirect={true}
                        imgSrc={NodeAppThumbnail}
                        title={HELM_GUIDED_CONTENT_CARDS_TEXTS.WatchVideo.title}
                        linkText={HELM_GUIDED_CONTENT_CARDS_TEXTS.WatchVideo.linkText}
                        LinkIcon={PlayMedia}
                        linkIconClass="scb-5 mr-8"
                        linkIconPlacement={CardLinkIconPlacement.BeforeLink}
                    />
                    <ContentCard
                        redirectTo={`${URLS.APP}/${URLS.APP_LIST}/${AppListConstants.AppType.DEVTRON_APPS}/${AppListConstants.CREATE_DEVTRON_APP_URL}`}
                        imgSrc={DeployCICD}
                        title={HELM_GUIDED_CONTENT_CARDS_TEXTS.StackManager.title}
                        linkText={HELM_GUIDED_CONTENT_CARDS_TEXTS.StackManager.createLintText}
                        LinkIcon={ArrowRight}
                        linkIconClass="scb-5"
                        linkIconPlacement={CardLinkIconPlacement.AfterLinkApart}
                    />
                </div>
            </div>
        )
    }

    render() {
        if (this.props.view === AppListViewType.LOADING) {
            return (
                <div className="dc__loading-wrapper">
                    <Progressing pageLoader />
                </div>
            )
        } else if (this.props.view === AppListViewType.EMPTY) {
            return this.renderGuidedCards()
        } else if (this.props.view === AppListViewType.NO_RESULT) {
            return (
                <Empty
                    view={this.props.view}
                    title={'No apps found'}
                    message={"We couldn't find any matching applications."}
                    buttonLabel={'Clear filters'}
                    clickHandler={this.props.clearAll}
                />
            )
        } else if (this.props.view === AppListViewType.ERROR) {
            return (
                <div className="dc__loading-wrapper">
                    <ErrorScreenManager code={this.props.code} />
                </div>
            )
        } else {
            return (
                <React.Fragment>
                    {this.renderAppList()}
                    {this.renderPagination()}
                </React.Fragment>
            )
        }
    }
}