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

import { AppConfigurationContextType } from './appConfig.type'
import { UserRoleType } from '../../../../GlobalConfigurations/Authorization/constants'

export const AppConfigurationContext = React.createContext<AppConfigurationContextType>({
    appId: '',
    isUnlocked: {
        configmap: false,
        deploymentTemplate: false,
        dockerBuildConfig: false,
        material: false,
        workflowEditor: false,
        secret: false,
        envOverride: false,
        gitOpsConfig: false,
    },
    navItems: [],
    respondOnSuccess: () => {},
    isCiPipeline: false,
    getWorkflows: () => {},
    isCDPipeline: false,
    environments: [],
    workflowsRes: {
        appId: -1,
        appName: '',
        isGitOpsRepoNotConfigured: false,
        workflows: [],
    },
    userRole: UserRoleType.View,
    canShowExternalLinks: false,
    toggleRepoSelectionTippy: () => {},
    setRepoState: () => {},
    isJobView: false,
    isBaseConfigProtected: false,
    reloadEnvironments: () => {},
    configProtectionData: [],
    filteredEnvIds: '',
    isGitOpsConfigurationRequired: false,
    reloadAppConfig: () => {},
    lastUnlockedStage: '',
    deleteApp: () => {},
    showCannotDeleteTooltip: false,
    isWorkflowEditorUnlocked: false,
    getRepo: '',
    hideConfigHelp: false,
})

export const useAppConfigurationContext = () => {
    const context = React.useContext(AppConfigurationContext)
    if (!context) {
        throw new Error(`App Configuration Context cannot be used outside app config scope`)
    }
    return context
}
