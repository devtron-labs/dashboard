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

import { Dispatch, SetStateAction } from 'react'
import { Link } from 'react-router-dom'

import {
    DeploymentAppTypes,
    MaterialType,
    PipelineFormType,
    SelectPickerProps,
} from '@devtron-labs/devtron-fe-common-lib'

import { URLS } from '@Config/routes'

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
        deploymentAppType === DeploymentAppTypes.ARGO &&
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

export const getCIPipelineBranchSelectorFooterConfig = (
    materials: MaterialType[],
): SelectPickerProps['menuListFooterConfig'] => {
    if (!materials) {
        return null
    }

    const isMultiGit = materials.length > 1
    const type: SelectPickerProps['menuListFooterConfig']['type'] = 'text'

    if (isMultiGit) {
        return {
            type,
            value: (
                <span>
                    If you need webhook based CI for apps with multiple code sources,&nbsp;
                    <a
                        className="anchor"
                        rel="noreferrer"
                        href="https://github.com/devtron-labs/devtron/issues"
                        target="_blank"
                    >
                        Create a GitHub issue
                    </a>
                </span>
            ),
        }
    }

    if (!materials[0].gitHostId) {
        return {
            type,
            value: (
                <span>
                    Select git host for this git account to view all supported options.&nbsp;
                    <Link className="anchor" to={URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS_GIT_ACCOUNTS}>
                        Select git host
                    </Link>
                </span>
            ),
        }
    }

    if (materials[0].gitHostId > 0) {
        return {
            type,
            value: (
                <span>
                    If you want to trigger CI using any other mechanism,&nbsp;
                    <a
                        className="anchor"
                        rel="noreferrer"
                        href="https://github.com/devtron-labs/devtron/issues"
                        target="_blank"
                    >
                        Create a GitHub issue
                    </a>
                </span>
            ),
        }
    }

    return {
        type,
        value: null,
    }
}
