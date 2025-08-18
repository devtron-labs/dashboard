import { useMemo } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

import { Icon, preventDefault, TreeView } from '@devtron-labs/devtron-fe-common-lib'

import { NavigationItemType } from './types'
import { getNavigationTreeNodes } from './utils'

export const NavItem = ({ id, title, dataTestId, href, icon, hasSubMenu, subItems, disabled }: NavigationItemType) => {
    const { pathname } = useLocation()

    const { defaultExpandedMap, selectedId } = useMemo(() => {
        if (hasSubMenu) {
            const activeSubItem = subItems.find((subItem) => pathname.startsWith(subItem.href))
            return {
                defaultExpandedMap: {
                    [id]: !!activeSubItem,
                },
                selectedId: activeSubItem?.id ?? null,
            }
        }

        return { defaultExpandedMap: {}, selectedId: null }
    }, [pathname, hasSubMenu, subItems])

    if (hasSubMenu) {
        return (
            <div>
                <TreeView
                    variant="sidenav"
                    defaultExpandedMap={defaultExpandedMap}
                    nodes={getNavigationTreeNodes({ id, title, subItems })}
                    selectedId={selectedId}
                    highlightSelectedHeadingOnlyWhenCollapsed
                />
            </div>
        )
    }

    return (
        <NavLink
            to={href}
            data-testid={dataTestId}
            className={`nav-item flex left dc__gap-8 px-8 py-6 br-4 ${disabled ? 'dc__disabled' : ''}`}
            activeClassName="is-selected fw-6"
            aria-disabled={disabled}
            onClick={disabled ? preventDefault : undefined}
        >
            <Icon name={icon} color="white" />
            <span className="fs-13 lh-20 text__sidenav">{title}</span>
        </NavLink>
    )
}
