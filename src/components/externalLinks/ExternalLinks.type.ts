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

import React, { ReactElement } from 'react'
import { ResponseType } from '@devtron-labs/devtron-fe-common-lib'
import { AppDetails } from '../app/types'
import { ActionResponse } from '../external-apps/ExternalAppService'
import { AppDetails as HelmAppDetails } from '../v2/appDetails/appDetails.type'
import { UserRoleType } from '../../Pages/GlobalConfigurations/Authorization/constants'

export interface OptionTypeWithIcon {
    label: string
    value: number | string
    startIcon?: ReactElement
    category?: number
    description?: string
    icon?: string
}

export interface IdentifierOptionType {
    label: string
    value: any
    type?: ExternalLinkIdentifierType
}

export interface MonitoringTool {
    id: number
    name: string
    icon: string
    category: number
}

export interface ExternalLinksProps {
    isAppConfigView?: boolean
    userRole?: UserRoleType
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
    isFullMode: boolean
    isAppConfigView: boolean
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
        value?: OptionTypeWithIcon | IdentifierOptionType[] | string | boolean | ExternalLinkScopeType | LinkAction,
    ) => void
}

export interface ExternalLinkResponse extends ResponseType {
    result?: {
        ExternalLinks: ExternalLink[]
        Tools: MonitoringTool[]
    }
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
    appliedClusters: IdentifierOptionType[]
    setAppliedClusters: React.Dispatch<React.SetStateAction<IdentifierOptionType[]>>
}

export interface AppliedApplicationsType {
    appliedApps: IdentifierOptionType[]
    setAppliedApps: React.Dispatch<React.SetStateAction<IdentifierOptionType[]>>
}

export interface ClusterFilterType extends AppliedClustersType, URLModificationType {
    clusters: IdentifierOptionType[]
}

export interface ApplicationFilterType extends AppliedApplicationsType, URLModificationType {
    allApps: IdentifierOptionType[]
}

export interface AddExternalLinkType {
    appId: string
    isFullMode: boolean
    isAppConfigView: boolean
    monitoringTools: OptionTypeWithIcon[]
    clusters: IdentifierOptionType[]
    allApps: IdentifierOptionType[]
    handleDialogVisibility: () => void
    selectedLink: ExternalLink
    setExternalLinks: React.Dispatch<React.SetStateAction<ExternalLink[]>>
}

export interface DeleteExternalLinkType {
    appId: string
    isAppConfigView: boolean
    selectedLink: ExternalLink
    isAPICallInProgress: boolean
    setAPICallInProgress: React.Dispatch<React.SetStateAction<boolean>>
    setExternalLinks: React.Dispatch<React.SetStateAction<ExternalLink[]>>
    setShowDeleteConfirmation: React.Dispatch<React.SetStateAction<boolean>>
}

export interface AppliedFilterChipsType extends AppliedClustersType, AppliedApplicationsType, URLModificationType {}

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

export interface RoleBasedInfoNoteProps {
    userRole: UserRoleType
    listingView?: boolean
}

export interface IdentifierSelectorProps {
    isFullMode: boolean
    index: number
    link: LinkAction
    selectedIdentifiers: IdentifierOptionType[]
    clusters: IdentifierOptionType[]
    allApps: IdentifierOptionType[]
    handleLinksDataActions: (
        action: string,
        key?: number,
        value?: OptionTypeWithIcon | IdentifierOptionType[] | string | boolean | ExternalLinkScopeType | LinkAction,
    ) => void
    getErrorLabel: (field: string, type?: string) => JSX.Element
}

export enum LinkValidationKeys {
    name = 'name',
    identifiers = 'identifiers',
    urlTemplate = 'urlTemplate',
}
