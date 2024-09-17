/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { get, put, post, YAMLStringify, ResponseType, TemplateListDTO } from '@devtron-labs/devtron-fe-common-lib'
import { Routes } from '../../config'
import { ConfigMapRequest, DeploymentTemplateConfigDTO } from './types'
import { addGUISchemaIfAbsent } from './utils'

export async function getDeploymentTemplate(
    appId: number,
    chartRefId: number,
    abortSignal: AbortSignal,
    chartName: string,
): Promise<ResponseType<DeploymentTemplateConfigDTO>> {
    const response = await get(`${Routes.DEPLOYMENT_TEMPLATE}/${appId}/${chartRefId}`, {
        signal: abortSignal,
    })
    return addGUISchemaIfAbsent(response, chartName)
}

/**
 * @deprecated
 */
export function getDeploymentTemplateData(
    appId: number,
    chartRefId: number,
    isValuesView: boolean,
    abortSignal: AbortSignal,
    envId?: number,
    type?: number,
    deploymentTemplateHistoryId?: number,
    pipelineId?: number,
) {
    const valuesAndManifestFlag = isValuesView ? 1 : 2
    return post(`${Routes.DEPLOYMENT_VALUES_MANIFEST}`, {
        appId,
        chartRefId,
        valuesAndManifestFlag,
        envId,
        type,
        deploymentTemplateHistoryId,
        pipelineId,
    })
}

export function getOptions(appId: number, envId: number): Promise<ResponseType<TemplateListDTO[]>> {
    return get(`${Routes.DEPLOYMENT_OPTIONS}?appId=${appId}&envId=${envId}`)
}

// FIXME: This function is not used anywhere, even though through code we are calling this
export function getDefaultDeploymentTemplate(appId, chartId) {
    return get(`${Routes.DEPLOYMENT_TEMPLATE}/default/${appId}/${chartId}`)
}

export const updateDeploymentTemplate = (request, abortSignal) => {
    const URL = `${Routes.DEPLOYMENT_TEMPLATE_UPDATE}`
    return post(URL, request, {
        signal: abortSignal,
    })
}

export const getIfLockedConfigProtected = (request) => {
    return post(Routes.LOCKED_CONFIG_PROTECTED, request)
}

export const saveDeploymentTemplate = (request, abortSignal) => {
    const URL = `${Routes.DEPLOYMENT_TEMPLATE}`
    return post(URL, request)
}

export function getConfigmap(appId: number) {
    const URL = `${Routes.APP_CONFIG_MAP_GET}/${appId}`
    return get(URL).then((response) => {
        return {
            code: response.code,
            result: configMapModal(response.result, appId),
        }
    })
}

export function saveConfigmap(appId: number, request: ConfigMapRequest) {
    const URL = `${Routes.APP_CONFIG_MAP_SAVE}`
    return post(URL, request).then((response) => {
        return {
            code: response.code,
            result: configMapModal(response.result, appId),
        }
    })
}

export function updateConfigmap(appId: number, request: ConfigMapRequest) {
    const URL = `${Routes.APP_CONFIG_MAP_UPDATE}`
    return put(URL, request).then((response) => {
        return {
            code: response.code,
            result: configMapModal(response.result, appId),
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
            configMapYaml: YAMLStringify(configMap.config_map_data),
            secretsYaml: YAMLStringify(configMap.secret_data),
        }
    }
    return null
}
