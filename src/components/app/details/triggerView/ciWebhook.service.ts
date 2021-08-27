import { rejects } from "assert";
import { get, post, trash } from '../../../../services/api';

// export function getCIWebhookRes(pipelineMaterialId): Promise<any> {
//     const URL = `app/ci-pipeline/${pipelineMaterialId}/webhook-payload?limit=100&offset=0&timeSort=DESC`;
//     return get(URL);
// }