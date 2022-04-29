import { ResponseType } from '../../../services/service.types'
import { ActionResponse } from '../../external-apps/ExternalAppService'

export enum ModuleStatus {
    HEALTHY = 'healthy',
    INSTALLED = 'installed',
    INSTALLING = 'installing',
    INSTALL_FAILED = 'installFailed',
    NONE = 'none',
    NOT_INSTALLED = 'notInstalled',
    TIMEOUT = 'timeout',
    UNKNOWN = 'unknown',
    UPGRADING = 'upgrading',
    UPGRADE_FAILED = 'upgradeFailed',
}

export enum ModuleActions {
    INSTALL = 'install',
    UPGRADE = 'upgrade',
}

export interface StackDetailsType {
    isLoading: boolean
    discoverModulesList: ModuleDetails[]
    installedModulesList: ModuleDetails[]
    releaseNotes: ReleaseNotes[]
    logPodName: string
    errorStatusCode: number
}

export interface StackManagerNavItemType {
    installedModulesCount: number
    installationStatus: ModuleStatus
    currentVersion: string
    newVersion: string
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
    baseMinVersionSupported?: string
}

export interface ModuleListingViewType {
    modulesList: ModuleDetails[]
    currentVersion: string
    isDiscoverModulesView?: boolean
    handleModuleCardClick: (moduleDetails: ModuleDetails, fromDiscoverModules: boolean) => void
    history: any
}

export interface ModuleDetailsViewType {
    moduleDetails: ModuleDetails
    setDetailsMode: React.Dispatch<React.SetStateAction<string>>
    setShowManagedByDialog: React.Dispatch<React.SetStateAction<boolean>>
    serverInfo: ServerInfo
    upgradeVersion: string
    logPodName?: string
    fromDiscoverModules?: boolean
    history: any
    location: any
}

export interface ModuleInstallationStatusType {
    installationStatus: ModuleStatus
    appName?: string
    logPodName?: string
    isUpgradeView?: boolean
    upgradeVersion?: string
    latestVersionAvailable: boolean
}

export interface InstallationWrapperType {
    moduleName?: string
    installationStatus: ModuleStatus
    logPodName?: string
    serverInfo: ServerInfo
    upgradeVersion: string
    isUpgradeView?: boolean
    setShowManagedByDialog: React.Dispatch<React.SetStateAction<boolean>>
    history: any
    location: any
}

export interface ModuleDetailsInfo {
    name: string
    infoList: string[]
    featuresList: string[]
}

export interface ModuleDetailsCardType {
    moduleDetails: ModuleDetails
    showBlur?: boolean
    className?: string
    handleModuleCardClick?: (moduleDetails: ModuleDetails, fromDiscoverModules: boolean) => void
    fromDiscoverModules?: boolean
}

export interface AboutDevtronViewType {
    parentRef: React.MutableRefObject<HTMLElement>
    releaseNotes: ReleaseNotes[]
    serverInfo: ServerInfo
    setShowManagedByDialog: React.Dispatch<React.SetStateAction<boolean>>
    logPodName: string
    handleTabChange: (tabIndex: number) => void
    selectedTabIndex: number
    history: any
    location: any
}

export interface ModuleInfo {
    id: number
    name: string
    status?: ModuleStatus
    baseMinVersionSupported?: string
}

export interface ModuleInfoResponse extends ResponseType {
    result?: ModuleInfo
}

export interface AllModuleInfoResponse extends ResponseType {
    result?: ModuleInfo[]
}

export interface ModuleActionResponse extends ResponseType {
    result?: ActionResponse
}

export interface ServerInfo {
    currentVersion: string
    status: ModuleStatus
    releaseName: string
    canUpdateServer: boolean
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
