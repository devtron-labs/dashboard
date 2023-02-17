import { DeploymentNodeType } from '../app/details/triggerView/types'

export const ENV_TRIGGER_VIEW_GA_EVENTS = {
    MaterialClicked: {
        category: 'Environment Details Trigger View',
        action: 'Select Material Clicked',
    },
    ImageClicked: {
        category: 'Environment Details Trigger View',
        action: 'Select Image Clicked',
    },
    RollbackClicked: {
        category: 'Environment Details Trigger View',
        action: 'Select Rollback Material Clicked',
    },
    CITriggered: {
        category: 'Environment Details Trigger View',
        action: 'CI Triggered',
    },
    CDTriggered: (nodeType: string) => ({
        category: 'Environment Details Trigger View',
        action: `${nodeType} Triggered`,
    }),
    BulkCITriggered: {
        category: 'Environment Details Trigger View',
        action: 'Bulk CI Triggered',
    },
    BulkCDTriggered: (nodeType: string) => ({
        category: 'Environment Details Trigger View',
        action: `Bulk ${nodeType} Triggered`,
    }),
}

export const ButtonTitle = {
    [DeploymentNodeType.PRECD]: 'Trigger pre-deployment stage',
    [DeploymentNodeType.CD]: 'Deploy',
    [DeploymentNodeType.POSTCD]: 'Trigger post-deployment stage',
}

export enum BulkResponseStatus {
    'PASS' = 'pass',
    'FAIL' = 'fail',
    'UNAUTHORIZE' = 'unauthorized',
}

export const BulkCIResponseStatusText = {
    [BulkResponseStatus.PASS]: 'Build triggered',
    [BulkResponseStatus.FAIL]: 'Build not triggered',
    [BulkResponseStatus.UNAUTHORIZE]: 'Not authorized',
}

export const BulkCDResponseStatusText = {
    [BulkResponseStatus.PASS]: 'Deployment triggered',
    [BulkResponseStatus.FAIL]: 'Deployment not triggered',
    [BulkResponseStatus.UNAUTHORIZE]: 'Not authorized',
}
