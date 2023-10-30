import { Routes } from '../../config'
import { get, post, put, ResponseType, trash, APIOptions } from '@devtron-labs/devtron-fe-common-lib'
import {
    ClusterCapacityResponse,
    ClusterListResponse,
    NodeCordonRequest,
    NodeActionRequest,
    NodeDetailResponse,
    NodeDrainRequest,
    NodeListResponse,
    UpdateNodeRequestBody,
    EditTaintsRequest,
    TerminalDataType,
    ClusteNotePatchRequest,
    ClusterDescriptionResponse,
    ClusterNoteResponse,
    ClusterEditManifestType,
    ClusterShortDescriptionPatchRequest,
} from './types'

export const getClusterDetails = (clusterId: string, signal?): Promise<ClusterDescriptionResponse> => {
    return get(`${Routes.CLUSTER_DESCRIPTION}?id=${clusterId}`, {signal})
}
export const patchClusterNote = (requestPayload: ClusteNotePatchRequest): Promise<ClusterNoteResponse> => {
    return put(Routes.CLUSTER_NOTE, requestPayload)
}

export const patchApplicationNote = (requestPayload: ClusteNotePatchRequest): Promise<ClusterNoteResponse> => {
    return put(Routes.APPLICATION_NOTE, requestPayload)
}

export const getClusterList = (): Promise<ClusterListResponse> => {
    return get(Routes.CLUSTER_LIST)
}

export const getClusterListMin = (): Promise<ClusterListResponse> => {
    return get(Routes.CLUSTER_LIST_MIN)
}

export const getClusterCapacity = (clusterId: string, signal?): Promise<ClusterCapacityResponse> => {
    return get(`${Routes.CLUSTER_CAPACITY}/${clusterId}`, {signal})
}

export const updateClusterShortDescription = (
    requestPayload: ClusterShortDescriptionPatchRequest,
): Promise<ResponseType> => {
    return put(`${Routes.CLUSTER_DESCRIPTION}`, requestPayload)
}

export const getNodeList = (clusterId: string): Promise<NodeListResponse> => {
    return get(`${Routes.NODE_LIST}?clusterId=${clusterId}`)
}

export const getNodeCapacity = (clusterId: string, nodeName: string): Promise<NodeDetailResponse> => {
    return get(`${Routes.NODE_CAPACITY}?clusterId=${clusterId}&name=${nodeName}`)
}

export const cordonNodeCapacity = (requestPayload: NodeCordonRequest): Promise<ResponseType> => {
    return put(`${Routes.NODE_CAPACITY}/cordon`, requestPayload)
}

export const drainNodeCapacity = (requestPayload: NodeDrainRequest): Promise<ResponseType> => {
    return put(`${Routes.NODE_CAPACITY}/drain`, requestPayload)
}

export const deleteNodeCapacity = (requestPayload: NodeActionRequest): Promise<ResponseType> => {
    return trash(Routes.NODE_CAPACITY, requestPayload)
}

export const updateNodeManifest = (
    clusterId: string,
    nodeName: string,
    nodeData: UpdateNodeRequestBody,
): Promise<ResponseType> => {
    return put(`${Routes.NODE_CAPACITY}?clusterId=${clusterId}&name=${nodeName}`, nodeData)
}

export const clusterTerminalStart = (data: TerminalDataType, option: APIOptions): Promise<ResponseType> => {
    return post(`${Routes.CLUSTER_TERMINAL}/${Routes.START}`, data, option)
}

export const clusterTerminalUpdate = (data: TerminalDataType, option: APIOptions): Promise<ResponseType> => {
    return put(`${Routes.CLUSTER_TERMINAL}/${Routes.UPDATE}`, data, option)
}

export const clusterTerminalDisconnect = (terminalAccessId): Promise<ResponseType> => {
    return post(`${Routes.CLUSTER_TERMINAL}/${Routes.DISCONNECT}?terminalAccessId=${terminalAccessId}`, null)
}

export const clusterDisconnectAndRetry = (data: TerminalDataType): Promise<ResponseType> => {
    return post(`${Routes.CLUSTER_TERMINAL}/${Routes.DISCONNECT_RETRY}`, data)
}

export const clusterTerminalStop = (terminalAccessId): Promise<ResponseType> => {
    return put(`${Routes.CLUSTER_TERMINAL}/${Routes.STOP}?terminalAccessId=${terminalAccessId}`, null)
}

export const clusterTerminalTypeUpdate = (data: TerminalDataType): Promise<ResponseType> => {
    return put(`${Routes.CLUSTER_TERMINAL}/${Routes.UPDATE_SHELL}`, data)
}

export const clusterNamespaceList = (): Promise<ResponseType> => {
    return get(Routes.CLUSTER_NAMESPACE)
}

export const getClusterManifest = (terminalAccessId: number): Promise<ResponseType> => {
    return get(`${Routes.CLUSTER_TERMINAL}/${Routes.POD_MANIFEST}?terminalAccessId=${terminalAccessId}`)
}

export const getClusterEvents = (terminalAccessId: number): Promise<ResponseType> => {
    return get(`${Routes.CLUSTER_TERMINAL}/${Routes.POD_EVENTS}?terminalAccessId=${terminalAccessId}`)
}

export const updateTaints = (taintData: EditTaintsRequest): Promise<ResponseType> => {
    return put(Routes.TAINTS_EDIT, taintData)
}

export const clusterManifestEdit = (data: ClusterEditManifestType, option: APIOptions): Promise<ResponseType> => {
    return put(`${Routes.CLUSTER_TERMINAL}/${Routes.EDIT}`, data, option)
}
