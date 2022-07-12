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

export const TEXT_COLOR_CLASS = {
    Ready: 'cg-5',
    'Not ready': 'cr-5',
}

export const COLUMN_METADATA: ColumnMetadataType[] = [
    {
        sortType: 'string',
        columnIndex: 0,
        label: 'Node',
        value: 'name',
        isDefault: true,
        isSortingAllowed: true,
        isDisabled: true,
        sortingFieldName: 'name',
    },
    { sortType: 'string', columnIndex: 1, label: 'Status', value: 'status', isDefault: true, isDisabled: true },
    { sortType: 'string', columnIndex: 2, label: 'Roles', value: 'roles', isDefault: true },
    {
        sortType: 'number',
        columnIndex: 3,
        label: 'Errors',
        value: 'errorCount',
        isDefault: true,
        isDisabled: true,
        isSortingAllowed: true,
        sortingFieldName: 'errorCount',
    },
    { sortType: 'string', columnIndex: 4, label: 'K8S Version', value: 'k8sVersion', isDefault: true },
    {
        sortType: 'number',
        columnIndex: 5,
        label: 'No.of pods',
        value: 'podCount',
        isDefault: true,
        isSortingAllowed: true,
        sortingFieldName: 'podCount',
    },
    {
        sortType: 'number',
        columnIndex: 6,
        label: 'Taints',
        value: 'taintCount',
        isDefault: true,
        isSortingAllowed: true,
        sortingFieldName: 'taintCount',
    },
    {
        sortType: 'number',
        columnIndex: 7,
        label: 'CPU Usage (%)',
        value: 'cpu.usagePercentage',
        isDefault: true,
        isSortingAllowed: true,
        sortingFieldName: 'cpu.usagePercentage',
    },
    {
        sortType: 'number',
        columnIndex: 8,
        label: 'CPU Usage (Absolute)',
        value: 'cpu.usage',
        isSortingAllowed: true,
        sortingFieldName: 'cpu.usageInBytes',
    },
    {
        sortType: 'number',
        columnIndex: 9,
        label: 'CPU Allocatable',
        value: 'cpu.allocatable',
        isSortingAllowed: true,
        sortingFieldName: 'cpu.allocatableInBytes',
    },
    {
        sortType: 'number',
        columnIndex: 10,
        label: 'Mem Usage (%)',
        value: 'memory.usagePercentage',
        isDefault: true,
        isSortingAllowed: true,
        sortingFieldName: 'memory.usagePercentage',
    },
    {
        sortType: 'number',
        columnIndex: 11,
        label: 'Mem Usage (Absolute)',
        value: 'memory.usage',
        isSortingAllowed: true,
        sortingFieldName: 'memory.usageInBytes',
    },
    {
        sortType: 'number',
        columnIndex: 12,
        label: 'Mem Allocatable',
        value: 'memory.allocatable',
        isSortingAllowed: true,
        sortingFieldName: 'memory.allocatableInBytes',
    },
    {
        sortType: 'string',
        columnIndex: 13,
        label: 'Age',
        value: 'age',
        isDefault: true,
        isSortingAllowed: true,
        sortingFieldName: 'createdAt',
    },
    { sortType: 'boolean', columnIndex: 14, label: 'Unschedulable', value: 'unschedulable' },
]
