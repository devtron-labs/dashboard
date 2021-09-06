import { get } from '../../../../services/api';

export function getCIWebhookRes(pipelineMaterialId, timeStampOrder): Promise<any> {
    const URL = `app/ci-pipeline/webhook-payload/${pipelineMaterialId}?limit=1000&offset=0&timeSort=DSC`;
    return get(URL);
}

export function getCIWebhookPayload(pipelineMaterialId, parsedDataId): Promise<any> {
    const URL = `app/ci-pipeline/webhook-payload/${pipelineMaterialId}/${parsedDataId}`;
    return get(URL);
}