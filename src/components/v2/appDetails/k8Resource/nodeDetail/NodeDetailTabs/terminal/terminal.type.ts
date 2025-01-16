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

import { OptionsOrGroups, GroupBase, ActionMeta, StylesConfig } from 'react-select'
import { SelectComponents } from 'react-select/dist/declarations/src/components'
import { SocketConnectionType } from '../../../../../../ClusterNodes/constants'
import { EditModeType, TerminalWrapperType } from './constants'
import { AppDetails } from '@devtron-labs/devtron-fe-common-lib'

export interface TerminalWrapperComponentType {
    type: TerminalWrapperType
    hideTerminalStripComponent?: boolean
    title?: string
    value?: unknown
    connectTerminal?: boolean
    closeTerminalModal?: (e: any, skipRedirection?: boolean) => void
    reconnectTerminal?: () => void
    placeholder?: string
    options?: any
    showDivider?: boolean
    defaultValue?: unknown
    onChange?: (selected: any) => void
    styles?: any
    components?: any
    showInfoTippy?: boolean
    infoContent?: any
    showExpand?: boolean
    isFullScreen?: boolean
    toggleScreenView?: () => void
    customComponent?: () => JSX.Element
    stopTerminalConnection?: () => Promise<void>
    resumePodConnection?: () => void
    toggleButton?: boolean
    setTerminalCleared?: () => void
    buttonSelectionState?: string
    setManifestButtonState?: (button: EditModeType) => void
    onToggle?: (value: boolean) => void
    isEnabled?: boolean
    dataTestId?: string
    classNamePrefix?: string
    isResourceBrowserView?: boolean
    isClusterTerminalView?: boolean
    containerName?: string
    podName?: string
    appDetails?: AppDetails
}

type TerminalMetadata =
    | Record<'app' | 'environment' | 'pod', string>
    | Record<'cluster' | 'namespace' | 'pod', string>
    | Record<'node' | 'namespace', string>

export interface TerminalSelectionListDataType {
    firstRow: TerminalWrapperComponentType[]
    secondRow?: TerminalWrapperComponentType[]
    tabSwitcher: {
        terminalData: Omit<TerminalViewType, 'metadata'>
        terminalTabWrapper?: any
    }
    metadata: TerminalMetadata
}

export interface TerminalWrapperProps {
    selectionListData: TerminalSelectionListDataType
    socketConnection: SocketConnectionType
    setSocketConnection: (type: SocketConnectionType) => void
    className?: string
    dataTestId?: string
    isResourceBrowserView?: boolean
}

export interface TerminalViewType extends Pick<TerminalWrapperProps, 'isResourceBrowserView'> {
    terminalRef: any
    sessionId: string
    socketConnection: SocketConnectionType
    setSocketConnection: (type: SocketConnectionType) => void
    isTerminalTab?: boolean
    renderConnectionStrip?: any
    registerLinkMatcher?: any
    terminalMessageData?: any
    clearTerminal: boolean
    dataTestId?: string
    metadata: TerminalSelectionListDataType['metadata']
}

export interface ConnectionStripMessageType {
    renderStripMessage?: any
    socketConnection: SocketConnectionType
    setSocketConnection: (type: SocketConnectionType) => void
}

export interface SelectWrapperType {
    hideTerminalStripComponent?: boolean
    title: string
    showInfoTippy?: boolean
    infoContent?: any
    placeholder?: string
    options: OptionsOrGroups<any, GroupBase<any>>
    defaultValue?: any
    value?: any
    onChange: (newValue: any, actionMeta: ActionMeta<any>) => void
    styles?: StylesConfig<any, false, GroupBase<any>>
    components?: Partial<SelectComponents<any, false, GroupBase<any>>>
    classNamePrefix?: string
}

export interface ReactSelectType {
    hideTerminalStripComponent?: boolean
    showDivider?: boolean
    title: string
    placeholder?: string
    options: OptionsOrGroups<any, GroupBase<any>>
    defaultValue?: any
    value?: any
    onChange: (newValue: any, actionMeta: ActionMeta<any>) => void
    styles?: StylesConfig<any, false, GroupBase<any>>
    components?: Partial<SelectComponents<any, false, GroupBase<any>>>
    classNamePrefix?: string
}

export interface WrapperTitleType {
    hideTerminalStripComponent?: boolean
    title: string
    value: string
    dataTestId?: string
}

export interface ConnectionButtonType {
    hideTerminalStripComponent?: boolean
    connectTerminal?: boolean
    closeTerminalModal: (e) => void
    reconnectTerminal: (e) => void
}

export interface CloseExpandView {
    hideTerminalStripComponent?: boolean
    showExpand?: boolean
    isFullScreen?: boolean
    toggleScreenView: () => void
    closeTerminalModal: () => void
}

export interface ConnectionSwitchType {
    hideTerminalStripComponent?: boolean
    toggleButton: boolean
    stopTerminalConnection: () => void
    resumePodConnection: () => void
}

export interface ClearTerminalType {
    hideTerminalStripComponent?: boolean
    setTerminalCleared: () => void
    dataTestId?: string
}

export interface EditManifestType {
    hideTerminalStripComponent?: boolean
    buttonSelectionState: string
    setManifestButtonState: (button: string) => void
}

export interface DebugModeType {
    hideTerminalStripComponent?: boolean
    showInfoTippy?: boolean
    onToggle: (value: boolean) => void
    isEnabled: boolean
}
