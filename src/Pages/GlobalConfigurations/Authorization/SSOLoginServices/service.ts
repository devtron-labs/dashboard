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

/* eslint-disable @typescript-eslint/no-explicit-any */
import { post, put, get, getUrlWithSearchParams, ResponseType } from '@devtron-labs/devtron-fe-common-lib'
import { Routes } from '../../../../config'

export function getSSOConfigList(): Promise<ResponseType<any>> {
    return get(Routes.SSO_LIST)
}

export function getSSOConfig(name: string): Promise<any> {
    return get(getUrlWithSearchParams(Routes.SSO, { name }))
}

export function createSSOList(request): Promise<any> {
    return post(Routes.SSO_CREATE, request)
}

export function updateSSOList(request): Promise<any> {
    return put(Routes.SSO_UPDATE, request)
}
