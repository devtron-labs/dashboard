import React from 'react'
import { SocketConnectionType } from '../node.type'

export interface TerminalSelectionListDataType {
    firstRow: any[]
    secondRow?: any[]
    tabSwitcher: {
        terminalData: {
            terminalRef: React.RefObject<HTMLDivElement>
            sessionId: string
            socketConnection: SocketConnectionType
            setSocketConnection: (type: SocketConnectionType) => void
            isTerminalTab?: boolean
            stripMessage: any
            registerLinkMatcher: (regex: RegExp, handler: (event: MouseEvent, uri: string) => void) => void
            terminalMessageData: any
            terminalCleared: boolean
        }
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
    renderConnectionStrip: any
    registerLinkMatcher: any
    terminalMessageData: any
    isTerminalCleared: boolean
}
