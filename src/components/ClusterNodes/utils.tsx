/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
    ClusterDetail,
    ClusterFiltersType,
    numberComparatorBySortOrder,
    ResourceDetail,
    SortingOrder,
    stringComparatorBySortOrder,
    versionComparatorBySortOrder,
} from '@devtron-labs/devtron-fe-common-lib'

import {
    CLUSTER_PROD_TYPE,
    ClusterMapListSortableKeys,
    NODE_RESOURCE_DEFAULT_THRESHOLD,
    NODE_RESOURCE_THRESHOLD_OPERATOR_MAP,
} from './constants'
import { BackupSystemStateDTO } from './types'

export const getSortedClusterList = (
    updatedClusterOptions: ClusterDetail[],
    sortBy: ClusterMapListSortableKeys,
    sortOrder: SortingOrder,
) => {
    switch (sortBy) {
        case ClusterMapListSortableKeys.NODES:
            updatedClusterOptions.sort((a, b) =>
                numberComparatorBySortOrder(a.nodeCount || 0, b.nodeCount || 0, sortOrder),
            )
            break
        case ClusterMapListSortableKeys.STATUS:
        case ClusterMapListSortableKeys.CLUSTER_NAME:
            updatedClusterOptions.sort((a, b) =>
                stringComparatorBySortOrder(a[sortBy] || '', b[sortBy] || '', sortOrder),
            )
            break
        case ClusterMapListSortableKeys.CPU_CAPACITY:
            updatedClusterOptions.sort((a, b) =>
                numberComparatorBySortOrder(
                    parseFloat(a[sortBy]?.capacity?.replace('m', '')) || 0,
                    parseFloat(b[sortBy]?.capacity?.replace('m', '')) || 0,
                    sortOrder,
                ),
            )
            break
        case ClusterMapListSortableKeys.MEMORY_CAPACITY:
            updatedClusterOptions.sort((a, b) =>
                numberComparatorBySortOrder(
                    parseFloat(a[sortBy]?.capacity?.replace('Mi', '')) || 0,
                    parseFloat(b[sortBy]?.capacity?.replace('Mi', '')) || 0,
                    sortOrder,
                ),
            )
            break
        case ClusterMapListSortableKeys.K8S_VERSION:
            updatedClusterOptions.sort((a, b) =>
                versionComparatorBySortOrder(a[sortBy] || '', b[sortBy] || '', sortOrder),
            )
            break
        case ClusterMapListSortableKeys.TYPE:
            updatedClusterOptions.sort((a, b) =>
                stringComparatorBySortOrder(
                    a.isProd ? CLUSTER_PROD_TYPE.PRODUCTION : CLUSTER_PROD_TYPE.NON_PRODUCTION,
                    b.isProd ? CLUSTER_PROD_TYPE.PRODUCTION : CLUSTER_PROD_TYPE.NON_PRODUCTION,
                    sortOrder,
                ),
            )
            break
        // case ClusterMapListSortableKeys.NODE_ERRORS:
        //     updatedClusterOptions.sort((a, b) => {
        //         const errorsA = a.nodeErrors ? Object.keys(a.nodeErrors).length : 0
        //         const errorsB = b.nodeErrors ? Object.keys(b.nodeErrors).length : 0
        //         return numberComparatorBySortOrder(errorsA, errorsB, sortOrder)
        //     })
        //     break
        default:
            break
    }
}

export const parseSearchParams = (searchParams: URLSearchParams) => ({
    clusterFilter: (searchParams.get('clusterFilter') as ClusterFiltersType) ?? ClusterFiltersType.ALL_CLUSTERS,
})

export const getNodeResourceThreshold = (threshold: ResourceDetail['threshold'], appendPercentage = true) => {
    if (!threshold) {
        return getNodeResourceThreshold(NODE_RESOURCE_DEFAULT_THRESHOLD, appendPercentage)
    }

    return `${NODE_RESOURCE_THRESHOLD_OPERATOR_MAP[threshold.operator || 'greaterThan']}${threshold.value}${appendPercentage ? '%' : ''}`
}

export const getHasUsageBreachedThreshold = ({
    usage,
    threshold: overrideThreshold,
}: Required<Pick<ResourceDetail, 'threshold'>> & { usage: number }) => {
    const threshold = overrideThreshold ?? NODE_RESOURCE_DEFAULT_THRESHOLD

    switch (threshold.operator) {
        case 'greaterThan':
            return usage > threshold.value
        case 'lessThan':
            return usage < threshold.value
        case 'equalTo':
            return usage !== threshold.value
        default:
            return false
    }
}

export const getIsResourceNamePod = (resource: string) => ['pods', 'pod'].includes(resource)

export const getPreviousUsage = (data: BackupSystemStateDTO['data'], resourceName: ResourceDetail['name']) =>
    data?.[resourceName] ? `${data[resourceName]}${!getIsResourceNamePod(resourceName) ? '%' : ''}` : null
