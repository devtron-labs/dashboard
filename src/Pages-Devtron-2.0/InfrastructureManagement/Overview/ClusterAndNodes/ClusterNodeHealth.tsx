import { useNavigate } from 'react-router-dom'

import {
    Chart,
    ChartColorKey,
    ChartProps,
    noop,
    ROUTER_URLS,
    SectionEmptyState,
    useMainContext,
} from '@devtron-labs/devtron-fe-common-lib'

import { ClusterNodeHealthStatusKeys, NodeViewGroupType } from '../types'
import { getClusterListingUrl } from '../utils'
import {
    CLUSTER_NODE_HEALTH_CARDS_TITLE,
    CLUSTER_NODE_HEALTH_CHART_COLORS,
    CLUSTER_NODE_HEALTH_LABELS,
    NODE_VIEW_GROUP_TITLE_MAP,
} from './constants'
import NodeViewGroupList from './NodeViewGroupList'
import { ClusterNodeHealthCardProps, ClusterNodeHealthProps } from './types'
import {
    getClusterFilterTypeFromLabel,
    getClusterNodeHealthChartTooltip,
    getNodeErrorFilterTypeFromLabel,
    getNodeSchedulingFilterTypeFromLabel,
} from './utils'

const ClusterNodeHealthCard = ({
    title,
    metricKey,
    datasets,
    xAxisLabels,
    onChartClick,
}: ClusterNodeHealthCardProps) => {
    const areAllValuesZero = !datasets.yAxisValues.length

    return (
        <div className="flexbox-col bg__primary br-8 border__secondary">
            <div className="flex left px-16 py-12 border__secondary--bottom">
                <span className="fs-14 fw-6 lh-1-5 cn-9">{title}</span>
            </div>
            <div className="flex h-200 p-16">
                {/* Empty state is valid only for node errors */}
                {metricKey === ClusterNodeHealthStatusKeys.NODE_ERRORS_BREAKDOWN && areAllValuesZero ? (
                    <SectionEmptyState
                        iconName="ic-check-circle"
                        iconColor="G500"
                        title="No node errors"
                        subtitle="Nodes are operating without errors"
                    />
                ) : (
                    <Chart
                        id={`${title}-chart`}
                        type="pie"
                        xAxisLabels={xAxisLabels}
                        datasets={datasets}
                        onChartClick={onChartClick}
                        tooltipConfig={{
                            getTooltipContent: getClusterNodeHealthChartTooltip(
                                title,
                                xAxisLabels,
                                datasets.yAxisValues,
                                datasets.colors,
                            ),
                        }}
                    />
                )}
            </div>
        </div>
    )
}

const ClusterNodeHealth = ({ clusterNodeHealth }: ClusterNodeHealthProps) => {
    const navigate = useNavigate()
    const { setTempAppWindowConfig } = useMainContext()

    const getChartClickHandler: (key: ClusterNodeHealthStatusKeys) => ChartProps['onChartClick'] = (key) => {
        switch (key) {
            case ClusterNodeHealthStatusKeys.NODE_ERRORS_BREAKDOWN:
                return (datasetName) => {
                    const searchParams = new URLSearchParams({
                        errorType: getNodeErrorFilterTypeFromLabel(datasetName),
                    })
                    setTempAppWindowConfig({
                        open: true,
                        title: NODE_VIEW_GROUP_TITLE_MAP[NodeViewGroupType.NODE_ERRORS],
                        component: <NodeViewGroupList nodeViewGroupType={NodeViewGroupType.NODE_ERRORS} />,
                        customCloseConfig: {
                            icon: null,
                            beforeClose: () => {
                                navigate(ROUTER_URLS.INFRASTRUCTURE_MANAGEMENT_OVERVIEW)
                            },
                        },
                    })
                    navigate({ search: searchParams.toString() })
                }
            case ClusterNodeHealthStatusKeys.NODE_SCHEDULING_BREAKDOWN:
                return (datasetName) => {
                    const searchParams = new URLSearchParams({
                        schedulableType: getNodeSchedulingFilterTypeFromLabel(datasetName),
                    })

                    setTempAppWindowConfig({
                        open: true,
                        title: NODE_VIEW_GROUP_TITLE_MAP[NodeViewGroupType.NODE_SCHEDULING],
                        component: <NodeViewGroupList nodeViewGroupType={NodeViewGroupType.NODE_SCHEDULING} />,
                        customCloseConfig: {
                            icon: null,
                            beforeClose: () => {
                                navigate(ROUTER_URLS.INFRASTRUCTURE_MANAGEMENT_OVERVIEW)
                            },
                        },
                    })
                    navigate({ search: searchParams.toString() })
                }

            case ClusterNodeHealthStatusKeys.CLUSTER_STATUS_BREAKDOWN:
                return (datasetName) => {
                    const clusterFilter = getClusterFilterTypeFromLabel(datasetName)
                    return navigate(getClusterListingUrl(clusterFilter))
                }
            default:
                return noop
        }
    }

    return (
        <div className="dc__grid cards-wrapper dc__overflow-auto">
            {Object.keys(CLUSTER_NODE_HEALTH_CARDS_TITLE).map((key: ClusterNodeHealthStatusKeys) => {
                const title = CLUSTER_NODE_HEALTH_CARDS_TITLE[key]

                const valueObject = clusterNodeHealth?.[key]
                const { xAxisLabels, yAxisValues, backgroundColor } = Object.keys(valueObject || {}).reduce<{
                    xAxisLabels: string[]
                    yAxisValues: number[]
                    backgroundColor: ChartColorKey[]
                }>(
                    (acc, curr) => {
                        if (!valueObject[curr]) {
                            return acc
                        }
                        return {
                            xAxisLabels: [...acc.xAxisLabels, CLUSTER_NODE_HEALTH_LABELS[key][curr]],
                            yAxisValues: [...acc.yAxisValues, valueObject[curr]],
                            backgroundColor: [...acc.backgroundColor, CLUSTER_NODE_HEALTH_CHART_COLORS[key][curr]],
                        }
                    },
                    {
                        xAxisLabels: [] as string[],
                        yAxisValues: [] as number[],
                        backgroundColor: [] as ChartColorKey[],
                    },
                )

                return (
                    <ClusterNodeHealthCard
                        key={key}
                        metricKey={key}
                        title={title}
                        datasets={{
                            colors: backgroundColor,
                            yAxisValues,
                            datasetName: title,
                            isClickable: Object.keys(valueObject).map(() => true),
                        }}
                        xAxisLabels={xAxisLabels}
                        onChartClick={getChartClickHandler(key)}
                    />
                )
            })}
        </div>
    )
}

export default ClusterNodeHealth
