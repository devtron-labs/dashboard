import { GenericSectionErrorState } from '@devtron-labs/devtron-fe-common-lib'

import CapacityAndResources from './CapacityAndResources'
import ClusterCounts from './ClusterCounts'
import ClusterNodeHealth from './ClusterNodeHealth'
import NodeCounts from './NodeCount'
import { InfraOverviewClusterAndNodesProps } from './types'
import { ClusterNodesLoadingState } from './utils'

const ClusterAndNodes = ({ isFetching, isError, refetch, clusterNodeConfig }: InfraOverviewClusterAndNodesProps) => {
    const { clusterNodeHealth, clusterDistribution, nodeDistribution, clusterCapacityDistribution } =
        clusterNodeConfig || {}

    const renderBody = () => {
        if (isFetching) {
            return <ClusterNodesLoadingState />
        }

        if (isError || !clusterNodeConfig) {
            return (
                <GenericSectionErrorState
                    subTitle=""
                    reload={refetch}
                    rootClassName="bg__primary br-8 border__secondary"
                />
            )
        }

        return (
            <>
                <ClusterNodeHealth clusterNodeHealth={clusterNodeHealth} />
                <ClusterCounts clusterDistribution={clusterDistribution} />
                <CapacityAndResources clusterCapacityDistribution={clusterCapacityDistribution} />
                <NodeCounts nodeDistribution={nodeDistribution} />
            </>
        )
    }

    return (
        <div className="flexbox-col dc__gap-12">
            <h2 className="fs-20 fw-4 lh-1-5 cn-9 m-0">Cluster & Nodes</h2>
            {renderBody()}
        </div>
    )
}

export default ClusterAndNodes
