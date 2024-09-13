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

import moment from 'moment'
import { AppListViewType } from '../app/config'
import {
    JobCIPipeline,
    JobListState,
    JobListStateAction,
    JobListStateActionTypes,
    JobListStatus,
    JobListStatusDTO,
    JobListUrlFilters,
} from './Types'
import { OrderBy, SortBy } from '../app/list/types'
import { handleUTCTime } from '../common'
import { JobPipeline } from '../app/types'
import { DEFAULT_ENV } from '../app/details/triggerView/Constants'
import { ZERO_TIME_STRING } from '@devtron-labs/devtron-fe-common-lib'

export const getInitialJobListState = (payloadParsedFromUrl): JobListState => {
    return {
        code: 0,
        view: AppListViewType.LOADING,
        errors: [],
        jobs: [],
        size: 0,
        sortRule: {
            key: payloadParsedFromUrl.sortBy ?? SortBy.APP_NAME,
            order: payloadParsedFromUrl.sortOrder ?? OrderBy.ASC,
        },
        showCommandBar: false,
        offset: payloadParsedFromUrl.offset ?? 0,
        pageSize: payloadParsedFromUrl.size ?? 20,
        expandedRow: null,
        isAllExpanded: false,
        isAllExpandable: false,
    }
}

export const jobListReducer = (state: JobListState, action: JobListStateAction) => {
    switch (action.type) {
        case JobListStateActionTypes.view:
            return { ...state, view: action.payload }
        case JobListStateActionTypes.code:
            return { ...state, code: action.payload }
        case JobListStateActionTypes.errors:
            return { ...state, errors: action.payload }
        case JobListStateActionTypes.jobs:
            return { ...state, jobs: action.payload }
        case JobListStateActionTypes.size:
            return { ...state, size: action.payload }
        case JobListStateActionTypes.sortRule:
            return { ...state, sortRule: action.payload }
        case JobListStateActionTypes.showCommandBar:
            return { ...state, showCommandBar: action.payload }
        case JobListStateActionTypes.offset:
            return { ...state, offset: action.payload }
        case JobListStateActionTypes.pageSize:
            return { ...state, pageSize: action.payload }
        case JobListStateActionTypes.expandedRow:
            return { ...state, expandedRow: action.payload }
        case JobListStateActionTypes.isAllExpanded:
            return { ...state, isAllExpanded: action.payload }
        case JobListStateActionTypes.isAllExpandable:
            return { ...state, isAllExpandable: action.payload }
        case JobListStateActionTypes.multipleOptions:
            return { ...state, ...action.payload }
        default:
            return state
    }
}

export const jobListModal = (jobContainers) => {
    return (
        jobContainers?.map((job) => {
            return {
                id: job.jobId || 0,
                name: job.jobName || 'NA',
                description: job.description.description || '',
                ciPipelines: pipelineModal(job.ciPipelines),
                defaultPipeline: getDefaultPipeline(job.ciPipelines),
            }
        }) ?? []
    )
}

const pipelineModal = (ciPipelines: JobCIPipeline[]) => {
    return (
        ciPipelines?.map((ciPipeline) => {
            if (ciPipeline.status.toLocaleLowerCase() == 'deployment initiated') {
                ciPipeline.status = 'Progressing'
            }

            return {
                ciPipelineId: ciPipeline.ciPipelineId || 0,
                ciPipelineName: ciPipeline.ciPipelineName || '',
                lastRunAt:
                    ciPipeline.lastRunAt && ciPipeline.lastRunAt !== ZERO_TIME_STRING
                        ? handleUTCTime(ciPipeline.lastRunAt, true)
                        : '-',
                lastSuccessAt:
                    ciPipeline.lastSuccessAt && ciPipeline.lastSuccessAt !== ZERO_TIME_STRING
                        ? handleUTCTime(ciPipeline.lastSuccessAt, true)
                        : '-',
                status: ciPipeline.status ? handleDeploymentInitiatedStatus(ciPipeline.status) : 'notdeployed',
                environmentName: ciPipeline.environmentName || '-',
                lastTriggeredEnvironmentName: ciPipeline.lastTriggeredEnvironmentName,
            }
        }) ?? []
    )
}

const getDefaultPipeline = (ciPipelines) => {
    if (ciPipelines?.length > 0) {
        const ciPipeline =
            ciPipelines.find((pipeline) => pipeline.default) || getLastTriggeredJob(ciPipelines) || ciPipelines[0]

        return {
            ciPipelineId: ciPipeline.ciPipelineId || 0,
            ciPipelineName: ciPipeline.ciPipelineName || '',
            lastRunAt:
                ciPipeline.lastRunAt && ciPipeline.lastRunAt !== ZERO_TIME_STRING
                    ? handleUTCTime(ciPipeline.lastRunAt, true)
                    : '-',
            lastSuccessAt:
                ciPipeline.lastSuccessAt && ciPipeline.lastSuccessAt !== ZERO_TIME_STRING
                    ? handleUTCTime(ciPipeline.lastSuccessAt, true)
                    : '-',
            status: ciPipeline.status ? handleDeploymentInitiatedStatus(ciPipeline.status) : 'notdeployed',
            environmentName: ciPipeline.environmentName || '-',
            lastTriggeredEnvironmentName: ciPipeline.lastTriggeredEnvironmentName,
        }
    }
    return {
        ciPipelineId: 0,
        ciPipelineName: '-',
        lastRunAt: '-',
        lastSuccessAt: '-',
        status: 'notdeployed',
    }
}

const getLastTriggeredJob = (jobList) => {
    let selectedJob = jobList[0]
    let ms = moment(new Date(0)).valueOf()
    for (const job of jobList) {
        const time = job.lastDeployedTime && job.lastDeployedTime.length ? job.lastDeployedTime : new Date(0)
        const tmp = moment(time).utc(true).subtract(5, 'hours').subtract(30, 'minutes').valueOf()
        if (tmp > ms) {
            ms = tmp
            selectedJob = job
        }
    }
    return selectedJob
}

const handleDeploymentInitiatedStatus = (status: string): string => {
    if (status.replace(/\s/g, '').toLowerCase() == 'deploymentinitiated') {
        return 'progressing'
    }
    return status
}

export const environmentName = (jobPipeline: JobPipeline | JobCIPipeline): string => {
    const status = jobPipeline.status === 'notdeployed' ? '' : jobPipeline.status
    if (status === '') {
        if (jobPipeline.environmentName === '') {
            return DEFAULT_ENV
        }
        return jobPipeline.environmentName
    }
    if (jobPipeline.lastTriggeredEnvironmentName === '') {
        return DEFAULT_ENV
    }
    return jobPipeline.lastTriggeredEnvironmentName
}

export const parseSearchParams = (searchParams: URLSearchParams) => ({
    [JobListUrlFilters.status]: searchParams.getAll(JobListUrlFilters.status),
    [JobListUrlFilters.project]: searchParams.getAll(JobListUrlFilters.project),
    [JobListUrlFilters.environment]: searchParams.getAll(JobListUrlFilters.environment),
})

export const getJobStatusLabelFromValue = (status: string): string => {
    if (status === JobListStatusDTO.CANCELLED) {
        return JobListStatus.CANCELLED
    }
    return status
}
