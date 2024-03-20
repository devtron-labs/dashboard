import { get, post, ResponseType } from '@devtron-labs/devtron-fe-common-lib'
import { Routes } from '../../config'
import { ClusterListResponse } from '../../services/service.types'
import {
    APIResourceResponse,
    CreateResourcePayload,
    CreateResourceResponse,
    ResourceListPayloadType,
    ResourceListResponse,
    K8Abbreviates,
} from './Types'
import { K8_ABBREVIATES } from './Constants'

export const getClusterList = (): Promise<ClusterListResponse> => {
    return get(Routes.CLUSTER_LIST_PERMISSION)
}

export const namespaceListByClusterId = (clusterId: string): Promise<ResponseType> => {
    return get(`${Routes.CLUSTER_NAMESPACE}/${clusterId}`)
}

export const getResourceList = (
    resourceListPayload: ResourceListPayloadType,
    signal?: AbortSignal,
): Promise<ResourceListResponse> => {
    return post(Routes.K8S_RESOURCE_LIST, resourceListPayload, {
        signal,
    })
}

export const getResourceGroupList = (clusterId: string, signal?: AbortSignal): Promise<APIResourceResponse> => {
    return get(`${Routes.API_RESOURCE}/${clusterId}`, {
        signal,
    })
}

export const getResourceGroupListRaw = (clusterId: string): Promise<APIResourceResponse> => {
    return get(`${Routes.API_RESOURCE}/${Routes.GVK}/${clusterId}`)
}

export const createNewResource = (resourceListPayload: CreateResourcePayload): Promise<CreateResourceResponse> => {
    return post(Routes.K8S_RESOURCE_CREATE, resourceListPayload)
}

export const deleteResource = (resourceListPayload: ResourceListPayloadType): Promise<CreateResourceResponse> => {
    return post(Routes.DELETE_RESOURCE, resourceListPayload)
}

export const getK8Abbreviates = (): Promise<K8Abbreviates> => {
    return Promise.resolve(K8_ABBREVIATES)
}
