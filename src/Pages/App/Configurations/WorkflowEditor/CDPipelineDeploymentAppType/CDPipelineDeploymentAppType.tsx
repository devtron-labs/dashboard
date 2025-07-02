import { DeploymentAppTypes } from '@devtron-labs/devtron-fe-common-lib'

import { DeploymentAppRadioGroup } from '@Components/v2/values/chartValuesDiff/ChartValuesView.component'

import { CDPipelineDeploymentAppTypeProps } from './types'

export const CDPipelineDeploymentAppType = ({
    isVirtualEnvironment,
    allowedDeploymentTypes,
    noGitOpsModuleInstalledAndConfigured,
    isGitOpsInstalledButNotConfigured,
    deploymentAppType,
    rootClassName,
    isDisabled,
    handleChange,
    isGitOpsRepoNotConfigured,
    gitOpsRepoConfigInfoBar,
}: CDPipelineDeploymentAppTypeProps) =>
    !window._env_.HIDE_GITOPS_OR_HELM_OPTION &&
    !isVirtualEnvironment &&
    allowedDeploymentTypes?.length > 0 &&
    // Want to show this when gitops module is installed, does not matter if it is configured or not
    (!noGitOpsModuleInstalledAndConfigured || isGitOpsInstalledButNotConfigured) && (
        <div className="mt-16">
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label className="form__label form__label--sentence">How do you want to deploy?</label>
            <DeploymentAppRadioGroup
                deploymentAppType={deploymentAppType ?? DeploymentAppTypes.HELM}
                handleOnChange={handleChange}
                allowedDeploymentTypes={allowedDeploymentTypes}
                rootClassName={rootClassName}
                isDisabled={isDisabled}
                isFromCDPipeline
                isGitOpsRepoNotConfigured={isGitOpsRepoNotConfigured}
                gitOpsRepoConfigInfoBar={gitOpsRepoConfigInfoBar}
                areGitopsCredentialsConfigured={!isGitOpsInstalledButNotConfigured}
                // Want to show this when gitops module is installed, does not matter if it is configured or not
                showGitOpsOption={!noGitOpsModuleInstalledAndConfigured || isGitOpsInstalledButNotConfigured}
            />
        </div>
    )
