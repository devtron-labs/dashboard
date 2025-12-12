import {
    ClusterFiltersType,
    getUrlWithSearchParams,
    MetricsInfoCardProps,
    URLS,
} from '@devtron-labs/devtron-fe-common-lib'

import { AUTOSCALER_TYPE_LABELS, NODE_ERRORS_LABEL_MAP } from './ClusterAndNodes/constants'
import { INFRA_OVERVIEW_CARDS_CONFIG } from './constants'
import {
    ClusterNodeHealthStatusKeys,
    ClusterStatusKeys,
    ExportNodeViewGroupListType,
    GlanceMetricsKeys,
    InfraOverviewDTO,
    NodeErrorsKeys,
    NodeSchedulingKeys,
    NodeViewGroupRowType,
    NodeViewGroupType,
} from './types'

export const getReachableClusterCount = (result: InfraOverviewDTO) => {
    const reachableClusters =
        (result?.totalClusters ?? 0) - (result?.clusterStatusBreakdown?.[ClusterStatusKeys.CONNECTION_FAILED] ?? 0)

    return Math.max(reachableClusters, 0)
}

export const getInfraGlanceConfig = (result: InfraOverviewDTO) =>
    Object.entries(INFRA_OVERVIEW_CARDS_CONFIG).map(([key, config]: [GlanceMetricsKeys, MetricsInfoCardProps]) => ({
        ...config,
        dataTestId: key,
        redirectionLink: URLS.INFRASTRUCTURE_MANAGEMENT_RESOURCE_BROWSER,
        metricValue: (key === GlanceMetricsKeys.REACHABLE_CLUSTERS
            ? getReachableClusterCount(result)
            : result?.[key]?.value ?? 0
        ).toLocaleString(),
        metricUnit: key === GlanceMetricsKeys.REACHABLE_CLUSTERS ? undefined : result?.[key]?.unit,
        valueOutOf:
            key === GlanceMetricsKeys.REACHABLE_CLUSTERS ? (result?.totalClusters ?? 0).toLocaleString() : undefined,
    }))

export const getClusterNodeHealthConfig = (
    result: InfraOverviewDTO,
): {
    [ClusterNodeHealthStatusKeys.CLUSTER_STATUS_BREAKDOWN]: Record<ClusterStatusKeys, number>
    [ClusterNodeHealthStatusKeys.NODE_ERRORS_BREAKDOWN]: Record<NodeErrorsKeys, number>
    [ClusterNodeHealthStatusKeys.NODE_SCHEDULING_BREAKDOWN]: Record<NodeSchedulingKeys, number>
} => ({
    [ClusterNodeHealthStatusKeys.CLUSTER_STATUS_BREAKDOWN]: Object.values(ClusterStatusKeys).reduce(
        (acc, key) => ({
            ...acc,
            [key]: result?.clusterStatusBreakdown?.[key] ?? 0,
        }),
        {} as Record<ClusterStatusKeys, number>,
    ),
    [ClusterNodeHealthStatusKeys.NODE_ERRORS_BREAKDOWN]: Object.values(NodeErrorsKeys).reduce(
        (acc, key) => ({
            ...acc,
            [key]: result?.nodeErrorBreakdown?.errorCounts?.[key] ?? 0,
        }),
        {} as Record<NodeErrorsKeys, number>,
    ),
    [ClusterNodeHealthStatusKeys.NODE_SCHEDULING_BREAKDOWN]: Object.values(NodeSchedulingKeys).reduce(
        (acc, key) => ({
            ...acc,
            [key]: result?.nodeSchedulingBreakdown?.[key] ?? 0,
        }),
        {} as Record<NodeSchedulingKeys, number>,
    ),
})

export const getNodeListDataForExport = (groupBy: NodeViewGroupType, nodeList: NodeViewGroupRowType[]) =>
    nodeList.map((node) => {
        const baseData = {
            nodeName: node.nodeName,
            clusterName: node.clusterName,
        }

        switch (groupBy) {
            case NodeViewGroupType.NODE_ERRORS:
                return {
                    ...baseData,
                    nodeStatus: node.nodeStatus || '',
                    nodeErrors: node.nodeErrors.map((error) => NODE_ERRORS_LABEL_MAP[error])?.join(', ') || '',
                } as Record<ExportNodeViewGroupListType, string | boolean>
            case NodeViewGroupType.NODE_SCHEDULING:
                return {
                    ...baseData,
                    schedulable: node.schedulable || false,
                } as Record<ExportNodeViewGroupListType, string | boolean>
            case NodeViewGroupType.AUTOSCALER_MANAGED:
                return {
                    ...baseData,
                    autoscalerType: AUTOSCALER_TYPE_LABELS[node.autoscalerType] || '',
                } as Record<ExportNodeViewGroupListType, string | boolean>
            default:
                return baseData as Record<ExportNodeViewGroupListType, string | boolean>
        }
    })

export const getClusterListingUrl = (clusterFilter?: ClusterFiltersType) =>
    getUrlWithSearchParams(URLS.INFRASTRUCTURE_MANAGEMENT_RESOURCE_BROWSER, {
        clusterFilter: clusterFilter ?? ClusterFiltersType.ALL_CLUSTERS,
    })
