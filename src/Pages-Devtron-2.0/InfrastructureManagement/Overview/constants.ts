import { MetricsInfoCardProps } from '@devtron-labs/devtron-fe-common-lib'

import { GlanceMetricsKeys } from './types'

export const INFRA_OVERVIEW_CARDS_CONFIG: Record<
    GlanceMetricsKeys,
    Omit<MetricsInfoCardProps, 'dataTestId' | 'metricValue'>
> = {
    [GlanceMetricsKeys.REACHABLE_CLUSTERS]: {
        iconName: 'ic-bg-cluster',
        metricTitle: 'Reachable Clusters',
        tooltipContent: 'Number of clusters excluding unreachable (connection failed) clusters',
    },
    [GlanceMetricsKeys.TOTAL_CPU_CAPACITY]: {
        iconName: 'ic-bg-cpu',
        metricTitle: 'Total CPU Capacity',
        tooltipContent: 'Total CPU capacity of reachable clusters',
    },
    [GlanceMetricsKeys.TOTAL_MEMORY_CAPACITY]: {
        iconName: 'ic-bg-memory',
        metricTitle: 'Total Memory Capacity',
        tooltipContent: 'Total memory capacity of reachable clusters',
    },
}

export const INFRA_OVERVIEW_QUERY_KEY = 'infra-overview'
