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
    ApiResourceType,
    get,
    ResponseType,
    getK8sResourceList,
    getIsRequestAborted,
    showError,
    getUrlWithSearchParams,
    getK8sResourceListPayload,
    stringComparatorBySortOrder,
} from '@devtron-labs/devtron-fe-common-lib'
import { RefObject } from 'react'
import { Routes } from '../../config'
import { ClusterListResponse } from '../../services/service.types'
import { GetResourceDataType, NodeRowDetail, URLParams } from './Types'
import { SIDEBAR_KEYS } from './Constants'
import { parseNodeList } from './Utils'

export const getClusterList = async (): Promise<ClusterListResponse> => {
    const response = await get<ClusterListResponse['result']>(Routes.CLUSTER_LIST_PERMISSION)

    return {
        ...response,
        result: (response?.result ?? []).sort((a, b) => stringComparatorBySortOrder(a.cluster_name, b.cluster_name)),
    }
}

export const namespaceListByClusterId = async (clusterId: string) => {
    const response = await get<string[]>(`${Routes.CLUSTER_NAMESPACE}/${clusterId}`)

    return {
        ...response,
        result: (response?.result ?? []).sort((a, b) => stringComparatorBySortOrder(a, b)),
    }
}

export const getResourceGroupList = (clusterId: string, signal?: AbortSignal): Promise<ResponseType<ApiResourceType>> =>
    get(`${Routes.API_RESOURCE}/${clusterId}`, {
        signal,
    })

export const getNodeList = (
    clusterId: string,
    abortControllerRef: RefObject<AbortController>,
): Promise<ResponseType<NodeRowDetail[]>> =>
    get(getUrlWithSearchParams<keyof URLParams>(Routes.NODE_LIST, { clusterId: Number(clusterId) }), {
        abortControllerRef,
    })

export const getResourceData = async ({
    selectedResource,
    namespace,
    clusterId,
    filters,
    abortControllerRef,
}: GetResourceDataType) => {
    try {
        if (selectedResource.gvk.Kind === SIDEBAR_KEYS.nodeGVK.Kind) {
            const response = await getNodeList(clusterId, abortControllerRef)

            return parseNodeList(response)
        }

        return await getK8sResourceList(
            getK8sResourceListPayload(clusterId, namespace, selectedResource, filters),
            abortControllerRef.current.signal,
        )
    } catch (err) {
        if (!getIsRequestAborted(err)) {
            showError(err)
            throw err
        }

        return null
    }
}
