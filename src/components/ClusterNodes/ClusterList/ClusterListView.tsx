import { useMemo } from 'react'

import {
    BulkSelectionIdentifiersType,
    BulkSelectionProvider,
    ClusterDetail,
    ClusterFiltersType,
    SearchBar,
    SelectAllDialogStatus,
    useUrlFilters,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'

import { ClusterMapListSortableKeys, ClusterStatusByFilter } from '../constants'
import { getSortedClusterList, parseSearchParams } from '../utils'
import ClusterSelectionBody from './ClusterSelectionBody'
import { ClusterViewType } from './types'

const ClusterFilters = importComponentFromFELibrary('ClusterFilters', null, 'function')

const getSelectAllDialogStatus = () => SelectAllDialogStatus.CLOSED

const ClusterListView = (props: ClusterViewType) => {
    const { searchKey, clusterFilter, updateSearchParams, handleSearch, sortBy, sortOrder } = useUrlFilters<
        ClusterMapListSortableKeys,
        { clusterFilter: ClusterFiltersType }
    >({
        parseSearchParams,
        initialSortKey: ClusterMapListSortableKeys.CLUSTER_NAME,
    })
    const { clusterOptions, initialLoading } = props

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
                acc[cluster.name] = cluster
                return acc
            }, {} as ClusterDetail) ?? {},
        [clusterOptions],
    )

    return (
        <BulkSelectionProvider<BulkSelectionIdentifiersType<ClusterDetail>>
            identifiers={allOnThisPageIdentifiers}
            getSelectAllDialogStatus={getSelectAllDialogStatus}
        >
            <div className="flex dc__gap-12 dc__content-space">
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
                {ClusterFilters && <ClusterFilters clusterFilter={clusterFilter} setClusterFilter={setClusterFilter} />}
            </div>
            <ClusterSelectionBody {...props} filteredList={filteredList} />
        </BulkSelectionProvider>
    )
}

export default ClusterListView
