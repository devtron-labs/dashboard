import { Routes } from '../../config'
import { get, post } from '../../services/api'
import { ClusterListResponse, ResponseType } from '../../services/service.types'
import {
    APIResourceResponse,
    CreateResourcePayload,
    CreateResourceResponse,
    ResourceListPayloadType,
    ResourceListResponse,
} from './Types'

export const getClusterList = (): Promise<ClusterListResponse> => {
    return get(Routes.CLUSTER_LIST_PERMISSION)
}

export const namespaceListByClusterId = (clusterId: string): Promise<ResponseType> => {
    return get(`${Routes.CLUSTER_NAMESPACE}/${clusterId}`)
}

export const getResourceList = (resourceListPayload: ResourceListPayloadType): Promise<ResourceListResponse> => {
    //return post(Routes.K8S_RESOURCE_LIST, resourceListPayload)
    return Promise.resolve({
        code: 200,
        status: 'OK',
        result:  {
          "column": [
              "Name",
              "Status",
              "Restarts",
              "Age"
          ],
          "rows": [
              {
                  "Age": "53d",
                  "Name": "devtron-grafana-test",
                  "Restarts": "4",
                  "Status": "Completed"
              },
              {
                  "Age": "53d",
                  "Name": "devtron-nats-test-request-reply",
                  "Restarts": "0",
                  "Status": "Completed"
              }
          ]
      },
    })
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
