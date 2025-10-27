import { useQuery } from '@devtron-labs/devtron-fe-common-lib'

import { getObservabilityData } from './service'
import { TabDetailsSearchParams, TabDetailsSegment } from './types'

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

export const useGetGlanceConfig = () =>
    useQuery({
        queryKey: ['observabilityGlanceConfig'],
        queryFn: () => getObservabilityData(),
    })

export const parseChartDetailsSearchParams = (searchParams: URLSearchParams): TabDetailsSearchParams => ({
    tab: (searchParams.get('tab') as TabDetailsSegment) || TabDetailsSegment.OVERVIEW,
})
