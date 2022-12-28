import { Routes } from '../../config'
import { get, post, put } from '../../services/api'
import { ResponseType } from '../../services/service.types'
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
    return get(`${Routes.CLUSTER_CAPACITY}/${clusterId}`)
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
): Promise<ResponseType> => {
    return put(`${Routes.NODE_CAPACITY}?clusterId=${clusterId}&name=${nodeName}`, nodeData)
}

export const clusterTerminalStart = (data): Promise<ResponseType> => {
    return post(`${Routes.CLUSTER_TERMINAL}/${Routes.START}`, data)
}

export const clusterTerminalUpdate = (data): Promise<ResponseType> => {
    return put(`${Routes.CLUSTER_TERMINAL}/${Routes.UPDATE}`, data)
}

export const clusterTerminalDisconnect = (terminalAccessId): Promise<ResponseType> => {
    return post(`${Routes.CLUSTER_TERMINAL}/${Routes.DISCONNECT}?terminalAccessId=${terminalAccessId}`, null)
}

export const clusterDisconnectAndRetry = (data):  Promise<ResponseType> => {
    return post(`${Routes.CLUSTER_TERMINAL}/${Routes.DISCONNECT_RETRY}`, data)
}

export const clusterTerminalStop = (terminalAccessId):  Promise<ResponseType> => {
    return put(`${Routes.CLUSTER_TERMINAL}/${Routes.STOP}?terminalAccessId=${terminalAccessId}`, null)
}

export const clusterTerminalTypeUpdate = (data): Promise<ResponseType> => {
    return put(`${Routes.CLUSTER_TERMINAL}/${Routes.UPDATE_SHELL}`, data)
}

export const clusterNamespaceList = (): Promise<ResponseType> => {
    return get(`${Routes.CLUSTER_NAMESPACE}`)
}

export const getClusterManifest = (terminalAccessId: number):  Promise<ResponseType> => {
    return get(`${Routes.CLUSTER_TERMINAL}/${Routes.POD_MANIFEST}?terminalAccessId=${terminalAccessId}`)
}

export const getClusterEvents = (terminalAccessId: number):  Promise<ResponseType> => {
    return get(`${Routes.CLUSTER_TERMINAL}/${Routes.POD_EVENTS}?terminalAccessId=${terminalAccessId}`)
}