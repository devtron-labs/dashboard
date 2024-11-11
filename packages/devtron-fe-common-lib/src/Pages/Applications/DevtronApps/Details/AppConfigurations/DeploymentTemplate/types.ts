import { DraftMetadataDTO, TemplateListType } from '@Shared/Services'
import { OverrideMergeStrategyType } from '../types'

export type DeploymentChartOptionkind = 'base' | 'env' | 'chartVersion' | 'deployment'

export interface DeploymentChartVersionType {
    id: number | string
    version: string
    /**
     * BEWARE: This field may or may not exist, not sure why it was there in first place
     */
    chartRefId?: number
    type: number
    deploymentTemplateHistoryId: number
    pipelineId: number
    environmentId: number
    name: string
    description?: string
    isAppMetricsSupported: boolean
    userUploaded?: boolean
}

export interface DeploymentChartOptionType extends DeploymentChartVersionType {
    value: string | number
    label: string
    kind?: DeploymentChartOptionkind
}

export interface ChartMetadataType {
    chartDescription: string
}

export interface GetResolvedDeploymentTemplateReturnType {
    resolvedData: string
    data: string
    areVariablesPresent: boolean
}

export enum ValuesAndManifestFlagDTO {
    DEPLOYMENT_TEMPLATE = 1,
    MANIFEST = 2,
}

type GetResolvedDeploymentTemplateCustomValuesPayloadType = {
    /**
     * String to be resolved
     */
    values: string
    type?: never
    deploymentTemplateHistoryId?: never
    pipelineId?: never
}

type GetHistoricResolvedDeploymentTemplatePayloadType = {
    values?: never
    type: TemplateListType
    deploymentTemplateHistoryId: number
    pipelineId: number
}

type GetDeploymentTemplateAndManifestBasePayload = {
    appId: number
    /**
     * EnvId for the given VALUE
     */
    envId?: number
    chartRefId: number
} & (GetHistoricResolvedDeploymentTemplatePayloadType | GetResolvedDeploymentTemplateCustomValuesPayloadType)

export type GetResolvedDeploymentTemplatePayloadType = {
    valuesAndManifestFlag: ValuesAndManifestFlagDTO.DEPLOYMENT_TEMPLATE
} & GetDeploymentTemplateAndManifestBasePayload

export type GetResolvedDeploymentTemplateProps = GetResolvedDeploymentTemplatePayloadType

export type GetDeploymentManifestProps = GetDeploymentTemplateAndManifestBasePayload

export type GetDeploymentManifestPayloadType = {
    valuesAndManifestFlag: ValuesAndManifestFlagDTO.MANIFEST
} & GetDeploymentTemplateAndManifestBasePayload

export interface ResolvedDeploymentTemplateDTO {
    /**
     * Template with encoded variables
     */
    data: string
    /**
     * Template with resolved variables
     */
    resolvedData: string
    variableSnapshot: Record<string, string>
}

export interface ManifestTemplateDTO extends Pick<ResolvedDeploymentTemplateDTO, 'data'> {}

interface DeploymentTemplateChartConfigType {
    id: number
    /**
     * Not consumed on UI just need to send in payload while update
     */
    refChartTemplate: string
    /**
     * Not consumed on UI just need to send in payload while update
     */
    refChartTemplateVersion: string
    chartRefId: number
    readme: string
}

export interface SelectedChartDetailsType {
    selectedChartRefId: number
    selectedChart: DeploymentChartVersionType
}

interface EnvironmentConfigType {
    id: number
    status: number
    manualReviewed: boolean
    active: boolean
    namespace: string
}

interface BaseDeploymentTemplateConfigState {
    chartConfig: DeploymentTemplateChartConfigType
    isOverridden?: never
    environmentConfig?: never
    mergeStrategy?: never
}

interface EnvironmentOverrideDeploymentTemplateConfigState {
    chartConfig?: never
    isOverridden: boolean
    environmentConfig: EnvironmentConfigType
    mergeStrategy: OverrideMergeStrategyType
}

export interface DeploymentTemplateConfigCommonState extends SelectedChartDetailsType {
    /**
     * The first ever state of the deployment template
     */
    originalTemplate: Record<string, string>
    isAppMetricsEnabled: boolean
    readme: string
    schema: Record<string, string>
    guiSchema: string
    latestDraft?: DraftMetadataDTO
    editorTemplate: string
    editorTemplateWithoutLockedKeys: string
}

export type DeploymentTemplateConfigState = DeploymentTemplateConfigCommonState &
    (BaseDeploymentTemplateConfigState | EnvironmentOverrideDeploymentTemplateConfigState)

type DTApplicationMetricsReadOnlyProps = {
    isLoading?: never
    selectedChart?: never
    isDisabled?: never
    toggleAppMetrics?: never
    /**
     * @default - false
     * If true, would only text depicting the information whether the application metrics is enabled or not
     */
    onlyShowCurrentStatus: true
    parsingError?: never
    restoreLastSavedYAML?: never
}

type DTApplicationMetricsParseErrorProps =
    | {
          parsingError: string
          restoreLastSavedYAML: () => void
      }
    | {
          parsingError?: never
          restoreLastSavedYAML?: never
      }

type DTApplicationMetricsActionProps = {
    isLoading: boolean
    selectedChart: DeploymentChartVersionType
    isDisabled: boolean
    toggleAppMetrics: () => void
    onlyShowCurrentStatus?: false
} & DTApplicationMetricsParseErrorProps

export type DTApplicationMetricsFormFieldProps = {
    isAppMetricsEnabled: boolean
    showApplicationMetrics: boolean
} & (DTApplicationMetricsActionProps | DTApplicationMetricsReadOnlyProps)

export enum CompareFromApprovalOptionsValuesType {
    APPROVAL_PENDING = 1,
    VALUES_FROM_DRAFT = 2,
}

export enum DryRunEditorMode {
    APPROVAL_PENDING = 'approvalPending',
    VALUES_FROM_DRAFT = 'valuesFromDraft',
    PUBLISHED_VALUES = 'publishedValues',
}
