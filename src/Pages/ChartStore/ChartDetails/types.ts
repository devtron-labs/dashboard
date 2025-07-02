import { SelectPickerOptionType, SelectPickerProps, ServerErrors } from '@devtron-labs/devtron-fe-common-lib'

import { Chart, ChartDetailsDTO } from '@Components/charts/charts.types'

export type ChartSelectorOptionType = SelectPickerOptionType & Chart

export enum ChartDetailsSegment {
    'README' = 'readme',
    'PRESET_VALUES' = 'preset-values',
    'DEPLOYMENTS' = 'deployments',
}

export interface ChartDetailsSearchParams {
    tab: ChartDetailsSegment
}

export interface ChartDetailsRouteParams {
    chartId: string
}

interface CommonChartDetailsProps {
    isLoading?: boolean
    chartDetails: ChartDetailsDTO
    selectedChartVersion: number
    searchKey?: string
    onClearFilters?: () => void
}

export interface ChartDetailsReadmeProps extends Pick<CommonChartDetailsProps, 'isLoading' | 'selectedChartVersion'> {
    error?: ServerErrors
    reload?: () => void
    chartName: string
    readme: string
    onChartChange: SelectPickerProps<number>['onChange']
    chartsOptions: SelectPickerProps<number>['options']
}

export interface ChartDetailsAboutProps extends Pick<CommonChartDetailsProps, 'isLoading' | 'chartDetails'> {}

export interface ChartDetailsDeployProps
    extends Pick<CommonChartDetailsProps, 'selectedChartVersion' | 'chartDetails'> {
    chartVersions: {
        id: number
        version: string
    }[]
}

export interface ChartDetailsPresetValuesProps extends Pick<CommonChartDetailsProps, 'searchKey' | 'onClearFilters'> {}
