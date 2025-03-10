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

import { Routes } from '@Config/constants'
import {
    AppConfigProps,
    BaseURLParams,
    get,
    GetTemplateAPIRouteType,
    post,
    put,
    ResponseType,
    trash,
    getTemplateAPIRoute,
} from '@devtron-labs/devtron-fe-common-lib'
import { getChartReferencesForAppAndEnv } from '@Services/service'
import {
    DeploymentTemplateConfigDTO,
    EnvironmentOverrideDeploymentTemplateDTO,
    GetChartListReturnType,
    UpdateBaseDTPayloadType,
    UpdateEnvironmentDTPayloadType,
} from './types'
import { addGUISchemaIfAbsent } from './utils'

export const updateBaseDeploymentTemplate = (
    request: UpdateBaseDTPayloadType,
    abortSignal: AbortSignal,
    isTemplateView: AppConfigProps['isTemplateView'],
) => {
    const URL = isTemplateView
        ? getTemplateAPIRoute({
              type: GetTemplateAPIRouteType.CONFIG_DEPLOYMENT_TEMPLATE,
              queryParams: { id: request.appId },
          })
        : Routes.DEPLOYMENT_TEMPLATE_UPDATE

    return post(URL, request, {
        signal: abortSignal,
    })
}

export const createBaseDeploymentTemplate = (
    request: UpdateBaseDTPayloadType,
    abortSignal: AbortSignal,
    isTemplateView: AppConfigProps['isTemplateView'],
) => {
    const URL = isTemplateView
        ? getTemplateAPIRoute({
              type: GetTemplateAPIRouteType.CONFIG_DEPLOYMENT_TEMPLATE,
              queryParams: { id: request.appId },
          })
        : Routes.DEPLOYMENT_TEMPLATE

    return post(URL, request, {
        signal: abortSignal,
    })
}

export function updateEnvDeploymentTemplate(
    appId: number,
    payload: UpdateEnvironmentDTPayloadType,
    abortSignal: AbortSignal,
    isTemplateView: AppConfigProps['isTemplateView'],
) {
    const url = isTemplateView
        ? getTemplateAPIRoute({
              type: GetTemplateAPIRouteType.CONFIG_DEPLOYMENT_TEMPLATE_ENV,
              queryParams: { id: appId },
          })
        : Routes.ENVIRONMENT_CONFIG
    return put(url, payload, {
        signal: abortSignal,
    })
}

export function createEnvDeploymentTemplate(
    appId: number,
    envId: number,
    payload: UpdateEnvironmentDTPayloadType,
    abortSignal: AbortSignal,
    isTemplateView: AppConfigProps['isTemplateView'],
) {
    const url = isTemplateView
        ? getTemplateAPIRoute({
              type: GetTemplateAPIRouteType.CONFIG_DEPLOYMENT_TEMPLATE_ENV,
              queryParams: { id: appId, envId },
          })
        : `${Routes.ENVIRONMENT_CONFIG}/${appId}/${envId}`

    return post(url, payload, {
        signal: abortSignal,
    })
}

export const getEnvOverrideDeploymentTemplate = async (
    appId: number,
    envId: number,
    chartId: number,
    chartName: string,
    isTemplateView: AppConfigProps['isTemplateView'],
): Promise<ResponseType<EnvironmentOverrideDeploymentTemplateDTO>> => {
    const url = isTemplateView
        ? getTemplateAPIRoute({
              type: GetTemplateAPIRouteType.CONFIG_DEPLOYMENT_TEMPLATE_ENV,
              queryParams: { id: appId, chartRefId: chartId, envId },
          })
        : `${Routes.ENVIRONMENT_CONFIG}/${appId}/${envId}/${chartId}`

    const data = await get(url)
    return addGUISchemaIfAbsent(data, chartName)
}

export function deleteOverrideDeploymentTemplate(
    id: number,
    appId: number,
    envId: number,
    isTemplateView: AppConfigProps['isTemplateView'],
) {
    const url = isTemplateView
        ? getTemplateAPIRoute({
              type: GetTemplateAPIRouteType.CONFIG_DEPLOYMENT_TEMPLATE_ENV,
              queryParams: { id: appId, envId, chartRefId: id },
          })
        : `${Routes.ENVIRONMENT_CONFIG}/reset/${appId}/${envId}/${id}`

    return trash(url)
}

export async function getBaseDeploymentTemplate(
    appId: number,
    chartRefId: number,
    abortSignal: AbortSignal,
    chartName: string,
    isTemplateView: AppConfigProps['isTemplateView'],
): Promise<ResponseType<DeploymentTemplateConfigDTO>> {
    const URL = isTemplateView
        ? getTemplateAPIRoute({
              type: GetTemplateAPIRouteType.CONFIG_DEPLOYMENT_TEMPLATE,
              queryParams: { id: String(appId), chartRefId },
          })
        : `${Routes.DEPLOYMENT_TEMPLATE}/${appId}/${chartRefId}`

    const response = await get(URL, {
        signal: abortSignal,
    })
    return addGUISchemaIfAbsent(response, chartName)
}

export const getChartList = async ({
    appId,
    envId,
    isTemplateView,
}: Pick<BaseURLParams, 'appId' | 'envId'> &
    Required<Pick<AppConfigProps, 'isTemplateView'>>): Promise<GetChartListReturnType> => {
    const chartRefResp = await getChartReferencesForAppAndEnv(+appId, +envId, isTemplateView)

    const { chartRefs, latestAppChartRef, latestChartRef, latestEnvChartRef, chartMetadata } = chartRefResp.result
    // Adding another layer of security
    const envChartRef = envId ? latestEnvChartRef : null

    const selectedChartId: number = envChartRef || latestAppChartRef || latestChartRef
    const chart = chartRefs?.find((chartRef) => chartRef.id === selectedChartId) ?? chartRefs?.[0]

    const globalChartRefId = latestAppChartRef || latestChartRef
    const selectedGlobalChart = chartRefs?.find((chartRef) => chartRef.id === globalChartRefId) ?? chartRefs?.[0]

    return {
        charts: chartRefs || [],
        chartsMetadata: chartMetadata || {},
        selectedChartRefId: selectedChartId,
        selectedChart: chart,
        globalChartDetails: selectedGlobalChart,
        latestAppChartRef,
    }
}
