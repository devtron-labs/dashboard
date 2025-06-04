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
export const CDStepperContent = (props: CDStepperContentProps) => {
    console.log(props)

    return (
        <div className="flexbox-col dc__gap-20">
            <InfoBlock
                variant="error"
                heading="Failed to create deployment pipeline"
                description="reason from api"
                size={ComponentSizeType.medium}
                buttonProps={{
                    dataTestId: 'retry-cd-node-creation',
                    startIcon: <Icon name="ic-arrow-clockwise" color={null} />,
                    variant: ButtonVariantType.text,
                    text: 'Retry',
                }}
            />
            <div>
                <SourceMaterialsSelector
                    branchInputProps={{
                        name: '',
                        onChange: () => {},
                        placeholder: 'Namespace',
                        label: 'Namespace',
                        value: 'dev-ns',
                        disabled: true,
                    }}
                    sourceTypePickerProps={{
                        inputId: `Environment-${'getting-started-nodejs'}`,
                        label: 'Environment',
                        placeholder: 'Select environment',
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
