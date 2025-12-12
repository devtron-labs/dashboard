import { useMemo, useState } from 'react'
import { generatePath, useHistory } from 'react-router-dom'

import {
    ButtonComponentType,
    ButtonVariantType,
    Chart,
    ChartProps,
    ComponentSizeType,
    getDocumentationUrl,
    getSelectPickerOptionByValue,
    Icon,
    InfoBlock,
    K8S_EMPTY_GROUP,
    numberComparatorBySortOrder,
    OVERVIEW_PAGE_SIZE_OPTIONS,
    Pagination,
    RESOURCE_BROWSER_ROUTES,
    SelectPicker,
    SelectPickerOptionType,
    SelectPickerVariantType,
    stringComparatorBySortOrder,
    TabGroup,
    useMainContext,
    useStateFilters,
} from '@devtron-labs/devtron-fe-common-lib'

import { NodeDistributionKeys, NodeViewGroupType } from '../types'
import { AUTOSCALER_TYPE_LABELS, CLUSTER_NODE_COUNT_SORTING_OPTIONS, NODE_VIEW_GROUP_TITLE_MAP } from './constants'
import NodeViewGroupList from './NodeViewGroupList'
import { ClusterNodeCountSortConfigType, NodeCountsProps } from './types'
import { getClusterNodeTooltipContent } from './utils'

const NodeCounts = ({ nodeDistribution }: NodeCountsProps) => {
    const { setTempAppWindowConfig } = useMainContext()
    const { push, location } = useHistory()
    const { offset, pageSize, changePage, changePageSize } = useStateFilters({
        defaultPageSize: OVERVIEW_PAGE_SIZE_OPTIONS[0].value,
    })
    const [groupBy, setGroupBy] = useState<NodeDistributionKeys>(NodeDistributionKeys.BY_CLUSTERS)
    const [sortConfig, setSortingConfig] = useState<ClusterNodeCountSortConfigType>(
        CLUSTER_NODE_COUNT_SORTING_OPTIONS[0].value,
    )

    const totalSize = (nodeDistribution?.[groupBy] ?? []).length
    const isGroupedByClusters = groupBy === NodeDistributionKeys.BY_CLUSTERS

    const getTabChangeHandler = (selectedGroupBy: NodeDistributionKeys) => () => {
        setGroupBy(selectedGroupBy)
        changePage(1)
    }

    const handleChangeSorting = (selectedSortOrder: SelectPickerOptionType<ClusterNodeCountSortConfigType>) => {
        setSortingConfig(selectedSortOrder.value)
        changePage(1)
    }

    const handleOpenNodeList: ChartProps['onChartClick'] = (_, idx) => {
        const searchParams = new URLSearchParams({
            autoscalerType: nodeDistribution[NodeDistributionKeys.BY_AUTOSCALER][idx].autoscalerType,
        })
        setTempAppWindowConfig({
            open: true,
            title: NODE_VIEW_GROUP_TITLE_MAP[NodeViewGroupType.AUTOSCALER_MANAGED],
            component: <NodeViewGroupList nodeViewGroupType={NodeViewGroupType.AUTOSCALER_MANAGED} />,
            customCloseConfig: {
                beforeClose: () => {
                    push(location.pathname)
                },
                icon: null,
            },
        })
        push({ search: searchParams.toString() })
    }

    const handleRedirectToCluster: ChartProps['onChartClick'] = (_, idx) => {
        const path = generatePath(RESOURCE_BROWSER_ROUTES.K8S_RESOURCE_LIST, {
            clusterId: nodeDistribution[NodeDistributionKeys.BY_CLUSTERS][idx].clusterId,
            kind: 'node',
            group: K8S_EMPTY_GROUP,
        })
        push(path)
    }

    const { xAxisLabels, yAxisValues } = useMemo(() => {
        const sortedSlicedDistribution = (nodeDistribution?.[groupBy] ?? [])
            .sort((a, b) => {
                if (sortConfig.sortBy === 'name') {
                    return stringComparatorBySortOrder(
                        isGroupedByClusters ? a.clusterName : a.autoscalerType,
                        isGroupedByClusters ? b.clusterName : b.autoscalerType,
                        sortConfig.sortOrder,
                    )
                }
                return numberComparatorBySortOrder(a.nodeCount, b.nodeCount, sortConfig.sortOrder)
            })
            .slice(offset, offset + pageSize)

        return {
            xAxisLabels: sortedSlicedDistribution.map((item) =>
                isGroupedByClusters ? item.clusterName : AUTOSCALER_TYPE_LABELS[item.autoscalerType],
            ),
            yAxisValues: sortedSlicedDistribution.map((item) => item.nodeCount),
        }
    }, [nodeDistribution, groupBy, isGroupedByClusters, sortConfig, offset, pageSize])

    const renderChart = () => (
        // Custom logic for height according to number of pipeliens, update when barThickness is added in chart
        <div className="p-16 mh-200 mxh-600" style={{ height: (xAxisLabels.length + 1) * 40 }}>
            <Chart
                id={`node-count-${groupBy}`}
                type="stackedBarHorizontal"
                xAxisLabels={xAxisLabels}
                datasets={[
                    {
                        datasetName: 'Number of nodes',
                        yAxisValues,
                        color: 'SkyBlue500',
                        isClickable: true,
                    },
                ]}
                onChartClick={isGroupedByClusters ? handleRedirectToCluster : handleOpenNodeList}
                tooltipConfig={{
                    getTooltipContent: getClusterNodeTooltipContent('Number of nodes', xAxisLabels, yAxisValues),
                }}
            />
        </div>
    )

    return (
        <div className="flexbox-col border__secondary bg__primary br-8">
            <div className="flex dc__content-space py-12 px-16">
                <span className="fs-14 fw-6 lh-1-5 cn-9">Node Counts</span>
                <SelectPicker
                    inputId="select-triggered-pipeline-sort-order"
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
                            id: NodeDistributionKeys.BY_CLUSTERS,
                            label: 'By Cluster',
                            tabType: 'button',
                            props: { onClick: getTabChangeHandler(NodeDistributionKeys.BY_CLUSTERS) },
                            active: isGroupedByClusters,
                        },
                        {
                            id: NodeDistributionKeys.BY_AUTOSCALER,
                            label: 'By Autoscaler',
                            tabType: 'button',
                            props: { onClick: getTabChangeHandler(NodeDistributionKeys.BY_AUTOSCALER) },
                            active: !isGroupedByClusters,
                        },
                    ]}
                />
            </div>
            {renderChart()}
            {groupBy === NodeDistributionKeys.BY_AUTOSCALER && (
                <InfoBlock
                    description="Devtron identifies only a fixed set of autoscaler labels. Nodes without these appear as ‘Not detected’."
                    variant="neutral"
                    size={ComponentSizeType.medium}
                    buttonProps={{
                        dataTestId: 'learn-about-autoscaler-types',
                        text: 'Learn more',
                        endIcon: <Icon name="ic-book-open" color={null} />,
                        component: ButtonComponentType.anchor,
                        anchorProps: {
                            href: getDocumentationUrl({ docLinkKey: 'AUTOSCALER_DETECTION', isEnterprise: true }),
                        },
                        variant: ButtonVariantType.text,
                        size: ComponentSizeType.xs,
                    }}
                    borderConfig={{ right: false, left: false, bottom: false }}
                    borderRadiusConfig={{ bottom: false, top: false, left: false, right: false }}
                />
            )}
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

export default NodeCounts
