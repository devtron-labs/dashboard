import { CIPipelineNodeType } from '@devtron-labs/devtron-fe-common-lib'

export const getAnalyticsAction = (type: CIPipelineNodeType): string | null => {
    switch (type) {
        case CIPipelineNodeType.CI:
            return 'DA_NEW_WORKLFOW_BUILD'
        case CIPipelineNodeType.JOB_CI:
            return 'DA_NEW_WORKLFOW_JOB'
        case CIPipelineNodeType.LINKED_CI:
            return 'DA_NEW_WORKLFOW_LINKED_BUILD'
        default:
            return null
    }
}
