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

export enum FLUX_CD_TEMPLATE_TYPE {
    KUSTOMIZATION = 'Kustomization',
    HELM_RELEASE = 'HelmRelease',
}
export interface GenericAppType {
    appName: string
    appStatus: string
    clusterName: string
    namespace: string
    syncStatus?: string
    clusterId?: string
    fluxAppDeploymentType?: FLUX_CD_TEMPLATE_TYPE
}
export interface GenericAppListResponse extends ResponseType {
    result: {
        clusterIds?: string
        fluxApplication?: GenericAppType[]
    }
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

interface HelmAppsListResult {
    clusterIds: number[]
    applicationType: string // DEVTRON-CHART-STORE, DEVTRON-APP ,HELM-APP
    errored: boolean
    errorMsg: string
    helmApps: HelmApp[]
}

export interface HelmAppListResponse extends ResponseType {
    result?: HelmAppsListResult
}
