import { TreeNode } from '@devtron-labs/devtron-fe-common-lib'

import { NavigationItemType } from './types'

const getNavigationTreeItems = (items: NavigationItemType['subItems']) =>
    items
        .filter(({ forceHideEnvKey, hideNav }) => (forceHideEnvKey ? window._env_[forceHideEnvKey] : !hideNav))
        .map<TreeNode>(({ title, id, href, disabled }) => ({
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
            // Check if current item matches query or any of its keywords
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

// remove trailing slashes
const normalize = (p: string) => p.replace(/\/+$/, '')

/**
 * Checks if a given path is under a base path
 * @param basePath - The base path to check against
 * @param targetPath - The path to test
 * @returns True if the path is under the base path
 */
const isSubPath = (basePath: string, targetPath: string) => {
    // Ensure both paths start with a single "/"
    const _basePath = normalize(basePath)
    const _targetPath = normalize(targetPath)

    // Must start with basePath + "/" or be exactly the same
    return _targetPath === _basePath || _targetPath.startsWith(`${_basePath}/`)
}

/**
 * Checks if a given navigation item matches a given path.
 * If the item has a "hasSubMenu" property, it will recursively check
 * the subItems for a match.
 * @param item The navigation item to check
 * @param pathname The path to test against
 * @returns True if the item matches the path, otherwise false.
 */
export const doesNavigationItemMatchPath = (
    item: NavigationItemType | NavigationItemType['subItems'][0],
    pathname: string,
): boolean => {
    const navItem = item as NavigationItemType

    if (navItem.hasSubMenu && navItem.subItems) {
        return navItem.subItems.some((subItem) => doesNavigationItemMatchPath(subItem, pathname))
    }

    return isSubPath(item.href, pathname)
}

/**
 * Finds the first enabled navigation item within a group.
 * @param items The navigation item group to search.
 * @returns The first enabled navigation item, or undefined if all are disabled.
 */
export const findActiveNavigationItemOfNavGroup = (items: NavigationItemType[]) =>
    items.find(({ disabled }) => !disabled)
