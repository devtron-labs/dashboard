import {
    numberComparatorBySortOrder,
    SortingOrder,
    stringComparatorBySortOrder,
    versionComparatorBySortOrder,
} from '@devtron-labs/devtron-fe-common-lib'
import { CLUSTER_PROD_TYPE, ClusterMapListSortableKeys } from './constants'
import { ClusterDetail } from './types'

export const getFilteredClusterNodes = (
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
        case ClusterMapListSortableKeys.NODE_ERRORS:
            updatedClusterOptions.sort((a, b) => {
                const errorsA = a.nodeErrors ? Object.keys(a.nodeErrors).length : 0
                const errorsB = b.nodeErrors ? Object.keys(b.nodeErrors).length : 0
                return numberComparatorBySortOrder(errorsA, errorsB, sortOrder)
            })
            break
        default:
            break
    }
}
