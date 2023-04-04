import { RouteComponentProps } from 'react-router-dom'
import { ResponseType } from '@devtron-labs/devtron-fe-common-lib'
import { ActionResponse } from '../../external-apps/ExternalAppService'
import React from "react";

export enum ModuleStatus {
    HEALTHY = 'healthy',
    NONE = 'none',
    UNKNOWN = 'unknown',
    UPGRADING = 'upgrading',
    UPGRADE_FAILED = 'upgradeFailed',
    //Module Status
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
}

export interface ModuleInfoResponse extends ResponseType {
    result?: ModuleInfo
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
