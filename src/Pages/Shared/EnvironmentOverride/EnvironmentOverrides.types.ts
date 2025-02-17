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

import React from 'react'
import {
    AppConfigState,
    EnvConfigurationState,
} from '@Pages/Applications/DevtronApps/Details/AppConfigurations/AppConfig.types'
import { ConfigAppList } from '../../../components/ApplicationGroup/AppGroup.types'

export enum ComponentStates {
    loading = 'loading',
    loaded = 'loaded',
    success = 'success',
    failed = 'failed',
    reloading = 'reloading',
}

export interface SectionHeadingType {
    title: string
    subtitle: string
    learnMoreLink: string
}

export interface EnvironmentOverrideComponentProps {
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

export interface CommonEnvironmentOverridesProps {
    parentState: ComponentStates
    setParentState: React.Dispatch<React.SetStateAction<ComponentStates>>
    isJobView?: boolean
}

export interface ListComponentType {
    name: string
    type: string
    label: string
    appChartRef: { id: number; version: string; name: string }
    isJobView?: boolean
}
