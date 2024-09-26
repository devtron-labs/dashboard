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

import { EnvConfigurationState } from '@Pages/Applications/DevtronApps/Details/AppConfigurations/AppConfig.types'
import { DOCUMENTATION, URLS } from '../../../config'
import { AppEnvironment } from '../../../services/service.types'
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

export const SECTION_HEADING_INFO: Record<string, SectionHeadingType> = {
    [URLS.APP_CM_CONFIG]: {
        title: 'ConfigMaps',
        subtitle:
            'ConfigMap is used to store common configuration variables, allowing users to unify environment variables for different modules in a distributed system into one object.',
        learnMoreLink: DOCUMENTATION.APP_CREATE_CONFIG_MAP,
    },
    [URLS.APP_CS_CONFIG]: {
        title: 'Secrets',
        subtitle: 'A Secret is an object that contains sensitive data such as passwords, OAuth tokens, and SSH keys.',
        learnMoreLink: DOCUMENTATION.APP_CREATE_SECRET,
    },
}

export interface EnvironmentOverrideComponentProps {
    appList?: ConfigAppList[]
    environments: AppEnvironment[]
    reloadEnvironments: () => void
    envName?: string
    appName?: string
    isJob?: boolean
    onErrorRedirectURL: string
    envConfig: EnvConfigurationState
    fetchEnvConfig: (envId: number) => void
}

export interface CommonEnvironmentOverridesProps {
    parentState: ComponentStates
    setParentState: React.Dispatch<React.SetStateAction<ComponentStates>>
    isJobView?: boolean
}

export interface DeploymentTemplateOverrideProps extends CommonEnvironmentOverridesProps {
    environments: AppEnvironment[]
    environmentName: string
    isProtected: boolean
    reloadEnvironments: () => void
    fetchEnvConfig: (envId: number) => void
}
export interface ListComponentType {
    name: string
    type: string
    label: string
    appChartRef: { id: number; version: string; name: string }
    isJobView?: boolean
}
