import { get, post, trash } from '../../services/api'
import { Routes } from '../../config'

export function updateSecret(id, appId, configData) {
    return post(`${Routes.APP_CREATE_SECRET}`, {
        ...(id && { id }),
        appId,
        configData: [configData]
    })
}

export function deleteSecret(id, appId, name){
    return trash(`${Routes.APP_CREATE_SECRET}/${appId}/${id}?name=${name}`)
}

export function getSecretKeys(id, appId, name){
    return get(`${Routes.APP_CREATE_SECRET}/edit/${appId}/${id}?name=${name}`)
}