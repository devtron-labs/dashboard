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
    ClusterStatusType,
    get,
    getClusterListRaw,
    getIsRequestAborted,
    getK8sResourceList,
    getK8sResourceListPayload,
    getNamespaceListMin,
    getUrlWithSearchParams,
    InstallationClusterConfigType,
    Nodes,
    ResponseType,
    showError,
    stringComparatorBySortOrder,
} from '@devtron-labs/devtron-fe-common-lib'

import { getClusterList } from '@Components/ClusterNodes/clusterNodes.service'
import { importComponentFromFELibrary } from '@Components/common'

import { Routes } from '../../config'
import { SIDEBAR_KEYS } from './Constants'
import { GetResourceDataType, NodeRowDetail, URLParams } from './Types'
import { parseNodeList } from './Utils'

const getInstallationClusterConfigs = importComponentFromFELibrary('getInstallationClusterConfigs', null, 'function')

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
    selectedNamespace,
    clusterId,
    filters,
    abortControllerRef,
}: GetResourceDataType) => {
    try {
        if (selectedResource.gvk.Kind === SIDEBAR_KEYS.nodeGVK.Kind) {
            const response = await getNodeList(clusterId, abortControllerRef)

            return parseNodeList(response)
        }

        if (selectedResource.gvk.Kind.toLowerCase() === Nodes.Namespace.toLowerCase()) {
            const { result } = await getNamespaceListMin(clusterId)
            const [{ environments }] = result

            const response = await getK8sResourceList(
                getK8sResourceListPayload(clusterId, selectedNamespace.value.toLowerCase(), selectedResource, filters),
                abortControllerRef.current.signal,
            )

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
                ...response,
                result: {
                    ...response.result,
                    headers: [...response.result.headers, 'environment'],
                    data: response.result.data.map((data) => ({
                        ...data,
                        environment: namespaceToEnvironmentMap[data.name as string],
                    })),
                },
            }
        }

        return await getK8sResourceList(
            getK8sResourceListPayload(clusterId, selectedNamespace.value.toLowerCase(), selectedResource, filters),
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

export const getClusterListing = async (
    minified: boolean,
    abortControllerRef?: APIOptions['abortControllerRef'],
): Promise<ClusterDetail[]> => {
    try {
        const [rawClusterListResponse, installationClustersListResponse] = await Promise.allSettled([
            (minified ? getClusterListRaw : getClusterList)(abortControllerRef),
            getInstallationClusterConfigs ? getInstallationClusterConfigs(abortControllerRef) : [],
        ])

        if (rawClusterListResponse.status === 'rejected') {
            throw rawClusterListResponse.reason
        }

        const { result: rawClusterList } = rawClusterListResponse.value

        if (installationClustersListResponse.status === 'rejected' || !installationClustersListResponse.value.length) {
            return rawClusterList
        }

        const clusterListNameSet = new Set(rawClusterList.map(({ name }) => name))

        const installationClustersList: InstallationClusterConfigType[] = installationClustersListResponse.value

        return rawClusterList.concat(
            installationClustersList
                .filter(({ name }) => {
                    if (!clusterListNameSet.has(name)) {
                        return true
                    }

                    return false
                })
                .map(({ installationId, name }) => ({
                    id: installationId,
                    name,
                    status: ClusterStatusType.CREATING,
                    cpu: null,
                    memory: null,
                    nodeCount: 0,
                    nodeK8sVersions: [],
                    serverVersion: '',
                    nodeDetails: [],
                    nodeErrors: [],
                    errorInNodeListing: '',
                    isInstallationCluster: true,
                    isProd: false,
                })),
        )
    } catch (err) {
        if (!getIsRequestAborted(err)) {
            showError(err)
        }
        throw err
    }
}
