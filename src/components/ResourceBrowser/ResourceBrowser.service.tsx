import { Routes } from '../../config'
import { get, post } from '../../services/api'
import { ResponseType } from '../../services/service.types'
import { APIResourceResponse, CreateResourceResponse, CreateResourceStatus, ResourceListPayloadType, ResourceListResponse } from './Types'

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

export const createNewResource = (resourceListPayload: ResourceListPayloadType): Promise<CreateResourceResponse> => {
    return post(Routes.CREATE_RESOURCE, resourceListPayload)
    // return Promise.resolve({
    //     code: 200,
    //     status: 'trt',
    //     result: [
    //         {
    //             kind: 'Service',
    //             name: 'cd-central-api-devtron-prod-preview-service',
    //             status: CreateResourceStatus.created,
    //             message: 'Resource created',
    //         },
    //         {
    //             kind: 'Service Monitor',
    //             name: 'cd-central-api-devtron-prod-preview-service',
    //             status: CreateResourceStatus.failed,
    //             message: 'Resource with the name ‘cd-central-api-devtron-prod-preview-service’ already exists.',
    //         },
    //         {
    //             kind: 'Service',
    //             name: 'cd-central-api-devtron-prod-preview-service',
    //             status: CreateResourceStatus.created,
    //             message: 'Resource created',
    //         },
    //         {
    //             kind: 'Service Monitor',
    //             name: 'cd-central-api-devtron-prod-preview-service',
    //             status: CreateResourceStatus.failed,
    //             message: 'Resource with the name ‘cd-central-api-devtron-prod-preview-service’ already exists.',
    //         },
    //     ],
    // })
}
