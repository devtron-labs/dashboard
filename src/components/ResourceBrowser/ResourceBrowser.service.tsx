import { Routes } from '../../config'
import { get } from '../../services/api'
import { ResourceListListResponse } from './Types'

export const getClusterList = (): Promise<ResourceListListResponse> => {
    return get(Routes.MANIFEST)
}

export const getResourceList = (clusterId: string): Promise<ResourceListListResponse> => {
    //return get(`${Routes.API_RESOURCE}/${clusterId}`)
    return Promise.resolve({
        code: 200,
        status: 'true',
        result: [
        ],
    })
}
