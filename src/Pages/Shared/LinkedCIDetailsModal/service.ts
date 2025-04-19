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

import { get, getUrlWithSearchParams, ResponseType, showError } from '@devtron-labs/devtron-fe-common-lib'

import { Routes, SELECT_ALL_VALUE } from '../../../config'
import { CIPpelineEnviromentList, LinkedCIAppDto, LinkedCIAppListFilterParams } from './types'

export const getLinkedCIPipelineEnvironmentList = async (ciPipelineId: string): Promise<CIPpelineEnviromentList> => {
    try {
        const { result } = (await get(
            `${Routes.CI_CONFIG_GET}/${ciPipelineId}/${Routes.LINKED_CI_DOWNSTREAM}/${Routes.ENVIRONMENT}`,
        )) as ResponseType<{
            envNames: string[]
        }>
        return result.envNames
    } catch (error) {
        showError(error)
        throw error
    }
}

export const getAppList = async (
    ciPipelineId: string,
    filterConfig: LinkedCIAppListFilterParams,
    signal?: AbortSignal,
): Promise<{
    data: LinkedCIAppDto[]
    totalCount: number
}> => {
    const { environment, ..._filterConfig } = filterConfig
    const queryParams = {
        ..._filterConfig,
        envName: environment === SELECT_ALL_VALUE ? '' : environment,
    }
    try {
        const {
            result: { data, totalCount },
        } = (await get(
            getUrlWithSearchParams(
                `${Routes.CI_CONFIG_GET}/${ciPipelineId}/${Routes.LINKED_CI_DOWNSTREAM}/cd`,
                queryParams ?? {},
            ),
            { signal },
        )) as ResponseType<{
            data: LinkedCIAppDto[]
            totalCount: number
        }>

        return {
            data,
            totalCount,
        }
    } catch (error) {
        if (!signal?.aborted) {
            showError(error)
        }
        throw error
    }
}
