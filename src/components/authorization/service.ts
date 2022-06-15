import { ResponseType } from '../../services/service.types'
import { get, post, put, trash } from '../../services/api'
import { Routes } from '../../config'

export function getGeneratedAPITokenList(): Promise<ResponseType> {
    return get(Routes.API_TOKEN)
}

export function createGeneratedAPIToken(payload): Promise<ResponseType> {
    return post(Routes.API_TOKEN, payload)
}

export function updateGeneratedAPIToken(request) {
    return put(Routes.API_TOKEN, request)
}

export function deleteGeneratedAPIToken(userId: string) {
    const URL = `${Routes.APP}/${userId}`
    return trash(URL)
}
