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

import React, { Dispatch, RefObject, SetStateAction } from 'react'
import { GroupBase } from 'react-select'

import {
    ApiResourceGroupType,
    FiltersTypeEnum,
    GVKOptionValueType,
    GVKType,
    K8SObjectBaseType,
    K8sResourceDetailDataType,
    K8sResourceDetailType,
    OptionType,
    ResourceDetail,
    ResourceRecommenderActionMenuProps,
    SelectedResourceType,
    SelectPickerOptionType,
    ServerErrors,
    TableViewWrapperProps,
} from '@devtron-labs/devtron-fe-common-lib'

import { UseTabsReturnType } from '@Components/common/DynamicTabs/types'

import { ClusterListType } from '../ClusterNodes/types'
import { LogSearchTermType } from '../v2/appDetails/appDetails.type'
import { K8sResourceListFilterType } from './ResourceList/types'

export interface K8SObjectType extends K8SObjectBaseType {
    child: ApiResourceGroupType[]
}

export interface K8SObjectChildMapType {
    isGrouped?: boolean
    data: ApiResourceGroupType[]
}

export interface K8SObjectMapType extends K8SObjectBaseType {
    child: Map<string, K8SObjectChildMapType>
}

export interface ClusterDetailBaseParams {
    clusterId: string
}

export interface CreateResourcePayload {
    clusterId: number
    manifest: string
}

export enum CreateResourceStatus {
    failed = 'Failed',
    created = 'Created',
    updated = 'Updated',
}

export interface ResourceDetailsPropType extends LogSearchTermType {
    selectedResource: SelectedResourceType
}

export interface CreateResourceType {
    closePopup: (refreshData?: boolean) => void
    clusterId: string
}

export interface SidebarType {
    apiResources: ApiResourceGroupType[]
    isClusterError?: boolean
    updateK8sResourceTab: ClusterListType['updateTabUrl']
    updateTabLastSyncMoment: UseTabsReturnType['updateTabLastSyncMoment']
    selectedResource: ApiResourceGroupType
}

export interface ClusterOptionType extends OptionType {
    isProd: boolean
    installationId: number
    isClusterInCreationPhase: boolean
}

export interface ResourceFilterOptionsProps
    extends Pick<TableViewWrapperProps<unknown, FiltersTypeEnum.URL>, 'updateSearchParams' | 'filteredRows'>,
        Partial<Pick<K8sResourceListFilterType, 'eventType'>> {
    selectedResource: ApiResourceGroupType
    selectedCluster?: ClusterOptionType
    selectedNamespace?: string
    searchText?: string
    setSearchText?: (text: string) => void
    isSearchInputDisabled?: boolean
    renderRefreshBar?: () => JSX.Element
    /**
     * Placeholder override for the search bar
     *
     * @default undefined
     */
    searchPlaceholder?: string
    isResourceListLoading?: boolean
    gvkFilterConfig?: {
        gvkOptions: GroupBase<SelectPickerOptionType<GVKOptionValueType>>[]
        areGVKOptionsLoading: boolean
        reloadGVKOptions: () => void
        gvkOptionsError: ServerErrors
    }
    selectedAPIVersionGVKFilter?: string
    selectedKindGVKFilter?: string
    resourceRecommenderConfig?: {
        showAbsoluteValuesInResourceRecommender: boolean
        setShowAbsoluteValuesInResourceRecommender: Dispatch<SetStateAction<boolean>>
        resourceLastScannedOnDetails: Omit<ResourceRecommenderActionMenuProps, 'children'>
    }
}

export interface K8SResourceListType
    extends Omit<ResourceFilterOptionsProps, 'areFiltersHidden' | 'updateSearchParams' | 'eventType' | 'filteredRows'>,
        Pick<SidebarType, 'updateK8sResourceTab'> {
    addTab: UseTabsReturnType['addTab']
    lowercaseKindToResourceGroupMap: Record<string, ApiResourceGroupType>
    clusterName: string
}

export interface ResourceBrowserActionMenuType {
    clusterId: string
    resourceData: K8sResourceDetailDataType
    selectedResource: ApiResourceGroupType
    handleResourceClick: (e: {
        currentTarget: Pick<React.MouseEvent<HTMLButtonElement>['currentTarget'], 'dataset'>
    }) => void
    handleClearBulkSelection: () => void
    removeTabByIdentifier?: UseTabsReturnType['removeTabByIdentifier']
    getResourceListData?: () => Promise<void>
    /**
     * If true, the delete resource option is hidden in pop up menu
     *
     * @default false
     */
    hideDeleteResource?: boolean
}

export interface DeleteResourcePopupType
    extends Pick<
        ResourceBrowserActionMenuType,
        | 'clusterId'
        | 'resourceData'
        | 'selectedResource'
        | 'getResourceListData'
        | 'removeTabByIdentifier'
        | 'handleClearBulkSelection'
    > {
    toggleDeleteDialog: () => void
}

export interface ResourceListEmptyStateType {
    imgSource?: string
    title?: string
    subTitle: string
    actionButtonText?: string
    actionHandler?: () => void
}

export interface EventListType {
    listRef: React.MutableRefObject<HTMLDivElement>
    filteredData: K8sResourceDetailType['data']
    handleResourceClick: (e: React.MouseEvent<HTMLButtonElement>) => void
    searchText: string
    clusterId: string
}

export interface ConnectingToClusterStateProps {
    loader: boolean
    errorMsg: string
    selectedCluster: ClusterOptionType
    handleRetry: React.MouseEventHandler<HTMLButtonElement>
    requestAbortController: AbortController
}

interface K8sObjectOptionTypeDataset extends Pick<ApiResourceGroupType, 'shortNames'> {
    group: string
    version: string
    kind: string
    namespaced: string
    grouped: string
}

export interface K8sObjectOptionType extends OptionType {
    description: string
    dataset: K8sObjectOptionTypeDataset
    groupName: string
}

export interface K8SResourceTabComponentProps
    extends Pick<SidebarType, 'updateK8sResourceTab' | 'updateTabLastSyncMoment'>,
        Pick<K8SResourceListType, 'clusterName' | 'lowercaseKindToResourceGroupMap'> {
    selectedCluster: ClusterOptionType
    renderRefreshBar: () => JSX.Element
    addTab: UseTabsReturnType['addTab']
}

export interface AdminTerminalProps {
    updateTabUrl: UseTabsReturnType['updateTabUrl']
}

export interface ClusterSelectorType {
    onChange: ({ label, value }) => void
    clusterList: ClusterOptionType[]
    clusterId: string
    isClusterListLoading: boolean
    isInstallationStatusView?: boolean
}

export interface CreateResourceButtonType {
    clusterId: string
    closeModal: CreateResourceType['closePopup']
}

export interface RBSidebarKeysType {
    nodes: string
    events: string
    namespaces: string
    eventGVK: GVKType
    namespaceGVK: GVKType
    nodeGVK: GVKType
    overviewGVK: GVKType
    monitoringGVK: GVKType
    upgradeClusterGVK: GVKType
    resourceRecommenderGVK: GVKType
}

export interface GetTabsBasedOnRoleParamsType {
    selectedCluster: ClusterOptionType
    canRenderResourceRecommender: boolean
}

export interface NodeRowDetail {
    name: string
    status: string
    roles: string[]
    errors: Record<string, string>[]
    k8sVersion: string
    podCount: number
    taintCount: number
    cpu: ResourceDetail
    memory: ResourceDetail
    age: string
}

export interface NodeListSearchFilterType
    extends Pick<
        TableViewWrapperProps<K8sResourceDetailDataType, FiltersTypeEnum.URL>,
        'visibleColumns' | 'setVisibleColumns' | 'allColumns' | 'rows' | 'handleSearch' | 'searchKey'
    > {
    searchParams: Record<string, any>
}

export enum NODE_SEARCH_KEYS {
    LABEL = 'label',
    NODE_GROUP = 'nodeGroup',
}

export interface ColumnSelectorType
    extends Pick<NodeListSearchFilterType, 'visibleColumns' | 'setVisibleColumns' | 'allColumns'> {}

export interface NodeActionsMenuProps {
    addTab: UseTabsReturnType['addTab']
    nodeData: K8sResourceDetailDataType
    getNodeListData: () => void
    handleClearBulkSelection: () => void
}

export interface GetResourceDataType {
    selectedResource: ApiResourceGroupType
    selectedNamespace: string
    clusterId: string
    filters: Record<string, unknown>
    abortControllerRef: RefObject<AbortController>
}

export type ShowAIButtonConfig = { column: string } & (
    | {
          includeValues: Set<string>
          excludeValues?: never
      }
    | { excludeValues: Set<string>; includeValues?: never }
)

export type RBResourceSidebarDataAttributeType = {
    'data-group': string
    'data-version': string
    'data-kind': string
}
