import { useMemo, useState } from 'react'
import { generatePath, NavLink } from 'react-router-dom'

import {
    getSelectPickerOptionByValue,
    OVERVIEW_PAGE_SIZE_OPTIONS_SMALL,
    Pagination,
    ROUTER_URLS,
    SelectPicker,
    SelectPickerOptionType,
    SelectPickerVariantType,
    SortingOrder,
    Tooltip,
    useStateFilters,
} from '@devtron-labs/devtron-fe-common-lib'

import { ClusterCapacityDistribution } from '../types'
import { CLUSTER_CAPACITY_SORTING_OPTIONS } from './constants'
import { ClusterCapacityDistributionProps, ClusterCapacitySortKeys } from './types'
import { getClusterResourceCapacitySort, ResourceAllocationBar } from './utils'

const ClusterNameCellComponent = ({
    clusterId,
    clusterName,
}: Pick<ClusterCapacityDistribution, 'clusterId' | 'clusterName'>) => {
    const path = generatePath(ROUTER_URLS.RESOURCE_BROWSER.CLUSTER_DETAILS.OVERVIEW, {
        clusterId: String(clusterId),
    })

    return (
        <NavLink to={path} className="flex dc__content-start">
            <Tooltip content={clusterName}>
                <span className="dc__truncate">{clusterName}</span>
            </Tooltip>
        </NavLink>
    )
}

const CPUCapacityCellComponent = ({ cpu }: Pick<ClusterCapacityDistribution, 'cpu'>) => (
    <ResourceAllocationBar {...cpu} bgColor="LimeGreen400" />
)

const MemoryCapacityCellComponent = ({ memory }: Pick<ClusterCapacityDistribution, 'memory'>) => (
    <ResourceAllocationBar {...memory} />
)

const CapacityAndResources = ({ clusterCapacityDistribution }: ClusterCapacityDistributionProps) => {
    const { offset, pageSize, changePage, changePageSize } = useStateFilters<ClusterCapacitySortKeys>({
        initialSortKey: 'clusterName',
        defaultPageSize: OVERVIEW_PAGE_SIZE_OPTIONS_SMALL[0].value,
    })

    const [sortBy, setSortBy] = useState<ClusterCapacitySortKeys>('clusterName')
    const [sortOrder, setSortOrder] = useState<SortingOrder>(SortingOrder.ASC)

    const handleChangeSorting = (selectedSortBy: SelectPickerOptionType<ClusterCapacitySortKeys>) => {
        const { value } = selectedSortBy
        if (sortBy === 'clusterName' && value !== 'clusterName') {
            // Sort by clusterName to any other sortBy --> default order DESC
            setSortOrder(SortingOrder.DESC)
        } else if (sortBy !== 'clusterName' && value === 'clusterName') {
            // Sort by any other sortBy to clusterName --> default order ASC
            setSortOrder(SortingOrder.ASC)
        }
        setSortBy(selectedSortBy.value)
        changePage(1)
    }

    const handleChangeSortOrder = (selectedSortOrder: SelectPickerOptionType<SortingOrder>) => {
        setSortOrder(selectedSortOrder.value)
        changePage(1)
    }

    const rows = useMemo(
        () =>
            (clusterCapacityDistribution ?? [])
                .sort((a, b) => getClusterResourceCapacitySort(a, b, sortBy, sortOrder))
                .slice(offset, offset + pageSize),
        [clusterCapacityDistribution, offset, pageSize, sortBy, sortOrder],
    )

    const totalSize = clusterCapacityDistribution?.length || 0

    const SORT_ORDER_OPTIONS: SelectPickerOptionType<SortingOrder>[] = useMemo(
        () => [
            { label: sortBy === 'clusterName' ? 'A to Z' : 'Low to High', value: SortingOrder.ASC },
            { label: sortBy === 'clusterName' ? 'Z to A' : 'High to Low', value: SortingOrder.DESC },
        ],
        [sortBy],
    )

    return (
        <div className="flexbox-col bg__primary border__secondary br-8">
            <div className="flex dc__content-space py-12 px-16">
                <span className="fs-14 fw-6 lh-1-5 cn-9">Cluster Capacity & Resource Allocation</span>
                <div className="flexbox dc__gap-8">
                    <span className="fs-13 fw-6 lh-1-5 cn-7">Sort by:</span>
                    <SelectPicker
                        inputId="select-cluster-capacity-sort-by"
                        options={CLUSTER_CAPACITY_SORTING_OPTIONS}
                        variant={SelectPickerVariantType.COMPACT}
                        value={getSelectPickerOptionByValue(CLUSTER_CAPACITY_SORTING_OPTIONS, sortBy)}
                        onChange={handleChangeSorting}
                        isSearchable={false}
                        shouldMenuAlignRight
                    />
                    <div className="divider__secondary" />
                    <SelectPicker
                        inputId="select-cluster-capacity-sort-order"
                        options={SORT_ORDER_OPTIONS}
                        variant={SelectPickerVariantType.COMPACT}
                        value={getSelectPickerOptionByValue(SORT_ORDER_OPTIONS, sortOrder)}
                        onChange={handleChangeSortOrder}
                        isSearchable={false}
                        shouldMenuAlignRight
                    />
                </div>
            </div>
            <div className="flexbox-col">
                <div className="dc__grid dc__gap-24 capacity-table-row fs-12 fw-6 lh-20 cn-7 px-16 py-8">
                    <span>CLUSTER NAME</span>
                    <span>CPU</span>
                    <span>MEMORY</span>
                </div>
                <div>
                    {rows.map(({ clusterId, clusterName, memory, cpu }) => (
                        <div key={clusterId} className="dc__grid dc__gap-24 capacity-table-row p-16 dc__hover-n50">
                            <ClusterNameCellComponent clusterId={clusterId} clusterName={clusterName} />
                            <CPUCapacityCellComponent cpu={cpu} />
                            <MemoryCapacityCellComponent memory={memory} />
                        </div>
                    ))}
                </div>
            </div>
            {totalSize > OVERVIEW_PAGE_SIZE_OPTIONS_SMALL[0].value && (
                <Pagination
                    size={totalSize}
                    offset={offset}
                    pageSize={pageSize}
                    changePage={changePage}
                    changePageSize={changePageSize}
                    pageSizeOptions={OVERVIEW_PAGE_SIZE_OPTIONS_SMALL}
                    rootClassName="flex dc__content-space border__secondary--top px-16"
                />
            )}
        </div>
    )
}

export default CapacityAndResources
