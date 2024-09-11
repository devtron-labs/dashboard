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

import { ResourceKindType, stringComparatorBySortOrder, ConfigResourceType } from '@devtron-labs/devtron-fe-common-lib'

import { URLS, DOCUMENTATION } from '@Config/index'

import { AppConfigStatusItemType, EnvConfigDTO } from '../../service.types'
import { AppStageUnlockedType, CustomNavItemsType, EnvConfigType, STAGE_NAME } from './AppConfig.types'

// stage: last configured stage
const isCommonUnlocked = (stage, isGitOpsConfigurationRequired) =>
    stage === STAGE_NAME.CI_PIPELINE ||
    (isGitOpsConfigurationRequired ? stage === STAGE_NAME.GITOPS_CONFIG : stage === STAGE_NAME.DEPLOYMENT_TEMPLATE) ||
    stage === STAGE_NAME.CD_PIPELINE ||
    stage === STAGE_NAME.CHART_ENV_CONFIG

export const isUnlocked = (stage: string, isGitOpsConfigurationRequired?: boolean): AppStageUnlockedType => ({
    material:
        stage === STAGE_NAME.APP ||
        stage === STAGE_NAME.GIT_MATERIAL ||
        stage === STAGE_NAME.CI_CONFIG ||
        stage === STAGE_NAME.CI_PIPELINE ||
        stage === STAGE_NAME.DEPLOYMENT_TEMPLATE ||
        stage === STAGE_NAME.GITOPS_CONFIG ||
        stage === STAGE_NAME.CD_PIPELINE ||
        stage === STAGE_NAME.CHART_ENV_CONFIG,
    dockerBuildConfig:
        stage === STAGE_NAME.GIT_MATERIAL ||
        stage === STAGE_NAME.CI_CONFIG ||
        stage === STAGE_NAME.CI_PIPELINE ||
        stage === STAGE_NAME.DEPLOYMENT_TEMPLATE ||
        stage === STAGE_NAME.GITOPS_CONFIG ||
        stage === STAGE_NAME.CD_PIPELINE ||
        stage === STAGE_NAME.CHART_ENV_CONFIG,
    deploymentTemplate:
        stage === STAGE_NAME.CI_CONFIG ||
        stage === STAGE_NAME.CI_PIPELINE ||
        stage === STAGE_NAME.DEPLOYMENT_TEMPLATE ||
        stage === STAGE_NAME.GITOPS_CONFIG ||
        stage === STAGE_NAME.CD_PIPELINE ||
        stage === STAGE_NAME.CHART_ENV_CONFIG,
    gitOpsConfig:
        stage === STAGE_NAME.CI_PIPELINE ||
        stage === STAGE_NAME.DEPLOYMENT_TEMPLATE ||
        stage === STAGE_NAME.GITOPS_CONFIG ||
        stage === STAGE_NAME.CD_PIPELINE ||
        stage === STAGE_NAME.CHART_ENV_CONFIG,
    workflowEditor: isCommonUnlocked(stage, isGitOpsConfigurationRequired),
    configmap: isCommonUnlocked(stage, isGitOpsConfigurationRequired),
    secret: isCommonUnlocked(stage, isGitOpsConfigurationRequired),
    envOverride: isCommonUnlocked(stage, isGitOpsConfigurationRequired),
})

export const getCompletedStep = (
    _isUnlocked: AppStageUnlockedType,
    isJobView: boolean,
    isGitOpsConfigurationRequired: boolean,
): number => {
    if (isJobView) {
        if (_isUnlocked.workflowEditor) {
            return 1
        }
    } else {
        if (_isUnlocked.workflowEditor) {
            return isGitOpsConfigurationRequired ? 4 : 3
        }
        if (_isUnlocked.gitOpsConfig) {
            return 3
        }
        if (_isUnlocked.deploymentTemplate) {
            return 2
        }
        if (_isUnlocked.dockerBuildConfig) {
            return 1
        }
    }

    return 0
}

export const getNavItems = (
    _isUnlocked: AppStageUnlockedType,
    appId: string,
    resourceKind: ResourceKindType,
    isGitOpsConfigurationRequired: boolean,
): { navItems: CustomNavItemsType[] } => {
    const completedSteps = getCompletedStep(
        _isUnlocked,
        resourceKind === ResourceKindType.job,
        isGitOpsConfigurationRequired,
    )

    let completedPercent = 0

    switch (resourceKind) {
        case ResourceKindType.job:
            completedPercent = completedSteps * 50

            return {
                navItems: [
                    {
                        title: 'Source code',
                        href: `/job/${appId}/edit/materials`,
                        stage: STAGE_NAME.GIT_MATERIAL,
                        isLocked: !_isUnlocked.material,
                        supportDocumentURL: DOCUMENTATION.JOB_SOURCE_CODE,
                        flowCompletionPercent: completedPercent,
                        currentStep: completedSteps,
                        required: true,
                    },
                    {
                        title: 'Workflow Editor',
                        href: `/job/${appId}/edit/workflow`,
                        stage: STAGE_NAME.WORKFLOW,
                        isLocked: !_isUnlocked.workflowEditor,
                        supportDocumentURL: DOCUMENTATION.JOB_WORKFLOW_EDITOR,
                        flowCompletionPercent: completedPercent,
                        currentStep: completedSteps,
                        required: true,
                    },
                    {
                        title: 'ConfigMaps & Secrets',
                        href: `/job/${appId}/edit/configmap`,
                        stage: STAGE_NAME.REDIRECT_ITEM,
                        isLocked: !_isUnlocked.configmap,
                        isProtectionAllowed: true,
                        required: true,
                    },
                    {
                        title: 'ConfigMaps',
                        href: `/job/${appId}/edit/configmap`,
                        stage: STAGE_NAME.CONFIGMAP,
                        isLocked: !_isUnlocked.configmap,
                        supportDocumentURL: DOCUMENTATION.APP_CREATE_CONFIG_MAP,
                        flowCompletionPercent: completedPercent,
                        currentStep: completedSteps,
                        isProtectionAllowed: true,
                        required: true,
                        altNavKey: 'env-configurations',
                    },
                    {
                        title: 'Secrets',
                        href: `/job/${appId}/edit/secrets`,
                        stage: STAGE_NAME.SECRETS,
                        isLocked: !_isUnlocked.secret,
                        supportDocumentURL: DOCUMENTATION.APP_CREATE_SECRET,
                        flowCompletionPercent: completedPercent,
                        currentStep: completedSteps,
                        isProtectionAllowed: true,
                        required: true,
                        altNavKey: 'env-configurations',
                    },
                    {
                        title: 'Environment Override',
                        href: `/job/${appId}/edit/env-override`,
                        stage: STAGE_NAME.ENV_OVERRIDE,
                        isLocked: !_isUnlocked.envOverride,
                    },
                ],
            }

        default:
            completedPercent = completedSteps * (isGitOpsConfigurationRequired ? 20 : 25)

            return {
                navItems: [
                    {
                        title: 'Git Repository',
                        href: `/app/${appId}/edit/materials`,
                        stage: STAGE_NAME.GIT_MATERIAL,
                        isLocked: !_isUnlocked.material,
                        supportDocumentURL: DOCUMENTATION.APP_CREATE_MATERIAL,
                        flowCompletionPercent: completedPercent,
                        currentStep: completedSteps,
                        required: true,
                    },
                    {
                        title: 'Build Configuration',
                        href: `/app/${appId}/edit/docker-build-config`,
                        stage: STAGE_NAME.CI_CONFIG,
                        isLocked: !_isUnlocked.dockerBuildConfig,
                        supportDocumentURL: DOCUMENTATION.APP_CREATE_CI_CONFIG,
                        flowCompletionPercent: completedPercent,
                        currentStep: completedSteps,
                        required: true,
                    },
                    {
                        title: 'Base Configurations',
                        href: `/app/${appId}/edit/deployment-template`,
                        stage: STAGE_NAME.REDIRECT_ITEM,
                        isLocked: !_isUnlocked.deploymentTemplate,
                        isProtectionAllowed: true,
                        required: true,
                    },
                    {
                        title: 'Deployment Template',
                        href: `/app/${appId}/edit/deployment-template`,
                        stage: STAGE_NAME.DEPLOYMENT_TEMPLATE,
                        isLocked: !_isUnlocked.deploymentTemplate,
                        supportDocumentURL: DOCUMENTATION.APP_DEPLOYMENT_TEMPLATE,
                        flowCompletionPercent: completedPercent,
                        currentStep: completedSteps,
                        isProtectionAllowed: true,
                        required: true,
                        altNavKey: 'env-configurations',
                    },
                    {
                        title: 'GitOps Configuration',
                        href: `/app/${appId}/edit/gitops-config`,
                        stage: STAGE_NAME.GITOPS_CONFIG,
                        isLocked: !_isUnlocked.gitOpsConfig,
                        flowCompletionPercent: completedPercent,
                        currentStep: completedSteps,
                        required: isGitOpsConfigurationRequired,
                    },
                    {
                        title: 'Workflow Editor',
                        href: `/app/${appId}/edit/workflow`,
                        stage: STAGE_NAME.WORKFLOW,
                        isLocked: !_isUnlocked.workflowEditor,
                        supportDocumentURL: DOCUMENTATION.APP_CREATE_WORKFLOW,
                        flowCompletionPercent: completedPercent,
                        currentStep: completedSteps,
                        required: true,
                    },
                    {
                        title: 'ConfigMaps',
                        href: `/app/${appId}/edit/configmap`,
                        stage: STAGE_NAME.CONFIGMAP,
                        isLocked: !_isUnlocked.configmap,
                        supportDocumentURL: DOCUMENTATION.APP_CREATE_CONFIG_MAP,
                        flowCompletionPercent: completedPercent,
                        currentStep: completedSteps,
                        isProtectionAllowed: true,
                        required: true,
                        altNavKey: 'env-configurations',
                    },
                    {
                        title: 'Secrets',
                        href: `/app/${appId}/edit/secrets`,
                        stage: STAGE_NAME.SECRETS,
                        isLocked: !_isUnlocked.secret,
                        supportDocumentURL: DOCUMENTATION.APP_CREATE_SECRET,
                        flowCompletionPercent: completedPercent,
                        currentStep: completedSteps,
                        isProtectionAllowed: true,
                        required: true,
                        altNavKey: 'env-configurations',
                    },
                    {
                        title: 'External Links',
                        href: `/app/${appId}/edit/external-links`,
                        stage: STAGE_NAME.EXTERNAL_LINKS,
                        isLocked: false,
                        supportDocumentURL: DOCUMENTATION.EXTERNAL_LINKS,
                        flowCompletionPercent: completedPercent,
                        currentStep: completedSteps,
                    },
                    {
                        title: 'Protect Configuration',
                        href: `/app/${appId}/edit/${URLS.APP_CONFIG_PROTECTION}`,
                        stage: STAGE_NAME.PROTECT_CONFIGURATION,
                        isLocked: false,
                    },
                    {
                        title: 'Environment Override',
                        href: `/app/${appId}/edit/env-override`,
                        stage: STAGE_NAME.ENV_OVERRIDE,
                        isLocked: !_isUnlocked.envOverride,
                    },
                ],
            }
    }
}

export const isCIPipelineCreated = (responseArr: AppConfigStatusItemType[]) => {
    const ciPipeline = responseArr.find((item) => item.stageName === STAGE_NAME.CI_PIPELINE)
    return ciPipeline.status
}

export const isCDPipelineCreated = (responseArr: AppConfigStatusItemType[]) => {
    const cdPipeline = responseArr.find((item) => item.stageName === STAGE_NAME.CD_PIPELINE)
    return cdPipeline.status
}

export const transformEnvConfig = ({ resourceConfig }: EnvConfigDTO) => {
    const updatedEnvConfig = resourceConfig.reduce<EnvConfigType>(
        (acc, curr) => ({
            ...acc,
            deploymentTemplate: curr.type === ConfigResourceType.DeploymentTemplate ? curr : acc.deploymentTemplate,
            configmaps: curr.type === ConfigResourceType.ConfigMap ? [...acc.configmaps, curr] : acc.configmaps,
            secrets: curr.type === ConfigResourceType.Secret ? [...acc.secrets, curr] : acc.secrets,
        }),
        {
            deploymentTemplate: null,
            configmaps: [],
            secrets: [],
        },
    )

    updatedEnvConfig.configmaps.sort((a, b) => stringComparatorBySortOrder(a.name, b.name))
    updatedEnvConfig.secrets.sort((a, b) => stringComparatorBySortOrder(a.name, b.name))

    return updatedEnvConfig
}
