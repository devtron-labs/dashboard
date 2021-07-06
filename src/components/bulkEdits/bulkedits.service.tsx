import { get, post } from '../../services/api';
import { Routes } from '../../config';

export function updateBulkList(request): Promise<any> {
    const URL = `batch/v1beta1/application `;
    return post(URL, request);
}

export function updateImpactedObjectsList(request): Promise<any> {
    console.log(request)
    const URL = `batch/v1beta1/application/dryrun`;
    return post(URL, request);
}

export function getSeeExample() {
    const URL = `${Routes.BULK_UPDATE_APIVERSION}/${Routes.BULK_UPDATE_KIND}/see-example`
    return get(URL)
}