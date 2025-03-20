import { UseTabsReturnType } from '@Components/common/DynamicTabs/types'
import { useEffect } from 'react'
import { noop } from '@devtron-labs/devtron-fe-common-lib'
import { ResourceBrowserTabsId } from '../Constants'

export const AdminTerminalWrapper = ({ markTabActiveById }: Pick<UseTabsReturnType, 'markTabActiveById'>) => {
    useEffect(() => {
        markTabActiveById(ResourceBrowserTabsId.terminal).catch(noop)
    }, [])

    return <div id="admin-terminal" />
}
