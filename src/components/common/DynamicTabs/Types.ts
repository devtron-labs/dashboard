import { ReactNode } from 'react'

interface CommonTabArgsType {
    name: string
    kind?: string
    url: string
    isSelected: boolean
    title?: string
    isDeleted?: boolean
    positionFixed: boolean
    iconPath?: string
}

export interface InitTabType extends CommonTabArgsType {
    idPrefix: string
}

export interface DynamicTabType extends CommonTabArgsType {
    id: string
}

export interface DynamicTabsProps {
    tabs: DynamicTabType[]
    removeTabByIdentifier: (title: string) => string
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
}
