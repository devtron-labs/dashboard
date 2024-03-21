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
    onChangeCluster: (selectedCluster: any, fromClusterSelect?: boolean) => void
    isSuperAdmin: boolean
    clusterListLoader: boolean
    refreshData: () => void
}

export interface CreateResourceType {
    closePopup: (refreshData?: boolean) => void
    clusterId: string
}

export interface SidebarType {
    k8SObjectMap: Map<string, K8SObjectMapType>
    handleGroupHeadingClick: (e: any, preventCollapse?: boolean) => void
    selectedResource: ApiResourceGroupType
    isCreateModalOpen: boolean
    updateTabUrl: ReturnType<typeof useTabs>['updateTabUrl']
    isClusterError?: boolean
}

export interface ClusterOptionType extends OptionType {
    errorInConnecting: string
}

export interface ResourceFilterOptionsProps {
    selectedResource: ApiResourceGroupType
    resourceList: ResourceDetailType
    selectedCluster?: OptionType | ClusterOptionType
    namespaceOptions: OptionType[]
    selectedNamespace: OptionType
    hideSearchInput?: boolean
    searchText: string
    setSearchText: React.Dispatch<React.SetStateAction<string>>
    handleFilterChanges: (_searchText: string, _resourceList: ResourceDetailType, hideLoader?: boolean) => void
    updateTabUrl: ReturnType<typeof useTabs>['updateTabUrl']
    isNamespaceSelectDisabled?: boolean
    isSearchInputDisabled?: boolean
    isCreateModalOpen?: boolean
    renderCallBackSync?: () => JSX.Element
}

export interface K8SResourceListType extends Omit<ResourceFilterOptionsProps, 'handleFilterChanges'> {
    noResults: boolean
    resourceListLoader: boolean
    isCreateModalOpen: boolean
    addTab: (
        idPrefix: string,
        kind: string,
        name: string,
        url: string,
        positionFixed?: boolean,
        iconPath?: string,
    ) => boolean
    k8SObjectMapRaw: Map<string, K8SObjectMapType>
    syncError: boolean
}

export interface ResourceBrowserActionMenuType {
    clusterId: string
    resourceData: Record<string, any>
    selectedResource: ApiResourceGroupType
    handleResourceClick: (e: any) => void
    removeTabByIdentifier?: (id: string) => string
}

export interface DeleteResourcePopupType {
    clusterId: string
    resourceData: Record<string, any>
    selectedResource: ApiResourceGroupType
    getResourceListData?: () => Promise<void>
    toggleDeleteDialog: () => void
    removeTabByIdentifier?: (id: string) => string
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
    handleRetry: (e) => void
    sideDataAbortController: any
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
