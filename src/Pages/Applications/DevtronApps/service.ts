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

import { ResourceKindType, get } from '@devtron-labs/devtron-fe-common-lib'

import { Routes } from '../../../config'
import { AppConfigStatusResponse, EnvConfigResponse } from './service.types'
import { DEFAULT_LANDING_STAGE } from './Details/AppConfigurations/appConfig.type'

export const getAppConfigStatus = (appId: number, resourceKind?: ResourceKindType): Promise<AppConfigStatusResponse> =>
    get(
        `${Routes.APP_CONFIG_STATUS}?app-id=${appId}${resourceKind === ResourceKindType.job ? `&appType=${DEFAULT_LANDING_STAGE.JOB_VIEW}` : ''}`,
    )

export const getEnvConfig = (appId: number, envId: number): Promise<EnvConfigResponse> =>
    get(`${Routes.ENV_CONFIG}?appId=${appId}&envId=${envId}`)
