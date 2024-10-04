import {
    applyCompareDiffOnUneditedDocument,
    CompareFromApprovalOptionsValuesType,
    CONFIG_HEADER_TAB_VALUES,
    ConfigurationType,
    DryRunEditorMode,
    getGuiSchemaFromChartName,
    ProtectConfigTabsType,
    ResponseType,
    YAMLStringify,
    DEFAULT_LOCKED_KEYS_CONFIG,
    ToastVariantType,
    ToastManager,
    logExceptionToSentry,
    ConfigToolbarPopupNodeType,
} from '@devtron-labs/devtron-fe-common-lib'
import { importComponentFromFELibrary } from '@Components/common'
import YAML from 'yaml'
import {
    DeploymentTemplateActionState,
    DeploymentTemplateActionType,
    DeploymentTemplateEditorDataStateType,
    DeploymentTemplateStateType,
    GetDeploymentTemplateInitialStateParamsType,
} from './types'
import { PROTECT_BASE_DEPLOYMENT_TEMPLATE_IDENTIFIER_DTO } from './constants'

const removeLockedKeysFromYaml = importComponentFromFELibrary('removeLockedKeysFromYaml', null, 'function')
const reapplyRemovedLockedKeysToYaml = importComponentFromFELibrary('reapplyRemovedLockedKeysToYaml', null, 'function')

export const makeObjectFromJsonPathArray = (index: number, paths: string[]) => {
    if (index >= paths.length) {
        return {
            'ui:widget': 'hidden',
        }
    }
    if (paths[index] === '$') {
        return makeObjectFromJsonPathArray(index + 1, paths)
    }
    const key = paths[index]
    const isKeyNumber = !Number.isNaN(Number(key))
    if (isKeyNumber) {
        return { items: makeObjectFromJsonPathArray(index + 1, paths) }
    }
    return { [key]: makeObjectFromJsonPathArray(index + 1, paths) }
}

/**
 * This method will compare and calculate the diffs between @unedited and @edited
 * documents and apply these diffs onto the @unedited document and return this new document
 * @param {string} unedited - The unedited document onto which we want to patch the changes from @edited
 * @param {string} edited - The edited document whose changes we want to patch onto @unedited
 */
export const applyCompareDiffOfTempFormDataOnOriginalData = (
    unedited: string,
    edited: string,
    updateTempFormData?: (data: string) => void,
) => {
    const updated = applyCompareDiffOnUneditedDocument(YAML.parse(unedited), YAML.parse(edited))
    updateTempFormData?.(YAMLStringify(updated, { simpleKeys: true }))
    return updated
}

export const addGUISchemaIfAbsent = (response: ResponseType, chartName: string) => {
    if (response && response.result && !response.result.guiSchema) {
        return {
            ...response,
            result: {
                ...response.result,
                guiSchema: JSON.stringify(getGuiSchemaFromChartName(chartName)),
            },
        }
    }
    return response
}

export const getEditorTemplateAndLockedKeys = (
    template: string,
    lockedConfigKeys: string[],
): Pick<DeploymentTemplateEditorDataStateType, 'editorTemplate' | 'removedPatches'> => {
    const removedPatches: DeploymentTemplateEditorDataStateType['removedPatches'] = []

    if (!removeLockedKeysFromYaml || !lockedConfigKeys.length) {
        return { editorTemplate: template, removedPatches }
    }

    try {
        const { document, addOperations } = removeLockedKeysFromYaml(template, lockedConfigKeys)
        if (addOperations.length) {
            removedPatches.push(...addOperations)
        }

        const updatedTemplate = YAMLStringify(document, {
            simpleKeys: true,
        })
        return { editorTemplate: updatedTemplate, removedPatches }
    } catch {
        return { editorTemplate: template, removedPatches: [] }
    }
}

export const getCurrentTemplateWithLockedKeys = ({
    currentEditorTemplateData,
    wasGuiOrHideLockedKeysEdited,
}: Pick<DeploymentTemplateStateType, 'currentEditorTemplateData' | 'wasGuiOrHideLockedKeysEdited'>): string => {
    if (!currentEditorTemplateData.removedPatches.length || !reapplyRemovedLockedKeysToYaml) {
        return currentEditorTemplateData.editorTemplate
    }

    try {
        const originalDocument = currentEditorTemplateData.originalTemplate
        const parsedDocument = YAML.parse(currentEditorTemplateData.editorTemplate)

        const updatedEditorObject = reapplyRemovedLockedKeysToYaml(
            parsedDocument,
            currentEditorTemplateData.removedPatches,
        )

        if (wasGuiOrHideLockedKeysEdited) {
            return YAMLStringify(applyCompareDiffOnUneditedDocument(originalDocument, updatedEditorObject), {
                simpleKeys: true,
            })
        }
        return YAMLStringify(updatedEditorObject, { simpleKeys: true })
    } catch {
        ToastManager.showToast({
            variant: ToastVariantType.error,
            description: 'Something went wrong while parsing locked keys',
        })
    }

    return currentEditorTemplateData.editorTemplate
}

export const getDeploymentTemplateInitialState = ({
    isSuperAdmin,
    isEnvView,
}: GetDeploymentTemplateInitialStateParamsType): DeploymentTemplateStateType => ({
    isLoadingInitialData: true,
    initialLoadError: null,
    chartDetails: {
        charts: [],
        chartsMetadata: {},
        globalChartDetails: null,
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
    compareFromSelectedOptionValue: CompareFromApprovalOptionsValuesType.VALUES_FROM_DRAFT,
    dryRunEditorMode: DryRunEditorMode.VALUES_FROM_DRAFT,
    showDeleteOverrideDialog: false,
    showDeleteDraftOverrideDialog: false,
    showReadMe: false,
    editMode: isSuperAdmin ? ConfigurationType.YAML : ConfigurationType.GUI,
    configHeaderTab: isEnvView
        ? CONFIG_HEADER_TAB_VALUES.OVERRIDE[0]
        : CONFIG_HEADER_TAB_VALUES.BASE_DEPLOYMENT_TEMPLATE[0],
    shouldMergeTemplateWithPatches: false,
    selectedProtectionViewTab: ProtectConfigTabsType.EDIT_DRAFT,
    isLoadingChangedChartDetails: false,
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

// TODO: Return type
// TODO: Check if needs try catch
export const getLockedDiffModalDocuments = (isApprovalView: boolean, state: DeploymentTemplateStateType) => ({
    unedited: state.publishedTemplateData.originalTemplate,
    edited: isApprovalView
        ? state.draftTemplateData.originalTemplate
        : YAML.parse(
              getCurrentTemplateWithLockedKeys({
                  currentEditorTemplateData: state.currentEditorTemplateData,
                  wasGuiOrHideLockedKeysEdited: state.wasGuiOrHideLockedKeysEdited,
              }),
          ),
})

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
            } = action.payload

            return {
                ...state,
                baseDeploymentTemplateData,
                publishedTemplateData,
                chartDetails,
                lockedConfigKeysWithLockType,
                currentEditorTemplateData,
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
                configHeaderTab,
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
                configHeaderTab,
                selectedProtectionViewTab,
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
            const { selectedChart, selectedChartTemplateDetails } = action.payload
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
            if (!reapplyRemovedLockedKeysToYaml) {
                logExceptionToSentry(
                    new Error(
                        `reapplyRemovedLockedKeysToYaml is not available inside ${DeploymentTemplateActionType.UPDATE_HIDE_LOCKED_KEYS} action`,
                    ),
                )
                return state
            }

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
                    hideLockedKeys,
                    currentEditorTemplateData,
                }
            } catch {
                ToastManager.showToast({
                    variant: ToastVariantType.error,
                    description: 'Something went wrong while parsing locked keys',
                })

                return state
            }
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
                ...state,
                ...handleUnResolveScopedVariables(),
                selectedProtectionViewTab: action.payload.selectedProtectionViewTab,
            }

        case DeploymentTemplateActionType.UPDATE_DRY_RUN_EDITOR_MODE:
            return {
                ...state,
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
                lockedDiffModalState: {
                    showLockedTemplateDiffModal: false,
                    showLockedDiffForApproval: false,
                },
            }

        default:
            return state
    }
}

export const getDeploymentTemplateResourceName = (environmentName: string): string => {
    if (environmentName) {
        return `${environmentName}-DeploymentTemplateOverride`
    }

    return PROTECT_BASE_DEPLOYMENT_TEMPLATE_IDENTIFIER_DTO
}
