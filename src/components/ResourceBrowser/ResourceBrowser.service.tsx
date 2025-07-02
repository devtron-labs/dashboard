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

import { RefObject } from 'react'

import {
    APIOptions,
    ApiResourceType,
    ClusterDetail,
    get,
    getIsRequestAborted,
    getK8sResourceList,
    getK8sResourceListPayload,
    getNamespaceListMin,
    getUrlWithSearchParams,
    Nodes,
    ResponseType,
    showError,
    stringComparatorBySortOrder,
} from '@devtron-labs/devtron-fe-common-lib'

import {
    getClusterListMinWithInstalledClusters,
    getClusterListWithInstalledClusters,
} from '@Components/ClusterNodes/clusterNodes.service'

import { Routes } from '../../config'
import { SIDEBAR_KEYS } from './Constants'
import { ClusterDetailBaseParams, GetResourceDataType, NodeRowDetail } from './Types'
import { parseNodeList, removeDefaultForStorageClass } from './Utils'

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
    get(
        getUrlWithSearchParams<keyof ClusterDetailBaseParams>(Routes.NODE_LIST, {
            clusterId: Number(clusterId),
        }),
        {
            abortControllerRef,
        },
    )

export const getResourceData = async ({
    selectedResource,
    selectedNamespace,
    clusterId,
    filters,
    abortControllerRef,
}: GetResourceDataType) => {
    const idPrefix = `${clusterId}${JSON.stringify(selectedResource)}${JSON.stringify(filters)}${selectedNamespace}`

    try {
        if (selectedResource.gvk.Kind === SIDEBAR_KEYS.nodeGVK.Kind) {
            const response = await getNodeList(clusterId, abortControllerRef)

            return parseNodeList(response, idPrefix)
        }

        const isNamespaceList = selectedResource.gvk.Kind.toLowerCase() === Nodes.Namespace.toLowerCase()

        const [k8sResponse, namespaceListResponse] = await Promise.allSettled([
            getK8sResourceList(
                getK8sResourceListPayload(clusterId, selectedNamespace.toLowerCase(), selectedResource, filters),
                abortControllerRef.current.signal,
            ),
            isNamespaceList ? getNamespaceListMin(clusterId, abortControllerRef) : null,
        ])

        const response = k8sResponse.status === 'fulfilled' ? k8sResponse.value : null

        if (k8sResponse.status === 'rejected') {
            throw k8sResponse.reason
        }

        if (isNamespaceList && namespaceListResponse?.status === 'fulfilled') {
            const { result } = namespaceListResponse.value
            const [{ environments }] = result

            const namespaceToEnvironmentMap = environments.reduce(
                (acc, { environmentName, namespace, environmentId }) => {
                    if (environmentId === 0) {
                        return acc
                    }

                    acc[namespace] = environmentName
                    return acc
                },
                {},
            )

            return {
                headers: [...response.result.headers, 'environment'],
                data: response.result.data.map((data, index) => ({
                    ...data,
                    environment: namespaceToEnvironmentMap[data.name as string],
                    id: `${idPrefix}${index}`,
                })),
            }
        }

        if (!response) {
            return null
        }

        const data =
            selectedResource.gvk.Kind === Nodes.StorageClass
                ? removeDefaultForStorageClass(response.result.data)
                : response.result.data

        return {
            ...response.result,
            data: data.map((entry, index) => ({
                ...entry,
                id: `${idPrefix}${index}`,
            })),
        }
    } catch (err) {
        if (!getIsRequestAborted(err)) {
            showError(err)
            throw err
        }

        return null
    }
}

export const getClusterListing = async (
    minified: boolean,
    abortControllerRef?: APIOptions['abortControllerRef'],
): Promise<ClusterDetail[]> => {
    try {
        const { result: clusterList } = await (
            minified ? getClusterListMinWithInstalledClusters : getClusterListWithInstalledClusters
        )(abortControllerRef)

        return clusterList
    } catch (err) {
        if (!getIsRequestAborted(err)) {
            showError(err)
        }
        throw err
    }
}
