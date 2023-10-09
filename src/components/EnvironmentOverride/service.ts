import {get, post, put, trash} from '@devtron-labs/devtron-fe-common-lib'
import { Routes} from '../../config'

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

export function chartRefAutocomplete(appId, envId, signal?){
    return get(`${Routes.CHART_REFERENCES_MIN}/${appId}/${envId}`, {signal})
}