import { useMemo, useState } from 'react'

import {
    Chart,
    getSelectPickerOptionByValue,
    numberComparatorBySortOrder,
    OVERVIEW_PAGE_SIZE_OPTIONS,
    Pagination,
    SelectPicker,
    SelectPickerOptionType,
    SelectPickerVariantType,
    stringComparatorBySortOrder,
    TabGroup,
    useStateFilters,
} from '@devtron-labs/devtron-fe-common-lib'

import { ClusterDistributionKeys } from '../types'
import { CLUSTER_NODE_COUNT_SORTING_OPTIONS } from './constants'
import { ClusterCountsProps, ClusterNodeCountSortConfigType } from './types'
import { getClusterNodeTooltipContent } from './utils'

const ClusterCounts = ({ clusterDistribution }: ClusterCountsProps) => {
    const { offset, pageSize, changePage, changePageSize } = useStateFilters({
        defaultPageSize: OVERVIEW_PAGE_SIZE_OPTIONS[0].value,
    })
    const [groupBy, setGroupBy] = useState<ClusterDistributionKeys>(ClusterDistributionKeys.BY_PROVIDER)
    const [sortConfig, setSortingConfig] = useState<ClusterNodeCountSortConfigType>(
        CLUSTER_NODE_COUNT_SORTING_OPTIONS[0].value,
    )

    const totalSize = (clusterDistribution?.[groupBy] ?? []).length
    const isGroupedByProviders = groupBy === ClusterDistributionKeys.BY_PROVIDER

    const { xAxisLabels, yAxisValues } = useMemo(() => {
        const sortedSlicedDistribution = (clusterDistribution?.[groupBy] ?? [])
            .sort((a, b) => {
                if (sortConfig.sortBy === 'name') {
                    return stringComparatorBySortOrder(
                        isGroupedByProviders ? a.provider : a.version,
                        isGroupedByProviders ? b.provider : b.version,
                        sortConfig.sortOrder,
                    )
                }
                return numberComparatorBySortOrder(a.count, b.count, sortConfig.sortOrder)
            })
            .slice(offset, offset + pageSize)

        return {
            xAxisLabels: sortedSlicedDistribution.map((item) => (isGroupedByProviders ? item.provider : item.version)),
            yAxisValues: sortedSlicedDistribution.map((item) => item.count),
        }
    }, [clusterDistribution, groupBy, isGroupedByProviders, sortConfig, offset, pageSize])

    const handleChangeSorting = (selectedSortOrder: SelectPickerOptionType<ClusterNodeCountSortConfigType>) => {
        setSortingConfig(selectedSortOrder.value)
        changePage(1)
    }

    const getTabChangeHandler = (selectedGroupBy: ClusterDistributionKeys) => () => {
        setGroupBy(selectedGroupBy)
        changePage(1)
    }

    const renderChart = () => (
        // Custom logic for height according to number of pipeliens, update when barThickness is added in chart
        <div className="p-16 mh-200 mxh-600" style={{ height: (xAxisLabels.length + 1) * 40 }}>
            <Chart
                id={`cluster-count-${groupBy}`}
                type="stackedBarHorizontal"
                xAxisLabels={xAxisLabels}
                datasets={[
                    {
                        datasetName: 'Number of clusters',
                        yAxisValues,
                        color: 'SkyBlue500',
                    },
                ]}
                tooltipConfig={{
                    getTooltipContent: getClusterNodeTooltipContent('Number of clusters', xAxisLabels, yAxisValues),
                }}
            />
        </div>
    )

    return (
        <div className="flexbox-col border__secondary bg__primary br-8">
            <div className="flex dc__content-space py-12 px-16">
                <span className="fs-14 fw-6 lh-1-5 cn-9">Cluster Counts</span>
                <SelectPicker
                    inputId="select-cluster-counts-sort-order"
                    options={CLUSTER_NODE_COUNT_SORTING_OPTIONS}
                    variant={SelectPickerVariantType.COMPACT}
                    value={getSelectPickerOptionByValue(CLUSTER_NODE_COUNT_SORTING_OPTIONS, sortConfig)}
                    onChange={handleChangeSorting}
                    isSearchable={false}
                    shouldMenuAlignRight
                />
            </div>
            <div className="px-16 border__secondary--bottom">
                <TabGroup
                    tabs={[
                        {
                            id: ClusterDistributionKeys.BY_PROVIDER,
                            label: 'By Providers',
                            tabType: 'button',
                            props: { onClick: getTabChangeHandler(ClusterDistributionKeys.BY_PROVIDER) },
                            active: isGroupedByProviders,
                        },
                        {
                            id: ClusterDistributionKeys.BY_VERSION,
                            label: 'By Cluster Versions',
                            tabType: 'button',
                            props: { onClick: getTabChangeHandler(ClusterDistributionKeys.BY_VERSION) },
                            active: !isGroupedByProviders,
                        },
                    ]}
                />
            </div>
            {renderChart()}
            {totalSize > OVERVIEW_PAGE_SIZE_OPTIONS[0].value && (
                <Pagination
                    size={totalSize}
                    offset={offset}
                    pageSize={pageSize}
                    changePage={changePage}
                    changePageSize={changePageSize}
                    pageSizeOptions={OVERVIEW_PAGE_SIZE_OPTIONS}
                    rootClassName="flex dc__content-space border__secondary--top px-16"
                />
            )}
        </div>
    )
}

export default ClusterCounts
