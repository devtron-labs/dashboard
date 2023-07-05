import { SocketConnectionType } from '../../../../../ClusterNodes/constants'
import { SelectedResourceType } from '../../../appDetails.type'

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
