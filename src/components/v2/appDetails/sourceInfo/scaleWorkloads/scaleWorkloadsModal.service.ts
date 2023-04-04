import { Routes } from '../../../../../config'
import { post } from '@devtron-labs/devtron-fe-common-lib'
import { HibernateRequest, HibernateResponse } from './scaleWorkloadsModal.type'

export function hibernateApp(request: HibernateRequest): Promise<HibernateResponse> {
    return post(Routes.HELM_APP_HIBERNATE_API, request)
}

export function unhibernateApp(request: HibernateRequest): Promise<HibernateResponse> {
    return post(Routes.HELM_APP_UNHIBERNATE_API, request)
}
