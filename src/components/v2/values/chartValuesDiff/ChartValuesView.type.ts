import { OptionType } from '../../../app/types'
import { ChartValuesType, ChartVersionType } from '../../../charts/charts.types'
import { InstalledAppInfo, ReleaseInfo } from '../../../external-apps/ExternalAppService'
import { ChartDeploymentDetail } from '../../chartDeploymentHistory/chartDeploymentHistory.service'

export interface ChartValuesViewType {
    appId?: string
    isExternalApp?: boolean
    isDeployChartView?: boolean
    installedConfigFromParent?: any
    appDetails?: any
    chartValuesListFromParent?: ChartValuesType[]
    chartVersionsDataFromParent?: ChartVersionType[]
    chartValuesFromParent?: ChartValuesType
    selectedVersionFromParent?: any
}

export interface ChartSelectorType {
    isExternal?: boolean
    releaseInfo?: ReleaseInfo
    installedAppInfo?: InstalledAppInfo
    isUpdate?: boolean
}

export interface ChartValuesOptionType {
    label: string
    value: number
}

export interface ChartEnvironmentOptionType {
    label: string
    value: number
    namespace?: string
    clusterName?: string
    clusterId?: number
    active?: boolean
}

export interface ChartEnvironmentListType {
    label: string
    options: ChartEnvironmentOptionType[]
}

export interface ChartValuesDiffOptionType extends ChartValuesOptionType {
    appStoreVersionId?: number
    info: string
    kind?: string
}

export interface ChartGroupOptionType {
    label: string
    options: ChartValuesDiffOptionType[]
}

export interface ChartProjectAndEnvironmentType {
    environments: ChartEnvironmentOptionType[] | ChartEnvironmentListType[]
    projects: ChartValuesOptionType[]
}

export interface ChartEnvironmentSelectorType extends ChartSelectorType {
    isDeployChartView?: boolean
    selectedEnvironment?: ChartEnvironmentOptionType
    handleEnvironmentSelection?: (selected: ChartEnvironmentOptionType) => void
    environments?: ChartEnvironmentOptionType[] | ChartEnvironmentListType[]
    invalidaEnvironment: boolean
}

export interface ChartProjectSelectorType {
    isDeployChartView: boolean
    selectedProject: ChartValuesOptionType
    handleProjectSelection: (selected: ChartValuesOptionType) => void
    projects: ChartValuesOptionType[]
    invalidProject: boolean
}

export interface ChartRepoDetailsType {
    chartRepoName: string
    chartName: string
    version: string
}

export interface ChartRepoOtions {
    appStoreApplicationVersionId: number;
    chartRepoName: string;
    chartId: number;
    chartName: string;
    version: string;
    deprecated: boolean;
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
    chartVersionObj: ChartVersionType
    selectedVersionUpdatePage: ChartVersionType
    handleVersionSelection: (selectedVersion: number, selectedVersionUpdatePage: ChartVersionType) => void
    chartVersionsData: ChartVersionType[]
}

export interface ChartValuesSelectorType {
    chartValuesList: ChartValuesType[]
    chartValues: ChartValuesType
    handleChartValuesSelection: (chartValues: ChartValuesType) => void
    redirectToChartValues?: () => Promise<void>
    hideVersionFromLabel?: boolean
}

export interface ChartVersionValuesSelectorType extends ChartVersionSelectorType, ChartValuesSelectorType {}

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

export interface ChartValuesYamlDataType {
    fetchingValuesYaml: boolean
    modifiedValuesYaml: string
    generatingManifest: boolean
    generatedManifest: string
    valuesEditorError: string
}

export interface ForceDeleteDataType {
    forceDelete: boolean
    title: string
    message: string
}
