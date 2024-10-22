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

import { RouteComponentProps } from 'react-router-dom'
import {
    CDMaterialType,
    CDModalTabType,
    CommonNodeAttr,
    DeploymentNodeType,
    UserApprovalConfigType,
    CIBuildConfigType,
    ReleaseTag,
    ImageComment,
    DeploymentAppTypes,
    TaskErrorObj,
    FilterConditionsListType,
    CDMaterialResponseType,
    PipelineType,
    WorkflowType,
    Material,
    KeyValueListType,
    CIMaterialSidebarType,
    ArtifactPromotionMetadata,
    DeploymentWithConfigType,
    CIMaterialType,
    RuntimeParamsListItemType,
    KeyValueTableProps,
    CDMaterialSidebarType,
    CiPipeline,
    CdPipeline,
    ConsequenceType,
    PolicyKindType,
} from '@devtron-labs/devtron-fe-common-lib'
import React from 'react'
import { EnvironmentWithSelectPickerType } from '@Components/CIPipelineN/types'
import { AppContextType } from '@Components/common'
import { HostURLConfig } from '../../../../services/service.types'
import { DeploymentHistoryDetail } from '../cdDetails/cd.type'
import { WorkflowDimensions } from './config'

export type HandleRuntimeParamChange = (updatedRuntimeParams: RuntimeParamsListItemType[]) => void

type CDMaterialBulkRuntimeParams =
    | {
          isFromBulkCD: true
          bulkRuntimeParams: RuntimeParamsListItemType[]
          handleBulkRuntimeParamChange: HandleRuntimeParamChange
          handleBulkRuntimeParamError: KeyValueTableProps<string>['onError']
          bulkSidebarTab: CDMaterialSidebarType
      }
    | {
          isFromBulkCD?: false
          bulkRuntimeParams?: never
          handleBulkRuntimeParamChange?: never
          handleBulkRuntimeParamError?: never
          bulkSidebarTab?: never
      }

type CDMaterialPluginWarningProps =
    | {
          showPluginWarningBeforeTrigger: boolean
          consequence?: ConsequenceType
          configurePluginURL?: string
      }
    | {
          showPluginWarningBeforeTrigger?: never
          consequence?: never
          configurePluginURL?: never
      }

export type CDMaterialProps = {
    material?: CDMaterialType[]
    isLoading: boolean
    materialType: string
    envName: string
    envId?: number
    redirectToCD?: () => void
    stageType: DeploymentNodeType
    changeTab?: (
        materrialId: string | number,
        artifactId: number,
        tab: CDModalTabType,
        selectedCDDetail?: { id: number; type: DeploymentNodeType },
        appId?: number,
    ) => void
    selectImage?: (
        index: number,
        materialType: string,
        selectedCDDetail?: { id: number; type: DeploymentNodeType },
        appId?: number,
    ) => void
    toggleSourceInfo?: (materialIndex: number, selectedCDDetail?: { id: number; type: DeploymentNodeType }) => void
    closeCDModal: (e: React.MouseEvent) => void
    onClickRollbackMaterial?: (
        cdNodeId: number,
        offset?: number,
        size?: number,
        callback?: (loadingMore: boolean, noMoreImages?: boolean) => void,
        searchText?: string,
    ) => void
    parentPipelineId?: string
    parentPipelineType?: string
    parentEnvironmentName?: string
    hideInfoTabsContainer?: boolean
    appId?: number
    pipelineId?: number
    isFromBulkCD?: boolean
    userApprovalConfig?: UserApprovalConfigType
    requestedUserId?: number
    triggerType?: string
    isVirtualEnvironment?: boolean
    isSaveLoading?: boolean
    ciPipelineId?: number
    appReleaseTagNames?: string[]
    setAppReleaseTagNames?: (appReleaseTags: string[]) => void
    tagsEditable?: boolean
    hideImageTaggingHardDelete?: boolean
    setTagsEditable?: (tagsEditable: boolean) => void
    updateCurrentAppMaterial?: (matId: number, releaseTags?: ReleaseTag[], imageComment?: ImageComment) => void
    handleMaterialFilters?: (
        text: string,
        cdNodeId,
        nodeType: DeploymentNodeType,
        isApprovalNode?: boolean,
        fromRollback?: boolean,
    ) => void
    searchImageTag?: string
    resourceFilters?: FilterConditionsListType[]
    updateBulkCDMaterialsItem?: (singleCDMaterialResponse: CDMaterialResponseType) => void
    deploymentAppType?: DeploymentAppTypes
    selectedImageFromBulk?: string
    isSuperAdmin?: boolean
    isRedirectedFromAppDetails?: boolean
    /**
     * App name coming from app group view
     * To be consumed through variable called appName
     */
    selectedAppName?: string
    isTriggerBlockedDueToPlugin?: boolean
} & CDMaterialBulkRuntimeParams &
    CDMaterialPluginWarningProps

export interface ConfigToDeployOptionType {
    label: string
    value: DeploymentWithConfigType
    description?: string
}

export enum FilterConditionViews {
    ELIGIBLE = 'ELIGIBLE',
    ALL = 'ALL',
}

export interface CDMaterialState {
    isSecurityModuleInstalled: boolean
    showSearch: boolean
    loadingMore: boolean
    showOlderImages: boolean
    selectedConfigToDeploy: ConfigToDeployOptionType
    isRollbackTrigger: boolean
    selectedMaterial: CDMaterialType
    isSelectImageTrigger: boolean
    materialInEditModeMap: Map<number, boolean>
    areMaterialsPassingFilters: boolean
    searchApplied: boolean
    searchText: string
    showConfiguredFilters: boolean
    filterView: FilterConditionViews
    isSuperAdmin?: boolean
}

export interface MaterialInfo {
    revision: string
    modifiedTime: string | Date
    author: string
    message: string
    commitLink: string
    tag: string
    webhookData: string
    branch: string
    url?: string
    type?: string
}

export interface CIMaterialRouterProps {
    appId: string
    envId: string
    ciNodeId: string
}

export interface CIMaterialProps extends RouteComponentProps<CIMaterialRouterProps> {
    workflowId: number
    material: CIMaterialType[]
    pipelineId: number
    title: string
    isLoading: boolean
    pipelineName: string
    showWebhookModal: boolean
    toggleWebhookModal: (id, webhookTimeStampOrder) => void
    webhookPayloads: WebhookPayloads
    isWebhookPayloadLoading: boolean
    hideWebhookModal: (e?) => void
    onClickWebhookTimeStamp: () => void
    webhhookTimeStampOrder: string
    showMaterialRegexModal: boolean
    onCloseBranchRegexModal?: () => void
    filteredCIPipelines: any[]
    onClickShowBranchRegexModal: () => void
    isChangeBranchClicked: boolean
    getWorkflows: () => void
    loader: boolean
    setLoader: (isLoading) => void
    isFirstTrigger?: boolean
    isCacheAvailable?: boolean
    fromAppGrouping?: boolean
    appId: string
    isJobView?: boolean
    isCITriggerBlocked?: boolean
    ciBlockState?: ConsequenceType
    selectedEnv?: EnvironmentWithSelectPickerType
    setSelectedEnv?: React.Dispatch<React.SetStateAction<EnvironmentWithSelectPickerType>>
    environmentLists?: any[]
    isJobCI?: boolean
    handleRuntimeParamChange: HandleRuntimeParamChange
    runtimeParams: KeyValueListType[]
}

export interface RegexValueType {
    value: string
    isInvalid: boolean
}

export interface CIMaterialState {
    regexValue: Record<number, RegexValueType>
    savingRegexValue: boolean
    selectedCIPipeline?: any
    isBlobStorageConfigured?: boolean
    currentSidebarTab: CIMaterialSidebarType
    runtimeParamsErrorState: boolean
}

export interface DownStreams {
    id: string
    text: string
}

interface InputMaterials {
    time: string
    user: string
    commitLink: string
    isActive: boolean
}

export interface TriggerCDNodeProps extends RouteComponentProps<{ appId: string }> {
    x: number
    y: number
    height: number
    width: number
    status: string
    id: string
    downstreams?: string[]
    title: string
    environmentName: string
    environmentId: string
    triggerType: string
    colourCode: string
    deploymentStrategy: string
    inputMaterialList: InputMaterials[]
    rollbackMaterialList: InputMaterials[]
    stageIndex: number
    type: 'CD'
    parentPipelineId?: string
    parentPipelineType?: string
    parentEnvironmentName?: string
    fromAppGrouping: boolean
    description: string
    index?: number
    isVirtualEnvironment?: boolean
    isGitOpsRepoNotConfigured?: boolean
    deploymentAppType: DeploymentAppTypes
    appId: number
    isDeploymentBlocked?: boolean
}

export interface TriggerCDNodeState {
    showGitOpsRepoConfiguredWarning: boolean
    gitopsConflictLoading: boolean
    reloadNoGitOpsRepoConfiguredModal: boolean
    gitOpsRepoWarningCondition: boolean
}

export interface TriggerPrePostCDNodeProps
    extends RouteComponentProps<{ appId: string }>,
        Pick<CommonNodeAttr, 'isTriggerBlocked'> {
    x: number
    y: number
    height: number
    width: number
    status: string
    id: string
    environmentId: string
    environmentName: string
    title: string
    triggerType: string
    colourCode: string
    stageIndex: number
    type: DeploymentNodeType
    downstreams?: string[]
    inputMaterialList: InputMaterials[]
    rollbackMaterialList: InputMaterials[]
    fromAppGrouping: boolean
    description: string
    index?: number
    isGitOpsRepoNotConfigured?: boolean
    deploymentAppType: DeploymentAppTypes
    isDeploymentBlocked?: boolean
}
export interface TriggerPrePostCDNodeState {
    showGitOpsRepoConfiguredWarning: boolean
}

export interface TriggerEdgeType {
    startNode: any
    endNode: any
}

export interface WorkflowProps
    extends RouteComponentProps<{ appId: string }>,
        Pick<WorkflowType, 'artifactPromotionMetadata'> {
    id: string
    name: string
    startX: number
    startY: number
    width: number
    height: number
    nodes: CommonNodeAttr[]
    appId?: number
    isSelected?: boolean
    fromAppGrouping?: boolean
    handleSelectionChange?: (_appId: number) => void
    isJobView?: boolean
    index?: number
    environmentLists?: any[]
    filteredCIPipelines?: any[]
}

export interface TriggerViewContextType {
    invalidateCache: boolean
    refreshMaterial: (ciNodeId: number, materialId: number) => void
    onClickTriggerCINode: () => void
    onClickCIMaterial: (ciNodeId: string, ciPipelineName: string, preserveMaterialSelection?: boolean) => void
    onClickCDMaterial: (cdNodeId, nodeType: DeploymentNodeType, isApprovalNode?: boolean) => void
    onClickRollbackMaterial: (cdNodeId: number, offset?: number, size?: number) => void
    closeCIModal: () => void
    selectCommit: (materialId: string, hash: string) => void
    selectMaterial: (materialId) => void
    toggleChanges: (materialId: string, hash: string) => void
    toggleInvalidateCache: () => void
    getMaterialByCommit: (ciNodeId: number, materialId: number, gitMaterialId: number, commitHash: string) => void
    getFilteredMaterial: (ciNodeId: number, gitMaterialId: number, showExcluded: boolean) => void
    reloadTriggerView: () => void
}

export enum BulkSelectionEvents {
    SELECT_NONE = 'SELECT_NONE',
}

export interface TriggerViewRouterProps {
    appId: string
    envId: string
}

export interface TriggerViewProps extends RouteComponentProps<CIMaterialRouterProps> {
    isJobView?: boolean
    filteredEnvIds?: string
    appContext: AppContextType
}

export interface WebhookPayloadDataResponse {
    ParsedDataId: number
    EventTime: string
    MatchedFiltersCount: number
    FailedFiltersCount: number
    MatchedFilters: boolean
}

export interface WebhookPayloads {
    filters: Map<string, string>
    repositoryUrl: string
    payloads: WebhookPayloadDataResponse[] | null
}

export interface TriggerViewState {
    code: number
    view: string
    workflows: WorkflowType[]
    nodeType: null | 'CI' | 'CD' | 'PRECD' | 'POSTCD' | 'APPROVAL'
    ciPipelineName: string
    ciNodeId: number | null
    cdNodeId: number
    materialType: '' | 'inputMaterialList' | 'rollbackMaterialList'
    isLoading: boolean
    invalidateCache: boolean
    hostURLConfig: HostURLConfig
    showWebhookModal: boolean
    webhookPayloads: WebhookPayloads
    isWebhookPayloadLoading: boolean
    workflowId: number
    webhhookTimeStampOrder: string
    showMaterialRegexModal: boolean
    filteredCIPipelines: any[]
    isChangeBranchClicked: boolean
    loader: boolean
    isSaveLoading?: boolean
    selectedEnv?: EnvironmentWithSelectPickerType
    environmentLists?: any[]
    appReleaseTags?: string[]
    tagsEditable?: boolean
    hideImageTaggingHardDelete?: boolean
    configs?: boolean
    isDefaultConfigPresent?: boolean
    searchImageTag?: string
    resourceFilters?: FilterConditionsListType[]
    runtimeParams?: RuntimeParamsListItemType[]
}

// -- begining of response type objects for trigger view

export interface TriggerViewResponse {
    ciPipelineId: number
    ciPipelineName: string
    cdPipelineId: number
    cdPipelineName: string
    status: string
    statusMessage: string
    lastDeployedTime: string
    lastDeployedBy: string
    materialInfo: any
    releaseVersion: string
    dataSource: string
    conditions?: ApplicationConditionResponse[]
}

export interface ApplicationConditionResponse {
    type: string
    message: string
}

export enum CIPipelineNodeType {
    EXTERNAL_CI = 'EXTERNAL-CI',
    CI = 'CI',
    LINKED_CI = 'LINKED-CI',
    JOB_CI = 'JOB-CI',
    LINKED_CD = 'LINKED_CD',
}

export interface Task {
    name?: string
    type?: string
    cmd?: string
    args?: Array<string>
}

// Start Workflow Response
export interface Tree {
    id: number
    appWorkflowId: number
    type: PipelineType
    componentId: number
    parentId: number
    parentType: PipelineType
    isLast?: boolean
}

export interface Workflow {
    id: number
    name: string
    appId: number
    tree?: Tree[]
    artifactPromotionMetadata?: ArtifactPromotionMetadata
}

export interface WorkflowResult {
    appId: number
    appName: string
    isGitOpsRepoNotConfigured: boolean
    workflows: Workflow[]
}
// End Workflow Response

// Start CI Response
export interface DockerBuildConfig {
    gitMaterialId: number
    dockerfileRelativePath: string
    args?: Map<string, string>
    targetPlatform: any
}

export interface ExternalCiConfig {
    id: number
    webhookUrl: string
    payload: string
    accessKey: string
}

export interface Source {
    type: string
    value?: string
    regex?: string
}

export interface CiMaterial {
    source: Source
    gitMaterialId: number
    id: number
    gitMaterialName: string
    isRegex?: boolean
}

export interface CiScript {
    id: number
    index: number
    name: string
    script: string
    outputLocation?: string
}

export interface CiPipelineResult {
    id?: number
    appId?: number
    dockerRegistry?: string
    dockerRepository?: string
    ciBuildConfig?: CIBuildConfigType
    ciPipelines?: CiPipeline[]
    appName?: string
    version?: string
    materials: Material[]
    scanEnabled: boolean
    appWorkflowId?: number
    beforeDockerBuild?: Array<Task>
    afterDockerBuild?: Array<Task>
    ciGitConfiguredId?: number
}
// End CI Response

// Start CD response
export interface Strategy {
    deploymentTemplate: string
    config: any
    default?: boolean
}

export interface CDStage {
    status: string
    name: string
    triggerType: 'AUTOMATIC' | 'MANUAL'
    config: string
}

export interface CDStageConfigMapSecretNames {
    configMaps: any[]
    secrets: any[]
}

export interface PrePostDeployStageType {
    isValid: boolean
    steps: TaskErrorObj[]
    triggerType: string
    name: string
    status: string
}

export interface CdPipelineResult {
    pipelines?: CdPipeline[]
    appId: number
}

// End CD response

type PartialNodeAttr = Partial<CommonNodeAttr>

export interface FullNode {
    node: PartialNodeAttr
    hasPre: true
    hasPost: true
}

export interface WorkflowDisplay {
    id: number
    name: string
    nodes: Array<CommonNodeAttr>
    type: string
}

export interface BranchRegexModalProps {
    material
    selectedCIPipeline
    showWebhookModal: boolean
    title: string
    isChangeBranchClicked: boolean
    onClickNextButton: () => void
    handleRegexInputValue: (id, value, mat) => void
    regexValue
    onCloseBranchRegexModal
    hideHeaderFooter?: boolean
    savingRegexValue: boolean
}
export interface AppDetailsProps {
    isV2: boolean
}

export interface TriggerViewDeploymentConfigType {
    configMap: DeploymentHistoryDetail[]
    deploymentTemplate: DeploymentHistoryDetail
    pipelineStrategy: DeploymentHistoryDetail
    secret: DeploymentHistoryDetail[]
}

export interface TriggerViewConfigDiffProps extends Pick<CDMaterialState, 'selectedConfigToDeploy'> {
    currentConfiguration: TriggerViewDeploymentConfigType
    baseTemplateConfiguration: TriggerViewDeploymentConfigType
    handleConfigSelection: (selected) => void
    isConfigAvailable: (optionValue) => boolean
    diffOptions: Record<string, boolean>
    isRollbackTriggerSelected: boolean
    isRecentConfigAvailable: boolean
    canReviewConfig: boolean
}

export const MATERIAL_TYPE = {
    rollbackMaterialList: 'rollbackMaterialList',
    inputMaterialList: 'inputMaterialList',
    none: 'none',
}

export interface EmptyStateCIMaterialProps {
    isRepoError: boolean
    isBranchError: boolean
    isDockerFileError: boolean
    dockerFileErrorMsg: string
    gitMaterialName: string
    sourceValue: string
    repoUrl: string
    branchErrorMsg: string
    repoErrorMsg: string
    isMaterialLoading: boolean
    onRetry: (...args) => void
    anyCommit: boolean
    isWebHook?: boolean
    noSearchResults?: boolean
    noSearchResultsMsg?: string
    toggleWebHookModal?: () => void
    clearSearch?: (e) => void
    handleGoToWorkFlowEditor?: (e?: any) => void
    showAllCommits?: boolean
    toggleExclude: (e) => void
}

export interface MaterialSourceProps {
    material: CIMaterialType[]
    selectMaterial: (materialId: string, ciPipelineId?: number) => void
    refreshMaterial?: {
        pipelineId: number
        refresh: (pipelineId: number, gitMaterialId: number) => void
    }
    ciPipelineId?: number
    fromTriggerInfo?: boolean
    clearSearch?: (e: any) => void
}

export interface AddDimensionsToDownstreamDeploymentsParams {
    downstreams: CommonNodeAttr[]
    dimensions: WorkflowDimensions
    startX: number
    startY: number
}

export interface RenderCTAType {
    mat: CDMaterialType
    disableSelection: boolean
}

export interface CIMaterialModalProps extends CIMaterialProps {
    closeCIModal: () => void
    abortController: AbortController
    resetAbortController: () => void
}

export type OffendingWorkflowQueryParamType = `policy/${PolicyKindType}|identifier|${string}`
