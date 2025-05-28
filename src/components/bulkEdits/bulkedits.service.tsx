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

export function updateBulkList(request): Promise<any> {
    const { apiVersion } = request
    const kind = request.kind.toLocaleLowerCase()
    const URL = `${apiVersion}/${kind} `
    return post(URL, request)
}

export function updateImpactedObjectsList(request): Promise<any> {
    const { apiVersion } = request
    const kind = request.kind.toLocaleLowerCase()
    const URL = `${apiVersion}/${kind}/dryrun `
    return post(URL, request)
}

export function getSeeExample() {
    const URL = `${Routes.BULK_UPDATE_APIVERSION}/${Routes.BULK_UPDATE_KIND}/readme`
    return get(URL)
}
