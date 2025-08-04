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

import { AppConfigProps } from '@devtron-labs/devtron-fe-common-lib'

import {
    AppConfigState,
    EnvConfigurationState,
} from '@Pages/Applications/DevtronApps/Details/AppConfigurations/AppConfig.types'

import { ConfigAppList } from '../../../components/ApplicationGroup/AppGroup.types'

export interface EnvironmentOverrideComponentProps extends Required<Pick<AppConfigProps, 'isTemplateView'>> {
    appList?: ConfigAppList[]
    environments: AppConfigState['environmentList']
    reloadEnvironments: () => void
    envName?: string
    appName?: string
    isJob?: boolean
    onErrorRedirectURL: string
    envConfig: EnvConfigurationState
    fetchEnvConfig: (envId: number) => void
    appOrEnvIdToResourceApprovalConfigurationMap: AppConfigState['envIdToEnvApprovalConfigurationMap']
}

export interface ListComponentType {
    name: string
    type: string
    label: string
    appChartRef: { id: number; version: string; name: string }
    isJobView?: boolean
}
