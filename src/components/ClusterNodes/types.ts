import { ResponseType } from '../../services/service.types'
export interface ResourceDetail {
    name: string
    usage: string
    capacity: string
    request: string
    limits: string
}

export interface ClusterDetail {
    id: number
    name: string
    nodeCount: 0
    nodeErrors: string[]
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
    pods: number
    taints: number
    cpu: ResourceDetail
    memory: ResourceDetail
    age: string
}

export interface ClusterListResponse extends ResponseType {
    result?: ClusterDetail[]
}
export interface NodeListResponse extends ResponseType {
    result?: NodeDetail[]
}
