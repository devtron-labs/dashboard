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

import {
    ResourceKindType,
    CollapsibleListItem,
    AppEnvDeploymentConfigType,
    EnvResourceType,
    AppEnvironment,
    ResourceIdToResourceApprovalPolicyConfigMapType,
} from '@devtron-labs/devtron-fe-common-lib'

import { ViewType } from '@Config/constants'
import { WorkflowResult } from '@Components/app/details/triggerView/types'
import { UserRoleType } from '@Pages/GlobalConfigurations/Authorization/constants'

import { ResourceConfig, ResourceConfigState } from '../../service.types'

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
    WORKFLOW = 'WORKFLOW',
    CONFIGMAP = 'CONFIGMAP',
    SECRETS = 'SECRETS',
    ENV_OVERRIDE = 'ENV_OVERRIDE',
    EXTERNAL_LINKS = 'EXTERNAL_LINKS',
    REDIRECT_ITEM = 'REDIRECT_ITEM',
}

export type StageNames = keyof typeof STAGE_NAME | 'WORKFLOW' | 'CONFIGMAP' | 'SECRETS' | 'ENV_OVERRIDE'

export enum DEVTRON_APPS_STEPS {
    GITOPS_CONFIG = 5,
    NO_GITOS_CONFIG = 4,
}

export enum DEFAULT_LANDING_STAGE {
    JOB_VIEW = 2,
    DEVTRON_APPS = 6,
}

export interface AppConfigProps {
    appName: string
    resourceKind: Extract<ResourceKindType, ResourceKindType.devtronApplication | ResourceKindType.job>
    filteredEnvIds?: string
}

export interface AppConfigState {
    /** The current view type of the application. */
    view: ViewType
    /** The status code. */
    statusCode: number
    /** The name of the current stage. */
    stageName: STAGE_NAME
    /** Boolean indicating if the current stage is unlocked, determined by `isUnlocked(stageName)`. */
    isUnlocked: AppStageUnlockedType
    /** The name of the application. */
    appName: string
    /** Boolean indicating if the application has a CI pipeline. */
    isCiPipeline: boolean
    /** Boolean indicating if the application has a CD pipeline */
    isCDPipeline: boolean
    /** Boolean indicating if the delete confirmation will be shown. */
    showDeleteConfirm: boolean
    /** Array of navigation items. */
    navItems: CustomNavItemsType[]
    /** Redirection URL. */
    redirectionUrl: string
    /** Boolean indicating if the application can be deleted. */
    canDeleteApp: boolean
    /** The workflow response. */
    workflowsRes?: WorkflowResult
    /** Array containing environments data. */
    environmentList?: AppEnvironment[]
    envIdToEnvApprovalConfigurationMap: ResourceIdToResourceApprovalPolicyConfigMapType
    /** The environment config containing the loading state, configState and title of deployment template, configmaps & secrets. */
    envConfig: EnvConfigurationState
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
    href?: string
    stage?: string
    isLocked?: boolean
    supportDocumentURL?: string
    flowCompletionPercent?: number
    currentStep?: number
    required?: boolean
    isProtectionAllowed?: boolean
    altNavKey?: string
}

export interface JobEnvOverrideRouteProps {
    envOverride: AppEnvironment
    // TODO: add proper types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ciPipelines?: any[]
    reload?: () => void
    isEnvProtected?: boolean
}

export interface NextButtonProps {
    isCiPipeline: boolean
    navItems: CustomNavItemsType[]
    currentStageName: STAGE_NAME
    isDisabled: boolean
}

interface CommonAppConfigurationProps {
    appId: string
    resourceKind: Extract<ResourceKindType, ResourceKindType.devtronApplication | ResourceKindType.job>
    respondOnSuccess: () => void
    getWorkflows: () => void
    userRole: UserRoleType
    canShowExternalLinks: boolean
    toggleRepoSelectionTippy: () => void
    reloadEnvironments: () => void
    filteredEnvIds: string
    isGitOpsConfigurationRequired: boolean
    reloadAppConfig: () => void
    deleteApp: () => void
    showCannotDeleteTooltip: boolean
    hideConfigHelp: boolean
    fetchEnvConfig: (envId: number) => void
}

export interface AppConfigurationContextType
    extends CommonAppConfigurationProps,
        Pick<AppConfigState, 'envIdToEnvApprovalConfigurationMap'> {
    isUnlocked: AppStageUnlockedType
    navItems: CustomNavItemsType[]
    isCiPipeline: boolean
    isCDPipeline: boolean
    environments: AppConfigState['environmentList']
    workflowsRes: WorkflowResult
    setRepoState: React.Dispatch<React.SetStateAction<string>>
    isJobView: boolean
    envIdToEnvApprovalConfigurationMap: ResourceIdToResourceApprovalPolicyConfigMapType
    lastUnlockedStage: string
    isWorkflowEditorUnlocked: boolean
    getRepo: string
    envConfig: EnvConfigurationState
}

export interface AppConfigurationProviderProps extends CommonAppConfigurationProps {
    children: JSX.Element
    state: AppConfigState
    resourceKind: Extract<ResourceKindType, ResourceKindType.devtronApplication | ResourceKindType.job>
}

export interface EnvConfigType {
    deploymentTemplate: ResourceConfig | null
    configmaps: ResourceConfig[]
    secrets: ResourceConfig[]
}

export interface EnvConfigurationState {
    /** Indicates if the environment configuration is currently loading. */
    isLoading: boolean
    /** Environment Configuration containing Deployment Template, Config Maps & Secrets */
    config: EnvConfigType
}

export enum EnvConfigObjectKey {
    ConfigMap = 'configmaps',
    Secret = 'secrets',
    DeploymentTemplate = 'deploymentTemplate',
}

export interface EnvironmentOptionType {
    name: string
    id: number
}

export interface EnvConfigurationsNavProps extends Pick<AppConfigState, 'envIdToEnvApprovalConfigurationMap'> {
    envConfig: EnvConfigurationState
    fetchEnvConfig: (envId: number) => void
    environments: EnvironmentOptionType[]
    paramToCheck?: 'appId' | 'envId'
    goBackURL: string
    /**
     * The base URL to be appended before the Compare View route.
     * Compare View route structure: `compareWithURL/URLS.APP_ENV_CONFIG_COMPARE/:compareTo?/:resourceType/:resourceName?`
     *
     * @note This can represent either a route path or a complete link(route params resolved).
     */
    compareWithURL: string
    showComparison?: boolean
    showBaseConfigurations?: boolean
    showDeploymentTemplate?: boolean
    isCMSecretLocked?: boolean
    hideEnvSelector?: boolean
}

export interface EnvConfigRouteParams {
    appId: string
    envId: string
    resourceType: string
}

export interface ExtendedCollapsibleListItem
    extends Pick<CollapsibleListItem<'navLink'>, 'title' | 'subtitle' | 'href' | 'iconConfig'> {
    configState: ResourceConfigState
}

// DEPLOYMENT CONFIG COMPARE INTERFACES & TYPES ------- START
export interface DeploymentConfigParams {
    appId: string
    envId: string
    compareTo: string
    resourceType: string
    resourceName: string
}

export type DeploymentConfigCompareProps = {
    appOrEnvIdToResourceApprovalConfigurationMap: AppConfigState['envIdToEnvApprovalConfigurationMap']
    environments: EnvironmentOptionType[]
    goBackURL?: string
    getNavItemHref: (resourceType: EnvResourceType, resourceName: string) => string
    overwriteNavHeading?: string
} & (
    | {
          type: 'appGroup'
          envName: string
          appName?: never
      }
    | {
          type: 'app'
          appName: string
          envName?: never
      }
)

export enum AppEnvDeploymentConfigQueryParams {
    CONFIG_TYPE = 'configType',
    COMPARE_WITH = 'compareWith',
    COMPARE_WITH_CONFIG_TYPE = 'compareWithConfigType',
    IDENTIFIER_ID = 'identifierId',
    PIPELINE_ID = 'pipelineId',
    COMPARE_WITH_IDENTIFIER_ID = 'compareWithIdentifierId',
    COMPARE_WITH_PIPELINE_ID = 'compareWithPipelineId',
    CHART_REF_ID = 'chartRefId',
    MANIFEST_CHART_REF_ID = 'manifestChartRefId',
    COMPARE_WITH_MANIFEST_CHART_REF_ID = 'compareWithManifestChartRefId',
}

export interface AppEnvDeploymentConfigQueryParamsType {
    configType: AppEnvDeploymentConfigType
    compareWith: string
    compareWithConfigType: AppEnvDeploymentConfigType
    identifierId?: number
    pipelineId?: number
    compareWithIdentifierId?: number
    compareWithPipelineId?: number
    chartRefId?: number
    manifestChartRefId?: number
    compareWithManifestChartRefId?: number
}

export type GetAppEnvDeploymentConfigProps = Required<
    Pick<DeploymentConfigCompareProps, 'appName' | 'envName' | 'type'> & {
        configType: AppEnvDeploymentConfigType
        compareName: string
        identifierId: number
        pipelineId: number
    }
>

export type GetDeploymentTemplateDataProps = Omit<GetAppEnvDeploymentConfigProps, 'identifierId' | 'pipelineId'>

export type GetManifestDataProps = Pick<DeploymentConfigCompareProps, 'type' | 'environments'> & {
    appId: string
    envId: string
    configType: AppEnvDeploymentConfigType
    compareName: string
    values: string
    identifierId: number
    pipelineId: number
    manifestChartRefId: number
}
// DEPLOYMENT CONFIG COMPARE INTERFACES & TYPES ------- END
