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

import { get, post, put, trash, ResponseType } from '@devtron-labs/devtron-fe-common-lib'
import { Routes } from '../../config'
import guiSchema from '../deploymentConfig/basicViewSchema.json'

export function getDeploymentTemplate(appId, envId, chartId) {
    return new Promise<ResponseType>((resolve, reject) => {
        ;(async () => {
            const data = await get(`app/env/${appId}/${envId}/${chartId}`)
            if (!data.result.guiSchema) {
                data.result.guiSchema = JSON.stringify(guiSchema)
            }
            resolve(data)
        })().catch((err) => reject(err))
    })
}

export function updateDeploymentTemplate(appId, envId, payload) {
    return put(`app/env`, payload)
}

export function createDeploymentTemplate(appId, envId, payload) {
    return post(`app/env/${appId}/${envId}`, payload)
}

export function deleteDeploymentTemplate(id, appId, envId) {
    return trash(`app/env/reset/${appId}/${envId}/${id}`)
}

export function createNamespace(appId, envId, payload) {
    return post(`app/env/namespace/${appId}/${envId}`, payload)
}

export function toggleAppMetrics(appId, envId, payload) {
    return post(`app/env/metrics/${appId}/${envId}`, payload)
}

export function chartRefAutocomplete(appId, envId, signal?) {
    return get(`${Routes.CHART_REFERENCES_MIN}/${appId}/${envId}`, { signal })
}
