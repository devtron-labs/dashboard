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

import { MouseEvent, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

import {
    AnimatePresence,
    KeyboardShortcut,
    ModuleNameMap,
    ModuleStatus,
    motion,
    SearchBar,
    URLS,
    useQuery,
    UseRegisterShortcutProvider,
} from '@devtron-labs/devtron-fe-common-lib'

import { getModuleInfo } from '@Components/v2/devtronStackManager/DevtronStackManager.service'
import { MODULE_STATUS_POLLING_INTERVAL, MODULE_STATUS_RETRY_COUNT, ViewType } from '@Config/constants'
import { CommandBar } from '@Pages/Shared/CommandBar'

import { NAVIGATION_LIST } from './constants'
import { NavGroup } from './NavGroup'
import { NavigationLogo, NavigationLogoExpanded } from './NavigationLogo'
import { NavItem } from './NavItem'
import { NavGroupProps, NavigationGroupType, NavigationProps } from './types'
import { doesNavigationItemMatchPath, filterNavigationItems, findActiveNavigationItemOfNavGroup } from './utils'

import './styles.scss'

export const Navigation = ({
    showStackManager = false,
    isAirgapped,
    installedModuleMap,
    moduleInInstallingState,
    serverMode,
    pageState,
}: NavigationProps) => {
    // STATES
    const [hoveredNavGroup, setHoveredNavGroup] = useState<NavigationGroupType | null>(null)
    const [searchText, setSearchText] = useState('')
    const [showCommandBar, setShowCommandBar] = useState(false)

    // HOOKS
    const { pathname } = useLocation()

    // REFS
    const securityTrivyModuleTimeout = useRef<NodeJS.Timeout>(null)
    const securityClairModuleTimeout = useRef<NodeJS.Timeout>(null)
    const timeoutRef = useRef<NodeJS.Timeout>(null)

    useEffect(
        () => () => {
            clearTimeout(securityTrivyModuleTimeout.current)
            clearTimeout(securityClairModuleTimeout.current)
        },
        [],
    )

    // SECURITY MODULES API CALLS
    const {
        isFetching: isSecurityTrivyLoading,
        data: securityTrivyResponse,
        isSuccess: isSecurityTrivySuccess,
        refetch: refetchSecurityTrivy,
    } = useQuery({
        queryFn: () => getModuleInfo(ModuleNameMap.SECURITY_TRIVY, true),
        queryKey: [ModuleNameMap.SECURITY_TRIVY],
        retry: MODULE_STATUS_RETRY_COUNT,
        select: ({ result }) => result,
        enabled:
            !!serverMode &&
            (!(installedModuleMap.current[ModuleNameMap.SECURITY_TRIVY] || window._env_.K8S_CLIENT) ||
                moduleInInstallingState === ModuleNameMap.SECURITY_TRIVY),
    })

    const {
        isFetching: isSecurityClairLoading,
        data: securityClairResponse,
        isSuccess: isSecurityClairSuccess,
        refetch: refetchSecurityClair,
    } = useQuery({
        queryFn: () => getModuleInfo(ModuleNameMap.SECURITY_CLAIR, true),
        queryKey: [ModuleNameMap.SECURITY_CLAIR],
        retry: MODULE_STATUS_RETRY_COUNT,
        select: ({ result }) => result,
        enabled:
            !!serverMode &&
            (!(installedModuleMap.current[ModuleNameMap.SECURITY_CLAIR] || window._env_.K8S_CLIENT) ||
                moduleInInstallingState === ModuleNameMap.SECURITY_CLAIR),
    })

    useEffect(() => {
        if (!isSecurityTrivyLoading && isSecurityTrivySuccess) {
            if (securityTrivyResponse.status === ModuleStatus.INSTALLED) {
                Object.assign(installedModuleMap.current, {
                    ...installedModuleMap.current,
                    [ModuleNameMap.SECURITY_TRIVY]: true,
                })
            } else if (securityTrivyResponse.status === ModuleStatus.INSTALLING) {
                securityTrivyModuleTimeout.current = setTimeout(async () => {
                    await refetchSecurityTrivy()
                }, MODULE_STATUS_POLLING_INTERVAL)
            }
        }
    }, [isSecurityTrivyLoading, isSecurityTrivySuccess])

    useEffect(() => {
        if (!isSecurityClairLoading && isSecurityClairSuccess) {
            if (securityClairResponse.status === ModuleStatus.INSTALLED) {
                Object.assign(installedModuleMap.current, {
                    ...installedModuleMap.current,
                    [ModuleNameMap.SECURITY_CLAIR]: true,
                })
            } else if (securityClairResponse.status === ModuleStatus.INSTALLING) {
                securityClairModuleTimeout.current = setTimeout(async () => {
                    await refetchSecurityClair()
                }, MODULE_STATUS_POLLING_INTERVAL)
            }
        }
    }, [isSecurityClairLoading, isSecurityClairSuccess])

    // COMPUTED VALUES
    const selectedNavGroup = useMemo(
        () => NAVIGATION_LIST.find(({ items }) => items.some((item) => doesNavigationItemMatchPath(item, pathname))),
        [pathname],
    )

    // The current navigation group is the one that is hovered or the one that is active, \
    // this is used to determine which nav group items are to be shown in expanded state.
    const currentNavGroup = hoveredNavGroup || selectedNavGroup
    const isExpanded = !!hoveredNavGroup

    const navItems = useMemo<NavigationGroupType['items']>(
        () => (currentNavGroup ? filterNavigationItems(currentNavGroup.items, searchText) : []),
        [currentNavGroup, searchText],
    )

    // HANDLERS
    const handleNavGroupClick =
        (navItem: NavigationGroupType): NavGroupProps['onClick'] =>
        (e) => {
            // Prevent navigation, if the item is already active
            if (
                selectedNavGroup?.id === navItem.id &&
                doesNavigationItemMatchPath(findActiveNavigationItemOfNavGroup(selectedNavGroup.items), pathname)
            ) {
                e.preventDefault()
            }
            setHoveredNavGroup(navItem)
            setSearchText('')
        }

    const handleCloseExpandedNavigation =
        (forceClose = false) =>
        () => {
            if (searchText && !forceClose) {
                return
            }
            setHoveredNavGroup(null)
            setSearchText('')
        }

    const handleNavGroupHover = (navGroup: typeof hoveredNavGroup) => (isHovered: boolean) => {
        clearTimeout(timeoutRef.current)

        if (isHovered) {
            if (!hoveredNavGroup) {
                setHoveredNavGroup(navGroup)
                return
            }

            timeoutRef.current = setTimeout(() => {
                setHoveredNavGroup(navGroup)
                setSearchText('')
            }, 50)
        }
    }

    const handleOpenExpandedNavigation = (e: MouseEvent<HTMLDivElement>) => {
        if (!hoveredNavGroup && e.target === e.currentTarget) {
            setHoveredNavGroup(selectedNavGroup)
        }
    }

    const handleOpenCommandBar = () => {
        setShowCommandBar(true)
        handleCloseExpandedNavigation(true)()
    }

    return (
        <>
            <div className="navigation dc__position-rel">
                <nav
                    className={`navigation__default dc__position-rel dc__grid dc__overflow-hidden h-100 ${isExpanded ? 'is-expanded' : ''}`}
                    onMouseEnter={handleOpenExpandedNavigation}
                >
                    <NavigationLogo />
                    <NavGroup
                        title="Search"
                        icon="ic-magnifying-glass"
                        isExpanded={isExpanded}
                        onClick={handleOpenCommandBar}
                        showTooltip
                        tooltip={
                            <span className="flex dc__gap-2">
                                Search&nbsp;
                                <KeyboardShortcut keyboardKey="Meta" />
                                <KeyboardShortcut keyboardKey="K" />
                            </span>
                        }
                        onHover={handleCloseExpandedNavigation(true)}
                    />
                    <NavGroup
                        title="Overview"
                        icon="ic-speedometer"
                        to="/dummy-url"
                        isExpanded={isExpanded}
                        onHover={handleCloseExpandedNavigation(true)}
                        disabled
                        showTooltip
                    />
                    {NAVIGATION_LIST.map((item) => (
                        <NavGroup
                            key={item.id}
                            title={item.title}
                            icon={item.icon}
                            disabled={item.disabled}
                            isExpanded={isExpanded}
                            isSelected={hoveredNavGroup?.id === item.id || selectedNavGroup?.id === item.id}
                            onClick={handleNavGroupClick(item)}
                            to={findActiveNavigationItemOfNavGroup(item.items)?.href}
                            onHover={handleNavGroupHover(item)}
                        />
                    ))}
                    {!window._env_.K8S_CLIENT && !isAirgapped && showStackManager && (
                        <NavGroup
                            title="Stack Manager"
                            icon="ic-stack"
                            to={URLS.STACK_MANAGER_ABOUT}
                            isExpanded={isExpanded}
                            onHover={handleCloseExpandedNavigation(true)}
                            showTooltip
                        />
                    )}
                </nav>
                <AnimatePresence>
                    {isExpanded && (
                        <>
                            <div
                                className="navigation__expanded__backdrop dc__position-abs dc__top-0"
                                onClick={handleCloseExpandedNavigation(true)}
                                onMouseEnter={handleCloseExpandedNavigation(false)}
                            />

                            <motion.div
                                initial={{ opacity: 0, x: 0 }}
                                animate={{ opacity: 1, x: '100%' }}
                                exit={{ opacity: 0, x: 0 }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                                className="navigation__expanded h-100 dc__right-radius-8 flexbox-col dc__position-abs dc__top-0 dc__right-0"
                            >
                                <NavigationLogoExpanded />
                                {currentNavGroup && (
                                    <div className="flex-grow-1 flexbox-col dc__gap-16 p-16 dc__overflow-auto">
                                        <p className="m-0 fs-16 lh-1-5 fw-7 text__white font-merriweather">
                                            {currentNavGroup.title}
                                        </p>
                                        <SearchBar
                                            key={currentNavGroup.id}
                                            variant="sidenav"
                                            initialSearchText={searchText}
                                            handleSearchChange={setSearchText}
                                            inputProps={{ autoFocus: true }}
                                        />
                                        <div className="flex-grow-1 dc__overflow-auto">
                                            {navItems.length ? (
                                                navItems
                                                    .filter(({ forceHideEnvKey, hideNav }) =>
                                                        forceHideEnvKey ? window._env_[forceHideEnvKey] : !hideNav,
                                                    )
                                                    .map((item) => (
                                                        <NavItem
                                                            key={item.title}
                                                            {...item}
                                                            hasSearchText={!!searchText}
                                                        />
                                                    ))
                                            ) : (
                                                <span className="fs-13 lh-20 text__sidenav">No matching results</span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>

            {pageState === ViewType.FORM && (
                <UseRegisterShortcutProvider ignoreTags={[]}>
                    <CommandBar showCommandBar={showCommandBar} setShowCommandBar={setShowCommandBar} />
                </UseRegisterShortcutProvider>
            )}
        </>
    )
}
