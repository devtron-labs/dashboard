import { ModuleNameMap, Routes } from '../../../config'
import { get, post } from '@devtron-labs/devtron-fe-common-lib'
import {
    AllModuleInfoResponse,
    InstallationType,
    LogPodNameResponse,
    ModuleActionRequest,
    ModuleActionResponse,
    ModuleEnableRequest,
    ModuleInfo,
    ModuleInfoInstalled,
    ModuleInfoInstalledResponse,
    ModuleInfoResponse,
    ModuleStatus,
    ReleaseNotesResponse,
    ServerInfoResponse,
} from './DevtronStackManager.type'
import { reloadToastBody } from '../../common'
import { toast } from 'react-toastify'

let moduleStatusMap: Record<string, ModuleInfo> = {},
    serverInfo: ServerInfoResponse,
    isReloadToastShown = false

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



export const getSecurityModulesInfoInstalledStatus = async (): Promise<ModuleInfoInstalledResponse> => {
    // getting Security Module Installation status 
    const [clairResponse, trivyResponse] = await Promise.all([
        getModuleInfo(ModuleNameMap.SECURITY),
        getModuleInfo(ModuleNameMap.SECURITY_TRIVY),
    ]) 
    if (clairResponse && trivyResponse) {
        if (
            clairResponse?.result?.status === ModuleStatus.INSTALLED ||
            trivyResponse?.result?.status === ModuleStatus.INSTALLED
        ) {
            return Promise.resolve({ status: '', code: 200, result: { status: ModuleStatus.INSTALLED } })
        }
        return Promise.resolve({ status: '', code: 200, result: { status: ModuleStatus.NOT_INSTALLED } })
    }
}

export const getModuleInfo = async (moduleName: string, forceReload?: boolean): Promise<ModuleInfoResponse> => {
    const _savedModuleStatusMap = getSavedModuleStatus()
    if (!forceReload &&_savedModuleStatusMap && _savedModuleStatusMap[moduleName]) {
        return Promise.resolve({ status: '', code: 200, result: _savedModuleStatusMap[moduleName] })
    }
    const { result } = await get(`${Routes.MODULE_INFO_API}?name=${moduleName}`)
    if (result && result.status === ModuleStatus.INSTALLED) {
        if (moduleName === ModuleNameMap.CICD && !isReloadToastShown) {
            // To show a reload tost if CICD installation complete
            toast.info(reloadToastBody(), { autoClose: false, closeButton: false })
            isReloadToastShown = true
        }
        _savedModuleStatusMap[moduleName] = { ...result, moduleResourcesStatus: null }
        if (typeof Storage !== 'undefined') {
            localStorage.moduleStatusMap = JSON.stringify(_savedModuleStatusMap)
        }
        moduleStatusMap = _savedModuleStatusMap
    }
    return Promise.resolve({ status: '', code: 200, result: result })
}

export const executeModuleEnableAction = (
    moduleName: string,
    moduleEnableRequest: ModuleEnableRequest,
): Promise<ModuleActionResponse> => {
    return post(`${Routes.MODULE_INFO_API}/enable?name=${moduleName}`, moduleEnableRequest)
}
export const executeModuleAction = (
    moduleName: string,
    moduleActionRequest: ModuleActionRequest,
): Promise<ModuleActionResponse> => {
    return post(`${Routes.MODULE_INFO_API}?name=${moduleName}`, moduleActionRequest)
}

const isValidServerInfo = (_serverInfo: ServerInfoResponse): boolean => {
    return !!(
        _serverInfo?.result &&
        _serverInfo.result.releaseName &&
        _serverInfo.result.installationType
    )
}

const getSavedServerInfo = (): ServerInfoResponse => {
    if (!isValidServerInfo(serverInfo)) {
        if (typeof Storage !== 'undefined' && localStorage.serverInfo) {
            const _serverInfoFromLS = JSON.parse(localStorage.serverInfo)
            if (isValidServerInfo(_serverInfoFromLS)) {
                serverInfo = _serverInfoFromLS
            }
        }
    }
    return serverInfo
}

export const getServerInfo = async (withoutStatus: boolean, isFormHeader: boolean): Promise<ServerInfoResponse> => {
    if (withoutStatus && !isFormHeader) {
        const _serverInfo = getSavedServerInfo()
        if (_serverInfo) {
            return Promise.resolve(_serverInfo)
        }
    }
    const response = await get(`${Routes.SERVER_INFO_API}${withoutStatus ? '?showServerStatus=false' : ''}`)
    serverInfo = response
    if (typeof Storage !== 'undefined') {
        localStorage.serverInfo = JSON.stringify(serverInfo)
    }
    return Promise.resolve(response)
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
