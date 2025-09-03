import { useEffect } from 'react'

import { useQuery } from '@devtron-labs/devtron-fe-common-lib'

import { getAppListMin } from '@Services/service'

import CommandBarBackdrop from './CommandBarBackdrop'
import { CommandBarProps } from './types'

import './CommandBar.scss'

const CommandBar = ({ showCommandBar, setShowCommandBar }: CommandBarProps) => {
    const { isLoading: isLoadingAppList, data: appList } = useQuery({
        queryKey: ['commandBar__app-list'],
        queryFn: () => getAppListMin(),
        refetchInterval: (+window._env_.COMMAND_BAR_REFETCH_INTERVAL || 30) * 1000,
        select: ({ result }) => result,
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

    return <CommandBarBackdrop handleClose={handleClose} appList={appList} isLoadingAppList={isLoadingAppList} />
}

export default CommandBar
