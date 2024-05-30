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
import { ResponseType, ServerError } from '@devtron-labs/devtron-fe-common-lib'

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
        order: string
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

export interface JobListProps {
    payloadParsedFromUrl?: any
    clearAllFilters: () => void
    sortJobList: (key: string) => void
    jobListCount: number
    isSuperAdmin: boolean
    openJobCreateModel: (event) => void
    setJobCount: React.Dispatch<React.SetStateAction<number>>
    renderMasterFilters: () => JSX.Element
    renderAppliedFilters: () => JSX.Element
}

export interface JobListViewProps extends JobListState, RouteComponentProps<{}> {
    expandRow: (id: number | null) => void
    closeExpandedRow: (id: number | null) => void
    sort: (key: string) => void
    handleEditJob: (jobId: number) => void
    clearAll: () => void
    changePage: (pageNo: number) => void
    changePageSize: (size: number) => void
    jobListCount: number
    isSuperAdmin: boolean
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
    clickHandler: (e) => void
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
