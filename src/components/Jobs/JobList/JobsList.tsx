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

import { useEffect, useMemo, useState } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'

import {
    BASE_ROUTES,
    DevtronProgressing,
    ErrorScreenManager,
    HeaderWithCreateButton,
    ROUTER_URLS,
    ServerErrors,
    showError,
    useUrlFilters,
} from '@devtron-labs/devtron-fe-common-lib'

import { CreateAppModal } from '@Pages/App/CreateAppModal'

import { INITIAL_EMPTY_MASTER_FILTERS, JobListViewType } from '../Constants'
import { getJobsInitFilters } from '../Service'
import {
    JobListFilterConfig,
    JobListUrlFilters,
    JobListUrlFiltersType,
    JobsListSortableKeys,
    JobsMasterFilters,
} from '../Types'
import { getJobStatusLabelFromValue, parseSearchParams } from '../Utils'
import JobListContainer from './JobListContainer'

import '../../app/list/list.scss'

const JobsList = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [dataStateType, setDataStateType] = useState(JobListViewType.LOADING)
    const [filtersLoading, setFiltersLoading] = useState<boolean>(false)
    const [errorResponseCode, setErrorResponseCode] = useState<number>(0)
    const [masterFilters, setMasterFilters] = useState<JobsMasterFilters>(INITIAL_EMPTY_MASTER_FILTERS)
    const [jobCount, setJobCount] = useState<number>(0)

    const urlFilters = useUrlFilters<JobsListSortableKeys, JobListUrlFiltersType>({
        initialSortKey: JobsListSortableKeys.APP_NAME,
        parseSearchParams,
    })
    const {
        searchKey,
        status,
        project,
        environment,
        handleSearch,
        updateSearchParams,
        handleSorting,
        clearFilters,
        offset,
        pageSize,
        changePage,
        changePageSize,
        sortBy,
        sortOrder,
    } = urlFilters

    const filterConfig: JobListFilterConfig = useMemo(
        () => ({
            searchKey,
            status,
            environment,
            project,
            offset,
            pageSize,
            sortBy,
            sortOrder,
        }),
        [
            searchKey,
            JSON.stringify(status),
            JSON.stringify(project),
            JSON.stringify(environment),
            offset,
            pageSize,
            sortBy,
            sortOrder,
        ],
    )

    useEffect(() => {
        // fetch master filters data and some master data
        setFiltersLoading(true)
        getJobsInitFilters()
            .then((initFilters) => {
                setMasterFilters(initFilters)
                setDataStateType(JobListViewType.LIST)
            })
            .catch((errors: ServerErrors) => {
                showError(errors)
                setDataStateType(JobListViewType.ERROR)
                setErrorResponseCode(errors.code)
            })
            .finally(() => {
                setFiltersLoading(false)
            })
    }, [])

    const getLabelFromValue = (filterKey: JobListUrlFilters, filterValue: string) => {
        switch (filterKey) {
            case JobListUrlFilters.environment:
                return masterFilters.environments.find((env) => env.value === filterValue)?.label
            case JobListUrlFilters.project:
                return masterFilters.projects.find((team) => team.value === filterValue)?.label
            case JobListUrlFilters.status:
                return getJobStatusLabelFromValue(filterValue)
            default:
                return filterValue
        }
    }

    const closeJobCreateModal = () => {
        navigate({
            pathname: ROUTER_URLS.JOBS_LIST,
            search: location.search,
        })
    }

    const renderCreateJobRouter = () => (
        <Routes>
            <Route
                path={BASE_ROUTES.AUTOMATION_AND_ENABLEMENT.JOBS.LIST.CREATE_JOB}
                element={<CreateAppModal isJobView handleClose={closeJobCreateModal} />}
            />
        </Routes>
    )

    if (dataStateType === JobListViewType.ERROR) {
        return <ErrorScreenManager code={errorResponseCode} />
    }

    return (
        <div className="jobs-view-container h-100 flexbox-col flex-grow-1 bg__primary">
            {dataStateType === JobListViewType.LOADING && (
                <DevtronProgressing parentClasses="h-100 w-100 flex bg__primary" classes="icon-dim-80" />
            )}
            {dataStateType === JobListViewType.LIST && (
                <>
                    <HeaderWithCreateButton viewType="jobs" />
                    {renderCreateJobRouter()}
                    <JobListContainer
                        masterFilters={masterFilters}
                        filterConfig={filterConfig}
                        clearFilters={clearFilters}
                        handleSorting={handleSorting}
                        jobListCount={jobCount}
                        filtersLoading={filtersLoading}
                        setJobCount={setJobCount}
                        handleSearch={handleSearch}
                        updateSearchParams={updateSearchParams}
                        getLabelFromValue={getLabelFromValue}
                        changePage={changePage}
                        changePageSize={changePageSize}
                    />
                </>
            )}
        </div>
    )
}

export default JobsList
