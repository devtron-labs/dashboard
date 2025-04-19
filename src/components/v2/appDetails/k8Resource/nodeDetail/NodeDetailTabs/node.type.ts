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

import { Moment } from 'moment'

import { SelectedResourceType } from '@devtron-labs/devtron-fe-common-lib'

import { CUSTOM_LOGS_FILTER } from '../../../../../../config'
import { SocketConnectionType } from '../../../../../ClusterNodes/constants'

export interface TerminalViewProps {
    dataTestId?: string
    nodeName: string
    shell: any
    containerName: string
    socketConnection: SocketConnectionType
    isTerminalCleared: boolean
    setTerminalCleared: (terminalCleared: boolean) => void
    setSocketConnection: (socketConnection: SocketConnectionType) => void
    isClusterTerminal?: boolean
    terminalId?: string
    isFetchRetry?: boolean
    disconnectRetry?: () => void
    isToggleOption?: boolean
    isFullScreen?: boolean
    isTerminalTab?: boolean
    setTerminalTab?: (selectedTabIndex: number) => void
    isPodConnected?: boolean
    sessionError?: (error: any) => void
    isResourceBrowserView?: boolean
    selectedResource?: SelectedResourceType
    isShellSwitched?: boolean
    setSelectedNodeName?: any
    selectedNamespace?: string
    reconnectTerminal?: () => void
}

export interface EventTableType {
    loading: boolean
    eventsList: any[]
    isResourceBrowserView?: boolean
    reconnect?: () => void
    errorValue?: PodEventsType
}

export interface PodEventsType {
    status: string
    errorReason: string
    eventsResponse: any
}

export interface SelectedCustomLogFilterType {
    option: string
    value: string
    unit?: string
}

export interface CustomLogFilterOptionsType {
    [CUSTOM_LOGS_FILTER.DURATION]: { value: string; unit: string; error: string }
    [CUSTOM_LOGS_FILTER.LINES]: { value: string; error: string }
    [CUSTOM_LOGS_FILTER.SINCE]: {
        value: string
        date: Moment
        time: { label: string; value: string; isDisabled?: boolean }
    }
    [CUSTOM_LOGS_FILTER.ALL]: { value: string }
}
