import { InfoBlock } from '@devtron-labs/devtron-fe-common-lib'

import { DeploymentSecurityStatus } from './DeploymentSecurityStatus'
import OverviewPageHeader from './OverviewPageHeader'
import SecurityAtAGlance from './SecurityAtAGlance'
import { SeverityInsights } from './SeverityInsights'

import './styles.scss'

const SecurityCenterOverview = () => (
    <>
        <OverviewPageHeader />

        <div className="security-center-overview flex-grow-1 bg__secondary dc__overflow-auto">
            <InfoBlock
                variant="neutral"
                description="Showing key metrics and trends on vulnerabilities across all active deployments."
                borderConfig={{ left: false, right: false, top: false }}
                borderRadiusConfig={{ bottom: false, top: false }}
            />
            <div className="p-20 w-100 flexbox-col dc__gap-32 dc__mxw-1200 min-w-800 dc__m-auto">
                <SecurityAtAGlance />
                <SeverityInsights />
                <DeploymentSecurityStatus />
            </div>
        </div>
    </>
)

export default SecurityCenterOverview
