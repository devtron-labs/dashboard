import { useQuery } from '@devtron-labs/devtron-fe-common-lib'

import { GLANCE_METRICS_CARDS_CONFIG, ObservabilityGlanceMetricKeys } from './constants'
import { getObservabilityData } from './service'
import { MetricsInfoCardProps, ObservabilityOverviewDTO, TabDetailsSearchParams, TabDetailsSegment } from './types'

// Will be removing while importing to dashboard
export const MetricsInfoLoadingCard = () => (
    <div className="flexbox-col br-8 bg__primary border__secondary">
        <div className="flexbox dc__gap-12 p-16 dc__content-space">
            <div className="flexbox-col">
                <span className="h-12 mt-4 mb-4 w-40 shimmer" />
                <span className="h-24 mt-6 mb-6 w-40 shimmer" />
            </div>
            <div className="h-24 w-24 m-6 shimmer" />
        </div>
    </div>
)

export const getObservabilityGlanceConfig = (result: Partial<ObservabilityOverviewDTO>) =>
    Object.entries(GLANCE_METRICS_CARDS_CONFIG).map(
        ([key, config]: [ObservabilityGlanceMetricKeys, MetricsInfoCardProps]) => {
            const entry = result?.[key]
            const isNumber = typeof entry === 'number'
            const metricValue = isNumber ? entry : (entry as any)?.value
            const metricTitle = config?.metricTitle

            return {
                ...config,
                dataTestId: key,
                metricValue,
                metricTitle,
            }
        },
    )

export const useGetGlanceConfig = () =>
    useQuery({
        queryKey: ['observabilityGlanceConfig'],
        // queryFn: () => getProjectOverViewCards(), // Mukesh has to update this
        queryFn: async () => ({
            code: 200,
            status: 'SUCCESS',
            result: await getObservabilityData(),
        }),
        // queryFn: () => get<ObservabilityOverviewDTO>(ROUTES.OBSERVABILITY_OVERVIEW), // Will be replacing later
        select: ({ result }) => getObservabilityGlanceConfig(result),
    })

export const parseChartDetailsSearchParams = (searchParams: URLSearchParams): TabDetailsSearchParams => ({
    tab: (searchParams.get('tab') as TabDetailsSegment) || TabDetailsSegment.OVERVIEW,
})
