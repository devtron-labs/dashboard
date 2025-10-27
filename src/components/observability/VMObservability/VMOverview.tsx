import { GenericSectionErrorState } from '@devtron-labs/devtron-fe-common-lib'

import { MetricsInfoCard } from '../MetricsInfoCard'
// import ObservabilityIconComponent from './ObservabilityIcon'
import { GlanceMetricsKeys } from '../types'
import { MetricsInfoLoadingCard, useGetGlanceConfig } from '../utils'

import '../styles.scss'

export const VMOverview = () => {
    const { isFetching, isError, refetch } = useGetGlanceConfig()

    const renderBody = () => {
        if (isFetching) {
            return (
                <div className="dc__grid glance-cards-wrapper">
                    {Object.keys(GlanceMetricsKeys).map((key) => (
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
        // alert(JSON.stringify(data))
        return (
            <div className="dc__grid glance-cards-wrapper">
                <MetricsInfoCard
                    tooltipContent="paliwal"
                    dataTestId="id"
                    metricValue="value"
                    metricTitle="title"
                    metricUnit="unit"
                    valueOutOf="valueof"
                    iconName="ic-bg-cpu"
                />
            </div>
        )
    }

    return (
        <div className="flexbox-col dc__gap-32 dc__overflow-auto p-20 flex-grow-1">
            <div className="flexbox-col dc__gap-16">
                <div className="flexbox dc__content-space dc__gap-16">
                    <h3 className="m-0 cn-9 fs-20 fw-4 lh-1-5">At a Glance</h3>
                </div>
            </div>
            {renderBody()}
        </div>
    )
}

export default VMOverview
