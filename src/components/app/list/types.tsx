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

import React from 'react'
import { AppType, ServerError } from '@devtron-labs/devtron-fe-common-lib'
import { RouteComponentProps } from 'react-router-dom'

export interface AppListState {
    code: number
    view: string
    errors: ServerError[]
    apps: App[]
    showCommandBar: boolean
    sortRule: {
        key: string
        order: string
    }
    size: number
    offset: number
    pageSize: number
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

export interface EnvironmentClusterList {
    environmentClusterAppListData: any
}

export interface AppListProps extends RouteComponentProps<{ route: string }> {
    payloadParsedFromUrl?: any
    serverMode?: string
    clearAllFilters: () => void
    sortApplicationList: (key: string) => void
    appListCount: number
    isSuperAdmin: boolean
    openDevtronAppCreateModel: (event) => void
    setAppCount: React.Dispatch<React.SetStateAction<number>>
    updateDataSyncing: (loading: boolean) => void
    isArgoInstalled: boolean
    environmentClusterList: EnvironmentClusterList
    setCurrentAppName: (appName: string) => void
}

export interface AppListViewProps extends AppListState, RouteComponentProps<{}> {
    expandRow: (id: number | null) => void
    closeExpandedRow: (id: number | null) => void
    sort: (key: string) => void
    handleEditApp: (appId: number) => void
    redirectToAppDetails: (app, envId: number) => string
    clearAll: () => void
    changePage: (pageNo: number) => void
    changePageSize: (size: number) => void
    appListCount: number
    isSuperAdmin: boolean
    openDevtronAppCreateModel: (event) => void
    updateDataSyncing: (loading: boolean) => void
    toggleExpandAllRow: () => void
    isArgoInstalled: boolean
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
    isSuperAdmin: boolean
    appListCount: number
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
