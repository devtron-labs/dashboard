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

export type NavigationRootItemID =
    | 'application-management'
    | 'infrastructure-management'
    | 'software-release-management'
    | 'cost-visibility'
    | 'security-center'
    | 'automation-and-enablement'
    | 'backup-and-restore'
    | 'global-configuration'
    | 'ai-recommendations'

type CommonNavigationItemType = {
    title: string
    dataTestId: string
    icon: IconsProps['name']
    href: string
    disabled?: boolean
    keywords?: string[]
    forceHideEnvKey?: keyof customEnv
    hideNav?: boolean
}

export type NavigationItemType = Pick<
    CommonNavigationItemType,
    'dataTestId' | 'disabled' | 'keywords' | 'forceHideEnvKey' | 'hideNav'
> & {
    isAvailableInEA?: boolean
    markOnlyForSuperAdmin?: boolean
    title: string
    markAsBeta?: boolean
    isAvailableInDesktop?: boolean
    moduleName?: string
    moduleNameTrivy?: string
    id: NavigationItemID
} & (
        | (Pick<CommonNavigationItemType, 'icon' | 'href'> & {
              hasSubMenu?: false
              subItems?: never
          })
        | (Never<Pick<CommonNavigationItemType, 'icon' | 'href'>> & {
              hasSubMenu: true
              subItems: (Omit<CommonNavigationItemType, 'icon'> & { id: NavigationSubMenuItemID })[]
          })
    )

export interface NavigationGroupType extends Pick<CommonNavigationItemType, 'title' | 'icon'> {
    id: NavigationRootItemID
    items: NavigationItemType[]
    disabled?: boolean
}

export interface NavGroupProps extends Pick<NavigationGroupType, 'icon' | 'title' | 'disabled'> {
    isExpanded?: boolean
    isSelected?: boolean
    to?: NavLinkProps['to']
    onClick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>
    tooltip?: ReactNode
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
    isSuperAdmin: boolean
}
