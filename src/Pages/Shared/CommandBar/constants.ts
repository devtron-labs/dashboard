import { IconName, NavigationItemID, SupportedKeyboardKeysType } from '@devtron-labs/devtron-fe-common-lib'

import { CommandBarGroupType } from './types'

export const RECENT_ACTIONS_GROUP: CommandBarGroupType = {
    id: 'command-bar-recent-navigation-group',
    items: [],
    title: 'Recent',
}

export const RECENT_NAVIGATION_ITEM_ID_PREFIX = 'recent-navigation-' as const
export const DEVTRON_APPLICATIONS_COMMAND_GROUP_ID = 'devtron-applications-command-group' as const

export const SHORT_CUTS: Record<
    'NAVIGATE_UP' | 'NAVIGATE_DOWN' | 'ENTER_ITEM',
    {
        keys: SupportedKeyboardKeysType[]
        description: string
    }
> = {
    NAVIGATE_UP: {
        keys: ['ArrowUp'],
        description: 'Navigate Up',
    },
    NAVIGATE_DOWN: {
        keys: ['ArrowDown'],
        description: 'Navigate Down',
    },
    ENTER_ITEM: {
        keys: ['Enter'],
        description: 'Select Item',
    },
}

export const NAV_SUB_ITEMS_ICON_MAPPING: Partial<Record<NavigationItemID, IconName>> = {
    'application-management-configurations': 'ic-gear',
    'application-management-policies': 'ic-gavel',
    'global-configuration-authorization': 'ic-key',
}
