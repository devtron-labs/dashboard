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
