import { useEffect } from 'react'

import CommandBarBackdrop from './CommandBarBackdrop'
import { CommandBarProps } from './types'

import './CommandBar.scss'

const CommandBar = ({ showCommandBar, setShowCommandBar }: CommandBarProps) => {
    const handleClose = () => {
        setShowCommandBar(false)
    }

    useEffect(() => {
        const handleOpen = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setShowCommandBar(true)
            }
        }
        window.addEventListener('keydown', handleOpen)
        return () => {
            window.removeEventListener('keydown', handleOpen)
        }
    }, [])

    if (!showCommandBar) {
        return null
    }

    return <CommandBarBackdrop handleClose={handleClose} />
}

export default CommandBar
