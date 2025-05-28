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

import {
    convertDeploymentChartListToChartType,
    DeploymentChartListDTO,
    DeploymentChartType,
    get,
    post,
    put,
    ResponseType,
    ROUTES,
    showError,
} from '@devtron-labs/devtron-fe-common-lib'

import { sortObjectArrayAlphabetically } from '@Components/common'
import { Routes } from '@Config/constants'

import { ChartUploadResponse, ChartUploadType } from '../types'

export const getChartList = async (): Promise<DeploymentChartType[]> => {
    try {
        const { result }: ResponseType<DeploymentChartListDTO> = await get(ROUTES.DEPLOYMENT_CHARTS_LIST)
        return sortObjectArrayAlphabetically(
            convertDeploymentChartListToChartType(result),
            'name',
        ) as DeploymentChartType[]
    } catch (error) {
        showError(error)
        throw error
    }
}

export const validateChart = (payload: FormData): Promise<ChartUploadResponse> =>
    post(Routes.VALIDATE_CUSTOM_CHART, payload, {}, true)
export const uploadChart = (payload: ChartUploadType): Promise<ChartUploadResponse> =>
    put(Routes.UPLOAD_CUSTOM_CHART, payload)
