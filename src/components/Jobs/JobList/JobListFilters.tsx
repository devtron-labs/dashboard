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

import {
    FilterSelectPicker,
    SearchBar,
    SelectPickerOptionType,
    useGetUserRoles,
} from '@devtron-labs/devtron-fe-common-lib'

import { FILE_NAMES } from '@Components/common/ExportToCsv/constants'
import ExportToCsv from '@Components/common/ExportToCsv/ExportToCsv'

import { getAppListDataToExport } from '../Service'
import { JobListFilterProps, JobListUrlFilters } from '../Types'
import { getJobStatusLabelFromValue } from '../Utils'

const JobListFilters = ({
    masterFilters,
    filterConfig,
    jobListCount,
    payload,
    filtersLoading,
    handleSearch,
    updateSearchParams,
    getLabelFromValue,
}: JobListFilterProps) => {
    const { isSuperAdmin } = useGetUserRoles()
    const { searchKey, status, environment, project } = filterConfig
    const getJobsDataToExport = async () => getAppListDataToExport(payload, searchKey, jobListCount)

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

    return (
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
                        <ExportToCsv
                            apiPromise={getJobsDataToExport}
                            fileName={FILE_NAMES.Jobs}
                            disabled={!jobListCount}
                        />
                    </>
                )}
            </div>
        </div>
    )
}

export default JobListFilters
