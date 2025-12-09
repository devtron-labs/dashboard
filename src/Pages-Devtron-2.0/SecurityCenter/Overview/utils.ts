import dayjs from 'dayjs'

import {
    ChartColorKey,
    RelativeTimeWindow,
    Severity,
    SEVERITY_LABEL_MAP,
    SimpleDataset,
    SimpleDatasetForPie,
} from '@devtron-labs/devtron-fe-common-lib'

import { SEVERITY_CHART_COLOR_MAP, SEVERITY_ORDER } from './constants'
import { SecurityGlanceMetricKeys, SeverityAgeDistribution, SeverityDistribution } from './types'

// Sort and return only non-zero values
export const parseSeverityDistribution = (severityDistribution: SeverityDistribution) => {
    if (!severityDistribution) {
        return {}
    }
    return SEVERITY_ORDER.reduce<Partial<SeverityDistribution>>((agg, curr) => {
        const severityCount = severityDistribution[curr]
        if (!severityCount) {
            return agg
        }

        // eslint-disable-next-line no-param-reassign
        agg[curr] = severityCount
        return agg
    }, {})
}

export const parseSeverityDistributionDatasets = (
    severityDistribution: Partial<SeverityDistribution>,
): {
    accumulatedSeverities: Severity[]
    severityDistributionLabels: string[]
    severityDistributionDataset: SimpleDatasetForPie
} =>
    Object.entries(severityDistribution).reduce<{
        accumulatedSeverities: Severity[]
        severityDistributionLabels: string[]
        severityDistributionDataset: {
            datasetName: string
            yAxisValues: number[]
            colors: ChartColorKey[]
            isClickable: boolean[]
        }
    }>(
        (acc, [key, value]: [key: Severity, value: number]) => {
            acc.accumulatedSeverities.push(key)
            acc.severityDistributionLabels.push(SEVERITY_LABEL_MAP[key])
            acc.severityDistributionDataset.yAxisValues.push(value)
            acc.severityDistributionDataset.colors.push(SEVERITY_CHART_COLOR_MAP[key])
            acc.severityDistributionDataset.isClickable.push(true)

            return acc
        },
        {
            accumulatedSeverities: [],
            severityDistributionLabels: [],
            severityDistributionDataset: { datasetName: 'Severity', yAxisValues: [], colors: [], isClickable: [] },
        },
    )

export const parseAgeDistributionDatasets = (
    ageDistribution: SeverityAgeDistribution,
    accumulatedSeverities: Severity[],
): SimpleDataset[] => {
    const { lessThan30Days, between30To60Days, between60To90Days, moreThan90Days } = ageDistribution || {}

    return accumulatedSeverities.reduce<
        {
            datasetName: string
            yAxisValues: number[]
            color: ChartColorKey
            isClickable: boolean
        }[]
    >((agg, curr) => {
        agg.push({
            datasetName: SEVERITY_LABEL_MAP[curr],
            yAxisValues: [
                lessThan30Days?.[curr] || 0,
                between30To60Days?.[curr] || 0,
                between60To90Days?.[curr] || 0,
                moreThan90Days?.[curr] || 0,
            ],
            color: SEVERITY_CHART_COLOR_MAP[curr],
            isClickable: true,
        })
        return agg
    }, [])
}

export const parseNumberToPrecision = (num: number, precision: number): number => {
    const factor = 10 ** precision
    return Math.round(num * factor) / factor
}

export const getMetricCardSubtitle = (key: SecurityGlanceMetricKeys, value: number) => {
    const formattedValue = value.toLocaleString()
    switch (key) {
        case SecurityGlanceMetricKeys.TOTAL_VULNERABILITIES:
            return `${formattedValue} unique vulnerabilities`
        case SecurityGlanceMetricKeys.FIXABLE_VULNERABILITIES:
            return `${formattedValue} unique fixable vulnerabilities`
        case SecurityGlanceMetricKeys.ZERO_DAY_VULNERABILITIES:
            return `${formattedValue} unique zero-day vulnerabilities`
        default:
            return ''
    }
}

export const getTimestampLabel = (timestamp: string, timeRange: RelativeTimeWindow): string => {
    const dateObj = dayjs(timestamp)

    if (timeRange === RelativeTimeWindow.LAST_90_DAYS) {
        return dateObj.format('MMM')
    }

    // Return date (e.g. '5')
    // In case of 1st day of month return ['1', 'Sep']
    const date = dateObj.format('D')
    return date === '1' ? dateObj.format('DD MMM') : date
}
