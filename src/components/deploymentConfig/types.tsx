import React from 'react'
import { ServerError } from '../../modals/commonTypes'
import { AppEnvironment } from '../../services/service.types'
import { CustomNavItemsType } from '../app/details/appConfig/appConfig.type'

export interface DeploymentObject {
    id: number | null
    appId: number | null
    refChartTemplate: string
    refChartTemplateVersion: string
    chartRepositoryId: number
    valuesOverrride: any
    defaultAppOverride: any
}

export interface DeploymentConfigState {
    code: number
    errors: ServerError[]
    successMessage: string | null
    configStatus: number
    view: string
    chartReferences: { id: number; version: string }[]
    template: {
        latestAppConfig: DeploymentConfigTemplate & { jsonSubsetStr: string; yamlSubset: any }
        previousAppConfig: DeploymentConfigTemplate
    }
    configMap: ConfigMap
    latestChartRef: number
    isUnsaved: boolean
    showDialog: boolean
}

export interface DeploymentConfigTemplate {
    id: number
    appId: number | null
    refChartTemplate: string
    refChartTemplateVersion: string
    chartRefId: number
    valuesOverride: any
    latest: boolean
    defaultAppOverride: any
    isAppMetricsEnabled?: boolean
}

export interface ConfigMap {
    id: number
    appId: number | null
    environmentId: number
    pipelineId: number
    configMapValuesOverride: any
    secretsValuesOverride: any
    configMapJsonStr: string
    secretsJsonStr: string
    configMapYaml: string
    secretsYaml: string
}

export interface ConfigMapRequest {
    id: number
    app_id: number
    environment_id: number
    pipeline_id: number
    config_map_data: any
    secret_data: any
}

export interface DeploymentConfigProps {
    respondOnSuccess?: () => void
    isUnSet: boolean
    navItems: CustomNavItemsType[]
    isCiPipeline: boolean
    environments: AppEnvironment[]
}

export interface DeploymentChartVersionType {
    id: number | string
    version: string
    name: string
}

export type DeploymentChartOptionkind = 'base' | 'env' | 'chartVersion' | 'deployment'

export interface DeploymentChartOptionType extends DeploymentChartVersionType {
    value: string | number
    label: string
    kind?: DeploymentChartOptionkind
}

export interface DeploymentChartGroupOptionType {
    label: string
    options: DeploymentChartOptionType[]
}

export interface DeploymentConfigFormCTAProps {
    loading: boolean
    showAppMetricsToggle: boolean
    isAppMetricsEnabled: boolean
    isEnvOverride?: boolean
    isCiPipeline?: boolean
    disableCheckbox?: boolean
    disableButton?: boolean
    currentChart: DeploymentChartVersionType
    toggleAppMetrics: () => void
}

export interface CompareWithDropdownProps {
    isEnvOverride: boolean
    environments: DeploymentChartOptionType[]
    charts: DeploymentChartOptionType[]
    globalChartRef?: any
    selectedOption: DeploymentChartOptionType
    setSelectedOption: React.Dispatch<React.SetStateAction<DeploymentChartOptionType>>
}

export interface ChartTypeVersionOptionsProps {
    isUnSet: boolean
    disableVersionSelect?: boolean
    charts: DeploymentChartVersionType[]
    selectedChart: DeploymentChartVersionType
    selectChart: (
        selectedChart: DeploymentChartVersionType,
    ) => void | React.Dispatch<React.SetStateAction<DeploymentChartVersionType>>
    selectedChartRefId: number
}

export interface CompareOptionsProps {
    isComparisonAvailable: boolean
    environmentName: string
    isEnvOverride: boolean
    showComparisonOption: boolean
    openComparison: boolean
    handleComparisonClick: () => void
    fetchingReadMe: boolean
    openReadMe: boolean
    isReadMeAvailable: boolean
    handleReadMeClick: () => void
}

export interface DeploymentTemplateOptionsTabProps {
    isComparisonAvailable: boolean
    environmentName?: string
    isEnvOverride?: boolean
    openComparison: boolean
    handleComparisonClick: () => void
    fetchingReadMe: boolean
    openReadMe: boolean
    isReadMeAvailable: boolean
    handleReadMeClick: () => void
    isUnSet: boolean
    charts: DeploymentChartVersionType[]
    selectedChart: DeploymentChartVersionType
    selectChart: (
        selectedChart: DeploymentChartVersionType,
    ) => void | React.Dispatch<React.SetStateAction<DeploymentChartVersionType>>
    selectedChartRefId: number
    disableVersionSelect?: boolean
}

export interface DeploymentTemplateEditorViewProps {
    appId: string
    envId: string
    isUnSet: boolean
    isEnvOverride?: boolean
    environmentName?: string
    openComparison: boolean
    showReadme: boolean
    chartConfigLoading: boolean
    readme: string
    value: string
    defaultValue?: string
    editorOnChange: (str: string) => void
    schemas: any
    charts: DeploymentChartVersionType[]
    selectedChart: DeploymentChartVersionType
    environments: AppEnvironment[]
    fetchedValues: Record<number, string>
    setFetchedValues: React.Dispatch<React.SetStateAction<Record<number, string>>>
    readOnly?: boolean
    globalChartRefId?: number
}
