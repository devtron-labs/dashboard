import { ChartColorIndicator, ChartProps, parseTimestampToDate, TIME_WINDOW } from '@devtron-labs/devtron-fe-common-lib'

import { AppOverviewDoraMetricsKeys, BuildDeploymentActivityDetailed, PerformanceLevel } from '../types'
import { parseMinutesInDayHourUnit } from '../utils'
import {
    APP_OVERVIEW_DORA_METRICS_KEY_LABEL_MAP,
    DORA_METRIC_TOOLTIP_FOOTERS,
    DORA_METRICS_LABEL_MAP,
} from './constants'

const getPerformanceLevelByLabel = (label: string): PerformanceLevel =>
    (Object.entries(DORA_METRICS_LABEL_MAP) as [PerformanceLevel, string][]).find(([, value]) => value === label)?.[0]

export const getDoraMetricsChartTooltip: (props: {
    metricKey: AppOverviewDoraMetricsKeys
    totalValue: number
}) => ChartProps['tooltipConfig']['getTooltipContent'] =
    ({ metricKey, totalValue }) =>
    (args) => {
        const { tooltip } = args
        const { dataPoints } = tooltip
        const { parsed, label, dataIndex, dataset } = dataPoints[0]
        const performaceLevel = getPerformanceLevelByLabel(label)
        const percentage = totalValue ? (((parsed as number) / totalValue) * 100).toFixed(2) : 0
        const backgroundColor = dataset?.backgroundColor[dataIndex]

        return (
            <div className="tippy-box default-tt dc__mxw-200 flexbox-col dc__gap-8 py-6 px-10 fw-4">
                <span className="fw-6">
                    {APP_OVERVIEW_DORA_METRICS_KEY_LABEL_MAP[metricKey]}: {label}
                </span>
                <div className="flexbox dc__gap-4">
                    <div className="py-4">
                        <div className="icon-dim-12 br-2" style={{ backgroundColor }} />
                    </div>
                    <div className="flexbox-col dc__gap-12">
                        <span>
                            {percentage}% {`(${parsed})`} deployment pipelines
                        </span>
                        <span>{DORA_METRIC_TOOLTIP_FOOTERS[metricKey][performaceLevel]}</span>
                    </div>
                </div>
            </div>
        )
    }

const getTooltipHeading = (timeWindow: TIME_WINDOW, timestamp: string, label: string): string => {
    if (timeWindow === TIME_WINDOW.TODAY) {
        return `${label} Hrs`
    }
    if (timeWindow === TIME_WINDOW.THIS_QUARTER) {
        return label
    }
    return parseTimestampToDate(timestamp)
}

export const getBuildDeploymentTriggerTooltip: (
    chartData: BuildDeploymentActivityDetailed[],
    timeWindow: TIME_WINDOW,
) => ChartProps['tooltipConfig']['getTooltipContent'] = (chartData, timeWindow) => (args) => {
    const { tooltip } = args
    const { dataPoints } = tooltip
    const { dataIndex, label } = dataPoints[0]

    const { timestamp } = chartData[dataIndex]

    return (
        <div className="tippy-box default-tt dc__mxw-200 flexbox-col dc__gap-8 py-6 px-10 fw-4">
            <span className="fw-6">
                {dataPoints[2]?.dataset?.label}:&nbsp;
                {getTooltipHeading(timeWindow, timestamp, label)}
            </span>
            <div className="flexbox-col dc__gap-4">
                <ChartColorIndicator
                    title={`Total: ${dataPoints[2]?.raw}`}
                    backgroundColor={(dataPoints[2]?.dataset?.pointBackgroundColor ?? '') as string}
                />
                <ChartColorIndicator
                    title={`Successful: ${dataPoints[1]?.raw}`}
                    backgroundColor={(dataPoints[1]?.dataset?.pointBackgroundColor ?? '') as string}
                />
                <ChartColorIndicator
                    title={`Failed: ${dataPoints[0]?.raw}`}
                    backgroundColor={(dataPoints[0]?.dataset?.pointBackgroundColor ?? '') as string}
                />
            </div>
        </div>
    )
}

export const getAvgBuildTimeTooltip: (
    chartData: BuildDeploymentActivityDetailed[],
    timeWindow: TIME_WINDOW,
) => ChartProps['tooltipConfig']['getTooltipContent'] = (chartData, timeWindow) => (args) => {
    const { tooltip } = args
    const { dataPoints } = tooltip
    const { dataIndex, label, dataset } = dataPoints[0]

    const { averageBuildTime = 0, timestamp } = chartData[dataIndex]

    const avgBuildTime = parseMinutesInDayHourUnit(averageBuildTime)

    return (
        <div className="tippy-box default-tt dc__mxw-200 flexbox-col dc__gap-8 py-6 px-10 fw-4">
            <span className="fw-6">{getTooltipHeading(timeWindow, timestamp, label)}</span>
            <ChartColorIndicator
                title={`Avg. Build Time: ${avgBuildTime}`}
                backgroundColor={(dataset?.pointBackgroundColor ?? '') as string}
            />
        </div>
    )
}

export const getPipelineInsightsChartTooltip: (
    isBuildTriggerInsights: boolean,
) => ChartProps['tooltipConfig']['getTooltipContent'] = (isBuildTriggerInsights) => (args) => {
    const { tooltip } = args
    const { dataPoints } = tooltip
    const { raw, dataset, label } = dataPoints[0]
    const backgroundColor = dataset?.backgroundColor

    return (
        <div className="tippy-box default-tt dc__mxw-200 flexbox-col dc__gap-8 py-6 px-10 fw-4">
            <span className="fw-6">{label}</span>
            <ChartColorIndicator
                title={`${raw} ${isBuildTriggerInsights ? 'builds' : 'deployments'} triggered`}
                backgroundColor={(backgroundColor ?? '') as string}
            />
        </div>
    )
}
