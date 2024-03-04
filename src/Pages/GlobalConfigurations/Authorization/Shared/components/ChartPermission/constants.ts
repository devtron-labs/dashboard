export enum ChartPermissionValues {
    allCharts = 'All charts',
    deny = 'Deny',
    specificCharts = 'Specific charts',
}

export const CHART_PERMISSION_OPTIONS: Record<
    ChartPermissionValues,
    {
        label: string
        value: ChartPermissionValues
    }
> = {
    [ChartPermissionValues.allCharts]: { label: 'All Chart Groups', value: ChartPermissionValues.allCharts },
    [ChartPermissionValues.deny]: { label: 'Deny', value: ChartPermissionValues.deny },
    [ChartPermissionValues.specificCharts]: {
        label: 'Specific Chart Groups',
        value: ChartPermissionValues.specificCharts,
    },
} as const
