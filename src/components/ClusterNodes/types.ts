import React from 'react'
import { MultiValue } from 'react-select'
import { ResponseType } from '../../services/service.types'
import { LabelTag, OptionType } from '../app/types'

export enum ERROR_TYPE {
    VERSION_ERROR = 'VERSION_ERROR',
    OTHER = 'OTHER',
}
export interface NodeListSearchFliterType {
    defaultVersion: OptionType
    nodeK8sVersions: string[]
    selectedVersion: OptionType
    setSelectedVersion: React.Dispatch<React.SetStateAction<OptionType>>
    appliedColumns: MultiValue<ColumnMetadataType>
    setAppliedColumns: React.Dispatch<React.SetStateAction<MultiValue<ColumnMetadataType>>>
    selectedSearchTextType: string
    setSelectedSearchTextType: React.Dispatch<React.SetStateAction<string>>
    searchText: string
    setSearchText: React.Dispatch<React.SetStateAction<string>>
    searchedTextMap: Map<string, string>
    setSearchedTextMap: React.Dispatch<React.SetStateAction<Map<string, string>>>
}
export interface ResourceDetail {
    name: string
    capacity: string
    allocatable: string
    usage: string
    request: string
    limit: string
    usagePercentage: string
    requestPercentage: string
    limitPercentage: string
}
export interface ClusterCapacityType {
    nodeK8sVersions: string[]
    nodeErrors: Record<string, string>[]
    cpu: ResourceDetail
    memory: ResourceDetail
}
export interface ClusterDetail {
    id: number
    name: string
    nodeCount: number
    nodeErrors: Record<string, string>[]
    errorInNodeListing: string
    nodeK8sVersions: string[]
    cpu: ResourceDetail
    memory: ResourceDetail
    serverVersion: string
    nodeNames: string[]
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

export interface ClusterListResponse extends ResponseType {
    result?: ClusterDetail[]
}
export interface ClusterCapacityResponse extends ResponseType {
    result?: ClusterCapacityType
}
export interface NodeListResponse extends ResponseType {
    result?: NodeRowDetail[]
}

export interface PodType {
    name: string
    namespace: string
    cpu: ResourceDetail
    memory: ResourceDetail
    age: string
}
export interface NodeDetail {
    name: string
    clusterName: string
    status: string
    version: string
    kind: string
    roles: string[]
    k8sVersion: string
    errors: Record<string, string>
    internalIp: string
    externalIp: string
    unschedulable: boolean
    createdAt: string
    labels: LabelTag[]
    annotations: LabelTag[]
    taints: LabelTag[]
    resources: ResourceDetail[]
    pods: PodType[]
    manifest: object
    conditions: { haveIssue: boolean; message: string; reason: string; type: string }[]
    taintCount: number
}
export interface NodeDetailResponse extends ResponseType {
    result?: NodeDetail
}

export interface UpdateNodeRequestBody {
    clusterId: number
    name: string
    manifestPatch: string
    version: string
    kind: string
}

export interface ColumnMetadataType {
    sortType: string
    columnIndex: number
    label: string
    value: string
    isDefault?: boolean
    isSortingAllowed?: boolean
    sortingFieldName?: string
    isDisabled?: boolean
}

export interface ClusterListType {
    imageList: string[]
    isSuperAdmin: boolean
    namespaceList: string[]
}

export interface ClusterTerminalType {
    clusterId: number
    clusterName?: string
    nodeList: string[]
    closeTerminal?: () => void
    clusterImageList: string[]
    isNodeDetailsPage?: boolean
    namespaceList: string[]
    node?: string
    setSelectedNode?: React.Dispatch<React.SetStateAction<string>>
}

export const TEXT_COLOR_CLASS = {
    Ready: 'cg-5',
    'Not ready': 'cr-5',
}

interface ErrorObj {
    isValid: boolean
    message: string | null
}

export interface TaintErrorObj {
    isValid: boolean
    taintErrorList: {
        key: ErrorObj
        value: ErrorObj
    }[]
}
