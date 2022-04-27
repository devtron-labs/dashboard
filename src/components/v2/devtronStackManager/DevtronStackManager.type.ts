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
    UPGRADE_FAILED = 'upgradeFailed'
}

export enum ModuleActions {
    INSTALL = 'install',
    UPGRADE = 'upgrade',
}

export interface ModuleDetails {
    id: string
    name: string
    info: string
    icon: string
    installationStatus: ModuleStatus
    baseMinVersionSupported?: string
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
