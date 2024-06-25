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

export const getGitProviderConfig = (id: number): Promise<any> => {
    const URL = `${Routes.GIT_PROVIDER}/${id}`
    return get(URL)
}

export const updateGitProviderConfig = (request: any, id: number) => {
    const URL = `${Routes.GIT_PROVIDER}`
    return put(URL, request)
}

export const saveGitProviderConfig = (request: any, id: any) => {
    const URL = `${Routes.GIT_PROVIDER}`
    return post(URL, request)
}

export function getGitHost(id: number | string): Promise<any> {
    const URL = `${Routes.GIT_HOST}/${id}`
    return get(URL)
}

export function saveGitHost(payload): Promise<any> {
    const URL = `${Routes.GIT_HOST}`
    return post(URL, payload)
}

export function deleteGitProvider(request): Promise<any> {
    return trash(Routes.GIT_PROVIDER, request)
}
