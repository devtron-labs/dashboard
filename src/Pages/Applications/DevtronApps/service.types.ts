/*
 *   Copyright (c) 2024 Devtron Inc.
 *   All rights reserved.

 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at

 *   http://www.apache.org/licenses/LICENSE-2.0

 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import { ConfigDatum } from '@Pages/Shared/ConfigMapSecret/ConfigMapSecret.types'
import { STAGE_NAME } from './Details/AppConfigurations/AppConfig.types'

export interface AppConfigStatusItemType {
    stage: number
    stageName: STAGE_NAME
    status: boolean
    required: boolean
}

export enum ResourceConfigState {
    Unnamed = 'Unnamed',
    Draft = 'Draft',
    ApprovalPending = 'ApprovalPending',
    Published = 'Published',
}

export enum ResourceConfigStage {
    Inheriting = 'Inheriting',
    Overridden = 'Overridden',
    Env = 'Env',
    Unpublished = 'Unpublished',
}

export enum ConfigResourceType {
    ConfigMap = 'ConfigMap',
    Secret = 'Secret',
    DeploymentTemplate = 'Deployment Template',
}

export interface ResourceConfig {
    name: string
    configState: ResourceConfigState
    type: ConfigResourceType
    configStage: ResourceConfigStage
    id: number
}

export interface EnvConfigDTO {
    resourceConfig: ResourceConfig[]
}

export enum AppEnvDeploymentConfigType {
    PUBLISHED_ONLY = 'PublishedOnly',
    DRAFT_ONLY = 'DraftOnly',
    PUBLISHED_WITH_DRAFT = 'PublishedWithDraft',
    PREVIOUS_DEPLOYMENTS = 'PreviousDeployments',
    DEFAULT_VERSION = 'DefaultVersion',
}

export interface DraftMetadata {
    appId: number
    envId: number
    resource: number
    resourceName: string
    action: number
    data: string
    userComment: string
    changeProposed: boolean
    protectNotificationConfig: { [key: string]: null }
    draftId: number
    draftVersionId: number
    draftState: number
    approvers: string[]
    canApprove: boolean
    commentsCount: number
    dataEncrypted: boolean
    isAppAdmin: boolean
}

export interface ConfigMapSecretDataConfigDatumDTO extends ConfigDatum {
    draftMetadata: DraftMetadata
}

export interface ConfigMapSecretDataType {
    id: number
    appId: number
    configData: ConfigMapSecretDataConfigDatumDTO[]
    isEncrypted: boolean
}

export interface DeploymentTemplateDTO {
    resourceType: ConfigResourceType.DeploymentTemplate
    data: { [key: string]: any }
    // TODO: This needs to be changed at BE.
    deploymentDraftData: ConfigMapSecretDataType | null
}

export interface ConfigMapSecretDataDTO {
    resourceType: Extract<ConfigResourceType, ConfigResourceType.ConfigMap | ConfigResourceType.Secret>
    data: ConfigMapSecretDataType
}

export interface AppEnvDeploymentConfigDTO {
    deploymentTemplate: DeploymentTemplateDTO | null
    configMapData: ConfigMapSecretDataDTO | null
    secretsData: ConfigMapSecretDataDTO | null
}

export interface AppEnvDeploymentConfigQueryParamsType {
    configType: AppEnvDeploymentConfigType
    compareWith: string
    compareWithConfigType: AppEnvDeploymentConfigType
    identifierId?: number
    pipelineId?: number
    compareWithIdentifierId?: number
    compareWithPipelineId?: number
    chartRefId?: number
}

export interface AppEnvDeploymentConfigPayloadType
    extends Pick<AppEnvDeploymentConfigQueryParamsType, 'configType' | 'identifierId' | 'pipelineId'> {
    appName: string
    envName: string
}
