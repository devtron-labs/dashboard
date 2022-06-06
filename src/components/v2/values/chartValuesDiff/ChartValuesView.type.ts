import { OptionType } from '../../../app/types'
import { ChartValuesType, ChartVersionType } from '../../../charts/charts.types'
import { InstalledAppInfo, ReleaseInfo } from '../../../external-apps/ExternalAppService'
import { ChartDeploymentDetail } from '../../chartDeploymentHistory/chartDeploymentHistory.service'
import { ChartRepoOtions } from '../DeployChart'

export interface ChartSelectorType {
    isExternal?: boolean
    releaseInfo?: ReleaseInfo
    installedAppInfo?: InstalledAppInfo
    isUpdate?: boolean
}

export interface ChartEnvironmentOptionType {
    label: string
    value: string | number
    namespace?: string
    clusterName?: string
    clusterId?: number
}

export interface ChartEnvironmentSelectorType extends ChartSelectorType {
    isDeployChartView?: boolean
    selectedEnvironment?: ChartEnvironmentOptionType
    selectEnvironment?: React.Dispatch<React.SetStateAction<ChartEnvironmentOptionType>>
    environments?: ChartEnvironmentOptionType[]
    invalidaEnvironment: boolean
}

export interface ChartProjectSelectorType {
    isDeployChartView: boolean
    selectedProject: OptionType
    selectProject: React.Dispatch<React.SetStateAction<OptionType>>
    projects: any[]
    invalidProject: boolean
}

export interface ChartRepoDetailsType {
    chartRepoName: string
    chartName: string
    version: string
}

export interface ChartRepoSelectorType extends ChartSelectorType {
    repoChartValue?: ChartRepoOtions
    repoChartSelectOptionLabel?: (chartRepoDetails: ChartRepoDetailsType) => JSX.Element
    handleRepoChartValueChange?: (event: any) => void
    repoChartOptionLabel?: (props: any) => JSX.Element
    chartDetails?: ChartRepoOtions
}

export interface ChartDeprecatedType {
    isUpdate: boolean
    deprecated: boolean
    chartName: string
    name: string
}

export interface ChartVersionSelectorType {
    isUpdate: boolean
    selectedVersion: number
    selectVersion: React.Dispatch<React.SetStateAction<number>>
    chartVersionObj: ChartVersionType
    selectedVersionUpdatePage: ChartVersionType
    setSelectedVersionUpdatePage: React.Dispatch<React.SetStateAction<ChartVersionType>>
    chartVersionsData: ChartVersionType[]
}

export interface ChartValuesSelectorType {
    chartValuesList: ChartValuesType[]
    chartValues: ChartValuesType
    setChartValues: React.Dispatch<React.SetStateAction<ChartValuesType>>
    redirectToChartValues?: () => Promise<void>
    hideVersionFromLabel?: boolean
}

export interface ChartVersionValuesSelectorType extends ChartVersionSelectorType, ChartValuesSelectorType {
    installedConfig: any
}

export interface ChartValuesEditorType {
    loading: boolean
    isExternalApp: boolean
    isDeployChartView: boolean
    appId: string
    appName: string
    valuesText: string
    onChange: (value: string) => void
    chartValuesList: ChartValuesType[]
    deploymentHistoryList: ChartDeploymentDetail[]
    repoChartValue: ChartRepoOtions
    hasChartChanged: boolean
    showInfoText: boolean
    defaultValuesText: string
    showEditorHeader?: boolean
    manifestView?: boolean
    generatedManifest?: string
    comparisonView: boolean
}

export interface ChartValuesDiffOptionType {
    label: string
    value: number
    appStoreVersionId?: number
    info: string
    kind?: string
}
