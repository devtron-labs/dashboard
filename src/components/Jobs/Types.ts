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
    status: SelectPickerOptionType<JobListStatusDTO, JobListStatus>[]
    projects: SelectPickerOptionType<string, string>[]
    environments: SelectPickerOptionType<string, string>[]
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
    getLabelFromValue: (filterKey: JobListUrlFilters, filterValue: string) => string
}

export interface JobListViewProps extends Pick<JobListFilterConfig, 'searchKey' | 'sortBy' | 'sortOrder'> {
    status: string[]
    environment: string[]
    project: string[]
    handleEditJob: (jobId: number) => void
    clearFilters: () => void
    setJobCount: React.Dispatch<React.SetStateAction<number>>
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

export interface JobContainerTypes {
    id: number
    jobName: string
    appName: string
    jobId: number
    ciPipelines: JobCIPipeline[]
    description: {
        description: string
        updatedBy: string
        createdBy: string
    }
    projectId: number
}

export type JobList = ResponseType<{
    jobContainers?: JobContainerTypes[]
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
