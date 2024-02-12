import { ResponseType } from '@devtron-labs/devtron-fe-common-lib'

export interface ArgoAppListResult {
    appName: string
    clusterName: string
    namespace: string
    appStatus: string
    syncStatus?: string
    clusterId?: string
}
export interface ArgoAppListResponse extends ArgoAppListResult {
    result?: ArgoAppListResult
}

export interface AppListResponse extends ResponseType {
    result?: AppsListResult
}

interface AppsListResult {
    clusterIds: number[]
    applicationType: string 
    errored: boolean
    errorMsg: string
    helmApps: HelmApp[]
}

export interface HelmApp {
    appName: string
    appId: string
    isExternal: boolean
    chartName: string
    chartVersion: string
    chartAvatar: string
    projectId: number
    lastDeployedAt: string
    environmentDetail: AppEnvironmentDetail
    appStatus: string
}

export interface AppEnvironmentDetail {
    environmentName: string
    environmentId: number
    namespace: string
    clusterName: string
    clusterId: number
    isVirtualEnvironment?: boolean
}
