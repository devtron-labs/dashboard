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

import { useCallback, useState } from 'react'
import { generatePath, useLocation, useNavigate } from 'react-router-dom'

import { FiltersTypeEnum, PaginationEnum, ROUTER_URLS, Table } from '@devtron-labs/devtron-fe-common-lib'

import { DEFAULT_ENV } from '../../app/details/triggerView/Constants'
import { JobListViewType } from '../Constants'
import JobsEmptyState from '../JobsEmptyState'
import { getJobs } from '../Service'
import { JobListViewProps } from '../Types'
import { environmentName, jobListModal } from '../Utils'
import { JOB_LIST_TABLE_COLUMNS, JobRowActionsComponent } from './constants'
import { JobTableAdditionalProps, JobTableRowData } from './types'

import './styles.scss'

const JobListView = ({
    searchKey,
    status,
    project,
    environment,
    setJobCount,
    handleEditJob,
    clearFilters,
    sortBy,
}: JobListViewProps) => {
    const navigate = useNavigate()
    const location = useLocation()
    const [noJobs, setNoJobs] = useState(false)

    const createJobHandler = () => {
        navigate({
            pathname: ROUTER_URLS.CREATE_JOB,
            search: location.search,
        })
    }

    const isSearchOrFilterApplied = !!(searchKey || status?.length || project?.length || environment?.length)

    // Use getRows to fetch data with pagination
    const getRows = useCallback(
        async ({ offset, pageSize, sortBy: getRowsSortBy, sortOrder }, signal: AbortSignal) => {
            const request = {
                appNameSearch: searchKey.toLowerCase(),
                appStatuses: status,
                environments: environment.map((envId) => +envId),
                teams: project.map((projectId) => +projectId),
                offset,
                size: pageSize,
                sortBy: getRowsSortBy,
                sortOrder,
            }

            const response = await getJobs(request, { signal })
            const jobs = jobListModal(response.result?.jobContainers)
            const totalCount = response.result.jobCount
            setJobCount(totalCount)
            setNoJobs(totalCount === 0 && !isSearchOrFilterApplied)

            return {
                rows: jobs.map((job) => {
                    const envName = environmentName(job.defaultPipeline)

                    const jobDetails = {
                        ...job,
                        'defaultPipeline.environmentName': `${envName || '-'}${envName === DEFAULT_ENV ? ' (default)' : ''}`,
                        'defaultPipeline.lastRunAt': job.defaultPipeline?.lastRunAt || '-',
                        'defaultPipeline.lastSuccessAt': job.defaultPipeline?.lastSuccessAt || '-',
                    }

                    return {
                        id: String(job.id),
                        data: jobDetails,
                        expandableRows:
                            job.ciPipelines.length > 1
                                ? job.ciPipelines.map((pipeline) => ({
                                      id: `expanded-row-${job.id}-${pipeline.ciPipelineId}` as const,
                                      data: {
                                          ...jobDetails,
                                          pipeline,
                                      },
                                  }))
                                : undefined,
                    }
                }),
                totalRows: totalCount,
            }
        },
        [searchKey, status, environment, project, setJobCount, isSearchOrFilterApplied],
    )

    const onRowClick = useCallback(({ data }, isExpandedRow) => {
        if (isExpandedRow) {
            return
        }

        navigate(generatePath(ROUTER_URLS.JOB_DETAIL.OVERVIEW, { appId: String(data.id) }))
    }, [])

    // Show empty state if no jobs exist
    if (noJobs) {
        return <JobsEmptyState view={JobListViewType.EMPTY} clickHandler={createJobHandler} />
    }

    return (
        <Table<JobTableRowData, FiltersTypeEnum.URL, JobTableAdditionalProps>
            id="table__job-list"
            columns={JOB_LIST_TABLE_COLUMNS}
            getRows={getRows}
            filtersVariant={FiltersTypeEnum.URL}
            filter={null}
            paginationVariant={PaginationEnum.PAGINATED}
            emptyStateConfig={{
                noRowsConfig: null, // Empty state is handled externally
                noRowsForFilterConfig: {
                    title: 'No jobs found',
                    subTitle: 'Try adjusting your search or filters',
                    clearFilters,
                },
            }}
            rowActionOnHoverConfig={{
                Component: JobRowActionsComponent,
                width: 64,
            }}
            rowStartIconConfig={{ name: 'ic-devtron-job', color: null, size: 24 }}
            clearFilters={clearFilters}
            areFiltersApplied={isSearchOrFilterApplied}
            additionalFilterProps={{
                initialSortKey: sortBy,
            }}
            additionalProps={{
                handleEditJob,
            }}
            data-testid="job-list-container"
            onRowClick={onRowClick}
        />
    )
}

export default JobListView
