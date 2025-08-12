/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { MouseEvent, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { AnimatePresence, motion, noop, SearchBar } from '@devtron-labs/devtron-fe-common-lib'

import { NAVIGATION_LIST } from './constants'
import { NavGroup } from './NavGroup'
import { NavigationLogo, NavigationLogoExpanded } from './NavigationLogo'
import { NavItem } from './NavItem'
import { NavigationGroupType } from './types'

import './styles.scss'

export const NavigationV2 = () => {
    // STATES
    const [isExpanded, setIsExpanded] = useState(false)
    const [hoveredNavGroup, setHoveredNavGroup] = useState<NavigationGroupType | null>(null)
    const [searchText, setSearchText] = useState('')

    // HOOKS
    const { pathname } = useLocation()

    // REFS
    const navigationRef = useRef<HTMLDivElement>(null)

    // COMPUTED VALUES
    const selectedNavGroup = useMemo(
        () =>
            NAVIGATION_LIST.find(({ items }) =>
                items.some((item) => {
                    if (item.hasSubMenu) {
                        return item.subItems.some((subItem) => subItem.href === pathname)
                    }

                    return item.href === pathname
                }),
            ),
        [pathname],
    )

    const currentNavGroup = hoveredNavGroup || selectedNavGroup

    const navItems = useMemo(() => {
        if (!currentNavGroup) {
            return []
        }

        const searchTextNormalized = searchText.toLowerCase().trim()

        return searchTextNormalized
            ? currentNavGroup.items.filter(({ title }) => title.toLowerCase().includes(searchTextNormalized))
            : currentNavGroup.items
    }, [currentNavGroup, searchText])

    // HANDLERS
    const openExpandedNavigation = () => {
        setIsExpanded(true)
    }

    const handleNavigationMouseOver = (e: MouseEvent<HTMLDivElement>) => {
        if (navigationRef.current === e.target) {
            setHoveredNavGroup(null)
        }
    }

    const closeExpandedNavigation =
        (forceClose = false) =>
        () => {
            if (searchText && !forceClose) {
                return
            }

            setIsExpanded(false)
            setHoveredNavGroup(null)
            setSearchText('')
        }

    const handleNavGroupHover = (navItem: NavigationGroupType) => (isHover: boolean) => {
        if (isHover) {
            setSearchText('')
        }
        setHoveredNavGroup(isHover ? navItem : hoveredNavGroup)
    }

    return (
        <div className="navigation dc__position-rel">
            <nav
                ref={navigationRef}
                className={`navigation__default dc__position-rel dc__grid dc__overflow-hidden h-100 ${isExpanded ? 'is-expanded' : ''}`}
                onMouseEnter={openExpandedNavigation}
                onMouseOver={handleNavigationMouseOver}
                onFocus={noop}
            >
                <NavigationLogo />
                <NavGroup title="Overview" icon="ic-speedometer" isExpanded={isExpanded} to="/global-overview" />
                <NavGroup title="Search" icon="ic-magnifying-glass" isExpanded={isExpanded} />
                {NAVIGATION_LIST.map(({ id, title, icon, items }) => (
                    <NavGroup
                        key={id}
                        title={title}
                        icon={icon}
                        isExpanded={isExpanded}
                        isSelected={hoveredNavGroup?.id === id || selectedNavGroup?.id === id}
                        onHover={handleNavGroupHover({ id, title, icon, items })}
                    />
                ))}
            </nav>
            <AnimatePresence>
                {isExpanded && (
                    <>
                        <div
                            className="navigation__expanded__backdrop dc__position-abs dc__top-0"
                            onClick={closeExpandedNavigation(true)}
                        />
                        <motion.div
                            initial={{ opacity: 0, x: 0 }}
                            animate={{ opacity: 1, x: '100%' }}
                            exit={{ opacity: 0, x: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="navigation__expanded h-100 dc__right-radius-8 flexbox-col dc__position-abs dc__top-0 dc__right-0"
                            onMouseLeave={closeExpandedNavigation(false)}
                        >
                            <NavigationLogoExpanded />
                            {currentNavGroup && (
                                <div className="flex-grow-1 flexbox-col dc__gap-16 p-16">
                                    <p className="m-0 fs-16 lh-1-5 fw-7 text__white font-merriweather">
                                        {currentNavGroup.title}
                                    </p>
                                    <SearchBar
                                        containerClassName="navigation__expanded__search-bar"
                                        initialSearchText={searchText}
                                        handleSearchChange={setSearchText}
                                        inputProps={{ autoFocus: true }}
                                    />
                                    <div>
                                        {navItems.map((item) => (
                                            <NavItem key={item.title} {...item} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
