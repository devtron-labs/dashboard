import { SupportedKeyboardKeysType } from '@devtron-labs/devtron-fe-common-lib'

import { NAVIGATION_LIST } from '@Components/Navigation'

import { CommandBarGroupType } from './types'

export const NAVIGATION_GROUPS: CommandBarGroupType[] = NAVIGATION_LIST.map<CommandBarGroupType>((group) => ({
    title: group.title,
    id: group.id,
    items: group.items.flatMap(({ hasSubMenu, subItems, title, href, id, icon }) => {
        if (hasSubMenu && subItems?.length) {
            return subItems.map<CommandBarGroupType['items'][number]>((subItem) => ({
                title: `${title} / ${subItem.title}`,
                id: subItem.id,
                // Since icon is not present for some subItems, using from group
                icon: group.icon,
                // TODO: No href present for some subItems
                href: subItem.href ?? null,
            }))
        }

        return {
            title,
            id,
            icon: icon || 'ic-arrow-right',
            // TODO: No href present for some items
            href: href ?? null,
        }
    }),
}))

export const RECENT_ACTIONS_GROUP: CommandBarGroupType = {
    id: 'command-bar-recent-navigation-group',
    items: [],
    title: 'Recent Navigation',
}

export const RECENT_NAVIGATION_ITEM_ID_PREFIX = 'recent-navigation-' as const

export const SHORT_CUTS: Record<
    'OPEN_COMMAND_BAR' | 'FOCUS_SEARCH_BAR' | 'NAVIGATE_UP' | 'NAVIGATE_DOWN' | 'ENTER_ITEM',
    {
        keys: SupportedKeyboardKeysType[]
        description: string
    }
> = {
    OPEN_COMMAND_BAR: {
        keys: ['Meta', 'K'],
        description: 'Open Command Bar',
    },
    FOCUS_SEARCH_BAR: {
        keys: ['Shift', '>'],
        description: 'Focus Search Bar',
    },
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
