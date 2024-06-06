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

import { post, put, trash } from '@devtron-labs/devtron-fe-common-lib'
import { Routes } from '../../config'

export function createMaterial(request) {
    const URL = `${Routes.GIT_MATERIAL}`
    return post(URL, request)
}

export function updateMaterial(request) {
    const URL = `${Routes.GIT_MATERIAL}`
    return put(URL, request)
}

export function deleteMaterial(request): Promise<any> {
    return trash(`${Routes.GIT_MATERIAL}/delete`, request)
}
