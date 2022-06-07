import { ResponseType } from '../../services/service.types'
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

export interface NodeDetail {
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
    result?: NodeDetail[]
}
