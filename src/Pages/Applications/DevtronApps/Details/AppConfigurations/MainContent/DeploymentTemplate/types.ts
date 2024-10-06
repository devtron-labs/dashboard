import { SyntheticEvent } from 'react'
import { GroupBase } from 'react-select'
import { Operation } from 'fast-json-patch'
import {
    ConfigKeysWithLockType,
    DeploymentChartVersionType,
    ChartMetadataType,
    DeploymentTemplateConfigState,
    TemplateListType,
    SelectPickerOptionType,
    TemplateListDTO,
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

export interface DeploymentTemplateOptionsHeaderProps
    extends Pick<DeploymentTemplateProps, 'isUnSet'>,
        Pick<DeploymentTemplateEditorDataStateType, 'parsingError'> {
    disableVersionSelect: boolean
    handleChangeToGUIMode: () => void
    handleChangeToYAMLMode: () => void
    restoreLastSavedTemplate: () => void
    handleChartChange: (selectedChart: DeploymentChartVersionType) => void
    selectedChart: DeploymentChartVersionType
    chartDetails: DeploymentTemplateChartStateType
    isCompareView: boolean
    editMode: ConfigurationType
    showReadMe: boolean
    isGuiSupported: boolean
    areChartsLoading: boolean
    showDeleteOverrideDraftEmptyState: boolean
}

// Can derive editMode from url as well, just wanted the typing to be more explicit
export interface DeploymentTemplateFormProps
    extends Pick<DeploymentTemplateProps, 'isUnSet' | 'environmentName'>,
        Pick<DeploymentTemplateConfigState, 'guiSchema' | 'selectedChart' | 'schema'> {
    editorOnChange: (value: string) => void
    lockedConfigKeysWithLockType: ConfigKeysWithLockType
    readOnly: boolean
    editedDocument: string
    uneditedDocument: string
    readMe: string
    handleChangeToYAMLMode: () => void
    hideLockedKeys: boolean
    editMode: ConfigurationType
    showReadMe: boolean
    isGuiSupported: boolean
    latestDraft: DraftMetadataDTO
}

export interface DeploymentTemplateGUIViewProps
    extends Pick<
        DeploymentTemplateFormProps,
        'editorOnChange' | 'lockedConfigKeysWithLockType' | 'hideLockedKeys' | 'uneditedDocument' | 'editedDocument'
    > {
    value: string
    readOnly: boolean
    isUnSet: boolean
    handleChangeToYAMLMode: () => void
    guiSchema: string
    selectedChart: DeploymentChartVersionType
    rootClassName?: string
}

export interface ResolvedEditorTemplateType {
    originalTemplateString: string
    templateWithoutLockedKeys: string
}

export interface DeploymentTemplateCTAProps extends Pick<DeploymentTemplateProps, 'isCiPipeline'> {
    isLoading: boolean
    isDisabled: boolean
    showApplicationMetrics: boolean
    isAppMetricsEnabled: boolean
    selectedChart: DeploymentChartVersionType
    handleSave: (e: SyntheticEvent) => void
    toggleAppMetrics: () => void
    parsingError: string
    restoreLastSavedYAML: () => void
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
        Pick<DTChartSelectorProps, 'areChartsLoading'> {
    selectedChartRefId: number
    selectedChart: DeploymentChartVersionType
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
}

export interface GetDeploymentTemplateInitialStateParamsType {
    isSuperAdmin: boolean
    isEnvView: boolean
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

interface InitializeStateBasePayloadType
    extends Pick<
        DeploymentTemplateStateType,
        'baseDeploymentTemplateData' | 'publishedTemplateData' | 'chartDetails' | 'lockedConfigKeysWithLockType'
    > {}

export enum DeploymentTemplateActionType {
    RESET_ALL = 'RESET_ALL',
    INITIATE_INITIAL_DATA_LOAD = 'INITIATE_INITIAL_DATA_LOAD',
    INITIAL_DATA_ERROR = 'INITIAL_DATA_ERROR',
    INITIALIZE_TEMPLATES_WITHOUT_DRAFT = 'INITIALIZE_TEMPLATES_WITHOUT_DRAFT',
    INITIALIZE_TEMPLATES_WITH_DRAFT = 'INITIALIZE_TEMPLATES_WITH_DRAFT',
    INITIATE_CHART_CHANGE = 'INITIATE_CHART_CHANGE',
    CHART_CHANGE_SUCCESS = 'CHART_CHANGE_SUCCESS',
    CHART_CHANGE_ERROR = 'CHART_CHANGE_ERROR',
    INITIATE_RESOLVE_SCOPED_VARIABLES = 'INITIATE_RESOLVE_SCOPED_VARIABLES',
    RESOLVE_SCOPED_VARIABLES = 'RESOLVE_SCOPED_VARIABLES',
    UN_RESOLVE_SCOPED_VARIABLES = 'UN_RESOLVE_SCOPED_VARIABLES',
    TOGGLE_DRAFT_COMMENTS = 'TOGGLE_DRAFT_COMMENTS',
    UPDATE_README_MODE = 'UPDATE_README_MODE',
    RESTORE_LAST_SAVED_TEMPLATE = 'RESTORE_LAST_SAVED_TEMPLATE',
    CURRENT_EDITOR_VALUE_CHANGE = 'CURRENT_EDITOR_VALUE_CHANGE',
    UPDATE_HIDE_LOCKED_KEYS = 'UPDATE_HIDE_LOCKED_KEYS',
    CHANGE_TO_GUI_MODE = 'CHANGE_TO_GUI_MODE',
    CHANGE_TO_YAML_MODE = 'CHANGE_TO_YAML_MODE',
    UPDATE_CONFIG_HEADER_TAB = 'UPDATE_CONFIG_HEADER_TAB',
    TOGGLE_SHOW_COMPARISON_WITH_MERGED_PATCHES = 'TOGGLE_SHOW_COMPARISON_WITH_MERGED_PATCHES',
    UPDATE_PROTECTION_VIEW_TAB = 'UPDATE_PROTECTION_VIEW_TAB',
    UPDATE_DRY_RUN_EDITOR_MODE = 'UPDATE_DRY_RUN_EDITOR_MODE',
    INITIATE_SAVE = 'INITIATE_SAVE',
    SAVE_ERROR = 'SAVE_ERROR',
    FINISH_SAVE = 'FINISH_SAVE',
    SHOW_EDIT_HISTORY = 'SHOW_EDIT_HISTORY',
    SHOW_DISCARD_DRAFT_POPUP = 'SHOW_DISCARD_DRAFT_POPUP',
    CLEAR_POPUP_NODE = 'CLEAR_POPUP_NODE',
    CHANGE_COMPARE_FROM_SELECTED_OPTION = 'CHANGE_COMPARE_FROM_SELECTED_OPTION',
    SHOW_LOCKED_DIFF_FOR_APPROVAL = 'SHOW_LOCKED_DIFF_FOR_APPROVAL',
    TOGGLE_APP_METRICS = 'TOGGLE_APP_METRICS',
    UPDATE_MERGE_STRATEGY = 'UPDATE_MERGE_STRATEGY',
    SHOW_DELETE_OVERRIDE_DIALOG = 'SHOW_DELETE_OVERRIDE_DIALOG',
    DELETE_LOCAL_OVERRIDE = 'DELETE_LOCAL_OVERRIDE',
    OVERRIDE_TEMPLATE = 'OVERRIDE_TEMPLATE',
    DELETE_OVERRIDE_CONCURRENT_PROTECTION_ERROR = 'DELETE_OVERRIDE_CONCURRENT_PROTECTION_ERROR',
    CLOSE_DELETE_DRAFT_OVERRIDE_DIALOG = 'CLOSE_DELETE_DRAFT_OVERRIDE_DIALOG',
    CLOSE_OVERRIDE_DIALOG = 'CLOSE_OVERRIDE_DIALOG',
    LOCKED_CHANGES_DETECTED_ON_SAVE = 'LOCKED_CHANGES_DETECTED_ON_SAVE',
    SHOW_PROTECTED_SAVE_MODAL = 'SHOW_PROTECTED_SAVE_MODAL',
    CLOSE_SAVE_CHANGES_MODAL = 'CLOSE_SAVE_CHANGES_MODAL',
    CLOSE_LOCKED_DIFF_MODAL = 'CLOSE_LOCKED_DIFF_MODAL',
}

type DeploymentTemplateNoPayloadActions =
    | DeploymentTemplateActionType.INITIATE_INITIAL_DATA_LOAD
    | DeploymentTemplateActionType.INITIATE_CHART_CHANGE
    | DeploymentTemplateActionType.CHART_CHANGE_ERROR
    | DeploymentTemplateActionType.INITIATE_RESOLVE_SCOPED_VARIABLES
    | DeploymentTemplateActionType.UN_RESOLVE_SCOPED_VARIABLES
    | DeploymentTemplateActionType.TOGGLE_DRAFT_COMMENTS
    | DeploymentTemplateActionType.RESTORE_LAST_SAVED_TEMPLATE
    | DeploymentTemplateActionType.CHANGE_TO_GUI_MODE
    | DeploymentTemplateActionType.CHANGE_TO_YAML_MODE
    | DeploymentTemplateActionType.TOGGLE_SHOW_COMPARISON_WITH_MERGED_PATCHES
    | DeploymentTemplateActionType.INITIATE_SAVE
    | DeploymentTemplateActionType.SHOW_EDIT_HISTORY
    | DeploymentTemplateActionType.SHOW_DISCARD_DRAFT_POPUP
    | DeploymentTemplateActionType.CLEAR_POPUP_NODE
    | DeploymentTemplateActionType.SHOW_LOCKED_DIFF_FOR_APPROVAL
    | DeploymentTemplateActionType.TOGGLE_APP_METRICS
    | DeploymentTemplateActionType.DELETE_LOCAL_OVERRIDE
    | DeploymentTemplateActionType.OVERRIDE_TEMPLATE
    | DeploymentTemplateActionType.DELETE_OVERRIDE_CONCURRENT_PROTECTION_ERROR
    | DeploymentTemplateActionType.CLOSE_DELETE_DRAFT_OVERRIDE_DIALOG
    | DeploymentTemplateActionType.CLOSE_OVERRIDE_DIALOG
    | DeploymentTemplateActionType.LOCKED_CHANGES_DETECTED_ON_SAVE
    | DeploymentTemplateActionType.SHOW_PROTECTED_SAVE_MODAL
    | DeploymentTemplateActionType.CLOSE_SAVE_CHANGES_MODAL
    | DeploymentTemplateActionType.CLOSE_LOCKED_DIFF_MODAL

export type DeploymentTemplateActionState =
    | {
          type: DeploymentTemplateActionType.RESET_ALL
          payload: GetDeploymentTemplateInitialStateParamsType
      }
    | {
          type: DeploymentTemplateNoPayloadActions
          payload?: never
      }
    | {
          type: DeploymentTemplateActionType.INITIAL_DATA_ERROR
          payload: {
              error: ServerErrors
          }
      }
    | {
          type: DeploymentTemplateActionType.INITIALIZE_TEMPLATES_WITHOUT_DRAFT
          payload: InitializeStateBasePayloadType & Pick<DeploymentTemplateStateType, 'currentEditorTemplateData'>
      }
    | {
          type: DeploymentTemplateActionType.INITIALIZE_TEMPLATES_WITH_DRAFT
          payload: InitializeStateBasePayloadType &
              Pick<
                  DeploymentTemplateStateType,
                  | 'currentEditorTemplateData'
                  | 'draftTemplateData'
                  | 'configHeaderTab'
                  | 'selectedProtectionViewTab'
                  | 'compareFromSelectedOptionValue'
              >
      }
    | {
          type: DeploymentTemplateActionType.CHART_CHANGE_SUCCESS
          payload: {
              selectedChart: DeploymentChartVersionType
              selectedChartTemplateDetails: DeploymentTemplateConfigState
          }
      }
    | {
          type: DeploymentTemplateActionType.RESOLVE_SCOPED_VARIABLES
          payload: Pick<
              DeploymentTemplateStateType,
              'resolvedEditorTemplate' | 'resolvedOriginalTemplate' | 'resolvedPublishedTemplate'
          >
      }
    | {
          type: DeploymentTemplateActionType.UPDATE_README_MODE
          payload: Pick<DeploymentTemplateStateType, 'showReadMe'>
      }
    | {
          type: DeploymentTemplateActionType.CURRENT_EDITOR_VALUE_CHANGE
          payload: {
              template: string
          }
      }
    | {
          type: DeploymentTemplateActionType.UPDATE_HIDE_LOCKED_KEYS
          payload: Pick<DeploymentTemplateStateType, 'hideLockedKeys'>
      }
    | {
          type: DeploymentTemplateActionType.UPDATE_CONFIG_HEADER_TAB
          payload: Pick<DeploymentTemplateStateType, 'configHeaderTab'>
      }
    | {
          type: DeploymentTemplateActionType.UPDATE_PROTECTION_VIEW_TAB
          payload: Pick<DeploymentTemplateStateType, 'selectedProtectionViewTab'>
      }
    | {
          type: DeploymentTemplateActionType.UPDATE_DRY_RUN_EDITOR_MODE
          payload: Pick<DeploymentTemplateStateType, 'dryRunEditorMode'>
      }
    | {
          type: DeploymentTemplateActionType.CHANGE_COMPARE_FROM_SELECTED_OPTION
          payload: Pick<DeploymentTemplateStateType, 'compareFromSelectedOptionValue'>
      }
    | {
          type: DeploymentTemplateActionType.UPDATE_MERGE_STRATEGY
          payload: Pick<DeploymentTemplateEditorDataStateType, 'mergeStrategy'>
      }
    | {
          type: DeploymentTemplateActionType.SHOW_DELETE_OVERRIDE_DIALOG
          payload: Pick<DeploymentTemplateProps, 'isProtected'>
      }
    | {
          type: DeploymentTemplateActionType.SAVE_ERROR
          payload: {
              isProtectionError: boolean
          }
      }
    | {
          type: DeploymentTemplateActionType.FINISH_SAVE
          payload: {
              isLockConfigError: boolean
          }
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
