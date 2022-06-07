import { ResponseType } from '../../services/service.types'
import { LabelTag } from '../app/types'
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
    cpu: ResourceDetail
    memory: ResourceDetail
}
export interface ClusterDetail {
    id: number
    name: string
    nodeCount: number
    nodeErrors: string[]
    errorInNodeListing: string
    nodeK8sVersions: string[]
    cpu: ResourceDetail
    memory: ResourceDetail
}

export interface NodeRowDetail {
    name: string
    status: string
    roles: string[]
    errors: string[]
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

export interface NodeDetail {
    name: string
    version: string
    kind: string
    roles: string[]
    k8sVersion: string
    errors: { Ready: 'KubeletReady - kubelet is posting ready status. AppArmor enabled' }
    internalIp: string
    externalIp: string
    unschedulable: boolean
    createdAt: string
    labels: LabelTag[]
    annotations: LabelTag[]
    taints: LabelTag[]
    resources: ResourceDetail[]
    pods: { name: string; namespace: string; cpu: ResourceDetail; memory: ResourceDetail; age: string }[]
    manifest: object
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
