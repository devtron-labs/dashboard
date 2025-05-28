import { useEffect } from 'react'

import { noop } from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'
import { UseTabsReturnType } from '@Components/common/DynamicTabs/types'

import { MONITORING_DASHBOARD_TAB_ID } from '../Constants'

interface MonitoringDashboardWrapperProps {
    markTabActiveById: UseTabsReturnType['markTabActiveById']
}

const MonitoringDashboard = importComponentFromFELibrary('MonitoringDashboard', null, 'function')

const MonitoringDashboardWrapper = ({ markTabActiveById }: MonitoringDashboardWrapperProps) => {
    useEffect(() => {
        markTabActiveById(MONITORING_DASHBOARD_TAB_ID).catch(noop)
    }, [])

    return <MonitoringDashboard />
}

export default MonitoringDashboardWrapper
