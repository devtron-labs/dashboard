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

import { multiSelectStyles } from '../../../Common/MultiSelectCustomization'

export const HISTORY_LABEL = {
    APPLICATION: 'Application',
    ENVIRONMENT: 'Environment',
    PIPELINE: 'Pipeline',
}

export const FILTER_STYLE = {
    ...multiSelectStyles,
    control: (base) => ({
        ...base,
        minHeight: '36px',
        fontWeight: '400',
        backgroundColor: 'var(--N50)',
        cursor: 'pointer',
    }),
    dropdownIndicator: (base) => ({
        ...base,
        padding: '0 8px',
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
}

export const GIT_BRANCH_NOT_CONFIGURED = 'Not Configured'
export const DEFAULT_GIT_BRANCH_VALUE = '--'

export const TERMINAL_STATUS_MAP = {
    SUCCEEDED: 'succeeded',
    HEALTHY: 'healthy',
    RUNNING: 'running',
    PROGRESSING: 'progressing',
    STARTING: 'starting',
    INITIATING: 'initiating',
    QUEUED: 'queued',
    FAILED: 'failed',
    ERROR: 'error',
    CANCELLED: 'cancelled',
    UNABLE_TO_FETCH: 'unabletofetch',
    TIMED_OUT: 'timedout',
}

export const EVENT_STREAM_EVENTS_MAP = {
    MESSAGE: 'message',
    START_OF_STREAM: 'START_OF_STREAM',
    END_OF_STREAM: 'END_OF_STREAM',
    ERROR: 'error',
}

export const POD_STATUS = {
    PENDING: 'Pending',
}

export const TIMEOUT_VALUE = '1' // in hours

export const WORKER_POD_BASE_URL = '/resource-browser/1/devtron-ci/pod/k8sEmptyGroup'

export const DEFAULT_ENV = 'devtron-ci'

export const LOGS_RETRY_COUNT = 3

export const DEPLOYMENT_STATUS_QUERY_PARAM = 'deployment-status'

export const MANIFEST_STATUS_HEADERS = ['KIND', 'NAME', 'SYNC STATUS', 'MESSAGE']

export const LOGS_STAGE_IDENTIFIER = 'STAGE_INFO'

export const LOGS_STAGE_STREAM_SEPARATOR = '|'
