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

import { useHistory } from 'react-router-dom'

import { FilterChips } from '@devtron-labs/devtron-fe-common-lib'

import { URLS } from '@Config/routes'

import { JobListProps, JobListUrlFiltersType } from '../Types'
import JobListFilters from './JobListFilters'
import JobListView from './JobListView'

import '../../app/list/list.scss'

const JobListContainer = ({
    masterFilters,
    filterConfig,
    clearFilters,
    handleSearch,
    jobListCount,
    filtersLoading,
    setJobCount,
    updateSearchParams,
    getLabelFromValue,
}: JobListProps) => {
    const history = useHistory()

    const { searchKey, status, environment, project } = filterConfig

    const handleEditJob = (jobId: number): void => {
        history.push(`${URLS.AUTOMATION_AND_ENABLEMENT_JOB}/${jobId}/edit`)
    }

    return (
        <>
            <JobListFilters
                masterFilters={masterFilters}
                filterConfig={filterConfig}
                jobListCount={jobListCount}
                payload={{
                    appNameSearch: searchKey.toLowerCase(),
                    appStatuses: status,
                    environments: environment.map((envId) => +envId),
                    teams: project.map((projectId) => +projectId),
                    offset: filterConfig.offset,
                    size: filterConfig.pageSize,
                    sortBy: filterConfig.sortBy,
                    sortOrder: filterConfig.sortOrder,
                }}
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
            <JobListView
                searchKey={searchKey}
                status={status}
                environment={environment}
                project={project}
                sortBy={filterConfig.sortBy}
                sortOrder={filterConfig.sortOrder}
                handleEditJob={handleEditJob}
                clearFilters={clearFilters}
                setJobCount={setJobCount}
            />
        </>
    )
}

export default JobListContainer
