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

import { ResponseType, SERVER_MODE, SortingOrder } from '@devtron-labs/devtron-fe-common-lib'
import { Cluster } from '@Services/service.types'
import { DevtronAppListProps } from '../list/types'

export enum FluxCDTemplateType {
    KUSTOMIZATION = 'Kustomization',
    HELM_RELEASE = 'HelmRelease',
}

export enum AppStatuses {
    DEGRADED = 'Degraded',
    HEALTHY = 'Healthy',
    HIBERNATING = 'Hibernating',
    MISSING = 'Missing',
    PROGRESSING = 'Progressing',
    NOT_DEPLOYED = 'Not Deployed',
}

export interface GenericAppType {
    appName: string
    appStatus: string
    clusterName: string
    namespace: string
    syncStatus?: string
    clusterId?: string
    fluxAppDeploymentType?: FluxCDTemplateType
}
export interface GenericAppListResponse {
    clusterIds?: string
    fluxApplication?: GenericAppType[]
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

export interface AppListPayloadType {
    environments: number[]
    teams: number[]
    namespaces: string[]
    appNameSearch: string
    appStatuses: string[]
    sortBy: AppListSortableKeys
    sortOrder: SortingOrder
    offset: number
    size: number
}

export enum AppListSortableKeys {
    APP_NAME = 'appNameSort',
    LAST_DEPLOYED = 'lastDeployedSort',
}

export enum AppListUrlFilters {
    appStatus = 'appStatus',
    project = 'project',
    environment = 'environment',
    namespace = 'namespace',
    cluster = 'cluster',
    templateType = 'templateType',
}

export interface AppListUrlFiltersType extends Record<AppListUrlFilters, string[]> {}

export interface AppListFilterConfig
    extends AppListUrlFiltersType,
        Pick<AppListPayloadType, 'sortBy' | 'sortOrder' | 'offset'> {
    pageSize: number
    searchKey: string
}

export interface HelmAppListProps
    extends Pick<
        DevtronAppListProps,
        | 'filterConfig'
        | 'appFiltersResponseLoading'
        | 'clearAllFilters'
        | 'handleSorting'
        | 'changePage'
        | 'changePageSize'
        | 'isArgoInstalled'
        | 'syncListData'
        | 'updateDataSyncing'
    > {
    clusterIdsCsv: string
    serverMode: SERVER_MODE
    fetchingExternalApps: boolean
    setFetchingExternalAppsState
    clusterList: Cluster[]
}

export interface GenericAppListProps
    extends Pick<
            DevtronAppListProps,
            | 'filterConfig'
            | 'appFiltersResponseLoading'
            | 'clearAllFilters'
            | 'handleSorting'
            | 'changePage'
            | 'changePageSize'
        >,
        Pick<HelmAppListProps, 'clusterIdsCsv'> {
    appType: string
    clusterList: Cluster[]
}
