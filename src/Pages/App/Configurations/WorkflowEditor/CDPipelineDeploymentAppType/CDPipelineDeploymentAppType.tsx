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
