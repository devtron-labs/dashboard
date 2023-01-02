import { Routes } from '../../config'
import { get, post } from '../../services/api'
import { ResponseType } from '../../services/service.types'
import { APIResourceResponse, CreateResourcePayload, CreateResourceResponse, CreateResourceStatus, ResourceListPayloadType, ResourceListResponse } from './Types'

export const getClusterList = (): Promise<ResourceListResponse> => {
    return get(Routes.MANIFEST)
}

export const namespaceListByClusterId = (clusterId: string): Promise<ResponseType> => {
    return get(`${Routes.CLUSTER_NAMESPACE}/${clusterId}`)
}

export const getResourceList = (resourceListPayload: ResourceListPayloadType): Promise<ResourceListResponse> => {
    return post(Routes.K8S_RESOURCE_LIST, resourceListPayload)
}

export const getResourceGroupList = (clusterId: string): Promise<APIResourceResponse> => {
    return get(`${Routes.API_RESOURCE}/${clusterId}`)
}

export const createNewResource = (resourceListPayload: CreateResourcePayload): Promise<CreateResourceResponse> => {
    return post(Routes.K8S_RESOURCE_CREATE, resourceListPayload)
}

export const deleteResource = (resourceListPayload: ResourceListPayloadType): Promise<CreateResourceResponse> => {
    return post(Routes.DELETE_RESOURCE, resourceListPayload)
}
