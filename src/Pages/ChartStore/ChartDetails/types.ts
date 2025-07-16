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

export interface ChartValuesTemplateDTO {
    id: number
    name: string
    chartVersion: string
    updatedBy: string
    updatedOn: string
}

export type PresetValuesTableAdditionalProps = {
    chartValuesTemplateList: ChartValuesTemplateDTO[]
    showDeleteModal: (deletePresetValue: ChartValuesTemplateDTO) => () => void
}

export type PresetValuesTableProps = TableProps<
    ChartValuesTemplateDTO,
    FiltersTypeEnum.STATE,
    PresetValuesTableAdditionalProps
>

export type PresetValuesTableCellComponentProps = TableCellComponentProps<
    ChartValuesTemplateDTO,
    FiltersTypeEnum.STATE,
    PresetValuesTableAdditionalProps
>

export type PresetValuesTableRowActionsOnHoverComponentProps = TableRowActionsOnHoverComponentProps<
    ChartValuesTemplateDTO,
    PresetValuesTableAdditionalProps
>

export type PresetValuesTableViewWrapperProps = TableViewWrapperProps<
    ChartValuesTemplateDTO,
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

export type DeploymentsTableAdditionalProps = {
    chartIcon: ChartDetailsDTO['icon']
    onDelete: (rowData: ChartDeploymentsDTO) => void
}

export type DeploymentsTableProps = TableProps<
    ChartDeploymentsDTO,
    FiltersTypeEnum.STATE,
    DeploymentsTableAdditionalProps
>

export type DeploymentsTableCellComponentProps = TableCellComponentProps<
    ChartDeploymentsDTO,
    FiltersTypeEnum.STATE,
    DeploymentsTableAdditionalProps
>

export type DeploymentsTableViewWrapperProps = TableViewWrapperProps<
    ChartDeploymentsDTO,
    FiltersTypeEnum.STATE,
    DeploymentsTableAdditionalProps
>
