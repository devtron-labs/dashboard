import { post, trash } from '@devtron-labs/devtron-fe-common-lib'
import {  Routes } from '../../../config'

export function updateConfig(id, appId, configData) {
    return post(`${Routes.APP_CREATE_CONFIG_MAP}`, {
        ...(id && { id }),
        appId,
        configData: [configData]
    })
}

export function deleteConfig(id, appId, name) {
    return trash(`${Routes.APP_CREATE_CONFIG_MAP}/${appId}/${id}?name=${name}`)
}