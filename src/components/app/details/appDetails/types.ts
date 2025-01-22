import { AppMetricsTabType, ChartTypes, StatusTypes } from './appDetails.type'
import { AppInfo } from './utils'

export interface GetIFrameSrcParamsType {
    appInfo: AppInfo
    chartName: ChartTypes
    calendarInputs
    tab: AppMetricsTabType
    isLegendRequired: boolean
    statusCode?: StatusTypes
    latency?: number
    grafanaTheme: 'light' | 'dark'
}
