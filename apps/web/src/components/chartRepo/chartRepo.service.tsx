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

import { post, get, trash } from '@devtron-labs/devtron-fe-common-lib'
import { Routes } from '../../config'

export const getChartProviderConfig = (id: number): Promise<any> => {
    const URL = `${Routes.CHART_REPO}/${Routes.CHART_LIST_SUBPATH}/${id}`
    return get(URL)
}

export const updateChartProviderConfig = (request: any, id: number) => {
    const URL = `${Routes.CHART_REPO}/update`
    return post(URL, request)
}

export const saveChartProviderConfig = (request: any, id: any) => {
    const URL = `${Routes.CHART_REPO}/create`
    return post(URL, request)
}

export const validateChartRepoConfiguration = (request: any): Promise<any> => {
    const URL = `${Routes.CHART_REPO}/validate`
    return post(URL, request)
}

export const reSyncChartRepo = (): Promise<any> => {
    const URL = `${Routes.CHART_REPO}/${Routes.CHART_RESYNC}`
    return post(URL, undefined)
}

export function deleteChartRepo(request) {
    return trash(`${Routes.CHART_REPO}`, request)
}
