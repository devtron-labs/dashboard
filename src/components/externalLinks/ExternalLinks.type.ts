import React from 'react'
import { ResponseType } from '../../services/service.types'
import { AppDetails, OptionType } from '../app/types'
import { ActionResponse } from '../external-apps/ExternalAppService'
import { AppDetails as HelmAppDetails } from '../v2/appDetails/appDetails.type'

export interface OptionTypeWithIcon {
    label: string
    value: any
    icon: string
    category?: number
}

export interface IdentifierOptionType {
    label: string
    value: any
    type: ExternalLinkIdentifierType
}

export interface MonitoringTool {
    id: number
    name: string
    icon: string
    category: number
}

export interface ExternalLinkIdentifierProps {
    type: string
    identifier: string
    clusterId: number
}

export interface ExternalLink {
    id?: number
    monitoringToolId: number
    name: string
    description: string
    url: string
    updatedOn?: string
    type: ExternalLinkScopeType
    identifiers: ExternalLinkIdentifierProps[]
    isEditable: boolean
}

export interface LinkAction {
    tool: OptionTypeWithIcon
    invalidTool?: boolean
    name: string
    invalidName?: boolean
    description: string
    identifiers: IdentifierOptionType[]
    invalidIdentifiers?: boolean
    urlTemplate: string
    invalidUrlTemplate?: boolean
    invalidProtocol?: boolean
    type: ExternalLinkScopeType
    isEditable: boolean
}

export interface ConfigureLinkActionType {
    index: number
    link: LinkAction
    showDelete: boolean
    clusters: IdentifierOptionType[]
    allApps: IdentifierOptionType[]
    selectedIdentifiers: IdentifierOptionType[]
    toolGroupedOptions: { label: string; options: OptionTypeWithIcon[] }[]
    onToolSelection: (key: number, selected: OptionTypeWithIcon) => void
    handleLinksDataActions: (
        action: string,
        key?: number,
        value?: OptionTypeWithIcon | OptionType[] | string | boolean | ExternalLinkScopeType,
    ) => void
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
    url: string
}

export interface AppliedClustersType {
    appliedClusters: OptionType[]
    setAppliedClusters: React.Dispatch<React.SetStateAction<OptionType[]>>
}

export interface ClusterFilterType extends AppliedClustersType, URLModificationType {
    clusters: OptionType[]
}

export interface AddExternalLinkType {
    monitoringTools: OptionTypeWithIcon[]
    clusters: IdentifierOptionType[]
    allApps: IdentifierOptionType[]
    handleDialogVisibility: () => void
    selectedLink: ExternalLink
    setExternalLinks: React.Dispatch<React.SetStateAction<ExternalLink[]>>
}

export interface DeleteExternalLinkType {
    selectedLink: ExternalLink
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
    isOverviewPage?: boolean
}

export interface NodeLevelExternalLinksType {
    appDetails?: AppDetails
    helmAppDetails?: HelmAppDetails
    nodeLevelExternalLinks: OptionTypeWithIcon[]
    podName?: string
    containerName?: string
    addExtraSpace?: boolean
}

export interface ExternalLinksAndToolsType {
    fetchingExternalLinks?: boolean
    externalLinks: ExternalLink[]
    monitoringTools: OptionTypeWithIcon[]
}

export enum ExternalLinkIdentifierType {
    DevtronApp = 'devtron-app',
    DevtronInstalledApp = 'devtron-installed-app',
    ExternalHelmApp = 'external-helm-app',
    AllApps = 'all-apps',
    Cluster = 'cluster',
}

export enum ExternalLinkScopeType {
    AppLevel = 'appLevel',
    ClusterLevel = 'clusterLevel',
}

export interface GetAllAppType {
    type: string
    appName: string
    appId: number
}

export interface GetAllAppResponseType extends ResponseType {
    result?: GetAllAppType[]
}
