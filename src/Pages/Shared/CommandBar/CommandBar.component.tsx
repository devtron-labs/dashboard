import { useEffect, useState } from 'react'

import { useRegisterShortcut, UseRegisterShortcutProvider } from '@devtron-labs/devtron-fe-common-lib'

import CommandBarBackdrop from './CommandBarBackdrop'
import { SHORT_CUTS } from './constants'

import './CommandBar.scss'

const CommandBar = () => {
    const [showCommandBar, setShowCommandBar] = useState(false)
    const { registerShortcut, unregisterShortcut } = useRegisterShortcut()

    const handleOpen = () => {
        setShowCommandBar(true)
    }

    const handleClose = () => {
        setShowCommandBar(false)
    }

    useEffect(() => {
        const { keys } = SHORT_CUTS.OPEN_COMMAND_BAR

        registerShortcut({
            keys,
            description: SHORT_CUTS.OPEN_COMMAND_BAR.description,
            callback: handleOpen,
        })

        return () => {
            unregisterShortcut(keys)
        }
    }, [])

    if (!showCommandBar) {
        return null
    }

    return (
        <UseRegisterShortcutProvider ignoreTags={[]}>
            <CommandBarBackdrop handleClose={handleClose} />
        </UseRegisterShortcutProvider>
    )
}

export default CommandBar
