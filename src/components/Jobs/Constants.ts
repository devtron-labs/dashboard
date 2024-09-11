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

import { multiSelectStyles } from '@devtron-labs/devtron-fe-common-lib'

export const _multiSelectStyles = {
    ...multiSelectStyles,
    control: (base) => ({
        ...base,
        cursor: 'pointer',
    }),
    menu: (base) => ({
        ...base,
        marginTop: 'auto',
    }),
    menuList: (base) => ({
        ...base,
        position: 'relative',
        paddingBottom: '0px',
        maxHeight: '180px',
    }),
}

export const JobCreationType = {
    Blank: 'BLANK',
    Existing: 'EXISTING',
}

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

export const JobsFilterTypeText = {
    PROJECT: 'team',
    APP_STATUS: 'appStatus',
    StatusText: 'Status',
    SearchStatus: 'Search job status',
    ProjectText: 'Projects',
    SearchProject: 'Search Project',
    ENVIRONMENT: 'environment',
    EnvironmentText: 'Environments',
    SearchEnvironment: 'Search Environment',
}

export const JobsStatusConstants = {
    APP_STATUS: {
        noSpaceLower: 'appStatus',
        normalText: 'App status',
    },
    PROJECT: {
        pluralLower: 'projects',
        lowerCase: 'project',
    },
    ENVIRONMENT: {
        pluralLower: 'environments',
        lowerCase: 'environment',
    },
}

export const JOB_STATUS = {
    Starting: 'Starting',
    Running: 'Running',
    Succeeded: 'Succeeded',
    Cancelled: 'CANCELLED',
    Failed: 'Failed',
}
