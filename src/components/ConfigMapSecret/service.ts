import { get, post, trash } from '@devtron-labs/devtron-fe-common-lib'
import { Routes } from '../../config'
import { getEnvironmentConfigs, getEnvironmentSecrets } from '../../services/service'

export function updateConfig(id, appId, configData, signal?) {
    return post(
        `${Routes.APP_CREATE_CONFIG_MAP}`,
        {
            ...(id && { id }),
            appId,
            configData: [configData],
        },
        { signal },
    )
}

export function deleteConfig(id, appId, name) {
    return trash(`${Routes.APP_CREATE_CONFIG_MAP}/${appId}/${id}?name=${name}`)
}

export function deleteEnvConfigMap(id, appId, envId, name) {
    return trash(`${Routes.APP_CREATE_ENV_CONFIG_MAP}/${appId}/${envId}/${id}?name=${name}`)
}

export function overRideConfigMap(id, appId, environmentId, configData, signal?) {
    return post(
        `${Routes.APP_CREATE_ENV_CONFIG_MAP}`,
        {
            id,
            appId,
            environmentId,
            configData,
        },
        { signal },
    )
}

export function getConfigMapList(appId, envId?, signal?) {
    if (envId) {
        return getEnvironmentConfigs(appId, envId, { signal })
    }
    return get(`${Routes.APP_CREATE_CONFIG_MAP}/${appId}`, { signal })
}

export function updateSecret(id, appId, configData, signal?) {
    return post(
        `${Routes.APP_CREATE_SECRET}`,
        {
            ...(id && { id }),
            appId,
            configData: [configData],
        },
        { signal },
    )
}

export function deleteSecret(id, appId, name) {
    return trash(`${Routes.APP_CREATE_SECRET}/${appId}/${id}?name=${name}`)
}

export function deleteEnvSecret(id, appId, envId, name) {
    return trash(`${Routes.APP_CREATE_ENV_SECRET}/${appId}/${envId}/${id}?name=${name}`)
}

export function getCMSecret(componentType, id, appId, name, envId?, signal?) {
    let url = ''
    if (envId !== null && envId !== undefined) {
        url = `${
            componentType === 'secret' ? Routes.APP_CREATE_ENV_SECRET : Routes.APP_CREATE_ENV_CONFIG_MAP
        }/edit/${appId}/${envId}`
    } else {
        url = `${componentType === 'secret' ? Routes.APP_CREATE_SECRET : Routes.APP_CREATE_CONFIG_MAP}/edit/${appId}`
    }
    return get(`${url}/${id}?name=${name}`, { signal })
}

export function getSecretList(appId, envId?, signal?) {
    if (envId) {
        return getEnvironmentSecrets(appId, envId)
    }
    return get(`${Routes.APP_CREATE_SECRET}/${appId}`, { signal })
}

export function overRideSecret(id, appId, environmentId, configData, signal?) {
    return post(
        `${Routes.APP_CREATE_ENV_SECRET}`,
        {
            id,
            appId,
            environmentId,
            configData,
        },
        { signal },
    )
}
