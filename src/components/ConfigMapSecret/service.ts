import { get, post, trash } from '@devtron-labs/devtron-fe-common-lib'
import { Routes } from '../../config'
import { getEnvironmentConfigs, getEnvironmentSecrets } from '../../services/service'

export function updateConfig(id, appId, configData) {
    return post(`${Routes.APP_CREATE_CONFIG_MAP}`, {
        ...(id && { id }),
        appId,
        configData: [configData],
    })
}

export function deleteConfig(id, appId, name) {
    return trash(`${Routes.APP_CREATE_CONFIG_MAP}/${appId}/${id}?name=${name}`)
}

export function getConfigMapList(appId, envId?) {
    if (envId) {
        return getEnvironmentConfigs(appId, envId)
    } else {
        return get(`${Routes.APP_CREATE_CONFIG_MAP}/${appId}`)
    }
}

export function getSecretList(appId, envId?) {
    if (envId) {
        return getEnvironmentSecrets(appId, envId)
    } else {
        return get(`${Routes.APP_CREATE_SECRET}/${appId}`)
    }
}

export function overRideConfigMap(id, appId, environmentId, configData){
    return post(`${ Routes.APP_CREATE_ENV_CONFIG_MAP }`, {
        id,
        appId,
        environmentId,
        configData
    })
}

export function deleteConfigMap(id, appId, envId, name) {
    return trash(`${Routes.APP_CREATE_ENV_CONFIG_MAP}/${appId}/${envId}/${id}?name=${name}`)
}


export function overRideSecret(id, appId, environmentId, configData) {
    return post(`${Routes.APP_CREATE_ENV_SECRET}`, {
        id,
        appId,
        environmentId,
        configData
    })
}

export function deleteSecret(id, appId, envId, name) {
    return trash(`${Routes.APP_CREATE_ENV_SECRET}/${appId}/${envId}/${id}?name=${name}`)
}

export function unlockEnvSecret(id, appId, envId, name){
    return get(`${Routes.APP_CREATE_ENV_SECRET}/edit/${appId}/${envId}/${id}?name=${name}`)
}

