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
import {
    FiltersTypeEnum,
    PaginationEnum,
    Table,
} from '@devtron-labs/devtron-fe-common-lib'
import { useHistory, useLocation } from 'react-router-dom'
import { JobListViewProps } from '../Types'
import { URLS } from '../../../config'
import { JOB_LIST_TABLE_COLUMNS, JobRowActionsComponent } from './constants'
import { JobTableRowData, JobTableAdditionalProps } from './types'
import { getJobs } from '../Service'
import { jobListModal } from '../Utils'
import JobsEmptyState from '../JobsEmptyState'
import { JobListViewType } from '../Constants'

export default function JobListView(props: JobListViewProps) {
    const history = useHistory()
    const location = useLocation()
    const [noJobs, setNoJobs] = useState(false)

    const createJobHandler = () => {
        history.push(`${URLS.AUTOMATION_AND_ENABLEMENT_JOB}/${URLS.APP_LIST}/${URLS.CREATE_JOB}${location.search}`)
    }

    const isSearchOrFilterApplied = !!(
        props.searchKey ||
        props.status?.length ||
        props.project?.length ||
        props.environment?.length
    )

    // Use getRows to fetch data with pagination
    const getRows = useCallback(
        async ({ offset, pageSize, sortBy, sortOrder }, signal: AbortSignal) => {
            const request = {
                appNameSearch: props.searchKey.toLowerCase(),
                appStatuses: props.status,
                environments: props.environment.map((envId) => +envId),
                teams: props.project.map((projectId) => +projectId),
                offset,
                size: pageSize,
                sortBy,
                sortOrder,
            }

            const response = await getJobs(request, { signal })
            const jobs = jobListModal(response.result?.jobContainers)
            const totalCount = response.result.jobCount
            props.setJobCount(totalCount)
            setNoJobs(totalCount === 0 && !isSearchOrFilterApplied)

            return {
                rows: jobs.map((job) => ({
                    id: String(job.id),
                    data: job,
                    expandableRows:
                        job.ciPipelines.length > 1
                            ? job.ciPipelines.map((pipeline) => ({
                                  id: `expanded-row-${job.id}-${pipeline.ciPipelineId}` as const,
                                  data: {
                                      ...job,
                                      isExpandedRow: true,
                                      pipeline,
                                  },
                              }))
                            : undefined,
                })),
                totalRows: totalCount,
            }
        },
        [props.searchKey, props.status, props.environment, props.project, props.setJobCount, isSearchOrFilterApplied],
    )

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
            filter={(row) => true} // No filtering needed as filtering is handled by API
            paginationVariant={PaginationEnum.PAGINATED}
            emptyStateConfig={{
                noRowsConfig: null, // Empty state is handled externally
                noRowsForFilterConfig: {
                    title: 'No jobs found',
                    subTitle: 'Try adjusting your search or filters',
                    clearFilters: props.clearFilters,
                },
            }}
            rowActionOnHoverConfig={{
                Component: (componentProps) => (
                    <JobRowActionsComponent {...componentProps} handleEditJob={props.handleEditJob} />
                ),
                width: 100,
            }}
            clearFilters={props.clearFilters}
            areFiltersApplied={isSearchOrFilterApplied}
            additionalFilterProps={{
                initialSortKey: props.sortBy,
            }}
            data-testid="job-list-container"
        />
    )
}
