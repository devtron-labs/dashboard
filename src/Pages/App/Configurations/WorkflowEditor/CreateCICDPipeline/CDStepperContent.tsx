import { ChangeEvent, useState } from 'react'
import { useHistory } from 'react-router-dom'

import {
    API_STATUS_CODES,
    ButtonVariantType,
    ComponentSizeType,
    DeploymentAppTypes,
    Icon,
    InfoBlock,
    noop,
    showError,
} from '@devtron-labs/devtron-fe-common-lib'

import { GeneratedHelmPush } from '@Components/cdPipeline/cdPipeline.types'
import { ValidationRules } from '@Components/ciPipeline/validationRules'
import { EnvironmentWithSelectPickerType } from '@Components/CIPipelineN/types'
import { GITOPS_REPO_REQUIRED } from '@Components/v2/values/chartValuesDiff/constant'
import { ENV_ALREADY_EXIST_ERROR } from '@Config/constants'
import { URLS } from '@Config/routes'
import { getGitOpsRepoConfig } from '@Services/service'

import { CDPipelineDeploymentAppType } from '../CDPipelineDeploymentAppType'
import { SourceMaterialsSelector } from '../SourceMaterialsSelector'
import { CDStepperContentProps } from './types'
import { getEnvironmentOptions } from './utils'

const validationRules = new ValidationRules()

export const CDStepperContent = ({
    appId,
    isCreatingWorkflow,
    cdNodeCreateError,
    onRetry,
    ciCdPipeline,
    ciCdPipelineFormError,
    noGitOpsModuleInstalledAndConfigured,
    isGitOpsInstalledButNotConfigured,
    isGitOpsRepoNotConfigured,
    envIds,
    setCiCdPipeline,
    setCiCdPipelineFormError,
    setReloadNoGitOpsRepoConfiguredModal,
}: CDStepperContentProps) => {
    // STATES
    const [gitopsConflictLoading, setGitopsConflictLoading] = useState(false)

    // HOOKS
    const { push } = useHistory()

    // CONSTANTS
    const { environments, selectedEnvironment, deploymentAppType } = ciCdPipeline.cd
    const isFormDisabled = isCreatingWorkflow
    const isHelmEnforced =
        selectedEnvironment &&
        selectedEnvironment.allowedDeploymentTypes.length === 1 &&
        selectedEnvironment.allowedDeploymentTypes[0] === DeploymentAppTypes.HELM
    const gitOpsRepoNotConfiguredAndOptionsHidden =
        window._env_.HIDE_GITOPS_OR_HELM_OPTION &&
        !noGitOpsModuleInstalledAndConfigured &&
        !isHelmEnforced &&
        isGitOpsRepoNotConfigured

    // HANDLERS
    const handleEnvironmentChange = (selection: EnvironmentWithSelectPickerType) => {
        const { ci, cd } = structuredClone(ciCdPipeline)
        cd.selectedEnvironment = selection
        cd.generatedHelmPushAction = selection.isVirtualEnvironment
            ? GeneratedHelmPush.DO_NOT_PUSH
            : GeneratedHelmPush.PUSH

        setCiCdPipeline({ ci, cd })

        const updatedCiCdPipelineFormError = structuredClone(ciCdPipelineFormError)
        updatedCiCdPipelineFormError.cd.environment = envIds.includes(selection.id)
            ? ENV_ALREADY_EXIST_ERROR
            : validationRules.environment(selection.id).message

        setCiCdPipelineFormError(updatedCiCdPipelineFormError)
    }

    const handleDeploymentAppTypeChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { ci, cd } = structuredClone(ciCdPipeline)
        cd.deploymentAppType = event.target.value
        setCiCdPipeline({ ci, cd })
    }

    const checkGitOpsRepoConflict = async () => {
        setGitopsConflictLoading(true)

        try {
            await getGitOpsRepoConfig(+appId)

            setGitopsConflictLoading(false)
            push(`/app/${appId}/edit/${URLS.APP_GITOPS_CONFIG}`)
        } catch (err) {
            setGitopsConflictLoading(false)
            if (err.code === API_STATUS_CODES.CONFLICT) {
                setReloadNoGitOpsRepoConfiguredModal(true)
            } else {
                showError(err)
            }
        }
    }

    // RENDERERS
    const gitOpsRepoConfigInfoBar = (content: string) => (
        <InfoBlock
            description={content}
            variant="warning"
            buttonProps={{
                dataTestId: 'configure-gitops-repo-button',
                variant: ButtonVariantType.text,
                text: 'Configure',
                endIcon: <Icon name="ic-arrow-right" color={null} />,
                onClick: checkGitOpsRepoConflict,
                isLoading: gitopsConflictLoading,
            }}
        />
    )

    return (
        <div className="flexbox-col dc__gap-20">
            {!!cdNodeCreateError && (
                <InfoBlock
                    variant="error"
                    heading="Failed to create deployment pipeline"
                    description={cdNodeCreateError.errors?.[0]?.userMessage ?? 'failed'}
                    size={ComponentSizeType.medium}
                    buttonProps={{
                        dataTestId: 'retry-cd-node-creation',
                        startIcon: <Icon name="ic-arrow-clockwise" color={null} />,
                        variant: ButtonVariantType.text,
                        text: 'Retry',
                        onClick: onRetry,
                    }}
                />
            )}
            <div>
                <SourceMaterialsSelector
                    branchInputProps={{
                        name: 'cd-pipeline-namespace',
                        onChange: noop,
                        placeholder:
                            selectedEnvironment?.isVirtualEnvironment && !selectedEnvironment?.namespace
                                ? 'Not available'
                                : 'Will be auto-populated based on environment',
                        label: 'Namespace',
                        value: selectedEnvironment?.namespace,
                        disabled: true,
                    }}
                    sourceTypePickerProps={{
                        inputId: 'cd-pipeline-environment',
                        classNamePrefix: 'cd-pipeline-environment',
                        label: 'Environment',
                        placeholder: 'Select environment',
                        isDisabled: isFormDisabled,
                        menuPosition: 'fixed',
                        options: getEnvironmentOptions(environments),
                        value: selectedEnvironment,
                        getOptionValue: (option) => option.value as string,
                        helperText: selectedEnvironment?.isVirtualEnvironment ? 'Isolated environment' : null,
                        error: ciCdPipelineFormError.cd.environment ?? null,
                        onChange: handleEnvironmentChange,
                    }}
                />
                <div className="mt-16">
                    {gitOpsRepoNotConfiguredAndOptionsHidden && gitOpsRepoConfigInfoBar(GITOPS_REPO_REQUIRED)}
                </div>
                <CDPipelineDeploymentAppType
                    isVirtualEnvironment={selectedEnvironment?.isVirtualEnvironment}
                    isGitOpsInstalledButNotConfigured={isGitOpsInstalledButNotConfigured}
                    noGitOpsModuleInstalledAndConfigured={noGitOpsModuleInstalledAndConfigured}
                    deploymentAppType={deploymentAppType ?? DeploymentAppTypes.HELM}
                    handleChange={handleDeploymentAppTypeChange}
                    allowedDeploymentTypes={selectedEnvironment?.allowedDeploymentTypes}
                    rootClassName="chartrepo-type__radio-group"
                    isDisabled={isFormDisabled}
                    isGitOpsRepoNotConfigured={isGitOpsRepoNotConfigured}
                    gitOpsRepoConfigInfoBar={gitOpsRepoConfigInfoBar}
                    areGitopsCredentialsConfigured={!isGitOpsInstalledButNotConfigured}
                />
            </div>
        </div>
    )
}
