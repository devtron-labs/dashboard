import AutoBlockedDeployments from './AutoBlockedDeployments'
import CoverageMetrics from './CoverageMetrics'

const DeploymentSecurityStatus = () => (
    <div className="flexbox-col dc__gap-12">
        <h2 className="m-0 fs-20 lh-1-5 fw-4 cn-9">Deployment Security Status</h2>
        <div className="flexbox-col dc__gap-8">
            <CoverageMetrics />
            <AutoBlockedDeployments />
        </div>
    </div>
)

export default DeploymentSecurityStatus
