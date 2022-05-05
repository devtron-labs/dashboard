import { FullRoutes, Routes } from '../../../config'
import { get, post } from '../../../services/api'
import {
    AllModuleInfoResponse,
    LogPodNameResponse,
    ModuleActionRequest,
    ModuleActionResponse,
    ModuleInfoResponse,
    ModuleStatus,
    ReleaseNotesResponse,
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
    const status = Status[Math.floor(Math.random() * 5)]

    console.log(status)

    return Promise.resolve({
        result: {
            id: 0,
            name: moduleName,
            status: ModuleStatus.NOT_INSTALLED,
        },
    } as ModuleInfoResponse)
}

export const executeModuleAction = (
    moduleName: string,
    moduleActionRequest: ModuleActionRequest,
): Promise<ModuleActionResponse> => {
    return post(`${Routes.MODULE_INFO_API}/${moduleName}`, moduleActionRequest)
}

export const getServerInfo = (): Promise<ServerInfoResponse> => {
    // return get(Routes.SERVER_INFO_API)
    return Promise.resolve({
        result: {
            currentVersion: 'v0.3.0',
            status: ModuleStatus.UPGRADING,// ServerStatus[Math.floor(Math.random() * 5)],
            releaseName: 'devtron',
            canUpdateServer: true
        },
    } as ServerInfoResponse)
}

export const executeServerAction = (serverActionRequest: ModuleActionRequest): Promise<ModuleActionResponse> => {
    return post(Routes.SERVER_INFO_API, serverActionRequest)
}

export const getAllModules = (): Promise<AllModuleInfoResponse> => {
    return fetch(`${FullRoutes.CENTRAL}/${Routes.MODULES_API}`).then((res) => res.json())
}

export const getReleasesNotes = (): Promise<ReleaseNotesResponse> => {
    return fetch(`${FullRoutes.CENTRAL}/${Routes.RELEASE_NOTES_API}`).then((res) => res.json())
}

export const getLogPodName = (): Promise<LogPodNameResponse> => {
    // return get(Routes.LOG_PODNAME_API)
    return Promise.resolve({
        result: {
            podName: 'inception-test',
        },
    } as LogPodNameResponse)
}


