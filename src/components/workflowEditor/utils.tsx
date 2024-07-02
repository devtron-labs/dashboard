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
