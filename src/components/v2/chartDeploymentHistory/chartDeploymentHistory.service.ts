import { Routes } from '../../../config'
import { get, put } from '../../../services/api'
import { ResponseType } from '../../../services/service.types'
import { ActionResponse, ChartMetadata, DeployedAt, InstalledAppInfo } from '../../external-apps/ExternalAppService'

export interface ChartDeploymentManifestDetail {
    manifest?: string
    valuesYaml?: string
}
export interface ChartDeploymentManifestDetailResponse extends ResponseType {
    result?: ChartDeploymentManifestDetail
}

export interface DeploymentHistoryAndInstalledAppInfo {
    deploymentHistory: ChartDeploymentDetail[]
    installedAppInfo: InstalledAppInfo
}

export interface ChartDeploymentHistoryResponse extends ResponseType {
    result?: DeploymentHistoryAndInstalledAppInfo
}

export interface ChartDeploymentDetail {
    chartMetadata: ChartMetadata
    dockerImages: string[]
    version: number
    installedAppVersionId?: number
    deployedAt: DeployedAt
}

export interface RollbackReleaseRequest {
    version: number
    hAppId?: string
    installedAppId?: number
    installedAppVersionId?: number
}

interface RollbackReleaseResponse extends ResponseType {
    result?: ActionResponse
}

export const getDeploymentHistory = (appId: string, isExternal: boolean): Promise<ChartDeploymentHistoryResponse> => {
    const url = isExternal
        ? `${Routes.HELM_RELEASE_DEPLOYMENT_HISTORY_API}?appId=${appId}`
        : `${Routes.APP_RELEASE_DEPLOYMENT_HISTORY_API}?installedAppId=${appId}`
    return get(url)
}

export const getDeploymentManifestDetails = (
    appId: string,
    version: number,
    isExternal: boolean,
): Promise<ChartDeploymentManifestDetailResponse> => {
    const url = isExternal
        ? `${Routes.HELM_RELEASE_DEPLOYMENT_DETAIL_API}?appId=${appId}&version=${version}`
        : `${Routes.APP_RELEASE_DEPLOYMENT_DETAIL_API}?installedAppId=${appId}&version=${version}`
    return get(url)
}

export const rollbackApplicationDeployment = (
    request: RollbackReleaseRequest,
    useDefaultRollbackAPI: boolean,
): Promise<RollbackReleaseResponse> => {
    const url = useDefaultRollbackAPI ? Routes.APP_DEPLOYMENT_ROLLBACK_API : Routes.HELM_DEPLOYMENT_ROLLBACK_API
    return put(url, request)
}
