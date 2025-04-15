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

import { post, put, get, trash } from '@devtron-labs/devtron-fe-common-lib'
import { Routes } from '../../config'

// Dead code
export function getDockerRegistryConfig(id: string): Promise<any> {
    const URL = `${Routes.DOCKER_REGISTRY_CONFIG}/${id}`
    return get(URL)
}

export function saveRegistryConfig(request, id): Promise<any> {
    const URL = `${Routes.DOCKER_REGISTRY_CONFIG}`
    return post(URL, request)
}

export function updateRegistryConfig(request, id: string): Promise<any> {
    const URL = `${Routes.DOCKER_REGISTRY_CONFIG}`
    return put(URL, request)
}

export function deleteDockerReg(request): Promise<any> {
    return trash(Routes.DOCKER_REGISTRY_CONFIG, request)
}
