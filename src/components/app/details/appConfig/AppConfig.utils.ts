import { URLS } from '../../../../config'
import { DOCUMENTATION } from '../../../../config'
import { AppStageUnlockedType, STAGE_NAME } from './appConfig.type'

//stage: last configured stage
export const isUnlocked = (stage: string): AppStageUnlockedType => {
    return {
        material:
            stage === STAGE_NAME.APP ||
            stage === STAGE_NAME.GIT_MATERIAL ||
            stage === STAGE_NAME.CI_CONFIG ||
            stage === STAGE_NAME.CI_PIPELINE ||
            stage === STAGE_NAME.DEPLOYMENT_TEMPLATE ||
            stage === STAGE_NAME.CD_PIPELINE ||
            stage === STAGE_NAME.CHART_ENV_CONFIG,
        dockerBuildConfig:
            stage === STAGE_NAME.GIT_MATERIAL ||
            stage === STAGE_NAME.CI_CONFIG ||
            stage === STAGE_NAME.CI_PIPELINE ||
            stage === STAGE_NAME.DEPLOYMENT_TEMPLATE ||
            stage === STAGE_NAME.CD_PIPELINE ||
            stage === STAGE_NAME.CHART_ENV_CONFIG,
        deploymentTemplate:
            stage === STAGE_NAME.CI_CONFIG ||
            stage === STAGE_NAME.CI_PIPELINE ||
            stage === STAGE_NAME.DEPLOYMENT_TEMPLATE ||
            stage === STAGE_NAME.CD_PIPELINE ||
            stage === STAGE_NAME.CHART_ENV_CONFIG,
        workflowEditor:
            stage === STAGE_NAME.CI_PIPELINE ||
            stage === STAGE_NAME.DEPLOYMENT_TEMPLATE ||
            stage === STAGE_NAME.CD_PIPELINE ||
            stage === STAGE_NAME.CHART_ENV_CONFIG,
        configmap:
            stage === STAGE_NAME.CI_PIPELINE ||
            stage === STAGE_NAME.DEPLOYMENT_TEMPLATE ||
            stage === STAGE_NAME.CD_PIPELINE ||
            stage === STAGE_NAME.CHART_ENV_CONFIG,
        secret:
            stage === STAGE_NAME.CI_PIPELINE ||
            stage === STAGE_NAME.DEPLOYMENT_TEMPLATE ||
            stage === STAGE_NAME.CD_PIPELINE ||
            stage === STAGE_NAME.CHART_ENV_CONFIG,
        envOverride:
            stage === STAGE_NAME.CI_PIPELINE ||
            stage === STAGE_NAME.DEPLOYMENT_TEMPLATE ||
            stage === STAGE_NAME.CD_PIPELINE ||
            stage === STAGE_NAME.CHART_ENV_CONFIG,
    }
}

export const getCompletedStep = (isUnlocked: AppStageUnlockedType, isJobView: boolean): number => {
    if (isJobView) {
        if (isUnlocked.workflowEditor) {
            return 1
        }
    } else {
        if (isUnlocked.workflowEditor) {
            return 3
        } else if (isUnlocked.deploymentTemplate) {
            return 2
        } else if (isUnlocked.dockerBuildConfig) {
            return 1
        }
    }

    return 0
}

export const getNavItems = (isUnlocked: AppStageUnlockedType, appId: string, isJobView: boolean): { navItems } => {
    const completedSteps = getCompletedStep(isUnlocked, isJobView)
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
            },
            {
                title: 'Workflow Editor',
                href: `/job/${appId}/edit/workflow`,
                stage: 'WORKFLOW',
                isLocked: !isUnlocked.workflowEditor,
                supportDocumentURL: DOCUMENTATION.JOB_WORKFLOW_EDITOR,
                flowCompletionPercent: completedPercent,
                currentStep: completedSteps,
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
            },
            {
                title: 'Environment Override',
                href: `/job/${appId}/edit/env-override`,
                stage: 'ENV_OVERRIDE',
                isLocked: !isUnlocked.envOverride,
            },
        ]
    } else {
        const completedPercent = completedSteps * 25

        navItems = [
            {
                title: 'Git Repository',
                href: `/app/${appId}/edit/materials`,
                stage: STAGE_NAME.GIT_MATERIAL,
                isLocked: !isUnlocked.material,
                supportDocumentURL: DOCUMENTATION.APP_CREATE_MATERIAL,
                flowCompletionPercent: completedPercent,
                currentStep: completedSteps,
            },
            {
                title: 'Build Configuration',
                href: `/app/${appId}/edit/docker-build-config`,
                stage: STAGE_NAME.CI_CONFIG,
                isLocked: !isUnlocked.dockerBuildConfig,
                supportDocumentURL: DOCUMENTATION.APP_CREATE_CI_CONFIG,
                flowCompletionPercent: completedPercent,
                currentStep: completedSteps,
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
            },
            {
                title: 'Workflow Editor',
                href: `/app/${appId}/edit/workflow`,
                stage: 'WORKFLOW',
                isLocked: !isUnlocked.workflowEditor,
                supportDocumentURL: DOCUMENTATION.APP_CREATE_WORKFLOW,
                flowCompletionPercent: completedPercent,
                currentStep: completedSteps,
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
