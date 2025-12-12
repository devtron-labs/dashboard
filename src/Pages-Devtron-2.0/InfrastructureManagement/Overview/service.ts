import { APIOptions, get, getUrlWithSearchParams, useQuery } from '@devtron-labs/devtron-fe-common-lib'

import { Routes } from '@Config/constants'

import { INFRA_OVERVIEW_QUERY_KEY } from './constants'
import {
    ClusterDistributionKeys,
    ExportNodeViewGroupListType,
    GetNodeListServiceParams,
    InfraOverview,
    InfraOverviewDTO,
    NodeDistributionKeys,
    NodeGroupViewListResult,
    NodeViewGroupType,
} from './types'
import {
    getClusterNodeHealthConfig,
    getInfraGlanceConfig,
    getNodeListDataForExport,
    getReachableClusterCount,
} from './utils'

export const useGetInfraOverview = () =>
    useQuery<InfraOverviewDTO, InfraOverview>({
        queryKey: [INFRA_OVERVIEW_QUERY_KEY],
        queryFn: ({ signal }) => get<InfraOverviewDTO>(Routes.INFRA_OVERVIEW, { signal }),
        select: ({ result }) => ({
            totalClusters: result?.totalClusters ?? 0,
            reachableClusters: getReachableClusterCount(result),
            infraGlanceConfig: getInfraGlanceConfig(result),
            clusterNodeConfig: {
                clusterNodeHealth: getClusterNodeHealthConfig(result),
                clusterDistribution: {
                    [ClusterDistributionKeys.BY_PROVIDER]:
                        result?.clusterDistribution?.[ClusterDistributionKeys.BY_PROVIDER] ?? [],
                    [ClusterDistributionKeys.BY_VERSION]:
                        (result?.clusterDistribution?.[ClusterDistributionKeys.BY_VERSION] ?? []).map(
                            ({ count, version }) => ({
                                count,
                                version: version === 'Unknown' ? version : `v${version}`,
                            }),
                        ) || [],
                },
                nodeDistribution: result?.nodeDistribution ?? {
                    [NodeDistributionKeys.BY_CLUSTERS]: [],
                    [NodeDistributionKeys.BY_AUTOSCALER]: [],
                },
                clusterCapacityDistribution: result?.clusterCapacityDistribution ?? [],
            },
        }),
    })

export const getNodeViewGroupList = ({
    groupBy,
    pageSize,
    offset,
    sortBy,
    sortOrder,
    errorType,
    autoscalerType,
    schedulableType,
    abortSignal,
    searchKey,
}: GetNodeListServiceParams) => {
    const url = getUrlWithSearchParams(Routes.OVERVIEW_NODE_LIST, {
        groupBy,
        limit: pageSize,
        offset,
        sortBy,
        sortOrder,
        searchKey,
        errorType,
        autoscalerType,
        schedulableType,
    })
    return get<NodeGroupViewListResult>(url, { signal: abortSignal })
}

export const getNodeViewGroupListForExport =
    (groupBy: NodeViewGroupType) =>
    async ({
        signal,
    }: Pick<APIOptions, 'signal'>): Promise<Record<ExportNodeViewGroupListType, string | boolean>[]> => {
        const response = await getNodeViewGroupList({
            groupBy,
            pageSize: null,
            offset: 0,
            sortBy: null,
            sortOrder: null,
            searchKey: '',
            abortSignal: signal,
        })

        return getNodeListDataForExport(groupBy, response?.result?.nodeList ?? [])
    }

export const refreshInfraOverviewCache = () => get(Routes.INFRA_OVERVIEW_REFRESH)
