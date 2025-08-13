import {
    customEnv,
    IconsProps,
    NavigationItemID,
    NavigationSubMenuItemID,
    Never,
    URLS as CommonURLS,
    UserPreferencesType,
} from '@devtron-labs/devtron-fe-common-lib'

import { URLS } from '@Config/routes'

import { RECENT_NAVIGATION_ITEM_ID_PREFIX } from './constants'

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

export type CommandBarActionIdType = UserPreferencesType['commandBar']['recentNavigationActions'][number]['id']

export type CommandBarItemType = {
    id: CommandBarActionIdType | `${typeof RECENT_NAVIGATION_ITEM_ID_PREFIX}${CommandBarActionIdType}`
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
    /**
     * Required for semantic purpose, and need to be unique across all groups.
     */
    id: string
    title: string
    items: CommandBarItemType[]
}

export interface CommandGroupProps extends CommandBarGroupType {
    isLoading?: boolean
    baseIndex: number
    selectedItemIndex: number
    updateItemRefMap: (id: string, el: HTMLDivElement) => void
    onItemClick: (item: CommandBarItemType) => void
}

export interface CommandBarBackdropProps {
    handleClose: () => void
}
