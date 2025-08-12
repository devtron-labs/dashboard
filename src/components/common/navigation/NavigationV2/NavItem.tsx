import { useMemo } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

import { Icon, TreeView } from '@devtron-labs/devtron-fe-common-lib'

import { NavItemProps } from './types'
import { getNavigationTreeNodes } from './utils'

export const NavItem = ({ id, title, dataTestId, href, icon, hasSubMenu, subItems }: NavItemProps) => {
    const { pathname } = useLocation()

    const defaultExpandedMap = useMemo(
        () =>
            hasSubMenu
                ? {
                      [id]: subItems.some((subItem) => subItem.href === pathname),
                  }
                : {},
        [],
    )

    if (hasSubMenu) {
        return (
            <div>
                <TreeView
                    variant="nav"
                    defaultExpandedMap={defaultExpandedMap}
                    nodes={getNavigationTreeNodes({ id, title, subItems })}
                />
            </div>
        )
    }

    return (
        <NavLink
            to={href}
            data-testid={dataTestId}
            className="nav-item flex left dc__gap-8 px-8 py-6 br-4"
            activeClassName="is-selected fw-6"
        >
            <Icon name={icon} color="white" />
            <span className="fs-13 lh-20 text__white">{title}</span>
        </NavLink>
    )
}
