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

import { URLS, DOCUMENTATION } from '../../../../config'
import { AppStageUnlockedType, STAGE_NAME } from './appConfig.type'

// stage: last configured stage
const isCommonUnlocked = (stage, isGitOpsConfigurationRequired) =>
    stage === STAGE_NAME.CI_PIPELINE ||
    (isGitOpsConfigurationRequired ? stage === STAGE_NAME.GITOPS_CONFIG : stage === STAGE_NAME.DEPLOYMENT_TEMPLATE) ||
    stage === STAGE_NAME.CD_PIPELINE ||
    stage === STAGE_NAME.CHART_ENV_CONFIG

export const isUnlocked = (stage: string, isGitOpsConfigurationRequired?: boolean): AppStageUnlockedType => {
    return {
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
    }
}

export const getCompletedStep = (
    isUnlocked: AppStageUnlockedType,
    isJobView: boolean,
    isGitOpsConfigurationRequired: boolean,
): number => {
    if (isJobView) {
        if (isUnlocked.workflowEditor) {
            return 1
        }
    } else {
        if (isUnlocked.workflowEditor) {
            return isGitOpsConfigurationRequired ? 4 : 3
        }
        if (isUnlocked.gitOpsConfig) {
            return 3
        }
        if (isUnlocked.deploymentTemplate) {
            return 2
        }
        if (isUnlocked.dockerBuildConfig) {
            return 1
        }
    }

    return 0
}

export const getNavItems = (
    isUnlocked: AppStageUnlockedType,
    appId: string,
    isJobView: boolean,
    configStatus,
): { navItems } => {
    const isGitOpsConfigurationRequired = configStatus.find(
        (item) => item.stageName === STAGE_NAME.GITOPS_CONFIG,
    )?.required
    const completedSteps = getCompletedStep(isUnlocked, isJobView, isGitOpsConfigurationRequired)
    let navItems = []
    if (isJobView) {
        const completedPercent = completedSteps * 50

        navItems = [
            {
                title: 'Source code',
                href: `/job/${appId}/edit/materials`,
                stage: STAGE_NAME.GIT_MATERIAL,
                isLocked: !isUnlocked.material,
                supportDocumentURL: DOCUMENTATION.JOB_SOURCE_CODE,
                flowCompletionPercent: completedPercent,
                currentStep: completedSteps,
                required: true,
            },
            {
                title: 'Workflow Editor',
                href: `/job/${appId}/edit/workflow`,
                stage: 'WORKFLOW',
                isLocked: !isUnlocked.workflowEditor,
                supportDocumentURL: DOCUMENTATION.JOB_WORKFLOW_EDITOR,
                flowCompletionPercent: completedPercent,
                currentStep: completedSteps,
                required: true,
            },
            {
                title: 'ConfigMaps',
                href: `/job/${appId}/edit/configmap`,
                stage: 'CONFIGMAP',
                isLocked: !isUnlocked.configmap,
                supportDocumentURL: DOCUMENTATION.APP_CREATE_CONFIG_MAP,
                flowCompletionPercent: completedPercent,
                currentStep: completedSteps,
                isProtectionAllowed: true,
                required: true,
            },
            {
                title: 'Secrets',
                href: `/job/${appId}/edit/secrets`,
                stage: 'SECRETS',
                isLocked: !isUnlocked.secret,
                supportDocumentURL: DOCUMENTATION.APP_CREATE_SECRET,
                flowCompletionPercent: completedPercent,
                currentStep: completedSteps,
                isProtectionAllowed: true,
                required: true,
            },
            {
                title: 'Environment Override',
                href: `/job/${appId}/edit/env-override`,
                stage: 'ENV_OVERRIDE',
                isLocked: !isUnlocked.envOverride,
            },
        ]
    } else {
        const completedPercent = completedSteps * (isGitOpsConfigurationRequired ? 20 : 25)
        navItems = [
            {
                title: 'Git Repository',
                href: `/app/${appId}/edit/materials`,
                stage: STAGE_NAME.GIT_MATERIAL,
                isLocked: !isUnlocked.material,
                supportDocumentURL: DOCUMENTATION.APP_CREATE_MATERIAL,
                flowCompletionPercent: completedPercent,
                currentStep: completedSteps,
                required: true,
            },
            {
                title: 'Build Configuration',
                href: `/app/${appId}/edit/docker-build-config`,
                stage: STAGE_NAME.CI_CONFIG,
                isLocked: !isUnlocked.dockerBuildConfig,
                supportDocumentURL: DOCUMENTATION.APP_CREATE_CI_CONFIG,
                flowCompletionPercent: completedPercent,
                currentStep: completedSteps,
                required: true,
            },
            {
                title: 'Base Deployment Template',
                href: `/app/${appId}/edit/deployment-template`,
                stage: STAGE_NAME.DEPLOYMENT_TEMPLATE,
                isLocked: !isUnlocked.deploymentTemplate,
                supportDocumentURL: DOCUMENTATION.APP_DEPLOYMENT_TEMPLATE,
                flowCompletionPercent: completedPercent,
                currentStep: completedSteps,
                isProtectionAllowed: true,
                required: true,
            },
            {
                title: 'GitOps Configuration',
                href: `/app/${appId}/edit/gitops-config`,
                stage: STAGE_NAME.GITOPS_CONFIG,
                isLocked: !isUnlocked.gitOpsConfig,
                flowCompletionPercent: completedPercent,
                currentStep: completedSteps,
                required: isGitOpsConfigurationRequired,
            },
            {
                title: 'Workflow Editor',
                href: `/app/${appId}/edit/workflow`,
                stage: 'WORKFLOW',
                isLocked: !isUnlocked.workflowEditor,
                supportDocumentURL: DOCUMENTATION.APP_CREATE_WORKFLOW,
                flowCompletionPercent: completedPercent,
                currentStep: completedSteps,
                required: true,
            },
            {
                title: 'ConfigMaps',
                href: `/app/${appId}/edit/configmap`,
                stage: 'CONFIGMAP',
                isLocked: !isUnlocked.configmap,
                supportDocumentURL: DOCUMENTATION.APP_CREATE_CONFIG_MAP,
                flowCompletionPercent: completedPercent,
                currentStep: completedSteps,
                isProtectionAllowed: true,
                required: true,
            },
            {
                title: 'Secrets',
                href: `/app/${appId}/edit/secrets`,
                stage: 'SECRETS',
                isLocked: !isUnlocked.secret,
                supportDocumentURL: DOCUMENTATION.APP_CREATE_SECRET,
                flowCompletionPercent: completedPercent,
                currentStep: completedSteps,
                isProtectionAllowed: true,
                required: true,
            },
            {
                title: 'External Links',
                href: `/app/${appId}/edit/external-links`,
                stage: 'EXTERNAL_LINKS',
                isLocked: false,
                supportDocumentURL: DOCUMENTATION.EXTERNAL_LINKS,
                flowCompletionPercent: completedPercent,
                currentStep: completedSteps,
            },
            {
                title: 'Protect Configuration',
                href: `/app/${appId}/edit/${URLS.APP_CONFIG_PROTECTION}`,
                stage: 'PROTECT_CONFIGURATION',
                isLocked: false,
            },
            {
                title: 'Environment Override',
                href: `/app/${appId}/edit/env-override`,
                stage: 'ENV_OVERRIDE',
                isLocked: !isUnlocked.envOverride,
            },
        ]
    }

    return { navItems }
}
