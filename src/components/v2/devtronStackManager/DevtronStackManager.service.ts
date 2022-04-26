import { FullRoutes, Routes } from '../../../config'
import { get, post } from '../../../services/api'
import {
    LogPodNameResponse,
    ModuleActionRequest,
    ModuleActionResponse,
    ModuleInfoResponse,
    ModuleStatus,
    ReleaseNotesResponse,
    ServerActionRequest,
    ServerInfoResponse,
} from './DevtronStackManager.type'

const Status = [
    ModuleStatus.NOT_INSTALLED,
    ModuleStatus.INSTALLING,
    ModuleStatus.INSTALLED,
    ModuleStatus.INSTALL_FAILED,
    ModuleStatus.TIMEOUT,
]

const ServerStatus = [
    ModuleStatus.UNKNOWN,
    ModuleStatus.UPGRADING,
    ModuleStatus.HEALTHY,
    ModuleStatus.UPGRADE_FAILED,
    ModuleStatus.TIMEOUT,
]

export const getModuleInfo = (moduleName: string): Promise<ModuleInfoResponse> => {
    // return get(`${Routes.MODULE_INFO_API}/${moduleName}`)

    return Promise.resolve({
        result: {
            id: 0,
            name: moduleName,
            status: Status[Math.floor(Math.random() * 5)],
        },
    } as ModuleInfoResponse)
}

export const executeModuleAction = (
    moduleName: string,
    moduleActionRequest: ModuleActionRequest,
): Promise<ModuleActionResponse> => {
    // return post(`${Routes.MODULE_INFO_API}/${moduleName}`, moduleActionRequest)
    if (Math.floor(Math.random() * 4) === 3) {
        return Promise.reject({
            code: 3,
            status: 'NOT_OK',
            message: `Installation Failed for '${moduleName}'`,
        } as ModuleActionResponse)
    } else {
        return Promise.resolve({
            result: {
                success: true,
            },
        } as ModuleActionResponse)
    }
}

export const getServerInfo = (): Promise<ServerInfoResponse> => {
    // return get(Routes.SERVER_INFO_API)
    return Promise.resolve({
        result: {
            currentVersion: 'v0.3.25',
            status: ServerStatus[Math.floor(Math.random() * 5)],
            releaseName: 'devtron',
        },
    } as ServerInfoResponse)
}

export const executeServerAction = (serverActionRequest: ServerActionRequest): Promise<ModuleActionResponse> => {
    // return post(Routes.SERVER_INFO_API, serverActionRequest)
    if (Math.floor(Math.random() * 4) === 3) {
        return Promise.reject({
            code: 3,
            status: 'NOT_OK',
            message: 'Upgrade Failed',
        } as ModuleActionResponse)
    } else {
        return Promise.resolve({
            result: {
                success: true,
            },
        } as ModuleActionResponse)
    }
}

export const getReleasesNotes = (): Promise<ReleaseNotesResponse> => {
    return fetch(FullRoutes.RELEASE_NOTES_API).then((res) => res.json())
}

export const getLogPodName = (): Promise<LogPodNameResponse> => {
    return get(Routes.LOG_PODNAME_API)
}
