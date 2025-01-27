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

import { getAppEnvDeploymentConfig, TemplateListDTO } from '@devtron-labs/devtron-fe-common-lib'
import { getManifestData } from './service.utils'
import { AppEnvDeploymentConfigQueryParamsType } from '../../AppConfig.types'

type ManifestComparisonDataType = {
    isManifestComparison: true
    manifestData: [Awaited<ReturnType<typeof getManifestData>>, Awaited<ReturnType<typeof getManifestData>>]
    appConfigData?: never
}

type AppConfigComparisonDataType = {
    isManifestComparison: false
    appConfigData: [
        Awaited<ReturnType<typeof getAppEnvDeploymentConfig>>,
        Awaited<ReturnType<typeof getAppEnvDeploymentConfig>>,
    ]
    manifestData?: never
}

export type DeploymentConfigComparisonDataType = ManifestComparisonDataType | AppConfigComparisonDataType

export interface SetIdentifierIdBasedOnConfigurationProps {
    identifierId: AppEnvDeploymentConfigQueryParamsType['identifierId']
    isManifestView: boolean
    previousDeployments: TemplateListDTO[]
}
