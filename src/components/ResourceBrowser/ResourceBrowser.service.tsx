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
    ApiResourceGroupType,
    convertJSONPointerToJSONPath,
} from '@devtron-labs/devtron-fe-common-lib'
import {
    getManifestResource,
    updateManifestResourceHelmApps,
} from '@Components/v2/appDetails/k8Resource/nodeDetail/nodeDetail.api'
import { applyOperation, escapePathComponent } from 'fast-json-patch'
import { JSONPath } from 'jsonpath-plus'
import { SelectedResourceType } from '@Components/v2/appDetails/appDetails.type'
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

export const deleteResource = (
    resourceListPayload: ResourceListPayloadType,
    signal?: AbortSignal,
): Promise<CreateResourceResponse> => post(Routes.DELETE_RESOURCE, resourceListPayload, signal ? { signal } : {})

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

export const restartWorkload = async (resource: SelectedResourceType, signal: AbortSignal) => {
    const {
        result: {
            manifestResponse: { manifest },
        },
    } = await getManifestResource(null, '', '', true, resource, signal)

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

    await updateManifestResourceHelmApps(null, '', '', JSON.stringify(manifest), true, resource, signal)
}
