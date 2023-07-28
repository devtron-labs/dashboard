import React from 'react'
import { ResponseType } from '@devtron-labs/devtron-fe-common-lib'
import { Nodes, NodeType, OptionType } from '../app/types'
import { LogSearchTermType, SelectedResourceType } from '../v2/appDetails/appDetails.type'
import { ClusterImageList } from '../ClusterNodes/types'

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
    clusterOptions: ClusterOptionType[]
    onChangeCluster: (selectedCluster: any, fromClusterSelect?: boolean) => void
    imageList: ClusterImageList[]
    isSuperAdmin: boolean
    namespaceList: string[]
}

export interface CreateResourceType {
    closePopup: (refreshData?: boolean) => void
    clusterId: string
}

export interface SidebarType {
    k8SObjectMap: Map<string, K8SObjectMapType>
    handleGroupHeadingClick: (e: any, preventCollapse?: boolean) => void
    selectedResource: ApiResourceGroupType
    setSelectedResource: React.Dispatch<React.SetStateAction<ApiResourceGroupType>>
    updateResourceSelectionData: (_selected: ApiResourceGroupType) => void
    isCreateModalOpen: boolean
}

export interface ResourceFilterOptionsProps {
    selectedResource: ApiResourceGroupType
    resourceList: ResourceDetailType
    clusterOptions: OptionType[]
    selectedCluster: OptionType
    onChangeCluster: (selectedCluster: OptionType, fromClusterSelect?: boolean) => void
    namespaceOptions: OptionType[]
    selectedNamespace: OptionType
    setSelectedNamespace: React.Dispatch<React.SetStateAction<OptionType>>
    hideSearchInput?: boolean
    searchText: string
    setSearchText: React.Dispatch<React.SetStateAction<string>>
    searchApplied: boolean
    setSearchApplied: React.Dispatch<React.SetStateAction<boolean>>
    handleFilterChanges: (_searchText: string, _resourceList: ResourceDetailType) => void
    clearSearch: () => void
    isNamespaceSelectDisabled?: boolean
    isSearchInputDisabled?: boolean
    isCreateModalOpen?: boolean
}

export interface K8SResourceListType extends ResourceFilterOptionsProps {
    filteredResourceList: Record<string, any>[]
    noResults: boolean
    resourceListLoader: boolean
    getResourceListData: () => Promise<void>
    updateNodeSelectionData: (_selected: Record<string, any>) => void
    isCreateModalOpen: boolean
    addTab: (
        idPrefix: string,
        kind: string,
        name: string,
        url: string,
        positionFixed?: boolean,
        iconPath?: string,
    ) => boolean
}

export interface ResourceBrowserActionMenuType {
    clusterId: string
    resourceData: Record<string, any>
    selectedResource: ApiResourceGroupType
    getResourceListData: (retainSearched?: boolean) => Promise<void>
    handleResourceClick: (e: any) => void
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
}

export interface ClusterOptionType extends OptionType {
    errorInConnecting: string
}

export interface ConnectingToClusterStateProps extends ResourceFilterOptionsProps {
    loader: boolean
    errorMsg: string
    setErrorMsg: React.Dispatch<React.SetStateAction<string>>
    setSelectedCluster: React.Dispatch<React.SetStateAction<ClusterOptionType>>
    showSelectClusterState: boolean
    setShowSelectClusterState: React.Dispatch<React.SetStateAction<boolean>>
    handleRetry: (e) => void
    sideDataAbortController: {
        prev: AbortController
        new: AbortController
    }
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
