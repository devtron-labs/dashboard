import { GenericSectionErrorState } from '@devtron-labs/devtron-fe-common-lib'

import { MetricsInfoCard } from '../MetricsInfoCard'
// import ObservabilityIconComponent from './ObservabilityIcon'
import { GlanceMetricsKeys } from '../types'
import { MetricsInfoLoadingCard, useGetGlanceConfig } from '../utils'

import '../styles.scss'

export const VMOverview = () => {
    const { isFetching, data, isError, refetch } = useGetGlanceConfig()
    console.log(data)

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
            <div className="dc__grid workflow-overview-cards-wrapper">
                {data.map((value) => {
                    return <MetricsInfoCard key={value.metricTitle} {...value} />
                })}
            </div>
        )
    }

    return (
        <div className="flexbox-col dc__gap-32 dc__overflow-auto p-20 flex-grow-1 bg__secondary">
            <div className="flexbox-col dc__gap-16">
                <div className="flexbox dc__content-space dc__gap-16">
                    <h3 className="m-0 cn-9 fs-20 fw-4 lh-1-5">At a Glance</h3>
                </div>
            </div>
            <div className="flexbox-col dc__gap-12">
                {renderBody()}
            </div>
            <div className="dc__grid workflow-overview-cards-wrapper">
                <div className="flexbox-col bg__primary br-8 border__secondary">
                    <div className="flex left px-16 py-12 border__secondary--bottom">
                        <span className="fs-14 fw-6 lh-1-5 cn-9">CPU</span>
                    </div>
                    <div className="flex h-200">
                        <img src='https://community.grafana.com/t/drill-down-in-bar-graph/70193' />
                    </div>
                </div>
                <div className="flexbox-col bg__primary br-8 border__secondary">
                    <div className="flex left px-16 py-12 border__secondary--bottom">
                        <span className="fs-14 fw-6 lh-1-5 cn-9">CPU</span>
                    </div>
                    <div className="flex h-200">
                        <img src='https://community.grafana.com/t/drill-down-in-bar-graph/70193' />
                    </div>
                </div>
                <div className="flexbox-col bg__primary br-8 border__secondary">
                    <div className="flex left px-16 py-12 border__secondary--bottom">
                        <span className="fs-14 fw-6 lh-1-5 cn-9">CPU</span>
                    </div>
                    <div className="flex h-200">
                        <img src='https://community.grafana.com/t/drill-down-in-bar-graph/70193' />
                    </div>
                </div>
                <div className="flexbox-col bg__primary br-8 border__secondary">
                    <div className="flex left px-16 py-12 border__secondary--bottom">
                        <span className="fs-14 fw-6 lh-1-5 cn-9">CPU</span>
                    </div>
                    <div className="flex h-200">
                        <img src='https://community.grafana.com/t/drill-down-in-bar-graph/70193' />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VMOverview
