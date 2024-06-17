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

export interface AppEnvironmentDetail {
    environmentName: string
    environmentId: number
    namespace: string
    clusterName: string
    clusterId: number
    isVirtualEnvironment?: boolean
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

interface AppsListResult {
    clusterIds: number[]
    applicationType: string // DEVTRON-CHART-STORE, DEVTRON-APP ,HELM-APP
    errored: boolean
    errorMsg: string
    helmApps: HelmApp[]
}

export interface AppListResponse extends ResponseType {
    result?: AppsListResult
}

export enum FLUX_CD_DEPLOYMENT_TYPE {
    KUSTOMIZATION = 'Kustomization',
    HELM_RELEASE = 'Helm Release',
}
export interface FluxCDApp {
    appName: string
    appStatus: string
    isKustomizeApp: boolean
    clusterName: string
    namespace: string
    clusterId: number
}

export interface FluxCDAppListResult {
    fluxApplication: FluxCDApp[]
}
export interface FluxCDAppListResponse extends ResponseType {
    result?: FluxCDAppListResult
}
