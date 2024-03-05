import { get, post, ResponseType } from '@devtron-labs/devtron-fe-common-lib'
import { Routes } from '../../config'
import { ClusterListResponse } from '../../services/service.types'
import {
    APIResourceResponse,
    CreateResourcePayload,
    CreateResourceResponse,
    ResourceListPayloadType,
    ResourceListResponse,
    K8AbbreviatesResponse,
} from './Types'

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

export const getK8Abbreviates = (): Promise<K8AbbreviatesResponse> => {
    return Promise.resolve({
        code: 200,
        status: 'success',
        result: {
            csr: 'certificatesigningrequest',
            cs: 'componentstatus',
            cm: 'configmap',
            ds: 'daemonset',
            ns: 'namespaces',
            deploy: 'deployment',
            ep: 'endpoints',
            ev: 'events',
            hpa: 'horizontalpodautoscaler',
            ing: 'ingress',
            limits: 'limitrange',
            no: 'nodes',
            pvc: 'persistentvolumeclaim',
            pv: 'persistentvolume',
            po: 'pod',
            pdb: 'poddisruptionbudget',
            rs: 'replicaset',
            rc: 'replicationcontroller',
            quota: 'resourcequota',
            sa: 'serviceaccount',
            sc: 'storageclass',
            svc: 'service',
            wf: 'workflow',
            sts: 'statefulset',
            crd: 'customresourcedefinition',
        },
    })
}
