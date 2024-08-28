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

import React, { Component } from 'react'
import {
    AppStatus,
    ErrorScreenManager,
    DEFAULT_BASE_PAGE_SIZE,
    Pagination,
    handleUTCTime,
    AppListConstants,
    DATE_TIME_FORMATS,
} from '@devtron-labs/devtron-fe-common-lib'
import { Link } from 'react-router-dom'
import Tippy from '@tippyjs/react'
import { AppListViewType } from '../config'
import { ExpandedRow } from './expandedRow/ExpandedRow'
import { Empty } from './emptyView/Empty'
import { AppListViewProps, OrderBy, SortBy } from './types'
import NodeAppThumbnail from '../../../assets/img/node-app-thumbnail.png'
import DeployCICD from '../../../assets/img/guide-onboard.png'
import { ReactComponent as Edit } from '../../../assets/icons/ic-settings.svg'
import { ReactComponent as DevtronAppIcon } from '../../../assets/icons/ic-devtron-app.svg'
import { ReactComponent as ICHelpOutline } from '../../../assets/icons/ic-help-outline.svg'
import { ReactComponent as ArrowRight } from '../../../assets/icons/ic-arrow-right.svg'
import { ReactComponent as PlayMedia } from '../../../assets/icons/ic-play-media.svg'
import ContentCard from '../../common/ContentCard/ContentCard'
import { DEVTRON_NODE_DEPLOY_VIDEO, URLS } from '../../../config'
import { CardLinkIconPlacement } from '../../common/ContentCard/ContentCard.types'
import { HELM_GUIDED_CONTENT_CARDS_TEXTS } from '../../onboardingGuide/OnboardingGuide.constants'
import {
    APPLIST_EMPTY_STATE_MESSAGING,
    APP_LIST_HEADERS,
    ClearFiltersLabel,
    appListLoading,
} from '../list-new/Constants'
import { ReactComponent as Arrow } from '../../../assets/icons/ic-dropdown-filled.svg'
import moment from 'moment'
export class AppListView extends Component<AppListViewProps> {
    expandEnv = (event): void => {
        event.stopPropagation()
        event.preventDefault()
        this.props.expandRow(event.currentTarget.dataset.key)
    }

    handleEditApp = (event): void => {
        event.stopPropagation()
        event.preventDefault()
        this.props.handleEditApp(event.currentTarget.dataset.key)
    }

    closeExpandedRow = (event): void => {
        this.props.closeExpandedRow(event.currentTarget.dataset.key)
    }

    renderEnvironmentList(app) {
        const len = app.environments.length
        if (len) {
            const isEnvConfigured = app.defaultEnv && app.defaultEnv.name
            return (
                <div className="app-list__cell app-list__cell--env">
                    <p
                        data-testid={`${app.defaultEnv.name}-environment`}
                        className={`app-list__cell--env-text ${isEnvConfigured ? '' : 'not-configured'}`}
                    >
                        {isEnvConfigured ? app.defaultEnv.name : 'Not configured'}
                    </p>
                    {len > 1 ? (
                        <button
                            type="button"
                            className="cell__link fs-13 dc__truncate-text mw-18"
                            data-key={app.id}
                            onClick={this.expandEnv}
                        >
                            +{len - 1} more
                        </button>
                    ) : null}
                </div>
            )
        }
        return <div className="app-list__cell app-list__cell--env" />
    }

    sortByAppName = (e) => {
        e.preventDefault()
        this.props.sort('appNameSort')
    }

    sortByDeployedTime = (e) => {
        e.preventDefault()
        this.props.sort('lastDeployedSort')
    }

    toggleAllExpandRow = () => {
        if (this.props.isAllExpandable) {
            this.props.toggleExpandAllRow()
        }
    }

    arrowIcon = (): string => {
        if (this.props.isAllExpandable) {
            return this.props.isAllExpanded ? 'fcn-7' : 'fcn-7 dc__flip-270'
        }
        return 'cursor-not-allowed dc__flip-270'
    }

    renderAppList() {
        let icon = this.props.sortRule.order == OrderBy.ASC ? '' : 'sort-up'
        return (
            <div className="app-list" data-testid="app-list-container">
                <div className="app-list__header dc__position-sticky dc__top-47">
                    <div className="app-list__cell--icon flex left cursor" onClick={this.toggleAllExpandRow}>
                        <Arrow className={`icon-dim-24 p-2 ${this.arrowIcon()}`} />
                    </div>
                    <div className="app-list__cell app-list__cell--name  ">
                        <button
                            className="app-list__cell-header flex"
                            onClick={this.sortByAppName}
                            data-testid="appname"
                        >
                            {APP_LIST_HEADERS.AppName}
                            {this.props.sortRule.key === SortBy.APP_NAME ? (
                                <span data-testid="sort-app-name-list" className={` sort ${icon} ml-4`} />
                            ) : (
                                <span className="sort-col dc__opacity-0_5 ml-4" />
                            )}
                        </button>
                    </div>
                    {this.props.isArgoInstalled && (
                        <div className="app-list__cell app-list__cell--app_status">
                            <span className="app-list__cell-header" data-testid="appstatus">
                                {APP_LIST_HEADERS.AppStatus}
                            </span>
                        </div>
                    )}
                    <div className="app-list__cell app-list__cell--env">
                        <span className="app-list__cell-header mr-4" data-testid="environment">
                            {APP_LIST_HEADERS.Environment}
                        </span>
                        <Tippy
                            data-testid="env-tippy"
                            className="default-tt w-200"
                            arrow
                            placement="top"
                            content="Environment is a unique combination of cluster and namespace"
                        >
                            <div className="flex">
                                <ICHelpOutline className="icon-dim-16" />
                            </div>
                        </Tippy>
                    </div>
                    <div className="app-list__cell app-list__cell--cluster">
                        <span className="app-list__cell-header" data-testid="cluster">
                            {APP_LIST_HEADERS.Cluster}
                        </span>
                    </div>
                    <div className="app-list__cell app-list__cell--namespace">
                        <span className="app-list__cell-header" data-testid="namespace">
                            {APP_LIST_HEADERS.Namespace}
                        </span>
                    </div>
                    <div className="app-list__cell app-list__cell--time ">
                        <button
                            className="app-list__cell-header flex dc__visible-hover dc__visible-hover--parent "
                            onClick={this.sortByDeployedTime}
                            data-testid="lastdeployedate"
                        >
                            {APP_LIST_HEADERS.LastDeployedAt}

                            {this.props.sortRule.key === SortBy.LAST_DEPLOYED ? (
                                <span
                                    data-testid="sort-app-name-list"
                                    className={` sort ${
                                        this.props.sortRule.order == OrderBy.ASC ? 'sort-up' : ''
                                    } ml-4`}
                                />
                            ) : (
                                <span className="sort-col dc__opacity-0_5 ml-4" />
                            )}
                        </button>
                    </div>
                    <div className="app-list__cell app-list__cell--action" />
                </div>
                {this.props.view === AppListViewType.LOADING ? (
                    <div className="cn-9 fs-13 fw-4 lh-20 show-shimmer-loading">
                        {appListLoading.map((eachRow) => (
                            <div className="pl-20 resource-list__table-row" key={eachRow.id}>
                                {Object.keys(eachRow).map((eachKey) => (
                                    <div className="child child-shimmer-loading" key={eachKey} />
                                ))}
                            </div>
                        ))}
                    </div>
                ) : (
                    this.props.apps.map((app) => {
                        const len = app.environments.length > 1
                        return (
                            <React.Fragment key={app.id}>
                                {!this.props.expandedRow[app.id] ? (
                                    <Link
                                        to={this.props.redirectToAppDetails(app, app.defaultEnv.id)}
                                        className={`app-list__row ${len ? 'dc__hover-icon' : ''}`}
                                        data-testid="app-list-row"
                                    >
                                        <div className="app-list__cell--icon">
                                            <DevtronAppIcon className="icon-dim-24 dc__show-first--icon" />
                                            {len && (
                                                <Arrow
                                                    className="icon-dim-24 p-2 dc__flip-270 fcn-7 dc__show-second--icon"
                                                    onClick={this.expandEnv}
                                                    data-key={app.id}
                                                />
                                            )}
                                        </div>
                                        <div className="app-list__cell app-list__cell--name">
                                            <p className="dc__truncate-text m-0 value" data-testid="app-list-for-sort">
                                                {app.name}
                                            </p>
                                        </div>
                                        {this.props.isArgoInstalled && (
                                            <div
                                                className="app-list__cell app-list__cell--app_status"
                                                data-testid="devtron-app-status"
                                            >
                                                <AppStatus
                                                    appStatus={app.defaultEnv.appStatus}
                                                    isVirtualEnv={app.defaultEnv.isVirtualEnvironment}
                                                />
                                            </div>
                                        )}
                                        {this.renderEnvironmentList(app)}
                                        <div className="app-list__cell app-list__cell--cluster">
                                            <p
                                                data-testid={`${app.defaultEnv.clusterName}-cluster`}
                                                className="dc__truncate-text  m-0"
                                            >
                                                {app.defaultEnv ? app.defaultEnv.clusterName : ''}
                                            </p>
                                        </div>
                                        <div className="app-list__cell app-list__cell--namespace">
                                            <p
                                                data-testid={`${app.defaultEnv.namespace}-namespace`}
                                                className="dc__truncate-text  m-0"
                                            >
                                                {app.defaultEnv ? app.defaultEnv.namespace : ''}
                                            </p>
                                        </div>
                                        <div className="app-list__cell app-list__cell--time">
                                            {app.defaultEnv && app.defaultEnv.lastDeployedTime && (
                                                <Tippy
                                                    className="default-tt"
                                                    arrow={true}
                                                    placement="top"
                                                    content={moment(app.defaultEnv.lastDeployedTime).format(
                                                        DATE_TIME_FORMATS.TWELVE_HOURS_FORMAT,
                                                    )}
                                                >
                                                    <p
                                                        className="dc__truncate-text  m-0"
                                                        data-testid="last-deployed-time"
                                                    >
                                                        {handleUTCTime(app.defaultEnv.lastDeployedTime, true)}
                                                    </p>
                                                </Tippy>
                                            )}
                                        </div>
                                        <div className="app-list__cell app-list__cell--action">
                                            <button
                                                data-testid="edit-app-button"
                                                type="button"
                                                data-key={app.id}
                                                className="button-edit"
                                                onClick={this.handleEditApp}
                                            >
                                                <Edit className="button-edit__icon" />
                                            </button>
                                        </div>
                                    </Link>
                                ) : null}
                                {this.props.expandedRow[app.id] && (
                                    <ExpandedRow
                                        app={app}
                                        close={this.closeExpandedRow}
                                        redirect={this.props.redirectToAppDetails}
                                        handleEdit={this.props.handleEditApp}
                                        isArgoInstalled={this.props.isArgoInstalled}
                                    />
                                )}
                            </React.Fragment>
                        )
                    })
                )}
            </div>
        )
    }

    renderPagination() {
        if (this.props.size > DEFAULT_BASE_PAGE_SIZE) {
            return (
                <Pagination
                    rootClassName="flex dc__content-space px-20 dc__border-top"
                    size={this.props.size}
                    pageSize={this.props.pageSize}
                    offset={this.props.offset}
                    changePage={this.props.changePage}
                    changePageSize={this.props.changePageSize}
                />
            )
        }
    }

    renderGuidedCards() {
        return (
            <div className="devtron-app-guided-cards-container">
                <h2 className="fs-24 fw-6 lh-32 m-0 pt-40 dc__align-center">Create your first application</h2>
                <div className="devtron-app-guided-cards-wrapper">
                    <ContentCard
                        datatestid="deploy-basic-k8snode"
                        redirectTo={DEVTRON_NODE_DEPLOY_VIDEO}
                        isExternalRedirect
                        imgSrc={NodeAppThumbnail}
                        title={HELM_GUIDED_CONTENT_CARDS_TEXTS.WatchVideo.title}
                        linkText={HELM_GUIDED_CONTENT_CARDS_TEXTS.WatchVideo.linkText}
                        LinkIcon={PlayMedia}
                        linkIconClass="scb-5 mr-8"
                        linkIconPlacement={CardLinkIconPlacement.BeforeLink}
                    />
                    <ContentCard
                        datatestid="create-application"
                        redirectTo={`${URLS.APP}/${URLS.APP_LIST}/${AppListConstants.AppType.DEVTRON_APPS}/${AppListConstants.CREATE_DEVTRON_APP_URL}`}
                        rootClassName="ev-5"
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
        if (this.props.view === AppListViewType.EMPTY) {
            return this.renderGuidedCards()
        }
        if (this.props.view === AppListViewType.NO_RESULT) {
            return (
                <Empty
                    view={this.props.view}
                    title={APPLIST_EMPTY_STATE_MESSAGING.noAppsFound}
                    message={APPLIST_EMPTY_STATE_MESSAGING.noAppsFoundInfoText}
                    buttonLabel={ClearFiltersLabel}
                    clickHandler={this.props.clearAll}
                />
            )
        }
        if (this.props.view === AppListViewType.ERROR) {
            return <ErrorScreenManager heightToDeduct={172} code={this.props.code} />
        }
        return (
            <>
                {this.renderAppList()}
                {this.renderPagination()}
            </>
        )
    }
}
export default AppListView
