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

import { PipelineType } from '@devtron-labs/devtron-fe-common-lib'
import { TriggerType } from '../../config'
import { ChangeCIPayloadType } from './types'

/**
 * Would be used as payload to switch to webhook pipeline, in case we have few cd pipelines configured
 */
export const getSwitchToWebhookPayload = (changeCIPayload: ChangeCIPayloadType) => ({
    appId: changeCIPayload.appId,
    pipelines: [
        {
            // name and triggerType are useless to backend for this case
            name: 'change-webhook-ci',
            triggertype: TriggerType.Manual,
            appWorkflowId: changeCIPayload.appWorkflowId,
            environmentId: -1,
            id: 0,
            parentPipelineType: PipelineType.WEBHOOK,
            switchFromCiPipelineId: changeCIPayload.switchFromCiPipelineId,
        },
    ],
})
