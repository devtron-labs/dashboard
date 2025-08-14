import { RECENT_NAVIGATION_ITEM_ID_PREFIX } from './constants'
import { CommandBarActionIdType, CommandBarItemType } from './types'

export const sanitizeItemId = (item: CommandBarItemType) =>
    (item.id.startsWith(RECENT_NAVIGATION_ITEM_ID_PREFIX)
        ? item.id.replace(RECENT_NAVIGATION_ITEM_ID_PREFIX, '')
        : item.id) as CommandBarActionIdType

export const getNewSelectedIndex = (prevIndex: number, type: 'up' | 'down', totalItems: number) => {
    if (type === 'up') {
        return prevIndex === 0 ? totalItems - 1 : prevIndex - 1
    }
    return prevIndex === totalItems - 1 ? 0 : prevIndex + 1
}
