import { Routes } from '../../config'
import { post, get } from '../../services/api'
import { ClusterListResponse, NodeListResponse } from './types'

export const getClusterList = (): Promise<ClusterListResponse> => {
    return get(Routes.CLUSTER_LIST)
}

export const getClusterCapacity = (): Promise<any> => {
    return get(Routes.CLUSTER_CAPACITY)
}

export const getNodeList = (): Promise<NodeListResponse> => {
    return get(Routes.NODE_LIST)
}

export const getNodeCapacity = (): Promise<any> => {
    return get(Routes.NODE_CAPACITY)
}
