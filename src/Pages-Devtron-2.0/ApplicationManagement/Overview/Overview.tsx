import { importComponentFromFELibrary } from '@Components/common'

import { BuildDeploymentMetrics } from './BuildDeploymentMetrics'
import Glance from './Glance'
import OverviewPageHeader from './OverviewPageHeader'
import WorkflowOverview from './WorkflowOverview'

import './styles.scss'

const BestPractices = importComponentFromFELibrary('BestPractices', null, 'function')
const CostMetrics = importComponentFromFELibrary('CostMetrics', null, 'function')

const Overview = () => (
    <>
        <OverviewPageHeader />
        <div className="application-management-overview flex-grow-1 bg__secondary dc__overflow-auto">
            <div className="p-20 w-100 flexbox-col dc__gap-32 dc__mxw-1200 min-w-800 dc__m-auto">
                <Glance />
                <WorkflowOverview />
                <BuildDeploymentMetrics />
                {CostMetrics && <CostMetrics />}
                {BestPractices && <BestPractices />}
            </div>
        </div>
    </>
)

export default Overview
