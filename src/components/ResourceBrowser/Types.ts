import React from 'react'
import { ResponseType } from '@devtron-labs/devtron-fe-common-lib'
import { Nodes, NodeType, OptionType } from '../app/types'
import { LogSearchTermType, SelectedResourceType } from '../v2/appDetails/appDetails.type'
import { ClusterDetail } from '../ClusterNodes/types'
import { useTabs } from '../common/DynamicTabs'

export interface ResourceDetailType {
    headers: string[]
    data: Record<string, any>[]
}

export interface GVKType {
    Group: string
    Version: string
    Kind: Nodes | NodeType
}

export interface ResourceListResponse extends ResponseType {
    result?: ResourceDetailType
}

export interface ApiResourceGroupType {
    gvk: GVKType
    namespaced: boolean
    isGrouped?: boolean
}

export interface ApiResourceType {
    apiResources: ApiResourceGroupType[]
    allowedAll: boolean
}

export interface APIResourceResponse extends ResponseType {
    result?: ApiResourceType
}

export interface K8SObjectBaseType {
    name: string
    isExpanded: boolean
}

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

export interface ResourceListPayloadType {
    clusterId: number
    k8sRequest: {
        resourceIdentifier: {
            groupVersionKind: GVKType
            namespace?: string
            name?: string
        }
        patch?: string
        forceDelete?: boolean
    }
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

export interface ResourceType {
    kind: string
    name: string
    isUpdate: boolean
    error: string
}

export interface CreateResourceResponse extends ResponseType {
    result?: ResourceType[]
}

export interface ResourceDetailsPropType extends LogSearchTermType {
    selectedResource: SelectedResourceType
}

export interface ClusterSelectionType {
    clusterOptions: ClusterDetail[]
    isSuperAdmin: boolean
    clusterListLoader: boolean
    refreshData: () => void
}

export interface CreateResourceType {
    closePopup: (refreshData?: boolean) => void
    clusterId: string
}

export interface SidebarType {
    apiResources: ApiResourceGroupType[]
    selectedResource: ApiResourceGroupType
    setSelectedResource: React.Dispatch<React.SetStateAction<ApiResourceGroupType>>
    updateK8sResourceTab: (url: string, dynamicTitle: string) => void
    updateK8sResourceTabLastSyncMoment: () => void
    isClusterError?: boolean
}

export interface ClusterOptionType extends OptionType {
    errorInConnecting: string
}

export interface ResourceFilterOptionsProps {
    selectedResource: ApiResourceGroupType
    resourceList?: ResourceDetailType
    selectedCluster?: ClusterOptionType
    selectedNamespace?: OptionType
    setSelectedNamespace?: React.Dispatch<React.SetStateAction<OptionType>>
    hideSearchInput?: boolean
    searchText?: string
    setSearchText?: (text: string) => void
    handleFilterChanges: (_searchText: string, _resourceList: ResourceDetailType, hideLoader?: boolean) => void
    isNamespaceSelectDisabled?: boolean
    isSearchInputDisabled?: boolean
    updateK8sResourceTab: (url: string, dynamicTitle?: string) => void
    renderRefreshBar?: () => JSX.Element
}

export interface K8SResourceListType extends Omit<ResourceFilterOptionsProps, 'handleFilterChanges'> {
    addTab: ReturnType<typeof useTabs>['addTab']
    showStaleDataWarning: boolean
}

export interface ResourceBrowserActionMenuType {
    clusterId: string
    resourceData: Record<string, any>
    selectedResource: ApiResourceGroupType
    handleResourceClick: (e: any) => void
    removeTabByIdentifier?: ReturnType<typeof useTabs>['removeTabByIdentifier']
    getResourceListData?: () => void | Promise<void>
}

export interface DeleteResourcePopupType {
    clusterId: string
    resourceData: Record<string, any>
    selectedResource: ApiResourceGroupType
    toggleDeleteDialog: () => void
    removeTabByIdentifier?: ReturnType<typeof useTabs>['removeTabByIdentifier']
    getResourceListData?: () => void | Promise<void>
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
    filteredData: Record<string, any>[]
    handleResourceClick: (e: any) => void
    paginatedView: boolean
    syncError: boolean
    searchText: string
}

export interface ConnectingToClusterStateProps {
    loader: boolean
    errorMsg: string
    selectedCluster: ClusterOptionType
    handleRetry: React.MouseEventHandler<HTMLButtonElement>
    requestAbortController: AbortController
}

export interface K8sObjectOptionType extends OptionType {
    dataset: {
        group: string
        version: string
        kind: string
        namespaced: string
        grouped: string
    }
    groupName: string
}

export interface K8Abbreviates {
    [key: string]: string
}

export interface K8SResourceTabComponentProps {
    selectedCluster: ClusterOptionType
    isSuperAdmin: boolean
    renderRefreshBar: () => JSX.Element
    addTab: ReturnType<typeof useTabs>['addTab']
    showStaleDataWarning: boolean
    updateK8sResourceTab: (url: string, dynamicTitle: string) => void
    updateK8sResourceTabLastSyncMoment: () => void
}

export interface AdminTerminalProps {
    isSuperAdmin: boolean
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
}
