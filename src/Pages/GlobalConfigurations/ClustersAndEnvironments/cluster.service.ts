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
    get,
    getUrlWithSearchParams,
    post,
    put,
    stringComparatorBySortOrder,
    trash,
} from '@devtron-labs/devtron-fe-common-lib'

import { Routes } from '@Config/constants'

import { Cluster, ClusterDTO, DeleteClusterPayload, Environment, EnvironmentDTO } from './cluster.type'

export const getEnvironmentList = async (): Promise<Environment[]> => {
    const { result } = await get<EnvironmentDTO[]>(Routes.ENVIRONMENT)

    return (result ?? []).map(
        // eslint-disable-next-line camelcase
        ({ environment_name, cluster_id, cluster_name, prometheus_endpoint, default: isProd, namespace, ...res }) => ({
            ...res,
            // id,
            // eslint-disable-next-line camelcase
            environmentName: environment_name,
            // eslint-disable-next-line camelcase
            clusterId: cluster_id,
            // eslint-disable-next-line camelcase
            clusterName: cluster_name,
            // eslint-disable-next-line camelcase
            prometheusEndpoint: prometheus_endpoint ?? '',
            isProd,
            namespace: namespace ?? '',
        }),
    )
}

export const getClusterList = async (clusterIds?: number[]): Promise<Cluster[]> => {
    const url = getUrlWithSearchParams(Routes.CLUSTER, { clusterId: clusterIds?.join() })
    const { result } = await get<ClusterDTO[]>(url)

    return (
        (result ?? [])
            // eslint-disable-next-line camelcase
            .map(({ id, server_url, cluster_name, prometheus_url, category, ...res }) => ({
                ...res,
                clusterId: id,
                // eslint-disable-next-line camelcase
                serverUrl: server_url,
                // eslint-disable-next-line camelcase
                clusterName: cluster_name,
                // eslint-disable-next-line camelcase
                prometheusUrl: prometheus_url,
                category: category?.name
                    ? {
                          label: category.name,
                          value: category.id,
                      }
                    : null,
            }))
            .sort((a, b) => stringComparatorBySortOrder(a.clusterName, b.clusterName))
    )
}

export function getCluster(id: number) {
    const URL = `${Routes.CLUSTER}?id=${id}`
    return get(URL)
}

export function saveClusters(payload) {
    const URL = `${Routes.SAVECLUSTER}`
    return post(URL, payload)
}

export function validateCluster(payload) {
    const URL = `${Routes.VALIDATE}`
    return post(URL, payload)
}

export function saveCluster(request) {
    const URL = `${Routes.CLUSTER}`
    return post(URL, request)
}

export function updateCluster(request) {
    const URL = `${Routes.CLUSTER}`
    return put(URL, request)
}

export const getEnvironment = (id: number): Promise<any> => {
    const URL = `${Routes.ENVIRONMENT}?id=${id}`
    return get(URL)
}

export const saveEnvironment = (request): Promise<any> => post(Routes.ENVIRONMENT, request)

export const updateEnvironment = (request): Promise<any> => put(Routes.ENVIRONMENT, request)

export function deleteCluster(payload: DeleteClusterPayload): Promise<any> {
    return trash(Routes.CLUSTER, { ...payload })
}

export function deleteEnvironment(request): Promise<any> {
    return trash(Routes.ENVIRONMENT, request)
}
