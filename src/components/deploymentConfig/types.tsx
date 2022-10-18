import React from 'react'
import { ServerError } from '../../modals/commonTypes'
import { AppEnvironment } from '../../services/service.types'
import { CustomNavItemsType } from '../app/details/appConfig/appConfig.type'
import { EnvironmentOverrideComponentProps } from '../EnvironmentOverride/EnvironmentOverrides.type'
import * as jsonpatch from 'fast-json-patch'

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
    isEnvOverride: boolean
    openComparison: boolean
    handleComparisonClick: () => void
    chartConfigLoading: boolean
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
    chartConfigLoading: boolean
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
    yamlMode: boolean
    isBasicViewLocked: boolean
    codeEditorValue: string
    basicFieldValuesErrorObj: BasicFieldErrorObj
    changeEditorMode?: () => void
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
    editorOnChange: (str: string, fromBasic?: boolean) => void
    schemas: any
    charts: DeploymentChartVersionType[]
    selectedChart: DeploymentChartVersionType
    environments: AppEnvironment[]
    fetchedValues: Record<number, string>
    setFetchedValues: React.Dispatch<React.SetStateAction<Record<number, string>>>
    readOnly?: boolean
    globalChartRefId?: number
    yamlMode: boolean
    basicFieldValues: Record<string, any>
    setBasicFieldValues?: (
        basicFieldValues: Record<string, any>,
    ) => void | React.Dispatch<React.SetStateAction<Record<string, any>>>
    basicFieldPatchData: Record<string, jsonpatch.Operation>
    setBasicFieldPatchData?: React.Dispatch<React.SetStateAction<Record<string, jsonpatch.Operation>>>
    basicFieldValuesErrorObj: BasicFieldErrorObj
    setBasicFieldValuesErrorObj?: (
      basicFieldErrorObj: BasicFieldErrorObj,
  ) => void | React.Dispatch<React.SetStateAction<BasicFieldErrorObj>>
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
    esoData: EsoData[]
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
