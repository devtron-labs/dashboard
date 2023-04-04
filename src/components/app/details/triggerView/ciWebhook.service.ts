import { get } from '@devtron-labs/devtron-fe-common-lib';

export function getCIWebhookRes(pipelineMaterialId, timeStampOrder): Promise<any> {
    const URL = `app/ci-pipeline/webhook-payload/${pipelineMaterialId}?limit=1000&offset=0&timeSort=DESC`;
    return get(URL);
}

export function getCIWebhookPayload(pipelineMaterialId, parsedDataId): Promise<any> {
    const URL = `app/ci-pipeline/webhook-payload/${pipelineMaterialId}/${parsedDataId}`;
    return get(URL);
}