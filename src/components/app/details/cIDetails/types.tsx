import { FetchIdDataStatus, History } from '../cicdHistory/types'

export interface CIPipeline {
    name: string
    id: number
    parentCiPipeline: number
    parentAppId: number
    pipelineType: string
}
export interface BuildDetails {
    triggerHistory: Map<number, History>
    fullScreenView: boolean
    synchroniseState: (triggerId: number, triggerDetails: History, triggerDetailsError: any) => void
    isSecurityModuleInstalled: boolean
    isBlobStorageConfigured: boolean
    isJobView?: boolean
    appIdFromParent?: string
    appReleaseTags?: []
    tagsEditable: boolean
    hideImageTaggingHardDelete: boolean
    fetchIdData: FetchIdDataStatus
}

export interface HistoryLogsType {
    triggerDetails: History
    isBlobStorageConfigured?: boolean
    isJobView?: boolean
    appIdFromParent?: string
    appReleaseTags?: []
    tagsEditable: boolean
    hideImageTaggingHardDelete: boolean
}

export interface SecurityTabType {
    ciPipelineId: number
    artifactId: number
    status: string
    appIdFromParent?: string
}
