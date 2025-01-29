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

import {
    DeploymentAppTypes,
    DeploymentStrategy,
    Environment,
    TriggerType,
    SavedDeploymentStrategy,
    VariableType,
    NodeStatusDTO,
    CDFormType,
} from '@devtron-labs/devtron-fe-common-lib'
import { SyntheticEvent } from 'react'

export const CD_PATCH_ACTION = {
    DELETE: 1,
    UPDATE: 2,
    DEPLOYMENT_PARTIAL_DELETE: 3,
}

export interface CDStageType {
    name?: string
    triggerType: string
    config: string
    status?: string
    cdWorkflowId?: number
    cdWorkflowRunnerId?: number
}

export interface CommonError {
    isValid: boolean
    message: string
}

export enum GeneratedHelmPush {
    PUSH = 'PUSH',
    DO_NOT_PUSH = 'DO_NOT_PUSH',
}

export interface PipelineConfig {
    id: number
    environmentId: number
    ciPipelineId: number
    triggerType: string
    name: string
    preStage: CDStageType & { switch: string }
    postStage: CDStageType & { switch: string }
    strategies: SavedDeploymentStrategy[]
    namespace: string
    preStageConfigMapSecretNames: {
        configMaps: string[]
        secrets: string[]
    }
    postStageConfigMapSecretNames: {
        configMaps: string[]
        secrets: string[]
    }
    runPreStageInEnv: boolean
    runPostStageInEnv: boolean
    isClusterCdActive: boolean
    parentPipelineId: number
    parentPipelineType: string
    isDigestEnforcedForEnv?: boolean
}

export interface BasicCDPipelineModalProps {
    view: string
    pipelineConfig: PipelineConfig
    environments: Environment[]
    selectEnvironment: (selection: Environment[]) => void
    handleNamespaceChange: (event: any, environment: any) => void
    savePipeline: () => void
    loadingData: boolean
    showError: boolean
    close: () => void
    cdPipelineId: string
    strategies: DeploymentStrategy[]
    selectStrategy: (selection: string) => void
}

export interface AdvanceCDPipelineModalProps {
    close: () => void
    pipelineConfig: PipelineConfig
    environments: Environment[]
    selectEnvironment: (selection: Environment[]) => void
    handleNamespaceChange: (event: any, environment: any) => void
    handlePipelineName: (event: any) => void
    handlePreBuild: () => void
    showPreBuild: boolean
    showPreStage: boolean
    showPostStage: boolean
    showPostBuild: boolean
    handleStageConfigChange: (
        value: string,
        stageType: 'preStage' | 'postStage',
        key: 'triggerType' | 'config' | 'switch',
    ) => void
    configMapAndSecrets: any[]
    handleConfigmapAndSecretsChange: (selection: any, stage: any) => void
    handleRunInEnvCheckbox: (event, key) => void
    handleDocker: () => void
    showDocker: boolean
    handlePostBuild: () => void
    cdPipelineId: string
    savePipeline: () => void
    loadingData: boolean
    strategies: DeploymentStrategy[]
    allStrategies: { [key: string]: any }
    toggleStrategy: (selection: string) => void
    deleteStrategy: (selection: string) => void
    handleStrategyChange: (event: any, selection: string, key: 'json' | 'yaml') => void
    setDefaultStrategy: (selection: string) => void
    selectStrategy: (selection: string) => void
    deleteStage: (key: 'preStage' | 'postStage') => void
    renderAddStage: (key: 'preStage' | 'postStage') => void
}

export interface InputVariablesFromInputListType {
    preBuildStage: Map<string, VariableType>[]
    postBuildStage: Map<string, VariableType>[]
}

export enum MigrationSourceValidationReasonType {
    CLUSTER_NOT_FOUND = 'ClusterNotFound',
    ENVIRONMENT_NOT_FOUND = 'EnvironmentNotFound',
    APPLICATION_ALREADY_LINKED = 'ApplicationAlreadyLinked',
    CHART_TYPE_MISMATCH = 'ChartTypeMismatch',
    CHART_VERSION_NOT_FOUND = 'ChartVersionNotFound',
    GITOPS_NOT_FOUND = 'GitOpsNotFound',
    INTERNAL_SERVER_ERROR = 'InternalServerError',
    ENVIRONMENT_ALREADY_PRESENT = 'EnvironmentAlreadyPresent',
    ENFORCED_POLICY_VIOLATION = 'EnforcedPolicyViolation',
}

export interface MigrateToDevtronRequiredFieldsDTO {
    deploymentAppType: DeploymentAppTypes
    applicationObjectClusterId: number
    applicationObjectNamespace: string
    deploymentAppName: string
}

interface ValidateMigrationSourceAppDestinationDetailsDTO {
    clusterName: string
    clusterServerUrl: string
    namespace: string
    environmentName: string
    environmentId: number
}

export interface ValidateMigrationSourceDTO {
    isLinkable: boolean
    errorDetail: {
        validationFailedReason: MigrationSourceValidationReasonType
        validationFailedMessage: string
    }
    applicationMetadata: {
        source: {
            repoURL: string
            chartPath: string
            chartMetadata: {
                requiredChartVersion: string
                savedChartName: string
                valuesFileName: string
                requiredChartName: string
            }
        }
        destination: ValidateMigrationSourceAppDestinationDetailsDTO
        status: NodeStatusDTO
    }
}

export interface MigrateFromArgoFormState {
    appName: string | null
    namespace: string | null
    clusterId: number | null
    validationResponse: ValidateMigrationSourceDTO | null
}

export interface MigrateToDevtronFormState {
    deploymentAppType: Extract<DeploymentAppTypes, DeploymentAppTypes.HELM | DeploymentAppTypes.GITOPS> | null
    migrateFromArgoFormState: MigrateFromArgoFormState
    // TODO: Will add helm form state
    triggerType: (typeof TriggerType)[keyof typeof TriggerType]
}

export interface MigratePipelineFromArgoRequiredFieldsDTO
    extends MigrateToDevtronRequiredFieldsDTO,
        Pick<MigrateToDevtronFormState, 'triggerType'>,
        Pick<CDFormType, 'environmentId' | 'environmentName' | 'namespace'> {}

export interface TriggerTypeRadioProps {
    value: (typeof TriggerType)[keyof typeof TriggerType]
    onChange: (event: SyntheticEvent) => void
}
