import React, { Component } from 'react'
import { ErrorScreenManager, Pagination, Progressing, handleUTCTime } from '../../common'
import { Link } from 'react-router-dom'
import NodeAppThumbnail from '../../../assets/img/node-app-thumbnail.png'
import DeployCICD from '../../../assets/img/guide-onboard.png'
import { ReactComponent as Edit } from '../../../assets/icons/ic-settings.svg'
import { ReactComponent as DevtronAppIcon } from '../../../assets/icons/ic-devtron-app.svg'
import { ReactComponent as HelpOutlineIcon } from '../../../assets/icons/ic-help-outline.svg'
import { ReactComponent as ArrowRight } from '../../../assets/icons/ic-arrow-right.svg'
import { ReactComponent as PlayMedia } from '../../../assets/icons/ic-play-media.svg'
import Tippy from '@tippyjs/react'
import ContentCard from '../../common/ContentCard/ContentCard'
import { AppListConstants, DEVTRON_NODE_DEPLOY_VIDEO, URLS } from '../../../config'
import { CardLinkIconPlacement } from '../../common/ContentCard/ContentCard.types'
import { HELM_GUIDED_CONTENT_CARDS_TEXTS } from '../../onboardingGuide/OnboardingGuide.constants'
import { ReactComponent as Arrow } from '../../../assets/icons/ic-dropdown-filled.svg'
import { OrderBy, SortBy } from '../../app/list/types'
import { APPLIST_EMPTY_STATE_MESSAGING, ClearFiltersLabel } from '../../app/list-new/Constants'
import AppStatus from '../../app/AppStatus'
import { Empty } from '../../app/list/emptyView/Empty'
import { JobListViewProps } from '../Types'
import { JobListViewType, JOB_LIST_HEADERS } from '../Constants'
import ExpandedRow from '../ExpandedRow/ExpandedRow'

export default function JobListView(props: JobListViewProps) {
    const expandEnv = (event): void => {
        event.stopPropagation()
        event.preventDefault()
        props.expandRow(event.currentTarget.dataset.key)
    }

    const handleEditApp = (event): void => {
        event.stopPropagation()
        event.preventDefault()
        props.handleEditApp(event.currentTarget.dataset.key)
    }

    const closeExpandedRow = (event): void => {
        props.closeExpandedRow(event.currentTarget.dataset.key)
    }

    const renderCIPipelinesList = (job) => {
        const len = job.ciPipelines.length
        if (len) {
            const isEnvConfigured = job.defaultPipeline?.name
            return (
                <div className="app-list__cell app-list__cell--env">
                    <p className={`app-list__cell--env-text ${isEnvConfigured ? '' : 'not-configured'}`}>
                        {isEnvConfigured ? job.defaultPipeline.name : 'Not configured'}
                    </p>
                    {len > 1 ? (
                        <button type="button" className="cell__link fs-13" data-key={job.id} onClick={expandEnv}>
                            +{len - 1} more
                        </button>
                    ) : null}
                </div>
            )
        } else {
            return <div className="app-list__cell app-list__cell--env"></div>
        }
    }

    const sortByAppName = (e) => {
        e.preventDefault()
        props.sort('appNameSort')
    }

    const toggleAllExpandRow = () => {
        if (props.isAllExpandable) {
            props.toggleExpandAllRow()
        }
    }

    const arrowIcon = (): string => {
        if (props.isAllExpandable) {
            return props.isAllExpanded ? 'fcn-7' : 'fcn-7 dc__flip-90'
        } else {
            return 'cursor-not-allowed dc__flip-90'
        }
    }

    const renderAppList = () => {
        if (props.jobs.length) {
            let icon = props.sortRule.order == OrderBy.ASC ? 'sort-up' : ''
            return (
                <div className="app-list">
                    <div className="app-list__header">
                        <div className="app-list__cell--icon flex left cursor" onClick={toggleAllExpandRow}>
                            <Arrow className={`icon-dim-24 p-2 ${arrowIcon()}`} />
                        </div>
                        <div className="app-list__cell app-list__cell--name">
                            <button className="app-list__cell-header flex" onClick={sortByAppName}>
                                {JOB_LIST_HEADERS.Name}
                                {props.sortRule.key == SortBy.APP_NAME ? (
                                    <span className={`sort ${icon} ml-4`}></span>
                                ) : (
                                    <span className="sort-col"></span>
                                )}
                            </button>
                        </div>
                        <div className="app-list__cell app-list__cell--app_status">
                            <span className="app-list__cell-header">{JOB_LIST_HEADERS.LastJobStatus}</span>
                        </div>
                        <div className="app-list__cell app-list__cell--cluster">
                            <span className="app-list__cell-header">{JOB_LIST_HEADERS.LastRunAt}</span>
                        </div>
                        <div className="app-list__cell app-list__cell--cluster">
                            <span className="app-list__cell-header">{JOB_LIST_HEADERS.LastSuccessAt}</span>
                        </div>
                        <div className="app-list__cell app-list__cell--cluster">
                            <span className="app-list__cell-header">{JOB_LIST_HEADERS.Description}</span>
                        </div>
                        <div className="app-list__cell app-list__cell--action"></div>
                    </div>
                    {props.jobs.map((job) => {
                        const len = job.ciPipelines.length > 1
                        return (
                            <React.Fragment key={job.id}>
                                {!props.expandedRow[job.id] && (
                                    <Link
                                        to={props.redirectToAppDetails(job)}
                                        className={`app-list__row ${len ? 'dc__hover-icon' : ''}`}
                                    >
                                        <div className="app-list__cell--icon">
                                            <DevtronAppIcon className="icon-dim-24 dc__show-first--icon" />
                                            {len && (
                                                <Arrow
                                                    className="icon-dim-24 p-2 dc__flip-90 fcn-7 dc__show-second--icon"
                                                    onClick={expandEnv}
                                                    data-key={job.id}
                                                />
                                            )}
                                        </div>
                                        <div className="app-list__cell app-list__cell--name">
                                            <p className="dc__truncate-text  m-0 value">{job.name}</p>
                                        </div>
                                        <div className="app-list__cell app-list__cell--app_status">
                                            <AppStatus appStatus={job.defaultPipeline.status} isJobCreateView={true} />
                                        </div>
                                        <div className="app-list__cell app-list__cell--cluster">
                                            <p className="dc__truncate-text  m-0">
                                                {job.defaultPipeline.lastRunAt
                                                    ? handleUTCTime(job.defaultPipeline.lastRunAt, true)
                                                    : '-'}
                                            </p>
                                        </div>
                                        <div className="app-list__cell app-list__cell--namespace">
                                            <p className="dc__truncate-text  m-0">
                                                {job.defaultPipeline.lastSuccessAt
                                                    ? handleUTCTime(job.defaultPipeline.lastSuccessAt, true)
                                                    : '-'}
                                            </p>
                                        </div>
                                        <div className="app-list__cell app-list__cell--namespace">
                                            <p className="dc__truncate-text  m-0">
                                                {job.description ? job.description : '-'}
                                            </p>
                                        </div>
                                        <div className="app-list__cell app-list__cell--action">
                                            <button
                                                type="button"
                                                data-key={job.id}
                                                className="button-edit"
                                                onClick={handleEditApp}
                                            >
                                                <Edit className="button-edit__icon" />
                                            </button>
                                        </div>
                                    </Link>
                                )}
                                {props.expandedRow[job.id] && (
                                    <ExpandedRow
                                        job={job}
                                        close={closeExpandedRow}
                                        redirect={props.redirectToAppDetails}
                                        handleEdit={props.handleEditApp}
                                        isArgoInstalled={props.isArgoInstalled}
                                    />
                                )}
                            </React.Fragment>
                        )
                    })}
                </div>
            )
        }
    }

    const renderPagination = () => {
        if (props.size > 20) {
            return (
                <Pagination
                    size={props.size}
                    pageSize={props.pageSize}
                    offset={props.offset}
                    changePage={props.changePage}
                    changePageSize={props.changePageSize}
                />
            )
        }
    }

    const renderGuidedCards = () => {
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

    if (props.view === JobListViewType.LOADING) {
        return (
            <div className="dc__loading-wrapper">
                <Progressing pageLoader />
            </div>
        )
    } else if (props.view === JobListViewType.EMPTY) {
        return renderGuidedCards()
    } else if (props.view === JobListViewType.NO_RESULT) {
        return (
            <Empty
                view={props.view}
                title={APPLIST_EMPTY_STATE_MESSAGING.noAppsFound}
                message={APPLIST_EMPTY_STATE_MESSAGING.noAppsFoundInfoText}
                buttonLabel={ClearFiltersLabel}
                clickHandler={props.clearAll}
            />
        )
    } else if (props.view === JobListViewType.ERROR) {
        return (
            <div className="dc__loading-wrapper">
                <ErrorScreenManager code={props.code} />
            </div>
        )
    } else {
        return (
            <>
                {renderAppList()}
                {renderPagination()}
            </>
        )
    }
}
