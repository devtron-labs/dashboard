import { TreeNode } from '@devtron-labs/devtron-fe-common-lib'

import { NavigationItemType } from './types'

const getNavigationTreeItems = (items: NavigationItemType['subItems']) =>
    items.map<TreeNode>(({ title, id, href, disabled }) => ({
        id,
        title,
        href,
        type: 'item',
        as: 'link',
        isDisabled: disabled,
    }))

export const getNavigationTreeNodes = ({
    id,
    title,
    subItems,
}: Pick<NavigationItemType, 'id' | 'title' | 'subItems'>): TreeNode[] => [
    {
        id,
        title,
        type: 'heading',
        items: getNavigationTreeItems(subItems),
    },
]

export const filterNavigationItems = (
    items: NavigationItemType[] | NavigationItemType['subItems'],
    searchText: string,
) => {
    if (!searchText) {
        return items
    }

    const query = searchText.toLowerCase().trim()

    return items
        .map((item: NavigationItemType | NavigationItemType['subItems'][0]) => {
            // Check if current item matches
            const matches =
                item.title.toLowerCase().includes(query) || item.keywords?.some((keyword) => keyword.includes(query))

            const navItem = item as NavigationItemType
            if (navItem.hasSubMenu) {
                // Recursively filter subItems
                const filteredSubItems = filterNavigationItems(navItem.subItems, searchText)

                if (filteredSubItems.length > 0) {
                    // Keep parent if any subitems matched
                    return { ...item, subItems: filteredSubItems }
                }
            }

            // If item itself matched (and has no children)
            if (matches && !navItem.hasSubMenu) return item

            // Exclude otherwise
            return null
        })
        .filter(Boolean)
}

export const doesNavigationItemMatchPath = (
    item: NavigationItemType | NavigationItemType['subItems'][0],
    pathname: string,
    { exact = false } = {},
): boolean => {
    const navItem = item as NavigationItemType

    if (navItem.hasSubMenu && navItem.subItems) {
        return navItem.subItems.some((subItem) => doesNavigationItemMatchPath(subItem, pathname))
    }

    return exact ? pathname === item.href : pathname.startsWith(item.href)
}

export const findActiveNavigationItemOfNavGroup = (items: NavigationItemType[]) =>
    items.find(({ disabled }) => !disabled)
