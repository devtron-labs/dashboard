import { useEffect } from 'react'

import { useQuery } from '@devtron-labs/devtron-fe-common-lib'

import CommandBarBackdrop from './CommandBarBackdrop'
import { getCommandBarResourceLists } from './service'
import { CommandBarBackdropProps, CommandBarProps } from './types'

import './CommandBar.scss'

const CommandBar = ({ showCommandBar, setShowCommandBar }: CommandBarProps) => {
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

    return (
        <CommandBarBackdrop
            handleClose={handleClose}
            resourceList={resourceList}
            isLoadingResourceList={isResourceListLoading}
        />
    )
}

export default CommandBar
