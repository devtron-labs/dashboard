import { MouseEventHandler, MutableRefObject, ReactNode } from 'react'
import { NavLinkProps } from 'react-router-dom'

import {
    customEnv,
    IconsProps,
    NavigationItemID,
    NavigationSubMenuItemID,
    Never,
    SERVER_MODE,
} from '@devtron-labs/devtron-fe-common-lib'

import { ViewType } from '@Config/constants'

export type NavigationRootItemID =
    | 'application-management'
    | 'infrastructure-management'
    | 'software-release-management'
    | 'cost-visibility'
    | 'security-center'
    | 'automation-and-enablement'
    | 'data-protection-management'
    | 'global-configuration'

export type CommonNavigationItemType = {
    title: string
    dataTestId: string
    icon: IconsProps['name']
    href: string
    disabled?: boolean
    keywords?: string[]
    forceHideEnvKey?: keyof customEnv
    hideNav?: boolean
    isAvailableInEA?: boolean
}

export type NavigationItemType = Pick<
    CommonNavigationItemType,
    'dataTestId' | 'title' | 'disabled' | 'keywords' | 'hideNav' | 'forceHideEnvKey' | 'isAvailableInEA'
> & {
    id: NavigationItemID
} & (
        | (Pick<CommonNavigationItemType, 'icon' | 'href'> & {
              hasSubMenu?: false
              subItems?: never
          })
        | (Never<Pick<CommonNavigationItemType, 'icon' | 'href'>> & {
              hasSubMenu: true
              subItems: (Omit<CommonNavigationItemType, 'icon' | 'isAvailableInEA'> & { id: NavigationSubMenuItemID })[]
          })
    )

export interface NavigationGroupType
    extends Pick<CommonNavigationItemType, 'title' | 'icon' | 'hideNav' | 'forceHideEnvKey' | 'isAvailableInEA'> {
    id: NavigationRootItemID
    items: NavigationItemType[]
    disabled?: boolean
}

export interface NavGroupProps extends Pick<NavigationGroupType, 'icon' | 'title' | 'disabled'> {
    isExpanded?: boolean
    isSelected?: boolean
    to?: NavLinkProps['to']
    onClick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>
    showTooltip?: boolean
    tooltip?: ReactNode
    onHover?: (isHovered: boolean) => void
}

export type NavItemProps = NavigationItemType & {
    hasSearchText: boolean
}

export interface NavigationProps {
    showStackManager?: boolean
    isAirgapped: boolean
    serverMode: SERVER_MODE
    moduleInInstallingState: string
    installedModuleMap: MutableRefObject<Record<string, boolean>>
    pageState: ViewType
}
