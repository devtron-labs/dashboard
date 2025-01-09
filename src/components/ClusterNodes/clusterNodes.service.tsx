/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
    get,
    post,
    put,
    ResponseType,
    trash,
    APIOptions,
    ROUTES as COMMON_ROUTES,
} from '@devtron-labs/devtron-fe-common-lib'
import { Routes } from '../../config'
import {
    ClusterCapacityResponse,
    ClusterListResponse,
    NodeCordonRequest,
    NodeActionRequest,
    NodeDetailResponse,
    NodeDrainRequest,
    UpdateNodeRequestBody,
    EditTaintsRequest,
    TerminalDataType,
    ClusteNotePatchRequest,
    ClusterDescriptionResponse,
    ClusterNoteResponse,
    ClusterEditManifestType,
    ClusterShortDescriptionPatchRequest,
} from './types'

export const getClusterDetails = (clusterId: string, signal?): Promise<ClusterDescriptionResponse> =>
    get(`${Routes.CLUSTER_DESCRIPTION}?id=${clusterId}`, { signal })

export const patchClusterNote = (requestPayload: ClusteNotePatchRequest): Promise<ClusterNoteResponse> =>
    put(Routes.CLUSTER_NOTE, requestPayload)

export const patchApplicationNote = (requestPayload: ClusteNotePatchRequest): Promise<ClusterNoteResponse> =>
    put(Routes.APPLICATION_NOTE, requestPayload)

export const getClusterList = (signal: AbortSignal): Promise<ClusterListResponse> =>
    get(Routes.CLUSTER_LIST, { signal })

/** @deprecated - use `getClusterListRaw` from fe-common-lib */
export const getClusterListMin = (): Promise<ClusterListResponse> => get(COMMON_ROUTES.CLUSTER_LIST_RAW)

export const getClusterCapacity = (clusterId: string, signal?): Promise<ClusterCapacityResponse> =>
    get(`${Routes.CLUSTER_CAPACITY}/${clusterId}`, { signal })

export const updateClusterShortDescription = (
    requestPayload: ClusterShortDescriptionPatchRequest,
): Promise<ResponseType> => put(`${Routes.CLUSTER_DESCRIPTION}`, requestPayload)

export const getNodeCapacity = (clusterId: string, nodeName: string): Promise<NodeDetailResponse> =>
    get(`${Routes.NODE_CAPACITY}?clusterId=${clusterId}&name=${nodeName}`)

export const cordonNodeCapacity = (requestPayload: NodeCordonRequest): Promise<ResponseType> =>
    put(`${Routes.NODE_CAPACITY}/cordon`, requestPayload)

export const drainNodeCapacity = (requestPayload: NodeDrainRequest): Promise<ResponseType> =>
    put(`${Routes.NODE_CAPACITY}/drain`, requestPayload)

export const deleteNodeCapacity = (requestPayload: NodeActionRequest, signal?: AbortSignal): Promise<ResponseType> =>
    trash(Routes.NODE_CAPACITY, requestPayload, signal ? { signal } : {})

export const updateNodeManifest = (
    clusterId: string,
    nodeName: string,
    nodeData: UpdateNodeRequestBody,
): Promise<ResponseType> => put(`${Routes.NODE_CAPACITY}?clusterId=${clusterId}&name=${nodeName}`, nodeData)

export const clusterTerminalStart = (data: TerminalDataType, option: APIOptions): Promise<ResponseType> =>
    post(`${Routes.CLUSTER_TERMINAL}/${Routes.START}`, data, option)

export const clusterTerminalUpdate = (data: TerminalDataType, option: APIOptions): Promise<ResponseType> =>
    put(`${Routes.CLUSTER_TERMINAL}/${Routes.UPDATE}`, data, option)

export const clusterTerminalDisconnect = (terminalAccessId): Promise<ResponseType> =>
    post(`${Routes.CLUSTER_TERMINAL}/${Routes.DISCONNECT}?terminalAccessId=${terminalAccessId}`, null)

export const clusterDisconnectAndRetry = (data: TerminalDataType): Promise<ResponseType> =>
    post(`${Routes.CLUSTER_TERMINAL}/${Routes.DISCONNECT_RETRY}`, data)

export const clusterTerminalStop = (terminalAccessId): Promise<ResponseType> =>
    put(`${Routes.CLUSTER_TERMINAL}/${Routes.STOP}?terminalAccessId=${terminalAccessId}`, null)

export const clusterTerminalTypeUpdate = (data: TerminalDataType): Promise<ResponseType> =>
    put(`${Routes.CLUSTER_TERMINAL}/${Routes.UPDATE_SHELL}`, data)

export const clusterNamespaceList = (): Promise<ResponseType> => get(Routes.CLUSTER_NAMESPACE)

export const getClusterManifest = (terminalAccessId: number): Promise<ResponseType> =>
    get(`${Routes.CLUSTER_TERMINAL}/${Routes.POD_MANIFEST}?terminalAccessId=${terminalAccessId}`)

export const getClusterEvents = (terminalAccessId: number): Promise<ResponseType> =>
    get(`${Routes.CLUSTER_TERMINAL}/${Routes.POD_EVENTS}?terminalAccessId=${terminalAccessId}`)

export const updateTaints = (taintData: EditTaintsRequest): Promise<ResponseType> => put(Routes.TAINTS_EDIT, taintData)

export const clusterManifestEdit = (data: ClusterEditManifestType, option: APIOptions): Promise<ResponseType> =>
    put(`${Routes.CLUSTER_TERMINAL}/${Routes.EDIT}`, data, option)
