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

import {
    ALL_NAMESPACE_OPTION,
    ApiResourceGroupType,
    GVKType,
    IconName,
    InitTabType,
    K8SObjectBaseType,
    K8sResourceDetailDataType,
    K8sResourceDetailType,
    OptionType,
    ResourceDetail,
    SelectedResourceType,
    SelectPickerOptionType,
} from '@devtron-labs/devtron-fe-common-lib'

import { UseTabsReturnType } from '@Components/common/DynamicTabs/types'

import { ClusterListType } from '../ClusterNodes/types'
import { LogSearchTermType } from '../v2/appDetails/appDetails.type'
import { BaseResourceListProps } from './ResourceList/types'

export interface K8SObjectType extends K8SObjectBaseType {
    child: ApiResourceGroupType[]
}

export interface K8SObjectChildMapType {
    isGrouped?: boolean
    isExpanded: boolean
    data: ApiResourceGroupType[]
}

export interface K8SObjectMapType extends K8SObjectBaseType {
    child: Map<string, K8SObjectChildMapType>
}

export interface URLParams {
    clusterId: string
    namespace: string
    nodeType: string
    group?: string
    node?: string
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

export enum ResourceStatusFilter {
    ALL = 'All',
    HEALTHY = 'Healthy',
    PENDING = 'Pending',
    ERROR = 'Error',
    COMPLETED = 'Completed',
    UNKNOWN = 'Unknown',
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
    updateK8sResourceTabLastSyncMoment: () => void
    isOpen: boolean
    isClusterError?: boolean
    updateK8sResourceTab: ClusterListType['updateTabUrl']
    selectedResource: ApiResourceGroupType
    setSelectedResource: React.Dispatch<React.SetStateAction<ApiResourceGroupType>>
    selectedResourceStatus: ResourceStatusFilter
    setSelectedResourceStatus: Dispatch<SetStateAction<ResourceStatusFilter>>
}

export interface ClusterOptionType extends OptionType {
    isProd: boolean
    installationId: number
    isClusterInCreationPhase: boolean
}

export interface ResourceFilterOptionsProps extends Pick<SidebarType, 'updateK8sResourceTab'> {
    selectedResource: ApiResourceGroupType
    resourceList?: K8sResourceDetailType
    selectedCluster?: ClusterOptionType
    selectedNamespace?: typeof ALL_NAMESPACE_OPTION
    setSelectedNamespace?: React.Dispatch<React.SetStateAction<OptionType>>
    searchText?: string
    isOpen: boolean
    setSearchText?: (text: string) => void
    isSearchInputDisabled?: boolean
    renderRefreshBar?: () => JSX.Element
    /**
     * If true, the filters are hidden except search
     */
    areFiltersHidden: boolean
    /**
     * Placeholder override for the search bar
     *
     * @default undefined
     */
    searchPlaceholder?: string

    isResourceStatusFilterEnabled: boolean
    resourceStatusFilter: ResourceStatusFilter
    onResourceStatusFilterChange: (selectedStatus: SelectPickerOptionType<ResourceStatusFilter>) => void
}

export interface K8SResourceListType
    extends Omit<
        ResourceFilterOptionsProps,
        'areFiltersHidden' | 'isResourceStatusFilterEnabled' | 'resourceStatusFilter' | 'onResourceStatusFilterChange'
    > {
    addTab: UseTabsReturnType['addTab']
    handleResourceClick: (e: React.MouseEvent<HTMLButtonElement>, shouldOverrideSelectedResourceKind?: boolean) => void
    lowercaseKindToResourceGroupMap: Record<string, ApiResourceGroupType>
    clusterName: string
    setSelectedResourceStatus: Dispatch<SetStateAction<ResourceStatusFilter>>
}

export interface ResourceBrowserActionMenuType {
    clusterId: string
    resourceData: K8sResourceDetailDataType
    selectedResource: ApiResourceGroupType
    handleResourceClick: (e: React.MouseEvent<HTMLButtonElement>) => void
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
    extends Pick<SidebarType, 'selectedResource' | 'setSelectedResource' | 'updateK8sResourceTab'>,
        Pick<K8SResourceListType, 'handleResourceClick' | 'clusterName' | 'lowercaseKindToResourceGroupMap'> {
    selectedCluster: ClusterOptionType
    renderRefreshBar: () => JSX.Element
    addTab: UseTabsReturnType['addTab']
    updateK8sResourceTabLastSyncMoment: () => void
    isOpen: boolean
}

export interface AdminTerminalProps {
    updateTerminalTabUrl: (queryParams: string) => void
}

export interface SidebarChildButtonPropsType {
    parentRef: React.Ref<HTMLButtonElement>
    group: string
    version: string
    kind: string
    text: string
    namespaced: boolean
    isSelected: boolean
    onClick: React.MouseEventHandler<HTMLButtonElement>
    icon?: IconName
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
    embeddedSloopGVK: GVKType
    upgradeClusterGVK: GVKType
}

export interface GetTabsBasedOnRoleParamsType {
    selectedCluster: ClusterOptionType
    namespace: string
    dynamicTabData: InitTabType
    /**
     * @default false
     */
    isTerminalSelected?: boolean
    /**
     * @default false
     */
    isOverviewSelected?: boolean
    /**
     * @default false
     */
    isMonitoringDashBoardSelected?: boolean
    /**
     * @default false
     */
    isEmbeddedSloopSelected?: boolean
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

export interface NodeListSearchFilterType extends Pick<ResourceFilterOptionsProps, 'isOpen'> {
    visibleColumns: string[]
    setVisibleColumns: React.Dispatch<React.SetStateAction<string[]>>
    searchParams: Record<string, string>
}

export enum NODE_SEARCH_KEYS {
    NAME = 'name',
    LABEL = 'label',
    NODE_GROUP = 'nodeGroup',
}

export interface ColumnSelectorType extends Pick<NodeListSearchFilterType, 'visibleColumns' | 'setVisibleColumns'> {}

export interface NodeActionsMenuProps {
    addTab: UseTabsReturnType['addTab']
    nodeData: K8sResourceDetailDataType
    getNodeListData: () => void
    handleClearBulkSelection: () => void
}

export interface GetResourceDataType {
    selectedResource: ApiResourceGroupType
    selectedNamespace: BaseResourceListProps['selectedNamespace']
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
