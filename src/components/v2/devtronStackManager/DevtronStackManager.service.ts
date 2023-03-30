import { Routes } from '../../../config'
import { get, post } from '@devtron-labs/devtron-fe-common-lib'
import {
    AllModuleInfoResponse,
    LogPodNameResponse,
    ModuleActionRequest,
    ModuleActionResponse,
    ModuleInfo,
    ModuleStatus,
    ReleaseNotesResponse,
    ServerInfoResponse,
} from './DevtronStackManager.type'

let moduleStatusMap: Record<string, ModuleInfo> = {}

const getSavedModuleStatus = (): Record<string, ModuleInfo> => {
    let _moduleStatusMaps = moduleStatusMap
    if (!Object.keys(_moduleStatusMaps).length) {
        if (typeof Storage !== 'undefined' && localStorage.moduleStatusMap) {
            _moduleStatusMaps = JSON.parse(localStorage.moduleStatusMap)
        }
    }
    return _moduleStatusMaps
}

export const getAllModulesInfo = async (): Promise<Record<string, ModuleInfo>> => {
    const _savedModuleStatusMap = getSavedModuleStatus()
    if (Object.keys(_savedModuleStatusMap).length) {
        return Promise.resolve(_savedModuleStatusMap)
    }
    const { result } = await get(Routes.MODULE_INFO_API) // to fetch all modules
    if (result) {
        const _moduleStatusMap = {}
        for (const _moduleDetails of result) {
            _moduleStatusMap[_moduleDetails.name] = _moduleDetails
        }
        if (typeof Storage !== 'undefined') {
            localStorage.moduleStatusMap = JSON.stringify(_moduleStatusMap)
        }
        moduleStatusMap = _moduleStatusMap
    }
    return Promise.resolve(moduleStatusMap)
}

export const getModuleInfo = async (moduleName: string): Promise<ModuleInfo> => {
    const _savedModuleStatusMap = getSavedModuleStatus()
    if (_savedModuleStatusMap && _savedModuleStatusMap[moduleName]) {
        return Promise.resolve(_savedModuleStatusMap[moduleName])
    }
    const { result } = await get(`${Routes.MODULE_INFO_API}?name=${moduleName}`)
    if (result && result.status === ModuleStatus.INSTALLED) {
        _savedModuleStatusMap[moduleName] = result
        if (typeof Storage !== 'undefined') {
            localStorage.moduleStatusMap = JSON.stringify(_savedModuleStatusMap)
        }
        moduleStatusMap = _savedModuleStatusMap
    } else {
        Promise.resolve(result)
    }
    return Promise.resolve(_savedModuleStatusMap[moduleName])
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
    return fetch(`${window._env_.CENTRAL_API_ENDPOINT}/${Routes.API_VERSION_V2}/${Routes.MODULES_API}`).then((res) =>
        res.json(),
    )
}

export const getReleasesNotes = (): Promise<ReleaseNotesResponse> => {
    return fetch(`${window._env_.CENTRAL_API_ENDPOINT}/${Routes.RELEASE_NOTES_API}`).then((res) => res.json())
}

export const getLogPodName = (): Promise<LogPodNameResponse> => {
    return get(Routes.LOG_PODNAME_API)
}
