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
    BaseAppMetaData,
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

import { RecentlyVisitedGroupedOptionsType, RecentlyVisitedOptions } from '@Components/AppSelector/AppSelector.types'
import { getMinCharSearchPlaceholderGroup } from '@Components/AppSelector/constants'
import {
    getClusterListMinWithInstalledClusters,
    getClusterListWithInstalledClusters,
} from '@Components/ClusterNodes/clusterNodes.service'

import { Routes } from '../../config'
import { ClusterListOptionsTypes } from './ResourceList/types'
import { getOptionsValue } from './ResourceList/utils'
import { SIDEBAR_KEYS } from './Constants'
import { GetResourceDataType, NodeRowDetail, URLParams } from './Types'
import { parseNodeList } from './Utils'

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

        const isNamespaceList = selectedResource.gvk.Kind.toLowerCase() === Nodes.Namespace.toLowerCase()

        const [k8sResponse, namespaceListResponse] = await Promise.allSettled([
            getK8sResourceList(
                getK8sResourceListPayload(clusterId, selectedNamespace.value.toLowerCase(), selectedResource, filters),
                abortControllerRef.current.signal,
            ),
            isNamespaceList ? getNamespaceListMin(clusterId, abortControllerRef) : null,
        ])

        const response = k8sResponse.status === 'fulfilled' ? k8sResponse.value : null

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

        return response
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

export const clusterListOptions = ({
    clusterList,
    isInstallationStatusView = false,
    inputValue,
    recentlyVisitedDevtronApps,
}: ClusterListOptionsTypes): Promise<RecentlyVisitedGroupedOptionsType[]> =>
    new Promise((resolve) => {
        setTimeout(() => {
            if (inputValue.length < 3) {
                resolve(
                    recentlyVisitedDevtronApps?.length
                        ? [
                              {
                                  label: 'Recently Visited',
                                  options: recentlyVisitedDevtronApps.map((app: BaseAppMetaData) => ({
                                      label: app.appName,
                                      value: app.appId,
                                      isRecentlyVisited: true,
                                  })) as RecentlyVisitedOptions[],
                              },
                              getMinCharSearchPlaceholderGroup('Clusters'),
                          ]
                        : [],
                )
            } else {
                resolve([
                    {
                        label: 'All Clusters',
                        options: clusterList?.map((option) => ({
                            ...option,
                            value: +getOptionsValue(option, isInstallationStatusView),
                        })) as RecentlyVisitedOptions[],
                    },
                ] as RecentlyVisitedGroupedOptionsType[])
            }
        }, 300)
    })
