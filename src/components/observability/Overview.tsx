import {
    BreadCrumb,
    BreadcrumbText,
    GenericSectionErrorState,
    PageHeader,
    useBreadcrumb,
} from '@devtron-labs/devtron-fe-common-lib'

import { MetricsInfoCard } from './MetricsInfoCard'
import ObservabilityIconComponent from './ObservabilityIcon'
import { GlanceMetricsKeys } from './types'
import { MetricsInfoLoadingCard, useGetGlanceConfig } from './utils'

import './styles.scss'

export const Overview = () => {
    const { isFetching, data, isError, refetch } = useGetGlanceConfig()

    console.log(data)
    const { breadcrumbs } = useBreadcrumb({
        alias: {
            observability: {
                component: <ObservabilityIconComponent />,
                linked: true,
            },
            overview: {
                component: <BreadcrumbText heading="Overview" isActive />,
                linked: false,
            },
        },
    })
    const renderBreadcrumbs = () => <BreadCrumb breadcrumbs={breadcrumbs} />

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

        return (
            <div className="dc__grid glance-cards-wrapper">
                {data.map((config) => (
                    <MetricsInfoCard {...config} key={config.metricTitle} />
                ))}
            </div>
        )
    }

    return (
        <div className="observability-overview flex-grow-1 dc__overflow-auto">
            <PageHeader isBreadcrumbs breadCrumbs={renderBreadcrumbs} />

            <div className="flexbox-col dc__gap-32 dc__overflow-auto p-20 flex-grow-1">
                <div className="flexbox-col dc__gap-16">
                    <div className="flexbox dc__content-space dc__gap-16">
                        <h3 className="m-0 cn-9 fs-20 fw-4 lh-1-5">At a Glance</h3>
                    </div>
                </div>
                {renderBody()}
            </div>
        </div>
    )
}
