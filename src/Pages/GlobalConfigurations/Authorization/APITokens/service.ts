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

import { get, post, put, ResponseType, trash } from '@devtron-labs/devtron-fe-common-lib'

import { Routes } from '../../../../config'

export function getGeneratedAPITokenList(): Promise<ResponseType> {
    return get(Routes.API_TOKEN)
}

export function createGeneratedAPIToken(payload): Promise<ResponseType> {
    return post(Routes.API_TOKEN, payload)
}

export function updateGeneratedAPIToken(request, id): Promise<ResponseType> {
    return put(`${Routes.API_TOKEN}/${id}`, request)
}

export function deleteGeneratedAPIToken(id: string): Promise<ResponseType> {
    const URL = `${Routes.API_TOKEN}/${id}`
    return trash(URL)
}
