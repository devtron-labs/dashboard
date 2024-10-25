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

import { ApiResourceType, get, post, ResponseType, ApiResourceGroupType } from '@devtron-labs/devtron-fe-common-lib'
import { Routes } from '../../config'
import { ClusterListResponse } from '../../services/service.types'
import { CreateResourcePayload, CreateResourceResponse, ResourceListPayloadType } from './Types'
import { ALL_NAMESPACE_OPTION } from './Constants'

export const getClusterList = (): Promise<ClusterListResponse> => get(Routes.CLUSTER_LIST_PERMISSION)

export const namespaceListByClusterId = (clusterId: string): Promise<ResponseType> =>
    get(`${Routes.CLUSTER_NAMESPACE}/${clusterId}`)

export const getResourceGroupList = (clusterId: string, signal?: AbortSignal): Promise<ResponseType<ApiResourceType>> =>
    get(`${Routes.API_RESOURCE}/${clusterId}`, {
        signal,
    })

export const createNewResource = (resourceListPayload: CreateResourcePayload): Promise<CreateResourceResponse> =>
    post(Routes.K8S_RESOURCE_CREATE, resourceListPayload)

export const deleteResource = (resourceListPayload: ResourceListPayloadType): Promise<CreateResourceResponse> =>
    post(Routes.DELETE_RESOURCE, resourceListPayload)

export const getResourceListPayload = (
    clusterId: string,
    namespace: string,
    selectedResource: ApiResourceGroupType,
    filters: object,
) => ({
    clusterId: +clusterId,
    k8sRequest: {
        resourceIdentifier: {
            groupVersionKind: selectedResource.gvk,
            ...(selectedResource.namespaced && {
                namespace: namespace === ALL_NAMESPACE_OPTION.value ? '' : namespace,
            }),
        },
    },
    ...filters,
})
