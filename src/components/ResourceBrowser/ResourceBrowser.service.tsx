import { Routes } from '../../config'
import { get } from '../../services/api'
import { ResponseType } from '../../services/service.types'
import { ResourceListListResponse } from './Types'

export const getClusterList = (): Promise<ResourceListListResponse> => {
    return get(Routes.MANIFEST)
}

export const NamespaceListByClusterId = (clusterId: string): Promise<ResponseType> => {
  return get(`${Routes.CLUSTER_NAMESPACE}/${clusterId}`)
}

export const getResourceList = (clusterId: string): Promise<ResourceListListResponse> => {
    return get(`${Routes.API_RESOURCE}/${clusterId}`)
    return Promise.resolve({
        code: 200,
        status: 'true',
        result: [
            {
                name: 'name',
                status: 'status',
                namespace: 'namespace',
                age: 'age',
                ready: 'ready',
                restarts: 'restarts',
            },
        ],
    })
}

