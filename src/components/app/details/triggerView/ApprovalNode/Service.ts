import { post } from '@devtron-labs/devtron-fe-common-lib'

export const submitApprovalRequest = (requestPayload: {
    actionType: number
    pipelineId: number
    artifactId: number
    approvalRequestId: number
}) => {
    return post('app/cd-pipeline/approve', requestPayload)
}
