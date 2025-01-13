import {
    DeploymentConfigDiffProps,
    DeploymentWithConfigType,
    SelectPickerProps,
    UseUrlFiltersReturnType,
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
    'configList' | 'collapsibleNavList' | 'navList' | 'scopeVariablesConfig' | 'errorConfig'
> & {
    isLoading?: boolean
    deploymentConfigSelectorProps: SelectPickerProps
    urlFilters: UseUrlFiltersReturnType<string, PipelineConfigDiffQueryParamsType>
}

export interface PipelineConfigDiffStatusTileProps
    extends Pick<PipelineConfigDiffProps, 'isLoading' | 'deploymentConfigSelectorProps' | 'urlFilters'> {
    hasDiff?: boolean
    noLastDeploymentConfig?: boolean
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
    canReviewConfig: boolean
    renderConfigNotAvailableTooltip: () => JSX.Element
}

export interface PipelineConfigDiffQueryParamsType {
    deploy: DeploymentWithConfigType
    mode: string
}

export enum PipelineConfigDiffQueryParams {
    DEPLOY = 'deploy',
    MODE = 'mode',
}
