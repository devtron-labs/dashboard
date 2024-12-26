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

import { MutableRefObject } from 'react'
import { SERVER_MODE } from '../../../config'
import { ServerInfo } from '../../v2/devtronStackManager/DevtronStackManager.type'

export interface MainContext {
    serverMode: SERVER_MODE
    setServerMode: (serverMode: SERVER_MODE) => void
    isHelpGettingStartedClicked: boolean
    setPageOverflowEnabled: (isPageOverflowEnabled: boolean) => void
    showCloseButtonAfterGettingStartedClicked: () => void
    loginCount: number
    setLoginCount: (loginCount: number) => void
    showGettingStartedCard: boolean
    setShowGettingStartedCard: (showGettingStartedCard: boolean) => void
    isGettingStartedClicked: boolean
    setGettingStartedClicked: (isGettingStartedClicked: boolean) => void
    moduleInInstallingState: string
    setModuleInInstallingState: (moduleInInstallingState: string) => void
    installedModuleMap: MutableRefObject<Record<string, boolean>>
    currentServerInfo: {
        serverInfo: ServerInfo
        fetchingServerInfo: boolean
    }
    isAirgapped: boolean
    isSuperAdmin: boolean
    isManifestScanningEnabled: boolean
}
