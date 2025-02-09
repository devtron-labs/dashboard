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
    ResourceKindType,
    ResponseType,
    get,
    getUrlWithSearchParams,
    noop,
    showError,
} from '@devtron-labs/devtron-fe-common-lib'

import { Routes } from '@Config/constants'

import { AppConfigStatusItemType } from './service.types'
import { DEFAULT_LANDING_STAGE, EnvConfigType } from './Details/AppConfigurations/AppConfig.types'
import { transformEnvConfig } from './Details/AppConfigurations/AppConfig.utils'

export const getAppConfigStatus = (
    appId: number,
    resourceKind?: ResourceKindType,
): Promise<ResponseType<AppConfigStatusItemType[]>> =>
    get(
        getUrlWithSearchParams(Routes.APP_CONFIG_STATUS, {
            'app-id': appId,
            appType: resourceKind === ResourceKindType.job ? DEFAULT_LANDING_STAGE.JOB_VIEW : undefined,
        }),
    )

export const getEnvConfig = async (appId: number, envId: number, callback: (res: EnvConfigType) => void = noop) => {
    try {
        const res = await get(getUrlWithSearchParams(Routes.ENV_CONFIG, { appId, envId }))
        const envConfig = transformEnvConfig(res.result)
        callback(envConfig)

        return envConfig
    } catch (err) {
        showError(err)
        // TODO: test
        callback(null)

        throw err
    }
}
