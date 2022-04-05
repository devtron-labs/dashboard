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
    return get(
        `${Routes.HELM_RELEASE_DEPLOYMENT_HISTORY_API}?${
            isExternal ? `appId=${appId}&installedAppId=` : `installedAppId=${appId}&appId=`
        }`,
    )
}

export const getDeploymentManifestDetails = (
    appId: string,
    version: number,
    isExternal: boolean,
): Promise<ChartDeploymentManifestDetailResponse> => {
    return get(
        `${Routes.HELM_RELEASE_DEPLOYMENT_MANIFEST_DETAILS_API}?${
            isExternal ? `appId=${appId}&installedAppId=` : `installedAppId=${appId}&appId=`
        }&version=${version}`,
    )
}

export const rollbackApplicationDeployment = (request: RollbackReleaseRequest): Promise<RollbackReleaseResponse> => {
    return put(Routes.HELM_DEPLOYMENT_ROLLBACK_API, request)
}
