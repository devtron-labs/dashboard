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

import React, { useState, useMemo, useEffect } from 'react'
import {
    GenericEmptyState,
    SearchBar,
    useUrlFilters,
    ClusterFiltersType,
    SortableTableHeaderCell,
    ClusterDetail,
    BulkSelection,
    BulkSelectionIdentifiersType,
    useBulkSelection,
    BulkSelectionEvents,
    BulkSelectionProvider,
    SelectAllDialogStatus,
} from '@devtron-labs/devtron-fe-common-lib'
import dayjs, { Dayjs } from 'dayjs'
import { importComponentFromFELibrary } from '@Components/common'
import Timer from '@Components/common/DynamicTabs/DynamicTabs.timer'
import NoClusterEmptyState from '@Images/no-cluster-empty-state.png'
import { AddClusterButton } from '@Components/ResourceBrowser/PageHeader.buttons'

import ClusterNodeEmptyState from './ClusterNodeEmptyStates'
import { ClusterSelectionType } from '../ResourceBrowser/Types'

import { ClusterMapListSortableKeys, ClusterMapListSortableTitle, ClusterStatusByFilter } from './constants'
import './clusterNodes.scss'
import { getSortedClusterList } from './utils'
import { ClusterBulkSelectionActionWidget } from './ClusterBulkSelectionActionWidget'
import { ClusterListRow } from './ClusterListRow'

const ClusterMap = importComponentFromFELibrary('ClusterMap', null, 'function')
const ClusterFilters = importComponentFromFELibrary('ClusterFilters', null, 'function')

const parseSearchParams = (searchParams: URLSearchParams) => ({
    clusterFilter: (searchParams.get('clusterFilter') as ClusterFiltersType) || ClusterFiltersType.ALL_CLUSTERS,
})

const ClusterSelectionList: React.FC<ClusterSelectionType> = ({
    clusterOptions,
    clusterListLoader,
    initialLoading,
    refreshData,
    parentRef,
}) => {
    const [lastSyncTime, setLastSyncTime] = useState<Dayjs>(dayjs())

    const {
        searchKey,
        clusterFilter,
        updateSearchParams,
        handleSearch,
        clearFilters,
        sortBy,
        sortOrder,
        handleSorting,
    } = useUrlFilters<ClusterMapListSortableKeys, { clusterFilter: ClusterFiltersType }>({
        parseSearchParams,
        initialSortKey: ClusterMapListSortableKeys.CLUSTER_NAME,
    })

    const { handleBulkSelection, setIdentifiers, isBulkSelectionApplied, getSelectedIdentifiersCount } =
        useBulkSelection<BulkSelectionIdentifiersType<ClusterDetail>>()

    useEffect(() => {
        if (clusterOptions.length) {
            const clusterIdentifier: BulkSelectionIdentifiersType<ClusterDetail> = {}
            clusterOptions.forEach((cluster) => {
                clusterIdentifier[cluster.name] = cluster
            })
            setIdentifiers(clusterIdentifier)
        }
    }, [clusterOptions])

    const filteredList: ClusterDetail[] = useMemo(() => {
        const loweredSearchKey = searchKey.toLowerCase()
        const updatedClusterOptions = [...clusterOptions]
        // Sort the cluster list based on the selected sorting key
        getSortedClusterList(updatedClusterOptions, sortBy, sortOrder)

        // Filter the cluster list based on the search key and cluster filter
        return updatedClusterOptions.filter((option) => {
            const filterCondition =
                clusterFilter === ClusterFiltersType.ALL_CLUSTERS ||
                !option.status ||
                option.status === ClusterStatusByFilter[clusterFilter]

            return (!searchKey || option.name.toLowerCase().includes(loweredSearchKey)) && filterCondition
        })
    }, [searchKey, clusterOptions, `${clusterFilter}`, sortBy, sortOrder])

    const handleFilterKeyPress = (value: string) => {
        handleSearch(value)
    }

    const handleRefresh = () => {
        refreshData()
        setLastSyncTime(dayjs())
    }

    const setClusterFilter = (_clusterFilter: ClusterFiltersType) => {
        updateSearchParams({ clusterFilter: _clusterFilter })
    }

    if (!clusterOptions.length) {
        return (
            <GenericEmptyState
                image={NoClusterEmptyState}
                title="No clusters found"
                subTitle="Add a cluster to view and debug Kubernetes resources in the cluster"
                renderButton={AddClusterButton}
            />
        )
    }

    const handleCellSorting = (cellToSort: ClusterMapListSortableKeys) => () => {
        handleSorting(cellToSort)
    }

    const renderClusterListContent = () => (
        <div className="cluster-list-main-container flex-grow-1 flexbox-col bg__primary dc__overflow-auto">
            <div className="flexbox dc__content-space pl-20 pr-20 pt-16 pb-16 dc__zi-4">
                <div className="flex dc__gap-12">
                    <SearchBar
                        initialSearchText={searchKey}
                        handleEnter={handleFilterKeyPress}
                        containerClassName="w-250-imp"
                        inputProps={{
                            placeholder: 'Search clusters',
                            autoFocus: true,
                            disabled: initialLoading,
                        }}
                    />
                    {ClusterFilters && (
                        <ClusterFilters clusterFilter={clusterFilter} setClusterFilter={setClusterFilter} />
                    )}
                </div>
                <div className="fs-13 flex">
                    {clusterListLoader ? (
                        <span className="dc__loading-dots mr-20">Syncing</span>
                    ) : (
                        <>
                            <span>
                                Last refreshed&nbsp;
                                <Timer start={lastSyncTime} />
                                &nbsp;ago
                            </span>
                            <button
                                type="button"
                                data-testid="cluster-list-refresh-button"
                                className="btn btn-link p-0 fw-6 cb-5 ml-5 fs-13"
                                onClick={handleRefresh}
                            >
                                Refresh
                            </button>
                        </>
                    )}
                </div>
            </div>
            {ClusterMap && window._env_.FEATURE_CLUSTER_MAP_ENABLE && (
                <ClusterMap
                    isLoading={clusterListLoader}
                    filteredList={filteredList}
                    clusterListLoader={clusterListLoader}
                    isProportional
                />
            )}
            {!filteredList.length ? (
                <div className="flex-grow-1">
                    <ClusterNodeEmptyState actionHandler={clearFilters} />
                </div>
            ) : (
                <div data-testid="cluster-list-container" className="flexbox-col flex-grow-1">
                    <div className="cluster-list-row fw-6 cn-7 fs-12 dc__border-bottom pt-8 pb-8 pr-20 pl-20 dc__uppercase bg__primary dc__position-sticky dc__top-0 dc__zi-3">
                        {Object.entries(ClusterMapListSortableKeys).map(([cellName, cellKey]) => (
                            <>
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
                            </>
                        ))}
                    </div>
                    {filteredList.map((clusterData, index) => (
                        <ClusterListRow clusterData={clusterData} index={index} clusterListLoader={clusterListLoader} />
                    ))}
                </div>
            )}
        </div>
    )

    const handleClearBulkSelection = () => {
        handleBulkSelection({
            action: BulkSelectionEvents.CLEAR_ALL_SELECTIONS,
        })
    }

    const renderClusterBulkSelection = () => {
        if (getSelectedIdentifiersCount() > 0 || isBulkSelectionApplied) {
            return (
                <ClusterBulkSelectionActionWidget
                    parentRef={parentRef}
                    count={isBulkSelectionApplied ? clusterOptions?.length ?? 0 : getSelectedIdentifiersCount()}
                    handleClearBulkSelection={handleClearBulkSelection}
                />
            )
        }
        return null
    }

    return (
        <div ref={parentRef} className="flexbox-col flex-grow-1">
            {renderClusterBulkSelection()}
            {renderClusterListContent()}
        </div>
    )
}

const BaseClusterList = (props: ClusterSelectionType) => {
    const { clusterOptions } = props
    const allOnThisPageIdentifiers = useMemo(
        () =>
            clusterOptions?.reduce((acc, cluster) => {
                acc[cluster.name] = cluster
                return acc
            }, {} as ClusterDetail) ?? {},
        [clusterOptions],
    )

    return (
        <BulkSelectionProvider<BulkSelectionIdentifiersType<ClusterDetail>>
            identifiers={allOnThisPageIdentifiers}
            getSelectAllDialogStatus={() => SelectAllDialogStatus.CLOSED}
        >
            <ClusterSelectionList {...props} />
        </BulkSelectionProvider>
    )
}

export default BaseClusterList
