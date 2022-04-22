import { ResponseType } from '../../../services/service.types'
import { ActionResponse } from '../../external-apps/ExternalAppService'

export enum ModuleStatus {
    NONE = 'none',
    NOT_INSTALLED = 'notInstalled',
    INSTALLING = 'installing',
    INSTALLED = 'installed',
    INSTALL_FAILED = 'installFailed',
    AVAILABLE = 'available',
    TIMEOUT = 'timeout',
}

export enum ModuleActions {
    INSTALL = 'install',
    UPGRADE = 'upgrade',
}

export interface ModuleDetails {
    name: string
    info: string
    icon: string
    installationStatus: ModuleStatus
}

export interface ModuleDetailsCardType {
    moduleDetails: ModuleDetails
    className?: string
}

export interface ModuleInfo {
    id: number
    name: string
    status: ModuleStatus
}

export interface ModuleInfoResponse extends ResponseType {
    result?: ModuleInfo
}

export interface ModuleActionRequest {
    action: ModuleActions
}

export interface ModuleActionResponse extends ResponseType {
    result?: ActionResponse
}

export interface ServerInfo {
    currentVersion: string
    status: ModuleStatus
    releaseName: string
    logPodName?: string
}

export interface ServerInfoResponse extends ResponseType {
    result?: ServerInfo
}

export interface ServerActionRequest {
    action: ModuleActions
    version: string
}
