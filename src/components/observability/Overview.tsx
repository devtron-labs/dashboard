import { useRouteMatch } from 'react-router-dom'

import {
    BreadCrumb,
    GenericSectionErrorState,
    PageHeader,
    TabGroup,
    useBreadcrumb,
} from '@devtron-labs/devtron-fe-common-lib'

import { BarMetrics } from './Metrics/BarMetrics'
import { ObservabilityGraphMetrics } from './Metrics/ObservabilityGraphMetrics'
import { MetricsInfoCard } from './MetricsInfoCard'
import { GlanceMetricsKeys, OverviewProps } from './types'
import { getBreadCrumbObj, getTabsObj, MetricsInfoLoadingCard, useGetGlanceConfig } from './utils'

import './styles.scss'

export const Overview = ({ view = 'tenants', url }: OverviewProps) => {
    const { isFetching, data, isError, refetch } = useGetGlanceConfig()

    const { path } = useRouteMatch()

    const getObservabilityTabs = () => <TabGroup tabs={getTabsObj(view, path)} hideTopPadding />

    const { breadcrumbs } = useBreadcrumb(getBreadCrumbObj(view, url), [])

    const renderBreadcrumbs = () => <BreadCrumb breadcrumbs={breadcrumbs} />
    const renderPageHeader = () => (
        <PageHeader
            showTabs={view !== 'singleVm'}
            renderHeaderTabs={getObservabilityTabs}
            breadCrumbs={renderBreadcrumbs}
            isBreadcrumbs
        />
    )
    const renderGlanceConfig = () => {
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
            return <GenericSectionErrorState reload={refetch} rootClassName="bg__primary br-8 border__secondary" />
        }

        return (
            <div className="dc__grid glance-cards-wrapper">
                {data?.glanceConfig.map((config) => <MetricsInfoCard {...config} key={config.metricTitle} />)}
            </div>
        )
    }

    return (
        <div className="observability-overview flex-grow-1 dc__overflow-auto flexbox-col">
            {renderPageHeader()}
            <div className="flexbox-col dc__gap-32 bg__secondary p-20 flex-grow-1">
                {view !== 'singleVm' && (
                    <div className="flexbox-col dc__gap-12">
                        <div className="flexbox dc__content-space">
                            <h3 className="m-0 cn-9 fs-20 fw-4 lh-1-5">At a Glance</h3>
                        </div>
                        {renderGlanceConfig()}
                    </div>
                )}
                <div className="flexbox-col dc__gap-12">
                    <h2 className="m-0 fs-20 lh-1-5 fw-4 cn-9">Observability Metrics</h2>
                    <ObservabilityGraphMetrics />

                    <BarMetrics data={data?.metrics} />
                </div>
            </div>
        </div>
    )
}
