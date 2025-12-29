import {
    ChartColorKey,
    ExportToCsvProps,
    SelectPickerOptionType,
    SortingOrder,
} from '@devtron-labs/devtron-fe-common-lib'

import {
    AutoscalerTypes,
    ClusterNodeHealthStatusKeys,
    ClusterStatusKeys,
    ExportNodeViewGroupListType,
    NodeErrorsKeys,
    NodeSchedulingKeys,
    NodeViewGroupType,
} from '../types'
import {
    AutoscalerTypeFilters,
    ClusterCapacitySortKeys,
    ClusterNodeCountSortConfigType,
    NodeErrorsFilters,
    NodeSchedulingTypeFilters,
} from './types'

export const CLUSTER_NODE_HEALTH_CHART_COLORS: {
    [ClusterNodeHealthStatusKeys.NODE_ERRORS_BREAKDOWN]: Record<NodeErrorsKeys, ChartColorKey>
    [ClusterNodeHealthStatusKeys.CLUSTER_STATUS_BREAKDOWN]: Record<ClusterStatusKeys, ChartColorKey>
    [ClusterNodeHealthStatusKeys.NODE_SCHEDULING_BREAKDOWN]: Record<NodeSchedulingKeys, ChartColorKey>
} = {
    [ClusterNodeHealthStatusKeys.NODE_ERRORS_BREAKDOWN]: {
        [NodeErrorsKeys.NETWORK_UNAVAILABLE]: 'CoralRed700',
        [NodeErrorsKeys.INSUFFICIENT_MEMORY]: 'CoralRed600',
        [NodeErrorsKeys.DISK_PRESSURE]: 'CoralRed500',
        [NodeErrorsKeys.INSUFFICIENT_PID]: 'CoralRed400',
        [NodeErrorsKeys.KUBELET_NOT_READY]: 'CoralRed300',
        [NodeErrorsKeys.OTHERS]: 'CoralRed200',
    },
    [ClusterNodeHealthStatusKeys.CLUSTER_STATUS_BREAKDOWN]: {
        [ClusterStatusKeys.HEALTHY]: 'LimeGreen500',
        [ClusterStatusKeys.UNHEALTHY]: 'GoldenYellow500',
        [ClusterStatusKeys.CONNECTION_FAILED]: 'CoralRed500',
    },
    [ClusterNodeHealthStatusKeys.NODE_SCHEDULING_BREAKDOWN]: {
        [NodeSchedulingKeys.SCHEDULABLE]: 'LimeGreen500',
        [NodeSchedulingKeys.UNSCHEDULABLE]: 'CoralRed500',
    },
}

export const CLUSTER_STATUS_LABEL_MAP: Record<ClusterStatusKeys, string> = {
    [ClusterStatusKeys.HEALTHY]: 'Healthy',
    [ClusterStatusKeys.UNHEALTHY]: 'Unhealthy',
    [ClusterStatusKeys.CONNECTION_FAILED]: 'Connection Failed',
}

export const NODE_ERRORS_LABEL_MAP: Record<NodeErrorsKeys, string> = {
    [NodeErrorsKeys.NETWORK_UNAVAILABLE]: 'Network Unavailable',
    [NodeErrorsKeys.INSUFFICIENT_MEMORY]: 'Insufficient Memory',
    [NodeErrorsKeys.DISK_PRESSURE]: 'Disk Pressure',
    [NodeErrorsKeys.INSUFFICIENT_PID]: 'Insufficient PID',
    [NodeErrorsKeys.KUBELET_NOT_READY]: 'Kubelet Not Ready',
    [NodeErrorsKeys.OTHERS]: 'Other Errors',
}

export const NODE_SCHEDULING_LABEL_MAP: Record<NodeSchedulingKeys, string> = {
    [NodeSchedulingKeys.SCHEDULABLE]: 'Schedulable',
    [NodeSchedulingKeys.UNSCHEDULABLE]: 'Unschedulable',
}

export const NODE_SCHEDULING_OPTIONS: SelectPickerOptionType<NodeSchedulingTypeFilters>[] = Object.entries({
    ALL: 'All Nodes',
    ...NODE_SCHEDULING_LABEL_MAP,
}).map(([key, label]) => ({ label, value: key as NodeSchedulingTypeFilters }))

export const CLUSTER_NODE_HEALTH_LABELS: {
    [ClusterNodeHealthStatusKeys.CLUSTER_STATUS_BREAKDOWN]: Record<ClusterStatusKeys, string>
    [ClusterNodeHealthStatusKeys.NODE_ERRORS_BREAKDOWN]: Record<NodeErrorsKeys, string>
    [ClusterNodeHealthStatusKeys.NODE_SCHEDULING_BREAKDOWN]: Record<NodeSchedulingKeys, string>
} = {
    [ClusterNodeHealthStatusKeys.CLUSTER_STATUS_BREAKDOWN]: CLUSTER_STATUS_LABEL_MAP,
    [ClusterNodeHealthStatusKeys.NODE_ERRORS_BREAKDOWN]: NODE_ERRORS_LABEL_MAP,
    [ClusterNodeHealthStatusKeys.NODE_SCHEDULING_BREAKDOWN]: NODE_SCHEDULING_LABEL_MAP,
}

export const CLUSTER_NODE_HEALTH_CARDS_TITLE: Record<ClusterNodeHealthStatusKeys, string> = {
    [ClusterNodeHealthStatusKeys.CLUSTER_STATUS_BREAKDOWN]: 'Cluster Health Status',
    [ClusterNodeHealthStatusKeys.NODE_ERRORS_BREAKDOWN]: 'Node Errors',
    [ClusterNodeHealthStatusKeys.NODE_SCHEDULING_BREAKDOWN]: 'Node Scheduling',
}

export const CLUSTER_NODE_COUNT_SORTING_OPTIONS: SelectPickerOptionType<ClusterNodeCountSortConfigType>[] = [
    { label: 'High to Low', value: { sortBy: 'count', sortOrder: SortingOrder.DESC } },
    { label: 'Low to High', value: { sortBy: 'count', sortOrder: SortingOrder.ASC } },
    { label: 'A to Z', value: { sortBy: 'name', sortOrder: SortingOrder.ASC } },
    { label: 'Z to A', value: { sortBy: 'name', sortOrder: SortingOrder.DESC } },
]

export const CLUSTER_CAPACITY_SORTING_OPTIONS: SelectPickerOptionType<ClusterCapacitySortKeys>[] = [
    { label: 'Cluster Name', value: 'clusterName' },
    { label: 'CPU Capacity', value: 'cpuCapacity' },
    { label: 'CPU Limits', value: 'cpuLimits' },
    { label: 'CPU Utilization', value: 'cpuUtilization' },
    { label: 'CPU Requests', value: 'cpuRequests' },
    { label: 'Memory Capacity', value: 'memoryCapacity' },
]

export const NODE_VIEW_GROUP_TITLE_MAP: Record<NodeViewGroupType, string> = {
    [NodeViewGroupType.AUTOSCALER_MANAGED]: 'Nodes managed by autoscaler',
    [NodeViewGroupType.NODE_ERRORS]: 'Node errors',
    [NodeViewGroupType.NODE_SCHEDULING]: 'Node scheduling',
}

export const NODE_ERRORS_OPTIONS: SelectPickerOptionType<NodeErrorsFilters>[] = Object.entries({
    ALL: 'All Errors',
    ...NODE_ERRORS_LABEL_MAP,
}).map(([key, label]) => ({ label, value: key as NodeErrorsFilters }))

export const AUTOSCALER_TYPE_LABELS: Record<AutoscalerTypes, string> = {
    [AutoscalerTypes.CAST_AI]: 'Cast AI',
    [AutoscalerTypes.KARPENTER]: 'Karpenter',
    [AutoscalerTypes.AZURE]: 'Azure',
    [AutoscalerTypes.EKS_AUTOSCALER]: 'EKS Automode',
    [AutoscalerTypes.GKE_AUTOSCALER]: 'GKE Automode',
    [AutoscalerTypes.NOT_DETECTED]: 'Not detected',
}

export const AUTOSCALER_MANAGED_OPTIONS: SelectPickerOptionType<AutoscalerTypeFilters>[] = Object.entries({
    ALL: 'All Types',
    ...AUTOSCALER_TYPE_LABELS,
}).map(([key, label]) => ({ label, value: key as AutoscalerTypeFilters }))

export const EXPORT_NODE_LIST_HEADERS: ExportToCsvProps<ExportNodeViewGroupListType>['headers'] = [
    { label: 'Node name', key: 'nodeName' },
    { label: 'Cluster name', key: 'clusterName' },
    { label: 'Node status', key: 'nodeStatus' },
    { label: 'Node errors', key: 'nodeErrors' },
    { label: 'Autoscaler type', key: 'autoscalerType' },
    { label: 'Schedulable', key: 'schedulable' },
]
