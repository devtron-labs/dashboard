import React, { CSSProperties } from 'react'
import { UserApprovalMetadataType, ReleaseTag, FilterConditionsListType, GitTriggers, PromotionApprovalMetadataType } from '@devtron-labs/devtron-fe-common-lib'
import { TERMINAL_STATUS_MAP } from '../../../../config'
import { OptionType } from '../../types'

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
}

export interface CiMaterial {
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

export interface ArtifactType {
    status: string
    artifact: string
    blobStorageEnabled: boolean
    isArtifactUploaded?: boolean
    getArtifactPromise?: () => Promise<any>
    isJobView?: boolean
    isJobCI?: boolean
    type: HistoryComponentType
    ciPipelineId?: number
    artifactId?: number
    imageComment?: ImageComment
    imageReleaseTags?: ReleaseTag[]
    appReleaseTagNames?: string[]
    tagsEditable?: boolean
    hideImageTaggingHardDelete?: boolean
    jobCIClass?: string
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
}

export interface ImageComment {
    id: number
    comment: string
    artifactId: number
}

export interface LogsRendererType {
    triggerDetails: History
    isBlobStorageConfigured: boolean
    parentType: HistoryComponentType
}

export interface LogResizeButtonType {
    fullScreenView: boolean
    setFullScreenView: React.Dispatch<React.SetStateAction<boolean>>
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
}
export interface EmptyViewType {
    imgSrc?: string
    title: string
    subTitle: string
    link?: string
    linkText?: string
}

export interface SidebarType {
    type: HistoryComponentType
    filterOptions: CICDSidebarFilterOptionType[]
    triggerHistory: Map<number, History>
    hasMore: boolean
    setPagination: React.Dispatch<React.SetStateAction<{ offset: number; size: number }>>
    fetchIdData?: FetchIdDataStatus
    handleViewAllHistory?: () => void
}

export interface HistorySummaryCardType {
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
}

export interface SummaryTooltipCardType {
    status: string
    startedOn: string
    triggeredBy: number
    triggeredByEmail: string
    ciMaterials: CiMaterial[]
    gitTriggers: Map<number, GitTriggers>
}

export interface TriggerDetailsType {
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
}

export interface TriggerDetailsStatusIconType {
    status: string
    isDeploymentWindowInfo?: boolean
}

export interface FinishedType {
    status: string
    finishedOn: string
    artifact: string
    type: HistoryComponentType
}
export interface WorkerStatusType {
    message: string
    podStatus: string
    stage: DeploymentStageType
    finishedOn?: string
    workerPodName?: string
}
export interface ProgressingStatusType {
    status: string
    message: string
    podStatus: string
    stage: DeploymentStageType
    type: HistoryComponentType
    finishedOn?: string
    workerPodName?: string
}

export interface CurrentStatusType {
    status: string
    finishedOn: string
    artifact: string
    message: string
    podStatus: string
    stage: DeploymentStageType
    type: HistoryComponentType
    isJobView?: boolean
    workerPodName?: string
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
}

export interface CICDSidebarFilterOptionType extends OptionType {
    pipelineId: number
    pipelineType?: string
    deploymentAppDeleteRequest?: boolean
}

export enum HistoryComponentType {
    CI = 'CI',
    CD = 'CD',
    GROUP_CI = 'GROUP_CI',
    GROUP_CD = 'GROUP_CD',
}

export enum DeploymentStageType {
    PRE = 'PRE',
    DEPLOY = 'DEPLOY',
    POST = 'POST',
}

export enum FetchIdDataStatus {
    SUCCESS = 'SUCCESS',
    FETCHING = 'FETCHING',
    SUSPEND = 'SUSPEND',
}

export const TERMINAL_STATUS_COLOR_CLASS_MAP = {
    [TERMINAL_STATUS_MAP.SUCCEEDED]: 'cg-5',
    [TERMINAL_STATUS_MAP.HEALTHY]: 'cg-5',
    [TERMINAL_STATUS_MAP.FAILED]: 'cr-5',
    [TERMINAL_STATUS_MAP.ERROR]: 'cr-5',
}

export const PROGRESSING_STATUS = {
    [TERMINAL_STATUS_MAP.RUNNING]: 'running',
    [TERMINAL_STATUS_MAP.PROGRESSING]: 'progressing',
    [TERMINAL_STATUS_MAP.STARTING]: 'starting',
    [TERMINAL_STATUS_MAP.INITIATING]: 'initiating',
    [TERMINAL_STATUS_MAP.QUEUED]: 'queued',
}
