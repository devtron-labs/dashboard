import { get, post } from '../../services/api';

export function updateBulkList(request): Promise<any> {
    const URL = `batch/v1beta1/application `;
    return post(URL, request);
}

export function updateImpactedObjectsList(request): Promise<any> {
    const URL = `batch/v1beta1/application/dryrun`;
    return post(URL, request);
}

export function getSeeExample() {
    const URL = 'batch/v1beta1/application/see-example'
    return get(URL)
}