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

import { URLS } from '../../../config'

export function getCDPipelineURL(
    appId: string,
    workflowId: string,
    ciPipelineId: string,
    isWebhookParent: boolean,
    cdPipelineId: string = null,
) {
    return `${workflowId}/${isWebhookParent ? 'webhook' : 'ci-pipeline'}/${ciPipelineId}/cd-pipeline${
        cdPipelineId ? `/${cdPipelineId}` : ''
    }`
}

export function getCIPipelineURL(
    appId: string,
    workflowId: string,
    isGitNotConfigured: boolean,
    ciPipelineId: string | number = null,
    isJobView?: boolean,
    isCIJob?: boolean,
) {
    let prefixURL = ''
    if (isGitNotConfigured) {
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
) {
    return `${workflowId}/linked-ci${ciPipelineId ? `/${ciPipelineId}` : ''}`
}

export function getWebhookDetailsURL(workflowId: string | number, ciPipelineId: string | number = null) {
    return `${workflowId}/webhook${ciPipelineId ? `/${ciPipelineId}` : ''}`
}
