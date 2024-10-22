import { Routes } from '@Config/constants'
import { BaseURLParams, get, post, put, ResponseType, trash } from '@devtron-labs/devtron-fe-common-lib'
import { getChartReferencesForAppAndEnv } from '@Services/service'
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

export const createBaseDeploymentTemplate = (request: UpdateBaseDTPayloadType, abortSignal: AbortSignal) => {
    const URL = `${Routes.DEPLOYMENT_TEMPLATE}`
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
): Promise<ResponseType<DeploymentTemplateConfigDTO>> {
    const response = await get(`${Routes.DEPLOYMENT_TEMPLATE}/${appId}/${chartRefId}`, {
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
