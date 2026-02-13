import { useEffect, useMemo, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

import { handleAnalyticsEvent, Icon, preventDefault, TreeView } from '@devtron-labs/devtron-fe-common-lib'

import { NavItemProps } from './types'
import { doesNavigationItemMatchPath, getNavigationTreeNodes } from './utils'

export const NavItem = ({ hasSearchText, ...navItem }: NavItemProps) => {
    // PROPS
    const { id, title, dataTestId, href, icon, hasSubMenu, subItems, disabled } = navItem

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

    const handleNavItemClick = () => {
        handleAnalyticsEvent({
            category: 'Navigation SubMenu',
            action: `nav-${id}`,
        })
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

    return (
        <NavLink
            to={href}
            data-testid={dataTestId}
            className={({ isActive }) =>
                `nav-item flex left dc__gap-8 px-8 py-6 br-4 ${disabled ? 'dc__disabled' : ''} ${isActive ? 'is-selected fw-6' : ''}`
            }
            aria-disabled={disabled}
            onClick={disabled ? preventDefault : handleNavItemClick}
        >
            <Icon name={icon} color="white" />
            <span className="fs-13 lh-20 text__sidenav">{title}</span>
        </NavLink>
    )
}
