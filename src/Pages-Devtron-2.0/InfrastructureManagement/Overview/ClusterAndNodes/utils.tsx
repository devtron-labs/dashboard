import {
    CHART_COLORS,
    ChartColorKey,
    ChartProps,
    ClusterFiltersType,
    LoadingDonutChart,
    numberComparatorBySortOrder,
    SelectPickerOptionType,
    SortingOrder,
    stringComparatorBySortOrder,
    Tooltip,
    useTheme,
} from '@devtron-labs/devtron-fe-common-lib'

import { ChartTooltip } from '@PagesDevtron2.0/Shared'

import {
    AutoscalerTypes,
    ClusterCapacityDistribution,
    NodeErrorsKeys,
    NodeSchedulingKeys,
    NodeViewGroupType,
    ResourceCapacityDistribution,
} from '../types'
import {
    AUTOSCALER_MANAGED_OPTIONS,
    AUTOSCALER_TYPE_LABELS,
    CLUSTER_NODE_HEALTH_CARDS_TITLE,
    CLUSTER_STATUS_LABEL_MAP,
    NODE_ERRORS_LABEL_MAP,
    NODE_ERRORS_OPTIONS,
    NODE_SCHEDULING_LABEL_MAP,
    NODE_SCHEDULING_OPTIONS,
} from './constants'
import { AutoscalerTypeFilters, ClusterCapacitySortKeys, NodeErrorsFilters, NodeSchedulingTypeFilters } from './types'

const AllocatedResource = ({ label, value }: SelectPickerOptionType<string>) => (
    <div className="flex left flex-grow-1 dc__gap-4 fs-11 fw-4 lh-1-5 cn-7">
        <span>{label}</span>
        <span className="fw-5 cn-9 font-ibm-plex-sans">{value}</span>
    </div>
)

export const ResourceAllocationBar = ({
    capacity,
    utilizationPercent,
    requestsPercent,
    limitsPercent,
    bgColor = 'SkyBlue500',
}: ResourceCapacityDistribution & { bgColor?: ChartColorKey }) => {
    const { appTheme } = useTheme()

    return (
        <div className="flexbox-col dc__gap-8">
            <div className="h-8 br-4 dc__position-rel dc__overflow-hidden" style={{ backgroundColor: 'var(--N100)' }}>
                {/* Fill div up to utilisation percentage */}
                <Tooltip content="Utilisation" alwaysShowTippyOnHover>
                    <div
                        className="h-8 br-4 dc__position-abs"
                        style={{
                            width: `${utilizationPercent}%`,
                            backgroundColor: CHART_COLORS[appTheme][bgColor],
                        }}
                    />
                </Tooltip>
                {/* Black separator at requests percentage */}
                <Tooltip content="Requests" alwaysShowTippyOnHover>
                    <div
                        className="h-8 dc__position-abs"
                        style={{
                            left: `${requestsPercent}%`,
                            width: '2px',
                            backgroundColor: 'var(--N700)',
                        }}
                    />
                </Tooltip>
            </div>
            <div className="flex left dc__gap-8">
                <AllocatedResource label="Capacity" value={`${capacity}`} />
                <div className="divider__secondary" />
                <AllocatedResource label="Utilisation" value={`${utilizationPercent}%`} />
                <div className="divider__secondary" />
                <AllocatedResource label="Requests" value={`${requestsPercent}%`} />
                <div className="divider__secondary" />
                <AllocatedResource label="Limits" value={`${limitsPercent}%`} />
            </div>
        </div>
    )
}

export const ClusterNodesLoadingState = () => (
    <div className="flexbox-col dc__gap-12">
        <div className="dc__grid cards-wrapper">
            {Object.keys(CLUSTER_NODE_HEALTH_CARDS_TITLE).map((key) => (
                <div key={key} className="flexbox-col bg__primary br-8 border__secondary">
                    <div className="flex left px-16 py-12 border__secondary--bottom">
                        <span className="shimmer w-100px" />
                    </div>
                    <LoadingDonutChart />
                </div>
            ))}
        </div>
        <div className="bg__primary border__secondary br-8 flexbox dc__content-space dc__align-end px-24 pt-24 pb-12">
            {[370, 420, 480, 470, 430, 375, 260].map((height) => (
                <div key={height} className="w-80px shimmer br-4" style={{ height: `${height}px` }} />
            ))}
        </div>
    </div>
)

export const getClusterResourceCapacitySort = (
    a: ClusterCapacityDistribution,
    b: ClusterCapacityDistribution,
    sortBy: ClusterCapacitySortKeys,
    sortOrder: SortingOrder,
) => {
    switch (sortBy) {
        case 'clusterName':
            return stringComparatorBySortOrder(a.clusterName, b.clusterName, sortOrder)
        case 'cpuCapacity':
            return numberComparatorBySortOrder(a.cpu.capacity, b.cpu.capacity, sortOrder)
        case 'cpuUtilization':
            return numberComparatorBySortOrder(a.cpu.utilizationPercent, b.cpu.utilizationPercent, sortOrder)
        case 'cpuRequests':
            return numberComparatorBySortOrder(a.cpu.requestsPercent, b.cpu.requestsPercent, sortOrder)
        case 'cpuLimits':
            return numberComparatorBySortOrder(a.cpu.limitsPercent, b.cpu.limitsPercent, sortOrder)
        case 'memoryCapacity':
            return numberComparatorBySortOrder(a.memory.capacity, b.memory.capacity, sortOrder)
        default:
            return 0
    }
}

export const getClusterNodeTooltipContent: (
    title: string,
    xAxisLabels: string[],
    yAxisValues: number[],
) => ChartProps['tooltipConfig']['getTooltipContent'] = (title, xAxisLabels, yAxisValues) => (args) => {
    const { tooltip } = args
    const { dataPoints } = tooltip
    const { dataIndex } = dataPoints[0]
    return (
        <ChartTooltip
            title={title}
            label={xAxisLabels[dataIndex]}
            value={yAxisValues[dataIndex]}
            chartColorKey="SkyBlue500"
        />
    )
}

export const getClusterNodeHealthChartTooltip: (
    title: string,
    xAxisLabels: string[],
    yAxisValues: number[],
    backgroundColors: ChartColorKey[],
) => ChartProps['tooltipConfig']['getTooltipContent'] =
    (title, xAxisLabels, yAxisValues, backgroundColors) => (args) => {
        const { tooltip } = args
        const { dataPoints } = tooltip
        const { dataIndex } = dataPoints[0]
        return (
            <ChartTooltip
                title={title}
                label={xAxisLabels[dataIndex]}
                value={yAxisValues[dataIndex]}
                chartColorKey={backgroundColors[dataIndex]}
            />
        )
    }

export const getClusterFilterTypeFromLabel = (label: string): ClusterFiltersType => {
    switch (label) {
        case CLUSTER_STATUS_LABEL_MAP.healthy:
            return ClusterFiltersType.HEALTHY
        case CLUSTER_STATUS_LABEL_MAP.unhealthy:
            return ClusterFiltersType.UNHEALTHY
        case CLUSTER_STATUS_LABEL_MAP.connectionFailed:
            return ClusterFiltersType.CONNECTION_FAILED
        default:
            return ClusterFiltersType.ALL_CLUSTERS
    }
}

export const getNodeSchedulingFilterTypeFromLabel = (label: string): NodeSchedulingTypeFilters => {
    switch (label) {
        case NODE_SCHEDULING_LABEL_MAP.schedulable:
            return NodeSchedulingKeys.SCHEDULABLE
        case NODE_SCHEDULING_LABEL_MAP.unschedulable:
            return NodeSchedulingKeys.UNSCHEDULABLE
        default:
            return 'ALL'
    }
}

export const getNodeErrorFilterTypeFromLabel = (label: string): NodeErrorsFilters => {
    switch (label) {
        case NODE_ERRORS_LABEL_MAP.DiskPressure:
            return NodeErrorsKeys.DISK_PRESSURE
        case NODE_ERRORS_LABEL_MAP.MemoryPressure:
            return NodeErrorsKeys.INSUFFICIENT_MEMORY
        case NODE_ERRORS_LABEL_MAP.KubeletNotReady:
            return NodeErrorsKeys.KUBELET_NOT_READY
        case NODE_ERRORS_LABEL_MAP.NetworkUnavailable:
            return NodeErrorsKeys.NETWORK_UNAVAILABLE
        case NODE_ERRORS_LABEL_MAP.PIDPressure:
            return NodeErrorsKeys.INSUFFICIENT_PID
        case NODE_ERRORS_LABEL_MAP.Others:
            return NodeErrorsKeys.OTHERS
        default:
            return 'ALL'
    }
}

export const getNodeAutoscalerFilterTypeFromLabel = (label: string): AutoscalerTypeFilters => {
    switch (label) {
        case AUTOSCALER_TYPE_LABELS.castAi:
            return AutoscalerTypes.CAST_AI
        case AUTOSCALER_TYPE_LABELS.aks:
            return AutoscalerTypes.AZURE
        case AUTOSCALER_TYPE_LABELS.eks:
            return AutoscalerTypes.EKS_AUTOSCALER
        case AUTOSCALER_TYPE_LABELS.gke:
            return AutoscalerTypes.GKE_AUTOSCALER
        case AUTOSCALER_TYPE_LABELS.karpenter:
            return AutoscalerTypes.KARPENTER
        default:
            return 'ALL'
    }
}

export const getNodeListFilterOptions = (nodeViewGroupType: NodeViewGroupType): SelectPickerOptionType[] => {
    switch (nodeViewGroupType) {
        case NodeViewGroupType.NODE_ERRORS:
            return NODE_ERRORS_OPTIONS
        case NodeViewGroupType.AUTOSCALER_MANAGED:
            return AUTOSCALER_MANAGED_OPTIONS
        case NodeViewGroupType.NODE_SCHEDULING:
            return NODE_SCHEDULING_OPTIONS
        default:
            return []
    }
}
