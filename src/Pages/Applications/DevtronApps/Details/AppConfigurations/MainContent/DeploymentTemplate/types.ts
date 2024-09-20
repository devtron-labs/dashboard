import { SyntheticEvent } from 'react'
import { GroupBase } from 'react-select'
import { Operation } from 'fast-json-patch'
import {
    ConfigKeysWithLockType,
    DeploymentTemplateQueryParamsType,
    DeploymentChartVersionType,
    ChartMetadataType,
    DeploymentTemplateConfigState,
    TemplateListType,
    SelectPickerOptionType,
    TemplateListDTO,
    SelectedChartDetailsType,
    CompareFromApprovalOptionsValuesType,
} from '@devtron-labs/devtron-fe-common-lib'

export interface DeploymentTemplateProps {
    respondOnSuccess?: (redirection: boolean) => void
    /**
     * Given in case we have'nt saved any deployment template
     * If true, would show chart type selector.
     */
    isUnSet?: boolean
    /**
     * Something related to git-ops
     */
    isCiPipeline?: boolean
    isProtected: boolean
    reloadEnvironments: () => void
    environmentName?: string
    clusterId?: string
    fetchEnvConfig: (environmentId: number) => void
}

export interface DeploymentTemplateChartStateType {
    charts: DeploymentChartVersionType[]
    chartsMetadata: Record<string, ChartMetadataType>
    globalChartRefId: number
}

export interface DeploymentTemplateOptionsHeaderProps
    extends Pick<DeploymentTemplateQueryParamsType, 'editMode' | 'showReadMe' | 'selectedTab'>,
        Pick<DeploymentTemplateProps, 'isUnSet'> {
    disableVersionSelect: boolean
    handleChangeToGUIMode: () => void
    handleChangeToYAMLMode: () => void
    unableToParseYaml: boolean
    canEditTemplate: boolean
    restoreLastSavedTemplate: () => void
    handleChartChange: (selectedChart: DeploymentChartVersionType) => void
    selectedChart: DeploymentChartVersionType
    chartDetails: DeploymentTemplateChartStateType
}

export interface DeploymentTemplateEditorDataStateType
    extends Omit<DeploymentTemplateConfigState, 'editorTemplateWithoutLockedKeys'> {
    unableToParseYaml: boolean
    removedPatches: Operation[]
}

interface DeploymentTemplateEditorHeaderBaseProps
    extends Pick<DeploymentTemplateQueryParamsType, 'showReadMe'>,
        Pick<DeploymentTemplateProps, 'isUnSet'> {
    /**
     * Chart version of editable template
     */
    selectedChartVersion: string
    isOverridden: boolean
    handleOverride: () => void
    showOverrideButton: boolean
    environmentName: string
    latestDraft: any
    readOnly: boolean
}

interface DeploymentTemplateEditorHeaderCompareViewProps {
    isCompareView: true
    selectedCompareWithOption: SelectPickerOptionType
    handleCompareWithOptionChange: (selectedOption: SelectPickerOptionType) => void
    compareWithOptions: CompareWithTemplateGroupedSelectPickerOptionType[]
    isApprovalView: boolean
    compareFromSelectedOptionValue: CompareFromApprovalOptionsValuesType
    handleCompareFromOptionSelection: (selectedOption: SelectPickerOptionType) => void
    draftChartVersion: string
    isDeleteOverrideDraftState: boolean
}

interface DeploymentTemplateEditorHeaderNonCompareViewProps {
    isCompareView?: false
    isApprovalView?: false
    selectedCompareWithOption?: never
    handleCompareWithOptionChange?: never
    compareWithOptions?: never
    compareFromSelectedOptionValue?: never
    handleCompareFromOptionSelection?: never
    draftChartVersion?: never
    isDeleteOverrideDraftState?: never
}

export type DeploymentTemplateEditorHeaderProps = DeploymentTemplateEditorHeaderBaseProps &
    (DeploymentTemplateEditorHeaderCompareViewProps | DeploymentTemplateEditorHeaderNonCompareViewProps)

// Can derive editMode from url as well, just wanted the typing to be more explicit
export interface DeploymentTemplateFormProps
    extends Pick<DeploymentTemplateQueryParamsType, 'editMode' | 'hideLockedKeys' | 'showReadMe'>,
        Pick<DeploymentTemplateProps, 'isUnSet'>,
        Pick<DeploymentTemplateConfigState, 'guiSchema' | 'selectedChart' | 'schema'>,
        Pick<DeploymentTemplateEditorHeaderProps, 'isOverridden' | 'environmentName' | 'latestDraft'> {
    editorOnChange: (value: string) => void
    lockedConfigKeysWithLockType: ConfigKeysWithLockType
    readOnly: boolean
    editedDocument: string
    uneditedDocument: string
    readMe: string
    isPublishedValuesView: boolean
    handleOverride: () => void
    wasGuiOrHideLockedKeysEdited: boolean
    handleChangeToYAMLMode: () => void
    handleEnableWasGuiOrHideLockedKeysEdited: () => void
}

export interface DeploymentTemplateGUIViewProps
    extends Pick<
        DeploymentTemplateFormProps,
        'editorOnChange' | 'lockedConfigKeysWithLockType' | 'hideLockedKeys' | 'uneditedDocument' | 'editedDocument'
    > {
    value: string
    readOnly: boolean
    isUnSet: boolean
    handleEnableWasGuiOrHideLockedKeysEdited: () => void
    wasGuiOrHideLockedKeysEdited: boolean
    handleChangeToYAMLMode: () => void
    guiSchema: string
    selectedChart: DeploymentChartVersionType
    rootClassName?: string
}

export interface ResolvedEditorTemplateType {
    originalTemplate: string
    templateWithoutLockedKeys: string
}

export interface DeploymentTemplateCTAProps
    extends Pick<DeploymentTemplateQueryParamsType, 'showReadMe' | 'selectedTab'>,
        Pick<DeploymentTemplateProps, 'isCiPipeline'> {
    isLoading: boolean
    isDisabled: boolean
    showApplicationMetrics: boolean
    isAppMetricsEnabled: boolean
    selectedChart: DeploymentChartVersionType
    shouldDisableEditingInheritedTemplate: boolean
    handleSave: (e: SyntheticEvent) => void
    toggleAppMetrics: () => void
}

export interface CompareWithValuesDataStoreItemType {
    id: number
    originalTemplate: string
    resolvedTemplate: string
    originalTemplateWithoutLockedKeys: string
    resolvedTemplateWithoutLockedKeys: string
}

export type CompareWithOptionGroupKindType =
    | TemplateListType.DefaultVersions
    | TemplateListType.DeployedOnSelfEnvironment
    | TemplateListType.PublishedOnEnvironments

export interface CompareWithTemplateGroupedSelectPickerOptionType extends GroupBase<SelectPickerOptionType> {}

export interface TemplateListItemType extends TemplateListDTO {
    /**
     * This ID is generated at UI, not from the server. DO NOT USE THIS FOR COMMUNICATION WITH SERVER
     */
    id: number
}

export interface HandleFetchDeploymentTemplateReturnType {
    globalTemplate: string
    templateConfig: Omit<DeploymentTemplateConfigState, keyof SelectedChartDetailsType>
}

export interface DeleteOverrideDialogProps {
    environmentConfigId: number
    handleReload: () => void
    handleClose: () => void
    handleShowDeleteDraftOverrideDialog: () => void
    reloadEnvironments: () => void
}

export interface DTChartSelectorProps
    extends Pick<DeploymentTemplateChartStateType, 'charts' | 'chartsMetadata'>,
        Pick<DeploymentTemplateProps, 'isUnSet'> {
    disableVersionSelect?: boolean
    selectedChart: DeploymentChartVersionType
    selectChart: (selectedChart: DeploymentChartVersionType) => void
    selectedChartRefId: number
}

export interface ChartSelectorDropdownProps
    extends Pick<DeploymentTemplateChartStateType, 'charts' | 'chartsMetadata'>,
        Pick<DeploymentTemplateProps, 'isUnSet'> {
    selectedChartRefId: number
    selectedChart: DeploymentChartVersionType
    selectChart: (
        selectedChart: DeploymentChartVersionType,
    ) => void | React.Dispatch<React.SetStateAction<DeploymentChartVersionType>>
}

export interface DeploymentConfigToolbarProps {
    selectedTabIndex: number
    handleTabSelection: (index: number) => void
    noReadme?: boolean
    showReadme: boolean
    handleReadMeClick: () => void
    convertVariables?: boolean
    setConvertVariables?: (convertVariables: boolean) => void
    unableToParseYaml: boolean
}

interface EnvironmentConfigDTO {
    IsOverride: boolean
    active: boolean
    chartRefId: number
    clusterId: number
    description: string
    envOverrideValues: Record<string, string>
    environmentId: number
    environmentName: string
    id: number
    isAppMetricsEnabled: boolean | null
    isBasicViewLocked: boolean
    latest: boolean
    manualReviewed: boolean
    namespace: string
    saveEligibleChanges: boolean
    status: number
}

export interface EnvironmentOverrideDeploymentTemplateDTO {
    IsOverride: boolean
    appMetrics: boolean
    chartRefId: number
    environmentConfig: EnvironmentConfigDTO
    globalChartRefId: number
    /**
     * Base deployment template
     */
    globalConfig: Record<string, string>
    guiSchema: string
    namespace: string
    readme: string
    schema: Record<string, string>
}

interface DeploymentTemplateGlobalConfigDTO {
    appId: number
    chartRefId: number
    // TODO: Look into this, why it is there
    chartRepositoryId: number
    // TODO: Look into this, why it is there
    currentViewEditor: string
    /**
     * Base deployment template
     */
    defaultAppOverride: Record<string, string>
    id: number
    isAppMetricsEnabled: boolean
    isBasicViewLocked: boolean
    latest: boolean
    readme: string
    refChartTemplate: string
    refChartTemplateVersion: string
    /**
     * Might be irrelevant
     */
    saveEligibleChanges: boolean
    /**
     * Schema to feed into the Code editor
     */
    schema: Record<string, string>
}

export interface DeploymentTemplateConfigDTO {
    globalConfig: DeploymentTemplateGlobalConfigDTO
    guiSchema: string
}
