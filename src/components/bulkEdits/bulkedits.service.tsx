import { get, post } from '../../services/api';
import { Routes } from '../../config';

export function updateBulkList(request, apiVersion, kind): Promise<any> {
    const URL = `${apiVersion}/${kind} `;
    return post(URL, request);
}

export function updateImpactedObjectsList(request,apiVersion, kind): Promise<any> {
    // console.log(request.apiVersion)
    const URL = `${apiVersion}/${kind}/dryrun`;
    return post(URL, request);
}

export function getSeeExample() {
    const URL = `${Routes.BULK_UPDATE_APIVERSION}/${Routes.BULK_UPDATE_KIND}/see-example`
    return get(URL)
}