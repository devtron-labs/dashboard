import {
    DeploymentConfigDiffProps,
    DeploymentWithConfigType,
    EnvResourceType,
    SelectPickerProps,
} from '@devtron-labs/devtron-fe-common-lib'

export interface UsePipelineDeploymentConfigProps {
    appId: number
    envId: number
    appName: string
    envName: string
    pipelineId: number
    wfrId: number
    isRollbackTriggerSelected?: boolean
}

export type PipelineConfigDiffProps = Pick<
    DeploymentConfigDiffProps,
    'configList' | 'collapsibleNavList' | 'navList' | 'scopeVariablesConfig'
> &
    Pick<UsePipelineDeploymentConfigProps, 'isRollbackTriggerSelected'> & {
        isLoading?: boolean
        deploymentConfigSelectorProps: SelectPickerProps
    }

export interface PipelineConfigDiffStatusTileProps
    extends Pick<PipelineConfigDiffProps, 'isLoading' | 'deploymentConfigSelectorProps'> {
    hasDiff?: boolean
    noLastDeploymentConfig?: boolean
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
    canReviewConfig: boolean
}

export interface PipelineConfigDiffQueryParamsType {
    deploy: DeploymentWithConfigType
    resourceType: EnvResourceType
    resourceName?: string
    mode: string
}

export enum PipelineConfigDiffQueryParams {
    DEPLOY = 'deploy',
    RESOURCE_TYPE = 'resourceType',
    RESOURCE_NAME = 'resourceName',
    MODE = 'mode',
}
