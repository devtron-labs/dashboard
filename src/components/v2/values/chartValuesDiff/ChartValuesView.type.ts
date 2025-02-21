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

import YAML from 'yaml'
import { DeploymentAppTypes, GitOpsAuthModeType } from '@devtron-labs/devtron-fe-common-lib'
import { ChartValuesType, ChartVersionType } from '../../../charts/charts.types'
import { InstalledAppInfo, ReleaseInfo } from '../../../external-apps/ExternalAppService'
import { AppDetails } from '../../appDetails/appDetails.type'
import { ChartDeploymentDetail } from '../../chartDeploymentHistory/chartDeploymentHistory.service'
import { AppMetaInfo } from '../../../app/types'
import { DELETE_ACTION } from '../../../../config'

export enum ChartKind {
    DEFAULT = 'DEFAULT',
    TEMPLATE = 'TEMPLATE',
    DEPLOYED = 'DEPLOYED',
    EXISTING = 'EXISTING',
}

export interface ChartValuesViewType {
    appId?: string
    isExternalApp?: boolean
    isDeployChartView?: boolean
    isCreateValueView?: boolean
    installedConfigFromParent?: ChartInstalledConfig
    appDetails?: AppDetails
    chartValuesListFromParent?: ChartValuesType[]
    chartVersionsDataFromParent?: ChartVersionType[]
    chartValuesFromParent?: ChartValuesType
    selectedVersionFromParent?: number
    init?: () => void
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
    isVirtualEnvironment?: boolean
    allowedDeploymentTypes?: DeploymentAppTypes[]
}

export interface ChartEnvironmentListType {
    label: string
    options: ChartEnvironmentOptionType[]
}

export interface ChartValuesDiffOptionType extends ChartValuesOptionType {
    appStoreVersionId?: number
    info: string
    kind?: string
    version?: string
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
    invalidEnvironment: boolean
    isVirtualEnvironmentOnSelector?: boolean
    isVirtualEnvironment?: boolean
}

export interface DeploymentAppSelectorType {
    commonState: ChartValuesViewState
    isUpdate: boolean
    handleDeploymentAppTypeSelection?: (event) => void
    isDeployChartView: boolean
    allowedDeploymentTypes?: DeploymentAppTypes[]
    gitRepoURL: string
    allowedCustomBool: boolean
}

export interface DeploymentAppRadioGroupType {
    isDisabled?: boolean
    deploymentAppType: string
    handleOnChange?: (event) => void
    allowedDeploymentTypes?: DeploymentAppTypes[]
    rootClassName?: string
    isFromCDPipeline?: boolean
    /**
     * @default true
     */
    areGitopsCredentialsConfigured?: boolean
    isGitOpsRepoNotConfigured?: boolean
    gitOpsRepoConfigInfoBar?: (content: string) => JSX.Element
}

export interface gitOpsDrawerType extends DeploymentAppRadioGroupType {
    commonState: ChartValuesViewState
    dispatch: React.Dispatch<ChartValuesViewAction>
    staleData?: boolean
    setStaleData?: (boolean) => void
    isDrawerOpen?: boolean
    handleDrawerState?: (boolean) => void
    showRepoSelector?: boolean
    allowedCustomBool: boolean
}

export interface ChartProjectSelectorType {
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

export interface ChartRepoOptions {
    appStoreApplicationVersionId: number
    chartRepoName: string
    chartId: number
    chartName: string
    version: string
    deprecated: boolean
}
export interface ChartRepoSelectorType extends ChartSelectorType {
    repoChartValue?: ChartRepoOptions
    repoChartSelectOptionLabel?: (chartRepoDetails: ChartRepoDetailsType) => JSX.Element
    handleRepoChartValueChange?: (event: any) => void
    repoChartOptionLabel?: (props: any) => JSX.Element
    chartDetails?: ChartRepoOptions
    showConnectToChartTippy: boolean
    hideConnectToChartTippy: () => void
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
    hideCreateNewOption?: boolean
}

export interface ChartVersionValuesSelectorType extends ChartVersionSelectorType, ChartValuesSelectorType {}

export interface ChartValuesEditorType {
    loading: boolean
    isExternalApp: boolean
    isDeployChartView: boolean
    isCreateValueView: boolean
    appId: string
    appName: string
    valuesText: string
    onChange: (value: string) => void
    chartValuesList: ChartValuesType[]
    deploymentHistoryList: ChartDeploymentDetail[]
    repoChartValue: ChartRepoOptions
    hasChartChanged: boolean
    showInfoText: boolean
    defaultValuesText: string
    showEditorHeader?: boolean
    manifestView?: boolean
    generatedManifest?: string
    comparisonView: boolean
    selectedChartValues: ChartValuesType
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

export interface ChartInstalledConfig {
    id: number
    appId: number
    installedAppId: number
    appName: string
    appStoreName: string
    appStoreApplicationName: string
    name: string
    chartName: string
    appStoreId: number
    appStoreVersion: number
    appVersion: string
    version: string
    environmentId: number
    namespace: string
    clusterId: number
    teamId: number
    readme: string
    rawValues: string
    valuesYaml: string
    valuesOverrideYaml: string
    appOfferingMode: string
    deprecated: boolean
    referenceValueId: number
    referenceValueKind: string
    valuesSchemaJson?: string
    deploymentAppType?: string
    isManifestScanEnabled: boolean
}

export interface ChartValuesViewState {
    isLoading: boolean
    isLodingGUIForm: boolean
    openReadMe: boolean
    openComparison: boolean
    isUpdateInProgress: boolean
    isDeleteInProgress: boolean
    showDeleteAppConfirmationDialog: boolean
    showRepoSelector: boolean
    showConnectToChartTippy: boolean
    selectedProject: ChartValuesOptionType
    selectedEnvironment: ChartEnvironmentOptionType
    selectedVersion: number
    selectedVersionUpdatePage: ChartVersionType
    chartValues: ChartValuesType
    repoChartValue: ChartRepoOptions
    fetchingValuesYaml: boolean
    modifiedValuesYaml: string
    schemaJson: string
    valuesYamlDocument: YAML.Document.Parsed
    valuesYamlUpdated: boolean
    generatingManifest: boolean
    manifestGenerationKey: string
    generatedManifest: string
    valuesEditorError: string
    installedConfig: ChartInstalledConfig
    fetchingReadMe: boolean
    fetchedReadMe: Map<number, string>
    activeTab: string
    isComparisonAvailable: boolean
    isReadMeAvailable: boolean
    releaseInfo: ReleaseInfo
    installedAppInfo: InstalledAppInfo
    chartVersionsData: ChartVersionType[]
    projects: ChartValuesOptionType[]
    environments: ChartEnvironmentOptionType[]
    deploymentHistoryArr: ChartDeploymentDetail[]
    forceDeleteData: {
        forceDelete: boolean
        title: string
        message: string
    }
    nonCascadeDeleteData: {
        nonCascade: boolean
        clusterName: string
    }
    errorResponseCode: number
    invalidAppName: boolean
    invalidAppNameMessage: string
    invalidValueName: boolean
    invalidValueNameMessage: string
    invalidaEnvironment: boolean
    invalidProject: boolean
    formValidationError: Record<string, boolean>
    showNoGitOpsWarning: boolean
    deploymentAppType: string
    gitRepoURL: string
    authMode: GitOpsAuthModeType
    initialChartVersionValues: {
        chartVersionId: number
        chartValuesId: number
    }
    isManifestScanEnabled: boolean
}

export enum ChartValuesViewActionTypes {
    isLoading = 'isLoading',
    isLoadingGUIForm = 'isLoadingGUIForm',
    openReadMe = 'openReadMe',
    openComparison = 'openComparison',
    isUpdateInProgress = 'isUpdateInProgress',
    isDeleteInProgress = 'isDeleteInProgress',
    showDeleteAppConfirmationDialog = 'showDeleteAppConfirmationDialog',
    showRepoSelector = 'showRepoSelector',
    showConnectToChartTippy = 'showConnectToChartTippy',
    selectedProject = 'selectedProject',
    selectedEnvironment = 'selectedEnvironment',
    selectedVersion = 'selectedVersion',
    selectedVersionUpdatePage = 'selectedVersionUpdatePage',
    chartValues = 'chartValues',
    repoChartValue = 'repoChartValue',
    fetchingValuesYaml = 'fetchingValuesYaml',
    modifiedValuesYaml = 'modifiedValuesYaml',
    schemaJson = 'schemaJson',
    valuesYamlDocument = 'valuesYamlDocument',
    valuesYamlUpdated = 'valuesYamlUpdated',
    generatingManifest = 'generatingManifest',
    manifestGenerationKey = 'manifestGenerationKey',
    generatedManifest = 'generatedManifest',
    valuesEditorError = 'valuesEditorError',
    installedConfig = 'installedConfig',
    fetchingReadMe = 'fetchingReadMe',
    fetchedReadMe = 'fetchedReadMe',
    activeTab = 'activeTab',
    isComparisonAvailable = 'isComparisonAvailable',
    isReadMeAvailable = 'isReadMeAvailable',
    releaseInfo = 'releaseInfo',
    installedAppInfo = 'installedAppInfo',
    chartVersionsData = 'chartVersionsData',
    projects = 'projects',
    environments = 'environments',
    forceDeleteData = 'forceDeleteData',
    nonCascadeDeleteData = 'nonCascadeDeleteData',
    errorResponseCode = 'errorResponseCode',
    invalidValueName = 'invalidValueName',
    invalidValueNameMessage = 'invalidValueNameMessage',
    invalidAppName = 'invalidAppName',
    invalidAppNameMessage = 'invalidAppNameMessage',
    invalidaEnvironment = 'invalidaEnvironment',
    invalidProject = 'invalidProject',
    deploymentHistoryArr = 'deploymentHistoryArr',
    formValidationError = 'formValidationError',
    multipleOptions = 'multipleOptions',
    showNoGitOpsWarning = 'showNoGitOpsWarning',
    selectedDeploymentApp = 'selectedDeploymentApp',
    setGitRepoURL = 'setGitRepoURL',
    updateGitOpsConfiguration = 'updateGitOpsConfiguration',
    setInitialChartVersionValues = 'setInitialChartVersionValues',
    setIsManifestScanEnabled = 'setIsManifestScanEnabled',
}

export interface ChartValuesViewAction {
    type: ChartValuesViewActionTypes
    payload: any
}

export interface AppNameInputType {
    appName: string
    handleAppNameChange: (newAppName: string) => void
    handleAppNameOnBlur: () => void
    invalidAppName: boolean
    invalidAppNameMessage: string
}

export interface ValueNameInputType {
    valueName: string
    handleValueNameChange: (newAppName: string) => void
    handleValueNameOnBlur: () => void
    invalidValueName: boolean
    invalidValueNameMessage: string
    valueNameDisabled: boolean
}

export interface ChartValuesGUIFormProps {
    schemaJson: ChartValuesViewState['schemaJson']
    valuesYamlDocument: YAML.Document.Parsed
    fetchingSchemaJson: boolean
    isUpdateInProgress: boolean
    isDeleteInProgress: boolean
    deployOrUpdateApplication: (forceUpdate?: boolean) => Promise<void>
    dispatch: React.Dispatch<ChartValuesViewAction>
    formValidationError: Record<string, boolean>
}

export interface ActiveReadmeColumnProps {
    fetchingReadMe: boolean
    activeReadMe: string
}

export interface CompareWithDropdownProps {
    deployedChartValues?: ChartValuesDiffOptionType[]
    defaultChartValues?: ChartValuesDiffOptionType[]
    presetChartValues?: ChartValuesDiffOptionType[]
    deploymentHistoryOptionsList?: ChartValuesDiffOptionType[]
    selectedVersionForDiff?: ChartValuesDiffOptionType
    handleSelectedVersionForDiff: (selected: ChartValuesDiffOptionType) => void
    manifestView: boolean
}

export interface ValuesForDiffStateType {
    loadingValuesForDiff: boolean
    deployedChartValues: ChartValuesDiffOptionType[]
    defaultChartValues: ChartValuesDiffOptionType[]
    presetChartValues: ChartValuesDiffOptionType[]
    deploymentHistoryOptionsList: ChartValuesDiffOptionType[]
    selectedVersionForDiff: ChartValuesDiffOptionType
    selectedManifestVersionForDiff: ChartValuesDiffOptionType
    deployedManifest: string
    valuesForDiff: Map<number, string>
    manifestsForDiff: Map<number, string>
    selectedManifestForDiff?: string
    selectedValuesForDiff: string
}

export interface DeleteChartDialogProps {
    appName: string
    handleDelete: (deleteAction: DELETE_ACTION) => void
    toggleConfirmation: (isDeleteConfirmation: boolean) => void
    isCreateValueView?: boolean
    disableButton?: boolean
}

export interface DeleteApplicationButtonProps {
    type: string
    isUpdateInProgress: boolean
    isDeleteInProgress: boolean
    dispatch: (action: ChartValuesViewAction) => void
    clickHandler?: () => void
}

export interface UpdateApplicationButtonProps {
    isUpdateInProgress: boolean
    isDeleteInProgress: boolean
    isDeployChartView: boolean
    isCreateValueView: boolean
    deployOrUpdateApplication: () => Promise<void>
}

export interface ErrorScreenWithInfoProps {
    info: string
}

export interface ProjectSelectorTypes {
    appId: string
    onClose: () => void
    appMetaInfo: AppMetaInfo
    installedAppId: number
    projectList: ChartValuesOptionType[]
    getAppMetaInfoRes: () => Promise<void>
}
