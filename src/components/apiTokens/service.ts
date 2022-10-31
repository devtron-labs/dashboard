import { ResponseType } from '../../services/service.types'
import { get, post, put, trash } from '../../services/api'
import { Routes } from '../../config'

export function getGeneratedAPITokenList(): Promise<ResponseType> {
    return get(Routes.API_TOKEN)
}

export function getWebhookAPITokenList(
    projectName: string,
    environmentName: string,
    appName: string,
): Promise<ResponseType> {
    return get(
        `${Routes.API_TOKEN_WEBHOOK}?projectName=${projectName}&environmentName=${environmentName}&appName=${appName}`,
    )
}

export function createGeneratedAPIToken(payload): Promise<ResponseType> {
    return post(Routes.API_TOKEN, payload)
}

export function updateGeneratedAPIToken(request, id): Promise<ResponseType> {
    return put(`${Routes.API_TOKEN}/${id}`, request)
}

export function deleteGeneratedAPIToken(id: string): Promise<ResponseType> {
    const URL = `${Routes.API_TOKEN}/${id}`
    return trash(URL)
}
