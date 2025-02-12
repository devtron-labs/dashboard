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

import React from 'react'
import {
    AppStatus,
    ErrorScreenManager,
    Progressing,
    DEFAULT_BASE_PAGE_SIZE,
    Pagination,
    SortableTableHeaderCell,
} from '@devtron-labs/devtron-fe-common-lib'
import { Link, useHistory, useLocation } from 'react-router-dom'
import { trackByGAEvent } from '../../common'
import { ReactComponent as Edit } from '../../../assets/icons/ic-settings.svg'
import { ReactComponent as JobIcon } from '../../../assets/icons/ic-job-node.svg'
import { ReactComponent as Arrow } from '../../../assets/icons/ic-dropdown-filled.svg'
import { SortBy } from '../../app/list/types'
import { Job, JobListViewProps, JobsListSortableKeys } from '../Types'
import { JobListViewType, JOB_LIST_HEADERS } from '../Constants'
import ExpandedRow from '../ExpandedRow/ExpandedRow'
import JobsEmptyState from '../JobsEmptyState'
import { URLS } from '../../../config'
import { environmentName } from '../Utils'
import { DEFAULT_ENV } from '../../app/details/triggerView/Constants'

export default function JobListView(props: JobListViewProps) {
    const history = useHistory()
    const location = useLocation()

    const handleJobNameSorting = () => props.handleSorting(JobsListSortableKeys.APP_NAME)

    const expandEnv = (event): void => {
        event.stopPropagation()
        event.preventDefault()
        props.expandRow(event.currentTarget.dataset.key)
    }

    const handleEditJob = (event): void => {
        event.stopPropagation()
        event.preventDefault()
        trackByGAEvent('Job List', event.currentTarget.dataset.action)
        props.handleEditJob(event.currentTarget.dataset.key)
    }

    const closeExpandedRow = (event): void => {
        props.closeExpandedRow(event.currentTarget.dataset.key)
    }

    const toggleAllExpandRow = () => {
        if (props.isAllExpandable) {
            props.toggleExpandAllRow()
        }
    }

    const arrowIcon = (): string => {
        if (props.isAllExpandable) {
            return props.isAllExpanded ? 'fcn-7' : 'fcn-7 dc__flip-270'
        }
        return 'cursor-not-allowed dc__flip-270'
    }

    const redirectToJobOverview = (job: Job): string => {
        return `${URLS.JOB}/${job.id}/${URLS.APP_OVERVIEW}`
    }

    const renderJobPipelines = () => {
        return props.jobs.map((job) => {
            const len = job.ciPipelines.length > 1
            return (
                <React.Fragment key={job.id}>
                    {!props.expandedRow[job.id] && (
                        <Link
                            to={redirectToJobOverview(job)}
                            className={`app-list__row ${len ? 'dc__hover-icon' : ''}`}
                            data-testid="job-list-row"
                        >
                            <div className="app-list__cell--icon">
                                <div className="icon-dim-24 dc__icon-bg-color br-4 dc__show-first--icon p-4">
                                    <JobIcon className="icon-dim-16" />
                                </div>
                                {len && (
                                    <Arrow
                                        className="icon-dim-24 p-2 dc__flip-270 fcn-7 dc__show-second--icon"
                                        onClick={expandEnv}
                                        data-key={job.id}
                                    />
                                )}
                            </div>
                            <div className="app-list__cell">
                                <p className="dc__truncate-text m-0 value cb-5" data-testid="job-list-for-sort">
                                    {job.name}
                                </p>
                            </div>
                            <div className="app-list__cell">
                                <AppStatus appStatus={job.defaultPipeline.status} isJobView />
                            </div>
                            <div className="app-list__cell">
                                <p className="dc__truncate-text m-0">
                                    {environmentName(job.defaultPipeline)}
                                    {environmentName(job.defaultPipeline) === DEFAULT_ENV && (
                                        <span className="fw-4 fs-11 ml-4 dc__italic-font-style">(Default)</span>
                                    )}
                                </p>
                            </div>
                            <div className="app-list__cell">
                                <p className="dc__truncate-text m-0">{job.defaultPipeline.lastRunAt}</p>
                            </div>
                            <div className="app-list__cell">
                                <p className="dc__truncate-text m-0">{job.defaultPipeline.lastSuccessAt}</p>
                            </div>
                            <div className="app-list__cell app-list__cell--action">
                                <button
                                    data-testid="edit-job-button"
                                    type="button"
                                    data-key={job.id}
                                    className="button-edit"
                                    onClick={handleEditJob}
                                    data-action="Configure Clicked"
                                >
                                    <Edit className="button-edit__icon" />
                                </button>
                            </div>
                        </Link>
                    )}
                    {props.expandedRow[job.id] && (
                        <ExpandedRow job={job} close={closeExpandedRow} handleEdit={props.handleEditJob} />
                    )}
                </React.Fragment>
            )
        })
    }

    const renderJobList = () => {
        if (props.jobs.length <= 0) {
            return null
        }

        return (
            <div className="app-list" data-testid="job-list-container">
                <div className="app-list__header dc__border-bottom dc__position-sticky dc__top-47">
                    <div className="app-list__cell--icon flex left cursor" onClick={toggleAllExpandRow}>
                        <Arrow className={`icon-dim-24 p-2 ${arrowIcon()}`} />
                    </div>
                    <SortableTableHeaderCell
                        triggerSorting={handleJobNameSorting}
                        title={JOB_LIST_HEADERS.Name}
                        disabled={false}
                        isSorted={props.sortRule.key == SortBy.APP_NAME}
                        sortOrder={props.sortRule.order}
                    />
                    <SortableTableHeaderCell isSortable={false} title={JOB_LIST_HEADERS.LastJobStatus} />
                    <SortableTableHeaderCell isSortable={false} title={JOB_LIST_HEADERS.RUN_IN_ENVIRONMENT} />
                    <SortableTableHeaderCell isSortable={false} title={JOB_LIST_HEADERS.LastRunAt} />
                    <SortableTableHeaderCell isSortable={false} title={JOB_LIST_HEADERS.LastSuccessAt} />
                    <div className="app-list__cell app-list__cell--action" />
                </div>
                {renderJobPipelines()}
            </div>
        )
    }

    const renderPagination = () => {
        if (props.size > DEFAULT_BASE_PAGE_SIZE) {
            return (
                <Pagination
                    rootClassName="flex dc__content-space px-20 bg__primary"
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
    }
    if (props.view === JobListViewType.EMPTY || props.view === JobListViewType.NO_RESULT) {
        return (
            <JobsEmptyState
                view={props.view}
                clickHandler={props.view === JobListViewType.EMPTY ? createJobHandler : props.clearFilters}
            />
        )
    }
    if (props.view === JobListViewType.ERROR) {
        return (
            <div className="dc__height-reduce-48">
                <ErrorScreenManager code={props.code} />
            </div>
        )
    }
    return (
        <>
            {renderJobList()}
            {renderPagination()}
        </>
    )
}
