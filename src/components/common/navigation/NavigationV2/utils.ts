import { TreeNode } from '@devtron-labs/devtron-fe-common-lib'

import { NavigationItemType } from './types'

const getNavigationTreeItems = (items: NavigationItemType['subItems']) =>
    items.map<TreeNode>(({ title, id, href }) => ({
        id,
        title,
        href,
        type: 'item',
        as: 'link',
        activeClassName: 'nav-item is-selected br-4 fw-6',
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
