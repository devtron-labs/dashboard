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

import React from 'react'
import { ResponseType, ServerError } from '@devtron-labs/devtron-fe-common-lib'
import * as jsonpatch from 'fast-json-patch'
import { AppEnvironment } from '../../services/service.types'
import { EnvironmentOverrideComponentProps } from '../../Pages/Shared/EnvironmentOverride/EnvironmentOverrides.types'

export interface DeploymentObject {
    id: number | null
    appId: number | null
    refChartTemplate: string
    refChartTemplateVersion: string
    chartRepositoryId: number
    valuesOverrride: any
    defaultAppOverride: any
}
export interface ConfigKeysWithLockType {
    config: string[]
    allowed: boolean
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

export interface DeploymentConfigProps extends Omit<EnvironmentOverrideComponentProps, 'envConfig' | 'fetchEnvConfig' | 'onErrorRedirectURL'> {
    respondOnSuccess?: (redirection: boolean) => void
    isUnSet: boolean
    isCiPipeline: boolean
    environments: AppEnvironment[]
    isProtected: boolean
    reloadEnvironments: () => void
}

export interface DeploymentChartVersionType {
    id: number | string
    version: string
    chartRefId: number
    type: number
    deploymentTemplateHistoryId: number
    pipelineId: number
    environmentId: number
    name: string
    description?: string
    isAppMetricsSupported: boolean
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
    handleSaveChanges: React.MouseEventHandler<HTMLButtonElement>
    isEnvOverride?: boolean
    isCiPipeline?: boolean
    disableCheckbox?: boolean
    disableButton?: boolean
    toggleAppMetrics: () => void
    isPublishedMode: boolean
    reload: () => void
    isValues?: boolean
    convertVariables?: boolean
    handleLockedDiffDrawer: (value: boolean) => void
    showLockedDiffForApproval: boolean
    setShowLockedDiffForApproval: (show: boolean) => void
    checkForProtectedLockedChanges: () => Promise<ResponseType>
}

export interface CompareWithDropdownProps {
    envId: string
    isEnvOverride: boolean
    environments: DeploymentChartOptionType[]
    charts: DeploymentChartOptionType[]
    globalChartRef?: any
    selectedOption: DeploymentChartOptionType
    setSelectedOption: any
    isValues: boolean
    groupedData: any
    setConvertVariables: (convertVariables: boolean) => void
    triggerEditorLoadingState: () => void
}

export interface CompareWithApprovalPendingAndDraftProps {
    isEnvOverride: boolean
    overridden: boolean
    readOnly: boolean
    environmentName: string
    selectedChart: DeploymentChartVersionType
    handleOverride: (e: any) => Promise<void>
    latestDraft: any
    isPublishedOverriden: boolean
    isDeleteDraftState: boolean
    setShowDraftData: (show: boolean) => void
    isValues: boolean
    selectedOptionDraft: any
    setSelectedOptionDraft: any
}

export interface CompareApprovalAndDraftSelectedOption {
    id: number
    label: string
}

export interface ChartTypeVersionOptionsProps {
    isUnSet: boolean
    disableVersionSelect?: boolean
    charts: DeploymentChartVersionType[]
    chartsMetadata?: Record<string, ChartMetadataType>
    selectedChart: DeploymentChartVersionType
    selectChart: (selectedChart: DeploymentChartVersionType) => void
    selectedChartRefId: number
}

export interface CompareOptionsProps {
    isComparisonAvailable: boolean
    isEnvOverride: boolean
    openComparison: boolean
    handleComparisonClick: () => void
    chartConfigLoading: boolean
    openReadMe: boolean
    isReadMeAvailable: boolean
    handleReadMeClick: () => void
}

export interface DeploymentTemplateOptionsTabProps {
    openComparison: boolean
    chartConfigLoading: boolean
    openReadMe: boolean
    isUnSet: boolean
    charts: DeploymentChartVersionType[]
    chartsMetadata?: Record<string, ChartMetadataType>
    selectedChart: DeploymentChartVersionType
    selectChart: (
        selectedChart: DeploymentChartVersionType,
    ) => void | React.Dispatch<React.SetStateAction<DeploymentChartVersionType>>
    selectedChartRefId: number
    disableVersionSelect?: boolean
    yamlMode: boolean
    codeEditorValue: string
    changeEditorMode?: () => void
}

// TODO: the following types can be combined with this into a single type
export interface DeploymentTemplateReadOnlyEditorViewProps {
    value: string
    isEnvOverride?: boolean
    lockedConfigKeysWithLockType: ConfigKeysWithLockType
    hideLockedKeys: boolean
    uneditedDocument: string
    editedDocument: string
}

export interface DeploymentTemplateEditorViewProps {
    isEnvOverride?: boolean
    environmentName?: string
    value: string
    defaultValue?: string
    editorOnChange?: (str: string) => void
    readOnly?: boolean
    globalChartRefId?: number
    handleOverride?: (e: any) => Promise<void>
    isValues?: boolean
    convertVariables?: boolean
    setConvertVariables?: (convertVariables: boolean) => void
    groupedData?: any
    hideLockedKeys: boolean
    lockedConfigKeysWithLockType: ConfigKeysWithLockType
    hideLockKeysToggled: React.MutableRefObject<boolean>
    removedPatches: React.MutableRefObject<jsonpatch.Operation[]>
    uneditedDocument: DeploymentTemplateReadOnlyEditorViewProps['uneditedDocument']
    editedDocument: DeploymentTemplateReadOnlyEditorViewProps['editedDocument']
}

export interface DeploymentConfigContextType {
    isUnSet: boolean
    state: DeploymentConfigStateWithDraft
    dispatch: React.Dispatch<DeploymentConfigStateAction>
    isConfigProtectionEnabled: boolean
    environments: AppEnvironment[]
    reloadEnvironments: () => void
    changeEditorMode: () => void
}

export interface EsoData {
    secretKey: string
    key: string
    property?: string
}

export interface SecretData {
    key: string
    name: string
    property: string
    isBinary: boolean
}

export interface EsoSecretData {
    secretStore: any
    secretStoreRef: any
    esoData: EsoData[]
    refreshInterval: string
}
export interface SecretFormProps {
    id: number
    appChartRef: { id: number; version: string; name: string }
    appId: number
    roleARN: string
    name: string
    index: number
    external: boolean
    externalType: string
    secretData: SecretData[]
    esoSecretData?: EsoSecretData
    type: string
    data: { k: string; v: string }[]
    isUpdate: boolean
    mountPath: string
    keyValueEditable?: boolean
    filePermission: string
    subPath: boolean
    update: (...args) => void
    collapse: (...args) => void
    initialise?: () => void
    isJobView?: boolean
}

interface ErrorObj {
    isValid: boolean
    message: string | null
}

export interface ChartSelectorModalType {
    charts: DeploymentChartVersionType[]
    chartsMetadata?: Record<string, ChartMetadataType>
    selectedChartRefId: number
    selectedChart: DeploymentChartVersionType
    selectChart: (
        selectedChart: DeploymentChartVersionType,
    ) => void | React.Dispatch<React.SetStateAction<DeploymentChartVersionType>>
    isUnSet: boolean
}

export interface ChartMetadataType {
    chartDescription: string
}

export interface DeploymentConfigToolbarProps {
    selectedTabIndex: number
    handleTabSelection: (index: number) => void
    noReadme?: boolean
    showReadme: boolean
    handleReadMeClick: () => void
    isValues?: boolean
    setIsValues?: (isValues: boolean) => void
    convertVariables?: boolean
    setConvertVariables?: (convertVariables: boolean) => void
    componentType: string
}

export interface DeploymentConfigStateType {
    charts: DeploymentChartVersionType[]
    chartsMetadata: Record<string, ChartMetadataType>
    selectedChartRefId: number
    selectedChart: DeploymentChartVersionType
    template: string
    schema: any
    guiSchema: string
    wasGuiOrHideLockedKeysEdited: boolean
    loading: boolean
    chartConfig: any
    isAppMetricsEnabled: boolean
    tempFormData: string
    chartConfigLoading: boolean
    lockChangesLoading: boolean
    showConfirmation: boolean
    showReadme: boolean
    openComparison: boolean
    selectedTabIndex: number
    readme: string
    fetchedValues: Record<number | string, string>
    fetchedValuesManifest: Record<number | string, string>
    yamlMode: boolean
    data: any
    duplicate: any
    dialog: boolean
    latestAppChartRef: any
    latestChartRef: any
    isOverride: boolean
    isValues: boolean
    loadingManifest: boolean
    manifestDataRHS: string
    manifestDataLHS: string
    groupedOptionsData: Array<Object>
    isValuesOverride: boolean
    manifestDataRHSOverride: string
    manifestDataLHSOverride: string
    groupedOptionsDataOverride: Array<Object>
    loadingManifestOverride: boolean
    convertVariables: boolean
    convertVariablesOverride: boolean
}

export interface DeploymentConfigStateWithDraft extends DeploymentConfigStateType {
    publishedState: DeploymentConfigStateType
    draftValues: string
    showSaveChangesModal: boolean
    allDrafts: any[]
    latestDraft: any
    showComments: boolean
    showDeleteOverrideDraftModal: boolean
    showDraftOverriden: boolean
    isDraftOverriden: boolean
    unableToParseYaml: boolean
    selectedCompareOption: DeploymentChartOptionType
    showLockedTemplateDiff: boolean
}

export enum DeploymentConfigStateActionTypes {
    draftState = 'draftState',
    loading = 'loading',
    charts = 'charts',
    chartsMetadata = 'chartsMetadata',
    selectedChartRefId = 'selectedChartRefId',
    selectedChart = 'selectedChart',
    template = 'template',
    schemas = 'schemas',
    chartConfig = 'chartConfig',
    isAppMetricsEnabled = 'isAppMetricsEnabled',
    tempFormData = 'tempFormData',
    chartConfigLoading = 'chartConfigLoading',
    showConfirmation = 'showConfirmation',
    showReadme = 'showReadme',
    openComparison = 'openComparison',
    selectedTabIndex = 'selectedTabIndex',
    readme = 'readme',
    fetchedValues = 'fetchedValues',
    fetchedValuesManifest = 'fetchedValuesManifest',
    yamlMode = 'yamlMode',
    duplicate = 'duplicate',
    appMetrics = 'appMetrics',
    data = 'data',
    toggleDialog = 'toggleDialog',
    reset = 'reset',
    toggleSaveChangesModal = 'toggleSaveChangesModal',
    toggleShowLockedTemplateDiff = 'toggleShowLockedTemplateDiff',
    allDrafts = 'allDrafts',
    publishedState = 'publishedState',
    toggleDraftComments = 'toggleDraftComments',
    toggleDeleteOverrideDraftModal = 'toggleDeleteOverrideDraftModal',
    isDraftOverriden = 'isDraftOverriden',
    unableToParseYaml = 'unableToParseYaml',
    selectedCompareOption = 'selectedCompareOption',
    multipleOptions = 'multipleOptions',
    groupedOptionsData = 'groupedOptionsData',
    loadingManifest = 'loadingManifest',
    manifestDataRHS = 'manifestDataRHS',
    manifestDataLHS = 'manifestDataLHS',
    isValues = 'isValues',
    isValuesOverride = 'isValuesOverride',
    groupedOptionsDataOverride = 'groupedOptionsDataOverride',
    loadingManifestOverride = 'loadingManifestOverride',
    manifestDataRHSOverride = 'manifestDataRHSOverride',
    manifestDataLHSOverride = 'manifestDataLHSOverride',
    convertVariables = 'convertVariables',
    convertVariablesOverride = 'convertVariablesOverride',
    lockChangesLoading = 'lockChangesLoading',
    guiSchema = 'guiSchema',
    wasGuiOrHideLockedKeysEdited = 'wasGuiOrHideLockedKeysEdited',
}

export interface DeploymentConfigStateAction {
    type: DeploymentConfigStateActionTypes
    payload?: any
}

export interface DropdownContainerProps {
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
}
export interface DropdownItemProps {
    label: string
    isValues: boolean
    index: number
    onClick: () => void
}

export interface SaveConfirmationDialogProps {
    onSave: () => void
    showAsModal: boolean
    closeLockedDiffDrawerWithChildModal: () => void
}

export interface DeploymentTemplateGUIViewProps
    extends Pick<
        DeploymentTemplateEditorViewProps,
        'editorOnChange' | 'lockedConfigKeysWithLockType' | 'hideLockedKeys'
    > {
    fetchingValues?: boolean
    value: string
    readOnly: boolean
    uneditedDocument?: DeploymentTemplateEditorViewProps['uneditedDocument']
    editedDocument?: DeploymentTemplateEditorViewProps['editedDocument']
}

export interface Schema {
    type: string
    items: Schema
    properties: Schema
}
