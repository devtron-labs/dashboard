import React from 'react'
import { ServerError } from '@devtron-labs/devtron-fe-common-lib'
import { AppEnvironment } from '../../services/service.types'
import { CustomNavItemsType } from '../app/details/appConfig/appConfig.type'
import { EnvironmentOverrideComponentProps } from '../EnvironmentOverride/EnvironmentOverrides.type'

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

export interface DeploymentConfigProps extends EnvironmentOverrideComponentProps {
    respondOnSuccess?: () => void
    isUnSet: boolean
    navItems: CustomNavItemsType[]
    isCiPipeline: boolean
    environments: AppEnvironment[]
    isProtected: boolean
    reloadEnvironments: ()=> void
}

export interface DeploymentChartVersionType {
    id: number | string
    version: string
    chartRefId: number
    type:number
    pipelineConfigOverrideId: number
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
    isEnvOverride?: boolean
    isCiPipeline?: boolean
    disableCheckbox?: boolean
    disableButton?: boolean
    toggleAppMetrics: () => void
    isPublishedMode: boolean
    reload: () => void
    isValues?: boolean
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
    setShowProposal: (show: boolean) => void
    isValues: boolean
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
    isBasicViewLocked: boolean
    codeEditorValue: string
    basicFieldValuesErrorObj: BasicFieldErrorObj
    changeEditorMode?: () => void
}

export interface DeploymentTemplateReadOnlyEditorViewProps {
    value: string
    isEnvOverride?: boolean
}

export interface DeploymentTemplateEditorViewProps {
    isEnvOverride?: boolean
    environmentName?: string
    value: string
    defaultValue?: string
    editorOnChange: (str: string, fromBasic?: boolean) => void
    readOnly?: boolean
    globalChartRefId?: number
    handleOverride?: (e: any) => Promise<void>
    isValues?: boolean
    groupedData?: any
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

export interface BasicFieldDataType {
    isUpdated: boolean
    dataType: string
    value: any
    isMandatory: boolean
    isInvalid: boolean
}

interface ErrorObj {
    isValid: boolean
    message: string | null
}

export interface BasicFieldErrorObj {
    isValid: boolean
    port: ErrorObj
    cpu: ErrorObj
    memory: ErrorObj
    envVariables: ErrorObj[]
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
    isValues: boolean
    setIsValues: (isValues: boolean) => void
}

export interface DeploymentConfigStateType {
    charts: DeploymentChartVersionType[]
    chartsMetadata: Record<string, ChartMetadataType>
    selectedChartRefId: number
    selectedChart: DeploymentChartVersionType
    template: string
    schema: any
    loading: boolean
    chartConfig: any
    isAppMetricsEnabled: boolean
    tempFormData: string
    manifestData: string
    chartConfigLoading: boolean
    showConfirmation: boolean
    showReadme: boolean
    openComparison: boolean
    selectedTabIndex: number
    readme: string
    fetchedValues: Record<number | string, string>
    fetchedValuesManifest: Record<number | string, string>
    yamlMode: boolean
    isBasicLocked: boolean
    isBasicLockedInBase: boolean
    currentEditorView: string
    basicFieldValues: Record<string, any>
    basicFieldValuesErrorObj: BasicFieldErrorObj
    data: any
    duplicate: any
    dialog: boolean
    latestAppChartRef: any
    latestChartRef: any
    isOverride: boolean
}

export interface DeploymentConfigStateWithDraft extends DeploymentConfigStateType {
    publishedState: DeploymentConfigStateType
    draftValues: string,
    showSaveChangsModal: boolean
    allDrafts: any[]
    latestDraft: any
    showComments: boolean
    showDeleteOverrideDraftModal: boolean
    showDraftOverriden: boolean
    isDraftOverriden: boolean
    unableToParseYaml: boolean
    selectedCompareOption: DeploymentChartOptionType
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
    manifestData = 'manifestData',
    chartConfigLoading = 'chartConfigLoading',
    showConfirmation = 'showConfirmation',
    showReadme = 'showReadme',
    openComparison = 'openComparison',
    selectedTabIndex = 'selectedTabIndex',
    readme = 'readme',
    fetchedValues = 'fetchedValues',
    fetchedValuesManifest = 'fetchedValuesManifest',
    yamlMode = 'yamlMode',
    isBasicLocked = 'isBasicLocked',
    isBasicLockedInBase = 'isBasicLockedInBase',
    currentEditorView = 'currentEditorView',
    basicFieldValues = 'basicFieldValues',
    basicFieldValuesErrorObj = 'basicFieldValuesErrorObj',
    duplicate = 'duplicate',
    appMetrics = 'appMetrics',
    data = 'data',
    toggleDialog = 'toggleDialog',
    reset = 'reset',
    toggleSaveChangesModal = 'toggleSaveChangesModal',
    allDrafts = 'allDrafts',
    publishedState = 'publishedState',
    toggleDraftComments = 'toggleDraftComments',
    toggleDeleteOverrideDraftModal = 'toggleDeleteOverrideDraftModal',
    isDraftOverriden = 'isDraftOverriden',
    unableToParseYaml = 'unableToParseYaml',
    selectedCompareOption = 'selectedCompareOption',
    multipleOptions = 'multipleOptions',
}

export interface DeploymentConfigStateAction {
    type: DeploymentConfigStateActionTypes
    payload?: any
}
