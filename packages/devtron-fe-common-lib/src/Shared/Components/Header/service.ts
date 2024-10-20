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

import { ResponseType, post, ROUTES, get } from '../../../Common'
import { ServerInfoResponse } from './types'

export const updatePostHogEvent = (payload): Promise<ResponseType> => post(ROUTES.TELEMETRY_EVENT, payload)

let serverInfo: ServerInfoResponse

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
    const response = await get(`${ROUTES.SERVER_INFO_API}${withoutStatus ? '?showServerStatus=false' : ''}`)
    serverInfo = response
    if (typeof Storage !== 'undefined') {
        localStorage.serverInfo = JSON.stringify(serverInfo)
    }
    return Promise.resolve(response)
}
