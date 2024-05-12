import { ReactNode } from 'react'
import { useTabs } from './useTabs'
import { Dayjs } from 'dayjs'

interface CommonTabArgsType {
    name: string
    kind?: string
    url: string
    isSelected: boolean
    title?: string
    isDeleted?: boolean
    position: number
    iconPath?: string
    dynamicTitle?: string
    showNameOnSelect?: boolean
    isAlive?: boolean
    lastSyncMoment?: Dayjs
    componentKey?: string
}

export interface InitTabType extends CommonTabArgsType {
    idPrefix: string
}

export interface DynamicTabType extends CommonTabArgsType {
    id: string
}

export interface DynamicTabsProps {
    tabs: DynamicTabType[]
    removeTabByIdentifier: ReturnType<typeof useTabs>['removeTabByIdentifier']
    markTabActiveById: ReturnType<typeof useTabs>['markTabActiveById']
    stopTabByIdentifier: ReturnType<typeof useTabs>['stopTabByIdentifier']
    enableShortCut?: boolean
    refreshData: () => void
    isOverview: boolean
    setIsDataStale: React.Dispatch<React.SetStateAction<boolean>>
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

export interface TimerType {
    start: Dayjs
    callback?: (now: Dayjs) => void
    transition?: () => JSX.Element
    transpose?: (output: string) => JSX.Element
    format?: (start: Dayjs, now: Dayjs) => string
}
