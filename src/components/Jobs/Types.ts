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

import { RouteComponentProps } from 'react-router-dom'
import {
    ResponseType,
    SelectPickerOptionType,
    ServerError,
    SortingOrder,
    UseUrlFiltersReturnType,
} from '@devtron-labs/devtron-fe-common-lib'
import { AppListPayloadType } from '@Components/app/list-new/AppListType'

export enum JobListStateActionTypes {
    view = 'view',
    code = 'code',
    errors = 'errors',
    jobs = 'jobs',
    size = 'size',
    sortRule = 'sortRule',
    showCommandBar = 'showCommandBar',
    offset = 'offset',
    pageSize = 'pageSize',
    expandedRow = 'expandedRow',
    isAllExpanded = 'isAllExpanded',
    isAllExpandable = 'isAllExpandable',
    multipleOptions = 'multipleOptions',
}

export interface JobListStateAction {
    type: JobListStateActionTypes
    payload: any
}

export interface JobCIPipeline {
    ciPipelineId: number
    ciPipelineName: string
    lastRunAt: string
    lastSuccessAt: string
    status: string
    environmentName?: string
    environmentId?: number
    lastTriggeredEnvironmentName?: string
}

export interface Job {
    id: number
    name: string
    description: string
    ciPipelines: JobCIPipeline[]
    defaultPipeline: JobCIPipeline
}

export interface JobListState {
    code: number
    view: string
    errors: ServerError[]
    jobs: Job[]
    showCommandBar: boolean
    sortRule: {
        key: string
        order: SortingOrder
    }
    size: number
    offset: number
    pageSize: number
    expandedRow: Record<number, boolean>
    isAllExpanded: boolean
    isAllExpandable: boolean
}

export interface ExpandedRowProps {
    job: Job
    handleEdit: (jobId: number) => void
    close: (e: any) => void
}

export interface JobListPayload
    extends Pick<
        AppListPayloadType,
        'appNameSearch' | 'appStatuses' | 'environments' | 'teams' | 'offset' | 'size' | 'sortOrder'
    > {
    sortBy: JobsListSortableKeys
}

export interface JobsMasterFilters {
    status: SelectPickerOptionType[]
    projects: SelectPickerOptionType[]
    environments: SelectPickerOptionType[]
}

export interface JobListFilterConfig
    extends JobListUrlFiltersType,
        Pick<JobListPayload, 'offset' | 'sortBy' | 'sortOrder'> {
    searchKey: string
    pageSize: number
}

export interface JobListProps
    extends Pick<
        UseUrlFiltersReturnType<JobsListSortableKeys>,
        'changePage' | 'changePageSize' | 'clearFilters' | 'handleSorting' | 'handleSearch' | 'updateSearchParams'
    > {
    masterFilters: JobsMasterFilters
    filterConfig: JobListFilterConfig
    filtersLoading: boolean
    jobListCount: number
    openJobCreateModel: (event) => void
    setJobCount: React.Dispatch<React.SetStateAction<number>>
    getLabelFromValue: (filterKey: JobListUrlFilters, filterValue: string) => React.ReactNode
}

export interface JobListViewProps
    extends JobListState,
        RouteComponentProps<{}>,
        Pick<
            UseUrlFiltersReturnType<JobsListSortableKeys>,
            'changePage' | 'changePageSize' | 'clearFilters' | 'handleSorting'
        > {
    expandRow: (id: number | null) => void
    closeExpandedRow: (id: number | null) => void
    handleEditJob: (jobId: number) => void
    jobListCount: number
    openJobCreateModel: (e) => void
    toggleExpandAllRow: () => void
}

export interface JobSelectorType {
    onChange: ({ label, value }) => void
    jobId: number
    jobName: string
}

export interface JobsEmptyProps {
    view: string
    clickHandler: () => void
}

export type JobList = ResponseType<{
    jobContainers?: {
        id: number
        jobName: string
        appName: string
        jobId: number
        ciPipelines: JobCIPipeline[]
        description: {
            description: string
        }
        projectId: number
    }[]
    jobCount: number
}>

export enum JobsListSortableKeys {
    APP_NAME = 'appNameSort',
}

export enum JobListUrlFilters {
    status = 'status',
    project = 'project',
    environment = 'environment',
}

export interface JobListUrlFiltersType extends Record<JobListUrlFilters, string[]> {}

export enum JobListStatus {
    STARTING = 'Starting',
    RUNNING = 'Running',
    SUCCEEDED = 'Succeeded',
    CANCELLED = 'Cancelled',
    FAILED = 'Failed',
}

export enum JobListStatusDTO {
    STARTING = 'Starting',
    RUNNING = 'Running',
    SUCCEEDED = 'Succeeded',
    CANCELLED = 'CANCELLED',
    FAILED = 'Failed',
}

export interface JobListFilterProps
    extends Pick<
        JobListProps,
        | 'filtersLoading'
        | 'jobListCount'
        | 'masterFilters'
        | 'handleSearch'
        | 'filterConfig'
        | 'updateSearchParams'
        | 'getLabelFromValue'
    > {
    payload: JobListPayload
}
