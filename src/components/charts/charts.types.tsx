/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Dispatch, SetStateAction } from 'react'
import { RouteComponentProps } from 'react-router-dom'

import { OptionType, ResponseType } from '@devtron-labs/devtron-fe-common-lib'

export interface ChartValuesType {
    kind: 'DEFAULT' | 'TEMPLATE' | 'DEPLOYED' | 'EXISTING' | null
    chartVersion?: string
    name?: string
    id: number
    appStoreVersionId?: number
    environmentName?: string
    deploymentAppType?: string
}

export interface ChartValuesNativeType {
    id: number
    name: string
    chartVersion: string
    appStoreVersionId?: number
    environmentName?: string
}

export interface ChartValues {
    kind: 'DEFAULT' | 'TEMPLATE' | 'DEPLOYED' | 'EXISTING'
    values: ChartValuesNativeType[]
}

export interface HeaderProps {
    title: string
    tabs: [{ key: string; isActive: boolean }]
}

export interface ChartsProps extends RouteComponentProps<any> {}

export interface DeployedChartProps extends RouteComponentProps<{}> {}

export interface DeployedChartState {
    code: number
    view: string
    installedCharts: InstalledChartGroup[]
    chartRepos: any[]
    environment: Array<{ label: string; value: number }>
    selectedChartRepo: any[]
    selectedEnvironment: any[]
    onlyDeprecated: boolean
    appStoreName: string
    searchApplied: boolean
    appliedChartRepoFilter: any[]
    appliedEnvironmentFilter: any[]
    chartListloading: boolean
}

export interface InstalledChartGroup {
    installationTime: string
    installedCharts: InstalledChart[]
}

export interface InstalledChart {
    chartName: string
    chartRepoName: string
    icon: string
    appStoreId: number
    appStoreApplicationVersion: string
    environmentName: string
    environmentId: number
    installedAppId: number
}

export interface Chart {
    active: boolean
    chart_git_location: string
    chart_name: string
    chart_repo_id: string
    created_on: string
    icon: string
    id: number
    name: string
    updated_on: string
    version: string
    loading?: boolean
    availableChartVersions?: ChartVersionType[]
    availableChartValues?: ChartValues[]
    valuesYaml?: string
    appStoreApplicationVersionId?: number
    deprecated: boolean
    description?: string
    docker_artifact_store_id?: string
}

export interface ProjectType {
    id: number
    name: string
}

export interface ChartVersionType {
    id: number
    version: string
}

export interface ChartValuesProps extends RouteComponentProps<{ chartId: string; chartValueId?: string }> {}

export interface ChartValuesState {
    view: string
    chartVersions: ChartVersionType[]
    chartVersionId: number
    versionData: any & { id: number }
    name: string
    values: string
    chartVersion: string
    showError: boolean
    appStoreApplicationName: string
    isValid: {
        name: boolean
    }
    buttonLoader: boolean
}

export interface ChartGroup {
    id: number
    name: string
    description: string
    chartGroupEntries: ChartGroupEntry[]
}

export interface ChartEntryIdType {
    id: number
    index: number
}

export interface ChartGroupEditProps extends RouteComponentProps<{ chartGroupId?: string }> {
    view: string
    getChartGroup: () => void
    getChartEntryChartValues: (...args) => Promise<any>
    getChartEntryChartVersions: (ChartEntyIdType) => Promise<any>
}

interface ChartGroupCreate {
    name: string
    description?: string
}
export interface CreateChartGroupProps extends RouteComponentProps<{}> {
    closeChartGroupModal: (props: ChartGroupCreate | null) => void
    chartGroupId?: number
    name?: string
    description?: string
}
export interface ChartGroupEntry {
    id?: number
    installedId?: number // already saved details
    appStoreValuesVersionId: number
    kind?: 'DEFAULT' | 'TEMPLATE' | 'DEPLOYED' | 'EXISTING'
    appStoreApplicationVersion: string
    appStoreApplicationVersionId?: number
    appStoreValuesVersionName?: string
    appStoreValuesChartVersion: string
    chartMetaData: ChartMetaData
    isEnabled: boolean
    environment: {
        id?: number
        error?: string
    }
    availableChartVersions?: ChartVersionType[]
    availableChartValues?: ChartValues[]
    valuesYaml?: string
    originalValuesYaml?: string
    loading: boolean
    name: {
        value: string
        error?: string
        suggestedName?: string
    }
    isUnsaved: boolean // accounts only values and version selection
}

export interface ChartMetaData {
    chartName: string
    chartRepoName: string
    icon: string
    chartId: number
    // TODO: add below keys
    // appStoreId: number;
    // appStoreApplicationVersion: string;
}

export interface ChartGroupListState {
    view: string
    code: number
    chartGroups: ChartGroup[]
}

export interface ChartGroupListProps {
    code: number
    view: string
    chartGroups: ChartGroup[]
}

export interface DiscoverChartsContainerProps extends RouteComponentProps<{}> {}

export interface ChartGroupProviderProps {}

export interface DiscoverChartsContainerState {
    statusCode: number
    view: string
    chartGroupEntries: ChartGroupEntry[]
    chartGroups: ChartGroup[]
    availableCharts: Map<number, Chart>
    projects: { id: number; name: string }[]
    selectedProjectId: number
    selectedInstances: { [key: number]: number[] }
    chartGroupEntryIndex: number
}

export interface DiscoverChartsViewProps extends DiscoverChartsContainerState {
    redirectToChartConfigure: () => void
    redirectToSelectChart: () => void
    selectChart: (chartId: number) => void
    getChartVersions: (...args) => Promise<any>
    getChartValues: (...args) => Promise<any>
    redirectToChartGroupCreate: (...args) => void
    redirectToChartGroup: (...args) => void
    closeChartGroupModal: (...args) => void
}

export interface EnvironmentType {
    active?: boolean
    appCount?: number
    cluster_name: string
    default?: boolean
    description?: string
    environmentIdentifier?: string
    environment_name: string
    id: number
    isClusterCdActive?: string
    isVirtualEnvironment?: boolean
    namespace?: string
}

export interface ChartGroupState {
    chartGroups: any
    chartRepos: any[]
    charts: ChartGroupEntry[]
    availableCharts: Map<number, Chart>
    selectedInstances: { [key: number]: number[] }
    configureChartIndex: number
    name?: string
    description?: string
    projects: any[]
    environments: EnvironmentType[]
    advanceVisited: boolean
    loading: boolean
    chartGroupDetailsLoading: boolean
    noGitOpsConfigAvailable?: boolean
    pageOffset?: number
    pageSize?: number
    hasMoreCharts?: boolean
}

export interface ChartGroupHelpers extends ChartSummaryHelpers, AdvancedConfigHelpers {
    selectChart?: (chartId: number) => void
    addChart?: (chartId: number) => void
    subtractChart?: (chartId: number) => void
    updateChartGroupNameAndDescription?: (name: string, description: string) => void
}

export interface ChartSummaryHelpers extends CommonHelpers {
    removeChart?: (index: number, removeAll?: boolean) => void
    toggleChart?: (index: number) => void
    chartListing?: () => void
    configureChart: (index: number) => void
}

export interface AdvancedConfigHelpers extends CommonHelpers {
    handleValuesYaml?: (index: number, valuesYaml: string) => void
    handleEnvironmentChange?: (index: number, envId: number) => void
    handleEnvironmentChangeOfAllCharts?: (envId: number) => void
    handleNameChange?: (index: number, name: string) => void
    createChartValues?: (index: number, name: string) => void
    validateData?: () => Promise<boolean>
    discardValuesYamlChanges?: (index: number) => void
    fetchChartValues: (chartId: number, index: number) => Promise<any>
}

interface CommonHelpers {
    getChartVersionsAndValues: (chartId: number, index: number) => Promise<void>
    handleChartValueChange?: (
        index: number,
        kind: 'DEPLOYED' | 'DEFAULT' | 'TEMPLATE' | 'EXISTING',
        valuesId: number,
    ) => void
    handleChartVersionChange?: (index: number, versionId: number) => void
}

export interface ChartGroupExports extends ChartGroupHelpers {
    state: ChartGroupState
    discardValuesYamlChanges: (index: number) => void
    updateChartGroupEntriesFromResponse: () => void
    reloadState: () => void
    applyFilterOnCharts: (qs: string, resetPage?: boolean) => Promise<void>
    setCharts: (charts: ChartGroupEntry[]) => void
    resetPaginationOffset: () => void
    setGitOpsConfigAvailable: (isGitOpsConfigAvailable: boolean) => void
    setEnvironmentList: (environmentList) => void
}

export interface HelmTemplateChartRequest {
    environmentId: number
    clusterId: number
    namespace: string
    releaseName: string
    appStoreApplicationVersionId: number
    valuesYaml: string
}

export interface HelmTemplateChartResponse extends ResponseType {
    result: {
        manifest: string
    }
}

export interface MultiChartSummaryProps extends ChartSummaryHelpers {
    charts: ChartGroupEntry[]
    configureChartIndex: number
    hideDeployedValues?: boolean
    name?: string
    setChartDetailsUpdate?: React.Dispatch<React.SetStateAction<boolean>>
}

export interface EmptyCharts {
    title?: string
    removeLearnMore?: boolean
    image?: any
    onClickViewChartButton?: () => void
    buttonText?: string
    subTitle?: string
    styles?: {}
    showChartGroupModal?: boolean
    toggleChartGroupModal?: React.Dispatch<React.SetStateAction<boolean>>
}

export interface HelmProjectUpdatePayload {
    appId: string
    appName: string
    teamId: number
}

export interface ChartListPopUpType {
    onClose: (e) => void
    chartList: ChartListType[]
    filteredChartList: ChartListType[]
    isLoading: boolean
    setFilteredChartList: React.Dispatch<React.SetStateAction<ChartListType[]>>
    setShowSourcePopoUp: React.Dispatch<React.SetStateAction<boolean>>
    chartActiveMap: Record<string, boolean>
    setChartActiveMap: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
}

export interface ChartListType {
    active: boolean
    id: number
    isEditable: boolean
    name: string
    registryProvider?: string
    isOCIRegistry?: boolean
}

export interface ChartGroupDeployResponse {
    chartGroupInstallMetadata: ChartGroupInstallMetadaum[]
    summary: string
}

export interface ChartGroupInstallMetadaum {
    appName: string
    environmentId: number
    triggerStatus: 'success' | 'failed'
    reason: string
}

export interface SelectedChartRepositoryType extends Pick<ChartListType, 'isOCIRegistry'>, Pick<OptionType, 'label'> {
    value: number
}

export interface ChartHeaderFilterProps {
    selectedChartRepo: SelectedChartRepositoryType[]
    includeDeprecated: number
    chartRepoList: SelectedChartRepositoryType[]
    setSelectedChartRepo: (chartRepoList: SelectedChartRepositoryType[]) => void
    appStoreName: string
    isGrid: boolean
    setIsGrid: (isGrid: boolean) => void
    chartCategoryIds: string[]
    setChartCategoryIds: Dispatch<SetStateAction<string[]>>
}

export interface DeleteInstalledChartParamsType {
    force?: true
    partialDelete?: true
    cascade?: false
}

export interface ChartGroupDeploymentsProps {
    name: string
    description: string
    installedChartData: InstalledChartGroup[]
    deleteInstalledChart: (e) => void
}
