export function getCDPipelineURL(
    appId: string,
    workflowId: string,
    ciPipelineId: string,
    isWebhookParent: boolean,
    cdPipelineId: string = null,
) {
    if (cdPipelineId)
        return `${workflowId}/${
            isWebhookParent ? 'webhook' : 'ci-pipeline'
        }/${ciPipelineId}/cd-pipeline/${cdPipelineId}`
    else return `${workflowId}/${isWebhookParent ? 'webhook' : 'ci-pipeline'}/${ciPipelineId}/cd-pipeline`
}

export function getPrefixURL(appId: string) {
    return `/app/${appId}/edit/workflow/`
}

export function getCIPipelineURL(
    appId: string,
    workflowId: string,
    ciPipelineId: string | number = null,
    isGitNotConfigured: boolean,
) {
    let prefixURL = ''
    if (isGitNotConfigured) {
        prefixURL = getPrefixURL(appId)
    }
    if (ciPipelineId) return `${prefixURL}${workflowId}/ci-pipeline/${ciPipelineId}`
    else return `${prefixURL}${workflowId}/ci-pipeline`
}

export function getExCIPipelineURL(appId: string, workflowId: string, ciPipelineId: string = null) {
    if (ciPipelineId) return `${workflowId}/external-ci/${ciPipelineId}`
    else return `${workflowId}/external-ci`
}

export function getLinkedCIPipelineURL(
    appId: string | number,
    workflowId: string | number,
    ciPipelineId: string | number = null,
) {
    if (ciPipelineId) return `${workflowId}/linked-ci/${ciPipelineId}`
    else return `${workflowId}/linked-ci`
}

export function getWebhookDetailsURL(workflowId: string | number, ciPipelineId: string | number = null) {
    if (ciPipelineId) return `${workflowId}/webhook/${ciPipelineId}`
    else return `${workflowId}/webhook`
}
