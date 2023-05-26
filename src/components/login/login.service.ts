import { post, put, get } from '@devtron-labs/devtron-fe-common-lib';
import { Routes } from '../../config';

export function getSSOConfigList(): Promise<any> {
    return get(Routes.SSO_LIST)
}

export function loginAsAdmin(payload): Promise<any> {
    return post(Routes.LOGIN, payload);
}

export function getSSOConfig(name: string): Promise<any> {
    return get(`${Routes.SSO}?name=${name}`);
}

export function createSSOList(request): Promise<any> {
    return post(Routes.SSO_CREATE, request);
}

export function updateSSOList(request): Promise<any> {
    return put(Routes.SSO_UPDATE, request);
}