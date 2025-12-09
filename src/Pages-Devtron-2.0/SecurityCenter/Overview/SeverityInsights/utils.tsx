import {
    ChartColorIndicator,
    ChartColorKey,
    ChartProps,
    ChartTooltip,
    parseTimestampToDate,
    RelativeTimeWindow,
    SEVERITY_LABEL_MAP,
} from '@devtron-labs/devtron-fe-common-lib'

import { SEVERITY_ORDER } from '../constants'
import { VulnerabilityTrend } from '../types'

export const getSeverityDistributionTooltip: (
    title: string,
    xAxisLabels: string[],
    yAxisValues: number[],
    chartColors: ChartColorKey[],
) => ChartProps['tooltipConfig']['getTooltipContent'] = (title, xAxisLabels, yAxisValues, chartColors) => (args) => {
    const { tooltip } = args
    const { dataPoints } = tooltip
    const { dataIndex } = dataPoints[0]
    return (
        <ChartTooltip
            title={title}
            label={xAxisLabels[dataIndex]}
            value={yAxisValues[dataIndex]}
            chartColorKey={chartColors[dataIndex]}
        />
    )
}

export const getVulnerabilityTrendTooltip: (
    dataTrendPoints: VulnerabilityTrend['trend'],
    timeRange: RelativeTimeWindow,
) => ChartProps['tooltipConfig']['getTooltipContent'] = (dataTrendPoints, timeRange) => (args) => {
    const { tooltip } = args
    const { dataPoints } = tooltip
    const { dataIndex } = dataPoints[0]

    const title =
        timeRange === RelativeTimeWindow.LAST_90_DAYS
            ? dataTrendPoints[dataIndex].timestampLabel
            : parseTimestampToDate(dataTrendPoints[dataIndex].timestamp)

    return (
        <div className="dc__mxw-200 flexbox-col dc__gap-8 py-6 px-10 fw-4">
            <span className="fw-6">{title}</span>
            <div className="flexbox-col dc__gap-4">
                {SEVERITY_ORDER.map((severity, idx) => (
                    <ChartColorIndicator
                        key={severity}
                        title={`${SEVERITY_LABEL_MAP[severity]}: ${dataTrendPoints[dataIndex][severity] ?? 0}`}
                        backgroundColor={dataPoints[idx]?.dataset?.pointBackgroundColor as string}
                    />
                ))}
            </div>
        </div>
    )
}
