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

import {
    EnvironmentListHelmResponse,
    GroupedFilterSelectPickerProps,
    InfrastructureManagementAppListType,
    ResponseType,
    SERVER_MODE,
    SortingOrder,
    UseUrlFiltersReturnType,
} from '@devtron-labs/devtron-fe-common-lib'

import { getCommonAppFilters } from '@Services/service'
import { Cluster } from '@Services/service.types'

import { DevtronAppListProps } from '../list/types'
import { APP_LIST_HEADERS } from './Constants'

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

// Values to be sent in payload for app status filter in devtron app list API
export enum AppStatusesDTO {
    DEGRADED = 'Degraded',
    HEALTHY = 'Healthy',
    HIBERNATING = 'HIBERNATING',
    MISSING = 'Missing',
    PROGRESSING = 'Progressing',
    NOT_DEPLOYED = 'NOT DEPLOYED',
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
        | 'clearAllFilters'
        | 'handleSorting'
        | 'changePage'
        | 'changePageSize'
        | 'isArgoInstalled'
        | 'syncListData'
        | 'updateDataSyncing'
        | 'appListContainerRef'
    > {
    clusterIdsCsv: string
    serverMode: SERVER_MODE
    fetchingExternalApps: boolean
    setFetchingExternalAppsState: (fetchingExternalApps: boolean) => void
    clusterList: Cluster[]
    setShowPulsatingDot: (showPulsatingDot: boolean) => void
}

export interface GenericAppListProps
    extends Pick<
            DevtronAppListProps,
            | 'filterConfig'
            | 'clearAllFilters'
            | 'handleSorting'
            | 'changePage'
            | 'changePageSize'
            | 'appListContainerRef'
        >,
        Pick<HelmAppListProps, 'clusterIdsCsv' | 'setShowPulsatingDot'> {
    appType: InfrastructureManagementAppListType
    clusterList: Cluster[]
}

export interface AppListFiltersProps
    extends Pick<DevtronAppListProps, 'filterConfig' | 'isArgoInstalled'>,
        Pick<
            UseUrlFiltersReturnType<AppListSortableKeys, AppListUrlFiltersType>,
            'updateSearchParams' | 'handleSearch'
        > {
    appListFiltersLoading: boolean
    appCount: number
    isExternalArgo: boolean
    isExternalFlux: boolean
    appListFiltersResponse: Awaited<ReturnType<typeof getCommonAppFilters>>
    appListFiltersError: any
    reloadAppListFilters: () => void
    showPulsatingDot: boolean
    serverMode: SERVER_MODE
    appType: InfrastructureManagementAppListType
    getFormattedFilterValue: (filterKey: AppListUrlFilters, filterValue: string) => string
    namespaceListError: any
    reloadNamespaceList: () => void
    namespaceListResponse: EnvironmentListHelmResponse
    syncNow?: () => void
    lastSyncTimeString?: string
    isDataSyncing: boolean
    showExportCsvButton: boolean
}

export interface useFilterOptionsProps
    extends Pick<
        AppListFiltersProps,
        | 'appListFiltersResponse'
        | 'namespaceListResponse'
        | 'getFormattedFilterValue'
        | 'isExternalArgo'
        | 'isExternalFlux'
    > {}

export interface GetDevtronHelmAppListParamsType {
    appStatuses: string
    clusterIds: string
}

export interface AskToClearFiltersProps extends Pick<DevtronAppListProps, 'clearAllFilters'> {
    showTipToSelectCluster?: boolean
}

export type AppListFilterMenuItemType =
    GroupedFilterSelectPickerProps<AppListUrlFilters>['options'][number]['items'][number]

export interface GetAppListFiltersParams {
    clusterIdsCsv: string
    isExternalArgo: boolean
    isExternalFlux: boolean
    isArgoInstalled: boolean
    serverMode: SERVER_MODE
    selectedEnvironments: { label: string; value: string }[]
}

export interface ExportAppListDataType {
    appName: string
    appId: number | string
    projectName: string
    projectId: number | string
    status: string
    environmentName: string
    environmentId: number | string
    clusterName: string
    clusterId: number | string
    namespace: string
    namespaceId: number | string
    lastDeployedTime: string
}

export type GenericAppListRowType = {
    detail: GenericAppType
} & Record<AppListSortableKeys | keyof typeof APP_LIST_HEADERS, string | GenericAppType>
