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
}
