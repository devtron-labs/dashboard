import { Routes } from '../../config';
import { post, trash } from '@devtron-labs/devtron-fe-common-lib';

export function createWorkflow(request) {
    const URL = `${Routes.WORKFLOW}`;
    return post(URL, request);
}

export function updateWorkflow(request) {
    const URL = `${Routes.WORKFLOW}`;
    return post(URL, request);
}

export function deleteWorkflow(appId: string, workflowId: number) {
    const URL = `${Routes.WORKFLOW}/${appId}/${workflowId}`;
    return trash(URL);
}




