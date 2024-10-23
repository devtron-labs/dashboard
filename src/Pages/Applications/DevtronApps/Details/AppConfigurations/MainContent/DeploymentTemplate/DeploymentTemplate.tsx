import { useEffect, SyntheticEvent, useMemo, useReducer, Reducer, useRef } from 'react'
import ReactGA from 'react-ga4'
import {
    BaseURLParams,
    ConfigurationType,
    DeploymentChartVersionType,
    DraftState,
    showError,
    useMainContext,
    YAMLStringify,
    DeploymentTemplateConfigState,
    Progressing,
    ErrorScreenManager,
    getResolvedDeploymentTemplate,
    ModuleStatus,
    useAsync,
    ModuleNameMap,
    ToastManager,
    ToastVariantType,
    SelectPickerOptionType,
    ValuesAndManifestFlagDTO,
    CompareFromApprovalOptionsValuesType,
    noop,
    logExceptionToSentry,
    ConfigHeaderTabType,
    ProtectConfigTabsType,
    Button,
    ComponentSizeType,
    ButtonStyleType,
    ButtonVariantType,
    DryRunEditorMode,
    usePrompt,
    DEFAULT_LOCKED_KEYS_CONFIG,
    GenericEmptyState,
    GET_RESOLVED_DEPLOYMENT_TEMPLATE_EMPTY_RESPONSE,
    ResponseType,
    API_STATUS_CODES,
} from '@devtron-labs/devtron-fe-common-lib'
import { Prompt, useParams } from 'react-router-dom'
import YAML from 'yaml'
import { FloatingVariablesSuggestions, importComponentFromFELibrary } from '@Components/common'
import { getModuleInfo } from '@Components/v2/devtronStackManager/DevtronStackManager.service'
import { URLS } from '@Config/routes'
import { DEFAULT_ROUTE_PROMPT_MESSAGE } from '@Config/constants'
import { ReactComponent as ICClose } from '@Icons/ic-close.svg'
import { ReactComponent as ICInfoOutlineGrey } from '@Icons/ic-info-outline-grey.svg'
import deleteOverrideEmptyStateImage from '@Images/no-artifact@2x.png'
import {
    DeploymentTemplateProps,
    DeploymentTemplateStateType,
    GetLockConfigEligibleAndIneligibleChangesType,
    GetPublishedAndBaseDeploymentTemplateReturnType,
    HandleInitializeTemplatesWithoutDraftParamsType,
    UpdateBaseDTPayloadType,
    UpdateEnvironmentDTPayloadType,
} from './types'
import { BASE_DEPLOYMENT_TEMPLATE_ENV_ID, NO_SCOPED_VARIABLES_MESSAGE } from './constants'
import DeploymentTemplateOptionsHeader from './DeploymentTemplateOptionsHeader'
import DeploymentTemplateForm from './DeploymentTemplateForm'
import DeploymentTemplateCTA from './DeploymentTemplateCTA'
import {
    getAreTemplateChangesPresent,
    getCompareFromEditorConfig,
    getCurrentEditorPayloadForScopedVariables,
    getCurrentEditorState,
    getDeleteProtectedOverridePayload,
    getDeploymentTemplateResourceName,
    getEditorTemplateAndLockedKeys,
    getLockedDiffModalDocuments,
    getUpdateBaseDeploymentTemplatePayload,
    getUpdateEnvironmentDTPayload,
    handleInitializeDraftData,
} from './utils'
import DeleteOverrideDialog from './DeleteOverrideDialog'
import {
    updateBaseDeploymentTemplate,
    createBaseDeploymentTemplate,
    updateEnvDeploymentTemplate,
    createEnvDeploymentTemplate,
    getEnvOverrideDeploymentTemplate,
    getBaseDeploymentTemplate,
    getChartList,
} from './service'
import ConfigHeader from '../ConfigHeader'
import './DeploymentTemplate.scss'
import ConfigToolbar from '../ConfigToolbar'
import { DEFAULT_MERGE_STRATEGY } from '../constants'
import { ConfigToolbarProps, DeploymentTemplateComponentType } from '../types'
import { getConfigToolbarPopupConfig } from '../utils'
import ConfigDryRun from '../ConfigDryRun'
import NoOverrideEmptyState from '../NoOverrideEmptyState'
import CompareConfigView from '../CompareConfigView'
import NoPublishedVersionEmptyState from '../NoPublishedVersionEmptyState'
import BaseConfigurationNavigation from '../BaseConfigurationNavigation'
import {
    DeploymentTemplateActionState,
    DeploymentTemplateActionType,
    deploymentTemplateReducer,
    getDeploymentTemplateInitialState,
} from './deploymentTemplateReducer'

const getDraftByResourceName = importComponentFromFELibrary('getDraftByResourceName', null, 'function')
const getJsonPath = importComponentFromFELibrary('getJsonPath', null, 'function')
const getLockConfigEligibleAndIneligibleChanges: GetLockConfigEligibleAndIneligibleChangesType =
    importComponentFromFELibrary('getLockConfigEligibleAndIneligibleChanges', null, 'function')
const ProtectedDeploymentTemplateCTA = importComponentFromFELibrary('ProtectedDeploymentTemplateCTA', null, 'function')
const DeploymentTemplateLockedDiff = importComponentFromFELibrary('DeploymentTemplateLockedDiff')
const SaveChangesModal = importComponentFromFELibrary('SaveChangesModal')
const DraftComments = importComponentFromFELibrary('DraftComments')
const DeleteOverrideDraftModal = importComponentFromFELibrary('DeleteOverrideDraftModal')
const ProtectionViewToolbarPopupNode = importComponentFromFELibrary('ProtectionViewToolbarPopupNode', null, 'function')

const DeploymentTemplate = ({
    respondOnSuccess = noop,
    isUnSet = false,
    isCiPipeline = false,
    isProtected,
    reloadEnvironments,
    environmentName,
    clusterId,
    fetchEnvConfig,
}: DeploymentTemplateProps) => {
    // If envId is there, then it is from envOverride
    const { appId, envId } = useParams<BaseURLParams>()
    const { isSuperAdmin } = useMainContext()

    const [state, dispatch] = useReducer<Reducer<DeploymentTemplateStateType, DeploymentTemplateActionState>>(
        deploymentTemplateReducer,
        getDeploymentTemplateInitialState({ isSuperAdmin }),
    )

    const {
        chartDetails,
        lockedConfigKeysWithLockType,
        publishedTemplateData,
        draftTemplateData,
        baseDeploymentTemplateData,
        resolveScopedVariables,
        isResolvingVariables,
        resolvedEditorTemplate,
        resolvedOriginalTemplate,
        showDraftComments,
        hideLockedKeys,
        editMode,
        configHeaderTab,
        shouldMergeTemplateWithPatches,
        selectedProtectionViewTab,
        dryRunEditorMode,
        popupNodeType,
        showReadMe,
        compareFromSelectedOptionValue,
        lockedDiffModalState: { showLockedDiffForApproval, showLockedTemplateDiffModal },
        currentEditorTemplateData,
        showDeleteDraftOverrideDialog,
        showDeleteOverrideDialog,
        isSaving,
        showSaveChangesModal,
        isLoadingChangedChartDetails,
        isLoadingInitialData,
        initialLoadError,
        resolvedPublishedTemplate,
        areCommentsPresent,
        wasGuiOrHideLockedKeysEdited,
    } = state

    const manifestAbortController = useRef<AbortController>(new AbortController())
    const [, grafanaModuleStatus] = useAsync(() => getModuleInfo(ModuleNameMap.GRAFANA), [])

    const isDryRunView = configHeaderTab === ConfigHeaderTabType.DRY_RUN
    const isInheritedView = configHeaderTab === ConfigHeaderTabType.INHERITED
    const isDraftAvailable = isProtected && !!draftTemplateData?.latestDraft

    const isPublishedValuesView = !!(
        isDraftAvailable &&
        ((configHeaderTab === ConfigHeaderTabType.VALUES &&
            selectedProtectionViewTab === ProtectConfigTabsType.PUBLISHED) ||
            (isDryRunView && dryRunEditorMode === DryRunEditorMode.PUBLISHED_VALUES))
    )
    const isCompareView = !!(
        isProtected &&
        configHeaderTab === ConfigHeaderTabType.VALUES &&
        selectedProtectionViewTab === ProtectConfigTabsType.COMPARE
    )

    const isApprovalPending = isDraftAvailable && draftTemplateData.latestDraft.draftState === DraftState.AwaitApproval
    const isApprovalView =
        isApprovalPending && (isCompareView || (isDryRunView && dryRunEditorMode === DryRunEditorMode.APPROVAL_PENDING))

    const showApprovalPendingEditorInCompareView =
        isCompareView &&
        isApprovalView &&
        compareFromSelectedOptionValue === CompareFromApprovalOptionsValuesType.APPROVAL_PENDING

    const showNoOverrideTab =
        !!envId && !isDraftAvailable && !publishedTemplateData?.isOverridden && !currentEditorTemplateData?.isOverridden

    const showNoOverrideEmptyState = showNoOverrideTab && configHeaderTab === ConfigHeaderTabType.VALUES
    // TODO: After CM/CS Merge strategy is implemented, we can re-use enum
    const isDeleteOverrideDraft = !!envId && draftTemplateData?.latestDraft?.action === 3
    const showDeleteOverrideDraftEmptyState =
        isDeleteOverrideDraft &&
        configHeaderTab === ConfigHeaderTabType.VALUES &&
        selectedProtectionViewTab === ProtectConfigTabsType.EDIT_DRAFT

    const isLoadingSideEffects = isResolvingVariables || isSaving || isLoadingChangedChartDetails

    /**
     * There are two cases:
     * 1. In case of base config - Published config is the one that we are using currently and is always present (Even in zero state we are have a default saved config)
     * 2. In case of override - Published config is the one that is overridden from base config (Inherited) and is not always present
     */
    const isPublishedConfigPresent = !(envId && !publishedTemplateData?.isOverridden)

    const showNoPublishedVersionEmptyState = isPublishedValuesView && !isPublishedConfigPresent

    const isEditMode =
        configHeaderTab === ConfigHeaderTabType.VALUES &&
        (!isProtected || selectedProtectionViewTab === ProtectConfigTabsType.EDIT_DRAFT)

    const isGuiSupported = isEditMode && !showDeleteOverrideDraftEmptyState

    const baseDeploymentTemplateURL = `${URLS.APP}/${appId}/${URLS.APP_CONFIG}/${URLS.APP_DEPLOYMENT_CONFIG}`

    const hasNoGlobalConfig = !envId && !chartDetails.latestAppChartRef
    const shouldValidateLockChanges =
        !!getLockConfigEligibleAndIneligibleChanges &&
        lockedConfigKeysWithLockType.config.length > 0 &&
        !isSuperAdmin &&
        !hasNoGlobalConfig

    const disableCodeEditor = resolveScopedVariables || !isEditMode

    const isUpdateView = envId
        ? currentEditorTemplateData?.environmentConfig?.id > 0
        : !!currentEditorTemplateData?.chartConfig?.id

    const areChangesPresent: boolean = useMemo(
        () => getAreTemplateChangesPresent(state),
        [currentEditorTemplateData, wasGuiOrHideLockedKeysEdited],
    )

    usePrompt({
        shouldPrompt: areChangesPresent,
    })

    const handleUnResolveScopedVariables = () => {
        ReactGA.event({
            category: 'devtronapp-configuration-dt',
            action: 'clicked-unresolve-scoped-variable',
        })

        dispatch({
            type: DeploymentTemplateActionType.UN_RESOLVE_SCOPED_VARIABLES,
        })
    }

    const handleToggleShowTemplateMergedWithPatch = () => {
        dispatch({
            type: DeploymentTemplateActionType.TOGGLE_SHOW_COMPARISON_WITH_MERGED_PATCHES,
        })
    }

    const handleUpdateProtectedTabSelection = (tab: ProtectConfigTabsType, triggerGA: boolean = true) => {
        if (tab === selectedProtectionViewTab) {
            return
        }

        if (triggerGA && tab === ProtectConfigTabsType.COMPARE) {
            ReactGA.event({
                category: 'devtronapp-configuration-dt',
                action: 'clicked-compare',
            })
        }

        dispatch({
            type: DeploymentTemplateActionType.UPDATE_PROTECTION_VIEW_TAB,
            payload: {
                selectedProtectionViewTab: tab,
            },
        })
    }

    const handleCompareFromOptionSelection = (option: SelectPickerOptionType) => {
        dispatch({
            type: DeploymentTemplateActionType.CHANGE_COMPARE_FROM_SELECTED_OPTION,
            payload: {
                compareFromSelectedOptionValue: option.value as CompareFromApprovalOptionsValuesType,
            },
        })
    }

    const handleSetHideLockedKeys = (value: boolean) => {
        ReactGA.event({
            category: 'devtronapp-configuration-dt',
            action: value ? 'clicked-hide-locked-keys' : 'clicked-show-locked-keys',
        })

        dispatch({
            type: DeploymentTemplateActionType.UPDATE_HIDE_LOCKED_KEYS,
            payload: {
                hideLockedKeys: value,
            },
        })
    }

    const handleLoadScopedVariables = async () => {
        try {
            /**
             * This is used to fetch the unedited document to show gui view
             */
            const shouldFetchOriginalTemplate: boolean = !!isGuiSupported
            // Fetching LHS of compare view
            const shouldFetchPublishedTemplate: boolean = isPublishedConfigPresent && isCompareView

            const [currentEditorTemplate, originalTemplate, publishedTemplate] = await Promise.all([
                getResolvedDeploymentTemplate({
                    appId: +appId,
                    chartRefId: currentEditorTemplateData.selectedChartRefId,
                    values: getCurrentEditorPayloadForScopedVariables({
                        state,
                        isPublishedConfigPresent,
                        isDryRunView,
                        isDeleteOverrideDraft,
                        isInheritedView,
                        isPublishedValuesView,
                        showApprovalPendingEditorInCompareView,
                    }),
                    valuesAndManifestFlag: ValuesAndManifestFlagDTO.DEPLOYMENT_TEMPLATE,
                    ...(envId && { envId: +envId }),
                }),
                shouldFetchOriginalTemplate
                    ? getResolvedDeploymentTemplate({
                          appId: +appId,
                          chartRefId: currentEditorTemplateData.originalTemplateState.selectedChartRefId,
                          values: YAMLStringify(currentEditorTemplateData.originalTemplate, { simpleKeys: true }),
                          valuesAndManifestFlag: ValuesAndManifestFlagDTO.DEPLOYMENT_TEMPLATE,
                          ...(envId && { envId: +envId }),
                      })
                    : structuredClone(GET_RESOLVED_DEPLOYMENT_TEMPLATE_EMPTY_RESPONSE),
                shouldFetchPublishedTemplate
                    ? getResolvedDeploymentTemplate({
                          appId: +appId,
                          chartRefId: publishedTemplateData.selectedChartRefId,
                          values: publishedTemplateData.editorTemplate,
                          valuesAndManifestFlag: ValuesAndManifestFlagDTO.DEPLOYMENT_TEMPLATE,
                          ...(envId && { envId: +envId }),
                      })
                    : structuredClone(GET_RESOLVED_DEPLOYMENT_TEMPLATE_EMPTY_RESPONSE),
            ])

            const areNoVariablesPresent =
                !currentEditorTemplate.areVariablesPresent &&
                (!shouldFetchPublishedTemplate || !publishedTemplate.areVariablesPresent)

            if (areNoVariablesPresent) {
                ToastManager.showToast({
                    variant: ToastVariantType.error,
                    description: NO_SCOPED_VARIABLES_MESSAGE,
                })

                dispatch({
                    type: DeploymentTemplateActionType.UN_RESOLVE_SCOPED_VARIABLES,
                })
                return
            }

            dispatch({
                type: DeploymentTemplateActionType.RESOLVE_SCOPED_VARIABLES,
                payload: {
                    resolvedEditorTemplate: {
                        originalTemplateString: currentEditorTemplate.resolvedData,
                        templateWithoutLockedKeys: getEditorTemplateAndLockedKeys(
                            currentEditorTemplate.resolvedData,
                            lockedConfigKeysWithLockType.config,
                        ).editorTemplate,
                    },
                    resolvedOriginalTemplate: {
                        originalTemplateString: originalTemplate.resolvedData,
                        templateWithoutLockedKeys: getEditorTemplateAndLockedKeys(
                            originalTemplate.resolvedData,
                            lockedConfigKeysWithLockType.config,
                        ).editorTemplate,
                    },
                    resolvedPublishedTemplate: {
                        originalTemplateString: publishedTemplate.resolvedData,
                        templateWithoutLockedKeys: getEditorTemplateAndLockedKeys(
                            publishedTemplate.resolvedData,
                            lockedConfigKeysWithLockType.config,
                        ).editorTemplate,
                    },
                },
            })
        } catch (error) {
            showError(error)
            dispatch({
                type: DeploymentTemplateActionType.UN_RESOLVE_SCOPED_VARIABLES,
            })
        }
    }

    const handleToggleDraftComments = () => {
        dispatch({
            type: DeploymentTemplateActionType.TOGGLE_DRAFT_COMMENTS,
        })
    }

    const handleUpdateAreCommentsPresent = (value: boolean) => {
        dispatch({
            type: DeploymentTemplateActionType.UPDATE_ARE_COMMENTS_PRESENT,
            payload: {
                areCommentsPresent: value,
            },
        })
    }

    const handleResolveScopedVariables = async () => {
        ReactGA.event({
            category: 'devtronapp-configuration-dt',
            action: 'clicked-resolve-scoped-variable',
        })

        dispatch({
            type: DeploymentTemplateActionType.INITIATE_RESOLVE_SCOPED_VARIABLES,
        })
        await handleLoadScopedVariables()
    }

    const handleEditorChange = (template: string) => {
        if (disableCodeEditor) {
            return
        }

        dispatch({
            type: DeploymentTemplateActionType.CURRENT_EDITOR_VALUE_CHANGE,
            payload: { template },
        })
    }

    const handleToggleResolveScopedVariables = async () => {
        if (resolveScopedVariables) {
            handleUnResolveScopedVariables()
            return
        }

        await handleResolveScopedVariables()
    }

    const handleChangeToGUIMode = () => {
        dispatch({
            type: DeploymentTemplateActionType.CHANGE_TO_GUI_MODE,
        })
    }

    const handleChangeToYAMLMode = () => {
        dispatch({
            type: DeploymentTemplateActionType.CHANGE_TO_YAML_MODE,
        })
    }

    const handleChangeDryRunEditorMode = (mode: DryRunEditorMode) => {
        dispatch({
            type: DeploymentTemplateActionType.UPDATE_DRY_RUN_EDITOR_MODE,
            payload: {
                dryRunEditorMode: mode,
            },
        })
    }

    const handleUpdateReadmeMode = (value: boolean) => {
        dispatch({
            type: DeploymentTemplateActionType.UPDATE_README_MODE,
            payload: {
                showReadMe: value,
            },
        })
    }

    const handleEnableReadmeView = () => {
        handleUpdateReadmeMode(true)
    }

    const handleDisableReadmeView = () => {
        handleUpdateReadmeMode(false)
    }

    const handleConfigHeaderTabChange = (tab: ConfigHeaderTabType) => {
        if (configHeaderTab === tab) {
            return
        }

        if (configHeaderTab === ConfigHeaderTabType.DRY_RUN) {
            ReactGA.event({
                category: 'devtronapp-configuration-dt',
                action: 'clicked-dry-run',
            })
        }

        dispatch({
            type: DeploymentTemplateActionType.UPDATE_CONFIG_HEADER_TAB,
            payload: {
                configHeaderTab: tab,
            },
        })
    }

    const handleViewInheritedConfig = () => {
        handleConfigHeaderTabChange(ConfigHeaderTabType.INHERITED)
    }

    const getCurrentTemplateSelectedChart = (): DeploymentChartVersionType =>
        getCurrentEditorState({
            state,
            isPublishedConfigPresent,
            isDryRunView,
            isDeleteOverrideDraft,
            isInheritedView,
            isPublishedValuesView,
            showApprovalPendingEditorInCompareView,
        })?.selectedChart

    const getCurrentTemplateGUISchema = (): string => {
        if (!isGuiSupported) {
            return '{}'
        }

        return currentEditorTemplateData?.guiSchema || '{}'
    }

    const getCurrentEditorSchema = (): DeploymentTemplateConfigState['schema'] =>
        getCurrentEditorState({
            state,
            isPublishedConfigPresent,
            isDryRunView,
            isDeleteOverrideDraft,
            isInheritedView,
            isPublishedValuesView,
            showApprovalPendingEditorInCompareView,
        })?.schema

    const handleFetchGlobalDeploymentTemplate = async (
        globalChartDetails: DeploymentChartVersionType,
        lockedConfigKeys: string[] = lockedConfigKeysWithLockType.config,
    ): Promise<DeploymentTemplateConfigState> => {
        const {
            result: {
                globalConfig: {
                    defaultAppOverride,
                    id,
                    refChartTemplate,
                    refChartTemplateVersion,
                    isAppMetricsEnabled,
                    chartRefId,
                    readme,
                    schema,
                },
                guiSchema,
            },
        } = await getBaseDeploymentTemplate(+appId, +globalChartDetails.id, null, globalChartDetails.name)

        const stringifiedTemplate = YAMLStringify(defaultAppOverride, { simpleKeys: true })

        const { editorTemplate: editorTemplateWithoutLockedKeys } = getEditorTemplateAndLockedKeys(
            stringifiedTemplate,
            lockedConfigKeys,
        )

        return {
            originalTemplate: defaultAppOverride,
            schema,
            readme,
            guiSchema,
            isAppMetricsEnabled,
            chartConfig: { id, refChartTemplate, refChartTemplateVersion, chartRefId, readme },
            editorTemplate: stringifiedTemplate,
            editorTemplateWithoutLockedKeys,
            selectedChart: globalChartDetails,
            selectedChartRefId: +globalChartDetails.id,
        }
    }

    /**
     * Fetch deployment template on basis of chart id in case of base deployment template or env override
     */
    const handleFetchDeploymentTemplate = async (
        chartInfo: DeploymentChartVersionType,
        lockedConfigKeys: string[] = lockedConfigKeysWithLockType.config,
    ): Promise<DeploymentTemplateConfigState> => {
        if (!envId) {
            return handleFetchGlobalDeploymentTemplate(chartInfo, lockedConfigKeys)
        }

        const {
            result: { globalConfig, environmentConfig, guiSchema, IsOverride, schema, readme, appMetrics },
        } = await getEnvOverrideDeploymentTemplate(+appId, +envId, +chartInfo.id, chartInfo.name)

        const { id, status, manualReviewed, active, namespace, envOverrideValues } = environmentConfig || {}

        const originalTemplate = IsOverride ? envOverrideValues || globalConfig : globalConfig
        const stringifiedTemplate = YAMLStringify(originalTemplate, { simpleKeys: true })

        const { editorTemplate: editorTemplateWithoutLockedKeys } = getEditorTemplateAndLockedKeys(
            stringifiedTemplate,
            lockedConfigKeys,
        )

        return {
            originalTemplate,
            schema,
            readme,
            guiSchema,
            isAppMetricsEnabled: appMetrics,
            editorTemplate: stringifiedTemplate,
            isOverridden: !!IsOverride,
            environmentConfig: {
                id,
                status,
                manualReviewed,
                active,
                namespace,
            },
            mergeStrategy: DEFAULT_MERGE_STRATEGY,
            editorTemplateWithoutLockedKeys,
            selectedChart: chartInfo,
            selectedChartRefId: +chartInfo.id,
        }
    }

    const getPublishedAndBaseDeploymentTemplate = async (
        chartRefsData: Awaited<ReturnType<typeof getChartList>>,
        lockedConfigKeys: string[],
    ): Promise<GetPublishedAndBaseDeploymentTemplateReturnType> => {
        const shouldFetchBaseDeploymentData = !!envId
        const [templateData, baseDeploymentTemplateDataResponse] = await Promise.all([
            handleFetchDeploymentTemplate(chartRefsData.selectedChart, lockedConfigKeys),
            shouldFetchBaseDeploymentData
                ? handleFetchGlobalDeploymentTemplate(chartRefsData.globalChartDetails, lockedConfigKeys)
                : null,
        ])

        return {
            publishedTemplateState: templateData,
            baseDeploymentTemplateState: shouldFetchBaseDeploymentData
                ? baseDeploymentTemplateDataResponse
                : templateData,
        }
    }

    const handleInitializeTemplatesWithoutDraft = ({
        baseDeploymentTemplateState,
        publishedTemplateState,
        chartDetailsState,
        lockedConfigKeysWithLockTypeState,
    }: HandleInitializeTemplatesWithoutDraftParamsType) => {
        const clonedTemplateData = structuredClone(publishedTemplateState)
        delete clonedTemplateData.editorTemplateWithoutLockedKeys

        const currentEditorState: typeof currentEditorTemplateData = {
            ...clonedTemplateData,
            parsingError: '',
            removedPatches: [],
            originalTemplateState: publishedTemplateState,
        }

        dispatch({
            type: DeploymentTemplateActionType.INITIALIZE_TEMPLATES_WITHOUT_DRAFT,
            payload: {
                baseDeploymentTemplateData: baseDeploymentTemplateState,
                publishedTemplateData: publishedTemplateState,
                chartDetails: chartDetailsState,
                lockedConfigKeysWithLockType: lockedConfigKeysWithLockTypeState,
                currentEditorTemplateData: currentEditorState,
                envId,
            },
        })
    }

    const handleInitializePublishedAndCurrentEditorData = async (
        chartRefsData: Awaited<ReturnType<typeof getChartList>>,
        lockedKeysConfig: typeof lockedConfigKeysWithLockType,
    ) => {
        const { publishedTemplateState, baseDeploymentTemplateState } = await getPublishedAndBaseDeploymentTemplate(
            chartRefsData,
            lockedKeysConfig.config,
        )
        handleInitializeTemplatesWithoutDraft({
            baseDeploymentTemplateState,
            publishedTemplateState,
            chartDetailsState: {
                charts: chartRefsData.charts,
                chartsMetadata: chartRefsData.chartsMetadata,
                globalChartDetails: chartRefsData.globalChartDetails,
                latestAppChartRef: chartRefsData.latestAppChartRef,
            },
            lockedConfigKeysWithLockTypeState: lockedKeysConfig,
        })
    }

    // Should remove edit draft mode in case of error and show normal edit values view with zero drafts where user can save as draft?
    const handleLoadProtectedDeploymentTemplate = async (
        chartRefsData: Awaited<ReturnType<typeof getChartList>>,
        lockedKeysConfig: typeof lockedConfigKeysWithLockType,
    ) => {
        const [draftPromiseResponse, publishedAndBaseTemplateDataResponse] = await Promise.allSettled([
            getDraftByResourceName(
                +appId,
                +envId || BASE_DEPLOYMENT_TEMPLATE_ENV_ID,
                3,
                getDeploymentTemplateResourceName(environmentName),
            ),
            getPublishedAndBaseDeploymentTemplate(chartRefsData, lockedKeysConfig.config),
        ])

        if (publishedAndBaseTemplateDataResponse.status === 'rejected') {
            throw publishedAndBaseTemplateDataResponse.reason
        }

        const { publishedTemplateState, baseDeploymentTemplateState } = publishedAndBaseTemplateDataResponse.value

        const shouldInitializeWithoutDraft =
            draftPromiseResponse.status === 'rejected' ||
            !draftPromiseResponse.value?.result ||
            !(
                draftPromiseResponse.value.result.draftState === DraftState.Init ||
                draftPromiseResponse.value.result.draftState === DraftState.AwaitApproval
            )

        if (shouldInitializeWithoutDraft) {
            handleInitializeTemplatesWithoutDraft({
                baseDeploymentTemplateState,
                publishedTemplateState,
                chartDetailsState: {
                    charts: chartRefsData.charts,
                    chartsMetadata: chartRefsData.chartsMetadata,
                    globalChartDetails: chartRefsData.globalChartDetails,
                    latestAppChartRef: chartRefsData.latestAppChartRef,
                },
                lockedConfigKeysWithLockTypeState: lockedKeysConfig,
            })
            return
        }

        const draftResponse = draftPromiseResponse.value
        // NOTE: In case of support for version based guiSchema this won't work
        // Since we do not have guiSchema for draft, we are using published guiSchema
        const { guiSchema } = publishedTemplateState

        const latestDraft = draftResponse.result
        const draftTemplateState = handleInitializeDraftData({
            latestDraft,
            guiSchema,
            chartRefsData,
            lockedConfigKeys: lockedKeysConfig.config,
            envId,
        })

        const clonedTemplateData = structuredClone(draftTemplateState)
        delete clonedTemplateData.editorTemplateWithoutLockedKeys

        dispatch({
            type: DeploymentTemplateActionType.INITIALIZE_TEMPLATES_WITH_DRAFT,
            payload: {
                baseDeploymentTemplateData: baseDeploymentTemplateState,
                publishedTemplateData: publishedTemplateState,
                chartDetails: {
                    charts: chartRefsData.charts,
                    chartsMetadata: chartRefsData.chartsMetadata,
                    globalChartDetails: chartRefsData.globalChartDetails,
                    latestAppChartRef: chartRefsData.latestAppChartRef,
                },
                lockedConfigKeysWithLockType: lockedKeysConfig,
                draftTemplateData: draftTemplateState,
                currentEditorTemplateData: {
                    ...clonedTemplateData,
                    parsingError: '',
                    removedPatches: [],
                    originalTemplateState: draftTemplateState,
                },
                selectedProtectionViewTab:
                    draftTemplateState.latestDraft?.draftState === DraftState.AwaitApproval
                        ? ProtectConfigTabsType.COMPARE
                        : ProtectConfigTabsType.EDIT_DRAFT,
            },
        })
    }

    const handleInitialDataLoad = async () => {
        dispatch({
            type: DeploymentTemplateActionType.INITIATE_INITIAL_DATA_LOAD,
        })

        try {
            reloadEnvironments()
            const [chartRefsDataResponse, lockedKeysConfigResponse] = await Promise.allSettled([
                getChartList({ appId, envId }),
                getJsonPath ? getJsonPath(appId, envId || BASE_DEPLOYMENT_TEMPLATE_ENV_ID) : Promise.resolve(null),
            ])

            if (chartRefsDataResponse.status === 'rejected') {
                throw chartRefsDataResponse.reason
            }
            const chartRefsData = chartRefsDataResponse.value

            const isLockedConfigResponseValid =
                lockedKeysConfigResponse.status === 'fulfilled' && !!lockedKeysConfigResponse.value?.result

            const lockedKeysConfig: typeof lockedConfigKeysWithLockType = isLockedConfigResponseValid
                ? structuredClone(lockedKeysConfigResponse.value.result)
                : structuredClone(DEFAULT_LOCKED_KEYS_CONFIG)

            const shouldFetchDraftDetails = isProtected && typeof getDraftByResourceName === 'function'

            if (shouldFetchDraftDetails) {
                await handleLoadProtectedDeploymentTemplate(chartRefsData, lockedKeysConfig)
                return
            }

            await handleInitializePublishedAndCurrentEditorData(chartRefsData, lockedKeysConfig)
        } catch (error) {
            showError(error)
            dispatch({
                type: DeploymentTemplateActionType.INITIAL_DATA_ERROR,
                payload: {
                    error,
                },
            })
        }
    }

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        handleInitialDataLoad()
    }, [])

    const handleReload = async () => {
        dispatch({
            type: DeploymentTemplateActionType.RESET_ALL,
            payload: {
                isSuperAdmin,
            },
        })

        fetchEnvConfig(+envId || BASE_DEPLOYMENT_TEMPLATE_ENV_ID)
        reloadEnvironments()
        await handleInitialDataLoad()
    }

    /**
     *
     * @param skipReadmeAndSchema - true only while doing handleSave
     */
    const prepareDataToSave = (
        skipReadmeAndSchema: boolean = false,
        fromDeleteOverride: boolean = false,
    ): UpdateBaseDTPayloadType | UpdateEnvironmentDTPayloadType => {
        if (!envId) {
            return getUpdateBaseDeploymentTemplatePayload(state, +appId, skipReadmeAndSchema)
        }

        // NOTE: We don't handle lock keys in case of deletion of override
        if (fromDeleteOverride) {
            return getDeleteProtectedOverridePayload(state, +envId, skipReadmeAndSchema)
        }

        return getUpdateEnvironmentDTPayload(state, +envId, skipReadmeAndSchema)
    }

    // NOTE: This is a hack ideally BE should not even take data for this, they should only need action
    const handlePrepareDataToSaveForProtectedDeleteOverride = () => prepareDataToSave(false, true)

    /**
     * @description - This function returns a method to save deployment template which is based on whether it is base or env override
     * In case of base deployment template, it checks if it is an update or create based on chartConfig.id, if this is present then it is an update
     * In case of env override, it checks if it is an update or create based on environmentConfig.id, if this is present then it is an update
     */
    const getSaveAPIService = (): ((
        payload: ReturnType<typeof prepareDataToSave>,
        abortSignal?: AbortSignal,
    ) => Promise<ResponseType<any>>) => {
        if (!envId) {
            return isUpdateView ? updateBaseDeploymentTemplate : createBaseDeploymentTemplate
        }

        return isUpdateView
            ? updateEnvDeploymentTemplate
            : (payload, abortSignal) =>
                  createEnvDeploymentTemplate(+appId, +envId, payload as UpdateEnvironmentDTPayloadType, abortSignal)
    }

    const getSuccessToastMessage = (): string => {
        if (!envId) {
            return isUpdateView ? 'Updated' : 'Saved'
        }

        return isUpdateView ? 'Updated override' : 'Overridden'
    }

    const handleSaveTemplate = async () => {
        dispatch({
            type: DeploymentTemplateActionType.INITIATE_SAVE,
        })

        try {
            const apiService = getSaveAPIService()
            const response = await apiService(prepareDataToSave(true), null)

            const isLockConfigError = !!response?.result?.isLockConfigError

            dispatch({
                type: DeploymentTemplateActionType.FINISH_SAVE,
                payload: {
                    isLockConfigError,
                },
            })

            if (isLockConfigError) {
                return
            }

            await handleReload()
            respondOnSuccess(!isCiPipeline)
            ToastManager.showToast({
                variant: ToastVariantType.success,
                title: getSuccessToastMessage(),
                description: 'Changes will be reflected after next deployment.',
            })
        } catch (error) {
            const isProtectionError = error.code === API_STATUS_CODES.LOCKED

            showError(error)
            dispatch({
                type: DeploymentTemplateActionType.SAVE_ERROR,
                payload: {
                    isProtectionError,
                },
            })

            if (isProtectionError) {
                reloadEnvironments()
            }
        }
    }

    const handleTriggerSave = async (e: SyntheticEvent) => {
        e.preventDefault()

        ReactGA.event({
            category: 'devtronapp-configuration-dt',
            action: editMode === ConfigurationType.GUI ? 'clicked-saved-via-gui' : 'clicked-saved-via-yaml',
        })

        if (shouldValidateLockChanges) {
            const { ineligibleChanges } = getLockConfigEligibleAndIneligibleChanges({
                documents: getLockedDiffModalDocuments(false, state),
                lockedConfigKeysWithLockType,
            })

            if (Object.keys(ineligibleChanges || {}).length) {
                dispatch({
                    type: DeploymentTemplateActionType.LOCKED_CHANGES_DETECTED_ON_SAVE,
                })

                return
            }
        }

        if (isProtected) {
            dispatch({
                type: DeploymentTemplateActionType.SHOW_PROTECTED_SAVE_MODAL,
            })

            return
        }

        await handleSaveTemplate()
    }

    const handleTriggerSaveFromLockedModal = async () => {
        if (isProtected) {
            dispatch({
                type: DeploymentTemplateActionType.SHOW_PROTECTED_SAVE_MODAL,
            })

            return
        }

        await handleSaveTemplate()
    }

    /**
     * If true, it is valid, else would show locked diff modal
     */
    const handleValidateApprovalState = (): boolean => {
        if (shouldValidateLockChanges) {
            // We are going to test the draftData not the current edited data and for this the computation has already been done
            // TODO: Test concurrent behavior for api validation
            const { ineligibleChanges } = getLockConfigEligibleAndIneligibleChanges({
                documents: getLockedDiffModalDocuments(true, state),
                lockedConfigKeysWithLockType,
            })

            if (Object.keys(ineligibleChanges || {}).length) {
                dispatch({
                    type: DeploymentTemplateActionType.SHOW_LOCKED_DIFF_FOR_APPROVAL,
                })

                return false
            }
        }

        return true
    }

    const restoreLastSavedTemplate = () => {
        dispatch({
            type: DeploymentTemplateActionType.RESTORE_LAST_SAVED_TEMPLATE,
        })
    }

    const handleChartChange = async (selectedChart: DeploymentChartVersionType) => {
        dispatch({
            type: DeploymentTemplateActionType.INITIATE_CHART_CHANGE,
        })

        try {
            const selectedChartTemplateDetails = await handleFetchDeploymentTemplate(selectedChart)
            dispatch({
                type: DeploymentTemplateActionType.CHART_CHANGE_SUCCESS,
                payload: {
                    selectedChart,
                    selectedChartTemplateDetails,
                    isEnvView: !!envId,
                },
            })
        } catch (error) {
            showError(error)
            dispatch({
                type: DeploymentTemplateActionType.CHART_CHANGE_ERROR,
            })
        }
    }

    const handleCloseLockedDiffModal = () => {
        dispatch({
            type: DeploymentTemplateActionType.CLOSE_LOCKED_DIFF_MODAL,
        })
    }

    const handleCloseSaveChangesModal = () => {
        dispatch({
            type: DeploymentTemplateActionType.CLOSE_SAVE_CHANGES_MODAL,
        })
    }

    const handleAppMetricsToggle = () => {
        dispatch({
            type: DeploymentTemplateActionType.TOGGLE_APP_METRICS,
        })
    }

    const getCurrentEditorValue = (): string => {
        if (resolveScopedVariables) {
            return hideLockedKeys
                ? resolvedEditorTemplate.templateWithoutLockedKeys
                : resolvedEditorTemplate.originalTemplateString
        }

        const currentTemplateState = getCurrentEditorState({
            state,
            isPublishedConfigPresent,
            isDryRunView,
            isDeleteOverrideDraft,
            isInheritedView,
            isPublishedValuesView,
            showApprovalPendingEditorInCompareView,
        })

        if (!currentTemplateState) {
            return ''
        }

        if ((currentTemplateState as typeof currentEditorTemplateData).originalTemplateState) {
            return currentTemplateState.editorTemplate
        }

        return hideLockedKeys
            ? (currentTemplateState as DeploymentTemplateConfigState).editorTemplateWithoutLockedKeys
            : currentTemplateState.editorTemplate
    }

    /**
     * We need to feed uneditedDocument to render GUIView
     */
    const getUneditedDocument = (): string => {
        if (!isGuiSupported) {
            return '{}'
        }

        if (resolveScopedVariables && resolvedOriginalTemplate) {
            return resolvedOriginalTemplate.originalTemplateString
        }

        // Question: No need to handle other modes as we are not going to show GUIView in those cases or should we? since we have a common method?
        if (currentEditorTemplateData) {
            return YAMLStringify(currentEditorTemplateData.originalTemplate, { simpleKeys: true })
        }

        return ''
    }

    const handleCloseDeleteOverrideDialog = () => {
        dispatch({
            type: DeploymentTemplateActionType.CLOSE_OVERRIDE_DIALOG,
        })
    }

    const handleDeleteOverrideProtectionError = () => {
        dispatch({
            type: DeploymentTemplateActionType.DELETE_OVERRIDE_CONCURRENT_PROTECTION_ERROR,
        })
    }

    const handleToggleDeleteDraftOverrideDialog = () => {
        dispatch({
            type: DeploymentTemplateActionType.CLOSE_DELETE_DRAFT_OVERRIDE_DIALOG,
        })
    }

    const handleOverride = () => {
        if (!envId) {
            logExceptionToSentry(new Error('Trying to access override without envId in DeploymentTemplate'))
            return
        }

        if (currentEditorTemplateData.originalTemplateState.isOverridden) {
            ReactGA.event({
                category: 'devtronapp-configuration-dt',
                action: 'clicked-delete-override',
            })

            dispatch({
                type: DeploymentTemplateActionType.SHOW_DELETE_OVERRIDE_DIALOG,
                payload: {
                    isProtected,
                },
            })
            return
        }

        if (currentEditorTemplateData.isOverridden) {
            dispatch({
                type: DeploymentTemplateActionType.DELETE_LOCAL_OVERRIDE,
            })
            return
        }

        dispatch({
            type: DeploymentTemplateActionType.OVERRIDE_TEMPLATE,
        })
    }

    const handleCreateOverrideFromNoOverrideEmptyState = () => {
        ReactGA.event({
            category: 'devtronapp-configuration-dt',
            action: 'clicked-create-override-button',
        })
        handleOverride()
    }

    const getCompareViewPublishedTemplate = (): string => {
        if (!isPublishedConfigPresent) {
            return ''
        }

        if (resolveScopedVariables) {
            return hideLockedKeys
                ? resolvedPublishedTemplate.templateWithoutLockedKeys
                : resolvedPublishedTemplate.originalTemplateString
        }

        return hideLockedKeys
            ? publishedTemplateData.editorTemplateWithoutLockedKeys
            : publishedTemplateData.editorTemplate
    }

    // NOTE: Need to implement when we have support for merge patches
    const getShouldShowMergePatchesButton = (): boolean => false

    const handleMergeStrategyChange: ConfigToolbarProps['handleMergeStrategyChange'] = (mergeStrategy) => {
        ReactGA.event({
            category: 'devtronapp-configuration-dt',
            action: 'clicked-merge-strategy-dropdown',
        })

        dispatch({
            type: DeploymentTemplateActionType.UPDATE_MERGE_STRATEGY,
            payload: {
                mergeStrategy,
            },
        })
    }

    const handleOpenDiscardDraftPopup = () => {
        dispatch({
            type: DeploymentTemplateActionType.SHOW_DISCARD_DRAFT_POPUP,
        })
    }

    const handleShowEditHistory = () => {
        dispatch({
            type: DeploymentTemplateActionType.SHOW_EDIT_HISTORY,
        })
    }

    const handleClearPopupNode = () => {
        dispatch({
            type: DeploymentTemplateActionType.CLEAR_POPUP_NODE,
        })
    }

    const getIsAppMetricsEnabledForCTA = (): boolean =>
        !!getCurrentEditorState({
            state,
            isPublishedConfigPresent,
            isDryRunView,
            isDeleteOverrideDraft,
            isInheritedView,
            isPublishedValuesView,
            showApprovalPendingEditorInCompareView,
        })?.isAppMetricsEnabled

    const toolbarPopupConfig: ConfigToolbarProps['popupConfig'] = {
        menuConfig: getConfigToolbarPopupConfig({
            lockedConfigData: {
                areLockedKeysPresent: lockedConfigKeysWithLockType.config.length > 0,
                hideLockedKeys,
                handleSetHideLockedKeys,
            },
            configHeaderTab,
            isOverridden: publishedTemplateData?.isOverridden,
            isPublishedValuesView,
            isPublishedConfigPresent,
            handleDeleteOverride: handleOverride,
            unableToParseData: !!currentEditorTemplateData?.parsingError,
            isLoading: isLoadingSideEffects,
            isDraftAvailable,
            handleDiscardDraft: handleOpenDiscardDraftPopup,
            handleShowEditHistory,
            showDeleteOverrideDraftEmptyState,
            isProtected,
            isDeleteOverrideDraftPresent: isDeleteOverrideDraft,
        }),
        popupNodeType,
        popupMenuNode: ProtectionViewToolbarPopupNode ? (
            <ProtectionViewToolbarPopupNode
                popupNodeType={popupNodeType}
                handleClearPopupNode={handleClearPopupNode}
                draftId={draftTemplateData?.latestDraft?.draftId}
                draftVersionId={draftTemplateData?.latestDraft?.draftVersionId}
                handleReload={handleReload}
            />
        ) : null,
    }

    const renderEditorComponent = () => {
        if (isResolvingVariables || isLoadingChangedChartDetails) {
            return (
                <div className="flex h-100 dc__overflow-scroll">
                    <Progressing pageLoader />
                </div>
            )
        }

        if (showDeleteOverrideDraftEmptyState) {
            return (
                <GenericEmptyState
                    image={deleteOverrideEmptyStateImage}
                    title="Delete override requested"
                    subTitle="This override will be deleted on approval"
                />
            )
        }

        if (showNoOverrideEmptyState) {
            return (
                <NoOverrideEmptyState
                    componentType={DeploymentTemplateComponentType.DEPLOYMENT_TEMPLATE}
                    environmentName={environmentName}
                    handleCreateOverride={handleCreateOverrideFromNoOverrideEmptyState}
                    handleViewInheritedConfig={handleViewInheritedConfig}
                />
            )
        }

        if (isCompareView) {
            return (
                <CompareConfigView
                    className="dc__overflow-scroll"
                    compareFromSelectedOptionValue={compareFromSelectedOptionValue}
                    handleCompareFromOptionSelection={handleCompareFromOptionSelection}
                    isApprovalView={isApprovalView}
                    currentEditorTemplate={YAML.parse(getCurrentEditorValue())}
                    publishedEditorTemplate={YAML.parse(getCompareViewPublishedTemplate())}
                    selectedChartVersion={
                        showDeleteOverrideDraftEmptyState ? '' : currentEditorTemplateData?.selectedChart?.version
                    }
                    draftChartVersion={draftTemplateData?.selectedChart?.version}
                    isDeleteOverrideView={isDeleteOverrideDraft}
                    editorKey={`${compareFromSelectedOptionValue || 'compare'}-draft-editor-key-${Number(!!hideLockedKeys)}`}
                    {...getCompareFromEditorConfig({
                        envId,
                        isDeleteOverrideDraft,
                        isPublishedConfigPresent,
                        showApprovalPendingEditorInCompareView,
                        state,
                    })}
                />
            )
        }

        if (configHeaderTab === ConfigHeaderTabType.DRY_RUN) {
            return (
                <ConfigDryRun
                    showManifest
                    isLoading={isLoadingSideEffects}
                    handleToggleResolveScopedVariables={handleToggleResolveScopedVariables}
                    resolveScopedVariables={resolveScopedVariables}
                    editorTemplate={getCurrentEditorValue()}
                    chartRefId={getCurrentTemplateSelectedChart()?.id ? +getCurrentTemplateSelectedChart().id : null}
                    editorSchema={getCurrentEditorSchema()}
                    dryRunEditorMode={dryRunEditorMode}
                    handleChangeDryRunEditorMode={handleChangeDryRunEditorMode}
                    isDraftPresent={isDraftAvailable}
                    isApprovalPending={isApprovalPending}
                    isPublishedConfigPresent={isPublishedConfigPresent}
                    manifestAbortController={manifestAbortController}
                />
            )
        }

        if (showNoPublishedVersionEmptyState) {
            return <NoPublishedVersionEmptyState />
        }

        return (
            <DeploymentTemplateForm
                editMode={editMode}
                hideLockedKeys={hideLockedKeys}
                lockedConfigKeysWithLockType={lockedConfigKeysWithLockType}
                readOnly={disableCodeEditor}
                selectedChart={getCurrentTemplateSelectedChart()}
                guiSchema={getCurrentTemplateGUISchema()}
                schema={getCurrentEditorSchema()}
                isUnSet={isUnSet}
                handleChangeToYAMLMode={handleChangeToYAMLMode}
                editorOnChange={handleEditorChange}
                editedDocument={getCurrentEditorValue()}
                uneditedDocument={getUneditedDocument()}
                showReadMe={showReadMe}
                readMe={currentEditorTemplateData?.readme}
                environmentName={environmentName}
                latestDraft={draftTemplateData?.latestDraft}
                isGuiSupported={isGuiSupported}
            />
        )
    }

    const renderCTA = () => {
        const selectedChart = getCurrentTemplateSelectedChart()
        const shouldRenderCTA =
            isEditMode ||
            isApprovalView ||
            (isDryRunView && dryRunEditorMode === DryRunEditorMode.VALUES_FROM_DRAFT && !isDeleteOverrideDraft)

        if (!selectedChart || showNoOverrideTab || showDeleteOverrideDraftEmptyState || !shouldRenderCTA) {
            return null
        }

        const showApplicationMetrics =
            !!chartDetails?.charts?.length &&
            window._env_.APPLICATION_METRICS_ENABLED &&
            grafanaModuleStatus?.result?.status === ModuleStatus.INSTALLED &&
            !isCompareView

        const isAppMetricsEnabled = getIsAppMetricsEnabledForCTA()

        const isDisabled = isLoadingSideEffects || resolveScopedVariables || !!currentEditorTemplateData.parsingError

        if (isProtected && ProtectedDeploymentTemplateCTA) {
            return (
                <ProtectedDeploymentTemplateCTA
                    isPublishedView={isPublishedValuesView}
                    isAppMetricsEnabled={isAppMetricsEnabled}
                    showApplicationMetrics={showApplicationMetrics}
                    toggleAppMetrics={handleAppMetricsToggle}
                    isLoading={isLoadingSideEffects}
                    selectedChart={selectedChart}
                    isDisabled={isDisabled}
                    latestDraft={draftTemplateData?.latestDraft}
                    isCiPipeline={isCiPipeline}
                    handleTriggerSaveDraft={handleTriggerSave}
                    validateApprovalState={handleValidateApprovalState}
                    handleReload={handleReload}
                    showApproveButton={isApprovalView}
                    parsingError={currentEditorTemplateData?.parsingError}
                    restoreLastSavedYAML={restoreLastSavedTemplate}
                    isDryRunView={isDryRunView}
                />
            )
        }

        if (!currentEditorTemplateData) {
            return null
        }

        return (
            <DeploymentTemplateCTA
                isLoading={isLoadingSideEffects}
                isDisabled={isDisabled}
                isAppMetricsEnabled={isAppMetricsEnabled}
                showApplicationMetrics={showApplicationMetrics}
                toggleAppMetrics={handleAppMetricsToggle}
                selectedChart={selectedChart}
                isCiPipeline={isCiPipeline}
                handleSave={handleTriggerSave}
                parsingError={currentEditorTemplateData.parsingError}
                restoreLastSavedYAML={restoreLastSavedTemplate}
                isDryRunView={isDryRunView}
            />
        )
    }

    const renderInheritedViewFooter = () => {
        if (!window._env_.APPLICATION_METRICS_ENABLED) {
            return null
        }

        return (
            <div className="flexbox dc__gap-6 dc__align-items-center dc__border-top-n1 bc-n50 py-6 px-10">
                <ICInfoOutlineGrey className="flex icon-dim-16 p-2 dc__no-shrink" />
                <div className="flexbox">
                    <span className="cn-8 fs-12 fw-4 lh-20 dc__truncate">
                        Application metrics is {!baseDeploymentTemplateData?.isAppMetricsEnabled ? 'not' : ''} enabled
                        in
                    </span>
                    &nbsp;
                    <BaseConfigurationNavigation baseConfigurationURL={baseDeploymentTemplateURL} />
                </div>
            </div>
        )
    }

    const renderValuesView = () => (
        <div className="flexbox-col flex-grow-1 dc__overflow-scroll">
            {window._env_.ENABLE_SCOPED_VARIABLES && (
                <div className="app-config-variable-widget-position">
                    <FloatingVariablesSuggestions
                        zIndex={100}
                        appId={appId}
                        hideObjectVariables={false}
                        {...(envId && { envId })}
                        {...(clusterId && { clusterId })}
                    />
                </div>
            )}

            {renderEditorComponent()}
            {isInheritedView ? renderInheritedViewFooter() : renderCTA()}
        </div>
    )

    const renderHeader = () => {
        if (showReadMe) {
            return (
                <div className="flexbox dc__align-items-center dc__gap-8 px-12 py-6 dc__border-bottom">
                    <Button
                        icon={<ICClose />}
                        onClick={handleDisableReadmeView}
                        dataTestId="close-readme-view-btn"
                        size={ComponentSizeType.xs}
                        style={ButtonStyleType.negativeGrey}
                        variant={ButtonVariantType.borderLess}
                        ariaLabel="Close Readme"
                        showAriaLabelInTippy={false}
                    />
                    <span className="cn-9 fs-13 fw-6 lh-20">Readme</span>
                </div>
            )
        }

        return (
            <>
                <ConfigHeader
                    configHeaderTab={configHeaderTab}
                    handleTabChange={handleConfigHeaderTabChange}
                    isDisabled={!!currentEditorTemplateData?.parsingError}
                    areChangesPresent={areChangesPresent}
                    isOverridable={!!envId}
                    showNoOverride={showNoOverrideTab}
                    parsingError={currentEditorTemplateData?.parsingError}
                    restoreLastSavedYAML={restoreLastSavedTemplate}
                />

                {!showNoOverrideEmptyState && (
                    <ConfigToolbar
                        baseConfigurationURL={baseDeploymentTemplateURL}
                        selectedProtectionViewTab={selectedProtectionViewTab}
                        handleProtectionViewTabChange={handleUpdateProtectedTabSelection}
                        handleToggleCommentsView={handleToggleDraftComments}
                        areCommentsPresent={areCommentsPresent}
                        showMergePatchesButton={getShouldShowMergePatchesButton()}
                        shouldMergeTemplateWithPatches={shouldMergeTemplateWithPatches}
                        handleToggleShowTemplateMergedWithPatch={handleToggleShowTemplateMergedWithPatch}
                        mergeStrategy={currentEditorTemplateData?.mergeStrategy}
                        handleMergeStrategyChange={handleMergeStrategyChange}
                        handleEnableReadmeView={handleEnableReadmeView}
                        popupConfig={toolbarPopupConfig}
                        handleToggleScopedVariablesView={handleToggleResolveScopedVariables}
                        resolveScopedVariables={resolveScopedVariables}
                        disableAllActions={isLoadingSideEffects}
                        parsingError={currentEditorTemplateData?.parsingError}
                        configHeaderTab={configHeaderTab}
                        isProtected={isProtected}
                        isApprovalPending={isApprovalPending}
                        isDraftPresent={isDraftAvailable}
                        approvalUsers={draftTemplateData?.latestDraft?.approvers}
                        isPublishedConfigPresent={isPublishedConfigPresent}
                        restoreLastSavedYAML={restoreLastSavedTemplate}
                        showEnableReadMeButton={isEditMode}
                        showDeleteOverrideDraftEmptyState={showDeleteOverrideDraftEmptyState}
                    >
                        {!showNoPublishedVersionEmptyState && (
                            <DeploymentTemplateOptionsHeader
                                disableVersionSelect={
                                    resolveScopedVariables ||
                                    isPublishedValuesView ||
                                    isInheritedView ||
                                    isLoadingSideEffects ||
                                    !!currentEditorTemplateData?.parsingError
                                }
                                editMode={editMode}
                                showReadMe={showReadMe}
                                isUnSet={isUnSet}
                                isCompareView={isCompareView}
                                handleChangeToGUIMode={handleChangeToGUIMode}
                                handleChangeToYAMLMode={handleChangeToYAMLMode}
                                parsingError={currentEditorTemplateData?.parsingError}
                                restoreLastSavedTemplate={restoreLastSavedTemplate}
                                handleChartChange={handleChartChange}
                                chartDetails={chartDetails}
                                selectedChart={getCurrentTemplateSelectedChart()}
                                isGuiSupported={isGuiSupported}
                                areChartsLoading={false}
                                showDeleteOverrideDraftEmptyState={showDeleteOverrideDraftEmptyState}
                            />
                        )}
                    </ConfigToolbar>
                )}
            </>
        )
    }

    const renderBody = () => (
        <>
            {renderHeader()}
            {renderValuesView()}
        </>
    )

    const renderDeploymentTemplate = () => {
        if (isLoadingInitialData) {
            return <Progressing pageLoader />
        }

        if (initialLoadError) {
            return <ErrorScreenManager code={initialLoadError.code} reload={handleReload} />
        }

        return (
            <div className="dc__border br-4 m-8 flexbox-col dc__content-space flex-grow-1 dc__overflow-scroll bcn-0">
                {renderBody()}

                {showDeleteOverrideDialog && (
                    <DeleteOverrideDialog
                        environmentConfigId={currentEditorTemplateData?.environmentConfig?.id}
                        handleReload={handleReload}
                        handleClose={handleCloseDeleteOverrideDialog}
                        handleProtectionError={handleDeleteOverrideProtectionError}
                        reloadEnvironments={reloadEnvironments}
                    />
                )}

                {DeleteOverrideDraftModal && showDeleteDraftOverrideDialog && (
                    <DeleteOverrideDraftModal
                        appId={Number(appId)}
                        envId={Number(envId)}
                        resourceType={3}
                        resourceName={getDeploymentTemplateResourceName(environmentName)}
                        prepareDataToSave={handlePrepareDataToSaveForProtectedDeleteOverride}
                        // TODO: Should rename it to handleClose after merging cm/cs
                        toggleModal={handleToggleDeleteDraftOverrideDialog}
                        latestDraft={draftTemplateData?.latestDraft}
                        reload={handleReload}
                    />
                )}

                {DeploymentTemplateLockedDiff && showLockedTemplateDiffModal && (
                    <DeploymentTemplateLockedDiff
                        closeModal={handleCloseLockedDiffModal}
                        showLockedDiffForApproval={showLockedDiffForApproval}
                        onSave={handleTriggerSaveFromLockedModal}
                        isSaving={isSaving}
                        documents={getLockedDiffModalDocuments(isApprovalView, state)}
                        appId={appId}
                        envId={+envId || BASE_DEPLOYMENT_TEMPLATE_ENV_ID}
                    />
                )}

                {SaveChangesModal && showSaveChangesModal && (
                    <SaveChangesModal
                        appId={Number(appId)}
                        envId={+envId || BASE_DEPLOYMENT_TEMPLATE_ENV_ID}
                        resourceType={3}
                        resourceName={getDeploymentTemplateResourceName(environmentName)}
                        prepareDataToSave={prepareDataToSave}
                        toggleModal={handleCloseSaveChangesModal}
                        latestDraft={draftTemplateData?.latestDraft}
                        reload={handleReload}
                        showAsModal={!showLockedTemplateDiffModal}
                        saveEligibleChangesCb={showLockedTemplateDiffModal}
                    />
                )}
            </div>
        )
    }

    return (
        <>
            <div
                className={`h-100 dc__window-bg ${showDraftComments ? 'deployment-template__comments-view' : 'flexbox'}`}
            >
                {renderDeploymentTemplate()}

                {DraftComments && showDraftComments && (
                    <DraftComments
                        draftId={draftTemplateData?.latestDraft?.draftId}
                        draftVersionId={draftTemplateData?.latestDraft?.draftVersionId}
                        toggleDraftComments={handleToggleDraftComments}
                        handleUpdateAreCommentsPresent={handleUpdateAreCommentsPresent}
                    />
                )}
            </div>

            <Prompt when={areChangesPresent} message={DEFAULT_ROUTE_PROMPT_MESSAGE} />
        </>
    )
}

export default DeploymentTemplate