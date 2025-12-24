import { GenericSectionErrorState, MetricsInfoCard, MetricsInfoLoadingCard } from '@devtron-labs/devtron-fe-common-lib'

import { useGetWorkflowOverviewConfig } from './services'
import { WorkflowOverviewMetricKeys } from './types'

const WorkflowOverview = () => {
    const { isFetching, data, isError, refetch } = useGetWorkflowOverviewConfig()

    const renderCards = () => {
        if (isFetching) {
            return (
                <div className="dc__grid workflow-overview-cards-wrapper">
                    {Object.keys(WorkflowOverviewMetricKeys).map((key) => (
                        <MetricsInfoLoadingCard key={key} />
                    ))}
                </div>
            )
        }

        if (isError) {
            return (
                <GenericSectionErrorState
                    subTitle=""
                    reload={refetch}
                    rootClassName="bg__primary br-8 border__secondary"
                />
            )
        }

        return (
            <div className="dc__grid workflow-overview-cards-wrapper">
                {data.map(({ metricTitle, ...props }) => (
                    <MetricsInfoCard key={metricTitle} metricTitle={metricTitle} {...props} />
                ))}
            </div>
        )
    }

    return (
        <div className="flexbox-col dc__gap-12">
            <div className="flex dc__content-space">
                <h2 className="m-0 fs-20 lh-1-5 fw-4 cn-9">Workflow Overview</h2>
            </div>
            {renderCards()}
        </div>
    )
}

export default WorkflowOverview
