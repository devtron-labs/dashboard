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

import { JobListStatus, JobListStatusDTO, JobsMasterFilters } from './Types'

export const JobListViewType = {
    LOADING: 'LOADING',
    LIST: 'LIST',
    EMPTY: 'LIST_EMPTY',
    NO_RESULT: 'NO_RESULT',
    ERROR: 'ERROR',
}

export const JOB_LIST_HEADERS = {
    Name: 'NAME',
    LastJobStatus: 'LAST RUN STATUS',
    LastRunAt: 'LAST RUN AT',
    LastSuccessAt: 'LAST SUCCESS AT',
    Description: 'Description',
    RUN_IN_ENVIRONMENT: 'RUN IN ENVIRONMENT',
}

export const JOBLIST_EMPTY_STATE_MESSAGING = {
    createJob: 'Create your first job',
    createJobInfoText:
        'Jobs allow manual and automated execution of developer actions. Increase productivity by automating the tedious. Get started by creating your first job.',
    createJobButtonLabel: 'Create Job',
}

export const INITIAL_EMPTY_MASTER_FILTERS: JobsMasterFilters = {
    status: [],
    projects: [],
    environments: [],
}

export const JOB_STATUS_OPTIONS = [
    { label: JobListStatus.SUCCEEDED, value: JobListStatusDTO.SUCCEEDED },
    { label: JobListStatus.STARTING, value: JobListStatusDTO.STARTING },
    { label: JobListStatus.RUNNING, value: JobListStatusDTO.RUNNING },
    { label: JobListStatus.CANCELLED, value: JobListStatusDTO.CANCELLED },
    { label: JobListStatus.FAILED, value: JobListStatusDTO.FAILED },
]
