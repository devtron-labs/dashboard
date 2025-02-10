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
} from '@devtron-labs/devtron-fe-common-lib'
import { getChartReferencesForAppAndEnv } from '@Services/service'
import { getTemplateAPIRoute } from '@Components/common'
import {
    DeploymentTemplateConfigDTO,
    EnvironmentOverrideDeploymentTemplateDTO,
    GetChartListReturnType,
    UpdateBaseDTPayloadType,
    UpdateEnvironmentDTPayloadType,
} from './types'
import { addGUISchemaIfAbsent } from './utils'

export const updateBaseDeploymentTemplate = (request: UpdateBaseDTPayloadType, abortSignal: AbortSignal) => {
    const URL = `${Routes.DEPLOYMENT_TEMPLATE_UPDATE}`
    return post(URL, request, {
        signal: abortSignal,
    })
}

export const createBaseDeploymentTemplate = (
    request: UpdateBaseDTPayloadType,
    abortSignal: AbortSignal,
    isTemplateView?: AppConfigProps['isTemplateView'],
) => {
    const URL = isTemplateView
        ? getTemplateAPIRoute({
              type: GetTemplateAPIRouteType.CONFIG_DEPLOYMENT_TEMPLATE,
              queryParams: { id: String(request.appId) },
          })
        : `${Routes.DEPLOYMENT_TEMPLATE}`

    return post(URL, request, {
        signal: abortSignal,
    })
}

export function updateEnvDeploymentTemplate(payload: UpdateEnvironmentDTPayloadType, abortSignal: AbortSignal) {
    return put('app/env', payload, {
        signal: abortSignal,
    })
}

export function createEnvDeploymentTemplate(
    appId: number,
    envId: number,
    payload: UpdateEnvironmentDTPayloadType,
    abortSignal: AbortSignal,
) {
    return post(`app/env/${appId}/${envId}`, payload, {
        signal: abortSignal,
    })
}

export const getEnvOverrideDeploymentTemplate = async (
    appId: number,
    envId: number,
    chartId: number,
    chartName: string,
): Promise<ResponseType<EnvironmentOverrideDeploymentTemplateDTO>> => {
    const data = await get(`app/env/${appId}/${envId}/${chartId}`)
    return addGUISchemaIfAbsent(data, chartName)
}

export function deleteOverrideDeploymentTemplate(id: number, appId: number, envId: number) {
    return trash(`app/env/reset/${appId}/${envId}/${id}`)
}

export async function getBaseDeploymentTemplate(
    appId: number,
    chartRefId: number,
    abortSignal: AbortSignal,
    chartName: string,
    isTemplateView?: AppConfigProps['isTemplateView'],
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
}: Pick<BaseURLParams, 'appId' | 'envId'>): Promise<GetChartListReturnType> => {
    const chartRefResp = await getChartReferencesForAppAndEnv(+appId, +envId)

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
