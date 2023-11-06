import { ServerInfo } from '../../v2/devtronStackManager/DevtronStackManager.type'

export interface PageHeaderType {
    headerName?: string
    additionalHeaderInfo?: () => JSX.Element
    isTippyShown?: boolean
    tippyRedirectLink?: string
    showTabs?: boolean
    renderHeaderTabs?: () => JSX.Element
    isBreadcrumbs?: boolean
    breadCrumbs?: () => JSX.Element
    TippyIcon?: React.FunctionComponent<any>
    tippyMessage?: string
    onClickTippybutton?: () => void
    renderActionButtons?: () => JSX.Element
    showCloseButton?: boolean
    onClose?: () => void
    markAsBeta?: boolean
    showAnnouncementHeader?: boolean
}

export interface HelpNavType {
    className: string
    setShowHelpCard: React.Dispatch<React.SetStateAction<boolean>>
    serverInfo: ServerInfo
    fetchingServerInfo: boolean
    setGettingStartedClicked: (isClicked: boolean) => void
    showHelpCard: boolean
}

export interface HelpOptionType {
    name: string
    link: string
    icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
    showSeparator?: boolean
}
