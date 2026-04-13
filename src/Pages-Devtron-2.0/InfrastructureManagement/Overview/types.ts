import { MetricsInfoCardProps, SortingOrder, useQuery } from '@devtron-labs/devtron-fe-common-lib'

export enum NodeErrorsKeys {
    NETWORK_UNAVAILABLE = 'NetworkUnavailable',
    INSUFFICIENT_MEMORY = 'MemoryPressure',
    DISK_PRESSURE = 'DiskPressure',
    INSUFFICIENT_PID = 'PIDPressure',
    KUBELET_NOT_READY = 'KubeletNotReady',
    OTHERS = 'Others',
}

export enum ClusterStatusKeys {
    HEALTHY = 'healthy',
    UNHEALTHY = 'unhealthy',
    CONNECTION_FAILED = 'connectionFailed',
}

export enum AutoscalerTypes {
    CAST_AI = 'castAi',
    KARPENTER = 'karpenter',
    AZURE = 'aks',
    EKS_AUTOSCALER = 'eks',
    GKE_AUTOSCALER = 'gke',
    NOT_DETECTED = 'notDetected',
}

export enum NodeSchedulingKeys {
    SCHEDULABLE = 'schedulable',
    UNSCHEDULABLE = 'unschedulable',
}

export enum ClusterDistributionKeys {
    BY_PROVIDER = 'byProvider',
    BY_VERSION = 'byVersion',
}

export enum NodeDistributionKeys {
    BY_CLUSTERS = 'byClusters',
    BY_AUTOSCALER = 'byAutoscaler',
}

interface ResourceCapacity {
    value: number
    unit: string
}

type ClusterDistributionType = {
    count: number
} & ({ provider?: never; version: string } | { provider: string; version?: never })

interface ClusterDistribution {
    [ClusterDistributionKeys.BY_PROVIDER]: ClusterDistributionType[]
    [ClusterDistributionKeys.BY_VERSION]: ClusterDistributionType[]
}

export interface ResourceCapacityDistribution {
    capacity: number
    utilizationPercent: number
    requestsPercent: number
    limitsPercent: number
}

export interface ClusterCapacityDistribution {
    clusterId: number
    clusterName: string
    cpu: ResourceCapacityDistribution
    memory: ResourceCapacityDistribution
}

type NodeDistributionType = {
    nodeCount: number
} & (
    | { clusterId?: never; clusterName?: never; autoscalerType: AutoscalerTypes }
    | { clusterId: number; clusterName: string; autoscalerType?: never }
)

interface NodeDistribution {
    [NodeDistributionKeys.BY_CLUSTERS]: NodeDistributionType[]
    [NodeDistributionKeys.BY_AUTOSCALER]: NodeDistributionType[]
}

export enum GlanceMetricsKeys {
    REACHABLE_CLUSTERS = 'reachableClusters',
    TOTAL_CPU_CAPACITY = 'totalCpuCapacity',
    TOTAL_MEMORY_CAPACITY = 'totalMemoryCapacity',
}

export enum ClusterNodeHealthStatusKeys {
    CLUSTER_STATUS_BREAKDOWN = 'clusterStatusBreakdown',
    NODE_ERRORS_BREAKDOWN = 'nodeErrorBreakdown',
    NODE_SCHEDULING_BREAKDOWN = 'nodeSchedulingBreakdown',
}

export interface InfraOverviewDTO {
    totalClusters: number
    [GlanceMetricsKeys.TOTAL_CPU_CAPACITY]: ResourceCapacity
    [GlanceMetricsKeys.TOTAL_MEMORY_CAPACITY]: ResourceCapacity
    [ClusterNodeHealthStatusKeys.CLUSTER_STATUS_BREAKDOWN]: Record<ClusterStatusKeys, number>
    [ClusterNodeHealthStatusKeys.NODE_ERRORS_BREAKDOWN]: {
        errorCounts: Record<NodeErrorsKeys, number>
    }
    [ClusterNodeHealthStatusKeys.NODE_SCHEDULING_BREAKDOWN]: Record<NodeSchedulingKeys, number>
    clusterDistribution: ClusterDistribution
    clusterCapacityDistribution: ClusterCapacityDistribution[]
    nodeDistribution: NodeDistribution
}

export interface InfraOverview extends Pick<InfraOverviewDTO, 'totalClusters'> {
    reachableClusters: number
    infraGlanceConfig: MetricsInfoCardProps[]
    clusterNodeConfig: {
        clusterNodeHealth: Pick<
            InfraOverviewDTO,
            ClusterNodeHealthStatusKeys.CLUSTER_STATUS_BREAKDOWN | ClusterNodeHealthStatusKeys.NODE_SCHEDULING_BREAKDOWN
        > & { [ClusterNodeHealthStatusKeys.NODE_ERRORS_BREAKDOWN]: Record<NodeErrorsKeys, number> }
    } & Pick<InfraOverviewDTO, 'clusterDistribution' | 'nodeDistribution' | 'clusterCapacityDistribution'>
}

export type PropsTypeWithInfraQueryState<T> = T &
    Pick<ReturnType<typeof useQuery>, 'isFetching' | 'isError' | 'refetch'>

export interface InfraOverviewAtAGlanceProps
    extends PropsTypeWithInfraQueryState<Pick<InfraOverview, 'infraGlanceConfig'>> {}

export enum NodeViewGroupType {
    AUTOSCALER_MANAGED = 'autoscalerManaged',
    NODE_ERRORS = 'nodeErrors',
    NODE_SCHEDULING = 'nodeScheduling',
}

export enum NodeViewGroupListFiltersTypeEnum {
    ERROR_TYPE = 'errorType',
    AUTOSCALER_TYPE = 'autoscalerType',
    SCHEDULABLE = 'schedulableType',
}

export interface NodeViewGroupListFiltersType extends Record<NodeViewGroupListFiltersTypeEnum, string> {
    nodeViewGroupType: NodeViewGroupType
}

export type NodeViewGroupRowType = {
    nodeName: string
    clusterName: string
    clusterId: number
} & (
    | { autoscalerType: AutoscalerTypes; nodeStatus?: never; nodeErrors?: never; schedulable?: never }
    | { nodeStatus: string; nodeErrors?: NodeErrorsKeys[]; autoscalerType?: never; schedulable?: never }
    | { schedulable: boolean; nodeStatus?: never; autoscalerType?: never; nodeErrors?: never }
)

export type ExportNodeViewGroupListType =
    | 'nodeName'
    | 'clusterName'
    | 'autoscalerType'
    | 'nodeStatus'
    | 'nodeErrors'
    | 'schedulable'

export interface NodeGroupViewListResult {
    nodeList: NodeViewGroupRowType[]
    totalCount: number
}

export interface GetNodeListServiceParams {
    groupBy: NodeViewGroupType
    offset: number
    pageSize: number
    sortBy: string
    sortOrder: SortingOrder
    searchKey: string
    errorType?: NodeErrorsKeys
    autoscalerType?: AutoscalerTypes
    schedulableType?: NodeSchedulingKeys
    abortSignal: AbortSignal
}
