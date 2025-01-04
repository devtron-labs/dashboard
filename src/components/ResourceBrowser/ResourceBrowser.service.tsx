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
    post,
    ResponseType,
    convertJSONPointerToJSONPath,
    getK8sResourceList,
    getIsRequestAborted,
    showError,
    getUrlWithSearchParams,
    getK8sResourceListPayload,
    stringComparatorBySortOrder,
} from '@devtron-labs/devtron-fe-common-lib'
import {
    getManifestResource,
    updateManifestResourceHelmApps,
} from '@Components/v2/appDetails/k8Resource/nodeDetail/nodeDetail.api'
import { applyOperation, escapePathComponent } from 'fast-json-patch'
import { JSONPath } from 'jsonpath-plus'
import { SelectedResourceType } from '@Components/v2/appDetails/appDetails.type'
import { MutableRefObject, RefObject } from 'react'
import { Routes } from '../../config'
import { ClusterListResponse } from '../../services/service.types'
import { ResourceListPayloadType, ResourceType, GetResourceDataType, NodeRowDetail, URLParams } from './Types'
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

export const deleteResource = (
    resourceListPayload: ResourceListPayloadType,
    abortControllerRef?: MutableRefObject<AbortController>,
): Promise<ResponseType<ResourceType[]>> => post(Routes.DELETE_RESOURCE, resourceListPayload, { abortControllerRef })

export const restartWorkload = async (
    resource: SelectedResourceType,
    abortControllerRef?: MutableRefObject<AbortController>,
) => {
    const {
        result: {
            manifestResponse: { manifest },
        },
    } = await getManifestResource(null, '', '', true, resource, abortControllerRef.current.signal)

    if (!manifest) {
        return
    }

    const metadataPath = '/spec/template/metadata'
    const annotationsPath = `${metadataPath}/annotations`
    const restartLabel = 'devtron/restart'

    const jsonpathProps = {
        json: manifest,
        wrap: false,
        resultType: 'value',
    } as const

    const dateString = new Date().toISOString()

    if (!JSONPath({ path: convertJSONPointerToJSONPath(metadataPath), ...jsonpathProps })) {
        applyOperation(
            manifest,
            {
                op: 'add',
                path: metadataPath,
                value: {
                    annotations: {
                        [restartLabel]: dateString,
                    },
                },
            },
            false,
            true,
        )
    } else if (
        !JSONPath({
            path: convertJSONPointerToJSONPath(annotationsPath),
            ...jsonpathProps,
        })
    ) {
        applyOperation(
            manifest,
            {
                op: 'add',
                path: annotationsPath,
                value: { [restartLabel]: dateString },
            },
            false,
            true,
        )
    } else {
        applyOperation(
            manifest,
            {
                op: 'add',
                // NOTE: we only need to escape / in restartLabel when making a path out of it
                path: `${annotationsPath}/${escapePathComponent(restartLabel)}t`,
                value: dateString,
            },
            false,
            true,
        )
    }

    await updateManifestResourceHelmApps(
        null,
        '',
        '',
        JSON.stringify(manifest),
        true,
        resource,
        abortControllerRef.current.signal,
    )
}

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
