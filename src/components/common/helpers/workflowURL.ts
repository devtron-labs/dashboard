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

import { URLS as CommonURLS } from '@devtron-labs/devtron-fe-common-lib'
import { URLS } from '../../../config'

export function getCDPipelineURL(
    appId: string,
    workflowId: string,
    ciPipelineId: string,
    isWebhookParent: boolean,
    cdPipelineId: string = null,
    shouldComputeCompleteURL: boolean = false,
) {
    const prefix = `${URLS.APP}/${appId}/${CommonURLS.APP_CONFIG}/${URLS.APP_WORKFLOW_CONFIG}/`
    const suffix = `${workflowId}/${isWebhookParent ? 'webhook' : 'ci-pipeline'}/${ciPipelineId}/cd-pipeline${
        cdPipelineId ? `/${cdPipelineId}` : ''
    }`

    if (shouldComputeCompleteURL) {
        return `${prefix}${suffix}`
    }

    return suffix
}

export function getCIPipelineURL(
    appId: string,
    workflowId: string,
    addPrefix: boolean,
    ciPipelineId: string | number = null,
    isJobView?: boolean,
    isCIJob?: boolean,
) {
    let prefixURL = ''
    if (addPrefix) {
        prefixURL = `/${isJobView ? 'job' : 'app'}/${appId}/edit/workflow/`
    }
    const ciPipelineSuffix = ciPipelineId ? `/${ciPipelineId}` : ''
    const ciPipelineType = isCIJob ? URLS.APP_JOB_CI_CONFIG : URLS.APP_CI_CONFIG
    return `${prefixURL}${workflowId}/${ciPipelineType}${ciPipelineSuffix}`
}

export function getExCIPipelineURL(appId: string, workflowId: string, ciPipelineId: string = null) {
    return `${workflowId}/external-ci${ciPipelineId ? `/${ciPipelineId}` : ''}`
}

export function getLinkedCIPipelineURL(
    appId: string | number,
    workflowId: string | number,
    ciPipelineId: string | number = null,
    addPrefix: boolean = false,
) {
    const suffix = `${workflowId}/linked-ci${ciPipelineId ? `/${ciPipelineId}` : ''}`
    if (addPrefix) {
        return `/app/${appId}/edit/workflow/${suffix}`
    }

    return suffix
}

export function getWebhookDetailsURL(workflowId: string | number, ciPipelineId: string | number = null) {
    return `${workflowId}/webhook${ciPipelineId ? `/${ciPipelineId}` : ''}`
}
