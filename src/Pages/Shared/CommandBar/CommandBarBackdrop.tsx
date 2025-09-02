import { useEffect, useMemo, useRef, useState } from 'react'
import { useHistory } from 'react-router-dom'

import {
    API_STATUS_CODES,
    Backdrop,
    GenericFilterEmptyState,
    getUserPreferences,
    KeyboardShortcut,
    logExceptionToSentry,
    noop,
    ResponseType,
    SearchBar,
    stopPropagation,
    SupportedKeyboardKeysType,
    ToastManager,
    ToastVariantType,
    updateUserPreferences,
    useQuery,
    useRegisterShortcut,
    UserPreferencesType,
} from '@devtron-labs/devtron-fe-common-lib'

import CommandGroup from './CommandGroup'
import { NAVIGATION_GROUPS, RECENT_ACTIONS_GROUP, RECENT_NAVIGATION_ITEM_ID_PREFIX, SHORT_CUTS } from './constants'
import { CommandBarBackdropProps, CommandBarGroupType } from './types'
import { getNewSelectedIndex, sanitizeItemId } from './utils'

const CommandBarBackdrop = ({ handleClose }: CommandBarBackdropProps) => {
    const history = useHistory()
    const { registerShortcut, unregisterShortcut } = useRegisterShortcut()

    const [searchText, setSearchText] = useState('')
    const [selectedItemIndex, setSelectedItemIndex] = useState(0)

    const { data: recentActionsGroup, isLoading } = useQuery({
        queryFn: ({ signal }) =>
            getUserPreferences(signal).then((response) => {
                const responseData: ResponseType<typeof response> = {
                    code: API_STATUS_CODES.OK,
                    status: 'OK',
                    result: response,
                }
                return responseData
            }),
        queryKey: ['recentNavigationActions'],
        select: ({ result }) =>
            result.commandBar.recentNavigationActions.reduce<CommandBarGroupType>((acc, action) => {
                const requiredGroup = structuredClone(NAVIGATION_GROUPS).find((group) =>
                    group.items.some((item) => item.id === action.id),
                )

                if (requiredGroup) {
                    const requiredItem = requiredGroup.items.find((item) => item.id === action.id)
                    requiredItem.id = `${RECENT_NAVIGATION_ITEM_ID_PREFIX}${action.id}`
                    acc.items.push(requiredItem)
                }
                return acc
            }, structuredClone(RECENT_ACTIONS_GROUP)),
    })

    const areFiltersApplied = !!searchText

    const searchBarRef = useRef<HTMLInputElement>(null)
    const itemRefMap = useRef<Record<string, HTMLDivElement>>({})

    const handleSearchChange = (value: string) => {
        setSearchText(value)
        if (value !== searchText) {
            setSelectedItemIndex(0)
        }
    }

    const updateItemRefMap = (id: string, el: HTMLDivElement) => {
        itemRefMap.current[id] = el
    }

    const filteredGroups = useMemo(() => {
        const lowerCaseSearchText = searchText.toLowerCase()

        if (!searchText) {
            return NAVIGATION_GROUPS
        }

        return NAVIGATION_GROUPS.reduce<typeof NAVIGATION_GROUPS>((acc, group) => {
            const filteredItems = group.items.filter((item) => item.title.toLowerCase().includes(lowerCaseSearchText))

            if (filteredItems.length > 0) {
                acc.push({
                    ...group,
                    items: filteredItems,
                })
            }

            return acc
        }, [])
    }, [searchText])

    const itemFlatList: CommandBarGroupType['items'] = useMemo(() => {
        if (areFiltersApplied) {
            return filteredGroups.flatMap((group) => group.items)
        }

        return recentActionsGroup
            ? [...recentActionsGroup.items, ...NAVIGATION_GROUPS.flatMap((group) => group.items)]
            : [...NAVIGATION_GROUPS.flatMap((group) => group.items)]
    }, [areFiltersApplied, recentActionsGroup, filteredGroups])

    const handleClearFilters = () => {
        setSearchText('')
    }

    const focusSearchBar = () => {
        if (searchBarRef.current) {
            searchBarRef.current.focus()
        }
    }

    const handleNavigation = (type: 'up' | 'down') => {
        if (!itemFlatList.length) {
            return
        }

        setSelectedItemIndex((prevIndex) => {
            const newIndex = getNewSelectedIndex(prevIndex, type, itemFlatList.length)
            const item = itemFlatList[newIndex]
            const itemElement = itemRefMap.current[item.id]
            if (itemElement) {
                itemElement.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
            }
            return newIndex
        })
    }

    const onItemClick = async (item: CommandBarGroupType['items'][number]) => {
        if (!item.href) {
            logExceptionToSentry(new Error(`CommandBar item with id ${item.id} does not have a valid href`))
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: `CommandBar item with id ${item.id} does not have a valid href`,
            })
            return
        }

        history.push(item.href)
        handleClose()

        const currentItemId = sanitizeItemId(item)

        // In this now we will put the id as first item in the list and keep first 5 items then
        const updatedRecentActions: UserPreferencesType['commandBar']['recentNavigationActions'] = [
            {
                id: currentItemId,
            },
            ...(recentActionsGroup?.items || [])
                .filter((action) => sanitizeItemId(action) !== currentItemId)
                .slice(0, 4)
                .map((action) => ({
                    id: sanitizeItemId(action),
                })),
        ]

        await updateUserPreferences({
            path: 'commandBar.recentNavigationActions',
            value: updatedRecentActions,
        })
    }

    const handleEnterSelectedItem = async () => {
        const selectedItem = itemFlatList[selectedItemIndex]

        if (selectedItem) {
            await onItemClick(selectedItem)
        }
    }

    // Intention: To retain the selected item index when recent actions are loaded
    useEffect(() => {
        if (!isLoading && recentActionsGroup?.items?.length && !areFiltersApplied) {
            if (selectedItemIndex !== 0) {
                const selectedIndex = selectedItemIndex + recentActionsGroup.items.length

                const itemElement = itemRefMap.current[itemFlatList[selectedIndex]?.id]
                if (itemElement) {
                    itemElement.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
                }

                setSelectedItemIndex(selectedIndex)
            }
        }
    }, [isLoading, recentActionsGroup])

    useEffect(() => {
        const { keys, description } = SHORT_CUTS.FOCUS_SEARCH_BAR

        registerShortcut({
            keys,
            description,
            callback: focusSearchBar,
        })

        return () => {
            unregisterShortcut(keys)
        }
    }, [])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.stopPropagation()

                if (searchText) {
                    handleClearFilters()
                    setTimeout(() => {
                        focusSearchBar()
                    }, 100)
                } else {
                    handleClose()
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [searchText])

    useEffect(() => {
        const { keys, description } = SHORT_CUTS.ENTER_ITEM

        registerShortcut({
            keys,
            description,
            callback: handleEnterSelectedItem,
        })

        return () => {
            unregisterShortcut(keys)
        }
    }, [selectedItemIndex, itemFlatList, recentActionsGroup])

    useEffect(() => {
        const navigateUpKeys = SHORT_CUTS.NAVIGATE_UP.keys
        const navigateDownKeys = SHORT_CUTS.NAVIGATE_DOWN.keys

        registerShortcut({
            keys: navigateUpKeys,
            description: SHORT_CUTS.NAVIGATE_UP.description,
            callback: () => handleNavigation('up'),
        })

        registerShortcut({
            keys: navigateDownKeys,
            description: SHORT_CUTS.NAVIGATE_DOWN.description,
            callback: () => handleNavigation('down'),
        })

        return () => {
            unregisterShortcut(navigateUpKeys)
            unregisterShortcut(navigateDownKeys)
        }
    }, [itemFlatList])

    const renderNavigationGroups = (baseIndex: number) => {
        let nextIndex = baseIndex

        return filteredGroups.map((group) => {
            nextIndex += group.items.length
            return (
                <CommandGroup
                    key={group.id}
                    {...group}
                    baseIndex={nextIndex - group.items.length}
                    selectedItemIndex={selectedItemIndex}
                    updateItemRefMap={updateItemRefMap}
                    onItemClick={onItemClick}
                />
            )
        })
    }

    // To handle native scroll behavior
    const handleListBoxKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault()
        }
    }

    const renderKeyboardShortcuts = (keys: SupportedKeyboardKeysType[], label: string) => (
        <div className="flexbox dc__gap-8 dc__align-items-center">
            {keys.map((key) => (
                <KeyboardShortcut key={key} keyboardKey={key} />
            ))}
            <span className="cn-9 fs-12 fw-4 lh-20">{label}</span>
        </div>
    )

    return (
        <Backdrop onEscape={noop} onClick={handleClose} deactivateFocusOnEscape={!!searchText}>
            <div
                onClick={stopPropagation}
                className="dc__mxw-720 mxh-500 flexbox-col dc__overflow-hidden dc__content-space br-12 bg__modal--primary command-bar__container w-100 h-100"
            >
                <div className="flexbox-col dc__overflow-hidden">
                    <div className="px-20 py-8">
                        <SearchBar
                            inputProps={{
                                autoFocus: true,
                                placeholder: 'Search or jump to…',
                                ref: searchBarRef,
                            }}
                            initialSearchText={searchText}
                            handleSearchChange={handleSearchChange}
                            noBackgroundAndBorder
                        />
                    </div>

                    {areFiltersApplied && !filteredGroups.length ? (
                        <GenericFilterEmptyState handleClearFilters={handleClearFilters} />
                    ) : (
                        <div
                            className="flexbox-col dc__overflow-auto border__primary--top"
                            role="listbox"
                            aria-label="Command Menu"
                            aria-activedescendant={itemFlatList[selectedItemIndex]?.id}
                            tabIndex={-1}
                            onKeyDown={handleListBoxKeyDown}
                        >
                            {!areFiltersApplied && (
                                <CommandGroup
                                    key="recent-navigation"
                                    {...(recentActionsGroup || RECENT_ACTIONS_GROUP)}
                                    isLoading={isLoading}
                                    baseIndex={0}
                                    selectedItemIndex={selectedItemIndex}
                                    updateItemRefMap={updateItemRefMap}
                                    onItemClick={onItemClick}
                                />
                            )}

                            {renderNavigationGroups(areFiltersApplied ? 0 : recentActionsGroup?.items.length || 0)}
                        </div>
                    )}
                </div>

                <div className="flexbox dc__content-space dc__align-items-center px-20 py-12 border__primary--top bg__secondary">
                    <div className="flexbox dc__gap-20 dc__align-items-center">
                        {renderKeyboardShortcuts(['ArrowUp', 'ArrowDown'], 'to navigate')}
                        {renderKeyboardShortcuts(['Enter'], 'to select')}
                        {renderKeyboardShortcuts(['Escape'], searchText ? 'to clear search' : 'to close')}
                    </div>
                    {renderKeyboardShortcuts(['>'], 'to search actions')}
                </div>
            </div>
        </Backdrop>
    )
}

export default CommandBarBackdrop
