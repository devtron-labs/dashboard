import {
    Button,
    ButtonComponentType,
    ButtonVariantType,
    ClusterFiltersType,
    GenericEmptyState,
    Icon,
    InfoBlock,
    URLS as COMMON_URLS,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'
import { URLS } from '@Config/routes'

import InfrastructureManagementAtAGlance from './AtAGlance'
import { ClusterAndNodes } from './ClusterAndNodes'
import OverviewPageHeader from './OverviewPageHeader'
import { useGetInfraOverview } from './service'
import { getClusterListingUrl } from './utils'

import './styles.scss'

const ActionsAndInsights = importComponentFromFELibrary('ActionsAndInsights', null, 'function')
const ClusterCostVisibility = importComponentFromFELibrary('ClusterCostVisibility', null, 'function')

const Overview = () => {
    const { isFetching, isError, data, refetch } = useGetInfraOverview()

    const infraOverviewQueryState = { isFetching, isError, refetch }

    const noConnectedClusters = data?.totalClusters <= 0
    const noReachableClusters = data?.reachableClusters <= 0
    const allClusterReachable = data?.totalClusters === data?.reachableClusters

    const renderButton = () => (
        <Button
            dataTestId="add-view-cluster"
            text={noConnectedClusters ? 'Add Cluster' : 'View Clusters'}
            startIcon={noConnectedClusters ? <Icon name="ic-add" color={null} /> : null}
            endIcon={noConnectedClusters ? null : <Icon name="ic-arrow-right" color={null} />}
            component={ButtonComponentType.link}
            linkProps={{
                to: noConnectedClusters
                    ? URLS.GLOBAL_CONFIG_CLUSTER
                    : COMMON_URLS.INFRASTRUCTURE_MANAGEMENT_RESOURCE_BROWSER,
            }}
        />
    )

    return (
        <>
            <OverviewPageHeader />
            {!isFetching && !isError && (noConnectedClusters || noReachableClusters) ? (
                <GenericEmptyState
                    imgName="img-folder-empty"
                    title="No Clusters Found"
                    subTitle={
                        noConnectedClusters ? 'No clusters are connected' : 'Connected clusters are not reachable'
                    }
                    isButtonAvailable
                    renderButton={renderButton}
                />
            ) : (
                <div
                    className={`infra-management-overview flex-grow-1 dc__overflow-hidden ${ActionsAndInsights ? 'dc__grid' : 'flexbox-col'}`}
                >
                    <div className="flexbox-col dc__overflow-auto bg__secondary">
                        {!allClusterReachable && (
                            <InfoBlock
                                variant="neutral"
                                heading="Data excludes unreachable clusters"
                                description="Some clusters couldn’t be reached due to connection failures, so their data isn’t included."
                                buttonProps={{
                                    dataTestId: 'view-unreachable-clusters',
                                    text: 'View Unreachable Clusters',
                                    variant: ButtonVariantType.text,
                                    endIcon: <Icon name="ic-arrow-square-out" color={null} />,
                                    component: ButtonComponentType.link,
                                    linkProps: {
                                        to: getClusterListingUrl(ClusterFiltersType.CONNECTION_FAILED),
                                    },
                                }}
                                borderConfig={{ left: false, right: false, top: false }}
                                borderRadiusConfig={{ bottom: false, top: false }}
                            />
                        )}
                        <div className="flexbox-col dc__gap-32 p-20 w-100 dc__mxw-1200 min-w-800 dc__m-auto">
                            <InfrastructureManagementAtAGlance
                                {...infraOverviewQueryState}
                                infraGlanceConfig={data?.infraGlanceConfig}
                            />
                            <ClusterAndNodes {...infraOverviewQueryState} clusterNodeConfig={data?.clusterNodeConfig} />
                            {ClusterCostVisibility && <ClusterCostVisibility />}
                        </div>
                    </div>

                    {ActionsAndInsights && <ActionsAndInsights />}
                </div>
            )}
        </>
    )
}

export default Overview
