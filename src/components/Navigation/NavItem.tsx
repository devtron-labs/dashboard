import { useEffect, useMemo, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

import { Icon, preventDefault, TreeView } from '@devtron-labs/devtron-fe-common-lib'

import { NavItemProps } from './types'
import { doesNavigationItemMatchPath, getNavigationTreeNodes } from './utils'

export const NavItem = ({ hasSearchText, ...navItem }: NavItemProps) => {
    // PROPS
    const { id, title, dataTestId, href, icon, hasSubMenu, subItems, disabled } = navItem

    // Debug logging
    if (!href && !hasSubMenu) {
        console.error('NavItem missing href:', { id, title, hasSubMenu, href })
    }

    // HOOKS
    const { pathname } = useLocation()

    // STATES
    const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({
        [id]: doesNavigationItemMatchPath(navItem, pathname),
    })

    useEffect(() => {
        if (hasSearchText) {
            setExpandedMap((prevExpandedMap) => ({
                ...prevExpandedMap,
                [id]: true,
            }))
        }
    }, [hasSearchText])

    // COMPUTED VALUES
    const selectedId = useMemo(() => (doesNavigationItemMatchPath(navItem, pathname) ? id : null), [pathname, navItem])

    // HANDLERS
    const handleToggle = () => {
        setExpandedMap((prevExpandedMap) => ({
            ...prevExpandedMap,
            [id]: !prevExpandedMap[id],
        }))
    }

    if (hasSubMenu) {
        return (
            <div>
                <TreeView
                    variant="sidenav"
                    nodes={getNavigationTreeNodes({ id, title, subItems })}
                    isControlled
                    getUpdateItemsRefMap={null}
                    flatNodeList={null}
                    depth={0}
                    expandedMap={expandedMap}
                    onToggle={handleToggle}
                    selectedId={selectedId}
                    highlightSelectedHeadingOnlyWhenCollapsed
                />
            </div>
        )
    }

    // Handle disabled items or items without href
    if (disabled || !href) {
        return (
            <div
                data-testid={dataTestId}
                className={`nav-item flex left dc__gap-8 px-8 py-6 br-4 dc__disabled`}
                aria-disabled={true}
            >
                <Icon name={icon} color="white" />
                <span className="fs-13 lh-20 text__sidenav">{title}</span>
            </div>
        )
    }

    return (
        <NavLink
            to={href}
            data-testid={dataTestId}
            className={`nav-item flex left dc__gap-8 px-8 py-6 br-4`}
            activeClassName="is-selected fw-6"
            aria-disabled={disabled}
        >
            <Icon name={icon} color="white" />
            <span className="fs-13 lh-20 text__sidenav">{title}</span>
        </NavLink>
    )
}
