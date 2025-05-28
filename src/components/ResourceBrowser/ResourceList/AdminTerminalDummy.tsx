import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { noop } from '@devtron-labs/devtron-fe-common-lib/dist'

import { ResourceBrowserTabsId } from '../Constants'
import { AdminTerminalDummyProps } from './types'

const AdminTerminalDummy = ({ markTabActiveById, updateTabUrl, clusterName, getTabById }: AdminTerminalDummyProps) => {
    const { pathname, search } = useLocation()

    useEffect(() => {
        markTabActiveById(ResourceBrowserTabsId.terminal).catch(noop)
    }, [])

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
