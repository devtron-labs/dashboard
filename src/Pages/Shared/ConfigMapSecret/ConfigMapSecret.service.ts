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

import { get, post, trash, ResponseType } from '@devtron-labs/devtron-fe-common-lib'

import { Routes } from '@Config/constants'

import { CMSecretDTO, CMSecretComponentType } from './types'

export function updateConfig(id, appId, configData, signal?) {
    return post(
        `${Routes.APP_CREATE_CONFIG_MAP}`,
        {
            ...(id && { id }),
            appId,
            configData: [configData],
        },
        { signal },
    )
}

export function deleteConfig(id, appId, name) {
    return trash(`${Routes.APP_CREATE_CONFIG_MAP}/${appId}/${id}?name=${name}`)
}

export function deleteEnvConfigMap(id, appId, envId, name) {
    return trash(`${Routes.APP_CREATE_ENV_CONFIG_MAP}/${appId}/${envId}/${id}?name=${name}`)
}

export function overRideConfigMap(appId, environmentId, configData, signal?) {
    return post(
        `${Routes.APP_CREATE_ENV_CONFIG_MAP}`,
        {
            appId,
            environmentId,
            configData,
        },
        { signal },
    )
}

export function updateSecret(id, appId, configData, signal?) {
    return post(
        `${Routes.APP_CREATE_SECRET}`,
        {
            ...(id && { id }),
            appId,
            configData: [configData],
        },
        { signal },
    )
}

export function deleteSecret(id, appId, name) {
    return trash(`${Routes.APP_CREATE_SECRET}/${appId}/${id}?name=${name}`)
}

export function deleteEnvSecret(id, appId, envId, name) {
    return trash(`${Routes.APP_CREATE_ENV_SECRET}/${appId}/${envId}/${id}?name=${name}`)
}

export function overRideSecret(appId, environmentId, configData, signal?) {
    return post(
        `${Routes.APP_CREATE_ENV_SECRET}`,
        {
            appId,
            environmentId,
            configData,
        },
        { signal },
    )
}

export const getCMSecret = (
    componentType: CMSecretComponentType,
    id,
    appId,
    name,
    envId?,
    signal?,
): Promise<ResponseType<CMSecretDTO>> => {
    let url = ''
    if (envId !== null && envId !== undefined) {
        url = `${
            componentType === CMSecretComponentType.Secret
                ? Routes.APP_CREATE_ENV_SECRET
                : Routes.APP_CREATE_ENV_CONFIG_MAP
        }/edit/${appId}/${envId}`
    } else {
        url = `${componentType === CMSecretComponentType.Secret ? Routes.APP_CREATE_SECRET : Routes.APP_CREATE_CONFIG_MAP}/edit/${appId}`
    }
    return get(`${url}/${id}?name=${name}`, { signal })
}
