import { useMemo, useState } from 'react'
import dayjs, { Dayjs } from 'dayjs'

import {
    BulkSelectionEvents,
    BulkSelectionIdentifiersType,
    BulkSelectionProvider,
    Button,
    ButtonVariantType,
    ClusterDetail,
    ClusterFiltersType,
    SearchBar,
    SelectAllDialogStatus,
    useBulkSelection,
    useUrlFilters,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'
import Timer from '@Components/common/DynamicTabs/DynamicTabs.timer'

import { ClusterMapListSortableKeys, ClusterStatusByFilter } from '../constants'
import { getSortedClusterList, parseSearchParams } from '../utils'
import ClusterSelectionBody from './ClusterSelectionBody'
import { ClusterViewType } from './types'

const ClusterFilters = importComponentFromFELibrary('ClusterFilters', null, 'function')

const getSelectAllDialogStatus = () => SelectAllDialogStatus.CLOSED

const ClusterListView = (props: ClusterViewType) => {
    const [lastSyncTime, setLastSyncTime] = useState<Dayjs>(dayjs())

    const { searchKey, clusterFilter, updateSearchParams, handleSearch, sortBy, sortOrder } = useUrlFilters<
        ClusterMapListSortableKeys,
        { clusterFilter: ClusterFiltersType }
    >({
        parseSearchParams,
        initialSortKey: ClusterMapListSortableKeys.CLUSTER_NAME,
    })
    const { handleBulkSelection } = useBulkSelection<BulkSelectionIdentifiersType<ClusterDetail>>()

    const { clusterOptions, initialLoading, clusterListLoader, refreshData } = props

    const setClusterFilter = (_clusterFilter: ClusterFiltersType) => {
        updateSearchParams({ clusterFilter: _clusterFilter })
    }

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

    const allOnThisPageIdentifiers = useMemo(
        () =>
            filteredList?.reduce((acc, cluster) => {
                // NOTE: clusters that are being created or deleted don't have corresponding id
                // and should not be included in the bulk selection
                if (!cluster.id) {
                    return acc
                }
                acc[cluster.name] = cluster
                return acc
            }, {} as ClusterDetail) ?? {},
        [filteredList],
    )

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

    return (
        <BulkSelectionProvider<BulkSelectionIdentifiersType<ClusterDetail>>
            identifiers={allOnThisPageIdentifiers}
            getSelectAllDialogStatus={getSelectAllDialogStatus}
        >
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
                {clusterListLoader ? (
                    <span className="dc__loading-dots mr-20">Syncing</span>
                ) : (
                    <div className="flex left dc__gap-8">
                        <span>
                            Last refreshed&nbsp;
                            <Timer start={lastSyncTime} />
                            &nbsp;ago
                        </span>
                        <Button
                            text="Refresh"
                            dataTestId="cluster-list-refresh-button"
                            onClick={handleRefresh}
                            variant={ButtonVariantType.text}
                        />
                    </div>
                )}
            </div>

            <ClusterSelectionBody {...props} filteredList={filteredList} />
        </BulkSelectionProvider>
    )
}

export default ClusterListView
