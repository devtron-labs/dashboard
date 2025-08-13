import { useEffect, useMemo, useRef, useState } from 'react'
import { useHistory } from 'react-router-dom'

import {
    API_STATUS_CODES,
    Backdrop,
    GenericFilterEmptyState,
    getUserPreferences,
    KeyboardShortcut,
    logExceptionToSentry,
    ResponseType,
    SearchBar,
    stopPropagation,
    updateUserPreferences,
    useQuery,
    useRegisterShortcut,
    UserPreferencesType,
} from '@devtron-labs/devtron-fe-common-lib'

import CommandGroup from './CommandGroup'
import { NAVIGATION_GROUPS, RECENT_ACTIONS_GROUP, RECENT_NAVIGATION_ITEM_ID_PREFIX, SHORT_CUTS } from './constants'
import { CommandBarActionIdType, CommandBarBackdropProps, CommandBarGroupType, CommandBarItemType } from './types'

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

                    if (requiredItem) {
                        acc.items.push(structuredClone(requiredItem))
                    }
                }
                return acc
            }, structuredClone(RECENT_ACTIONS_GROUP)),
    })

    const areFiltersApplied = !!searchText

    const searchBarRef = useRef<HTMLInputElement>(null)
    const itemRefMap = useRef<Record<string, HTMLDivElement>>({})

    const handleSearchChange = (value: string) => {
        setSearchText(value)
        setSelectedItemIndex(0)
    }

    const updateItemRefMap = (id: string, el: HTMLDivElement) => {
        itemRefMap.current[id] = el
    }

    const lowerCaseSearchText = searchText.toLowerCase()

    const filteredGroups = searchText
        ? NAVIGATION_GROUPS.reduce<typeof NAVIGATION_GROUPS>((acc, group) => {
              const filteredItems = group.items.filter((item) => item.title.toLowerCase().includes(lowerCaseSearchText))

              if (filteredItems.length > 0) {
                  acc.push({
                      ...group,
                      items: filteredItems,
                  })
              }

              return acc
          }, [])
        : NAVIGATION_GROUPS

    const itemFlatList: CommandBarGroupType['items'] = useMemo(() => {
        if (areFiltersApplied) {
            return filteredGroups.flatMap((group) => group.items)
        }

        return recentActionsGroup
            ? [...recentActionsGroup.items, ...NAVIGATION_GROUPS.flatMap((group) => group.items)]
            : []
    }, [recentActionsGroup, filteredGroups])

    const handleClearFilters = () => {
        setSearchText('')
    }

    const handleEscape = () => {
        if (searchText) {
            handleClearFilters()
            return
        }

        handleClose()
    }

    const focusSearchBar = () => {
        if (searchBarRef.current) {
            searchBarRef.current.focus()
        }
    }

    const getNewSelectedIndex = (prevIndex: number, type: 'up' | 'down') => {
        if (type === 'up') {
            return prevIndex === 0 ? itemFlatList.length - 1 : prevIndex - 1
        }
        return prevIndex === itemFlatList.length - 1 ? 0 : prevIndex + 1
    }

    const handleNavigation = (type: 'up' | 'down') => {
        if (!itemFlatList.length) {
            return
        }

        // Want this to have cyclic navigation
        setSelectedItemIndex((prevIndex) => {
            const newIndex = getNewSelectedIndex(prevIndex, type)
            const item = itemFlatList[newIndex]
            const itemElement = itemRefMap.current[item.id]
            if (itemElement) {
                itemElement.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
            }
            return newIndex
        })
    }

    useEffect(() => {
        registerShortcut({
            keys: SHORT_CUTS.FOCUS_SEARCH_BAR.keys,
            description: SHORT_CUTS.FOCUS_SEARCH_BAR.description,
            callback: focusSearchBar,
        })

        return () => {
            unregisterShortcut(SHORT_CUTS.FOCUS_SEARCH_BAR.keys)
        }
    }, [])

    useEffect(() => {
        registerShortcut({
            keys: SHORT_CUTS.NAVIGATE_UP.keys,
            description: SHORT_CUTS.NAVIGATE_UP.description,
            callback: () => handleNavigation('up'),
        })

        registerShortcut({
            keys: SHORT_CUTS.NAVIGATE_DOWN.keys,
            description: SHORT_CUTS.NAVIGATE_DOWN.description,
            callback: () => handleNavigation('down'),
        })

        return () => {
            unregisterShortcut(SHORT_CUTS.NAVIGATE_UP.keys)
            unregisterShortcut(SHORT_CUTS.NAVIGATE_DOWN.keys)
        }
    }, [itemFlatList])

    const sanitizeItemId = (item: CommandBarItemType) =>
        (item.id.startsWith(RECENT_NAVIGATION_ITEM_ID_PREFIX)
            ? item.id.replace(RECENT_NAVIGATION_ITEM_ID_PREFIX, '')
            : item.id) as CommandBarActionIdType

    const onItemClick = async (item: CommandBarGroupType['items'][number]) => {
        if (!item.href) {
            logExceptionToSentry(new Error(`CommandBar item with id ${item.id} does not have a valid href`))
            return
        }

        history.push(item.href)
        handleClose()

        const currentItemId = sanitizeItemId(item)

        // const updatedRecentActions = recentActionsGroup?.items.filter((action) => action.id !== currentItemId)
        // In this now we will put the id as first item in the list and keep first 5 items then
        const updatedRecentActions: UserPreferencesType['commandBar']['recentNavigationActions'] = [
            {
                id: currentItemId as CommandBarActionIdType,
            },
            ...(recentActionsGroup?.items
                .filter((action) => sanitizeItemId(action) !== currentItemId)
                .slice(0, 4)
                .map((action) => ({
                    id: sanitizeItemId(action),
                })) || []),
        ]

        await updateUserPreferences({
            path: 'commandBar.recentNavigationActions',
            value: updatedRecentActions,
        })
    }

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

    // Add this handler to prevent browser native scrolling
    const handleListBoxKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault()
        }
    }

    return (
        <Backdrop onEscape={handleEscape} onClick={handleClose} deactivateFocusOnEscape={!!searchText}>
            <div
                onClick={stopPropagation}
                className="dc__mxw-800 mxh-450 flexbox-col dc__overflow-hidden dc__content-space br-12 bg__modal--primary command-bar__container w-100 h-100"
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
                            className="flexbox-col dc__overflow-auto border__primary--top pt-8"
                            role="listbox"
                            aria-label="Command Menu"
                            aria-activedescendant={itemFlatList[selectedItemIndex]?.id}
                            tabIndex={-1}
                            onKeyDown={handleListBoxKeyDown}
                        >
                            {!areFiltersApplied && (
                                <CommandGroup
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
                        <div className="flexbox dc__gap-8 dc__align-items-center">
                            <KeyboardShortcut keyboardKey="ArrowUp" />
                            <KeyboardShortcut keyboardKey="ArrowDown" />
                            <span className="cn-9 fs-12 fw-4 lh-20">to navigate</span>
                        </div>

                        <div className="flexbox dc__gap-8 dc__align-items-center">
                            <KeyboardShortcut keyboardKey="Enter" />
                            <span className="cn-9 fs-12 fw-4 lh-20">to select</span>
                        </div>

                        <div className="flexbox dc__gap-8 dc__align-items-center">
                            <KeyboardShortcut keyboardKey="Escape" />
                            <span className="cn-9 fs-12 fw-4 lh-20">to close</span>
                        </div>
                    </div>

                    <div className="flexbox dc__gap-8 dc__align-items-center">
                        <KeyboardShortcut keyboardKey=">" />
                        <span className="cn-9 fs-12 fw-4 lh-20">to search actions</span>
                    </div>
                </div>
            </div>
        </Backdrop>
    )
}

export default CommandBarBackdrop
