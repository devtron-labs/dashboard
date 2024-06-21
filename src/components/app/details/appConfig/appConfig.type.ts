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

import { UserRoleType } from '../../../../Pages/GlobalConfigurations/Authorization/constants'
import { AppEnvironment, AppOtherEnvironment } from '../../../../services/service.types'
import { WorkflowResult } from '../triggerView/types'

export enum STAGE_NAME {
    LOADING = 'LOADING',
    APP = 'APP',
    GIT_MATERIAL = 'MATERIAL',
    CI_CONFIG = 'TEMPLATE',
    CI_PIPELINE = 'CI_PIPELINE',
    DEPLOYMENT_TEMPLATE = 'CHART',
    GITOPS_CONFIG = 'GITOPS_CONFIG',
    CD_PIPELINE = 'CD_PIPELINE',
    CHART_ENV_CONFIG = 'CHART_ENV_CONFIG',
}

export type StageNames = keyof typeof STAGE_NAME | 'WORKFLOW' | 'CONFIGMAP' | 'SECRETS' | 'ENV_OVERRIDE'

export enum DEVTRON_APPS_STEPS {
    GITOPS_CONFIG = 5,
    NO_GITOS_CONFIG = 4,
}

export enum DEFAULT_LANDING_STAGE {
    JOB_VIEW = 2,
    DEVTRON_APPS = 5,
}

export interface AppConfigProps {
    appName: string
    isJobView?: boolean
    filteredEnvIds?: string
}
export interface AppConfigState {
    view: string
    statusCode: number
    stageName: StageNames
    isUnlocked: any
    appName: string
    isCiPipeline: boolean
    isCDPipeline: boolean
    showDeleteConfirm: boolean
    navItems: CustomNavItemsType[]
    maximumAllowedUrl: string
    canDeleteApp: boolean
    workflowsRes?: WorkflowResult
    environmentList?: any[]
    isBaseConfigProtected?: boolean
    configProtectionData?: any[]
}

export interface AppStageUnlockedType {
    material: boolean
    dockerBuildConfig: boolean
    deploymentTemplate: boolean
    workflowEditor: boolean
    configmap: boolean
    secret: boolean
    envOverride: boolean
    gitOpsConfig: boolean
}

export interface CustomNavItemsType {
    title: string
    href: string
    stage: string
    isLocked: boolean
    supportDocumentURL: string
    flowCompletionPercent: number
    currentStep: number
    required?: boolean
    isProtectionAllowed?: boolean
}

export interface AppConfigNavigationProps {
    navItems: CustomNavItemsType[]
    deleteApp: () => void
    canShowExternalLinks: boolean
    showCannotDeleteTooltip: boolean
    isWorkflowEditorUnlocked: boolean
    toggleRepoSelectionTippy: () => void
    getRepo: string
    isJobView: boolean
    hideConfigHelp: boolean
    workflowsRes?: WorkflowResult
    getWorkflows: () => void
    environmentList?: any[]
    isBaseConfigProtected?: boolean
    reloadEnvironments: () => void
    isGitOpsConfigurationRequired: boolean
}

export interface AppComposeRouterProps {
    appId: string
    isUnlocked: AppStageUnlockedType
    navItems: CustomNavItemsType[]
    respondOnSuccess: () => void
    isCiPipeline: boolean
    getWorkflows: () => void
    isCDPipeline: boolean
    environments: AppEnvironment[]
    workflowsRes: WorkflowResult
    userRole: UserRoleType
    canShowExternalLinks: boolean
    toggleRepoSelectionTippy: () => void
    setRepoState: React.Dispatch<React.SetStateAction<string>>
    isJobView: boolean
    isBaseConfigProtected?: boolean
    reloadEnvironments: () => void
    configProtectionData: any[]
    filteredEnvIds?: string
    isGitOpsConfigurationRequired?: boolean
    reloadAppConfig: () => void
    lastUnlockedStage: string
}

export interface EnvironmentOverridesProps {
    environmentResult: AppOtherEnvironment
    environmentsLoading: boolean
    environmentList?: any[]
    isJobView?: boolean
    ciPipelines?: any[]
    reload?: () => void
    appId?: string
    workflowsRes?: WorkflowResult
}

export interface EnvironmentOverrideRouteProps {
    envOverride: AppEnvironment
    isJobView?: boolean
    ciPipelines?: any[]
    reload?: () => void
    appId?: string
    workflowsRes?: WorkflowResult
    isEnvProtected?: boolean
}

export interface EnvironmentOverrideRouterProps {
    isJobView?: boolean
    workflowsRes?: WorkflowResult
    getWorkflows: () => void
    allEnvs?: any[]
    reloadEnvironments: () => void
}

export interface NextButtonProps {
    isCiPipeline: boolean
    navItems: CustomNavItemsType[]
    currentStageName: STAGE_NAME
    isDisabled: boolean
}
