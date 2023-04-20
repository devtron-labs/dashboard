import React from 'react'
import { SocketConnectionType } from '../node.type'

export interface TerminalSelectionListDataType {
    firstRow: any[] 
    secondRow?: any[]
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
