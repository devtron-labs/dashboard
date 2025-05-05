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

import { get, getUrlWithSearchParams, post, refresh, ToastManager, ToastVariantType } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICSparkles } from '@Icons/ic-sparkles.svg'
import { ReactComponent as ICArrowClockwise } from '@Icons/ic-arrow-clockwise.svg'
import { ModuleNameMap, Routes, UPDATE_AVAILABLE_TOAST_PROGRESS_BG } from '../../../config'
import {
    AllModuleInfoResponse,
    InstallationType,
    LogPodNameResponse,
    ModuleActionRequest,
    ModuleActionResponse,
    ModuleInfo,
    ModuleInfoResponse,
    ModuleStatus,
    ReleaseNotesResponse,
    ServerInfoResponse,
} from './DevtronStackManager.type'
import { INSTALLATION_TYPE_TO_REPO_MAP } from './DevtronStackManager.utils'

let moduleStatusMap: Record<string, ModuleInfo> = {}
let serverInfo: ServerInfoResponse
let isReloadToastShown = false

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

export const getSecurityModulesInfoInstalledStatus = async (): Promise<ModuleInfoResponse> => {
    // getting Security Module Installation status
    const res: ModuleInfo = {
        id: null,
        name: null,
        status: null,
    }
    let installedResponseFlag = false
    try {
        const { result: trivyResponse } = await get(`${Routes.MODULE_INFO_API}?name=${ModuleNameMap.SECURITY_TRIVY}`)
        const isTrivyInstalled = trivyResponse && trivyResponse.status === ModuleStatus.INSTALLED
        if (!isTrivyInstalled) {
            const { result: clairResponse } = await get(
                `${Routes.MODULE_INFO_API}?name=${ModuleNameMap.SECURITY_CLAIR}`,
            )
            if (clairResponse && clairResponse?.status === ModuleStatus.INSTALLED) {
                installedResponseFlag = true
            }
        } else {
            installedResponseFlag = true
        }
    } catch {
        installedResponseFlag = false
    } finally {
        if (installedResponseFlag) {
            return Promise.resolve({ status: '', code: 200, result: { ...res, status: ModuleStatus.INSTALLED } })
        }
        return Promise.resolve({ status: '', code: 200, result: { ...res, status: ModuleStatus.NOT_INSTALLED } })
    }
}

export const getModuleInfo = async (moduleName: string, forceReload?: boolean): Promise<ModuleInfoResponse> => {
    const _savedModuleStatusMap = getSavedModuleStatus()
    if (!forceReload && _savedModuleStatusMap && _savedModuleStatusMap[moduleName]) {
        return Promise.resolve({ status: '', code: 200, result: _savedModuleStatusMap[moduleName] })
    }
    if (moduleName === ModuleNameMap.SECURITY) {
        return getSecurityModulesInfoInstalledStatus()
    }
    const { result } = await get(`${Routes.MODULE_INFO_API}?name=${moduleName}`)
    if (result && result.status === ModuleStatus.INSTALLED) {
        if (moduleName === ModuleNameMap.CICD && !isReloadToastShown) {
            // To show a reload tost if CICD installation complete
            ToastManager.showToast({
                variant: ToastVariantType.info,
                title: 'Update available',
                description: 'You are viewing an outdated version of Devtron UI.',
                buttonProps: {
                    text: 'Reload',
                    dataTestId: 'reload-button',
                    onClick: refresh,
                    startIcon: <ICArrowClockwise />,
                },
                icon: <ICSparkles />,
                progressBarBg: UPDATE_AVAILABLE_TOAST_PROGRESS_BG,
            })
            isReloadToastShown = true
        }
        _savedModuleStatusMap[moduleName] = { ...result, moduleResourcesStatus: null }
        if (typeof Storage !== 'undefined') {
            localStorage.moduleStatusMap = JSON.stringify(_savedModuleStatusMap)
        }
        moduleStatusMap = _savedModuleStatusMap
    }
    return Promise.resolve({ status: '', code: 200, result })
}

export const executeModuleEnableAction = (moduleName: string, toolVersion: string): Promise<ModuleActionResponse> =>
    post(`${Routes.MODULE_INFO_API}/enable?name=${moduleName}`, { version: toolVersion })
export const executeModuleAction = (
    moduleName: string,
    moduleActionRequest: ModuleActionRequest,
): Promise<ModuleActionResponse> => post(`${Routes.MODULE_INFO_API}?name=${moduleName}`, moduleActionRequest)

const isValidServerInfo = (_serverInfo: ServerInfoResponse): boolean =>
    !!(_serverInfo?.result && _serverInfo.result.releaseName && _serverInfo.result.installationType)

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

export const executeServerAction = (serverActionRequest: ModuleActionRequest): Promise<ModuleActionResponse> =>
    post(Routes.SERVER_INFO_API, serverActionRequest)

export const getAllModules = (): Promise<AllModuleInfoResponse> =>
    fetch(`${window._env_.CENTRAL_API_ENDPOINT}/${Routes.API_VERSION_V2}/${Routes.MODULES_API}`).then((res) =>
        res.json(),
    )

export const getReleasesNotes = async (installationType: InstallationType): Promise<ReleaseNotesResponse> => {
    const url = getUrlWithSearchParams(`${window._env_.CENTRAL_API_ENDPOINT}/${Routes.RELEASE_NOTES_API}`, {
        repo: INSTALLATION_TYPE_TO_REPO_MAP[installationType],
    })
    const response = await fetch(url)
    return response.json()
}

export const getLogPodName = (): Promise<LogPodNameResponse> => get(Routes.LOG_PODNAME_API)
