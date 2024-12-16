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

import { Reducer, useEffect, useMemo, useReducer, useRef } from 'react'
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import { showError, ServerErrors, FilterChips } from '@devtron-labs/devtron-fe-common-lib'
import { getInitialJobListState, jobListModal, jobListReducer } from '../Utils'
import {
    JobListPayload,
    JobListProps,
    JobListState,
    JobListStateAction,
    JobListStateActionTypes,
    JobListUrlFiltersType,
} from '../Types'
import { JobListViewType } from '../Constants'
import { getJobs } from '../Service'
import JobListView from './JobListView'
import '../../app/list/list.scss'
import JobListFilters from './JobListFilters'

const JobListContainer = ({
    masterFilters,
    filterConfig,
    clearFilters,
    handleSorting,
    handleSearch,
    jobListCount,
    filtersLoading,
    openJobCreateModel,
    setJobCount,
    updateSearchParams,
    getLabelFromValue,
    changePage,
    changePageSize,
}: JobListProps) => {
    const match = useRouteMatch()
    const location = useLocation()
    const history = useHistory()

    const { searchKey, sortBy, sortOrder, offset, pageSize, status, environment, project } = filterConfig

    const payload: JobListPayload = useMemo(
        () => ({
            appNameSearch: searchKey.toLowerCase(),
            appStatuses: status,
            environments: environment.map((envId) => +envId),
            teams: project.map((projectId) => +projectId),
            offset,
            size: pageSize,
            sortBy,
            sortOrder,
        }),
        [filterConfig],
    )

    const [state, dispatch] = useReducer<Reducer<JobListState, JobListStateAction>>(
        jobListReducer,
        getInitialJobListState(payload),
    )
    const abortControllerRef = useRef<AbortController>(new AbortController())

    const getJobsList = async (request): Promise<void> => {
        const isSearchOrFilterApplied =
            request.appNameSearch?.length ||
            request.teams?.length ||
            request.appStatuses?.length ||
            request.environments?.length
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
                        view,
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

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        getJobsList(payload)
    }, [payload])

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
            state.jobs.forEach((job) => {
                _expandedRow[job.id] = job.ciPipelines.length > 1
            })
        }

        dispatch({
            type: JobListStateActionTypes.multipleOptions,
            payload: { expandedRow: _expandedRow, isAllExpanded: !state.isAllExpanded },
        })
    }

    const handleEditJob = (jobId: number): void => {
        history.push(`/job/${jobId}/edit`)
    }

    return (
        <>
            {state.view !== JobListViewType.EMPTY && state.view !== JobListViewType.ERROR && (
                <>
                    <JobListFilters
                        masterFilters={masterFilters}
                        filterConfig={filterConfig}
                        jobListCount={jobListCount}
                        payload={payload}
                        filtersLoading={filtersLoading}
                        handleSearch={handleSearch}
                        updateSearchParams={updateSearchParams}
                        getLabelFromValue={getLabelFromValue}
                    />
                    <FilterChips<JobListUrlFiltersType>
                        filterConfig={{ status, environment, project }}
                        clearFilters={clearFilters}
                        onRemoveFilter={updateSearchParams}
                        className="px-20"
                        getFormattedValue={getLabelFromValue}
                    />
                </>
            )}
            <JobListView
                {...state}
                match={match}
                location={location}
                history={history}
                expandRow={expandRow}
                closeExpandedRow={closeExpandedRow}
                handleSorting={handleSorting}
                handleEditJob={handleEditJob}
                clearFilters={clearFilters}
                changePage={changePage}
                changePageSize={changePageSize}
                jobListCount={jobListCount}
                openJobCreateModel={openJobCreateModel}
                toggleExpandAllRow={toggleExpandAllRow}
            />
        </>
    )
}

export default JobListContainer
