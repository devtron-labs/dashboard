import { ReactNode } from 'react'
import moment from 'moment'
import { useTabs } from './useTabs'

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
    isAlive?: boolean
    lastSyncMoment?: moment.Moment
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
    start: moment.Moment
    callback?: (now: moment.Moment) => void
    transition?: () => JSX.Element
    transpose?: (output: string) => JSX.Element
    format?: (start: moment.Moment, now: moment.Moment) => string
}
