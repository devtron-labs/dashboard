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
import { Route, Switch, useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import {
    ErrorScreenManager,
    showError,
    stopPropagation,
    ServerErrors,
    DevtronProgressing,
    HeaderWithCreateButton,
    SearchBar,
    useUrlFilters,
    FilterSelectPicker,
    SelectPickerOptionType,
    FilterChips,
    useMainContext,
} from '@devtron-labs/devtron-fe-common-lib'
import { URLS } from '../../../config'
import { INITIAL_EMPTY_MASTER_FILTERS, JobListViewType } from '../Constants'
import JobListContainer from './JobListContainer'
import { getJobStatusLabelFromValue, parseSearchParams } from '../Utils'
import { AddNewApp } from '../../app/create/CreateApp'
import { getAppListDataToExport, getJobsInitFilters } from '../Service'
import ExportToCsv from '../../common/ExportToCsv/ExportToCsv'
import { FILE_NAMES } from '../../common/ExportToCsv/constants'
import '../../app/list/list.scss'
import {
    JobListPayload,
    JobListUrlFilters,
    JobListUrlFiltersType,
    JobsListSortableKeys,
    JobsMasterFilters,
} from '../Types'

const JobsList = () => {
    const { path } = useRouteMatch()
    const history = useHistory()
    const location = useLocation()
    const { isSuperAdmin } = useMainContext()
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

    const payload: JobListPayload = useMemo(
        () => ({
            appNameSearch: searchKey,
            appStatuses: status,
            environments: environment.map((envId) => +envId),
            teams: project.map((projectId) => +projectId),
            offset,
            size: pageSize,
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

    const openJobCreateModel = () => {
        history.push(`${URLS.JOB}/${URLS.APP_LIST}/${URLS.CREATE_JOB}${location.search}`)
    }

    const closeJobCreateModal = (e) => {
        stopPropagation(e)
        history.push(`${URLS.JOB}/${URLS.APP_LIST}`)
    }

    const handleUpdateFilters = (filterKey: JobListUrlFilters) => (selectedOptions: SelectPickerOptionType[]) => {
        updateSearchParams({ [filterKey]: selectedOptions.map((option) => String(option.value)) })
    }

    const selectedProjects: SelectPickerOptionType[] = project.map((projectId) => ({
        label: getLabelFromValue(JobListUrlFilters.project, projectId),
        value: projectId,
    }))

    const selectedStatuses: SelectPickerOptionType[] = status.map((jobStatus) => ({
        label: getJobStatusLabelFromValue(jobStatus),
        value: jobStatus,
    }))

    const selectedEnvironments: SelectPickerOptionType[] = environment.map((envId) => ({
        label: getLabelFromValue(JobListUrlFilters.environment, envId),
        value: envId,
    }))

    const renderCreateJobRouter = () => (
        <Switch>
            <Route
                path={`${path}/${URLS.CREATE_JOB}`}
                render={({ history: routeHistory, location: routeLocation, match }) => (
                    <AddNewApp
                        isJobView
                        close={closeJobCreateModal}
                        history={routeHistory}
                        location={routeLocation}
                        match={match}
                    />
                )}
            />
        </Switch>
    )

    const getJobsDataToExport = async () => getAppListDataToExport(payload, searchKey, jobCount)

    const renderMasterFilters = () => (
        <div className="search-filter-section">
            <SearchBar
                initialSearchText={searchKey}
                containerClassName="dc__mxw-250 flex-grow-1"
                handleEnter={handleSearch}
                inputProps={{
                    placeholder: 'Search by job name',
                    autoFocus: true,
                }}
                dataTestId="Search-by-job-name"
            />
            <div className="flexbox dc__gap-8 dc__align-items-center dc__zi-4">
                <FilterSelectPicker
                    inputId="job-status-filter"
                    placeholder="Status"
                    options={masterFilters.status}
                    isLoading={filtersLoading}
                    isDisabled={filtersLoading}
                    appliedFilterOptions={selectedStatuses}
                    handleApplyFilter={handleUpdateFilters(JobListUrlFilters.status)}
                />
                <div className="dc__border-right h-16" />
                <FilterSelectPicker
                    inputId="job-projects-filter"
                    placeholder="Projects"
                    options={masterFilters.projects}
                    isLoading={filtersLoading}
                    isDisabled={filtersLoading}
                    appliedFilterOptions={selectedProjects}
                    handleApplyFilter={handleUpdateFilters(JobListUrlFilters.project)}
                />
                <div className="dc__border-right h-16" />
                <FilterSelectPicker
                    inputId="job-environments-filter"
                    placeholder="Environments"
                    options={masterFilters.environments}
                    isLoading={filtersLoading}
                    isDisabled={filtersLoading}
                    appliedFilterOptions={selectedEnvironments}
                    handleApplyFilter={handleUpdateFilters(JobListUrlFilters.environment)}
                    shouldMenuAlignRight={!isSuperAdmin}
                />
                {isSuperAdmin && (
                    <>
                        <div className="dc__border-right h-16" />
                        <ExportToCsv apiPromise={getJobsDataToExport} fileName={FILE_NAMES.Jobs} disabled={!jobCount} />
                    </>
                )}
            </div>
        </div>
    )

    const renderAppliedFilters = () => (
        <FilterChips<JobListUrlFiltersType>
            filterConfig={{ status, environment, project }}
            clearFilters={clearFilters}
            onRemoveFilter={updateSearchParams}
            className="px-20"
            getFormattedValue={getLabelFromValue}
        />
    )

    if (dataStateType === JobListViewType.ERROR) {
        return <ErrorScreenManager code={errorResponseCode} />
    }

    return (
        <div className="jobs-view-container h-100 bcn-0">
            {dataStateType === JobListViewType.LOADING && (
                <div className="w-100 h-100vh">
                    <DevtronProgressing parentClasses="h-100 w-100 flex bcn-0" classes="icon-dim-80" />
                </div>
            )}
            {dataStateType === JobListViewType.LIST && (
                <>
                    <HeaderWithCreateButton headerName="Jobs" />
                    {renderCreateJobRouter()}
                    <JobListContainer
                        payloadParsedFromUrl={payload}
                        clearFilters={clearFilters}
                        handleSorting={handleSorting}
                        jobListCount={jobCount}
                        isSuperAdmin={isSuperAdmin}
                        setJobCount={setJobCount}
                        openJobCreateModel={openJobCreateModel}
                        renderMasterFilters={renderMasterFilters}
                        renderAppliedFilters={renderAppliedFilters}
                        changePage={changePage}
                        changePageSize={changePageSize}
                    />
                </>
            )}
        </div>
    )
}

export default JobsList
