import { post, put, get } from '../../services/api';

export function getSSOList():Promise<any> {
    const URL = `sso/1`;
    return get(URL);
}

export function createSSOList(request):Promise<any> {
    const URL = `sso/create`;
    return post(URL, request);
}

export function updateSSOList(request):Promise<any> {
    const URL = `sso/update`;
    return put(URL, request);
}