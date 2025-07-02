import { SelectPickerOptionType, SelectPickerProps, ServerErrors } from '@devtron-labs/devtron-fe-common-lib'

import { Chart, ChartDetailsDTO } from '@Components/charts/charts.types'

export type ChartSelectorOptionType = SelectPickerOptionType & Chart

export enum ChartDetailsSegment {
    'README' = 'readme',
    'PRESET_VALUES' = 'preset-values',
    'DEPLOYMENTS' = 'deployments',
}

export interface ChartDetailsReadmeProps {
    isLoading?: boolean
    error?: ServerErrors
    reload?: () => void
    chartName: string
    readme: string
    selectedChartVersion: number
    onChartChange: SelectPickerProps<number>['onChange']
    chartsOptions: SelectPickerProps<number>['options']
}

export interface ChartDetailsAboutProps {
    isLoading?: boolean
    chartDetails: ChartDetailsDTO
}

export interface ChartDetailsDeployProps {
    chartDetails: ChartDetailsDTO
    chartVersions: {
        id: number
        version: string
    }[]
    selectedChartVersion: number
}

export interface ChartDetailsSearchParams {
    tab: ChartDetailsSegment
}
