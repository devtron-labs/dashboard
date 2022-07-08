import { RouteComponentProps } from 'react-router'
import { ChartValuesType } from '../charts.types'

export interface DiscoverChartDetailsProps extends RouteComponentProps<{ chartId: string }> {}

export interface DeploymentProps {
    icon?: string
    chartName?: string
    name?: string
    chartId: string
    appStoreApplicationName?: string
    deprecated: boolean
    availableVersions: Map<number, { id; version }>
}

export interface PrimaryOptionType {
    icon: React.FunctionComponent<any>
    title: string
    subtitle: string
    valueType: string
    noDataSubtitle?: string[]
    helpLink?: string
}

export interface ChartVersionSelectorModalType {
    closePopup: () => void
    appStoreApplicationName: string
    appIconUrl: string
    onError: (e) => void
    handleDeploy: () => void
    deployedChartValueList: ChartValuesType[]
    presetChartValueList: ChartValuesType[]
}
