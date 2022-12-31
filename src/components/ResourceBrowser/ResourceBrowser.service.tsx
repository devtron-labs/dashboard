import { Routes } from '../../config'
import { get, post } from '../../services/api'
import { ResponseType } from '../../services/service.types'
import { APIResourceResponse, resourceListPayloadType, ResourceListResponse } from './Types'

export const getClusterList = (): Promise<ResourceListResponse> => {
    return get(Routes.MANIFEST)
}

export const namespaceListByClusterId = (clusterId: string): Promise<ResponseType> => {
    return get(`${Routes.CLUSTER_NAMESPACE}/${clusterId}`)
}

export const getResourceList = (resourceListPayload: resourceListPayloadType): Promise<ResourceListResponse> => {
    return post(Routes.K8S_RESOURCE_LIST, resourceListPayload)
}

export const getResourceGroupList = (clusterId: string): Promise<APIResourceResponse> => {
    return get(`${Routes.API_RESOURCE}/${clusterId}`)
}
