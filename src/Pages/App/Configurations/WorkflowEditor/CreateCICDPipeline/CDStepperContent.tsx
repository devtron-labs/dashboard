import {
    ButtonVariantType,
    ComponentSizeType,
    DeploymentAppTypes,
    Icon,
    InfoBlock,
} from '@devtron-labs/devtron-fe-common-lib'

import { DeploymentAppRadioGroup } from '@Components/v2/values/chartValuesDiff/ChartValuesView.component'

import { SourceMaterialsSelector } from '../SourceMaterialsSelector'
import { CDStepperContentProps } from './types'

// TODO: Integrate this
export const CDStepperContent = ({ isCreatingWorkflow, cdNodeCreateError, onRetry }: CDStepperContentProps) => {
    // CONSTANTS
    const isFormDisabled = isCreatingWorkflow

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
                        name: 'create-ci-cd-pipeline-modal-namespace',
                        onChange: () => {},
                        placeholder: 'Will be auto-populated based on environment',
                        label: 'Namespace',
                        value: 'dev-ns',
                        disabled: true,
                    }}
                    sourceTypePickerProps={{
                        inputId: 'create-ci-cd-pipeline-modal-select-environment',
                        label: 'Environment',
                        placeholder: 'Select environment',
                        isDisabled: isFormDisabled,
                    }}
                />
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label className="form__label form__label--sentence">How do you want to deploy?</label>
                <DeploymentAppRadioGroup
                    isDisabled={false}
                    deploymentAppType={DeploymentAppTypes.HELM}
                    handleOnChange={() => {}}
                    allowedDeploymentTypes={[]}
                    rootClassName="ci-cd-pipeline__deployment-app-radio-group"
                    isFromCDPipeline
                    // isGitOpsRepoNotConfigured={isGitOpsRepoNotConfigured}
                    // gitOpsRepoConfigInfoBar={gitOpsRepoConfigInfoBar}
                    // areGitopsCredentialsConfigured={!isGitOpsInstalledButNotConfigured}
                />
            </div>
        </div>
    )
}
