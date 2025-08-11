import { useEffect, useState } from 'react'

import {
    API_STATUS_CODES,
    Backdrop,
    getUserPreferences,
    KeyboardShortcut,
    ResponseType,
    SearchBar,
    useQuery,
    useRegisterShortcut,
} from '@devtron-labs/devtron-fe-common-lib'

import CommandGroup from './CommandGroup'
import { NAVIGATION_GROUPS, RECENT_ACTIONS_GROUP, SHORT_CUTS } from './constants'
import { CommandBarGroupType } from './types'

import './CommandBar.scss'

const CommandBar = () => {
    const [showCommandBar, setShowCommandBar] = useState(false)

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
        queryKey: [showCommandBar, 'recentNavigationActions'],
        enabled: showCommandBar,
        select: ({ result }) =>
            result.commandBar.recentNavigationActions.reduce<CommandBarGroupType>((acc, action) => {
                const requiredGroup = NAVIGATION_GROUPS.find((group) =>
                    group.items.some((item) => item.id === action.id),
                )

                if (requiredGroup) {
                    const requiredItem = requiredGroup.items.find((item) => item.id === action.id)
                    if (requiredItem) {
                        acc.items.push(structuredClone(requiredItem))
                    }
                }
                return acc
            }, structuredClone(RECENT_ACTIONS_GROUP)),
    })

    const { registerShortcut, unregisterShortcut } = useRegisterShortcut()

    const handleClose = () => {
        setShowCommandBar(false)
    }

    const handleOpen = () => {
        setShowCommandBar(true)
    }

    useEffect(() => {
        registerShortcut({
            keys: SHORT_CUTS.OPEN_COMMAND_BAR.keys,
            description: 'Open Command Bar',
            callback: handleOpen,
        })

        return () => {
            unregisterShortcut(SHORT_CUTS.OPEN_COMMAND_BAR.keys)
        }
    }, [])

    if (!showCommandBar) {
        return null
    }

    return (
        <Backdrop onEscape={handleClose}>
            <div className="dc__mxw-800 mxh-450 flexbox-col dc__overflow-auto dc__content-space br-12 bg__modal--primary command-bar__container w-100 h-100">
                <div className="flexbox-col dc__overflow-auto">
                    <div className="px-20 py-8">
                        <SearchBar
                            inputProps={{
                                autoFocus: true,
                                placeholder: 'Search or jump to…',
                            }}
                            noBackgroundAndBorder
                        />
                    </div>

                    <div
                        className="flexbox-col dc__overflow-auto border__primary--top pt-8"
                        role="listbox"
                        aria-label="Command Menu"
                        // TODO: aria-activedescendant for the currently focused item
                    >
                        <CommandGroup isLoading={isLoading} {...(recentActionsGroup || RECENT_ACTIONS_GROUP)} />

                        {NAVIGATION_GROUPS.map((group) => (
                            <CommandGroup key={group.id} {...group} />
                        ))}
                    </div>
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

export default CommandBar
