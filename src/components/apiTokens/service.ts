import { get, post, put, trash, ResponseType } from '@devtron-labs/devtron-fe-common-lib'
import { Routes } from '../../config'

export function getGeneratedAPITokenList(): Promise<ResponseType> {
    return get(Routes.API_TOKEN)
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
