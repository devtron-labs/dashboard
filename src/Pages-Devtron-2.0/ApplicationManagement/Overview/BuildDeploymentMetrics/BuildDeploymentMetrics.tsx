import DoraMetrics from './DoraMetrics'
import PipelineTriggerInsights from './PipelineTriggerInsights'
import TriggerBuildTimeChart from './TriggerBuildTimeChart'

const BuildDeploymentMetrics = () => (
    <div className="flexbox-col dc__gap-12">
        <h2 className="m-0 fs-20 lh-1-5 fw-4 cn-9">Build & Deployment Metrics</h2>
        <DoraMetrics />
        <TriggerBuildTimeChart />
        <PipelineTriggerInsights />
    </div>
)

export default BuildDeploymentMetrics
