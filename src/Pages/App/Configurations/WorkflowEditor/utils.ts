import { Dispatch, SetStateAction } from 'react'

import { DeploymentAppTypes, MaterialType, PipelineFormType } from '@devtron-labs/devtron-fe-common-lib'

const gitOpsRepoNotConfiguredWithOptionsHidden =
    'Deployment via GitOps requires a repository to save deployment manifests. Please configure and try again.'

const gitOpsRepoNotConfigured =
    'GitOps repository is required to deploy using GitOps. You can deploy using helm or configure GitOps repository and try again.'

export const gitOpsRepoNotConfiguredWithEnforcedEnv = (env: string): string =>
    `Deployment to ‘${env}’ requires a GitOps repository. Please configure and try again.`

export const checkForGitOpsRepoNotConfigured = ({
    allowedDeploymentTypes,
    noGitOpsModuleInstalledAndConfigured,
    isGitOpsRepoNotConfigured,
    deploymentAppType,
    environmentName,
    isTemplateView,
    setGitOpsRepoConfiguredWarning,
}: {
    deploymentAppType: DeploymentAppTypes
    allowedDeploymentTypes: DeploymentAppTypes[]
    noGitOpsModuleInstalledAndConfigured: boolean
    isGitOpsRepoNotConfigured: boolean
    environmentName: string
    isTemplateView: boolean
    setGitOpsRepoConfiguredWarning: Dispatch<SetStateAction<{ show: boolean; text: string }>>
}) => {
    const isHelmEnforced = allowedDeploymentTypes?.length === 1 && allowedDeploymentTypes[0] === DeploymentAppTypes.HELM

    const gitOpsRepoNotConfiguredAndOptionsHidden =
        window._env_.HIDE_GITOPS_OR_HELM_OPTION &&
        !noGitOpsModuleInstalledAndConfigured &&
        !isHelmEnforced &&
        isGitOpsRepoNotConfigured

    if (gitOpsRepoNotConfiguredAndOptionsHidden) {
        setGitOpsRepoConfiguredWarning({ show: true, text: gitOpsRepoNotConfiguredWithOptionsHidden })
    }

    const isGitOpsRepoNotConfiguredAndOptionsVisible =
        deploymentAppType === DeploymentAppTypes.GITOPS &&
        isGitOpsRepoNotConfigured &&
        !window._env_.HIDE_GITOPS_OR_HELM_OPTION

    const isGitOpsRepoNotConfiguredAndGitopsEnforced =
        isGitOpsRepoNotConfiguredAndOptionsVisible && allowedDeploymentTypes?.length === 1

    if (!isTemplateView) {
        if (isGitOpsRepoNotConfiguredAndOptionsVisible) {
            setGitOpsRepoConfiguredWarning({ show: true, text: gitOpsRepoNotConfigured })
        }
        if (isGitOpsRepoNotConfiguredAndGitopsEnforced) {
            setGitOpsRepoConfiguredWarning({
                show: true,
                text: gitOpsRepoNotConfiguredWithEnforcedEnv(environmentName),
            })
        }

        return (
            gitOpsRepoNotConfiguredAndOptionsHidden ||
            isGitOpsRepoNotConfiguredAndGitopsEnforced ||
            isGitOpsRepoNotConfiguredAndOptionsVisible
        )
    }

    return false
}

export const getSelectedWebhookEvent = (material: MaterialType, webhookEvents: PipelineFormType['webhookEvents']) => {
    try {
        const selectedEventId = JSON.parse(material.value)?.eventId
        return selectedEventId ? webhookEvents.find(({ id }) => id === selectedEventId) : null
    } catch {
        return null
    }
}
