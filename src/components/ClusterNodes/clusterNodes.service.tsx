import { Routes } from '../../config'
import { get, put } from '../../services/api'
import {
    ClusterCapacityResponse,
    ClusterListResponse,
    NodeDetailResponse,
    NodeListResponse,
    UpdateNodeRequestBody,
} from './types'

export const getClusterList = (): Promise<ClusterListResponse> => {
    return get(Routes.CLUSTER_LIST)
}

export const getClusterCapacity = (clusterId: string): Promise<ClusterCapacityResponse> => {
    return get(Routes.CLUSTER_CAPACITY + '/' + clusterId)
}

export const getNodeList = (clusterId: string): Promise<NodeListResponse> => {
    return get(`${Routes.NODE_LIST}?clusterId=${clusterId}`)
}

export const getNodeCapacity = (clusterId: string, nodeName: string): Promise<NodeDetailResponse> => {
    return get(`${Routes.NODE_CAPACITY}?clusterId=${clusterId}&name=${nodeName}`)
}

export const updateNodeManifest = (
    clusterId: string,
    nodeName: string,
    nodeData: UpdateNodeRequestBody,
): Promise<any> => {
    return put(`${Routes.NODE_CAPACITY}?clusterId=${clusterId}&name=${nodeName}`, nodeData)
}
