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
import { ResponseType } from '@devtron-labs/devtron-fe-common-lib'
import React from 'react'
import { ActionResponse } from '../../external-apps/ExternalAppService'

/**
 * @deprecated Use from fe-common-lib
 */
export enum ModuleStatus {
    HEALTHY = 'healthy',
    NONE = 'none',
    UNKNOWN = 'unknown',
    UPGRADING = 'upgrading',
    UPGRADE_FAILED = 'upgradeFailed',
    // Module Status
    INSTALLED = 'installed',
    INSTALLING = 'installing',
    INSTALL_FAILED = 'installFailed',
    NOT_INSTALLED = 'notInstalled',
    TIMEOUT = 'timeout',
}

export enum ModuleActions {
    INSTALL = 'install',
    UPGRADE = 'upgrade',
}

export enum InstallationType {
    OSS_KUBECTL = 'oss_kubectl',
    OSS_HELM = 'oss_helm',
    ENTERPRISE = 'enterprise',
}

export interface StackDetailsType {
    isLoading: boolean
    discoverModulesList: ModuleDetails[]
    installedModulesList: ModuleDetails[]
    releaseNotes: ReleaseNotes[]
    errorStatusCode: number
}
export interface ModuleEnableType {
    moduleDetails: ModuleDetails
    setDialog?: React.Dispatch<React.SetStateAction<boolean>>
    retryState?: boolean
    setRetryState?: React.Dispatch<React.SetStateAction<boolean>>
    setToggled?: React.Dispatch<React.SetStateAction<boolean>>
    setSuccessState?: React.Dispatch<React.SetStateAction<boolean>>
    moduleNotEnabledState?: React.Dispatch<React.SetStateAction<boolean>>
}

export interface SuccessModalType {
    moduleDetails: ModuleDetails
    setSuccessState: React.Dispatch<React.SetStateAction<boolean>>
    setSelectedModule?: React.Dispatch<React.SetStateAction<ModuleDetails>>
    setStackDetails?: React.Dispatch<React.SetStateAction<StackDetailsType>>
    stackDetails?: StackDetailsType
    setToggled?: React.Dispatch<React.SetStateAction<boolean>>
}

export interface StackManagerNavItemType {
    installedModulesCount: number
    installationStatus: ModuleStatus
    currentVersion: string
    newVersion: string
    handleTabChange: (tabIndex: number) => void
    showInitializing: boolean
    showVersionInfo: boolean
}

export interface StackManagerNavLinkType {
    name: string
    href: string
    icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
    className: string
}

export interface StackManagerPageHeaderType {
    detailsMode: string
    selectedModule: ModuleDetails
    handleBreadcrumbClick: () => void
}

export interface ModuleDetails {
    id: string
    name: string
    info: string
    icon: string
    installationStatus: ModuleStatus
    description?: string
    title?: string
    isIncludedInLegacyFullPackage?: boolean
    assets?: string[]
    dependentModules?: number[]
    baseMinVersionSupported?: string
    isModuleConfigurable?: boolean
    isModuleConfigured?: boolean
    moduleResourcesStatus?: ModuleResourceStatus[]
    enabled?: boolean
    moduleType?: string
}

export interface ModuleResourceStatus {
    group: string
    version: string
    kind: string
    name: string
    healthStatus: string
    healthMessage: string
}

export interface ModuleListingViewType {
    modulesList: ModuleDetails[]
    isDiscoverModulesView?: boolean
    handleModuleCardClick: (moduleDetails: ModuleDetails, fromDiscoverModules: boolean) => void
}

export interface ModuleDetailsViewType {
    modulesList: ModuleDetails[]
    moduleDetails: ModuleDetails
    setDetailsMode: React.Dispatch<React.SetStateAction<string>>
    serverInfo: ServerInfo
    upgradeVersion: string
    logPodName?: string
    fromDiscoverModules?: boolean
    isActionTriggered: boolean
    handleActionTrigger: (actionName: string, actionState: boolean) => void
    history: RouteComponentProps['history']
    location: RouteComponentProps['location']
    setShowResourceStatusModal: React.Dispatch<React.SetStateAction<boolean>>
    isSuperAdmin?: boolean
    setSelectedModule?: React.Dispatch<React.SetStateAction<ModuleDetails>>
    setStackDetails?: React.Dispatch<React.SetStateAction<StackDetailsType>>
    stackDetails?: StackDetailsType
    dialog?: boolean
    setDialog?: React.Dispatch<React.SetStateAction<boolean>>
    retryState?: boolean
    setRetryState?: React.Dispatch<React.SetStateAction<boolean>>
    successState?: boolean
    setSuccessState?: React.Dispatch<React.SetStateAction<boolean>>
    toggled?: boolean
    setToggled?: React.Dispatch<React.SetStateAction<boolean>>
}

export interface ModuleInstallationStatusType {
    installationStatus: ModuleStatus
    appName?: string
    canViewLogs?: boolean
    logPodName?: string
    isUpgradeView?: boolean
    latestVersionAvailable: boolean
    isCICDModule?: boolean
    moduleDetails?: ModuleDetails
    setShowResourceStatusModal?: React.Dispatch<React.SetStateAction<boolean>>
    isSuperAdmin?: boolean
    setSelectedModule?: React.Dispatch<React.SetStateAction<ModuleDetails>>
    setStackDetails?: React.Dispatch<React.SetStateAction<StackDetailsType>>
    stackDetails?: StackDetailsType
    dialog?: boolean
    setDialog?: React.Dispatch<React.SetStateAction<boolean>>
    toggled?: boolean
    setToggled?: React.Dispatch<React.SetStateAction<boolean>>
    retryState?: boolean
    setRetryState?: React.Dispatch<React.SetStateAction<boolean>>
    successState?: boolean
    setSuccessState?: React.Dispatch<React.SetStateAction<boolean>>
}

export interface InstallationWrapperType {
    modulesList?: ModuleDetails[]
    moduleDetails?: ModuleDetails
    moduleName?: string
    installationStatus: ModuleStatus
    canViewLogs?: boolean
    logPodName?: string
    serverInfo: ServerInfo
    upgradeVersion: string
    baseMinVersionSupported?: string
    isUpgradeView?: boolean
    isActionTriggered: boolean
    releaseNotes?: ReleaseNotes[]
    updateActionTrigger: (isActionTriggered: boolean) => void
    showPreRequisiteConfirmationModal?: boolean
    setShowPreRequisiteConfirmationModal?: React.Dispatch<React.SetStateAction<boolean>>
    preRequisiteChecked?: boolean
    setPreRequisiteChecked?: React.Dispatch<React.SetStateAction<boolean>>
    setShowResourceStatusModal?: React.Dispatch<React.SetStateAction<boolean>>
    isSuperAdmin?: boolean
    setSelectedModule?: React.Dispatch<React.SetStateAction<ModuleDetails>>
    setStackDetails?: React.Dispatch<React.SetStateAction<StackDetailsType>>
    stackDetails?: StackDetailsType
    dialog?: boolean
    setDialog?: React.Dispatch<React.SetStateAction<boolean>>
    toggled?: boolean
    setToggled?: React.Dispatch<React.SetStateAction<boolean>>
    retryState?: boolean
    setRetryState?: React.Dispatch<React.SetStateAction<boolean>>
    successState?: boolean
    setSuccessState?: React.Dispatch<React.SetStateAction<boolean>>
}

export interface ModuleDetailsInfo {
    name: string
    infoList: string[]
    featuresList: string[]
}

export interface ModuleDetailsCardType {
    moduleDetails: ModuleDetails
    className?: string
    handleModuleCardClick?: (moduleDetails: ModuleDetails, fromDiscoverModules: boolean) => void
    fromDiscoverModules?: boolean
    dataTestId?: string
}

export interface AboutDevtronViewType {
    parentRef: React.MutableRefObject<HTMLElement>
    releaseNotes: ReleaseNotes[]
    serverInfo: ServerInfo
    canViewLogs: boolean
    logPodName: string
    handleTabChange: (tabIndex: number) => void
    selectedTabIndex: number
    isActionTriggered: boolean
    handleActionTrigger: (actionName: string, actionState: boolean) => void
    showPreRequisiteConfirmationModal?: boolean
    setShowPreRequisiteConfirmationModal?: React.Dispatch<React.SetStateAction<boolean>>
    preRequisiteChecked?: boolean
    setPreRequisiteChecked?: React.Dispatch<React.SetStateAction<boolean>>
}

export interface ModuleInfo {
    id: number
    name: string
    status: ModuleStatus
    moduleResourcesStatus?: ModuleResourceStatus[]
    enabled?: boolean
    moduleType?: string
}
export interface ModuleInfoInstalled {
    status: ModuleStatus
}

export interface ModuleInfoResponse extends ResponseType {
    result?: ModuleInfo
}
export interface ModuleInfoInstalledResponse extends ResponseType {
    result?: ModuleInfoInstalled
}

export interface AllModuleInfoResponse extends ResponseType {
    result?: ModuleDetails[]
}

export interface ModuleActionResponse extends ResponseType {
    result?: ActionResponse
}

export interface ServerInfo {
    currentVersion: string
    status: ModuleStatus
    releaseName: string
    installationType: InstallationType
}

export interface ServerInfoResponse extends ResponseType {
    result?: ServerInfo
}

export interface ModuleActionRequest {
    action: ModuleActions
    version: string
    moduleType: string
}

export interface ReleaseNotes {
    tagName: string
    releaseName: string
    createdAt: string
    publishedAt: string
    body: string
    prerequisite: boolean
    prerequisiteMessage: string
    tagLink: string
}

export interface ReleaseNotesResponse extends ResponseType {
    result?: ReleaseNotes[]
}

export interface LogPodName {
    podName: string
}

export interface LogPodNameResponse extends ResponseType {
    result?: LogPodName
}
