import { CSSProperties } from 'react'
import { TERMINAL_STATUS_MAP } from '../../../../config'
import { OptionType } from '../../types'
import { UserApprovalMetadataType } from '@devtron-labs/devtron-fe-common-lib'
export interface WebHookData {
    Id: number
    EventActionType: string
    Data: any
}

export interface History {
    id: number
    name: string
    status: string
    podStatus: string
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
    imageComment?: ImageComment
    imageReleaseTags?: ReleaseTag[] 
    appReleaseTagNames?: string[]
    tagsEditable?: boolean
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

export interface GitTriggers {
    Commit: string
    Author: string
    Date: Date | string
    Message: string
    Changes: string[]
    WebhookData: WebHookData
    GitRepoUrl: string
    GitRepoName: string
    CiConfigureSourceType: string
    CiConfigureSourceValue: string
}

export interface ArtifactType {
    status: string
    artifact: string
    blobStorageEnabled: boolean
    isArtifactUploaded?: boolean
    getArtifactPromise?: () => Promise<any>
    isJobView?: boolean
    type: HistoryComponentType
    ciPipelineId?: number
    artifactId?: number
    imageComment?: ImageComment
    imageReleaseTags?: ReleaseTag[] 
    appReleaseTagNames?: string[]
    tagsEditable?: boolean
}

export interface CopyTippyWithTextType {
    copyText: string
    copied: boolean
    setCopied: React.Dispatch<React.SetStateAction<boolean>>
}

export interface CIListItemType {
    type: 'report' | 'artifact' | 'approved-artifact'
    userApprovalMetadata?: UserApprovalMetadataType
    triggeredBy?: string
    children: any
    ciPipelineId?: number
    artifactId?: number
    imageComment?: ImageComment
    imageReleaseTags?: ReleaseTag[] 
    appReleaseTagNames?: string[]
    tagsEditable?: boolean
}

export interface ReleaseTag {
    id: number
    tagName: string
    appId: number
    deleted: boolean
    artifactId: number
}

export interface ImageComment {
    id: number
    comment: string
    artifactId: number
}


export interface ImageTagType {
    ciPipelineId?: number
    artifactId?: number
    imageComment?: ImageComment
    imageReleaseTags?: ReleaseTag[] 
    appReleaseTagNames?: string[]
    tagsEditable?: boolean
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

export interface GitChangesType {
    gitTriggers: Map<number, GitTriggers>
    ciMaterials: CiMaterial[]
    artifact?: string
    userApprovalMetadata?: UserApprovalMetadataType
    triggeredByEmail?: string
    imageComment?: ImageComment
    imageReleaseTags?: ReleaseTag[]
    artifactId?: number
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
}

export interface TriggerDetailsStatusIconType {
    status: string
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
}
export interface ProgressingStatusType {
    status: string
    message: string
    podStatus: string
    stage: DeploymentStageType
    type: HistoryComponentType
}

export interface CurrentStatusType {
    status: string
    finishedOn: string
    artifact: string
    message: string
    podStatus: string
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
}

export interface CICDSidebarFilterOptionType extends OptionType {
    pipelineId: number
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
}
