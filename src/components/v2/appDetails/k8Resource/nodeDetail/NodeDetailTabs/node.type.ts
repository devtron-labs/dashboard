export interface TerminalViewProps {
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
    isterminalTab?: boolean
    setTerminalTab?: (selectedTabIndex: number) => void
    isPodConnected?: boolean
    sessionError?: (error: any) => void
}

export interface EventTableType {
    loading: boolean,
     eventsList: any[]
}

export enum SocketConnectionType {
    CONNECTING = 'CONNECTING',
    CONNECTED = 'CONNECTED',
    DISCONNECTING = 'DISCONNECTING',
    DISCONNECTED = 'DISCONNECTED',
}

export const ERROR_MESSAGE = {
    UNAUTHORIZED: 'Not authorized. You do not have permission to access the terminal for this application.',
}

export const POD_LINKS = {
    POD_MANIFEST : 'Check Pod Manifest',
    POD_EVENTS : 'Check Pod Events'
}
