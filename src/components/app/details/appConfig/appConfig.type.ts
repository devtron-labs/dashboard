import { AppEnvironment, AppOtherEnvironment } from '../../../../services/service.types'
import { UserRoleType } from '../../../userGroups/userGroups.types'
import { WorkflowResult } from '../triggerView/types'

export enum STAGE_NAME {
    LOADING = 'LOADING',
    APP = 'APP',
    GIT_MATERIAL = 'MATERIAL',
    CI_CONFIG = 'TEMPLATE',
    CI_PIPELINE = 'CI_PIPELINE',
    DEPLOYMENT_TEMPLATE = 'CHART',
    CD_PIPELINE = 'CD_PIPELINE',
    CHART_ENV_CONFIG = 'CHART_ENV_CONFIG',
}

export type StageNames = keyof typeof STAGE_NAME | 'WORKFLOW' | 'CONFIGMAP' | 'SECRETS' | 'ENV_OVERRIDE'

export interface AppConfigProps {
    appName: string
    isJobView?: boolean
}
export interface AppConfigState {
    view: string
    stattusCode: number
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
}

export interface AppStageUnlockedType {
    material: boolean
    dockerBuildConfig: boolean
    deploymentTemplate: boolean
    workflowEditor: boolean
    configmap: boolean
    secret: boolean
    envOverride: boolean
}

export interface CustomNavItemsType {
    title: string
    href: string
    stage: string
    isLocked: boolean
    supportDocumentURL: string
    flowCompletionPercent: number
    currentStep: number
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
}

export interface AppComposeRouterProps {
    appId: string
    isUnlocked: AppStageUnlockedType
    navItems: CustomNavItemsType[]
    respondOnSuccess: () => void
    isCiPipeline: boolean
    getWorkflows: () => void
    maxAllowedUrl: string
    isCDPipeline: boolean
    environments: AppEnvironment[]
    setEnvironments: React.Dispatch<React.SetStateAction<AppEnvironment[]>>
    workflowsRes: WorkflowResult
    userRole: UserRoleType
    canShowExternalLinks: boolean
    toggleRepoSelectionTippy: () => void
    setRepoState: React.Dispatch<React.SetStateAction<string>>
    isJobView: boolean
    envList?: any[]
    isBaseConfigProtected?: boolean
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
}

export interface NextButtonProps {
    isCiPipeline: boolean
    navItems: CustomNavItemsType[]
    currentStageName: STAGE_NAME
    isDisabled: boolean
}
