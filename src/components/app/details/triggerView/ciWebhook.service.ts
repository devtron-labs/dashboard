import { get } from '../../../../services/api';

export function getCIWebhookRes(pipelineMaterialId): Promise<any> {
    const URL = `app/ci-pipeline/webhook-payload/${pipelineMaterialId}?limit=100&offset=0&timeSort=DESC`;
    return get(URL);
}

export function getCIWebhookPayload(pipelineMaterialId, parsedDataId): Promise<any> {
    const URL = `app/ci-pipeline/webhook-payload/${pipelineMaterialId}/${parsedDataId}`;
    return get(URL);
}