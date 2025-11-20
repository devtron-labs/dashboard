import {
    CHART_COLORS,
    ChartColorKey,
    SelectPickerOptionType,
    Tooltip,
    useQuery,
    useTheme,
} from '@devtron-labs/devtron-fe-common-lib'

import { GLANCE_METRICS_CARDS_CONFIG, ObservabilityGlanceMetricKeys } from './constants'
import { getObservabilityData } from './service'
import {
    MetricsInfoCardProps,
    ObservabilityMetricsDTO,
    ObservabilityOverviewDTO,
    ResourceCapacityDistributionTypes,
    TabDetailsSearchParams,
    TabDetailsSegment,
} from './types'

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

export const getObservabilityGlanceConfig = (result: Partial<ObservabilityOverviewDTO>) => {
    const glanceConfig = Object.entries(GLANCE_METRICS_CARDS_CONFIG).map(
        ([key, config]: [ObservabilityGlanceMetricKeys, MetricsInfoCardProps]) => {
            const entry = result.glanceConfig?.[key]
            const isNumber = typeof entry === 'number'
            const metricValue = isNumber ? entry : (entry as any)?.value
            const metricTitle = config?.metricTitle

            return {
                ...config,
                dataTestId: key as string,
                metricValue,
                metricTitle,
            }
        },
    )
    return {
        metrics: result?.metrics,
        glanceConfig,
    }
}

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

const AllocatedResource = ({ label, value }: SelectPickerOptionType<string>) => (
    <div className="flex left flex-grow-1 dc__gap-4 fs-11 fw-4 lh-1-5 cn-7">
        <span>{label}</span>
        <span className="fw-5 cn-9 font-ibm-plex-sans">{value}</span>
    </div>
)

export const ResourceAllocationBar = ({
    capacity,
    utilization,
    bgColor = 'SkyBlue500',
}: ResourceCapacityDistributionTypes & { bgColor?: ChartColorKey }) => {
    const { appTheme } = useTheme()

    return (
        <div className="flexbox-col dc__gap-8">
            <div className="h-8 br-4 dc__position-rel dc__overflow-hidden" style={{ backgroundColor: 'var(--N100)' }}>
                {/* Fill div up to utilisation percentage */}
                <Tooltip content="Utilisation" alwaysShowTippyOnHover>
                    <div
                        className="h-8 br-4 dc__position-abs"
                        style={{
                            width: `${utilization}%`,
                            backgroundColor: CHART_COLORS[appTheme][bgColor],
                        }}
                    />
                </Tooltip>
            </div>
            <div className="flex left dc__gap-8">
                <AllocatedResource label="Capacity" value={`${capacity}`} />
                <div className="divider__secondary" />
                <AllocatedResource label="Utilisation" value={`${utilization}%`} />
            </div>
        </div>
    )
}

export const CPUCapacityCellComponent = ({ cpu }: Pick<ObservabilityMetricsDTO, 'cpu'>) => (
    <ResourceAllocationBar {...cpu} bgColor="LimeGreen400" />
)

export const MemoryCapacityCellComponent = ({ memory }: Pick<ObservabilityMetricsDTO, 'memory'>) => (
    <ResourceAllocationBar {...memory} />
)

export const DiskCapacityCellComponent = ({ disk }: Pick<ObservabilityMetricsDTO, 'disk'>) => (
    <ResourceAllocationBar {...disk} />
)
