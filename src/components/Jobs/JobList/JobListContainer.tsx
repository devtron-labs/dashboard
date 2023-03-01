import React, { Reducer, useEffect, useReducer, useRef } from 'react'
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import { ServerErrors } from '../../../modals/commonTypes'
import { showError } from '../../common'
import * as queryString from 'query-string'
import { URLS } from '../../../config'
import { getInitialJobListState, jobListModal, jobListReducer, populateQueryString } from '../Utils'
import { Job, JobListProps, JobListState, JobListStateAction, JobListStateActionTypes } from '../Types'
import { JobListViewType } from '../Constants'
import { getJobs } from '../Service'
import JobListView from './JobListView'
import '../../app/list/list.css'

export default function JobListContainer({
    payloadParsedFromUrl,
    clearAllFilters,
    sortJobList,
    jobListCount,
    isSuperAdmin,
    openJobCreateModel,
    setJobCount,
    isArgoInstalled,
    renderMasterFilters,
    renderAppliedFilters,
}: JobListProps) {
    const match = useRouteMatch()
    const location = useLocation()
    const history = useHistory()
    const [state, dispatch] = useReducer<Reducer<JobListState, JobListStateAction>>(
        jobListReducer,
        getInitialJobListState(payloadParsedFromUrl),
    )
    const abortControllerRef = useRef<AbortController>(new AbortController())

    useEffect(() => {
        getJobsList(payloadParsedFromUrl)
    }, [payloadParsedFromUrl])

    const getJobsList = async (request): Promise<void> => {
        const isSearchOrFilterApplied =
            request.appNameSearch?.length || request.teams?.length || request.appStatuses?.length
        const updatedState = { ...state }
        updatedState.view = JobListViewType.LOADING
        updatedState.sortRule = {
            key: request.sortBy,
            order: request.sortOrder,
        }
        updatedState.expandedRow = {}
        updatedState.isAllExpanded = false
        dispatch({
            type: JobListStateActionTypes.multipleOptions,
            payload: updatedState,
        })

        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
            abortControllerRef.current = null
        }
        abortControllerRef.current = new AbortController()

        getJobs(request, { signal: abortControllerRef.current.signal })
            .then((response) => {
                let view = JobListViewType.LIST
                if (response.result.jobCount === 0) {
                    view = isSearchOrFilterApplied ? JobListViewType.NO_RESULT : JobListViewType.EMPTY
                }
                const _jobs = jobListModal(response.result?.jobContainers)
                dispatch({
                    type: JobListStateActionTypes.multipleOptions,
                    payload: {
                        code: response.code,
                        jobs: _jobs,
                        isAllExpandable: _jobs.filter((job) => job.ciPipelines.length > 1).length > 0,
                        view: view,
                        offset: request.offset,
                        size: response.result.jobCount,
                        pageSize: request.size,
                    },
                })
                abortControllerRef.current = null
                setJobCount(response.result.jobCount)
            })
            .catch((errors: ServerErrors) => {
                if (errors.code) {
                    showError(errors)

                    dispatch({
                        type: JobListStateActionTypes.multipleOptions,
                        payload: { code: errors.code, view: JobListViewType.ERROR },
                    })
                }
            })
    }

    const changePage = (pageNo: number): void => {
        const query = populateQueryString(location.search)
        query['offset'] = state.pageSize * (pageNo - 1)

        history.push(`${URLS.JOB}/${URLS.APP_LIST}?${queryString.stringify(query)}`)
    }

    const changePageSize = (size: number): void => {
        const query = populateQueryString(location.search)
        query['offset'] = 0
        query['pageSize'] = size

        history.push(`${URLS.JOB}/${URLS.APP_LIST}?${queryString.stringify(query)}`)
    }

    const expandRow = (id: number): void => {
        dispatch({
            type: JobListStateActionTypes.expandedRow,
            payload: { ...state.expandedRow, [id]: true },
        })
    }

    const closeExpandedRow = (id: number): void => {
        dispatch({
            type: JobListStateActionTypes.expandedRow,
            payload: { ...state.expandedRow, [id]: false },
        })
    }

    const toggleExpandAllRow = (): void => {
        const _expandedRow = {}
        if (!state.isAllExpanded) {
            for (const _job of state.jobs) {
                _expandedRow[_job.id] = _job.ciPipelines.length > 1
            }
        }

        dispatch({
            type: JobListStateActionTypes.multipleOptions,
            payload: { expandedRow: _expandedRow, isAllExpanded: !state.isAllExpanded },
        })
    }

    const handleEditApp = (jobId: number): void => {
        history.push(`/job/${jobId}/edit`)
    }

    const redirectToAppDetails = (job: Job): string => {
        return `/job/${job.id}/overview`
    }

    return (
        <>
            {state.view !== JobListViewType.EMPTY && (
                <>
                    {renderMasterFilters()}
                    {renderAppliedFilters()}
                </>
            )}
            <JobListView
                {...state}
                match={match}
                location={location}
                history={history}
                expandRow={expandRow}
                closeExpandedRow={closeExpandedRow}
                sort={sortJobList}
                redirectToAppDetails={redirectToAppDetails}
                handleEditApp={handleEditApp}
                clearAll={clearAllFilters}
                changePage={changePage}
                changePageSize={changePageSize}
                isSuperAdmin={isSuperAdmin}
                appListCount={jobListCount}
                openJobCreateModel={openJobCreateModel}
                toggleExpandAllRow={toggleExpandAllRow}
                isArgoInstalled={isArgoInstalled}
            />
        </>
    )
}
