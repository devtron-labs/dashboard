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

import { AppType, EnvironmentListHelmResult, EnvListMinDTO, ServerError } from '@devtron-labs/devtron-fe-common-lib'
import { AppListFilterConfig, AppListSortableKeys } from '../list-new/AppListType'

export interface AppListState {
    code: number
    view: string
    errors: ServerError[]
    apps: App[]
    showCommandBar: boolean
    size: number
    expandedRow: Record<number, boolean>
    isAllExpanded: boolean
    isAllExpandable: boolean
}

export interface App {
    id: number
    name: string
    environments: Array<Environment & { default: boolean }>
    defaultEnv: Environment | null
}

export interface Environment {
    id: number
    name: string
    status: string
    appStatus: string
    lastDeployedTime: string
    materialInfo: {
        author: string
        branch: string
        message: string
        modifiedTime: string
        revision: string
        url: string
        gitMaterialName: string
        webhookData: string
    }[]
    ciArtifactId: number
    clusterName: string
    namespace: string
    isVirtualEnvironment?: boolean
}

export interface DevtronAppListProps {
    filterConfig: AppListFilterConfig
    appFiltersResponseLoading: boolean
    environmentList: EnvListMinDTO[]
    namespaceList: EnvironmentListHelmResult[]
    isArgoInstalled: boolean
    syncListData: boolean
    updateDataSyncing: (loading: boolean) => void
    clearAllFilters: () => void
    setCurrentAppName: (appName: string) => void
    changePage: (pageNo: number) => void
    changePageSize: (pageSize: number) => void
    handleSorting: (sortBy: AppListSortableKeys) => void
    setAppCount: (appCount: number) => void
}

export interface AppListResponse {
    appId: number
    appName: string
    environments: AppListEnvironmentResponse
}

export interface AppListEnvironmentResponse {
    appId: number
    appName: string
    environmentId: number
    environmentName: string
    deploymentCounter?: number
    instanceCounter?: number
    status?: string
    lastDeployedTime?: string
    namespace?: string
    prometheusEndpoint?: string
    default?: boolean
    lastSuccessDeploymentDetail?: DeploymentDetailContainerResponse
}

export interface DeploymentDetailContainerResponse {
    appId: number
    appName: string
    environmentId: number
    environmentName: string
    statusMessage?: string
    LastDeployedBy?: string
    status?: string
    lastDeployedTime?: string
    namespace?: string
    prometheusEndpoint?: string
    default?: boolean
    materialInfo?: any
    releaseVersion?: string
    dataSource?: string
    lastDeployedPipeline?: string
}

export const OrderBy = {
    ASC: 'ASC',
    DESC: 'DESC',
}

export const SortBy = {
    APP_NAME: 'appNameSort',
    LAST_DEPLOYED: 'lastDeployedSort',
    STATUS: 'statusSort',
    ENVIRONMENT: 'environmentSort',
}

export interface AppListPropType {
    isArgoInstalled: boolean
}

export interface TriggerURL {
    appId?: string
    envId: string
    installedAppId?: string
    close: () => void
    isExternalApp?: boolean
    appType: AppType
}

export interface ManifestUrlList {
    kind: string
    name: string
    pointsTo: string
    urls: string[]
}

export interface CopyToClipboardTextProps {
    text: string
    rootClassName?: string
    iconClass?: string
    placement?: 'top' | 'bottom' | 'left' | 'right'
}
