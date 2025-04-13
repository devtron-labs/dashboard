import React from 'react'

import {
    BulkSelection,
    ClusterFiltersType,
    SortableTableHeaderCell,
    useUrlFilters,
} from '@devtron-labs/devtron-fe-common-lib'

import { ClusterListRow } from './ClusterListRow'
import { ClusterMapListSortableKeys, ClusterMapListSortableTitle } from './constants'
import { ClusterListTypes } from './types'
import { parseSearchParams } from './utils'

export const ClusterList = ({
    filteredList,
    clusterListLoader,
    showKubeConfigModal,
    onChangeShowKubeConfigModal,
    setSelectedClusterName,
}: ClusterListTypes) => {
    const { sortBy, sortOrder, handleSorting } = useUrlFilters<
        ClusterMapListSortableKeys,
        { clusterFilter: ClusterFiltersType }
    >({
        parseSearchParams,
        initialSortKey: ClusterMapListSortableKeys.CLUSTER_NAME,
    })

    const handleCellSorting = (cellToSort: ClusterMapListSortableKeys) => () => {
        handleSorting(cellToSort)
    }

    return (
        <div data-testid="cluster-list-container" className="flexbox-col flex-grow-1">
            <div className="cluster-list-row fw-6 cn-7 fs-12 dc__border-bottom pt-8 pb-8 pr-20 pl-20 dc__uppercase bg__primary dc__position-sticky dc__top-0 dc__zi-3">
                {Object.entries(ClusterMapListSortableKeys).map(([cellName, cellKey]) => (
                    <React.Fragment key={cellName}>
                        {cellKey === ClusterMapListSortableKeys.CLUSTER_NAME && (
                            <BulkSelection showPagination={false} />
                        )}
                        <SortableTableHeaderCell
                            key={cellName}
                            title={ClusterMapListSortableTitle[cellName]}
                            isSorted={sortBy === cellKey}
                            sortOrder={sortOrder}
                            isSortable
                            disabled={false}
                            triggerSorting={handleCellSorting(cellKey)}
                        />
                    </React.Fragment>
                ))}
            </div>
            {filteredList.map((clusterData) => (
                <ClusterListRow
                    clusterData={clusterData}
                    clusterListLoader={clusterListLoader}
                    showKubeConfigModal={showKubeConfigModal}
                    onChangeShowKubeConfigModal={onChangeShowKubeConfigModal}
                    setSelectedClusterName={setSelectedClusterName}
                />
            ))}
        </div>
    )
}
