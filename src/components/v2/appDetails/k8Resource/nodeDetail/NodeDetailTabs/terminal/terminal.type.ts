import React from 'react'
import { OptionsOrGroups, GroupBase, ActionMeta, StylesConfig } from 'react-select'
import { SelectComponents } from 'react-select/dist/declarations/src/components'
import { SocketConnectionType } from '../node.type'
import { EDIT_MODE_TYPE } from './constants'

export interface TerminalWrapperComponentType {
    type: string
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
    setManifestButtonState?: (button: EDIT_MODE_TYPE) => void
}

export interface TerminalSelectionListDataType {
    firstRow: TerminalWrapperComponentType[]
    secondRow?: TerminalWrapperComponentType[]
    tabSwitcher: {
        terminalData: TerminalViewType
        terminalTabWrapper?: any
    }
}

export interface TerminalWrapperProps {
    selectionListData: TerminalSelectionListDataType
    socketConnection: SocketConnectionType
    setSocketConnection: (type: SocketConnectionType) => void
    className?: string
}

export interface TerminalViewType {
    terminalRef: any
    sessionId: string
    socketConnection: SocketConnectionType
    setSocketConnection: (type: SocketConnectionType) => void
    isTerminalTab?: boolean
    renderConnectionStrip?: any
    registerLinkMatcher?: any
    terminalMessageData?: any
    clearTerminal: boolean
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
}

export interface WrapperTitleType {
    hideTerminalStripComponent?: boolean
    title: string
    value: string
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
}

export interface EditManifestType {
    hideTerminalStripComponent?: boolean;
    buttonSelectionState: string
    setManifestButtonState: (button: string) => void
}
