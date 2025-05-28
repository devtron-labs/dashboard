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

import { MutableRefObject } from 'react'

import {
    AppType,
    EnvironmentListHelmResult,
    EnvListMinDTO,
    UseUrlFiltersReturnType,
} from '@devtron-labs/devtron-fe-common-lib'

import { AppListFilterConfig, AppListSortableKeys } from '../list-new/AppListType'

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

export interface DevtronAppListProps
    extends Pick<UseUrlFiltersReturnType<AppListSortableKeys>, 'changePage' | 'changePageSize' | 'handleSorting'> {
    filterConfig: AppListFilterConfig
    appFiltersResponseLoading: boolean
    environmentList: EnvListMinDTO[]
    namespaceList: EnvironmentListHelmResult[]
    isArgoInstalled: boolean
    syncListData: boolean
    updateDataSyncing: (loading: boolean) => void
    clearAllFilters: () => void
    setCurrentAppName: (appName: string) => void
    setAppCount: (appCount: number) => void
    appListContainerRef: MutableRefObject<HTMLDivElement>
}

export const OrderBy = {
    ASC: 'ASC',
    DESC: 'DESC',
}

export const SortBy = {
    APP_NAME: 'appNameSort',
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

export interface GetEnvironmentsFromClusterNamespaceProps {
    selectedClusterIds: number[]
    selectedNamespaces: string[]
    environmentList: EnvListMinDTO[]
    namespaceList: EnvironmentListHelmResult[]
}

export interface DevtronAppExpandedState {
    expandedRow: Record<number, boolean>
    isAllExpanded: boolean
    isAllExpandable: boolean
}
