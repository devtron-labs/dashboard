import { Routes } from '../../config'
import { get } from '../../services/api'
import { ResponseType } from '../../services/service.types'
import { ConfigAppList, EnvApp, EnvDeploymentStatus } from './EnvironmentGroup.types'

export interface ConfigAppListType extends ResponseType {
    result?: ConfigAppList[]
}
export interface EnvAppType extends ResponseType {
    result?: EnvApp
}

export interface EnvDeploymentStatusType extends ResponseType {
    result?: EnvDeploymentStatus[]
}

export const getConfigAppList = (envId: number): Promise<ConfigAppListType> => {
    return get(`${Routes.ENVIRONMENT}/${envId}/${Routes.ENV_APPLICATIONS}`)
}

export const getEnvAppList = (params?: {
    envName?: string
    clusterIds?: string
    offset?: string
    size?: string
}): Promise<EnvAppType> => {
    const urlParams = Object.entries(params).map(([key, value]) => {
        if (!value) return
        return `${key}=${value}`
    })
    return get(`${Routes.ENVIRONMENT_APPS}?${urlParams.filter((s) => s).join('&')}`)
}

export const getDeploymentStatus = (envId: number): Promise<EnvDeploymentStatusType> => {
    return get(`${Routes.ENVIRONMENT}/${envId}/${Routes.ENV_DEPLOYMENT_STATUS}`)
}
