import {get, post, put, trash} from '../../services/api'
import { Routes} from '../../config'

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

export function getDeploymentTemplate(appId, envId, chartId){
    return get(`app/env/${appId}/${envId}/${chartId}`)
}

export function updateDeploymentTemplate(appId, envId, payload){
    return put(`app/env`, payload)
}

export function createDeploymentTemplate(appId, envId, payload){
    return post(`app/env/${appId}/${envId}`,payload)
}

export function deleteDeploymentTemplate(id, appId, envId){
    return trash(`app/env/reset/${appId}/${envId}/${id}`)
}

export function createNamespace(appId,envId, payload){
    return post(`app/env/namespace/${appId}/${envId}`, payload)
}

export function toggleAppMetrics(appId, envId, payload){
    return post(`app/env/metrics/${appId}/${envId}`, payload)
}

export function chartRefAutocomplete(appId, envId){
    return get(`${Routes.CHART_REFERENCES_MIN}/${appId}/${envId}`)
}