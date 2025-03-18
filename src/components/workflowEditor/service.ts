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
    AppConfigProps,
    GetTemplateAPIRouteType,
    post,
    trash,
    getTemplateAPIRoute,
} from '@devtron-labs/devtron-fe-common-lib'
import { Routes } from '../../config'

export function createWorkflow(request, isTemplateView: AppConfigProps['isTemplateView']) {
    const URL = isTemplateView
        ? getTemplateAPIRoute({
              type: GetTemplateAPIRouteType.WORKFLOW,
              queryParams: { id: String(request.appId) },
          })
        : `${Routes.WORKFLOW}`

    return post(URL, request)
}

export function updateWorkflow(request, isTemplateView: AppConfigProps['isTemplateView']) {
    const URL = isTemplateView
        ? getTemplateAPIRoute({
              type: GetTemplateAPIRouteType.WORKFLOW,
              queryParams: { id: String(request.appId) },
          })
        : `${Routes.WORKFLOW}`

    return post(URL, request)
}

export function deleteWorkflow(appId: string, workflowId: number, isTemplateView: AppConfigProps['isTemplateView']) {
    const URL = isTemplateView
        ? getTemplateAPIRoute({
              type: GetTemplateAPIRouteType.WORKFLOW,
              queryParams: { id: appId, appWorkflowId: workflowId },
          })
        : `${Routes.WORKFLOW}/${appId}/${workflowId}`

    return trash(URL)
}
