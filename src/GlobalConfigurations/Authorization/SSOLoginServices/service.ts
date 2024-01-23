/* eslint-disable @typescript-eslint/no-explicit-any */
import { post, put, get, getUrlWithSearchParams } from '@devtron-labs/devtron-fe-common-lib'
import { Routes } from '../../../config'

export function getSSOConfigList(): Promise<any> {
    return get(Routes.SSO_LIST)
}

// Use the common function for search params
export function getSSOConfig(name: string): Promise<any> {
    return get(getUrlWithSearchParams(Routes.SSO, { name }))
}

export function createSSOList(request): Promise<any> {
    return post(Routes.SSO_CREATE, request)
}

export function updateSSOList(request): Promise<any> {
    return put(Routes.SSO_UPDATE, request)
}
