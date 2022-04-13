import React from "react"
import { MultiValue } from "react-select"
import { ResponseType } from "../../services/service.types"
import { AppDetails, OptionType } from "../app/types"
import { ActionResponse } from "../external-apps/ExternalAppService"
import { AppDetails as HelmAppDetails } from "../v2/appDetails/appDetails.type"

export interface OptionTypeWithIcon {
    label: string
    value: any
    icon: string
}

export interface MonitoringTool {
    id: number
    name: string
    icon: string
}

export interface ExternalLink {
    id?: number
    monitoringToolId: number
    name: string
    url: string
    clusterIds: string[]
}

export interface LinkAction {
    tool: OptionTypeWithIcon
    invalidTool?: boolean
    name: string
    invalidName?: boolean
    clusters: MultiValue<OptionType>
    invalidClusters?: boolean
    urlTemplate: string
    invalidUrlTemplate?: boolean
}

export interface ConfigureLinkActionType {
    index: number
    link: LinkAction
    showDelete: boolean
    clusters: MultiValue<OptionType>
    selectedClusters: MultiValue<OptionType>
    monitoringTools: MultiValue<OptionTypeWithIcon>
    onMonitoringToolSelection: (key: number, selected: OptionType) => void
    onClusterSelection: (key: number, selected: MultiValue<OptionType>) => void
    onNameChange: (key: number, name: string) => void,
    onUrlTemplateChange: (key: number, urlTemplate: string) => void,
    deleteLinkData: (key: number) => void
}

export interface MonitoringToolResponse extends ResponseType {
    result?: MonitoringTool[]
}

export interface ExternalLinkResponse extends ResponseType {
    result?: ExternalLink[]
}

export interface ExternalLinkUpdateResponse extends ResponseType {
    result?: ActionResponse
}

export interface URLModificationType {
    queryParams: URLSearchParams
    history: any
}

export interface AppliedClustersType {
    appliedClusters: MultiValue<OptionType>
    setAppliedClusters: React.Dispatch<React.SetStateAction<MultiValue<OptionType>>>
}

export interface ClusterFilterType extends AppliedClustersType, URLModificationType {
    clusters: MultiValue<OptionType>
}

export interface AddExternalLinkType {
    monitoringTools: MultiValue<OptionTypeWithIcon>
    clusters: MultiValue<OptionType>
    handleDialogVisibility: () => void
    selectedLink: ExternalLink
    externalLinks: ExternalLink[]
    setExternalLinks: React.Dispatch<React.SetStateAction<ExternalLink[]>>
}

export interface DeleteExternalLinkType  {
    selectedLink: ExternalLink
    externalLinks: ExternalLink[]
    isAPICallInProgress: boolean
    setAPICallInProgress: React.Dispatch<React.SetStateAction<boolean>>
    setExternalLinks: React.Dispatch<React.SetStateAction<ExternalLink[]>>
    setShowDeleteConfirmation: React.Dispatch<React.SetStateAction<boolean>>
}

export interface AppliedFilterChipsType extends AppliedClustersType, URLModificationType {}

export interface AppLevelExternalLinksType {
    appDetails?: AppDetails
    helmAppDetails?: HelmAppDetails
    externalLinks: ExternalLink[]
    monitoringTools: OptionTypeWithIcon[]
}

export interface NodeLevelExternalLinksType  {
    appDetails?: AppDetails
    helmAppDetails?: HelmAppDetails
    nodeLevelExternalLinks: OptionTypeWithIcon[]
    podName?: string
    containerName?: string
    addExtraSpace?: boolean
}
