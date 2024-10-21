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

import { ReleaseTag } from '../../Common'

interface WebhookDataType {
    id: number
    eventActionType: string
    data: any
}

interface MaterialHistoryDTO {
    Commit: string
    Author: string
    Date: string
    Message: string
    Changes: unknown[]
    WebhookData: WebhookDataType
}

interface MaterialHistoryType {
    commitURL: string
    commit: MaterialHistoryDTO['Commit']
    author: MaterialHistoryDTO['Author']
    date: MaterialHistoryDTO['Date']
    message: MaterialHistoryDTO['Message']
    changes: MaterialHistoryDTO['Changes']
    webhookData: MaterialHistoryDTO['WebhookData']
    showChanges: boolean
    isSelected: boolean
    excluded?: boolean
}

interface CIMaterialDTO {
    id: number
    gitMaterialId: number
    gitMaterialName: string
    type: string
    value: string
    active: boolean
    history: MaterialHistoryDTO[]
    lastFetchTime: string
    url: string
}

// FIXME: These are meta types not received from API. Added this for backward compatibility
interface CIMaterialMetaType {
    isRepoError?: boolean
    repoErrorMsg?: string
    isBranchError?: boolean
    branchErrorMsg?: string
    isMaterialLoading?: boolean
    regex?: string
    searchText?: string
    noSearchResultsMsg?: string
    noSearchResult?: boolean
    isRegex?: boolean
    isDockerFileError?: boolean
    dockerFileErrorMsg?: string
    showAllCommits?: boolean
    isMaterialSelectionError?: boolean
    materialSelectionErrorMsg?: string
}

export interface CIMaterialType
    extends Pick<
            CIMaterialDTO,
            'id' | 'gitMaterialId' | 'gitMaterialName' | 'type' | 'value' | 'active' | 'lastFetchTime'
        >,
        CIMaterialMetaType {
    gitURL: CIMaterialDTO['url']
    history: MaterialHistoryType[]
    isSelected: boolean
}

interface ImageCommentDTO {
    id: number
    comment: string
    artifactId: number
}

interface ImageCommentType extends ImageCommentDTO {}

interface ImageTaggingDataDTO {
    imageReleaseTags: ReleaseTag[]
    appReleaseTags: string[]
    imageComment: ImageCommentDTO
    tagsEditable: boolean
}

interface ImageTaggingDataType
    extends Pick<ImageTaggingDataDTO, 'imageReleaseTags' | 'appReleaseTags' | 'tagsEditable'> {
    imageComment: ImageCommentType
}

export interface CIMaterialInfoDTO {
    ciPipelineId: number
    ciMaterials: CIMaterialDTO[]
    triggeredByEmail: string
    lastDeployedTime: string
    appId: number
    appName: string
    environmentId: number
    environmentName: string
    imageTaggingData: ImageTaggingDataDTO
    image: string
}

export interface CIMaterialInfoType
    extends Pick<
            CIMaterialInfoDTO,
            | 'triggeredByEmail'
            | 'lastDeployedTime'
            | 'appId'
            | 'appName'
            | 'environmentId'
            | 'environmentName'
            | 'image'
            | 'ciPipelineId'
        >,
        ImageTaggingDataType {
    materials: CIMaterialType[]
}

export interface GetCITriggerInfoParamsType {
    envId: number | string
    ciArtifactId: number | string
}

export enum AppEnvDeploymentConfigType {
    PUBLISHED_ONLY = 'PublishedOnly',
    DRAFT_ONLY = 'DraftOnly',
    PUBLISHED_WITH_DRAFT = 'PublishedWithDraft',
    PREVIOUS_DEPLOYMENTS = 'PreviousDeployments',
    DEFAULT_VERSION = 'DefaultVersion',
}

export interface DraftMetadataDTO {
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
    draftResolvedValue: string
    approvers: string[]
    canApprove: boolean
    commentsCount: number
    dataEncrypted: boolean
    isAppAdmin: boolean
}

export interface ConfigDatum {
    name: string
    type: string
    external: boolean
    data: Record<string, string>
    defaultData: Record<string, string>
    global: boolean
    externalType: string
    esoSecretData: {}
    defaultESOSecretData: {}
    secretData: Record<string, string>
    defaultSecretData: Record<string, string>
    roleARN: string
    subPath: boolean
    filePermission: string
    overridden: boolean
    mountPath?: string
    defaultMountPath?: string
}

export interface ConfigMapSecretDataConfigDatumDTO extends ConfigDatum {
    draftMetadata: DraftMetadataDTO
}

export interface ConfigMapSecretDataType {
    id: number
    appId: number
    configData: ConfigMapSecretDataConfigDatumDTO[]
}

export enum ConfigResourceType {
    ConfigMap = 'ConfigMap',
    Secret = 'Secret',
    DeploymentTemplate = 'Deployment Template',
    PipelineStrategy = 'Pipeline Strategy',
}

export interface DeploymentTemplateDTO {
    resourceType: ConfigResourceType.DeploymentTemplate
    data: Record<string, any>
    deploymentDraftData: ConfigMapSecretDataType | null
    variableSnapshot: {
        'Deployment Template': Record<string, string>
    }
    templateVersion: string
    isAppMetricsEnabled?: true
    resolvedValue: Record<string, any>
}

export interface ConfigMapSecretDataDTO {
    resourceType: Extract<ConfigResourceType, ConfigResourceType.ConfigMap | ConfigResourceType.Secret>
    data: ConfigMapSecretDataType
    variableSnapshot: Record<string, Record<string, string>>
    resolvedValue: string
}

export interface PipelineConfigDataDTO {
    resourceType: ConfigResourceType.PipelineStrategy
    data: Record<string, any>
    pipelineTriggerType: string
    Strategy: string
}

export interface AppEnvDeploymentConfigDTO {
    deploymentTemplate: DeploymentTemplateDTO | null
    configMapData: ConfigMapSecretDataDTO | null
    secretsData: ConfigMapSecretDataDTO | null
    pipelineConfigData?: PipelineConfigDataDTO
    isAppAdmin: boolean
}

export type AppEnvDeploymentConfigPayloadType =
    | {
          appName: string
          envName: string
          configType: AppEnvDeploymentConfigType
          identifierId?: number
          pipelineId?: number
          resourceType?: ConfigResourceType
          resourceId?: number
          resourceName?: string
          configArea?: 'AppConfiguration'
      }
    | {
          appName: string
          envName: string
          pipelineId: number
          configArea: 'CdRollback' | 'DeploymentHistory'
          wfrId: number
      }

export enum TemplateListType {
    DefaultVersions = 1,
    PublishedOnEnvironments = 2,
    DeployedOnSelfEnvironment = 3,
    DeployedOnOtherEnvironment = 4,
}

export interface TemplateListDTO {
    chartRefId: number
    chartVersion?: string
    chartType?: string
    type: TemplateListType
    environmentId?: number
    environmentName?: string
    deploymentTemplateHistoryId?: number
    finishedOn?: string
    status?: string
    pipelineId?: number
    wfrId?: number
}

export interface ManifestTemplateDTO {
    data: string
    resolvedData: string
    variableSnapshot: null
}

export enum DraftState {
    Init = 1,
    Discarded = 2,
    Published = 3,
    AwaitApproval = 4,
}

export enum EnvResourceType {
    ConfigMap = 'configmap',
    Secret = 'secrets',
    DeploymentTemplate = 'deployment-template',
    Manifest = 'manifest',
    PipelineStrategy = 'pipeline-strategy',
}
