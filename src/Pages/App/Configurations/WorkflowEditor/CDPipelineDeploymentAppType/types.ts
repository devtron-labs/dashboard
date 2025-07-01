import { DeploymentAppRadioGroupType } from '@Components/v2/values/chartValuesDiff/ChartValuesView.type'

export interface CDPipelineDeploymentAppTypeProps
    extends Omit<DeploymentAppRadioGroupType, 'isFromCDPipeline' | 'handleOnChange'> {
    isVirtualEnvironment: boolean
    noGitOpsModuleInstalledAndConfigured: boolean
    isGitOpsInstalledButNotConfigured: boolean
    handleChange: DeploymentAppRadioGroupType['handleOnChange']
}
