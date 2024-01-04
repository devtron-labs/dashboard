import { post, trash } from '@devtron-labs/devtron-fe-common-lib'
import { Routes } from '../../config'

export function createWorkflow(request) {
    const URL = `${Routes.WORKFLOW}`
    return post(URL, request)
}

export function updateWorkflow(request) {
    const URL = `${Routes.WORKFLOW}`
    return post(URL, request)
}

export function deleteWorkflow(appId: string, workflowId: number) {
    const URL = `${Routes.WORKFLOW}/${appId}/${workflowId}`
    return trash(URL)
}
