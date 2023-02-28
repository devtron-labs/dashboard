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
) {
    const prefixURL = isGitNotConfigured ? `/${isJobView ? 'job' : 'app'}/${appId}/edit/workflow/` : ''
    return `${prefixURL}${workflowId}/ci-pipeline${ciPipelineId ? `/${ciPipelineId}` : ''}`
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
