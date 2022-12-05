import { Routes } from '../../config';
import { get, put, post } from '../../services/api';
import { ConfigMapRequest } from './types';
import yamlJsParser from 'yamljs';

export function getDeploymentTemplate(id: number, chartRefId: number, isDefaultTemplate?: boolean) {
    if(isDefaultTemplate){
      return get(`${Routes.DEPLOYMENT_TEMPLATE}/${id}/default/${chartRefId}`)
    } else{
      return get(`${Routes.DEPLOYMENT_TEMPLATE}/${id}/${chartRefId}`)
    }
}

export const updateDeploymentTemplate = (request) => {
    const URL = `${Routes.DEPLOYMENT_TEMPLATE_UPDATE}`;
    return post(URL, request);
}

export const saveDeploymentTemplate = (request) => {
    const URL = `${Routes.DEPLOYMENT_TEMPLATE}`;
    return post(URL, request)
}

export function getConfigmap(appId: number) {
    const URL = `${Routes.APP_CONFIG_MAP_GET}/${appId}`;
    return get(URL).then((response) => {
        return {
            code: response.code,
            result: configMapModal(response.result, appId)
        }
    })
}

export function saveConfigmap(appId: number, request: ConfigMapRequest) {
    const URL = `${Routes.APP_CONFIG_MAP_SAVE}`;
    return post(URL, request).then((response) => {
        return {
            code: response.code,
            result: configMapModal(response.result, appId)
        }
    })
}

export function updateConfigmap(appId: number, request: ConfigMapRequest) {
    const URL = `${Routes.APP_CONFIG_MAP_UPDATE}`;
    return put(URL, request).then((response) => {
        return {
            code: response.code,
            result: configMapModal(response.result, appId)
        }
    })
}

export function toggleAppMetrics(appId, payload) {
    return post(`app/template/metrics/${appId}`, payload)
}

function configMapModal(configMap, appId: number) {
    if (configMap) {
        return {
            id: configMap.id,
            appId: configMap.app_id,
            environmentId: configMap.environment_id,
            pipelineId: configMap.pipeline_id,
            configMapValuesOverride: configMap.config_map_data,
            secretsValuesOverride: configMap.secret_data,
            configMapJsonStr: JSON.stringify(configMap.config_map_data || {}, undefined, 2),
            secretsJsonStr: JSON.stringify(configMap.secret_data || {}, undefined, 2),
            configMapYaml: yamlJsParser.stringify(configMap.config_map_data),
            secretsYaml: yamlJsParser.stringify(configMap.secret_data),
        }
    }
    else {
        return null;
    }
}

