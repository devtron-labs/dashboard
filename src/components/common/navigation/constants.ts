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

import { EnvironmentDataValuesDTO, MainContext } from '@devtron-labs/devtron-fe-common-lib'

import { EnvironmentDataStateType } from './types'

const DEFAULT_GIT_OPS_FEATURE_FLAGS: MainContext['featureGitOpsFlags'] = {
    isFeatureArgoCdMigrationEnabled: false,
    isFeatureGitOpsEnabled: false,
    isFeatureUserDefinedGitOpsEnabled: false,
}

const COMMON_ENV_FALLBACK: Omit<EnvironmentDataValuesDTO, 'isAirGapEnvironment'> = {
    isManifestScanningEnabled: false,
    canOnlyViewPermittedEnvOrgLevel: false,
    featureGitOpsFlags: structuredClone(DEFAULT_GIT_OPS_FEATURE_FLAGS),
    canFetchHelmAppStatus: false,
    devtronManagedLicensingEnabled: false,
}

export const ENVIRONMENT_DATA_FALLBACK: EnvironmentDataValuesDTO = {
    ...COMMON_ENV_FALLBACK,
    isAirGapEnvironment: false,
}

export const INITIAL_ENV_DATA_STATE: EnvironmentDataStateType = {
    ...COMMON_ENV_FALLBACK,
    isAirgapped: structuredClone(ENVIRONMENT_DATA_FALLBACK).isAirGapEnvironment,
}
