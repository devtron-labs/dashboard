import {
    customEnv,
    IconsProps,
    NavigationItemID,
    NavigationSubMenuItemID,
    Never,
    URLS as CommonURLS,
} from '@devtron-labs/devtron-fe-common-lib'

import { URLS } from '@Config/routes'

export type NavigationRootItemID =
    | 'application-management'
    | 'infrastructure-management'
    | 'software-release-management'
    | 'cost-visibility'
    | 'security-center'
    | 'automation-and-enablement'
    | 'global-configuration'

type CommonNavigationItemType = {
    title: string
    dataTestId: string
    icon: IconsProps['name']
    href?: (typeof URLS)[keyof typeof URLS] | (typeof CommonURLS)[keyof typeof CommonURLS]
}

export type NavigationItemType = Pick<CommonNavigationItemType, 'dataTestId'> & {
    isAvailableInEA?: boolean
    markOnlyForSuperAdmin?: boolean
    forceHideEnvKey?: keyof customEnv
    title: string
    hideNav?: boolean
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
}

export type CommandBarItemType = {
    id: string
    title: string
    icon: IconsProps['name']
} & (
    | {
          href: CommonNavigationItemType['href']
          onSelect?: never
      }
    | {
          href?: never
          onSelect: (e: React.MouseEvent<HTMLButtonElement>) => void
      }
)

export interface CommandBarGroupType {
    id: string
    title: string
    items: CommandBarItemType[]
}

export interface CommandGroupProps extends CommandBarGroupType {
    isLoading?: boolean
}
