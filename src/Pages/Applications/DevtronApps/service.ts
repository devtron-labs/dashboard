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

/*
 *   Copyright (c) 2024 Devtron Inc.
 *   All rights reserved.

 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at

 *   http://www.apache.org/licenses/LICENSE-2.0

 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import {
    AppConfigProps,
    get,
    getTemplateAPIRoute,
    GetTemplateAPIRouteType,
    getUrlWithSearchParams,
    noop,
    ResourceKindType,
    ResponseType,
    showError,
} from '@devtron-labs/devtron-fe-common-lib'

import { Routes } from '@Config/constants'

import { DEFAULT_LANDING_STAGE, EnvConfigType } from './Details/AppConfigurations/AppConfig.types'
import { transformEnvConfig } from './Details/AppConfigurations/AppConfig.utils'
import { AppConfigStatusItemType } from './service.types'

export const getAppConfigStatus = (
    appId: number,
    resourceKind: ResourceKindType,
    isTemplateView: AppConfigProps['isTemplateView'],
): Promise<ResponseType<AppConfigStatusItemType[]>> => {
    const queryParams = {
        'app-id': appId,
        appType: resourceKind === ResourceKindType.job ? DEFAULT_LANDING_STAGE.JOB_VIEW : undefined,
    }

    const URL = isTemplateView
        ? getTemplateAPIRoute({
              type: GetTemplateAPIRouteType.STAGE_STATUS,
              queryParams: { id: String(appId), ...queryParams },
          })
        : getUrlWithSearchParams(Routes.APP_CONFIG_STATUS, queryParams)

    return get(URL)
}

export const getEnvConfig = async (
    appId: number,
    envId: number,
    isTemplateView: AppConfigProps['isTemplateView'],
    callback: (res: EnvConfigType) => void = noop,
) => {
    try {
        const queryParams = { appId, envId }
        const URL = isTemplateView
            ? getTemplateAPIRoute({
                  type: GetTemplateAPIRouteType.CD_DEPLOY_CONFIG,
                  queryParams: { id: String(appId), ...queryParams },
              })
            : getUrlWithSearchParams(Routes.ENV_CONFIG, queryParams)

        const res = await get(URL)
        const envConfig = transformEnvConfig(res.result)
        callback(envConfig)

        return envConfig
    } catch (err) {
        showError(err)
        callback(null)

        throw err
    }
}
