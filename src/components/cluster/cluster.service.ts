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

import { get, post, put, trash, ResponseType } from '@devtron-labs/devtron-fe-common-lib'
import { Routes } from '../../config'
import { DeleteClusterPayload } from './cluster.type'

export function getClusterList(): Promise<any> {
    const URL = `${Routes.CLUSTER}`
    return get(URL)
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

export const saveEnvironment = (request, id: number): Promise<any> => {
    const URL = `${Routes.ENVIRONMENT}`
    return post(URL, request)
}

export const updateEnvironment = (request, id: number): Promise<any> => {
    const URL = `${Routes.ENVIRONMENT}`
    return put(URL, request)
}

export const getEnvironmentList = (): Promise<any> => {
    const URL = `${Routes.ENVIRONMENT}`
    return get(URL).then((response) => response)
}

export function deleteCluster(payload: DeleteClusterPayload): Promise<any> {
    return trash(Routes.CLUSTER, payload)
}

export function deleteEnvironment(request): Promise<any> {
    return trash(Routes.ENVIRONMENT, request)
}
