import { post, put, get } from '@devtron-labs/devtron-fe-common-lib'
import { Routes } from '../../config'

export const getGitOpsConfiguration = (id: number): Promise<any> => {
    const URL = `${Routes.GITOPS}/${id}`
    return get(URL)
}

export const updateGitOpsConfiguration = (request: any): Promise<any> => {
    const URL = `${Routes.GITOPS}`
    return put(URL, request)
}

export const saveGitOpsConfiguration = (request: any): Promise<any> => {
    const URL = `${Routes.GITOPS}`
    return post(URL, request)
}

export function getGitOpsConfigurationList(): Promise<any> {
    const URL = `${Routes.GITOPS}`
    return get(URL)
}

export const validateGitOpsConfiguration = (request: any): Promise<any> => {
    const URL = `${Routes.GITOPS_VALIDATE}`
    return post(URL, request)
}

export const validateHelmAppGitOpsConfiguration = (request: any): Promise<any> => {
    return post(Routes.GITOPOS_HELM_VALIDATE, request)
}
