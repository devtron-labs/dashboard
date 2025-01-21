import {
    CompareFromApprovalOptionsValuesType,
    ConfigHeaderTabType,
    ConfigToolbarPopupMenuConfigType,
    ConfigToolbarPopupNodeType,
    DeploymentHistorySingleValue,
    DeploymentTemplateConfigState,
    DraftMetadataDTO,
    OverrideMergeStrategyType,
    ProtectConfigTabsType,
    SelectPickerOptionType,
    ServerErrors,
} from '@devtron-labs/devtron-fe-common-lib'
import { CMSecretComponentType } from '@Pages/Shared/ConfigMapSecret/types'
import { FunctionComponent, MutableRefObject, ReactNode } from 'react'
import { DeploymentTemplateStateType } from './DeploymentTemplate/types'

export interface ConfigHeaderProps {
    configHeaderTab: ConfigHeaderTabType
    handleTabChange: (tab: ConfigHeaderTabType) => void
    areChangesPresent: boolean
    isDisabled: boolean
    /**
     * If false, can not override config and will show values tab as Configuration
     */
    isOverridable: boolean
    /**
     * This means that we are showing no override empty state, i.e, currently we are inheriting base config
     * and our editable state is also not overriding the base config.
     */
    showNoOverride: boolean
    parsingError: string
    restoreLastSavedYAML: () => void
    /** A map indicating which tabs to hide, with their visibility as boolean values */
    hideTabs?: Partial<Record<ConfigHeaderTabType, boolean>>
}

export interface ConfigHeaderTabProps
    extends Pick<
        ConfigHeaderProps,
        'handleTabChange' | 'isDisabled' | 'areChangesPresent' | 'isOverridable' | 'showNoOverride'
    > {
    tab: ConfigHeaderTabType
    activeTabIndex: number
    currentTabIndex: number
    hasError: boolean
}

export interface ConfigHeaderTabConfigType {
    text: string
    icon?: FunctionComponent<React.SVGProps<SVGSVGElement>> | null
}

interface ConfigToolbarPopupConfigType {
    menuConfig: Record<string, ConfigToolbarPopupMenuConfigType[]>
    /**
     * If true, would show popupMenuNode in body of the popup menu
     */
    popupNodeType?: ConfigToolbarPopupNodeType
    /**
     * If provided, will replace the popup menu view with the provided node given popupMenuConfig is not empty
     */
    popupMenuNode?: ReactNode
}

type ConfigToolbarReadMeProps =
    | {
          showEnableReadMeButton: boolean
          handleEnableReadmeView: () => void
      }
    | {
          showEnableReadMeButton?: never
          handleEnableReadmeView?: never
      }

export type ConfigToolbarProps = Pick<
    DraftMetadataDTO,
    'draftId' | 'draftVersionId' | 'userApprovalMetadata' | 'requestedUserId'
> & {
    configHeaderTab: ConfigHeaderTabType
    handleToggleScopedVariablesView: () => void
    resolveScopedVariables: boolean
    /**
     * Route for redirection to base configurations shown in case configHeaderTab is inherited
     */
    baseConfigurationURL: string
    /**
     * Will feed the selected tab in the protection tab group
     */
    selectedProtectionViewTab: ProtectConfigTabsType
    handleProtectionViewTabChange: (tab: ProtectConfigTabsType) => void

    handleToggleCommentsView: () => void
    /**
     * Would show red dot on comments icon if comments are present
     */
    areCommentsPresent: boolean

    showMergePatchesButton: boolean
    shouldMergeTemplateWithPatches: boolean
    handleToggleShowTemplateMergedWithPatch: () => void

    mergeStrategy: OverrideMergeStrategyType
    handleMergeStrategyChange: (strategy: OverrideMergeStrategyType) => void
    hidePatchOption?: boolean
    isMergeStrategySelectorDisabled?: boolean

    /**
     * Used to place toggle editor view and chart selectors in deployment template
     */
    children?: ReactNode
    /**
     * If provided, will show popup menu on click three dots button
     * If empty/null, will not show the button
     */
    popupConfig?: ConfigToolbarPopupConfigType
    /**
     * @default false
     */
    isApprovalPolicyConfigured?: boolean
    /**
     * @default false
     */
    isApprovalPending?: boolean
    isDraftPresent?: boolean
    /**
     * @default - false
     * If given would disable all the actions
     */
    disableAllActions?: boolean
    parsingError: string
    restoreLastSavedYAML: () => void
    /**
     * This key means if have saved a draft and have not proposed it yet, and we are creating a new entity like override.
     * @default - true
     * If false we will hide all the action in toolbar.
     */
    isPublishedConfigPresent?: boolean
    headerMessage?: string
    showDeleteOverrideDraftEmptyState: boolean
    handleReload: () => void
} & ConfigToolbarReadMeProps

interface ConfigToolbarPopupMenuLockedConfigDataType {
    /**
     * If false would not show hide/show locked keys button
     */
    areLockedKeysPresent: boolean
    hideLockedKeys: boolean
    handleSetHideLockedKeys: (value: boolean) => void
}

export interface GetConfigToolbarPopupConfigProps {
    /**
     * If not provided won't show locked config data
     */
    lockedConfigData?: ConfigToolbarPopupMenuLockedConfigDataType | null
    /**
     * @default false
     */
    showDeleteOverrideDraftEmptyState?: boolean
    configHeaderTab: ConfigHeaderTabType
    isOverridden: boolean
    isPublishedValuesView: boolean
    isPublishedConfigPresent: boolean
    handleDeleteOverride: () => void
    handleDelete?: () => void
    handleDiscardDraft: () => void
    unableToParseData: boolean
    isLoading: boolean
    isDraftAvailable: boolean
    handleShowEditHistory: () => void
    isApprovalPolicyConfigured?: boolean
    isDeletable?: boolean
    isDeleteOverrideDraftPresent?: boolean
    isDeleteDisabled?: boolean
    deleteDisabledTooltip?: string
}

type ConfigDryRunManifestProps =
    | {
          showManifest: true
          manifestAbortController: MutableRefObject<AbortController>
      }
    | {
          showManifest?: never
          manifestAbortController?: never
      }

type ConfigErrorHandlingProps =
    | {
          errorInfo: ServerErrors
          handleErrorReload: () => void
      }
    | {
          errorInfo?: never
          handleErrorReload?: never
      }

export type ConfigDryRunProps = {
    isLoading: boolean
    handleToggleResolveScopedVariables: () => void
    resolveScopedVariables: boolean
    showManifest: boolean
    chartRefId?: number
    editorTemplate: string
    editorSchema?: DeploymentTemplateConfigState['schema']
    selectedChartVersion?: string
    dryRunEditorMode: string
    handleChangeDryRunEditorMode: (mode: string) => void
    isDraftPresent: boolean
    isApprovalPending: boolean
    isPublishedConfigPresent: boolean
    mergeStrategy: OverrideMergeStrategyType
    /**
     * Is current view overridden
     */
    isOverridden: boolean
} & ConfigDryRunManifestProps &
    ConfigErrorHandlingProps

export interface ToggleResolveScopedVariablesProps {
    resolveScopedVariables: boolean
    handleToggleScopedVariablesView: () => void
    isDisabled?: boolean
    /**
     * @default true
     */
    showTooltip?: boolean
}

export enum DeploymentTemplateComponentType {
    DEPLOYMENT_TEMPLATE = '3',
}

type NoOverrideEmptyStateCMCSProps = {
    componentType: CMSecretComponentType
    configName: string
}

type NoOverrideEmptyStateDeploymentTemplateProps = {
    componentType: DeploymentTemplateComponentType
    configName?: never
}

export type NoOverrideEmptyStateProps = {
    environmentName: string
    handleCreateOverride: () => void
    handleViewInheritedConfig: () => void
    hideOverrideButton?: boolean
} & (NoOverrideEmptyStateCMCSProps | NoOverrideEmptyStateDeploymentTemplateProps)

type CMSecretDiffViewConfigType = {
    configuration?: DeploymentHistorySingleValue
    dataType: DeploymentHistorySingleValue
    mountDataAs: DeploymentHistorySingleValue
    volumeMountPath: DeploymentHistorySingleValue
    setSubPath: DeploymentHistorySingleValue
    externalSubpathValues: DeploymentHistorySingleValue
    filePermission: DeploymentHistorySingleValue
    roleARN: DeploymentHistorySingleValue
    mergeStrategy: DeploymentHistorySingleValue
}

type DeploymentTemplateDiffViewConfigType =
    | {
          applicationMetrics?: DeploymentHistorySingleValue
          chartName: DeploymentHistorySingleValue
          chartVersion: DeploymentHistorySingleValue
          mergeStrategy?: DeploymentHistorySingleValue
          isOverride?: DeploymentHistorySingleValue
          dataType?: never
          mountDataAs?: never
          volumeMountPath?: never
          setSubPath?: never
          externalSubpathValues?: never
          filePermission?: never
          roleARN?: never
      }
    | {
          applicationMetrics?: never
          chartName?: never
          chartVersion?: never
          isOverride?: never
      }

export type CompareConfigViewEditorConfigType = DeploymentTemplateDiffViewConfigType | CMSecretDiffViewConfigType

export type CompareConfigViewProps = {
    compareFromSelectedOptionValue: CompareFromApprovalOptionsValuesType
    handleCompareFromOptionSelection: (value: SelectPickerOptionType) => void
    isApprovalView: boolean
    isDeleteOverrideView: boolean

    currentEditorTemplate: Record<string | number, unknown>
    publishedEditorTemplate: Record<string | number, unknown>
    currentEditorConfig: CompareConfigViewEditorConfigType
    publishedEditorConfig: CompareConfigViewEditorConfigType
    draftChartVersion?: string
    selectedChartVersion?: string
    className?: string
    /**
     * @default 'Data'
     */
    displayName?: string
} & ConfigErrorHandlingProps

export interface BaseConfigurationNavigationProps {
    baseConfigurationURL: string
}

export interface NoPublishedVersionEmptyStateProps {
    isOverride?: boolean
}

export type SelectMergeStrategyProps = {
    mergeStrategy: OverrideMergeStrategyType
    /**
     * @default `noop`
     */
    handleMergeStrategyChange?: (value: OverrideMergeStrategyType) => void
    /**
     * @default false
     */
    isDisabled?: boolean
    /**
     * @default `dropdown`
     */
    variant: 'dropdown' | 'text'
    /**
     * Boolean to hide the `OverrideMergeStrategy.PATCH` option.
     */
    hidePatchOption?: boolean
}

export type EnvOverrideEditorCommonStateType = Required<
    Pick<
        DeploymentTemplateStateType['draftTemplateData'],
        | 'originalTemplate'
        | 'editorTemplate'
        | 'editorTemplateWithoutLockedKeys'
        | 'environmentConfig'
        | 'mergeStrategy'
        | 'mergedTemplate'
        | 'mergedTemplateObject'
        | 'mergedTemplateWithoutLockedKeys'
        | 'isLoadingMergedTemplate'
        | 'mergedTemplateError'
        | 'isOverridden'
    >
>
