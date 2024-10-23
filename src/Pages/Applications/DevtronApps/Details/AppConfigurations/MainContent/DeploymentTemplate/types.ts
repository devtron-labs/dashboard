import { SyntheticEvent } from 'react'
import { Operation } from 'fast-json-patch'
import {
    ConfigKeysWithLockType,
    DeploymentChartVersionType,
    ChartMetadataType,
    DeploymentTemplateConfigState,
    SelectedChartDetailsType,
    CompareFromApprovalOptionsValuesType,
    ConfigurationType,
    ServerErrors,
    ConfigToolbarPopupNodeType,
    DryRunEditorMode,
    ConfigHeaderTabType,
    ProtectConfigTabsType,
    DraftMetadataDTO,
} from '@devtron-labs/devtron-fe-common-lib'

type BaseDeploymentTemplateProps = {
    /**
     * If isUnSet is true would call this so that we re-direct users to next step
     */
    respondOnSuccess: (redirection: boolean) => void
    /**
     * Given in case we have'nt saved any deployment template
     * If true, would show chart type selector.
     */
    isUnSet: boolean
    /**
     * Something related to git-ops
     */
    isCiPipeline: boolean

    environmentName?: never
    clusterId?: never
}

type EnvOverrideDeploymentTemplateProps = {
    environmentName: string
    clusterId?: string

    respondOnSuccess?: never
    isUnSet?: never
    isCiPipeline?: never
}

export type DeploymentTemplateProps = {
    isProtected: boolean
    reloadEnvironments: () => void
    fetchEnvConfig: (environmentId: number) => void
} & (BaseDeploymentTemplateProps | EnvOverrideDeploymentTemplateProps)

export interface DeploymentTemplateChartStateType {
    charts: DeploymentChartVersionType[]
    chartsMetadata: Record<string, ChartMetadataType>
    globalChartDetails: DeploymentChartVersionType
    latestAppChartRef: number
}

export interface DeploymentTemplateEditorDataStateType
    extends Omit<DeploymentTemplateConfigState, 'editorTemplateWithoutLockedKeys'> {
    parsingError: string
    removedPatches: Operation[]
    originalTemplateState: DeploymentTemplateConfigState
}

export interface DeploymentTemplateStateType {
    isLoadingInitialData: boolean
    initialLoadError: ServerErrors
    /**
     * (Readonly)
     */
    chartDetails: DeploymentTemplateChartStateType

    /**
     * Template state that would be used in case actual deployment happens
     * (Readonly)
     */
    publishedTemplateData: DeploymentTemplateConfigState
    /**
     * Last saved draft template data
     * Only present in case of protected config
     * (Readonly)
     */
    draftTemplateData: DeploymentTemplateConfigState
    /**
     * Template state of base configuration
     * (Readonly)
     */
    baseDeploymentTemplateData: DeploymentTemplateConfigState
    /**
     * The state of current editor
     */
    currentEditorTemplateData: DeploymentTemplateEditorDataStateType

    /**
     * If true, would resolve scoped variables
     */
    resolveScopedVariables: boolean
    isResolvingVariables: boolean

    /**
     * Contains resolved editor template for current editor - has two keys 1. Complete template 2. Template without locked keys
     */
    resolvedEditorTemplate: ResolvedEditorTemplateType
    /**
     * Contains resolved original template for current editor for us to feed to GUI View
     */
    resolvedOriginalTemplate: ResolvedEditorTemplateType

    /**
     * Used in case of approval view since we need to compare with published template
     */
    resolvedPublishedTemplate: ResolvedEditorTemplateType

    /**
     * Used to identify whether we are going to maintain sorting order of keys in editor
     */
    wasGuiOrHideLockedKeysEdited: boolean
    showDraftComments: boolean
    hideLockedKeys: boolean
    lockedConfigKeysWithLockType: ConfigKeysWithLockType
    lockedDiffModalState: {
        showLockedTemplateDiffModal: boolean
        /**
         * State to show locked changes modal in case user is non super admin and is changing locked keys
         * Would be showing an info bar in locked modal
         */
        showLockedDiffForApproval: boolean
    }
    isSaving: boolean
    /**
     * Would show modal to save in case of config protection to propose changes / save as draft
     */
    showSaveChangesModal: boolean
    /**
     * To replace the opened popup menu body in config toolbar
     */
    popupNodeType: ConfigToolbarPopupNodeType
    /**
     * In case of approval pending mode, we would be showing a select to compare from, this is its selected value
     * If the action is to delete override then we would only be showing approval pending
     */
    compareFromSelectedOptionValue: CompareFromApprovalOptionsValuesType
    /**
     * There is a select in dry run mode in case isDraftPresent for us to toggle between draft/published/approval-pending
     */
    dryRunEditorMode: DryRunEditorMode
    /**
     * Triggered on changing chart/version
     */
    isLoadingChangedChartDetails: boolean
    showDeleteOverrideDialog: boolean
    showDeleteDraftOverrideDialog: boolean
    /**
     * This mode can only be activated when user is in edit mode
     */
    showReadMe: boolean
    editMode: ConfigurationType
    configHeaderTab: ConfigHeaderTabType
    shouldMergeTemplateWithPatches: boolean
    selectedProtectionViewTab: ProtectConfigTabsType
    /**
     * This state is present in case we have a draft available
     * We will be initialize it with count coming from draft
     * Will send handler in DraftComment which onchange would update this state
     */
    areCommentsPresent: boolean
}

export interface DeploymentTemplateOptionsHeaderProps
    extends Pick<DeploymentTemplateProps, 'isUnSet'>,
        Pick<DeploymentTemplateEditorDataStateType, 'parsingError' | 'selectedChart'>,
        Pick<DeploymentTemplateStateType, 'showReadMe' | 'editMode' | 'chartDetails'> {
    disableVersionSelect: boolean
    handleChangeToGUIMode: () => void
    handleChangeToYAMLMode: () => void
    restoreLastSavedTemplate: () => void
    handleChartChange: (selectedChart: DeploymentChartVersionType) => void
    isCompareView: boolean
    isGuiSupported: boolean
    areChartsLoading: boolean
    showDeleteOverrideDraftEmptyState: boolean
}

// Can derive editMode from url as well, just wanted the typing to be more explicit
export interface DeploymentTemplateFormProps
    extends Pick<DeploymentTemplateProps, 'isUnSet' | 'environmentName'>,
        Pick<DeploymentTemplateConfigState, 'guiSchema' | 'selectedChart' | 'schema'>,
        Pick<DeploymentTemplateEditorDataStateType, 'latestDraft'>,
        Pick<
            DeploymentTemplateStateType,
            'showReadMe' | 'lockedConfigKeysWithLockType' | 'hideLockedKeys' | 'editMode'
        > {
    editorOnChange: (value: string) => void
    readOnly: boolean
    editedDocument: string
    uneditedDocument: string
    readMe: string
    handleChangeToYAMLMode: () => void
    isGuiSupported: boolean
}

export interface DeploymentTemplateGUIViewProps
    extends Pick<
            DeploymentTemplateFormProps,
            | 'editorOnChange'
            | 'lockedConfigKeysWithLockType'
            | 'hideLockedKeys'
            | 'uneditedDocument'
            | 'editedDocument'
            | 'isUnSet'
        >,
        Pick<DeploymentTemplateConfigState, 'guiSchema' | 'selectedChart'> {
    value: string
    readOnly: boolean
    handleChangeToYAMLMode: () => void
    rootClassName?: string
}

export interface ResolvedEditorTemplateType {
    originalTemplateString: string
    templateWithoutLockedKeys: string
}

export interface DeploymentTemplateCTAProps
    extends Pick<DeploymentTemplateProps, 'isCiPipeline'>,
        Pick<DeploymentTemplateEditorDataStateType, 'parsingError' | 'selectedChart' | 'isAppMetricsEnabled'> {
    isLoading: boolean
    isDisabled: boolean
    showApplicationMetrics: boolean
    handleSave: (e: SyntheticEvent) => void
    toggleAppMetrics: () => void
    restoreLastSavedYAML: () => void
    isDryRunView: boolean
}

export interface DeleteOverrideDialogProps {
    environmentConfigId: number
    handleReload: () => void
    handleClose: () => void
    handleProtectionError: () => void
    reloadEnvironments: () => void
}

export interface DTChartSelectorProps
    extends Pick<DeploymentTemplateChartStateType, 'charts' | 'chartsMetadata'>,
        Pick<
            DeploymentTemplateOptionsHeaderProps,
            | 'isUnSet'
            | 'selectedChart'
            | 'disableVersionSelect'
            | 'areChartsLoading'
            | 'parsingError'
            | 'restoreLastSavedTemplate'
        > {
    selectChart: (selectedChart: DeploymentChartVersionType) => void
    selectedChartRefId: number
}

export interface ChartSelectorDropdownProps
    extends Pick<DeploymentTemplateChartStateType, 'charts' | 'chartsMetadata'>,
        Pick<DeploymentTemplateProps, 'isUnSet'>,
        Pick<DTChartSelectorProps, 'areChartsLoading'>,
        Pick<DeploymentTemplateConfigState, 'selectedChart'> {
    selectedChartRefId: number
    selectChart: (
        selectedChart: DeploymentChartVersionType,
    ) => void | React.Dispatch<React.SetStateAction<DeploymentChartVersionType>>
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
    /**
     * FIXME: Not consumed at UI
     */
    chartRepositoryId: number
    /**
     * FIXME: Not consumed at UI
     */
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

export interface GetPublishedAndBaseDeploymentTemplateReturnType {
    publishedTemplateState: DeploymentTemplateConfigState
    baseDeploymentTemplateState: DeploymentTemplateConfigState
}

export interface GetChartListReturnType
    extends SelectedChartDetailsType,
        Pick<
            DeploymentTemplateChartStateType,
            'charts' | 'chartsMetadata' | 'globalChartDetails' | 'latestAppChartRef'
        > {}

export interface HandleInitializeTemplatesWithoutDraftParamsType {
    baseDeploymentTemplateState: DeploymentTemplateStateType['baseDeploymentTemplateData']
    publishedTemplateState: DeploymentTemplateStateType['publishedTemplateData']
    chartDetailsState: DeploymentTemplateStateType['chartDetails']
    lockedConfigKeysWithLockTypeState: DeploymentTemplateStateType['lockedConfigKeysWithLockType']
}

export interface GetCurrentEditorStateProps {
    state: DeploymentTemplateStateType
    isPublishedConfigPresent: boolean
    isDryRunView: boolean
    isDeleteOverrideDraft: boolean
    isInheritedView: boolean
    isPublishedValuesView: boolean
    showApprovalPendingEditorInCompareView: boolean
}

export interface GetDryRunViewEditorStateProps
    extends Pick<GetCurrentEditorStateProps, 'state' | 'isPublishedConfigPresent' | 'isDeleteOverrideDraft'> {}

export interface GetRawEditorValueForDryRunModeProps
    extends Pick<
        GetCurrentEditorStateProps,
        'isPublishedConfigPresent' | 'isDryRunView' | 'isDeleteOverrideDraft' | 'state'
    > {}

export interface GetCurrentEditorPayloadForScopedVariablesProps
    extends Pick<
            GetCurrentEditorStateProps,
            'isInheritedView' | 'isPublishedValuesView' | 'showApprovalPendingEditorInCompareView'
        >,
        GetRawEditorValueForDryRunModeProps {}

export interface HandleInitializeDraftDataProps {
    latestDraft: DraftMetadataDTO
    guiSchema: string
    chartRefsData: GetChartListReturnType
    lockedConfigKeys: string[]
    envId: string
}

interface UpdateDTCommonPayloadType {
    chartRefId: DeploymentChartVersionType['id']
    isAppMetricsEnabled: boolean
    saveEligibleChanges: boolean
    readme?: string
    schema?: Record<string, string>
}

export interface UpdateEnvironmentDTPayloadType
    extends UpdateDTCommonPayloadType,
        Partial<Pick<DeploymentTemplateEditorDataStateType, 'environmentConfig'>> {
    environmentId: number
    envOverrideValues: Record<string, string>
    IsOverride: boolean
    isDraftOverriden?: boolean
    globalConfig?: Record<string, string>
}

export interface UpdateBaseDTPayloadType
    extends UpdateDTCommonPayloadType,
        Partial<Pick<DeploymentTemplateEditorDataStateType, 'chartConfig'>> {
    appId: number
    defaultAppOverride: Record<string, string>
    id?: number
    valuesOverride: Record<string, string>
}

export interface GetCompareFromEditorConfigParams {
    envId: string
    isDeleteOverrideDraft: boolean
    isPublishedConfigPresent: boolean
    showApprovalPendingEditorInCompareView: boolean
    state: DeploymentTemplateStateType
}

export type GetLockConfigEligibleAndIneligibleChangesType = (props: {
    documents: Record<'edited' | 'unedited', object>
    lockedConfigKeysWithLockType: ConfigKeysWithLockType
}) => {
    eligibleChanges: Record<string, any>
    ineligibleChanges: Record<string, any>
}