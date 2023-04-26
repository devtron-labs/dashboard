import { get, post } from '@devtron-labs/devtron-fe-common-lib';
import { Routes } from '../../config';

export function updateBulkList(request): Promise<any> {
    let apiVersion= request.apiVersion
    let kind = request.kind.toLocaleLowerCase()
    const URL = `${apiVersion}/${kind} `;
    return post(URL, request);
}

export function updateImpactedObjectsList(request): Promise<any> {

    let apiVersion= request.apiVersion
    let kind = request.kind.toLocaleLowerCase()
    const URL = `${apiVersion}/${kind}/dryrun `;
    return post(URL, request) ;
}

export function getSeeExample() {
    const URL = `${Routes.BULK_UPDATE_APIVERSION}/${Routes.BULK_UPDATE_KIND}/readme`
    return get(URL)
}