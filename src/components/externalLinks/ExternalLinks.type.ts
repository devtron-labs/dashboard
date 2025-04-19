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

import React, { ImgHTMLAttributes, ReactElement, ReactNode } from 'react'

import { AppDetails as CommonAppDetails, ResponseType, UseUrlFiltersProps } from '@devtron-labs/devtron-fe-common-lib'

import { UserRoleType } from '../../Pages/GlobalConfigurations/Authorization/constants'
import { AppDetails } from '../app/types'
import { ActionResponse } from '../external-apps/ExternalAppService'
import { AppDetails as HelmAppDetails } from '../v2/appDetails/appDetails.type'

export interface OptionTypeWithIcon {
    label: string
    value: number | string
    startIcon?: ReactElement
    category?: number
    description?: string
    icon?: string
    openInNewTab?: boolean
}

export interface ExpandedExternalLink extends OptionTypeWithIcon {
    externalLinkURL: string
}

export interface IdentifierOptionType {
    label: string
    value: string
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
    appId?: number
}

export interface ExternalLink extends Pick<OptionTypeWithIcon, 'openInNewTab'> {
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

export interface LinkAction extends Pick<OptionTypeWithIcon, 'openInNewTab'> {
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

export interface ConfigureLinkActionType extends Pick<ExternalLinksProps, 'isAppConfigView'> {
    isFullMode: boolean
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

export interface AddExternalLinkType extends Pick<ExternalLinksProps, 'isAppConfigView'> {
    appId: string
    isFullMode: boolean
    monitoringTools: OptionTypeWithIcon[]
    clusters: IdentifierOptionType[]
    allApps: IdentifierOptionType[]
    handleDialogVisibility: () => void
    selectedLink: ExternalLink
    setExternalLinks: React.Dispatch<React.SetStateAction<ExternalLink[]>>
}

export interface AppliedFilterChipsType extends AppliedClustersType, AppliedApplicationsType, URLModificationType {}

export interface AppLevelExternalLinksType extends Pick<AddExternalLinkType, 'monitoringTools'> {
    appDetails?: AppDetails
    helmAppDetails?: HelmAppDetails
    externalLinks: ExternalLink[]
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

export interface ExternalLinksAndToolsType extends Pick<AddExternalLinkType, 'monitoringTools'> {
    fetchingExternalLinks?: boolean
    externalLinks: ExternalLink[]
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
    getErrorLabel: (field: string, type?: string) => ReactNode
}

export enum LinkValidationKeys {
    name = 'name',
    identifiers = 'identifiers',
    urlTemplate = 'urlTemplate',
}

export interface ExternalLinkFallbackImageProps extends Pick<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
    dimension: number
}

export interface ExternalLinkChipProps {
    linkOption: OptionTypeWithIcon
    idx: number
    details: AppDetails | CommonAppDetails
    handleOpenModal: (linkOption: OptionTypeWithIcon, externalLinkURL: string) => void
    isOverviewPage: boolean
}

export interface AddLinkButtonProps {
    handleOnClick: () => void
}

export interface ExternalLinkListProps
    extends Pick<ExternalLinksProps, 'isAppConfigView'>,
        Pick<AddExternalLinkType, 'monitoringTools'> {
    filteredExternalLinks: ExternalLink[]
    setSelectedLink: React.Dispatch<React.SetStateAction<ExternalLink>>
    setShowDeleteDialog: React.Dispatch<React.SetStateAction<boolean>>
    setShowAddLinkDialog: React.Dispatch<React.SetStateAction<boolean>>
    isLoading: boolean
}

/**
 * External Link List Filters
 */
export const enum ExternalLinkFilters {
    CLUSTERS = 'clusters',
    APPS = 'apps',
}

export interface ExternalListUrlFiltersType extends Record<ExternalLinkFilters, string[]> {}

export const enum ExternalLinkMapListSortableKeys {
    linkName = 'linkName',
}

export const parseSearchParams = (searchParams: URLSearchParams) => ({
    [ExternalLinkFilters.CLUSTERS]: searchParams.getAll(ExternalLinkFilters.CLUSTERS),
    [ExternalLinkFilters.APPS]: searchParams.getAll(ExternalLinkFilters.APPS),
})

export interface ExternalLinkFiltersProps {
    allApps: IdentifierOptionType[]
    updateSearchParams: (
        paramsToSerialize: Partial<ExternalListUrlFiltersType>,
        options?: Partial<
            Pick<UseUrlFiltersProps<ExternalLinkMapListSortableKeys, ExternalListUrlFiltersType>, 'redirectionMethod'>
        >,
    ) => void
    isFullMode: boolean
    clusterList: IdentifierOptionType[]
    clusters: string[]
    apps: string[]
}

export interface NoExternalLinkViewProps {
    handleAddLinkClick: () => void
    isAppConfigView: boolean
    userRole: UserRoleType
}
