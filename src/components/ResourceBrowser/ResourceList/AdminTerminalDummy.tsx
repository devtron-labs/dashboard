import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { ResourceBrowserTabsId } from '../Constants'
import { AdminTerminalDummyProps } from './types'

const AdminTerminalDummy = ({ updateTabUrl, clusterName, getTabById }: AdminTerminalDummyProps) => {
    const { pathname, search } = useLocation()

    useEffect(() => {
        const tab = getTabById(ResourceBrowserTabsId.terminal)

        if (!clusterName || !tab?.title.includes(clusterName)) {
            return
        }

        updateTabUrl({
            id: ResourceBrowserTabsId.terminal,
            url: `${pathname}${search}`,
            dynamicTitle: `Terminal ${clusterName}`,
        })
    }, [clusterName])

    return null
}

export default AdminTerminalDummy
