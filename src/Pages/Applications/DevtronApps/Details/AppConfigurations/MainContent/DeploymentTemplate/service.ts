import { Routes } from '@Config/constants'
import { get, post, put, ResponseType, trash } from '@devtron-labs/devtron-fe-common-lib'
import { DeploymentTemplateConfigDTO, EnvironmentOverrideDeploymentTemplateDTO } from './types'
import { addGUISchemaIfAbsent } from './utils'

export const updateBaseDeploymentTemplate = (request, abortSignal) => {
    const URL = `${Routes.DEPLOYMENT_TEMPLATE_UPDATE}`
    return post(URL, request, {
        signal: abortSignal,
    })
}

export const createBaseDeploymentTemplate = (request, abortSignal) => {
    const URL = `${Routes.DEPLOYMENT_TEMPLATE}`
    return post(URL, request, {
        signal: abortSignal,
    })
}

export function updateEnvDeploymentTemplate(payload, abortSignal) {
    return put('app/env', payload, {
        signal: abortSignal,
    })
}

export function createEnvDeploymentTemplate(appId, envId, payload, abortSignal) {
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
