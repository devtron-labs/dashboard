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

import { ROUTES, ResponseType, get, getUrlWithSearchParams, showError } from '../../Common'
import {
    CIMaterialInfoDTO,
    CIMaterialInfoType,
    GetCITriggerInfoParamsType,
    AppEnvDeploymentConfigDTO,
    AppEnvDeploymentConfigPayloadType,
} from './app.types'
import { getParsedCIMaterialInfo } from './utils'

export const getCITriggerInfo = async (params: GetCITriggerInfoParamsType): Promise<CIMaterialInfoType> => {
    try {
        const { result } = (await get(
            `${ROUTES.APP}/material-info/${params.envId}/${params.ciArtifactId}`,
        )) as ResponseType<CIMaterialInfoDTO>

        return getParsedCIMaterialInfo(result)
    } catch (err) {
        showError(err)
        throw err
    }
}

/**
 * The only difference between this and getCITriggerInfo is it doesn't have env and trigger related meta info
 */
export const getArtifactInfo = async (
    params: Pick<GetCITriggerInfoParamsType, 'ciArtifactId'>,
): Promise<CIMaterialInfoType> => {
    try {
        const { result } = (await get(
            `${ROUTES.APP}/material-info/${params.ciArtifactId}`,
        )) as ResponseType<CIMaterialInfoDTO>

        return getParsedCIMaterialInfo(result)
    } catch (err) {
        showError(err)
        throw err
    }
}

export const getAppEnvDeploymentConfig = ({
    params,
    signal,
}: {
    params: AppEnvDeploymentConfigPayloadType
    signal?: AbortSignal
}): Promise<ResponseType<AppEnvDeploymentConfigDTO>> =>
    get(getUrlWithSearchParams(ROUTES.CONFIG_DATA, params), { signal })
