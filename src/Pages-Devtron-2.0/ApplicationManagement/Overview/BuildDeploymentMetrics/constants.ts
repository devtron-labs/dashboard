import { ChartColorKey } from '@devtron-labs/devtron-fe-common-lib'

import { AppOverviewDoraMetricsKeys, PerformanceLevel } from '../types'

export const APP_OVERVIEW_DORA_METRICS_KEY_LABEL_MAP: Record<AppOverviewDoraMetricsKeys, string> = {
    [AppOverviewDoraMetricsKeys.DEPLOYMENT_FREQUENCY]: 'Deployment Frequency',
    [AppOverviewDoraMetricsKeys.MEAN_LEAD_TIME]: 'Mean Lead Time',
    [AppOverviewDoraMetricsKeys.CHANGE_FAILURE_RATE]: 'Change Failure Rate',
    [AppOverviewDoraMetricsKeys.MEAN_TIME_TO_RECOVERY]: 'Mean Time to Recovery',
}

export const DORA_METRICS_LABEL_MAP: Record<PerformanceLevel, string> = {
    [PerformanceLevel.ELITE]: 'Elite',
    [PerformanceLevel.HIGH]: 'High',
    [PerformanceLevel.MEDIUM]: 'Medium',
    [PerformanceLevel.LOW]: 'Low',
}

export const DORA_METRICS_LABELS = Object.values(DORA_METRICS_LABEL_MAP)

export const DORA_METRICS_CHART_COLORS_MAP: Record<PerformanceLevel, ChartColorKey> = {
    [PerformanceLevel.ELITE]: 'Lavender500',
    [PerformanceLevel.HIGH]: 'LimeGreen500',
    [PerformanceLevel.MEDIUM]: 'GoldenYellow500',
    [PerformanceLevel.LOW]: 'CoralRed500',
}

export const DORA_METRICS_BG_COLORS = Object.values(DORA_METRICS_CHART_COLORS_MAP)

export const DORA_METRIC_TOOLTIP_FOOTERS: Record<AppOverviewDoraMetricsKeys, Record<PerformanceLevel, string>> = {
    [AppOverviewDoraMetricsKeys.DEPLOYMENT_FREQUENCY]: {
        [PerformanceLevel.ELITE]: 'Deployed more than once per day',
        [PerformanceLevel.HIGH]: 'Deployed between once per day & once per week',
        [PerformanceLevel.MEDIUM]: 'Deployed between once per week & once per month',
        [PerformanceLevel.LOW]: 'Deployed between once per month & once per 6 months',
    },
    [AppOverviewDoraMetricsKeys.MEAN_LEAD_TIME]: {
        [PerformanceLevel.ELITE]: 'Mean lead time is less than 1 day',
        [PerformanceLevel.HIGH]: 'Mean lead time is between 1 day & 1 week',
        [PerformanceLevel.MEDIUM]: 'Mean lead time is between 1 week & 1 month',
        [PerformanceLevel.LOW]: 'Mean lead time is between 1 day & 6 months',
    },
    [AppOverviewDoraMetricsKeys.CHANGE_FAILURE_RATE]: {
        [PerformanceLevel.ELITE]: 'Change failure rate is between 0 - 15%',
        [PerformanceLevel.HIGH]: 'Change failure rate is between 16 - 30%',
        [PerformanceLevel.MEDIUM]: 'Change failure rate is between 31 - 45%',
        [PerformanceLevel.LOW]: 'Change failure rate is between 46 - 60%',
    },
    [AppOverviewDoraMetricsKeys.MEAN_TIME_TO_RECOVERY]: {
        [PerformanceLevel.ELITE]: 'Mean time to recovery is less than an hour',
        [PerformanceLevel.HIGH]: 'Mean time to recovery is between 1 hour and 1 day',
        [PerformanceLevel.MEDIUM]: 'Mean time to recovery is between 1 day & 1 week',
        [PerformanceLevel.LOW]: 'Mean time to recovery is between 1 week & 1 month',
    },
}

export const DORA_METRICS_LINK = 'https://www.atlassian.com/devops/frameworks/dora-metrics'

export const MIN_X_AXIS_VALUE = 1
