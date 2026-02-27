import { Dispatch, type JSX, SetStateAction } from 'react'

import {
    ClusterType,
    IconBaseColorType,
    IconsProps,
    NavigationItemType,
    UserPreferencesType,
} from '@devtron-labs/devtron-fe-common-lib'

import { HelmApp } from '@Components/app/list-new/AppListType'
import { Chart } from '@Components/charts/charts.types'
import { AppListMinDTO } from '@Services/service.types'

import { RECENT_NAVIGATION_ITEM_ID_PREFIX } from './constants'

export type CommandBarActionIdType = UserPreferencesType['commandBar']['recentNavigationActions'][number]['id']

export type CommandBarItemType = {
    id: CommandBarActionIdType | `${typeof RECENT_NAVIGATION_ITEM_ID_PREFIX}${CommandBarActionIdType}`
    title: string
    keywords: string[]
    href: NavigationItemType['href']
    /**
     * @default false
     */
    excludeFromRecent?: boolean
    subText?: string
} & (
    | {
          onSelect?: never
      }
    | {
          href?: never
          onSelect: (e: React.MouseEvent<HTMLButtonElement>) => void
      }
) &
    (
        | {
              icon: IconsProps['name']
              iconColor?: IconBaseColorType | 'none'
              iconElement?: never
          }
        | {
              iconElement: JSX.Element
              icon?: never
              iconColor?: never
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

export interface CommandBarResourceListType {
    appList: AppListMinDTO[]
    chartList: Chart[]
    clusterList: Omit<ClusterType, 'isVirtual'>[]
    helmAppList: HelmApp[]
}

export interface CommandBarBackdropProps {
    isLoadingResourceList: boolean
    resourceList: CommandBarResourceListType
    handleClose: () => void
}

export interface CommandBarProps {
    showCommandBar: boolean
    setShowCommandBar: Dispatch<SetStateAction<boolean>>
}

export interface NavigationUpgradedDialogProps {
    isOpen: boolean
    onClose: () => void
}
