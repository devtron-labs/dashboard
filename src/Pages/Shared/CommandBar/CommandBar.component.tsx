import { useEffect, useState } from 'react'

import { handleAnalyticsEvent, useQuery } from '@devtron-labs/devtron-fe-common-lib'

import CommandBarBackdrop from './CommandBarBackdrop'
import NavigationUpgradedDialog from './NavigationUpgradedDialog'
import { getCommandBarResourceLists } from './service'
import { CommandBarBackdropProps, CommandBarProps } from './types'
import { getShowUpgradeDialogFromLocalStorage, hideUpgradeDialogInLocalStorage } from './utils'

import './CommandBar.scss'

const CommandBar = ({ showCommandBar, setShowCommandBar }: CommandBarProps) => {
    const [showUpgradeDialog, setShowUpgradeDialog] = useState(getShowUpgradeDialogFromLocalStorage())
    const { isLoading: isResourceListLoading, data: resourceList } = useQuery<
        CommandBarBackdropProps['resourceList'],
        CommandBarBackdropProps['resourceList'],
        [string],
        false
    >({
        queryKey: ['commandBar__app-list'],
        queryFn: ({ signal }) => getCommandBarResourceLists(signal),
        refetchInterval: (+window._env_.COMMAND_BAR_REFETCH_INTERVAL || 3600) * 1000,
    })

    const handleClose = () => {
        setShowCommandBar(false)
    }

    const handleCloseUpgradeDialog = () => {
        setShowUpgradeDialog(false)
        hideUpgradeDialogInLocalStorage()
    }

    useEffect(() => {
        const handleOpen = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                handleCloseUpgradeDialog()
                setShowCommandBar(true)
                handleAnalyticsEvent({
                    category: 'command-bar-shortcut',
                    action: 'command-bar-shortcut-press',
                })
            }
        }
        window.addEventListener('keydown', handleOpen)
        return () => {
            window.removeEventListener('keydown', handleOpen)
        }
    }, [])

    if (!showCommandBar) {
        return <NavigationUpgradedDialog isOpen={showUpgradeDialog} onClose={handleCloseUpgradeDialog} />
    }

    return (
        <CommandBarBackdrop
            handleClose={handleClose}
            resourceList={resourceList}
            isLoadingResourceList={isResourceListLoading}
        />
    )
}

export default CommandBar
