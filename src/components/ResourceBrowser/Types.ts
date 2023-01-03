import React from 'react'
import { ResponseType } from '../../services/service.types'
import { Nodes, OptionType } from '../app/types'
import { LogSearchTermType, SelectedResourceType } from '../v2/appDetails/appDetails.type'

// export interface ResourceDetail {
//     name: string
//     status: string
//     namespace: string
//     age: string
//     ready: string
//     restarts: string
//     containers: string[]
// }

export interface ResourceDataType {}

export interface ResourceDetailType {
    headers: string[]
    data: Record<string, any>[]
}

export interface GVKType {
    Group: string
    Version: string
    Kind: Nodes
}

export interface ResourceListResponse extends ResponseType {
    result?: ResourceDetailType
}

export interface ApiResourceType {
    gvk: GVKType
    namespaced: boolean
}

export interface APIResourceResponse extends ResponseType {
    result?: ApiResourceType[]
}

export interface K8SObjectType {
    name: string
    isExpanded: boolean
    namespaced: boolean
    child: GVKType[]
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
    clusterOptions: OptionType[]
    onChangeCluster: (selectedCluster: OptionType, fromClusterSelect?: boolean) => void
}

export interface CreateResourceType {
    closePopup: (refreshData?: boolean) => void
    clusterId: string
}

export interface SidebarType {
    k8SObjectList: K8SObjectType[]
    handleGroupHeadingClick: (e) => void
    setSelectedResource: React.Dispatch<React.SetStateAction<ApiResourceType>>
    updateSelectionData: (_selected: ApiResourceType) => void
}

export interface K8SResourceListType {
    selectedResource: ApiResourceType
    resourceList: ResourceDetailType
    filteredResourceList: Record<string, any>[]
    setFilteredResourceList: React.Dispatch<React.SetStateAction<Record<string, any>[]>>
    noResults: boolean
    clusterOptions: OptionType[]
    selectedCluster: OptionType
    onChangeCluster: (selectedCluster: OptionType, fromClusterSelect?: boolean) => void
    namespaceOptions: OptionType[]
    selectedNamespace: OptionType
    setSelectedNamespace: React.Dispatch<React.SetStateAction<OptionType>>
    resourceListLoader: boolean
    getResourceListData: () => Promise<void>
}

export interface ResourceBrowserActionMenuType {
    clusterId: string
    namespace: string
    resourceData: Record<string, any>
    selectedResource: ApiResourceType
    getResourceListData: () => Promise<void>
}

export interface ResourceListEmptyStateType {
    title?: string
    subTitle: string
    actionHandler?: () => void
}
