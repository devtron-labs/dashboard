import React from 'react'
import { ErrorScreenManager, Pagination, Progressing } from '../../common'
import { Link, useHistory, useLocation } from 'react-router-dom'
import { ReactComponent as Edit } from '../../../assets/icons/ic-settings.svg'
import { ReactComponent as DevtronAppIcon } from '../../../assets/icons/ic-devtron-app.svg'
import { ReactComponent as Arrow } from '../../../assets/icons/ic-dropdown-filled.svg'
import { OrderBy, SortBy } from '../../app/list/types'
import AppStatus from '../../app/AppStatus'
import { JobListViewProps } from '../Types'
import { JobListViewType, JOB_LIST_HEADERS } from '../Constants'
import ExpandedRow from '../ExpandedRow/ExpandedRow'
import JobsEmptyState from '../JobsEmptyState'
import { URLS } from '../../../config'

export default function JobListView(props: JobListViewProps) {
    const history = useHistory()
    const location = useLocation()

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

    const renderJobPipelines = () => {
        return props.jobs.map((job) => {
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
                                <p className="dc__truncate-text  m-0">{job.defaultPipeline.lastRunAt}</p>
                            </div>
                            <div className="app-list__cell app-list__cell--namespace">
                                <p className="dc__truncate-text  m-0">{job.defaultPipeline.lastSuccessAt}</p>
                            </div>
                            <div className="app-list__cell app-list__cell--namespace">
                                <p className="dc__truncate-text  m-0">{job.description ? job.description : '-'}</p>
                            </div>
                            <div className="app-list__cell app-list__cell--action">
                                <button type="button" data-key={job.id} className="button-edit" onClick={handleEditApp}>
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
        })
    }

    const renderAppList = () => {
        if (props.jobs.length) {
            let icon = props.sortRule.order == OrderBy.ASC ? 'sort-up' : ''
            return (
                <div className="app-list">
                    <div className="app-list__header dc__border-bottom">
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
                    {renderJobPipelines()}
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

    const createJobHandler = () => {
        history.push(`${URLS.JOB}/${URLS.APP_LIST}/${URLS.CREATE_JOB}${location.search}`)
    }

    if (props.view === JobListViewType.LOADING) {
        return (
            <div className="dc__loading-wrapper">
                <Progressing pageLoader />
            </div>
        )
    } else if (props.view === JobListViewType.EMPTY || props.view === JobListViewType.NO_RESULT) {
        return (
            <JobsEmptyState
                view={props.view}
                clickHandler={props.view === JobListViewType.EMPTY ? createJobHandler : props.clearAll}
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
