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

import { post, put, trash, getTemplateAPIRoute } from '@devtron-labs/devtron-fe-common-lib'
import { Routes } from '../../config'
import { MaterialServiceProps } from './material.types'

export function createMaterial({ request, isTemplateView }: MaterialServiceProps) {
    const URL = isTemplateView
        ? getTemplateAPIRoute({ type: 'git-material', queryParams: { id: request.appId } })
        : `${Routes.GIT_MATERIAL}`
    return post(URL, request)
}

export function updateMaterial({ request, isTemplateView }: MaterialServiceProps) {
    const URL = isTemplateView
        ? getTemplateAPIRoute({ type: 'git-material', queryParams: { id: request.appId } })
        : `${Routes.GIT_MATERIAL}`
    return put(URL, request)
}

export function deleteMaterial({ request, isTemplateView }: MaterialServiceProps): Promise<any> {
    const URL = isTemplateView
        ? getTemplateAPIRoute({ type: 'git-material', queryParams: { id: request.appId } })
        : `${Routes.GIT_MATERIAL}/delete`
    return trash(URL, request)
}
