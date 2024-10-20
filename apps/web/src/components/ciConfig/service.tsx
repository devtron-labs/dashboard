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

import { get, post } from '@devtron-labs/devtron-fe-common-lib'
import { Routes } from '../../config'

export function saveCIConfig(request) {
    return post(Routes.CI_CONFIG_GET, request)
}

export function updateCIConfig(request) {
    return post(Routes.CI_CONFIG_UPDATE, request)
}

export function getDockerRegistryMinAuth(appId: string, isStorageActionPush?: boolean) {
    return get(
        `${Routes.APP}/${appId}/autocomplete/docker${isStorageActionPush ? '?storageType=CHART&storageAction=PUSH' : ''}`,
    )
}

export const getBuildpackMetadata = (): Promise<any> => {
    return fetch(`${window?._env_?.CENTRAL_API_ENDPOINT || 'https://api.devtron.ai'}/buildpackMetadata`).then((res) =>
        res.json(),
    )
}

export const getDockerfileTemplate = (): Promise<any> => {
    return fetch(`${window?._env_?.CENTRAL_API_ENDPOINT || 'https://api.devtron.ai'}/dockerfileTemplate`).then((res) =>
        res.json(),
    )
}
