import { ChartProps } from '@devtron-labs/devtron-fe-common-lib'

import { ChartTooltip } from '@PagesDevtron2.0/Shared'
import { RelativeTimeWindow } from '@PagesDevtron2.0/Shared/types'
import { parseTimestampToDate } from '@PagesDevtron2.0/Shared/utils'

import { BlockedDeploymentTrend } from '../types'
import { COVERAGE_CHART_COLORS } from './CoverageMetrics'

export const getBlockedDeploymentChartTooltip: (
    data: BlockedDeploymentTrend,
    timeRange: RelativeTimeWindow,
) => ChartProps['tooltipConfig']['getTooltipContent'] = (data, timeRange) => (args) => {
    if (!data) {
        return null
    }

    const { tooltip } = args
    const { dataPoints } = tooltip
    const { dataIndex } = dataPoints[0]

    const title =
        timeRange === RelativeTimeWindow.LAST_90_DAYS
            ? data.timestampLabels[dataIndex]
            : parseTimestampToDate(data.timestamps[dataIndex])
    return (
        <ChartTooltip
            title={title}
            label="Blocked deployments"
            value={data.blockedCount[dataIndex] ?? 0}
            chartColorKey="CoralRed600"
        />
    )
}

export const getCoverageMetricsChartTooltip: (
    xAxisLabels: string[],
    yAxisValues: number[],
) => ChartProps['tooltipConfig']['getTooltipContent'] = (xAxisLabels, yAxisValues) => (args) => {
    const { tooltip } = args
    const { dataPoints } = tooltip
    const { dataIndex } = dataPoints[0]
    return (
        <ChartTooltip
            label={xAxisLabels[dataIndex]}
            value={`${yAxisValues[dataIndex]}%`}
            chartColorKey={COVERAGE_CHART_COLORS[dataIndex]}
        />
    )
}
