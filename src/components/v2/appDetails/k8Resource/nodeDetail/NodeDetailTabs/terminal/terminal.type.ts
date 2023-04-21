import React from 'react'
import { SocketConnectionType } from '../node.type'

export interface TerminalWrapperComponentType {
    type: string
    hideTerminalStripComponent?: boolean
    title?: string
    value?: unknown
    connectTerminal?: boolean,
    closeTerminalModal?: (e: any, skipRedirection?: boolean) => void,
    reconnectTerminal?: () => void, 
    placeholder?: string,
    options?: any,
    showDivider?: boolean
    defaultValue?: unknown,
    onChange?: (selected: any) => void,
    styles?: any,
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
