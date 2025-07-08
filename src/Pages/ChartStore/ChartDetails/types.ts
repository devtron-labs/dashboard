import {
    FiltersTypeEnum,
    SelectPickerOptionType,
    SelectPickerProps,
    ServerErrors,
    TableCellComponentProps,
    TableProps,
    TableRowActionsOnHoverComponentProps,
    TableViewWrapperProps,
} from '@devtron-labs/devtron-fe-common-lib'

import { Chart, ChartDetailsDTO } from '@Components/charts/charts.types'
import { SavedValueType } from '@Components/charts/SavedValues/types'

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
}

export interface ChartDetailsReadmeProps
    extends Pick<CommonChartDetailsProps, 'isLoading' | 'selectedChartVersion'>,
        Pick<ChartDetailsDTO, 'chartName' | 'readme'> {
    error?: ServerErrors
    reload?: () => void
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

type PresetValuesTableAdditionalProps = {
    chartValuesTemplateList: SavedValueType[]
    showDeleteModal: (deletePresetValue: Omit<SavedValueType, 'isLoading'>) => () => void
}

export type PresetValuesTable = TableProps<
    Omit<SavedValueType, 'isLoading'>,
    FiltersTypeEnum.STATE,
    PresetValuesTableAdditionalProps
>

export type PresetValuesTableCellComponentProps = TableCellComponentProps<
    Omit<SavedValueType, 'isLoading'>,
    FiltersTypeEnum.STATE,
    PresetValuesTableAdditionalProps
>

export type PresetValuesTableRowActionsOnHoverComponentProps = TableRowActionsOnHoverComponentProps<
    Omit<SavedValueType, 'isLoading'>,
    PresetValuesTableAdditionalProps
>

export type PresetValuesTableViewWrapperProps = TableViewWrapperProps<
    Omit<SavedValueType, 'isLoading'>,
    FiltersTypeEnum.STATE,
    PresetValuesTableAdditionalProps
>

export interface ChartDetailsDeploymentsProps {
    chartIcon: ChartDetailsDTO['icon']
}

export interface ChartDeploymentsDTO {
    appStoreApplicationName: string
    chartName: string
    icon: string
    status: string
    appName: string
    installedAppVersionId: number
    appStoreApplicationVersionId: number
    environmentName: string
    deployedAt: string
    deployedBy: string
    deploymentAppType: string
    installedAppId: number
    readme: string
    environmentId: number
    deprecated: boolean
    appOfferingMode: string
    clusterId: number
    namespace: string
}
