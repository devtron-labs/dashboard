import React, { Reducer, useEffect, useReducer, useRef } from 'react'
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import { ServerErrors } from '../../../modals/commonTypes'
import { showError } from '../../common'
import * as queryString from 'query-string'
import { URLS } from '../../../config'
import { getInitialJobListState, jobListModal, jobListReducer } from '../Utils'
import { Job, JobListProps, JobListState, JobListStateAction, JobListStateActionTypes } from '../Types'
import { JobListViewType } from '../Constants'
import { getJobs } from '../Service'
import JobListView from './JobListView'
import '../../app/list/list.css'

export default function JobListContainer(props: JobListProps) {
    const match = useRouteMatch()
    const location = useLocation()
    const history = useHistory()
    const [state, dispatch] = useReducer<Reducer<JobListState, JobListStateAction>>(
        jobListReducer,
        getInitialJobListState(props.payloadParsedFromUrl),
    )
    const abortControllerRef = useRef<AbortController>(new AbortController())

    useEffect(() => {
        getJobsList(props.payloadParsedFromUrl)
    }, [props.payloadParsedFromUrl])

    const getJobsList = async (request): Promise<void> => {
        props.updateDataSyncing(true)
        const isSearchOrFilterApplied =
            request.teams?.length || request.jobNameSearch?.length || request.appStatuses?.length
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
                    if (isSearchOrFilterApplied) {
                        view = JobListViewType.NO_RESULT
                    } else {
                        view = JobListViewType.EMPTY
                    }
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
                props.setJobCount(response.result.jobCount)
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
            .finally(() => {
                props.updateDataSyncing(false)
            })
    }

    const changePage = (pageNo: number): void => {
        let offset = state.pageSize * (pageNo - 1)
        let qs = queryString.parse(location.search)
        let keys = Object.keys(qs)
        let query = {}
        keys.map((key) => {
            query[key] = qs[key]
        })
        query['offset'] = offset
        let queryStr = queryString.stringify(query)
        let url = `${URLS.APP}/${URLS.APP_LIST}/${URLS.APP_LIST_DEVTRON}?${queryStr}`
        history.push(url)
    }

    const changePageSize = (size: number): void => {
        let qs = queryString.parse(location.search)
        let keys = Object.keys(qs)
        let query = {}
        keys.map((key) => {
            query[key] = qs[key]
        })
        query['offset'] = 0
        query['hOffset'] = 0
        query['pageSize'] = size
        let queryStr = queryString.stringify(query)
        let url = `${URLS.APP}/${URLS.APP_LIST}/${URLS.APP_LIST_DEVTRON}?${queryStr}`
        history.push(url)
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
        <JobListView
            {...state}
            match={match}
            location={location}
            history={history}
            expandRow={expandRow}
            closeExpandedRow={closeExpandedRow}
            sort={props.sortApplicationList}
            redirectToAppDetails={redirectToAppDetails}
            handleEditApp={handleEditApp}
            clearAll={props.clearAllFilters}
            changePage={changePage}
            changePageSize={changePageSize}
            isSuperAdmin={props.isSuperAdmin}
            appListCount={props.jobListCount}
            openDevtronAppCreateModel={props.openDevtronAppCreateModel}
            updateDataSyncing={props.updateDataSyncing}
            toggleExpandAllRow={toggleExpandAllRow}
            isArgoInstalled={props.isArgoInstalled}
        />
    )
}
