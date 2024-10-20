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

import { post, put, get } from '@devtron-labs/devtron-fe-common-lib'
import { Routes } from '../../config'

export const getGitOpsConfiguration = (id: number): Promise<any> => {
    const URL = `${Routes.GITOPS}/${id}`
    return get(URL)
}

export const updateGitOpsConfiguration = (request: any): Promise<any> => {
    const URL = `${Routes.GITOPS}`
    return put(URL, request)
}

export const saveGitOpsConfiguration = (request: any): Promise<any> => {
    const URL = `${Routes.GITOPS}`
    return post(URL, request)
}

export function getGitOpsConfigurationList(): Promise<any> {
    const URL = `${Routes.GITOPS}`
    return get(URL)
}

export const validateGitOpsConfiguration = (request: any): Promise<any> => {
    const URL = `${Routes.GITOPS_VALIDATE}`
    return post(URL, request)
}

export const validateHelmAppGitOpsConfiguration = (request: any): Promise<any> => {
    return post(Routes.GITOPOS_HELM_VALIDATE, request)
}
