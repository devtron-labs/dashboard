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

import { CSSProperties, ReactElement } from 'react'
import {
    OptionType,
    UserApprovalMetadataType,
    ReleaseTag,
    ImageComment,
    PromotionApprovalMetadataType,
    FilterConditionsListType,
    DeploymentAppTypes,
    ResponseType,
    PaginationProps,
    useScrollable,
    SortingOrder,
    SupportedKeyboardKeysType,
} from '../../../Common'
import { DeploymentStageType } from '../../constants'
import { AggregationKeys, GitTriggers, Node, NodeType, ResourceKindType, ResourceVersionType } from '../../types'
import { TERMINAL_STATUS_MAP } from './constants'

export enum HistoryComponentType {
    CI = 'CI',
    CD = 'CD',
    GROUP_CI = 'GROUP_CI',
    GROUP_CD = 'GROUP_CD',
}

export enum FetchIdDataStatus {
    SUCCESS = 'SUCCESS',
    FETCHING = 'FETCHING',
    SUSPEND = 'SUSPEND',
}

export interface LogResizeButtonType {
    /**
     * If given, that shortcut combo will be bound to the button
     * @default null
     */
    shortcutCombo?: SupportedKeyboardKeysType[]
    /**
     * If true, only show the button when location.pathname contains '/logs'
     * @default true
     */
    showOnlyWhenPathIncludesLogs?: boolean
    fullScreenView: boolean
    setFullScreenView: React.Dispatch<React.SetStateAction<boolean>>
}

export interface RunSourceType {
    id: number
    identifier: string
    kind: ResourceKindType
    name: string
    releaseTrackName: string
    releaseVersion: string
    version: ResourceVersionType
}

interface CiMaterial {
    id: number
    gitMaterialId: number
    gitMaterialUrl: string
    gitMaterialName: string
    type: string
    value: string
    active: boolean
    lastFetchTime: string
    isRepoError: boolean
    repoErrorMsg: string
    isBranchError: boolean
    branchErrorMsg: string
    url: string
}

export interface CICDSidebarFilterOptionType extends OptionType {
    pipelineId: number
    pipelineType?: string
    deploymentAppDeleteRequest?: boolean
}

// The values can be undefined because of old data
export interface TargetConfigType {
    tenantIcon?: string
    tenantId?: string
    tenantName?: string
    installationId?: string
    installationName?: string
    releaseChannelId?: string
    releaseChannelName?: string
}

export interface History {
    id: number
    name: string
    status: string
    podStatus: string
    podName: string
    message: string
    startedOn: string
    finishedOn: string
    ciPipelineId: number
    namespace: string
    logLocation: string
    gitTriggers: Map<number, GitTriggers>
    ciMaterials: CiMaterial[]
    triggeredBy: number
    artifact: string
    artifactId: number
    triggeredByEmail: string
    stage?: DeploymentStageType
    blobStorageEnabled?: boolean
    isArtifactUploaded?: boolean
    userApprovalMetadata?: UserApprovalMetadataType
    IsVirtualEnvironment?: boolean
    helmPackageName?: string
    environmentName?: string
    imageComment?: ImageComment
    imageReleaseTags?: ReleaseTag[]
    appReleaseTagNames?: string[]
    tagsEditable?: boolean
    appliedFilters?: FilterConditionsListType[]
    appliedFiltersTimestamp?: string
    promotionApprovalMetadata?: PromotionApprovalMetadataType
    triggerMetadata?: string
    runSource?: RunSourceType
    targetConfig?: TargetConfigType
}

export interface DeploymentHistoryResultObject {
    cdWorkflows: History[]
    appReleaseTagNames: string[]
    tagsEditable: boolean
    hideImageTaggingHardDelete: boolean
}

export interface DeploymentHistoryResult extends ResponseType {
    result?: DeploymentHistoryResultObject
}

export interface RenderRunSourceType {
    renderRunSource?: (runSource: RunSourceType, isDeployedInThisResource: boolean) => JSX.Element
}

export interface SidebarType extends RenderRunSourceType {
    type: HistoryComponentType
    filterOptions: CICDSidebarFilterOptionType[]
    triggerHistory: Map<number, History>
    hasMore: boolean
    setPagination: React.Dispatch<React.SetStateAction<{ offset: number; size: number }>>
    fetchIdData?: FetchIdDataStatus
    handleViewAllHistory?: () => void
    children?: React.ReactNode
    resourceId?: number
}

export interface HistorySummaryCardType extends RenderRunSourceType {
    id: number
    status: string
    startedOn: string
    triggeredBy: number
    triggeredByEmail: string
    ciMaterials: CiMaterial[]
    gitTriggers: Map<number, GitTriggers>
    artifact: string
    type: HistoryComponentType
    stage: DeploymentStageType
    dataTestId?: string
    runSource?: RunSourceType
    /**
     * resourceId is optional as of now since resource is not shown at all places, in future should be mandatory if we show run source at all places
     */
    resourceId?: number
}

export interface SummaryTooltipCardType {
    status: string
    startedOn: string
    triggeredBy: number
    triggeredByEmail: string
    ciMaterials: CiMaterial[]
    gitTriggers: Map<number, GitTriggers>
}

export interface DeploymentTemplateList {
    id: number
    name: string
    childList?: string[]
}

export interface CurrentStatusType {
    status: string
    finishedOn: string
    artifact: string
    stage: DeploymentStageType
    type: HistoryComponentType
}

export interface StartDetailsType {
    startedOn: string
    triggeredBy: number
    triggeredByEmail: string
    ciMaterials: CiMaterial[]
    gitTriggers: Map<number, GitTriggers>
    artifact: string
    type: HistoryComponentType
    environmentName?: string
    isJobView?: boolean
    triggerMetadata?: string
    renderDeploymentHistoryTriggerMetaText: (triggerMetaData: string) => JSX.Element
    /**
     * Callback handler for showing the target config
     */
    renderTargetConfigInfo?: () => ReactElement
    stage: DeploymentStageType
}

export interface TriggerDetailsType extends Pick<StartDetailsType, 'renderTargetConfigInfo'> {
    status: string
    startedOn: string
    finishedOn: string
    triggeredBy: number
    triggeredByEmail: string
    ciMaterials: CiMaterial[]
    gitTriggers: Map<number, GitTriggers>
    message: string
    podStatus: string
    type: HistoryComponentType
    stage: DeploymentStageType
    artifact?: string
    environmentName?: string
    isJobView?: boolean
    workerPodName?: string
    triggerMetadata?: string
    renderDeploymentHistoryTriggerMetaText: (triggerMetaData: string) => JSX.Element
}

export interface ProgressingStatusType {
    status: string
    stage: DeploymentStageType
    type: HistoryComponentType
}

export interface WorkerStatusType {
    message: string
    podStatus: string
    stage: DeploymentStageType
    finishedOn?: string
    workerPodName?: string
}

export interface FinishedType {
    status: string
    finishedOn: string
    artifact: string
    type: HistoryComponentType
}

export interface TriggerDetailsStatusIconType {
    status: string
}

export interface SyncStageResourceDetail {
    id: number
    cdWorkflowRunnerId: number
    resourceGroup: string
    resourceKind: string
    resourceName: string
    resourcePhase: string
    resourceStatus: string
    statusMessage: string
}

export interface DeploymentStatusDetailsTimelineType {
    id: number
    cdWorkflowRunnerId: number
    status: string
    statusDetail: string
    statusTime: string
    resourceDetails?: SyncStageResourceDetail[]
}
export interface DeploymentStatusDetailsType {
    deploymentFinishedOn: string
    deploymentStartedOn: string
    triggeredBy: string
    statusFetchCount: number
    statusLastFetchedAt: string
    timelines: DeploymentStatusDetailsTimelineType[]
    wfrStatus?: string
}

export interface DeploymentStatusDetailsResponse extends ResponseType {
    result?: DeploymentStatusDetailsType
}

export const TERMINAL_STATUS_COLOR_CLASS_MAP = {
    [TERMINAL_STATUS_MAP.SUCCEEDED]: 'cg-5',
    [TERMINAL_STATUS_MAP.HEALTHY]: 'cg-5',
    [TERMINAL_STATUS_MAP.FAILED]: 'cr-5',
    [TERMINAL_STATUS_MAP.CANCELLED]: 'cr-5',
    [TERMINAL_STATUS_MAP.ERROR]: 'cr-5',
}

export const PROGRESSING_STATUS = {
    [TERMINAL_STATUS_MAP.RUNNING]: 'running',
    [TERMINAL_STATUS_MAP.PROGRESSING]: 'progressing',
    [TERMINAL_STATUS_MAP.STARTING]: 'starting',
    [TERMINAL_STATUS_MAP.INITIATING]: 'initiating',
    [TERMINAL_STATUS_MAP.QUEUED]: 'queued',
}

interface DeploymentStatusDetailRow {
    icon: string
    displayText: string
    displaySubText: string
    time: string
    resourceDetails?: any
    isCollapsed?: boolean
    kubeList?: { icon: any; message: string }[]
    timelineStatus?: string
}
export interface DeploymentStatusDetailsBreakdownDataType {
    deploymentStatus: string
    deploymentStatusText: string
    deploymentTriggerTime: string
    deploymentEndTime: string
    deploymentError: string
    triggeredBy: string
    nonDeploymentError: string
    deploymentStatusBreakdown: {
        DEPLOYMENT_INITIATED: DeploymentStatusDetailRow
        GIT_COMMIT?: DeploymentStatusDetailRow
        ARGOCD_SYNC?: DeploymentStatusDetailRow
        KUBECTL_APPLY?: DeploymentStatusDetailRow
        APP_HEALTH?: DeploymentStatusDetailRow
        HELM_PACKAGE_GENERATED?: DeploymentStatusDetailRow
    }
}

export interface DeploymentDetailStepsType {
    deploymentStatus?: string
    deploymentAppType?: DeploymentAppTypes
    isHelmApps?: boolean
    installedAppVersionHistoryId?: number
    isGitops?: boolean
    userApprovalMetadata?: UserApprovalMetadataType
    isVirtualEnvironment?: boolean
    processVirtualEnvironmentDeploymentData: (
        data?: DeploymentStatusDetailsType,
    ) => DeploymentStatusDetailsBreakdownDataType
    renderDeploymentApprovalInfo: (userApprovalMetadata: UserApprovalMetadataType) => JSX.Element
}

export interface RenderCIListHeaderProps {
    userApprovalMetadata: UserApprovalMetadataType
    triggeredBy: string
    appliedFilters: FilterConditionsListType[]
    appliedFiltersTimestamp: string
    promotionApprovalMetadata: PromotionApprovalMetadataType
    selectedEnvironmentName: string
}

export interface VirtualHistoryArtifactProps {
    status: string
    title: string
    params: {
        appId: number
        envId: number
        appName: string
        workflowId: number
    }
}
export interface TriggerOutputProps extends RenderRunSourceType, Pick<TriggerDetailsType, 'renderTargetConfigInfo'> {
    fullScreenView: boolean
    triggerHistory: Map<number, History>
    setFullScreenView: React.Dispatch<React.SetStateAction<boolean>>
    deploymentHistoryList: DeploymentTemplateList[]
    setDeploymentHistoryList: React.Dispatch<React.SetStateAction<DeploymentTemplateList[]>>
    deploymentAppType: DeploymentAppTypes
    isBlobStorageConfigured: boolean
    appReleaseTags: string[]
    tagsEditable: boolean
    hideImageTaggingHardDelete: boolean
    fetchIdData: FetchIdDataStatus
    selectedEnvironmentName?: string
    renderCIListHeader?: (renderCIListHeaderProps: RenderCIListHeaderProps) => JSX.Element
    renderDeploymentApprovalInfo?: (userApprovalMetadata: UserApprovalMetadataType) => JSX.Element
    processVirtualEnvironmentDeploymentData?: (
        data?: DeploymentStatusDetailsType,
    ) => DeploymentStatusDetailsBreakdownDataType
    renderVirtualHistoryArtifacts?: (virtualHistoryArtifactProps: VirtualHistoryArtifactProps) => JSX.Element
    renderDeploymentHistoryTriggerMetaText?: (triggerMetaData: string) => JSX.Element
    resourceId?: number
    deploymentHistoryResult: Pick<DeploymentHistoryResult, 'result'>
    setFetchTriggerIdData: React.Dispatch<React.SetStateAction<FetchIdDataStatus>>
    setTriggerHistory: React.Dispatch<React.SetStateAction<Map<Number, History>>>
    scrollToTop: ReturnType<typeof useScrollable>[1]
    scrollToBottom: ReturnType<typeof useScrollable>[2]
}

export interface HistoryLogsProps
    extends Pick<
        TriggerOutputProps,
        | 'scrollToTop'
        | 'scrollToBottom'
        | 'setFullScreenView'
        | 'deploymentHistoryList'
        | 'setDeploymentHistoryList'
        | 'deploymentAppType'
        | 'isBlobStorageConfigured'
        | 'appReleaseTags'
        | 'tagsEditable'
        | 'hideImageTaggingHardDelete'
        | 'selectedEnvironmentName'
        | 'processVirtualEnvironmentDeploymentData'
        | 'renderDeploymentApprovalInfo'
        | 'renderCIListHeader'
        | 'renderVirtualHistoryArtifacts'
        | 'fullScreenView'
    > {
    triggerDetails: History
    loading: boolean
    userApprovalMetadata: UserApprovalMetadataType
    triggeredByEmail: string
    artifactId: number
    ciPipelineId: number
    resourceId?: number
    renderRunSource: (runSource: RunSourceType, isDeployedInThisResource: boolean) => JSX.Element
}

export interface LogsRendererType
    extends Pick<HistoryLogsProps, 'fullScreenView' | 'triggerDetails' | 'isBlobStorageConfigured'> {
    parentType: HistoryComponentType
}

export interface DeploymentStatusDetailBreakdownType {
    deploymentStatusDetailsBreakdownData: DeploymentStatusDetailsBreakdownDataType
    isVirtualEnvironment?: boolean
}

export interface DeploymentStatusDetailRowType {
    type: string
    hideVerticalConnector?: boolean
    deploymentDetailedData: DeploymentStatusDetailsBreakdownDataType
}

export interface ErrorInfoStatusBarType {
    nonDeploymentError: string
    type: string
    errorMessage: string
    hideVerticalConnector?: boolean
    hideErrorIcon?: boolean
}

export interface DeploymentConfigurationsRes extends ResponseType {
    result?: DeploymentTemplateList[]
}

export interface DeploymentHistorySingleValue {
    displayName: string
    value: string
    variableSnapshot?: object
    resolvedValue?: string
}
export interface DeploymentHistoryDetail {
    componentName?: string
    values: Record<string, DeploymentHistorySingleValue>
    codeEditorValue: DeploymentHistorySingleValue
}

export interface DeploymentTemplateHistoryType {
    currentConfiguration: DeploymentHistoryDetail
    baseTemplateConfiguration: DeploymentHistoryDetail
    previousConfigAvailable: boolean
    isUnpublished?: boolean
    isDeleteDraft?: boolean
    rootClassName?: string
    comparisonBodyClassName?: string
    sortOrder?: SortingOrder
}
export interface DeploymentHistoryDetailRes extends ResponseType {
    result?: DeploymentHistoryDetail
}

export interface HistoryDiffSelectorList {
    id: number
    deployedOn: string
    deployedBy: string
    deploymentStatus: string
    wfrId?: number
    runSource?: RunSourceType
}

export interface HistoryDiffSelectorRes {
    result?: HistoryDiffSelectorList[]
}

export interface DeploymentHistorySidebarType {
    deploymentHistoryList: DeploymentTemplateList[]
    setDeploymentHistoryList: React.Dispatch<React.SetStateAction<DeploymentTemplateList[]>>
}

export interface AppStatusDetailsChartType {
    filterRemoveHealth?: boolean
    showFooter: boolean
}

export interface StatusFilterButtonType {
    nodes: Array<Node>
    handleFilterClick?: (selectedFilter: string) => void
}

export enum NodeStatus {
    Degraded = 'degraded',
    Healthy = 'healthy',
    Progressing = 'progressing',
    Missing = 'missing',
    Suspended = 'suspended',
    Unknown = 'unknown',
}

type NodesMap = {
    [key in NodeType]?: Map<string, any>
}

type Aggregation = {
    [key in AggregationKeys]: NodesMap
}

export interface AggregatedNodes {
    nodes: NodesMap
    aggregation: Aggregation
    statusCount: {
        [status: string]: number
    }
    nodeStatusCount: {
        [node in NodeType]?: {
            [status: string]: number
        }
    }
    aggregatorStatusCount: {
        [aggregator in AggregationKeys]?: {
            [status: string]: number
        }
    }
}

export interface PodMetadatum {
    name: string
    uid: string
    containers: string[]
    isNew: boolean
}

export const STATUS_SORTING_ORDER = {
    [NodeStatus.Missing]: 1,
    [NodeStatus.Degraded]: 2,
    [NodeStatus.Progressing]: 3,
    [NodeStatus.Healthy]: 4,
}

export interface TriggerDetailsResponseType extends ResponseType {
    result?: History
}

export interface ScrollerType {
    scrollToTop: (e: any) => void
    scrollToBottom: (e: any) => void
    style: CSSProperties
}

export interface GitChangesType extends Pick<History, 'promotionApprovalMetadata'> {
    gitTriggers: Map<number, GitTriggers>
    ciMaterials: CiMaterial[]
    artifact?: string
    userApprovalMetadata?: UserApprovalMetadataType
    triggeredByEmail?: string
    imageComment?: ImageComment
    imageReleaseTags?: ReleaseTag[]
    artifactId?: number
    ciPipelineId?: number
    appReleaseTagNames?: string[]
    tagsEditable?: boolean
    hideImageTaggingHardDelete?: boolean
    appliedFilters?: FilterConditionsListType[]
    appliedFiltersTimestamp?: string
    selectedEnvironmentName?: string
    renderCIListHeader: (renderCIListHeaderProps: RenderCIListHeaderProps) => JSX.Element
}

export interface ArtifactType {
    status: string
    artifact: string
    blobStorageEnabled: boolean
    isArtifactUploaded?: boolean
    downloadArtifactUrl?: string
    isJobCI?: boolean
    ciPipelineId?: number
    artifactId?: number
    imageComment?: ImageComment
    imageReleaseTags?: ReleaseTag[]
    appReleaseTagNames?: string[]
    tagsEditable?: boolean
    hideImageTaggingHardDelete?: boolean
    rootClassName?: string
    renderCIListHeader: (renderCIListHeaderProps: RenderCIListHeaderProps) => JSX.Element
}

export interface CIListItemType extends Pick<GitChangesType, 'promotionApprovalMetadata' | 'selectedEnvironmentName'> {
    type: 'report' | 'artifact' | 'deployed-artifact'
    userApprovalMetadata?: UserApprovalMetadataType
    triggeredBy?: string
    children: any
    ciPipelineId?: number
    artifactId?: number
    imageComment?: ImageComment
    imageReleaseTags?: ReleaseTag[]
    appReleaseTagNames?: string[]
    tagsEditable?: boolean
    hideImageTaggingHardDelete?: boolean
    appliedFilters?: FilterConditionsListType[]
    appliedFiltersTimestamp?: string
    isSuperAdmin?: boolean
    renderCIListHeader: (renderCIListHeaderProps: RenderCIListHeaderProps) => JSX.Element
}

export interface DeploymentHistory {
    id: number
    cd_workflow_id: number
    name: string
    status: string
    pod_status: string
    message: string
    started_on: string
    finished_on: string
    pipeline_id: number
    namespace: string
    log_file_path: string
    triggered_by: number
    email_id?: string
    image: string
    workflow_type?: string
    imageComment?: ImageComment
    imageReleaseTags?: ReleaseTag[]
    ci_artifact_id?: number
    runSource?: RunSourceType
}

type DeploymentStrategyType = 'CANARY' | 'ROLLING' | 'RECREATE' | 'BLUE_GREEN'

export interface DeploymentStrategy {
    deploymentTemplate: DeploymentStrategyType
    config: any
    default: boolean
}

interface PrePostStage {
    triggerType: 'AUTOMATIC' | 'MANUAL'
    name: string
    config: string
}

interface CDPipeline {
    id: number
    environmentId: number
    environmentName: string
    description: string
    ciPipelineId: number
    triggerType: string
    name: string
    strategies: DeploymentStrategy[]
    deploymentTemplate: string
    preStage: PrePostStage
    postStage: PrePostStage
    preStageConfigMapSecretNames: { configMaps: string[]; secrets: string[] }
    postStageConfigMapSecretNames: { configMaps: string[]; secrets: string[] }
    runPreStageInEnv: boolean
    runPostStageInEnv: boolean
    isClusterCdActive: boolean
    deploymentAppType?: DeploymentAppTypes
    isDeploymentBlocked?: boolean
}

export interface CDPipelines {
    pipelines: CDPipeline[]
}

export interface ModuleConfigResponse extends ResponseType {
    result?: {
        enabled: boolean
    }
}

export interface DeploymentHistoryBaseParamsType {
    appId: string
    envId: string
    pipelineId: string
}

export interface TriggerHistoryParamsType {
    appId: number
    envId: number
    pagination: Pick<PaginationProps, 'offset' | 'size'>
    releaseId?: number
    showCurrentReleaseDeployments?: boolean
}

export interface TriggerHistoryFilterCriteriaProps {
    appId: number
    envId: number
    releaseId: number
    showCurrentReleaseDeployments: boolean
}

export enum StageStatusType {
    SUCCESS = 'Success',
    FAILURE = 'Failure',
    /**
     * Not given in API response
     */
    PROGRESSING = 'Progressing',
}

export interface StageInfoDTO {
    stage: string
    startTime: string
    endTime?: string
    status?: StageStatusType
}

export interface StageDetailType extends Pick<StageInfoDTO, 'stage' | 'startTime' | 'endTime' | 'status'> {
    logs: string[]
    isOpen: boolean
}

export interface LogStageAccordionProps extends StageDetailType, Pick<LogsRendererType, 'fullScreenView'> {
    handleStageClose: (index: number) => void
    handleStageOpen: (index: number) => void
    stageIndex: number
    /**
     * A stage is loading if it is last in current stage list and event is not closed
     */
    isLoading: boolean
    searchIndex: string
}

export interface CreateMarkupReturnType {
    __html: string
    isSearchKeyPresent: boolean
}

export type CreateMarkupPropsType =
    | {
          log: string
          currentIndex?: never
          targetSearchKey?: never
          searchMatchResults?: never
          searchIndex?: never
      }
    | {
          log: string
          currentIndex: number
          targetSearchKey: string
          searchMatchResults: string[]
          searchIndex: string
      }

export type TriggerHistoryFilterCriteriaType = `${string}|${string}|${string}`[]
export const terminalStatus = new Set(['error', 'healthy', 'succeeded', 'cancelled', 'failed', 'aborted'])
export const statusSet = new Set(['starting', 'running', 'pending'])
