import YAML from 'yaml'
import {
    BaseURLParams,
    CompareFromApprovalOptionsValuesType,
    ConfigHeaderTabType,
    ConfigToolbarPopupNodeType,
    ConfigurationType,
    DEFAULT_LOCKED_KEYS_CONFIG,
    DeploymentChartVersionType,
    DeploymentTemplateConfigState,
    DryRunEditorMode,
    ProtectConfigTabsType,
    ServerErrors,
    ToastManager,
    ToastVariantType,
    YAMLStringify,
} from '@devtron-labs/devtron-fe-common-lib'
import { DeploymentTemplateEditorDataStateType, DeploymentTemplateProps, DeploymentTemplateStateType } from './types'
import {
    applyCompareDiffOfTempFormDataOnOriginalData,
    getCurrentTemplateWithLockedKeys,
    getEditorTemplateAndLockedKeys,
} from './utils'

interface InitializeStateBasePayloadType
    extends Pick<
        DeploymentTemplateStateType,
        'baseDeploymentTemplateData' | 'publishedTemplateData' | 'chartDetails' | 'lockedConfigKeysWithLockType'
    > {}

interface GetDeploymentTemplateInitialStateParamsType {
    isSuperAdmin: boolean
}

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
    UPDATE_ARE_COMMENTS_PRESENT = 'UPDATE_ARE_COMMENTS_PRESENT',
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
          payload: InitializeStateBasePayloadType &
              Pick<DeploymentTemplateStateType, 'currentEditorTemplateData'> &
              Pick<BaseURLParams, 'envId'>
      }
    | {
          type: DeploymentTemplateActionType.INITIALIZE_TEMPLATES_WITH_DRAFT
          payload: InitializeStateBasePayloadType &
              Pick<
                  DeploymentTemplateStateType,
                  'currentEditorTemplateData' | 'draftTemplateData' | 'selectedProtectionViewTab'
              >
      }
    | {
          type: DeploymentTemplateActionType.CHART_CHANGE_SUCCESS
          payload: {
              selectedChart: DeploymentChartVersionType
              selectedChartTemplateDetails: DeploymentTemplateConfigState
              isEnvView: boolean
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
    | {
          type: DeploymentTemplateActionType.UPDATE_ARE_COMMENTS_PRESENT
          payload: Pick<DeploymentTemplateStateType, 'areCommentsPresent'>
      }

export const getDeploymentTemplateInitialState = ({
    isSuperAdmin,
}: GetDeploymentTemplateInitialStateParamsType): DeploymentTemplateStateType => ({
    isLoadingInitialData: true,
    initialLoadError: null,
    chartDetails: {
        charts: [],
        chartsMetadata: {},
        globalChartDetails: null,
        latestAppChartRef: null,
    },
    publishedTemplateData: null,
    draftTemplateData: null,
    baseDeploymentTemplateData: null,
    currentEditorTemplateData: null,
    resolveScopedVariables: false,
    isResolvingVariables: false,
    resolvedEditorTemplate: {
        originalTemplateString: '',
        templateWithoutLockedKeys: '',
    },
    resolvedOriginalTemplate: {
        originalTemplateString: '',
        templateWithoutLockedKeys: '',
    },
    resolvedPublishedTemplate: {
        originalTemplateString: '',
        templateWithoutLockedKeys: '',
    },
    wasGuiOrHideLockedKeysEdited: false,
    showDraftComments: false,
    hideLockedKeys: false,
    lockedConfigKeysWithLockType: structuredClone(DEFAULT_LOCKED_KEYS_CONFIG),
    isSaving: false,
    lockedDiffModalState: {
        showLockedDiffForApproval: false,
        showLockedTemplateDiffModal: false,
    },
    showSaveChangesModal: false,
    popupNodeType: null,
    compareFromSelectedOptionValue: CompareFromApprovalOptionsValuesType.APPROVAL_PENDING,
    dryRunEditorMode: DryRunEditorMode.VALUES_FROM_DRAFT,
    showDeleteOverrideDialog: false,
    showDeleteDraftOverrideDialog: false,
    showReadMe: false,
    editMode: isSuperAdmin ? ConfigurationType.YAML : ConfigurationType.GUI,
    configHeaderTab: ConfigHeaderTabType.VALUES,
    shouldMergeTemplateWithPatches: false,
    selectedProtectionViewTab: ProtectConfigTabsType.EDIT_DRAFT,
    isLoadingChangedChartDetails: false,
    areCommentsPresent: false,
})

const handleSwitchToYAMLMode = (state: DeploymentTemplateStateType): DeploymentTemplateStateType => {
    if (state.editMode === ConfigurationType.GUI && state.wasGuiOrHideLockedKeysEdited) {
        try {
            const editorTemplate = YAMLStringify(
                applyCompareDiffOfTempFormDataOnOriginalData(
                    YAMLStringify(state.currentEditorTemplateData.originalTemplate),
                    state.currentEditorTemplateData.editorTemplate,
                ),
                { simpleKeys: true },
            )

            return {
                ...state,
                editMode: ConfigurationType.YAML,
                currentEditorTemplateData: {
                    ...state.currentEditorTemplateData,
                    editorTemplate,
                },
            }
        } catch {
            // Do nothing
        }
    }

    return {
        ...state,
        editMode: ConfigurationType.YAML,
    }
}

const handleUnResolveScopedVariables = (): Pick<
    DeploymentTemplateStateType,
    'isResolvingVariables' | 'resolveScopedVariables'
> => ({
    isResolvingVariables: false,
    resolveScopedVariables: false,
})

const handleRestoreLastSavedTemplate = (state: DeploymentTemplateStateType): DeploymentTemplateStateType => {
    const originalTemplateData = state.currentEditorTemplateData.originalTemplateState
    const stringifiedYAML = originalTemplateData.editorTemplate

    // Since have'nt stored removed patches in global scope so had to re-calculate
    const { editorTemplate, removedPatches } = getEditorTemplateAndLockedKeys(
        stringifiedYAML,
        state.lockedConfigKeysWithLockType.config,
    )

    const currentEditorTemplateData: typeof state.currentEditorTemplateData = {
        ...originalTemplateData,
        editorTemplate: state.hideLockedKeys ? editorTemplate : stringifiedYAML,
        removedPatches: state.hideLockedKeys ? removedPatches : [],
        parsingError: '',
        originalTemplateState: originalTemplateData,
    }

    // When restoring would restore everything, including schema, readme, etc, that is why not using originalTemplate from currentEditorTemplate
    return {
        ...state,
        ...handleUnResolveScopedVariables(),
        wasGuiOrHideLockedKeysEdited: state.hideLockedKeys,
        currentEditorTemplateData,
    }
}

const handleReApplyLockedKeys = (state: DeploymentTemplateStateType): DeploymentTemplateStateType => {
    try {
        const updatedEditorValue = getCurrentTemplateWithLockedKeys({
            currentEditorTemplateData: state.currentEditorTemplateData,
            wasGuiOrHideLockedKeysEdited: state.wasGuiOrHideLockedKeysEdited,
        })

        const currentEditorTemplateData: typeof state.currentEditorTemplateData = {
            ...state.currentEditorTemplateData,
            editorTemplate: updatedEditorValue,
            removedPatches: [],
        }

        return {
            ...state,
            hideLockedKeys: false,
            currentEditorTemplateData,
        }
    } catch {
        ToastManager.showToast({
            variant: ToastVariantType.error,
            description: 'Something went wrong while re-applying locked keys',
        })

        return state
    }
}

export const deploymentTemplateReducer = (
    state: DeploymentTemplateStateType,
    action: DeploymentTemplateActionState,
): DeploymentTemplateStateType => {
    switch (action.type) {
        case DeploymentTemplateActionType.RESET_ALL:
            return getDeploymentTemplateInitialState(action.payload)

        case DeploymentTemplateActionType.INITIATE_INITIAL_DATA_LOAD:
            return {
                ...state,
                isLoadingInitialData: true,
                initialLoadError: null,
            }

        case DeploymentTemplateActionType.INITIAL_DATA_ERROR:
            return {
                ...state,
                isLoadingInitialData: false,
                initialLoadError: action.payload.error,
            }

        case DeploymentTemplateActionType.INITIALIZE_TEMPLATES_WITHOUT_DRAFT: {
            const {
                baseDeploymentTemplateData,
                publishedTemplateData,
                chartDetails,
                lockedConfigKeysWithLockType,
                currentEditorTemplateData,
                envId,
            } = action.payload

            return {
                ...state,
                baseDeploymentTemplateData,
                publishedTemplateData,
                chartDetails,
                lockedConfigKeysWithLockType,
                currentEditorTemplateData,
                configHeaderTab:
                    envId && !publishedTemplateData.isOverridden
                        ? ConfigHeaderTabType.INHERITED
                        : ConfigHeaderTabType.VALUES,
                isLoadingInitialData: false,
                initialLoadError: null,
            }
        }

        case DeploymentTemplateActionType.INITIALIZE_TEMPLATES_WITH_DRAFT: {
            const {
                baseDeploymentTemplateData,
                publishedTemplateData,
                chartDetails,
                lockedConfigKeysWithLockType,
                draftTemplateData,
                currentEditorTemplateData,
                selectedProtectionViewTab,
            } = action.payload

            return {
                ...state,
                baseDeploymentTemplateData,
                publishedTemplateData,
                chartDetails,
                lockedConfigKeysWithLockType,
                draftTemplateData,
                currentEditorTemplateData,
                configHeaderTab: ConfigHeaderTabType.VALUES,
                selectedProtectionViewTab,
                areCommentsPresent: draftTemplateData?.latestDraft?.commentsCount > 0,
                isLoadingInitialData: false,
                initialLoadError: null,
            }
        }

        case DeploymentTemplateActionType.INITIATE_CHART_CHANGE:
            return {
                ...state,
                isLoadingChangedChartDetails: true,
            }

        case DeploymentTemplateActionType.CHART_CHANGE_SUCCESS: {
            const { selectedChart, selectedChartTemplateDetails, isEnvView } = action.payload
            const { id, name, isAppMetricsSupported } = selectedChart

            // We will retain editor values in all cases except when chart type is changed
            const isChartTypeChanged = state.currentEditorTemplateData.selectedChart.name !== name
            const currentEditorTemplateData: typeof state.currentEditorTemplateData = {
                ...state.currentEditorTemplateData,
                isAppMetricsEnabled: isAppMetricsSupported
                    ? state.currentEditorTemplateData.isAppMetricsEnabled
                    : false,
                selectedChart,
                selectedChartRefId: +id,
                schema: selectedChartTemplateDetails.schema,
                readme: selectedChartTemplateDetails.readme,
                guiSchema: selectedChartTemplateDetails.guiSchema,

                ...(isEnvView
                    ? {
                          environmentConfig: selectedChartTemplateDetails.environmentConfig,
                      }
                    : {
                          chartConfig: selectedChartTemplateDetails.chartConfig,
                      }),

                ...(isChartTypeChanged && {
                    editorTemplate: selectedChartTemplateDetails.editorTemplate,
                    parsingError: '',
                    // Not resetting originalTemplate since we are not changing it
                }),
            }

            return {
                ...state,
                isLoadingChangedChartDetails: false,
                currentEditorTemplateData,
                hideLockedKeys: isChartTypeChanged ? false : state.hideLockedKeys,
                isResolvingVariables: isChartTypeChanged ? false : state.isResolvingVariables,
                resolveScopedVariables: isChartTypeChanged ? false : state.resolveScopedVariables,
            }
        }

        case DeploymentTemplateActionType.CHART_CHANGE_ERROR:
            return {
                ...state,
                isLoadingChangedChartDetails: false,
            }

        case DeploymentTemplateActionType.INITIATE_RESOLVE_SCOPED_VARIABLES:
            return {
                ...state,
                isResolvingVariables: true,
                resolveScopedVariables: true,
            }

        case DeploymentTemplateActionType.UN_RESOLVE_SCOPED_VARIABLES:
            return {
                ...state,
                ...handleUnResolveScopedVariables(),
            }

        case DeploymentTemplateActionType.RESOLVE_SCOPED_VARIABLES: {
            const { resolvedEditorTemplate, resolvedOriginalTemplate, resolvedPublishedTemplate } = action.payload

            return {
                ...state,
                isResolvingVariables: false,
                resolvedEditorTemplate,
                resolvedOriginalTemplate,
                resolvedPublishedTemplate,
            }
        }

        case DeploymentTemplateActionType.TOGGLE_DRAFT_COMMENTS:
            return {
                ...state,
                showDraftComments: !state.showDraftComments,
            }

        case DeploymentTemplateActionType.RESTORE_LAST_SAVED_TEMPLATE:
            return handleRestoreLastSavedTemplate(state)

        case DeploymentTemplateActionType.CURRENT_EDITOR_VALUE_CHANGE: {
            const wasGuiOrHideLockedKeysEdited =
                state.wasGuiOrHideLockedKeysEdited || state.editMode === ConfigurationType.GUI
            const { template } = action.payload

            const currentEditorTemplateData: typeof state.currentEditorTemplateData = {
                ...state.currentEditorTemplateData,
                editorTemplate: template,
                parsingError: '',
            }

            try {
                YAML.parse(template)
            } catch (error) {
                currentEditorTemplateData.parsingError = error.message || 'Unable to parse YAML'
            }

            return {
                ...state,
                currentEditorTemplateData,
                wasGuiOrHideLockedKeysEdited,
            }
        }

        case DeploymentTemplateActionType.UPDATE_HIDE_LOCKED_KEYS: {
            const { hideLockedKeys } = action.payload

            if (hideLockedKeys) {
                const { editorTemplate, removedPatches } = getEditorTemplateAndLockedKeys(
                    state.currentEditorTemplateData.editorTemplate,
                    state.lockedConfigKeysWithLockType.config,
                )

                const currentEditorTemplateData: typeof state.currentEditorTemplateData = {
                    ...state.currentEditorTemplateData,
                    editorTemplate,
                    removedPatches,
                }

                return {
                    ...state,
                    currentEditorTemplateData,
                    wasGuiOrHideLockedKeysEdited: true,
                    hideLockedKeys,
                }
            }

            return handleReApplyLockedKeys(state)
        }

        case DeploymentTemplateActionType.CHANGE_TO_GUI_MODE:
            return {
                ...state,
                editMode: ConfigurationType.GUI,
            }

        case DeploymentTemplateActionType.CHANGE_TO_YAML_MODE:
            return handleSwitchToYAMLMode(state)

        case DeploymentTemplateActionType.UPDATE_CONFIG_HEADER_TAB:
            return {
                ...state,
                ...handleUnResolveScopedVariables(),
                configHeaderTab: action.payload.configHeaderTab,
            }

        case DeploymentTemplateActionType.TOGGLE_SHOW_COMPARISON_WITH_MERGED_PATCHES:
            return {
                ...state,
                shouldMergeTemplateWithPatches: !state.shouldMergeTemplateWithPatches,
            }

        case DeploymentTemplateActionType.UPDATE_PROTECTION_VIEW_TAB:
            return {
                ...handleReApplyLockedKeys(state),
                ...handleUnResolveScopedVariables(),
                selectedProtectionViewTab: action.payload.selectedProtectionViewTab,
            }

        case DeploymentTemplateActionType.UPDATE_DRY_RUN_EDITOR_MODE:
            return {
                ...handleReApplyLockedKeys(state),
                ...handleUnResolveScopedVariables(),
                dryRunEditorMode: action.payload.dryRunEditorMode,
            }

        case DeploymentTemplateActionType.INITIATE_SAVE:
            return {
                ...state,
                isSaving: true,
            }

        case DeploymentTemplateActionType.SHOW_EDIT_HISTORY:
            return {
                ...state,
                popupNodeType: ConfigToolbarPopupNodeType.EDIT_HISTORY,
            }

        case DeploymentTemplateActionType.SHOW_DISCARD_DRAFT_POPUP:
            return {
                ...state,
                popupNodeType: ConfigToolbarPopupNodeType.DISCARD_DRAFT,
            }

        case DeploymentTemplateActionType.CLEAR_POPUP_NODE:
            return {
                ...state,
                popupNodeType: null,
            }

        case DeploymentTemplateActionType.UPDATE_README_MODE:
            return {
                ...handleSwitchToYAMLMode(state),
                ...handleUnResolveScopedVariables(),
                showReadMe: action.payload.showReadMe,
            }

        case DeploymentTemplateActionType.CHANGE_COMPARE_FROM_SELECTED_OPTION:
            return {
                ...state,
                ...handleUnResolveScopedVariables(),
                compareFromSelectedOptionValue: action.payload.compareFromSelectedOptionValue,
            }

        case DeploymentTemplateActionType.SHOW_LOCKED_DIFF_FOR_APPROVAL:
            return {
                ...state,
                lockedDiffModalState: {
                    showLockedDiffForApproval: true,
                    showLockedTemplateDiffModal: true,
                },
            }

        case DeploymentTemplateActionType.TOGGLE_APP_METRICS:
            return {
                ...state,
                currentEditorTemplateData: {
                    ...state.currentEditorTemplateData,
                    isAppMetricsEnabled: !state.currentEditorTemplateData.isAppMetricsEnabled,
                },
            }

        case DeploymentTemplateActionType.UPDATE_MERGE_STRATEGY:
            return {
                ...state,
                currentEditorTemplateData: {
                    ...state.currentEditorTemplateData,
                    mergeStrategy: action.payload.mergeStrategy,
                },
            }

        case DeploymentTemplateActionType.SHOW_DELETE_OVERRIDE_DIALOG:
            return {
                ...state,
                showDeleteDraftOverrideDialog: action.payload.isProtected,
                showDeleteOverrideDialog: !action.payload.isProtected,
            }

        case DeploymentTemplateActionType.DELETE_LOCAL_OVERRIDE:
            return handleRestoreLastSavedTemplate(state)

        case DeploymentTemplateActionType.OVERRIDE_TEMPLATE:
            return {
                ...state,
                currentEditorTemplateData: {
                    ...state.currentEditorTemplateData,
                    isOverridden: true,
                },
            }

        case DeploymentTemplateActionType.DELETE_OVERRIDE_CONCURRENT_PROTECTION_ERROR:
            return {
                ...state,
                showDeleteDraftOverrideDialog: true,
                showDeleteOverrideDialog: false,
            }

        case DeploymentTemplateActionType.CLOSE_DELETE_DRAFT_OVERRIDE_DIALOG:
            return {
                ...state,
                showDeleteDraftOverrideDialog: false,
            }

        case DeploymentTemplateActionType.CLOSE_OVERRIDE_DIALOG:
            return {
                ...state,
                showDeleteOverrideDialog: false,
            }

        case DeploymentTemplateActionType.SAVE_ERROR:
            return {
                ...state,
                isSaving: false,
                showSaveChangesModal: action.payload.isProtectionError ? true : state.showSaveChangesModal,
            }

        case DeploymentTemplateActionType.FINISH_SAVE:
            return {
                ...state,
                isSaving: false,
                lockedDiffModalState: {
                    showLockedTemplateDiffModal: action.payload.isLockConfigError,
                    showLockedDiffForApproval: false,
                },
            }

        case DeploymentTemplateActionType.LOCKED_CHANGES_DETECTED_ON_SAVE: {
            return {
                ...state,
                lockedDiffModalState: {
                    showLockedTemplateDiffModal: true,
                    showLockedDiffForApproval: false,
                },
            }
        }

        case DeploymentTemplateActionType.SHOW_PROTECTED_SAVE_MODAL:
            return {
                ...state,
                showSaveChangesModal: true,
            }

        case DeploymentTemplateActionType.CLOSE_SAVE_CHANGES_MODAL:
            return {
                ...state,
                showSaveChangesModal: false,
            }

        case DeploymentTemplateActionType.CLOSE_LOCKED_DIFF_MODAL:
            return {
                ...state,
                showSaveChangesModal: false,
                lockedDiffModalState: {
                    showLockedTemplateDiffModal: false,
                    showLockedDiffForApproval: false,
                },
            }

        case DeploymentTemplateActionType.UPDATE_ARE_COMMENTS_PRESENT:
            return {
                ...state,
                areCommentsPresent: action.payload.areCommentsPresent,
            }

        default:
            return state
    }
}