import { importComponentFromFELibrary } from '@Components/common'
import { UseTabsReturnType } from '@Components/common/DynamicTabs/types'
import { useEffect } from 'react'
import { noop } from '@devtron-labs/devtron-fe-common-lib'
import { MONITORING_DASHBOARD_TAB_ID } from '../Constants'

const MonitoringDashboard = importComponentFromFELibrary('MonitoringDashboard', null, 'function')

export const MonitoringDashboardWrapper = ({ markTabActiveById }: Pick<UseTabsReturnType, 'markTabActiveById'>) => {
    useEffect(() => {
        markTabActiveById(MONITORING_DASHBOARD_TAB_ID).catch(noop)
    }, [])

    return <MonitoringDashboard />
}
