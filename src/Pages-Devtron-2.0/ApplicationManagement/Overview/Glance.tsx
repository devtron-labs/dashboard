import { GenericSectionErrorState } from '@devtron-labs/devtron-fe-common-lib'

import { MetricsInfoCard, MetricsInfoLoadingCard } from './Overview.components'
import { useGetGlanceConfig } from './services'
import { GlanceMetricKeys } from './types'

const Glance = () => {
    const { isFetching, data, isError, refetch } = useGetGlanceConfig()

    const renderBody = () => {
        if (isFetching) {
            return (
                <div className="dc__grid glance-cards-wrapper">
                    {Object.keys(GlanceMetricKeys).map((key) => (
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
            <div className="dc__grid glance-cards-wrapper">
                {data.map(({ metricTitle, ...props }) => (
                    <MetricsInfoCard key={metricTitle} metricTitle={metricTitle} {...props} />
                ))}
            </div>
        )
    }

    return (
        <div className="flexbox-col dc__gap-12">
            <div className="flex dc__content-space">
                <h2 className="m-0 fs-20 lh-1-5 fw-4 cn-9">At a Glance</h2>
            </div>
            {renderBody()}
        </div>
    )
}

export default Glance
