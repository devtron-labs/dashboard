import { useEffect, SyntheticEvent, useMemo, useReducer, Reducer } from 'react'
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
    DraftMetadataDTO,
    DEFAULT_LOCKED_KEYS_CONFIG,
} from '@devtron-labs/devtron-fe-common-lib'
import { Prompt, useParams } from 'react-router-dom'
import YAML from 'yaml'
import { FloatingVariablesSuggestions, importComponentFromFELibrary } from '@Components/common'
import { getChartReferences } from '@Services/service'
import { getModuleInfo } from '@Components/v2/devtronStackManager/DevtronStackManager.service'
import { URLS } from '@Config/routes'
import { DEFAULT_ROUTE_PROMPT_MESSAGE } from '@Config/constants'
import { ReactComponent as ICClose } from '@Icons/ic-close.svg'
import { ReactComponent as ICInfoOutlineGrey } from '@Icons/ic-info-outline-grey.svg'
import {
    DeploymentTemplateActionState,
    DeploymentTemplateActionType,
    DeploymentTemplateProps,
    DeploymentTemplateStateType,
    GetChartListReturnType,
    GetPublishedAndBaseDeploymentTemplateReturnType,
    HandleInitializeTemplatesWithoutDraftParamsType,
} from './types'
import { BASE_DEPLOYMENT_TEMPLATE_ENV_ID, NO_SCOPED_VARIABLES_MESSAGE } from './constants'
import DeploymentTemplateOptionsHeader from './DeploymentTemplateOptionsHeader'
import DeploymentTemplateForm from './DeploymentTemplateForm'
import DeploymentTemplateCTA from './DeploymentTemplateCTA'
import {
    deploymentTemplateReducer,
    getCurrentTemplateWithLockedKeys,
    getDeploymentTemplateInitialState,
    getDeploymentTemplateResourceName,
    getEditorTemplateAndLockedKeys,
    getLockedDiffModalDocuments,
} from './utils'
import DeleteOverrideDialog from './DeleteOverrideDialog'
import {
    updateBaseDeploymentTemplate,
    createBaseDeploymentTemplate,
    updateEnvDeploymentTemplate,
    createEnvDeploymentTemplate,
    getEnvOverrideDeploymentTemplate,
    getBaseDeploymentTemplate,
} from './service'
import ConfigHeader from '../ConfigHeader'
import './DeploymentTemplate.scss'
import ConfigToolbar from '../ConfigToolbar'
import { DEFAULT_MERGE_STRATEGY } from '../constants'
import { CompareConfigViewProps, ConfigToolbarProps, DeploymentTemplateComponentType } from '../types'
import { getConfigToolbarPopupConfig } from '../utils'
import ConfigDryRun from '../ConfigDryRun'
import NoOverrideEmptyState from '../NoOverrideEmptyState'
import CompareConfigView from '../CompareConfigView'
import NoPublishedVersionEmptyState from '../NoPublishedVersionEmptyState'
import BaseConfigurationNavigation from '../BaseConfigurationNavigation'

// TODO: Verify null checks for all imports
const getDraftByResourceName = importComponentFromFELibrary('getDraftByResourceName', null, 'function')
const getJsonPath = importComponentFromFELibrary('getJsonPath', null, 'function')
const getLockConfigEligibleAndIneligibleChanges: (props: {
    documents: Record<'edited' | 'unedited', object>
    lockedConfigKeysWithLockType: { config: string[]; allowed: boolean }
}) => {
    eligibleChanges: Record<string, any>
    ineligibleChanges: Record<string, any>
} = importComponentFromFELibrary('getLockConfigEligibleAndIneligibleChanges', null, 'function')
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
        getDeploymentTemplateInitialState({ isSuperAdmin, isEnvView: !!envId }),
    )

    const {
        chartDetails,
        lockedConfigKeysWithLockType,
        publishedTemplateData,
        baseDeploymentTemplateData,
        draftTemplateData,
        resolveScopedVariables,
        isResolvingVariables,
        resolvedEditorTemplate,
        resolvedOriginalTemplate,
        showDraftComments,
        wasGuiOrHideLockedKeysEdited,
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
    } = state

    /**
     * TODO: Add null checks for all draftTemplateData
     * TODO: Will have to put as empty string in case draft is not available
     */
    // TODO: Add simpleKeys: true for locked in resolved states

    const [, grafanaModuleStatus] = useAsync(() => getModuleInfo(ModuleNameMap.GRAFANA), [])

    const isDryRunView = configHeaderTab === ConfigHeaderTabType.DRY_RUN && !showReadMe
    const isInheritedView = configHeaderTab === ConfigHeaderTabType.INHERITED && !showReadMe
    const isDraftAvailable = isProtected && !!draftTemplateData?.latestDraft

    const isPublishedValuesView = !!(
        !showReadMe &&
        isDraftAvailable &&
        ((configHeaderTab === ConfigHeaderTabType.VALUES &&
            selectedProtectionViewTab === ProtectConfigTabsType.PUBLISHED) ||
            (configHeaderTab === ConfigHeaderTabType.DRY_RUN && dryRunEditorMode === DryRunEditorMode.PUBLISHED_VALUES))
    )
    const isCompareView = !!(
        configHeaderTab === ConfigHeaderTabType.VALUES &&
        selectedProtectionViewTab === ProtectConfigTabsType.COMPARE &&
        !showReadMe &&
        isProtected
    )

    const isApprovalPending = isDraftAvailable && draftTemplateData.latestDraft.draftState === DraftState.AwaitApproval

    const isApprovalView =
        (isCompareView || (isDryRunView && dryRunEditorMode === DryRunEditorMode.APPROVAL_PENDING)) && isApprovalPending

    const showNoOverrideEmptyState =
        !!envId &&
        !isDraftAvailable &&
        !publishedTemplateData?.isOverridden &&
        !currentEditorTemplateData?.isOverridden &&
        configHeaderTab === ConfigHeaderTabType.VALUES

    const isApprovalPendingOptionSelected =
        isCompareView &&
        isApprovalView &&
        compareFromSelectedOptionValue === CompareFromApprovalOptionsValuesType.APPROVAL_PENDING

    const isPublishedConfigPresent = !(envId && !publishedTemplateData?.isOverridden)

    const isEditMode = isProtected
        ? configHeaderTab === ConfigHeaderTabType.VALUES &&
          selectedProtectionViewTab === ProtectConfigTabsType.EDIT_DRAFT
        : configHeaderTab === ConfigHeaderTabType.VALUES

    const isGuiSupported = isEditMode

    const baseDeploymentTemplateURL = envId
        ? `${URLS.APPLICATION_GROUP}/${envId}/${URLS.APP_CONFIG}/${appId}/${URLS.APP_DEPLOYMENT_CONFIG}`
        : `${URLS.APP}/${appId}/${URLS.APP_CONFIG}/${URLS.APP_DEPLOYMENT_CONFIG}`

    // TODO: Can we move all handlers into utils by sending state and dispatch as params?
    const areChangesPresent: boolean = useMemo(() => {
        if (!currentEditorTemplateData) {
            return false
        }

        if (currentEditorTemplateData?.parsingError) {
            return true
        }

        if (hideLockedKeys) {
            const finalEditorValue = getCurrentTemplateWithLockedKeys({
                currentEditorTemplateData,
                wasGuiOrHideLockedKeysEdited,
            })
            const isEditorTemplateChanged =
                finalEditorValue !== currentEditorTemplateData.originalTemplateState.editorTemplate
            if (isEditorTemplateChanged) {
                return true
            }
        } else {
            const isEditorTemplateChanged =
                currentEditorTemplateData.editorTemplate !==
                currentEditorTemplateData.originalTemplateState.editorTemplate

            if (isEditorTemplateChanged) {
                return true
            }
        }

        const isChartRefIdChanged =
            currentEditorTemplateData.selectedChartRefId !==
            currentEditorTemplateData.originalTemplateState.selectedChartRefId

        const areApplicationMetricsChanged =
            currentEditorTemplateData.isAppMetricsEnabled !==
            currentEditorTemplateData.originalTemplateState.isAppMetricsEnabled

        const isOverriddenStatusChanged =
            currentEditorTemplateData.isOverridden !== currentEditorTemplateData.originalTemplateState.isOverridden

        if (isChartRefIdChanged || areApplicationMetricsChanged || isOverriddenStatusChanged) {
            return true
        }

        return false
    }, [currentEditorTemplateData])

    usePrompt({
        shouldPrompt: areChangesPresent,
    })

    const handleRemoveResolvedVariables = () => {
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

    const getChartList = async (): Promise<GetChartListReturnType> => {
        const chartRefResp = await getChartReferences(+appId, +envId)

        const { chartRefs, latestAppChartRef, latestChartRef, latestEnvChartRef, chartMetadata } = chartRefResp.result
        // Adding another layer of security
        const envChartRef = envId ? latestEnvChartRef : null

        const selectedChartId: number = envChartRef || latestAppChartRef || latestChartRef
        const chart = chartRefs.find((chartRef) => chartRef.id === selectedChartId)
        const globalChartRefId = latestAppChartRef || latestChartRef
        const selectedGlobalChart = chartRefs.find((chartRef) => chartRef.id === globalChartRefId)

        return {
            charts: chartRefs,
            chartsMetadata: chartMetadata,
            selectedChartRefId: selectedChartId,
            selectedChart: chart,
            globalChartDetails: selectedGlobalChart,
        }
    }

    const getRawEditorValueForDryRunMode = (): string => {
        if (!isDryRunView) {
            logExceptionToSentry(new Error('getRawEditorValueForDryRunMode called in non dry run mode'))
        }

        if (dryRunEditorMode === DryRunEditorMode.APPROVAL_PENDING) {
            return draftTemplateData.editorTemplate
        }

        if (dryRunEditorMode === DryRunEditorMode.PUBLISHED_VALUES) {
            return publishedTemplateData.editorTemplate
        }

        return currentEditorTemplateData.editorTemplate
    }

    const getCurrentEditorPayloadForScopedVariables = (): string => {
        if (isInheritedView) {
            return baseDeploymentTemplateData.editorTemplate
        }

        if (isDryRunView) {
            return getRawEditorValueForDryRunMode()
        }

        if (isPublishedValuesView) {
            return publishedTemplateData.editorTemplate
        }

        if (isApprovalPendingOptionSelected) {
            return draftTemplateData.editorTemplate
        }

        if (hideLockedKeys) {
            try {
                const templateWithLockedKeys = getCurrentTemplateWithLockedKeys({
                    currentEditorTemplateData,
                    wasGuiOrHideLockedKeysEdited,
                })
                return templateWithLockedKeys
            } catch {
                // Do nothing
            }
        }

        return currentEditorTemplateData.editorTemplate
    }

    // TODO: Check all YAMLStringify for locked keys
    // FIXME: Maybe can remove param as well

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
        // TODO: can think about adding abort controller
        try {
            // TODO: check if need to enhance this
            const shouldFetchOriginalTemplate: boolean = !!isGuiSupported
            // Fetching LHS in case of compare view
            const shouldFetchPublishedTemplate: boolean = isPublishedConfigPresent && isApprovalView && isCompareView

            const [currentEditorTemplate, defaultTemplate, publishedTemplate] = await Promise.all([
                getResolvedDeploymentTemplate({
                    appId: +appId,
                    chartRefId: currentEditorTemplateData.selectedChartRefId,
                    values: getCurrentEditorPayloadForScopedVariables(),
                    valuesAndManifestFlag: ValuesAndManifestFlagDTO.DEPLOYMENT_TEMPLATE,
                    ...(envId && { envId: +envId }),
                }),
                shouldFetchOriginalTemplate
                    ? getResolvedDeploymentTemplate({
                          appId: +appId,
                          // FIXME: in case of draft mode selectedChartRefId can be different
                          chartRefId: currentEditorTemplateData.selectedChartRefId,
                          values: YAMLStringify(currentEditorTemplateData.originalTemplate),
                          valuesAndManifestFlag: ValuesAndManifestFlagDTO.DEPLOYMENT_TEMPLATE,
                          ...(envId && { envId: +envId }),
                      })
                    : null,
                shouldFetchPublishedTemplate
                    ? getResolvedDeploymentTemplate({
                          appId: +appId,
                          chartRefId: publishedTemplateData.selectedChartRefId,
                          values: publishedTemplateData.editorTemplate,
                          valuesAndManifestFlag: ValuesAndManifestFlagDTO.DEPLOYMENT_TEMPLATE,
                          ...(envId && { envId: +envId }),
                      })
                    : null,
            ])

            const areNoVariablesPresent = shouldFetchPublishedTemplate
                ? !publishedTemplate.areVariablesPresent && !currentEditorTemplate.areVariablesPresent
                : !currentEditorTemplate.areVariablesPresent

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
                    resolvedOriginalTemplate: shouldFetchOriginalTemplate
                        ? {
                              originalTemplateString: defaultTemplate.resolvedData,
                              templateWithoutLockedKeys: getEditorTemplateAndLockedKeys(
                                  defaultTemplate.resolvedData,
                                  lockedConfigKeysWithLockType.config,
                              ).editorTemplate,
                          }
                        : null,
                    resolvedPublishedTemplate: shouldFetchPublishedTemplate
                        ? {
                              originalTemplateString: publishedTemplate.resolvedData,
                              templateWithoutLockedKeys: getEditorTemplateAndLockedKeys(
                                  publishedTemplate.resolvedData,
                                  lockedConfigKeysWithLockType.config,
                              ).editorTemplate,
                          }
                        : null,
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
        if (resolveScopedVariables || !isEditMode) {
            return
        }

        dispatch({
            type: DeploymentTemplateActionType.CURRENT_EDITOR_VALUE_CHANGE,
            payload: { template },
        })
    }

    const handleToggleResolveScopedVariables = () => {
        if (resolveScopedVariables) {
            handleRemoveResolvedVariables()
            return
        }

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        handleResolveScopedVariables()
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

    const getDryRunModeSelectedChart = (): DeploymentChartVersionType => {
        if (!isDryRunView) {
            logExceptionToSentry(new Error('getDryRunModeSelectedChart called in non dry run mode'))
        }

        if (dryRunEditorMode === DryRunEditorMode.APPROVAL_PENDING) {
            return draftTemplateData?.selectedChart
        }

        if (dryRunEditorMode === DryRunEditorMode.PUBLISHED_VALUES) {
            return publishedTemplateData?.selectedChart
        }

        return currentEditorTemplateData?.selectedChart
    }

    const getCurrentTemplateSelectedChart = (): DeploymentChartVersionType => {
        if (isDryRunView) {
            return getDryRunModeSelectedChart()
        }

        if (isInheritedView) {
            // TODO: Look for null checks
            return baseDeploymentTemplateData?.selectedChart
        }

        if (isPublishedValuesView && publishedTemplateData) {
            return publishedTemplateData.selectedChart
        }

        // Not added the case of approval pending view in compare since thats not an editor state
        return currentEditorTemplateData?.selectedChart
    }

    const getCurrentTemplateGUISchema = (): string => {
        if (!isGuiSupported) {
            return '{}'
        }

        return currentEditorTemplateData?.guiSchema || '{}'
    }

    const getDryRunModeEditorSchema = (): DeploymentTemplateConfigState['schema'] => {
        if (!isDryRunView) {
            logExceptionToSentry(new Error('getDryRunModeEditorSchema called in non dry run mode'))
        }

        if (dryRunEditorMode === DryRunEditorMode.APPROVAL_PENDING) {
            return draftTemplateData?.schema
        }

        if (dryRunEditorMode === DryRunEditorMode.PUBLISHED_VALUES) {
            return publishedTemplateData?.schema
        }

        return currentEditorTemplateData?.schema
    }

    // FIXME: These sort of methods seems to be duplicated
    const getCurrentEditorSchema = (): DeploymentTemplateConfigState['schema'] => {
        if (isDryRunView) {
            return getDryRunModeEditorSchema()
        }

        if (isInheritedView) {
            return baseDeploymentTemplateData?.schema
        }

        if (isPublishedValuesView && publishedTemplateData) {
            return publishedTemplateData?.schema
        }

        if (draftTemplateData && isApprovalPendingOptionSelected) {
            return draftTemplateData.schema
        }

        return currentEditorTemplateData?.schema
    }

    const getIsCurrentTemplateOverridden = (): boolean => {
        if (isInheritedView) {
            return false
        }

        if (isPublishedValuesView && publishedTemplateData) {
            return publishedTemplateData.isOverridden
        }

        return currentEditorTemplateData?.isOverridden
    }

    const handleFetchBaseDeploymentTemplate = async (
        globalChartDetails: DeploymentChartVersionType,
        lockedConfigKeys: string[] = lockedConfigKeysWithLockType.config,
    ): Promise<DeploymentTemplateConfigState> => {
        // TODO: send abortController here
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

        const stringifiedTemplate = YAMLStringify(defaultAppOverride)

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
        // TODO: send abortController here
        if (!envId) {
            return handleFetchBaseDeploymentTemplate(chartInfo, lockedConfigKeys)
        }

        const {
            result: {
                globalConfig,
                // TODO: Check if null check is needed here for environmentConfig
                environmentConfig: { id, status, manualReviewed, active, namespace, envOverrideValues },
                guiSchema,
                IsOverride,
                schema,
                readme,
                appMetrics,
            },
        } = await getEnvOverrideDeploymentTemplate(+appId, +envId, +chartInfo.id, chartInfo.name)

        const originalTemplate = IsOverride ? envOverrideValues || globalConfig : globalConfig
        const stringifiedTemplate = YAMLStringify(originalTemplate)

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
            // FIXME: Assumed on FE not replace when BE supports
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
        const shouldFetchBaseDeploymentData = !envId
        const [templateData, baseDeploymentTemplateDataResponse] = await Promise.all([
            handleFetchDeploymentTemplate(chartRefsData.selectedChart, lockedConfigKeys),
            shouldFetchBaseDeploymentData
                ? handleFetchBaseDeploymentTemplate(chartRefsData.globalChartDetails, lockedConfigKeys)
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

        // Since hideLockedKeys is initially false so saving it as whole
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
            },
            lockedConfigKeysWithLockTypeState: lockedKeysConfig,
        })
    }

    const handleInitializeDraftData = (
        latestDraft: DraftMetadataDTO,
        guiSchema: string,
        chartRefsData: Awaited<ReturnType<typeof getChartList>>,
        lockedConfigKeys: string[],
    ): typeof draftTemplateData => {
        if (!envId) {
            const {
                valuesOverride,
                id,
                refChartTemplate,
                refChartTemplateVersion,
                isAppMetricsEnabled,
                chartRefId,
                readme,
                schema,
            } = JSON.parse(latestDraft.data)

            const stringifiedTemplate = YAMLStringify(valuesOverride)
            const { editorTemplate: editorTemplateWithoutLockedKeys } = getEditorTemplateAndLockedKeys(
                stringifiedTemplate,
                lockedConfigKeys,
            )

            const response: typeof draftTemplateData = {
                originalTemplate: valuesOverride,
                schema,
                readme,
                guiSchema,
                isAppMetricsEnabled,
                chartConfig: { id, refChartTemplate, refChartTemplateVersion, chartRefId, readme },
                editorTemplate: stringifiedTemplate,
                latestDraft,
                selectedChartRefId: chartRefId,
                // FIXME: Check null checks for chartRefsData, it can be null
                selectedChart: chartRefsData.charts.find((chart) => chart.id === chartRefId),
                editorTemplateWithoutLockedKeys,
            }

            return response
        }

        const {
            envOverrideValues,
            id,
            isDraftOverriden,
            isAppMetricsEnabled,
            chartRefId,
            status,
            manualReviewed,
            active,
            namespace,
            readme,
            schema,
            // FIXME: Not actual type change it after BE changes
            mergeStrategy,
        } = JSON.parse(latestDraft.data)
        const stringifiedTemplate = YAMLStringify(envOverrideValues)
        const { editorTemplate: editorTemplateWithoutLockedKeys } = getEditorTemplateAndLockedKeys(
            stringifiedTemplate,
            lockedConfigKeys,
        )
        const response: typeof draftTemplateData = {
            originalTemplate: envOverrideValues,
            schema,
            readme,
            guiSchema,
            isAppMetricsEnabled,
            editorTemplate: stringifiedTemplate,
            latestDraft,
            selectedChartRefId: chartRefId,
            // FIXME: Check null checks for chartRefsData, it can be null
            selectedChart: chartRefsData.charts.find((chart) => chart.id === chartRefId),
            editorTemplateWithoutLockedKeys,
            isOverridden: isDraftOverriden,
            environmentConfig: {
                id,
                status,
                manualReviewed,
                active,
                namespace,
            },
            mergeStrategy: mergeStrategy || DEFAULT_MERGE_STRATEGY,
        }

        return response
    }

    // Should remove edit draft mode in case of error and show normal edit values view with zero drafts where user can save as draft?
    const handleLoadProtectedDeploymentTemplate = async (
        chartRefsData: Awaited<ReturnType<typeof getChartList>>,
        lockedKeysConfig: typeof lockedConfigKeysWithLockType,
    ) => {
        // In case of error of draftResponse
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
        const draftTemplateState = handleInitializeDraftData(
            latestDraft,
            guiSchema,
            chartRefsData,
            lockedKeysConfig.config,
        )

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
                },
                lockedConfigKeysWithLockType: lockedKeysConfig,
                draftTemplateData: draftTemplateState,
                // Since hideLockedKeys is initially false so saving it as whole
                currentEditorTemplateData: {
                    ...clonedTemplateData,
                    parsingError: '',
                    removedPatches: [],
                    originalTemplateState: draftTemplateState,
                },
                configHeaderTab:
                    draftPromiseResponse.value.result.draftState === DraftState.AwaitApproval || !envId
                        ? ConfigHeaderTabType.VALUES
                        : ConfigHeaderTabType.INHERITED,
                selectedProtectionViewTab:
                    draftPromiseResponse.value.result.draftState === DraftState.AwaitApproval
                        ? ProtectConfigTabsType.COMPARE
                        : ProtectConfigTabsType.EDIT_DRAFT,
            },
        })
    }

    // TODO: Check why inf loading is happening in case of null check error
    const handleInitialDataLoad = async () => {
        dispatch({
            type: DeploymentTemplateActionType.INITIATE_INITIAL_DATA_LOAD,
        })

        // TODO: Handle case where we have draft as delete override then set set draft from base deployment template
        try {
            reloadEnvironments()
            const [chartRefsDataResponse, lockedKeysConfigResponse] = await Promise.allSettled([
                getChartList(),
                getJsonPath ? getJsonPath(appId, envId || BASE_DEPLOYMENT_TEMPLATE_ENV_ID) : Promise.resolve(null),
            ])

            if (chartRefsDataResponse.status === 'rejected') {
                throw chartRefsDataResponse.reason
            }
            const chartRefsData = chartRefsDataResponse.value

            const isLockedConfigResponseValid =
                lockedKeysConfigResponse.status === 'fulfilled' && lockedKeysConfigResponse.value?.result

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
                isEnvView: !!envId,
            },
        })

        fetchEnvConfig(+envId || BASE_DEPLOYMENT_TEMPLATE_ENV_ID)
        reloadEnvironments()
        await handleInitialDataLoad()
    }

    // TODO: Return type
    /**
     * Suggestion: Can break method for envId and non-envId
     * @param skipReadmeAndSchema - true only while doing handleSave
     */
    const prepareDataToSave = (skipReadmeAndSchema: boolean = false, fromDeleteOverride: boolean = false) => {
        const editorTemplate = getCurrentTemplateWithLockedKeys({
            currentEditorTemplateData,
            wasGuiOrHideLockedKeysEdited,
        })
        const editorTemplateObject: Record<string, string> = YAML.parse(editorTemplate)

        if (!envId) {
            const baseRequestData = {
                ...(currentEditorTemplateData.chartConfig.chartRefId === currentEditorTemplateData.selectedChart.id
                    ? currentEditorTemplateData.chartConfig
                    : {}),

                appId: +appId,
                chartRefId: currentEditorTemplateData.selectedChart.id,
                // TODO: Ask backend team why they need this
                defaultAppOverride: currentEditorTemplateData.originalTemplate,
                isAppMetricsEnabled: currentEditorTemplateData.isAppMetricsEnabled,
                saveEligibleChanges: showLockedTemplateDiffModal,

                ...(!skipReadmeAndSchema
                    ? {
                          id: currentEditorTemplateData.chartConfig.id,
                          readme: currentEditorTemplateData.readme,
                          schema: currentEditorTemplateData.schema,
                      }
                    : {}),
            }

            if (showLockedTemplateDiffModal) {
                // FIXME: In case of draft edit should we do this or approval as unedited?
                const { eligibleChanges } = getLockConfigEligibleAndIneligibleChanges({
                    documents: getLockedDiffModalDocuments(false, state),
                    lockedConfigKeysWithLockType,
                })

                return {
                    ...baseRequestData,
                    valuesOverride: eligibleChanges,
                }
            }

            return {
                ...baseRequestData,
                valuesOverride: editorTemplateObject,
            }
        }

        // NOTE: We don't handle lock keys in case of deletion of override
        if (fromDeleteOverride) {
            // NOTE: This is basic handling, sending wrong isAppMetricsEnabled
            return {
                environmentId: +envId,
                envOverrideValues: baseDeploymentTemplateData.originalTemplate,
                chartRefId: chartDetails.globalChartDetails.id,
                IsOverride: false,
                isAppMetricsEnabled: baseDeploymentTemplateData.isAppMetricsEnabled,
                saveEligibleChanges: false,
                // FIXME: Check again with old service
                ...(currentEditorTemplateData.environmentConfig.id > 0
                    ? {
                          id: currentEditorTemplateData.environmentConfig.id,
                          status: currentEditorTemplateData.environmentConfig.status,
                          manualReviewed: true,
                          active: currentEditorTemplateData.environmentConfig.active,
                          namespace: currentEditorTemplateData.environmentConfig.namespace,
                      }
                    : {}),
                ...(!skipReadmeAndSchema
                    ? {
                          id: currentEditorTemplateData.environmentConfig.id,
                          globalConfig: baseDeploymentTemplateData.originalTemplate,
                          isDraftOverriden: false,
                          readme: baseDeploymentTemplateData.readme,
                          schema: baseDeploymentTemplateData.schema,
                      }
                    : {}),
            }
        }

        const baseObject = {
            environmentId: +envId,
            chartRefId: currentEditorTemplateData.selectedChartRefId,
            // Since this is for published here it will always be overridden
            IsOverride: true,
            isAppMetricsEnabled: currentEditorTemplateData.isAppMetricsEnabled,
            saveEligibleChanges: showLockedTemplateDiffModal,

            ...(currentEditorTemplateData.environmentConfig.id > 0
                ? {
                      id: currentEditorTemplateData.environmentConfig.id,
                      status: currentEditorTemplateData.environmentConfig.status,
                      manualReviewed: true,
                      active: currentEditorTemplateData.environmentConfig.active,
                      namespace: currentEditorTemplateData.environmentConfig.namespace,
                  }
                : {}),

            // This is the data which we suppose to send for draft we are creating
            ...(!skipReadmeAndSchema
                ? {
                      id: currentEditorTemplateData.environmentConfig.id,
                      globalConfig: baseDeploymentTemplateData.originalTemplate,
                      isDraftOverriden: currentEditorTemplateData.isOverridden,
                      readme: currentEditorTemplateData.readme,
                      schema: currentEditorTemplateData.schema,
                  }
                : {}),
        }

        if (showLockedTemplateDiffModal) {
            const { eligibleChanges } = getLockConfigEligibleAndIneligibleChanges({
                documents: getLockedDiffModalDocuments(false, state),
                lockedConfigKeysWithLockType,
            })

            return {
                ...baseObject,
                envOverrideValues: eligibleChanges,
            }
        }

        return {
            ...baseObject,
            envOverrideValues: editorTemplateObject,
        }
    }

    // FIXME: BTW This is a hack ideally BE should not even take data for this, they should only need action
    const handlePrepareDataToSaveForProtectedDeleteOverride = () => prepareDataToSave(false, true)

    const getSaveAPIService = (): ((
        payload: ReturnType<typeof prepareDataToSave>,
        abortSignal?: AbortSignal,
    ) => Promise<any>) => {
        if (!envId) {
            return currentEditorTemplateData.chartConfig.id
                ? updateBaseDeploymentTemplate
                : createBaseDeploymentTemplate
        }

        return currentEditorTemplateData.environmentConfig && currentEditorTemplateData.environmentConfig.id > 0
            ? updateEnvDeploymentTemplate
            : (payload, abortSignal) => createEnvDeploymentTemplate(+appId, +envId, payload, abortSignal)
    }

    const handleSaveTemplate = async () => {
        dispatch({
            type: DeploymentTemplateActionType.INITIATE_SAVE,
        })

        try {
            const apiService = getSaveAPIService()
            // TODO: Test concurrency, maybe would have to re-compute all the values

            // TODO: Can send signal
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
                title: currentEditorTemplateData.chartConfig.id ? 'Updated' : 'Saved',
                description: 'Changes will be reflected after next deployment.',
            })
        } catch (error) {
            const isProtectionError = error.code === 423

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

        // TODO: Not handle in case of isUnset
        const shouldValidateLockChanges = lockedConfigKeysWithLockType.config.length > 0 && !isSuperAdmin

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

    /**
     * If true, it is valid, else would show locked diff modal
     */
    const handleValidateApprovalState = (): boolean => {
        const shouldValidateLockChanges = lockedConfigKeysWithLockType.config.length > 0 && !isSuperAdmin
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
            const selectedChartTemplateDetails = await handleFetchBaseDeploymentTemplate(selectedChart)
            dispatch({
                type: DeploymentTemplateActionType.CHART_CHANGE_SUCCESS,
                payload: {
                    selectedChart,
                    selectedChartTemplateDetails,
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

    // We don't have options for locked keys here
    const getDryRunModeEditorValue = (): string => {
        if (resolveScopedVariables) {
            return resolvedEditorTemplate.originalTemplateString
        }

        return getRawEditorValueForDryRunMode()
    }

    // TODO: Maybe can separate scoped variables and non scoped variables, and then based on that we can directly get data state
    const getCurrentEditorValue = (): string => {
        if (isDryRunView) {
            return getDryRunModeEditorValue()
        }

        if (resolveScopedVariables) {
            // Since editor is disabled for scoped variables we do'nt need to worry about keys changing in editor
            return hideLockedKeys
                ? resolvedEditorTemplate.templateWithoutLockedKeys
                : resolvedEditorTemplate.originalTemplateString
        }

        if (isInheritedView) {
            return hideLockedKeys
                ? baseDeploymentTemplateData.editorTemplateWithoutLockedKeys
                : baseDeploymentTemplateData.editorTemplate
        }

        if (isPublishedValuesView) {
            return hideLockedKeys
                ? publishedTemplateData.editorTemplateWithoutLockedKeys
                : publishedTemplateData.editorTemplate
        }

        if (isApprovalPendingOptionSelected) {
            return hideLockedKeys ? draftTemplateData.editorTemplateWithoutLockedKeys : draftTemplateData.editorTemplate
        }

        if (currentEditorTemplateData) {
            return currentEditorTemplateData.editorTemplate
        }

        return ''
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

        // No need to handle compare mode since not using this there

        if (currentEditorTemplateData) {
            return YAMLStringify(currentEditorTemplateData.originalTemplate)
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

    // TODO: Check if can break this method
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

        // TODO: Check if can be removed
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

    const getCompareFromEditorConfig = (): CompareConfigViewProps['currentEditorConfig'] => {
        const templateState = isApprovalPendingOptionSelected ? draftTemplateData : currentEditorTemplateData

        return {
            chartName: {
                displayName: 'Chart',
                value: templateState?.selectedChart?.name,
            },
            chartVersion: {
                displayName: 'Version',
                value: templateState?.selectedChart?.version,
            },
            mergeStrategy: {
                displayName: 'Merge strategy',
                value: templateState?.mergeStrategy,
            },
            ...(window._env_.APPLICATION_METRICS_ENABLED && {
                applicationMetrics: {
                    displayName: 'Application metrics',
                    value: String(templateState?.isAppMetricsEnabled),
                },
            }),
        }
    }

    const getPublishedEditorConfig = (): CompareConfigViewProps['publishedEditorConfig'] => {
        if (!isPublishedConfigPresent) {
            return {}
        }

        return {
            chartName: {
                displayName: 'Chart',
                value: publishedTemplateData?.selectedChart?.name,
            },
            chartVersion: {
                displayName: 'Version',
                value: publishedTemplateData?.selectedChart?.version,
            },
            mergeStrategy: {
                displayName: 'Merge strategy',
                value: publishedTemplateData?.mergeStrategy,
            },
            ...(window._env_.APPLICATION_METRICS_ENABLED && {
                applicationMetrics: {
                    displayName: 'Application metrics',
                    value: String(publishedTemplateData?.isAppMetricsEnabled),
                },
            }),
        }
    }

    const getPublishedTemplate = (): string => {
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

    const renderEditorComponent = () => {
        if (isResolvingVariables || isLoadingChangedChartDetails) {
            return (
                <div className="flex h-100 dc__overflow-scroll">
                    <Progressing pageLoader />
                </div>
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
                    compareFromSelectedOptionValue={compareFromSelectedOptionValue}
                    handleCompareFromOptionSelection={handleCompareFromOptionSelection}
                    isApprovalView={isApprovalView}
                    currentEditorConfig={getCompareFromEditorConfig()}
                    currentEditorTemplate={YAML.parse(getCurrentEditorValue())}
                    publishedEditorConfig={getPublishedEditorConfig()}
                    publishedEditorTemplate={YAML.parse(getPublishedTemplate())}
                    selectedChartVersion={getCurrentTemplateSelectedChart().version}
                    draftChartVersion={draftTemplateData?.selectedChart?.version}
                    isDeleteDraft={draftTemplateData?.latestDraft?.action === 3}
                />
            )
        }

        if (configHeaderTab === ConfigHeaderTabType.DRY_RUN) {
            return (
                <ConfigDryRun
                    showManifest
                    isLoading={isResolvingVariables || isSaving || isLoadingChangedChartDetails}
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
                />
            )
        }

        if (isPublishedValuesView && !isPublishedConfigPresent) {
            return <NoPublishedVersionEmptyState />
        }

        return (
            <DeploymentTemplateForm
                editMode={editMode}
                hideLockedKeys={hideLockedKeys}
                lockedConfigKeysWithLockType={lockedConfigKeysWithLockType}
                readOnly={isPublishedValuesView || resolveScopedVariables || isInheritedView}
                selectedChart={getCurrentTemplateSelectedChart()}
                guiSchema={getCurrentTemplateGUISchema()}
                schema={getCurrentEditorSchema()}
                isOverridden={getIsCurrentTemplateOverridden()}
                isUnSet={isUnSet}
                handleChangeToYAMLMode={handleChangeToYAMLMode}
                editorOnChange={handleEditorChange}
                editedDocument={getCurrentEditorValue()}
                uneditedDocument={getUneditedDocument()}
                showReadMe={showReadMe}
                // TODO: Show readme only in case of edit/values mode
                readMe={currentEditorTemplateData?.readme}
                environmentName={environmentName}
                latestDraft={draftTemplateData?.latestDraft}
                isPublishedValuesView={isPublishedValuesView}
                handleOverride={handleOverride}
                isGuiSupported={isGuiSupported}
            />
        )
    }

    // NOTE: Need to implement when we have support for merge patches
    const getShouldShowMergePatchesButton = (): boolean => false

    const handleMergeStrategyChange: ConfigToolbarProps['handleMergeStrategyChange'] = (mergeStrategy) => {
        ReactGA.event({
            category: 'devtronapp-configuration-dt',
            action: 'clicked-merge-strategy-dropdown',
        })

        if (!currentEditorTemplateData.mergeStrategy) {
            logExceptionToSentry(new Error('Merge strategy change without merge strategy'))
            return
        }

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

    const getIsAppMetricsEnabledForDryRun = () => {
        if (dryRunEditorMode === DryRunEditorMode.APPROVAL_PENDING) {
            return !!draftTemplateData?.isAppMetricsEnabled
        }

        if (dryRunEditorMode === DryRunEditorMode.PUBLISHED_VALUES) {
            return !!publishedTemplateData?.isAppMetricsEnabled
        }

        return !!currentEditorTemplateData?.isAppMetricsEnabled
    }

    const getIsAppMetricsEnabledForCTA = () => {
        if (isInheritedView) {
            return !!baseDeploymentTemplateData?.isAppMetricsEnabled
        }

        if (isPublishedValuesView) {
            return !!publishedTemplateData?.isAppMetricsEnabled
        }

        if (isDryRunView) {
            return getIsAppMetricsEnabledForDryRun()
        }

        return !!currentEditorTemplateData?.isAppMetricsEnabled
    }

    const renderCTA = () => {
        const selectedChart = getCurrentTemplateSelectedChart()
        const shouldRenderCTA =
            isEditMode || isApprovalView || (isDryRunView && dryRunEditorMode === DryRunEditorMode.VALUES_FROM_DRAFT)

        if (!selectedChart || showNoOverrideEmptyState || !shouldRenderCTA) {
            return null
        }

        const showApplicationMetrics =
            !!chartDetails?.charts?.length &&
            window._env_.APPLICATION_METRICS_ENABLED &&
            grafanaModuleStatus?.result?.status === ModuleStatus.INSTALLED &&
            !isCompareView

        const isAppMetricsEnabled = getIsAppMetricsEnabledForCTA()

        const isLoading = isResolvingVariables || isSaving || isLoadingChangedChartDetails
        const isDisabled = isLoading || resolveScopedVariables || !!currentEditorTemplateData.parsingError

        if (isProtected && ProtectedDeploymentTemplateCTA) {
            return (
                <ProtectedDeploymentTemplateCTA
                    isPublishedView={isPublishedValuesView}
                    isAppMetricsEnabled={isAppMetricsEnabled}
                    showApplicationMetrics={showApplicationMetrics}
                    toggleAppMetrics={handleAppMetricsToggle}
                    isLoading={isLoading}
                    selectedChart={selectedChart}
                    isDisabled={isDisabled}
                    latestDraft={draftTemplateData?.latestDraft}
                    isCiPipeline={isCiPipeline}
                    handleTriggerSaveDraft={handleTriggerSave}
                    validateApprovalState={handleValidateApprovalState}
                    handleReload={handleReload}
                    showApproveButton={isApprovalView}
                />
            )
        }

        if (!currentEditorTemplateData) {
            return null
        }

        return (
            <DeploymentTemplateCTA
                isLoading={isLoading}
                isDisabled={isDisabled}
                isAppMetricsEnabled={isAppMetricsEnabled}
                showApplicationMetrics={showApplicationMetrics}
                toggleAppMetrics={handleAppMetricsToggle}
                selectedChart={selectedChart}
                isCiPipeline={isCiPipeline}
                handleSave={handleTriggerSave}
            />
        )
    }

    const renderInheritedViewFooter = () => (
        <div className="flexbox dc__gap-6 dc__align-items-center dc__border-top-n1 bc-n50 py-6 px-10">
            <ICInfoOutlineGrey className="flex icon-dim-16 p-2 dc__no-shrink" />
            <div className="flexbox">
                <span className="cn-8 fs-12 fw-4 lh-20 dc__truncate">Application metrics is not enabled in</span>&nbsp;
                <BaseConfigurationNavigation baseConfigurationURL={baseDeploymentTemplateURL} />
            </div>
        </div>
    )

    const renderValuesView = () => (
        <div className="flexbox-col flex-grow-1 dc__overflow-scroll">
            {window._env_.ENABLE_SCOPED_VARIABLES && (
                <div className="variables-widget-position">
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

    const toolbarPopupConfig: ConfigToolbarProps['popupConfig'] = {
        menuConfig: getConfigToolbarPopupConfig({
            lockedConfigData: {
                areLockedKeysPresent: lockedConfigKeysWithLockType.config.length > 0,
                hideLockedKeys,
                handleSetHideLockedKeys,
            },
            configHeaderTab,
            // FIXME: Check if need to send others as well
            isOverridden: currentEditorTemplateData?.isOverridden,
            isPublishedValuesView,
            isPublishedConfigPresent,
            handleDeleteOverride: handleOverride,
            unableToParseData: !!currentEditorTemplateData?.parsingError,
            isLoading: isResolvingVariables || isSaving || isLoadingChangedChartDetails,
            isDraftAvailable,
            handleDiscardDraft: handleOpenDiscardDraftPopup,
            handleShowEditHistory,
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

    const renderHeader = () => {
        if (showReadMe) {
            return (
                <div className="flexbox dc__gap-8 px-12 py-6 dc__border-bottom">
                    <Button
                        text="Readme"
                        startIcon={<ICClose />}
                        onClick={handleDisableReadmeView}
                        dataTestId="close-readme-view-btn"
                        size={ComponentSizeType.xs}
                        style={ButtonStyleType.negativeGrey}
                        variant={ButtonVariantType.text}
                    />
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
                    isPublishedTemplateOverridden={publishedTemplateData?.isOverridden}
                    parsingError={currentEditorTemplateData?.parsingError}
                    restoreLastSavedYAML={restoreLastSavedTemplate}
                />

                {!showNoOverrideEmptyState && (
                    <ConfigToolbar
                        baseConfigurationURL={baseDeploymentTemplateURL}
                        selectedProtectionViewTab={selectedProtectionViewTab}
                        handleProtectionViewTabChange={handleUpdateProtectedTabSelection}
                        handleToggleCommentsView={handleToggleDraftComments}
                        areCommentsPresent={draftTemplateData?.latestDraft?.commentsCount > 0}
                        showMergePatchesButton={getShouldShowMergePatchesButton()}
                        shouldMergeTemplateWithPatches={shouldMergeTemplateWithPatches}
                        handleToggleShowTemplateMergedWithPatch={handleToggleShowTemplateMergedWithPatch}
                        mergeStrategy={currentEditorTemplateData?.mergeStrategy}
                        handleMergeStrategyChange={handleMergeStrategyChange}
                        handleEnableReadmeView={handleEnableReadmeView}
                        popupConfig={toolbarPopupConfig}
                        handleToggleScopedVariablesView={handleToggleResolveScopedVariables}
                        resolveScopedVariables={resolveScopedVariables}
                        // TODO: Can make variable
                        disableAllActions={isResolvingVariables || isSaving || isLoadingChangedChartDetails}
                        parsingError={currentEditorTemplateData?.parsingError}
                        configHeaderTab={configHeaderTab}
                        isProtected={isProtected}
                        isApprovalPending={isApprovalPending}
                        isDraftPresent={isDraftAvailable}
                        approvalUsers={draftTemplateData?.latestDraft?.approvers}
                        isPublishedConfigPresent={isPublishedConfigPresent}
                        handleClearPopupNode={handleClearPopupNode}
                        restoreLastSavedYAML={restoreLastSavedTemplate}
                        showEnableReadMeButton={isEditMode}
                    >
                        <DeploymentTemplateOptionsHeader
                            disableVersionSelect={
                                isPublishedValuesView ||
                                isResolvingVariables ||
                                isSaving ||
                                isLoadingChangedChartDetails ||
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
                        />
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
                        onSave={handleSaveTemplate}
                        isSaving={isSaving}
                        // TODO: Should not do this on runtime.
                        documents={getLockedDiffModalDocuments(isApprovalView, state)}
                        appId={appId}
                        envId={envId || BASE_DEPLOYMENT_TEMPLATE_ENV_ID}
                    />
                )}

                {/* FIXME: Can move this as well in ProtectedDeploymentTemplateCTA */}
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
                    />
                )}
            </div>

            <Prompt when={areChangesPresent} message={DEFAULT_ROUTE_PROMPT_MESSAGE} />
        </>
    )
}

export default DeploymentTemplate
