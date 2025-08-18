import { IconsProps, UserPreferencesType } from '@devtron-labs/devtron-fe-common-lib'

import { NavigationItemType } from '@Components/Navigation/types'

import { RECENT_NAVIGATION_ITEM_ID_PREFIX } from './constants'

export type CommandBarActionIdType = UserPreferencesType['commandBar']['recentNavigationActions'][number]['id']

export type CommandBarItemType = {
    id: CommandBarActionIdType | `${typeof RECENT_NAVIGATION_ITEM_ID_PREFIX}${CommandBarActionIdType}`
    title: string
    icon: IconsProps['name']
    href: NavigationItemType['href']
} & (
    | {
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
