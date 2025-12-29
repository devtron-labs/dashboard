import { ChartProps, SimpleDatasetForPie, SortingOrder } from '@devtron-labs/devtron-fe-common-lib'

import {
    AutoscalerTypes,
    ClusterNodeHealthStatusKeys,
    InfraOverview,
    NodeErrorsKeys,
    NodeSchedulingKeys,
    PropsTypeWithInfraQueryState,
} from '../types'

export interface InfraOverviewClusterAndNodesProps
    extends PropsTypeWithInfraQueryState<Pick<InfraOverview, 'clusterNodeConfig'>> {}

export interface ClusterNodeHealthProps extends Pick<InfraOverview['clusterNodeConfig'], 'clusterNodeHealth'> {}

export interface ClusterNodeHealthCardProps extends Pick<ChartProps, 'xAxisLabels' | 'onChartClick'> {
    title: string
    metricKey: ClusterNodeHealthStatusKeys
    datasets: SimpleDatasetForPie
}

export interface ClusterCountsProps extends Pick<InfraOverview['clusterNodeConfig'], 'clusterDistribution'> {}

export interface NodeCountsProps extends Pick<InfraOverview['clusterNodeConfig'], 'nodeDistribution'> {}

export interface ClusterCapacityDistributionProps
    extends Pick<InfraOverview['clusterNodeConfig'], 'clusterCapacityDistribution'> {}

type ClusterNodeCountSortKeys = 'name' | 'count'

export type ClusterNodeCountSortConfigType = {
    sortBy: ClusterNodeCountSortKeys
    sortOrder: SortingOrder
}

export type ClusterCapacitySortKeys =
    | 'cpuCapacity'
    | 'cpuUtilization'
    | 'cpuRequests'
    | 'cpuLimits'
    | 'memoryCapacity'
    | 'clusterName'

export type NodeErrorsFilters = NodeErrorsKeys | 'ALL'

export type AutoscalerTypeFilters = AutoscalerTypes | 'ALL'

export type NodeSchedulingTypeFilters = NodeSchedulingKeys | 'ALL'
