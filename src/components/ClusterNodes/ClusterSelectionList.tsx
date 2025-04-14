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

import React, { useMemo, useRef, useState } from 'react'
import dayjs, { Dayjs } from 'dayjs'

import {
    BulkSelectionEvents,
    BulkSelectionIdentifiersType,
    BulkSelectionProvider,
    ClusterDetail,
    ClusterFiltersType,
    GenericEmptyState,
    SearchBar,
    SelectAllDialogStatus,
    useBulkSelection,
    useUrlFilters,
} from '@devtron-labs/devtron-fe-common-lib'

import NoClusterEmptyState from '@Images/no-cluster-empty-state.png'
import { importComponentFromFELibrary } from '@Components/common'
import Timer from '@Components/common/DynamicTabs/DynamicTabs.timer'
import { AddClusterButton } from '@Components/ResourceBrowser/PageHeader.buttons'

import { ClusterSelectionType } from '../ResourceBrowser/Types'
import { ClusterList } from './ClusterList'
import ClusterNodeEmptyState from './ClusterNodeEmptyStates'
import { ClusterMapListSortableKeys, ClusterStatusByFilter } from './constants'
import { getSortedClusterList, parseSearchParams } from './utils'

import './clusterNodes.scss'

const ClusterMap = importComponentFromFELibrary('ClusterMap', null, 'function')
const ClusterFilters = importComponentFromFELibrary('ClusterFilters', null, 'function')
const ClusterBulkSelectionActionWidget = importComponentFromFELibrary(
    'ClusterBulkSelectionActionWidget',
    null,
    'function',
)
const KubeConfigModal = importComponentFromFELibrary('KubeConfigModal', null, 'function')

const ClusterSelectionList: React.FC<ClusterSelectionType> = ({
    clusterOptions,
    clusterListLoader,
    initialLoading,
    refreshData,
}) => {
    const parentRef = useRef<HTMLDivElement>(null)

    const [lastSyncTime, setLastSyncTime] = useState<Dayjs>(dayjs())
    const [showKubeConfigModal, setKubeConfigModal] = useState(false)
    const [selectedClusterName, setSelectedClusterName] = useState('')

    const { searchKey, clusterFilter, updateSearchParams, handleSearch, clearFilters, sortBy, sortOrder } =
        useUrlFilters<ClusterMapListSortableKeys, { clusterFilter: ClusterFiltersType }>({
            parseSearchParams,
            initialSortKey: ClusterMapListSortableKeys.CLUSTER_NAME,
        })

    const { handleBulkSelection, isBulkSelectionApplied, getSelectedIdentifiersCount } =
        useBulkSelection<BulkSelectionIdentifiersType<ClusterDetail>>()

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

    const handleClearBulkSelection = () => {
        handleBulkSelection({
            action: BulkSelectionEvents.CLEAR_ALL_SELECTIONS,
        })
    }

    const handleRefresh = () => {
        refreshData()
        setLastSyncTime(dayjs())
        handleClearBulkSelection()
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

    const onChangeShowKubeConfigModal = () => {
        setKubeConfigModal(true)
    }

    const onChangeCloseKubeConfigModal = () => {
        setKubeConfigModal(false)
    }

    const renderClusterList = () => (
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
                <ClusterList
                    filteredList={filteredList}
                    clusterListLoader={clusterListLoader}
                    setSelectedClusterName={setSelectedClusterName}
                    showKubeConfigModal={showKubeConfigModal}
                    onChangeShowKubeConfigModal={onChangeShowKubeConfigModal}
                />
            )}
        </div>
    )

    const renderClusterBulkSelection = () => {
        if (getSelectedIdentifiersCount() > 0 || isBulkSelectionApplied) {
            return (
                <ClusterBulkSelectionActionWidget
                    parentRef={parentRef}
                    count={isBulkSelectionApplied ? clusterOptions?.length ?? 0 : getSelectedIdentifiersCount()}
                    handleClearBulkSelection={handleClearBulkSelection}
                    onChangeShowKubeConfigModal={onChangeShowKubeConfigModal}
                />
            )
        }
        return null
    }

    return (
        <div ref={parentRef} className="flexbox-col flex-grow-1">
            {renderClusterBulkSelection()}
            {renderClusterList()}
            {showKubeConfigModal && KubeConfigModal && (
                <KubeConfigModal
                    clusterName={selectedClusterName || getSelectedIdentifiersCount() === 0}
                    handleModalClose={onChangeCloseKubeConfigModal}
                    isSingleClusterButton={!!selectedClusterName}
                />
            )}
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

    const getSelectAllDialogStatus = () => SelectAllDialogStatus.CLOSED

    return (
        <BulkSelectionProvider<BulkSelectionIdentifiersType<ClusterDetail>>
            identifiers={allOnThisPageIdentifiers}
            getSelectAllDialogStatus={getSelectAllDialogStatus}
        >
            <ClusterSelectionList {...props} />
        </BulkSelectionProvider>
    )
}

export default BaseClusterList
