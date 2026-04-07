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

import {
    DeploymentConfigDiffProps,
    DeploymentConfigDiffRadioSelectConfig,
    DeploymentStrategyType,
    DeploymentWithConfigType,
    Strategy,
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
    deploymentStrategy: DeploymentStrategyType
    setDeploymentStrategy: Dispatch<SetStateAction<DeploymentStrategyType>>
    pipelineStrategyOptions: Strategy[]
    isCDNode: boolean
}

export type PipelineConfigDiffProps = Pick<
    DeploymentConfigDiffProps,
    | 'configList'
    | 'collapsibleNavList'
    | 'navList'
    | 'scopeVariablesConfig'
    | 'errorConfig'
    | 'tabConfig'
    | 'navHelpText'
> & {
    isLoading?: boolean
    radioSelectConfig: DeploymentConfigDiffRadioSelectConfig
    urlFilters: UseUrlFiltersReturnType<string, PipelineConfigDiffQueryParamsType>
}

export interface PipelineConfigDiffStatusTileProps
    extends Pick<PipelineConfigDiffProps, 'isLoading' | 'radioSelectConfig'> {
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

export interface GetPipelineDeploymentConfigSelectorConfigParams
    extends Pick<UsePipelineDeploymentConfigProps, 'deploymentStrategy' | 'pipelineStrategyOptions'> {
    isLastDeployedConfigAvailable: boolean
    isRollbackTriggerSelected: boolean
    isConfigAvailable: (configType: DeploymentWithConfigType) => boolean
    deploy: DeploymentWithConfigType
    onDeploymentConfigChange: (updatedConfigType: DeploymentWithConfigType) => void
    onStrategyChange: (updatedStrategy: DeploymentStrategyType) => void
}
