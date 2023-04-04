import { Routes } from '../../../config'
import { get, post } from '@devtron-labs/devtron-fe-common-lib'
import {
    AllModuleInfoResponse,
    LogPodNameResponse,
    ModuleActionRequest,
    ModuleActionResponse,
    ModuleInfoResponse,
    ReleaseNotesResponse,
    ServerInfoResponse,
} from './DevtronStackManager.type'

export const getModuleInfo = (moduleName: string): Promise<ModuleInfoResponse> => {
    return get(`${Routes.MODULE_INFO_API}?name=${moduleName}`)
}

export const executeModuleAction = (
    moduleName: string,
    moduleActionRequest: ModuleActionRequest,
): Promise<ModuleActionResponse> => {
    return post(`${Routes.MODULE_INFO_API}?name=${moduleName}`, moduleActionRequest)
}

export const getServerInfo = (withoutStatus?: boolean): Promise<ServerInfoResponse> => {
    return get(`${Routes.SERVER_INFO_API}${withoutStatus ? '?showServerStatus=false' : ''}`)
}

export const executeServerAction = (serverActionRequest: ModuleActionRequest): Promise<ModuleActionResponse> => {
    return post(Routes.SERVER_INFO_API, serverActionRequest)
}

export const getAllModules = (): Promise<AllModuleInfoResponse> => {
    return fetch(`${window._env_.CENTRAL_API_ENDPOINT}/${Routes.API_VERSION_V2}/${Routes.MODULES_API}`).then((res) => res.json())
}

export const getReleasesNotes = (): Promise<ReleaseNotesResponse> => {
    return fetch(`${window._env_.CENTRAL_API_ENDPOINT}/${Routes.RELEASE_NOTES_API}`).then((res) => res.json())
}

export const getLogPodName = (): Promise<LogPodNameResponse> => {
    return get(Routes.LOG_PODNAME_API)
}
