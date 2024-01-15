import { ReactNode } from 'react'
import { ClusterDetail } from '../../ClusterNodes/types'

interface CommonTabArgsType {
    name: string
    kind?: string
    url: string
    isSelected: boolean
    title?: string
    isDeleted?: boolean
    positionFixed: boolean
    iconPath?: string
    dynamicTitle?: string
    showNameOnSelect?: boolean
}

export interface InitTabType extends CommonTabArgsType {
    idPrefix: string
}

export interface DynamicTabType extends CommonTabArgsType {
    id: string
}

export interface DynamicTabsProps {
    tabs: DynamicTabType[]
    removeTabByIdentifier: (id: string) => string
    stopTabByIdentifier: (title: string) => string
    enableShortCut?: boolean
    loader: boolean
    refreshData: () => void
    isOverview: boolean,
    lastDataSync:boolean,
    setLastDataSyncTimeString: (time: string) => void,
    isStaleDataRef: any,
    setStartTerminal: (startTerminal: boolean) => void,
    selectedTerminal: ClusterDetail,
}

export interface TabsDataType {
    fixedTabs: DynamicTabType[]
    dynamicTabs: DynamicTabType[]
}

export interface MoreButtonWrapperProps {
    children?: ReactNode
    readonly isMenuOpen: boolean
    readonly onClose: () => void
    readonly toggleMenu: () => void
    tabPopupMenuRef: React.MutableRefObject<HTMLButtonElement>
}
