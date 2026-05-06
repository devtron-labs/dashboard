import { ChartColorKey } from '@devtron-labs/devtron-fe-common-lib'

export enum RelativeTimeWindow {
    LAST_7_DAYS = 'last7Days',
    LAST_30_DAYS = 'last30Days',
    LAST_90_DAYS = 'last90Days',
}

export enum TIME_WINDOW {
    TODAY = 'today',
    THIS_WEEK = 'week',
    THIS_MONTH = 'month',
    THIS_QUARTER = 'quarter',
    LAST_WEEK = 'lastWeek',
    LAST_MONTH = 'lastMonth',
}

export interface ChartTooltipProps {
    title?: string
    label: string
    value: string | number
    chartColorKey: ChartColorKey
}
