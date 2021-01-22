import { post, put, get } from '../../services/api';
import { FullRoutes } from '../../config';

export function getSSOConfigList(): Promise<any> {
    const URL = `sso/list`;
    return get(URL)
}

export function loginAsAdmin(payload): Promise<any> {
    return post(FullRoutes.LOGIN, payload);
}

export function getSSOConfig(name: string): Promise<any> {
    const URL = `sso?name=${name}`;
    return get(URL);
}

export function createSSOList(request): Promise<any> {
    const URL = `sso/create`;
    return post(URL, request);
}

export function updateSSOList(request): Promise<any> {
    const URL = `sso/update`;
    return put(URL, request);
}