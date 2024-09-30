import { useEffect, useState, SyntheticEvent, useMemo } from 'react'
import {
    BaseURLParams,
    ConfigurationType,
    DeploymentChartVersionType,
    DraftState,
    showError,
    useMainContext,
    YAMLStringify,
    DeploymentTemplateConfigState,
    ServerErrors,
    Progressing,
    ErrorScreenManager,
    getResolvedDeploymentTemplate,
    GetResolvedDeploymentTemplateProps,
    ConfigKeysWithLockType,
    applyCompareDiffOnUneditedDocument,
    ModuleStatus,
    useAsync,
    ModuleNameMap,
    ToastManager,
    ToastVariantType,
    SelectPickerOptionType,
    ValuesAndManifestFlagDTO,
    CompareFromApprovalOptionsValuesType,
    noop,
    SelectedChartDetailsType,
    logExceptionToSentry,
    ConfigHeaderTabType,
    ProtectConfigTabsType,
    CONFIG_HEADER_TAB_VALUES,
    ConfigToolbarPopupNodeType,
    Button,
    ComponentSizeType,
    ButtonStyleType,
    ButtonVariantType,
    DryRunEditorMode,
} from '@devtron-labs/devtron-fe-common-lib'
import { useParams } from 'react-router-dom'
import YAML from 'yaml'
import { FloatingVariablesSuggestions, importComponentFromFELibrary } from '@Components/common'
import { getChartReferences } from '@Services/service'
import { getModuleInfo } from '@Components/v2/devtronStackManager/DevtronStackManager.service'
import { URLS } from '@Config/routes'
import { ReactComponent as ICClose } from '@Icons/ic-close.svg'
import {
    DeploymentTemplateChartStateType,
    DeploymentTemplateEditorDataStateType,
    DeploymentTemplateProps,
    ResolvedEditorTemplateType,
} from './types'
import {
    BASE_DEPLOYMENT_TEMPLATE_ENV_ID,
    DEFAULT_LOCKED_KEYS_CONFIG,
    NO_SCOPED_VARIABLES_MESSAGE,
    PROTECT_BASE_DEPLOYMENT_TEMPLATE_IDENTIFIER_DTO,
} from './constants'
import DeploymentTemplateOptionsHeader from './DeploymentTemplateOptionsHeader'
import DeploymentTemplateForm from './DeploymentTemplateForm'
import DeploymentTemplateCTA from './DeploymentTemplateCTA'
import { applyCompareDiffOfTempFormDataOnOriginalData } from './utils'
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

// TODO: Verify null checks for all imports
const getDraftByResourceName = importComponentFromFELibrary('getDraftByResourceName', null, 'function')
const getJsonPath = importComponentFromFELibrary('getJsonPath', null, 'function')
const removeLockedKeysFromYaml = importComponentFromFELibrary('removeLockedKeysFromYaml', null, 'function')
const reapplyRemovedLockedKeysToYaml = importComponentFromFELibrary('reapplyRemovedLockedKeysToYaml', null, 'function')
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

    const [isLoadingInitialData, setIsLoadingInitialData] = useState<boolean>(true)
    const [initialLoadError, setInitialLoadError] = useState<ServerErrors>(null)
    // TODO: Constant
    /**
     * publishedChartDetails is the chart details of saved chart
     */
    const [chartDetails, setChartDetails] = useState<DeploymentTemplateChartStateType>({
        charts: [],
        chartsMetadata: {},
        globalChartDetails: null,
    })
    /**
     * Last saved template data, meant to be readonly no changes should be made to this state when saved
     */
    const [publishedTemplateData, setPublishedTemplateData] = useState<DeploymentTemplateConfigState>(null)
    /**
     * Last saved draft template data
     * Only present in case of protected config
     * Meant to be readonly
     * TODO: Add null checks
     * TODO: Will have to put as empty string in case draft is not available
     */
    const [draftTemplateData, setDraftTemplateData] = useState<DeploymentTemplateConfigState>(null)
    const [baseDeploymentTemplateData, setBaseDeploymentTemplateData] = useState<DeploymentTemplateConfigState>(null)
    /**
     * The config that we are going to feed the editor, this can be modified
     */
    const [currentEditorTemplateData, setCurrentEditorTemplateData] =
        useState<DeploymentTemplateEditorDataStateType>(null)
    /**
     * Action to resolve scoped variables
     */
    const [resolveScopedVariables, setResolveScopedVariables] = useState<boolean>(false)
    const [isResolvingVariables, setIsResolvingVariables] = useState<boolean>(false)

    // TODO: Add simpleKeys: true for locked
    /**
     * The resolved scoped variables for editorTemplate in currentEditorTemplateData
     */
    const [resolvedEditorTemplate, setResolvedEditorTemplate] = useState<ResolvedEditorTemplateType>({
        originalTemplate: '',
        templateWithoutLockedKeys: '',
    })
    /**
     * In case of GUI, it is of actual template, in case of compare mode, it is Default value of editor
     */
    const [resolvedOriginalTemplate, setResolvedOriginalTemplate] = useState<ResolvedEditorTemplateType>({
        originalTemplate: '',
        templateWithoutLockedKeys: '',
    })
    const [wasGuiOrHideLockedKeysEdited, setWasGuiOrHideLockedKeysEdited] = useState<boolean>(false)
    const [showDraftComments, setShowDraftComments] = useState<boolean>(false)

    const [hideLockedKeys, setHideLockedKeys] = useState<boolean>(false)
    const [lockedConfigKeysWithLockType, setLockedConfigKeysWithLockType] = useState<ConfigKeysWithLockType>(
        structuredClone(DEFAULT_LOCKED_KEYS_CONFIG),
    )
    /**
     * State to show locked changes modal in case user is non super admin and is changing locked keys
     * Would be showing an info bar in locked modal
     * TODO: Maybe can combine state with showLockedTemplateDiffModal
     */
    const [showLockedDiffForApproval, setShowLockedDiffForApproval] = useState<boolean>(false)
    const [isSaving, setIsSaving] = useState<boolean>(false)
    const [showLockedTemplateDiffModal, setShowLockedTemplateDiffModal] = useState<boolean>(false)
    const [showSaveChangesModal, setShowSaveChangesModal] = useState<boolean>(false)
    const [popupNodeType, setPopupNodeType] = useState<ConfigToolbarPopupNodeType>(null)

    // FIXME: Need clean up as well on reload for states below
    const [compareFromSelectedOptionValue, setCompareFromSelectedOptionValue] =
        useState<CompareFromApprovalOptionsValuesType>(CompareFromApprovalOptionsValuesType.APPROVAL_PENDING)

    const [dryRunEditorMode, setDryRunEditorMode] = useState<DryRunEditorMode>(DryRunEditorMode.PUBLISHED_VALUES)

    const [showDeleteOverrideDialog, setShowDeleteOverrideDialog] = useState<boolean>(false)
    const [showDeleteDraftOverrideDialog, setShowDeleteDraftOverrideDialog] = useState<boolean>(false)

    const [, grafanaModuleStatus] = useAsync(() => getModuleInfo(ModuleNameMap.GRAFANA), [])

    const [showReadMe, setShowReadMe] = useState<boolean>(false)
    const [editMode, setEditMode] = useState<ConfigurationType>(
        isSuperAdmin ? ConfigurationType.YAML : ConfigurationType.GUI,
    )
    // Initially will set here but in case of protected will change the tab
    const [configHeaderTab, setConfigHeaderTab] = useState<ConfigHeaderTabType>(
        envId ? CONFIG_HEADER_TAB_VALUES.OVERRIDE[0] : CONFIG_HEADER_TAB_VALUES.BASE_DEPLOYMENT_TEMPLATE[0],
    )

    const [shouldMergeTemplateWithPatches, setShouldMergeTemplateWithPatches] = useState<boolean>(false)
    const [selectedProtectionViewTab, setSelectedProtectionViewTab] = useState<ProtectConfigTabsType>(
        ProtectConfigTabsType.EDIT_DRAFT,
    )

    const isDryRunView = configHeaderTab === ConfigHeaderTabType.DRY_RUN
    const isInheritedView = configHeaderTab === ConfigHeaderTabType.INHERITED && !showReadMe

    const isGuiSupported = !isInheritedView && !isDryRunView

    const isPublishedValuesView: boolean = !!(
        configHeaderTab === ConfigHeaderTabType.VALUES &&
        selectedProtectionViewTab === ProtectConfigTabsType.PUBLISHED &&
        !showReadMe &&
        isProtected &&
        draftTemplateData?.latestDraft
    )

    const isCompareView =
        configHeaderTab === ConfigHeaderTabType.VALUES &&
        selectedProtectionViewTab === ProtectConfigTabsType.COMPARE &&
        !showReadMe &&
        isProtected

    const isApprovalView =
        isCompareView &&
        !!draftTemplateData?.latestDraft &&
        draftTemplateData.latestDraft.draftState === DraftState.AwaitApproval

    const isDraftAvailable: boolean = isProtected && !!draftTemplateData?.latestDraft

    const showNoOverrideEmptyState =
        !!envId &&
        !isDraftAvailable &&
        !publishedTemplateData?.isOverridden &&
        !currentEditorTemplateData?.isOverridden &&
        configHeaderTab === ConfigHeaderTabType.VALUES

    const isApprovalPendingOptionSelected =
        isApprovalView && compareFromSelectedOptionValue === CompareFromApprovalOptionsValuesType.APPROVAL_PENDING

    // TODO: Can rename as publishedOverriddenState
    const isPublishedConfigPresent = !(envId && !publishedTemplateData?.isOverridden)

    const baseDeploymentTemplateURL = `${URLS.APP}/${appId}/${URLS.APP_CONFIG}/${URLS.APP_DEPLOYMENT_CONFIG}`

    const areChangesPresent: boolean = useMemo(() => {
        if (!currentEditorTemplateData) {
            return false
        }

        // In case of hide/show locked keys have intentionally not added check for this since it is computation heavy
        const isEditorTemplateChanged =
            currentEditorTemplateData.editorTemplate !== currentEditorTemplateData.originalTemplateState.editorTemplate

        const isChartRefIdChanged =
            currentEditorTemplateData.selectedChartRefId !==
            currentEditorTemplateData.originalTemplateState.selectedChartRefId

        const areApplicationMetricsChanged =
            currentEditorTemplateData.isAppMetricsEnabled !==
            currentEditorTemplateData.originalTemplateState.isAppMetricsEnabled

        const isOverriddenStatusChanged =
            currentEditorTemplateData.isOverridden !== currentEditorTemplateData.originalTemplateState.isOverridden

        if (
            isEditorTemplateChanged ||
            isChartRefIdChanged ||
            areApplicationMetricsChanged ||
            isOverriddenStatusChanged
        ) {
            return true
        }

        return false
    }, [currentEditorTemplateData])

    const handleRemoveResolvedVariables = () => {
        setIsResolvingVariables(false)
        setResolveScopedVariables(false)
    }

    const handleToggleShowTemplateMergedWithPatch = () => {
        setShouldMergeTemplateWithPatches((prev) => !prev)
    }

    const handleUpdateProtectedTabSelection = (tab: ProtectConfigTabsType) => {
        if (tab === selectedProtectionViewTab) {
            return
        }

        handleRemoveResolvedVariables()
        setSelectedProtectionViewTab(tab)
    }

    const handleCompareFromOptionSelection = (option: SelectPickerOptionType) => {
        setCompareFromSelectedOptionValue(option.value as CompareFromApprovalOptionsValuesType)
    }

    const getChartList = async (): Promise<
        Pick<DeploymentTemplateChartStateType, 'charts' | 'chartsMetadata' | 'globalChartDetails'> &
            SelectedChartDetailsType
    > => {
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

    const handleEnableWasGuiOrHideLockedKeysEdited = () => {
        setWasGuiOrHideLockedKeysEdited(true)
    }

    const getCurrentTemplateWithLockedKeys = (): string => {
        if (!currentEditorTemplateData.removedPatches.length) {
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
                const templateWithLockedKeys = getCurrentTemplateWithLockedKeys()
                return templateWithLockedKeys
            } catch {
                // Do nothing
            }
        }

        return currentEditorTemplateData.editorTemplate
    }

    // TODO: Check all YAMLStringify for locked keys
    // FIXME: Maybe can remove param as well
    /**
     * @description - Based on views gives out payload for fetching resolved variables
     * - In case of published view, we need original resolved template of published template for GUI mode
     * - In case of edit view,  we need original resolved template of initial original state of current editor for GUI mode
     */
    const getPayloadForOriginalTemplateVariables = (): GetResolvedDeploymentTemplateProps => {
        if (isPublishedValuesView) {
            return {
                appId: +appId,
                chartRefId: publishedTemplateData.selectedChartRefId,
                // NOTE: Sending whole yaml as also doing calculation for locked keys while fetching scoped variables
                values: publishedTemplateData.editorTemplate,
                valuesAndManifestFlag: ValuesAndManifestFlagDTO.DEPLOYMENT_TEMPLATE,
                ...(envId && { envId: +envId }),
            }
        }

        return {
            appId: +appId,
            // FIXME: in case of draft mode selectedChartRefId can be different
            chartRefId: currentEditorTemplateData.selectedChartRefId,
            values: YAMLStringify(currentEditorTemplateData.originalTemplate),
            valuesAndManifestFlag: ValuesAndManifestFlagDTO.DEPLOYMENT_TEMPLATE,
            ...(envId && { envId: +envId }),
        }
    }

    const getEditorTemplateAndLockedKeys = (
        template: string,
        lockedConfigKeys: string[] = lockedConfigKeysWithLockType.config,
    ): Pick<DeploymentTemplateEditorDataStateType, 'editorTemplate' | 'removedPatches'> => {
        const removedPatches: DeploymentTemplateEditorDataStateType['removedPatches'] = []

        if (!removeLockedKeysFromYaml || !lockedConfigKeys.length) {
            return { editorTemplate: template, removedPatches }
        }

        // QUESTION: Should we wrap try catch here or at usage?
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

    const handleSetHideLockedKeys = (value: boolean) => {
        if (!removeLockedKeysFromYaml || !reapplyRemovedLockedKeysToYaml) {
            return
        }

        if (value) {
            handleEnableWasGuiOrHideLockedKeysEdited()
            const { editorTemplate, removedPatches } = getEditorTemplateAndLockedKeys(
                currentEditorTemplateData.editorTemplate,
            )
            setCurrentEditorTemplateData({
                ...currentEditorTemplateData,
                editorTemplate,
                removedPatches,
            })
            setHideLockedKeys(true)

            return
        }

        try {
            const updatedEditorValue = getCurrentTemplateWithLockedKeys()
            setCurrentEditorTemplateData({
                ...currentEditorTemplateData,
                editorTemplate: updatedEditorValue,
                removedPatches: [],
            })
            setHideLockedKeys(false)
        } catch {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Something went wrong while parsing locked keys',
            })
        }
    }

    const handleLoadScopedVariables = async () => {
        // TODO: can think about adding abort controller
        try {
            setIsResolvingVariables(true)

            // TODO: check if need to enhance this
            const shouldFetchDefaultTemplate: boolean = !!isGuiSupported

            const [currentEditorTemplate, defaultTemplate] = await Promise.all([
                getResolvedDeploymentTemplate({
                    appId: +appId,
                    chartRefId: currentEditorTemplateData.selectedChartRefId,
                    values: getCurrentEditorPayloadForScopedVariables(),
                    valuesAndManifestFlag: ValuesAndManifestFlagDTO.DEPLOYMENT_TEMPLATE,
                    ...(envId && { envId: +envId }),
                }),
                shouldFetchDefaultTemplate
                    ? getResolvedDeploymentTemplate(getPayloadForOriginalTemplateVariables())
                    : null,
            ])

            // FIXME: In case of compare, we have to fix this
            if (!currentEditorTemplate.areVariablesPresent) {
                ToastManager.showToast({
                    variant: ToastVariantType.error,
                    description: NO_SCOPED_VARIABLES_MESSAGE,
                })
                handleRemoveResolvedVariables()
                return
            }

            // Recalculate locked keys since even variable values can be object
            const { editorTemplate: resolvedEditorTemplateWithoutLockedKeys } = getEditorTemplateAndLockedKeys(
                currentEditorTemplate.resolvedData,
                // No need to send locked keys here since on load we do not resolve scoped variables
            )

            setResolvedEditorTemplate({
                originalTemplate: currentEditorTemplate.resolvedData,
                templateWithoutLockedKeys: resolvedEditorTemplateWithoutLockedKeys,
            })

            if (shouldFetchDefaultTemplate) {
                const { editorTemplate: resolvedOriginalTemplateWithoutLockedKeys } = getEditorTemplateAndLockedKeys(
                    defaultTemplate.resolvedData,
                    // No need to send locked keys here since on load we do not resolve scoped variables
                )

                setResolvedOriginalTemplate({
                    originalTemplate: defaultTemplate.resolvedData,
                    templateWithoutLockedKeys: resolvedOriginalTemplateWithoutLockedKeys,
                })
            }

            setIsResolvingVariables(false)
        } catch {
            handleRemoveResolvedVariables()
        }
    }

    const handleToggleDraftComments = () => {
        setShowDraftComments((prev) => !prev)
    }

    const handleToggleShowSaveChangesModal = () => {
        setShowSaveChangesModal((prev) => !prev)
    }

    const handleResolveScopedVariables = async () => {
        setResolveScopedVariables(true)
        await handleLoadScopedVariables()
    }

    const handleEditorChange = (value: string) => {
        if (resolveScopedVariables || isApprovalView) {
            return
        }

        try {
            YAML.parse(value)
            setCurrentEditorTemplateData({
                ...currentEditorTemplateData,
                editorTemplate: value,
                unableToParseYaml: false,
            })
        } catch {
            setCurrentEditorTemplateData({
                ...currentEditorTemplateData,
                editorTemplate: value,
                unableToParseYaml: true,
            })
        }
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
        setEditMode(ConfigurationType.GUI)
    }

    const handleChangeToYAMLMode = () => {
        if (editMode === ConfigurationType.GUI && wasGuiOrHideLockedKeysEdited) {
            try {
                applyCompareDiffOfTempFormDataOnOriginalData(
                    // TODO: Should add simpleKeys here as well?
                    YAMLStringify(currentEditorTemplateData.originalTemplate),
                    currentEditorTemplateData.editorTemplate,
                    handleEditorChange,
                )
            } catch {
                // Do nothing
            }
        }

        setEditMode(ConfigurationType.YAML)
    }

    const handleChangeDryRunEditorMode = (mode: DryRunEditorMode) => {
        setDryRunEditorMode(mode)
    }

    const handleUpdateReadmeMode = (value: boolean) => {
        handleChangeToYAMLMode()
        handleRemoveResolvedVariables()

        setShowReadMe(value)
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

        handleRemoveResolvedVariables()
        setConfigHeaderTab(tab)
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

        if (isPublishedValuesView && publishedTemplateData) {
            return publishedTemplateData.guiSchema
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
            // FIXME: IF i remove chartConfig TS is not throwing error need to check
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
                // This is the base deployment template
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
            // FIXME: IF i remove environmentConfig TS is not throwing error need to check
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

    const handleInitializePublishedData = async (
        chartRefsData: Awaited<ReturnType<typeof getChartList>>,
        lockedConfigKeys: string[],
    ): Promise<DeploymentTemplateConfigState & SelectedChartDetailsType> => {
        const shouldFetchBaseDeploymentData = !envId
        const [templateData, baseDeploymentTemplateDataResponse] = await Promise.all([
            handleFetchDeploymentTemplate(chartRefsData.selectedChart, lockedConfigKeys),
            shouldFetchBaseDeploymentData
                ? handleFetchBaseDeploymentTemplate(chartRefsData.globalChartDetails, lockedConfigKeys)
                : null,
        ])

        setBaseDeploymentTemplateData(shouldFetchBaseDeploymentData ? baseDeploymentTemplateDataResponse : templateData)
        setPublishedTemplateData(templateData)
        return templateData
    }

    const handleInitializeCurrentEditorWithPublishedData = (publishedData: DeploymentTemplateConfigState) => {
        const clonedTemplateData = structuredClone(publishedData)
        delete clonedTemplateData.editorTemplateWithoutLockedKeys

        // Since hideLockedKeys is initially false so saving it as whole
        setCurrentEditorTemplateData({
            ...clonedTemplateData,
            unableToParseYaml: false,
            removedPatches: [],
            originalTemplateState: publishedData,
        })
    }

    // Should it be method or should duplicate?
    const handleInitializePublishedDataAndCurrentEditorData = async (
        chartRefsData: Awaited<ReturnType<typeof getChartList>>,
        lockedConfigKeys: string[],
    ) => {
        const publishedData = await handleInitializePublishedData(chartRefsData, lockedConfigKeys)
        handleInitializeCurrentEditorWithPublishedData(publishedData)
    }

    // TODO: Needs to confirm type with BE
    const handleInitializeDraftData = (
        latestDraft: any,
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

            setDraftTemplateData(response)
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

        setDraftTemplateData(response)
        return response
    }

    // Should remove edit draft mode in case of error and show normal edit values view with zero drafts where user can save as draft?
    const handleLoadProtectedDeploymentTemplate = async (
        chartRefsData: Awaited<ReturnType<typeof getChartList>>,
        lockedConfigKeys: string[],
    ) => {
        // In case of error of draftResponse
        const [draftPromiseResponse, publishedDataPromiseResponse] = await Promise.allSettled([
            getDraftByResourceName(
                +appId,
                +envId || BASE_DEPLOYMENT_TEMPLATE_ENV_ID,
                3,
                environmentName
                    ? // TODO: Maybe should be constant
                      `${environmentName}-DeploymentTemplateOverride`
                    : PROTECT_BASE_DEPLOYMENT_TEMPLATE_IDENTIFIER_DTO,
            ),
            handleInitializePublishedData(chartRefsData, lockedConfigKeys),
        ])

        if (publishedDataPromiseResponse.status === 'rejected') {
            throw publishedDataPromiseResponse.reason
        }

        if (draftPromiseResponse.status === 'rejected') {
            handleInitializeCurrentEditorWithPublishedData(publishedDataPromiseResponse.value)
            return
        }

        const draftResponse = draftPromiseResponse.value
        // NOTE: In case of support for version based guiSchema this won't work
        // Since we do not have guiSchema for draft, we are using published guiSchema
        const { guiSchema } = publishedDataPromiseResponse.value

        if (
            draftResponse?.result &&
            (draftResponse.result.draftState === DraftState.Init ||
                draftResponse.result.draftState === DraftState.AwaitApproval)
        ) {
            const latestDraft = draftResponse.result
            const response = handleInitializeDraftData(latestDraft, guiSchema, chartRefsData, lockedConfigKeys)

            const clonedTemplateData = structuredClone(response)
            delete clonedTemplateData.editorTemplateWithoutLockedKeys

            // Since hideLockedKeys is initially false so saving it as whole
            setCurrentEditorTemplateData({
                ...clonedTemplateData,
                unableToParseYaml: false,
                removedPatches: [],
                originalTemplateState: response,
            })

            const isApprovalPending = latestDraft.draftState === DraftState.AwaitApproval
            if (isApprovalPending) {
                handleConfigHeaderTabChange(ConfigHeaderTabType.VALUES)
                handleUpdateProtectedTabSelection(ProtectConfigTabsType.COMPARE)
                return
            }

            handleConfigHeaderTabChange(ConfigHeaderTabType.INHERITED)
            return
        }

        // TODO: Can we move above this if
        handleInitializeCurrentEditorWithPublishedData(publishedDataPromiseResponse.value)
    }

    // TODO: Check why inf loading is happening in case of null check error
    const handleInitialDataLoad = async () => {
        // TODO: Can be collected together
        setPublishedTemplateData(null)
        setCurrentEditorTemplateData(null)
        setDraftTemplateData(null)
        setIsLoadingInitialData(true)
        setInitialLoadError(null)

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

            // TODO: Can move block somewhere to make const
            let lockedKeysConfig: typeof lockedConfigKeysWithLockType = structuredClone(DEFAULT_LOCKED_KEYS_CONFIG)
            // Not handling error since user can save without locked keys
            if (lockedKeysConfigResponse.status === 'fulfilled' && lockedKeysConfigResponse.value?.result) {
                lockedKeysConfig = structuredClone(lockedKeysConfigResponse.value.result)
            }

            setLockedConfigKeysWithLockType(lockedKeysConfig)

            setChartDetails({
                charts: chartRefsData.charts,
                chartsMetadata: chartRefsData.chartsMetadata,
                globalChartDetails: chartRefsData.globalChartDetails,
            })

            const shouldFetchDraftDetails = isProtected && typeof getDraftByResourceName === 'function'

            if (shouldFetchDraftDetails) {
                await handleLoadProtectedDeploymentTemplate(chartRefsData, lockedKeysConfig.config)
                return
            }

            await handleInitializePublishedDataAndCurrentEditorData(chartRefsData, lockedKeysConfig.config)
        } catch (error) {
            showError(error)
            setInitialLoadError(error)
        } finally {
            setIsLoadingInitialData(false)
        }
    }

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        handleInitialDataLoad()
    }, [])

    const handleReload = async () => {
        setHideLockedKeys(false)
        setResolveScopedVariables(false)
        setWasGuiOrHideLockedKeysEdited(false)
        setShowLockedDiffForApproval(false)
        setShowLockedTemplateDiffModal(false)
        setIsLoadingInitialData(true)
        setShowReadMe(false)
        // TODO: UTIL
        setEditMode(isSuperAdmin ? ConfigurationType.YAML : ConfigurationType.GUI)
        // TODO: Can be util BTW just fallback in case of error in data load
        setConfigHeaderTab(
            envId ? CONFIG_HEADER_TAB_VALUES.OVERRIDE[0] : CONFIG_HEADER_TAB_VALUES.BASE_DEPLOYMENT_TEMPLATE[0],
        )
        fetchEnvConfig(+envId || BASE_DEPLOYMENT_TEMPLATE_ENV_ID)
        // TODO: Check if async, and on change of isProtected maybe should re-call this
        await reloadEnvironments()
        await handleInitialDataLoad()
    }

    // TODO: Return type
    /**
     * Suggestion: Can break method for envId and non-envId
     * @param skipReadmeAndSchema - true only while doing handleSave
     */
    const prepareDataToSave = (skipReadmeAndSchema: boolean = false, fromDeleteOverride: boolean = false) => {
        if (!envId) {
            const editorTemplate = getCurrentTemplateWithLockedKeys()
            const editorTemplateObject: Record<string, string> = YAML.parse(editorTemplate)

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
                    documents: {
                        unedited: currentEditorTemplateData.originalTemplate,
                        edited: editorTemplateObject,
                    },
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
                // FIXME:
                isAppMetricsEnabled: currentEditorTemplateData.isAppMetricsEnabled,
                saveEligibleChanges: false,
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
                          // FIXME: Even this is wrong
                          readme: currentEditorTemplateData.readme,
                          schema: currentEditorTemplateData.schema,
                      }
                    : {}),
            }
        }

        const editorTemplate = getCurrentTemplateWithLockedKeys()
        const editorTemplateObject: Record<string, string> = YAML.parse(editorTemplate)

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
                documents: {
                    unedited: currentEditorTemplateData.originalTemplate,
                    edited: editorTemplateObject,
                },
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
        setIsSaving(true)
        try {
            // TODO: Check in case of envOverrides the service names are same but are different entities
            const apiService = getSaveAPIService()

            // TODO: Can send signal
            const response = await apiService(prepareDataToSave(true), null)
            if (response?.result?.isLockConfigError) {
                // TODO: Can think of concurrency, maybe would have to re-compute all the values
                setShowLockedTemplateDiffModal(true)
                return
            }
            setIsSaving(false)

            await handleReload()
            respondOnSuccess(!isCiPipeline)
            ToastManager.showToast({
                variant: ToastVariantType.success,
                title: currentEditorTemplateData.chartConfig.id ? 'Updated' : 'Saved',
                description: 'Changes will be reflected after next deployment.',
            })
        } catch (error) {
            // TODO: Check concurrency error due to this
            // TODO: Check when adding protected config
            // handleConfigProtectionError(2, error, dispatch, reloadEnvironments)
            // TODO: Use util from above
            if (error.code === 423) {
                setShowSaveChangesModal(true)
                reloadEnvironments()
            }
            // TODO: Remove this later
            showError(error)
            setIsSaving(false)
        }
    }

    const handleTriggerSave = async (e: SyntheticEvent) => {
        e.preventDefault()
        const shouldValidateLockChanges = lockedConfigKeysWithLockType.config.length > 0 && !isSuperAdmin

        // TODO: Try catch
        if (shouldValidateLockChanges) {
            const editorTemplate = getCurrentTemplateWithLockedKeys()

            const { ineligibleChanges } = getLockConfigEligibleAndIneligibleChanges({
                documents: {
                    unedited: currentEditorTemplateData.originalTemplate,
                    edited: YAML.parse(editorTemplate),
                },
                lockedConfigKeysWithLockType,
            })

            if (Object.keys(ineligibleChanges || {}).length) {
                setShowLockedTemplateDiffModal(true)
                return
            }
        }

        if (isProtected) {
            setShowSaveChangesModal(true)
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
            // TODO: Can think of some concurrent behaviors
            // TODO: Can common documents: { unedited, edited } for both
            const { ineligibleChanges } = getLockConfigEligibleAndIneligibleChanges({
                documents: {
                    unedited: publishedTemplateData.originalTemplate,
                    edited: draftTemplateData.originalTemplate,
                },
                lockedConfigKeysWithLockType,
            })

            if (Object.keys(ineligibleChanges || {}).length) {
                setShowLockedDiffForApproval(true)
                setShowLockedTemplateDiffModal(true)
                return false
            }
        }

        return true
    }

    const restoreLastSavedTemplate = () => {
        handleRemoveResolvedVariables()
        setWasGuiOrHideLockedKeysEdited(hideLockedKeys)

        const originalTemplateData = currentEditorTemplateData.originalTemplateState

        const stringifiedYAML = originalTemplateData.editorTemplate
        // Since have'nt stored removed patches in global scope so had to re-calculate
        const { editorTemplate, removedPatches } = getEditorTemplateAndLockedKeys(stringifiedYAML)

        // When restoring would restore everything, including schema, readme, etc, that is why not using originalTemplate from currentEditorTemplate

        setCurrentEditorTemplateData({
            ...originalTemplateData,
            editorTemplate: hideLockedKeys ? editorTemplate : stringifiedYAML,
            removedPatches: hideLockedKeys ? removedPatches : [],
            unableToParseYaml: false,
            originalTemplateState: originalTemplateData,
        })
    }

    const handleChartChange = async (selectedChart: DeploymentChartVersionType) => {
        // FIXME: Should only update config, and not editor template
        // TODO: Not the intended loading state, will change later
        setIsLoadingInitialData(true)
        setInitialLoadError(null)
        try {
            const { id, name, isAppMetricsSupported } = selectedChart
            // No need to send locked config here since won't call this method on load
            // TODO: Can be a util for whole process itself
            const templateData = await handleFetchBaseDeploymentTemplate(selectedChart)
            // TODO: Sync with product for which values to retains!!!
            // FIXME: From tech POV, it should be simple,
            // Since we want to retain edited values so, not changing editorTemplate
            // TODO: Ask if to retain app config

            // If user changing chart type then we should reset the editor template in case of version change we won't change edited template
            const isChartTypeChanged = currentEditorTemplateData?.selectedChart.name !== name

            const updatedEditorTemplateData: typeof currentEditorTemplateData = {
                ...currentEditorTemplateData,
                isAppMetricsEnabled: isAppMetricsSupported ? currentEditorTemplateData.isAppMetricsEnabled : false,
                selectedChart,
                selectedChartRefId: +id,
                schema: templateData.schema,
                readme: templateData.readme,
                guiSchema: templateData.guiSchema,
                ...(isChartTypeChanged && {
                    editorTemplate: templateData.editorTemplate,
                    // Not resetting originalTemplate since we are not changing it
                }),
            }

            // TODO: Need to confirm with product once
            if (isChartTypeChanged) {
                handleRemoveResolvedVariables()
                setHideLockedKeys(false)
            }

            setCurrentEditorTemplateData(updatedEditorTemplateData)
        } catch (error) {
            showError(error)
            setInitialLoadError(error)
        } finally {
            setIsLoadingInitialData(false)
        }
    }

    const handleCloseLockedDiffModal = () => {
        setShowLockedTemplateDiffModal(false)
    }

    const handleCloseSaveChangesModal = () => {
        setShowSaveChangesModal(false)
        handleCloseLockedDiffModal()
    }

    const handleAppMetricsToggle = () => {
        setCurrentEditorTemplateData((prevTemplateData) => ({
            ...prevTemplateData,
            isAppMetricsEnabled: !prevTemplateData.isAppMetricsEnabled,
        }))
    }

    // We don't have options for locked keys here
    const getDryRunModeEditorValue = (): string => {
        if (resolveScopedVariables) {
            return resolvedEditorTemplate.originalTemplate
        }

        return getRawEditorValueForDryRunMode()
    }

    // TODO: Maybe can separate scoped variables and non scoped variables, and then based on that we can directly get data state
    const getCurrentEditorValue = (): string => {
        if (isDryRunView) {
            return getDryRunModeEditorValue()
        }

        if (resolveScopedVariables) {
            if (isApprovalPendingOptionSelected) {
                return hideLockedKeys
                    ? resolvedOriginalTemplate.templateWithoutLockedKeys
                    : resolvedOriginalTemplate.originalTemplate
            }

            // Since editor is disabled for scoped variables we do'nt need to worry about keys changing in editor
            return hideLockedKeys
                ? resolvedEditorTemplate.templateWithoutLockedKeys
                : resolvedEditorTemplate.originalTemplate
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
     * In other cases since we need to feed uneditedDocument to GUIView, we only send stringified originalTemplate
     */
    const getUneditedDocument = (): string => {
        if (resolveScopedVariables) {
            return resolvedOriginalTemplate.originalTemplate
        }

        if (isPublishedValuesView) {
            return YAMLStringify(publishedTemplateData.originalTemplate)
        }

        // No need to handle compare mode since not using this there

        if (currentEditorTemplateData) {
            return YAMLStringify(currentEditorTemplateData.originalTemplate)
        }

        return ''
    }

    const getLockedDiffModalDocuments = () => {
        if (isApprovalView) {
            return {
                unedited: publishedTemplateData.originalTemplate,
                edited: YAML.parse(draftTemplateData.editorTemplate),
            }
        }

        const editorTemplate = getCurrentTemplateWithLockedKeys()

        return {
            unedited: currentEditorTemplateData.originalTemplate,
            edited: YAML.parse(editorTemplate),
        }
    }

    const handleCloseDeleteOverrideDialog = () => {
        setShowDeleteOverrideDialog(false)
    }

    const handleShowDeleteDraftOverrideDialog = () => {
        setShowDeleteDraftOverrideDialog(true)
    }

    const handleToggleDeleteDraftOverrideDialog = () => {
        setShowDeleteDraftOverrideDialog((prev) => !prev)
    }

    const handleOverride = () => {
        if (!envId) {
            logExceptionToSentry(new Error('Trying to access override without envId in DeploymentTemplate'))
            return
        }

        if (currentEditorTemplateData.originalTemplateState.isOverridden) {
            // Not directly overriding state since user can use cancel
            if (isProtected) {
                handleShowDeleteDraftOverrideDialog()
                return
            }

            setShowDeleteOverrideDialog(true)
            return
        }

        if (currentEditorTemplateData.isOverridden) {
            restoreLastSavedTemplate()
            return
        }

        setCurrentEditorTemplateData({
            ...currentEditorTemplateData,
            isOverridden: true,
        })
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

    const renderEditorComponent = () => {
        if (isLoadingInitialData || isResolvingVariables) {
            return (
                <div className="flex h-100 dc__overflow-scroll">
                    <Progressing pageLoader />
                </div>
            )
        }

        if (initialLoadError) {
            // TODO: re-visit reload mechanism
            return <ErrorScreenManager code={initialLoadError.code} reload={handleReload} />
        }

        if (showNoOverrideEmptyState) {
            return (
                <NoOverrideEmptyState
                    componentType={DeploymentTemplateComponentType.DEPLOYMENT_TEMPLATE}
                    environmentName={environmentName}
                    handleCreateOverride={handleOverride}
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
                    publishedEditorTemplate={YAML.parse(
                        isPublishedConfigPresent ? publishedTemplateData?.editorTemplate : '',
                    )}
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
                    isLoading={isLoadingInitialData || isResolvingVariables || isSaving}
                    handleToggleResolveScopedVariables={handleToggleResolveScopedVariables}
                    resolveScopedVariables={resolveScopedVariables}
                    editorTemplate={getCurrentEditorValue()}
                    chartRefId={getCurrentTemplateSelectedChart()?.id ? +getCurrentTemplateSelectedChart().id : null}
                    editorSchema={getCurrentEditorSchema()}
                    dryRunEditorMode={dryRunEditorMode}
                    handleChangeDryRunEditorMode={handleChangeDryRunEditorMode}
                    isDraftPresent={isDraftAvailable}
                    isPublishedConfigPresent={isPublishedConfigPresent}
                />
            )
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
                wasGuiOrHideLockedKeysEdited={wasGuiOrHideLockedKeysEdited}
                handleEnableWasGuiOrHideLockedKeysEdited={handleEnableWasGuiOrHideLockedKeysEdited}
                handleChangeToYAMLMode={handleChangeToYAMLMode}
                editorOnChange={handleEditorChange}
                editedDocument={getCurrentEditorValue()}
                uneditedDocument={getUneditedDocument()}
                showReadMe={showReadMe}
                // TODO: Confirm with product which editor to show
                readMe={currentEditorTemplateData?.readme}
                environmentName={environmentName}
                latestDraft={draftTemplateData?.latestDraft}
                isPublishedValuesView={isPublishedValuesView}
                handleOverride={handleOverride}
            />
        )
    }

    // TODO: Need to implement when we have support for merge patches
    const getShouldShowMergePatchesButton = (): boolean => false

    const handleMergeStrategyChange: ConfigToolbarProps['handleMergeStrategyChange'] = (strategy) => {
        if (!currentEditorTemplateData.mergeStrategy) {
            logExceptionToSentry(new Error('Merge strategy change without merge strategy'))
            return
        }

        const currentEditorTemplateClone = structuredClone(currentEditorTemplateData)

        const newTemplateData: typeof currentEditorTemplateClone = {
            ...currentEditorTemplateClone,
            mergeStrategy: strategy,
        }
        setCurrentEditorTemplateData(newTemplateData)
    }

    const handleOpenDiscardDraftPopup = () => {
        setPopupNodeType(ConfigToolbarPopupNodeType.DISCARD_DRAFT)
    }

    const handleShowEditHistory = () => {
        setPopupNodeType(ConfigToolbarPopupNodeType.EDIT_HISTORY)
    }

    // TODO: Product req is to close modal not go back to reverted popup menu, check if can be easily done
    const handleClearPopupNode = () => {
        setPopupNodeType(null)
    }

    const renderCTA = () => {
        const selectedChart = isPublishedValuesView
            ? publishedTemplateData?.selectedChart
            : currentEditorTemplateData?.selectedChart

        // TODO: Confirm if we are hiding in case of isDryRunView
        if (!selectedChart || isDryRunView || showNoOverrideEmptyState) {
            return null
        }

        // Have removed check of gui mode for app metrics
        const showApplicationMetrics =
            !!chartDetails?.charts?.length &&
            window._env_.APPLICATION_METRICS_ENABLED &&
            grafanaModuleStatus?.result?.status === ModuleStatus.INSTALLED

        const isAppMetricsEnabled = isPublishedValuesView
            ? !!publishedTemplateData?.isAppMetricsEnabled
            : !!currentEditorTemplateData?.isAppMetricsEnabled

        const isLoading = isLoadingInitialData || isResolvingVariables || isSaving

        const isDisabled =
            resolveScopedVariables ||
            currentEditorTemplateData.unableToParseYaml ||
            isLoadingInitialData ||
            isResolvingVariables ||
            isSaving

        if (isProtected && ProtectedDeploymentTemplateCTA) {
            return (
                <ProtectedDeploymentTemplateCTA
                    isCompareView={isCompareView}
                    isPublishedView={isPublishedValuesView}
                    showReadMe={showReadMe}
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
                showReadMe={showReadMe}
                selectedChart={selectedChart}
                isCompareView={isCompareView}
                isCiPipeline={isCiPipeline}
                handleSave={handleTriggerSave}
            />
        )
    }

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
            {renderCTA()}
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
            unableToParseData: currentEditorTemplateData?.unableToParseYaml,
            isLoading: isLoadingInitialData || isResolvingVariables || isSaving,
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
                    isDisabled={currentEditorTemplateData?.unableToParseYaml}
                    areChangesPresent={areChangesPresent}
                    isOverridable={!!envId}
                    isPublishedTemplateOverridden={publishedTemplateData?.isOverridden}
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
                        disableAllActions={
                            currentEditorTemplateData?.unableToParseYaml || isResolvingVariables || isSaving
                        }
                        configHeaderTab={configHeaderTab}
                        isProtected={isProtected}
                        isApprovalPending={draftTemplateData?.latestDraft?.draftState === DraftState.AwaitApproval}
                        isDraftPresent={isDraftAvailable}
                        approvalUsers={draftTemplateData?.latestDraft?.approvers}
                        isLoadingInitialData={isLoadingInitialData}
                        isPublishedConfigPresent={isPublishedConfigPresent}
                    >
                        <DeploymentTemplateOptionsHeader
                            disableVersionSelect={
                                isPublishedValuesView || isResolvingVariables || isSaving || isLoadingInitialData
                            }
                            editMode={editMode}
                            showReadMe={showReadMe}
                            isUnSet={isUnSet}
                            isCompareView={isCompareView}
                            handleChangeToGUIMode={handleChangeToGUIMode}
                            handleChangeToYAMLMode={handleChangeToYAMLMode}
                            unableToParseYaml={currentEditorTemplateData?.unableToParseYaml}
                            // Have'nt added check for compare since not showing the component altogether at that moment
                            canEditTemplate={!isPublishedValuesView}
                            restoreLastSavedTemplate={restoreLastSavedTemplate}
                            handleChartChange={handleChartChange}
                            chartDetails={chartDetails}
                            selectedChart={getCurrentTemplateSelectedChart()}
                            isGuiSupported={isGuiSupported}
                            areChartsLoading={isLoadingInitialData}
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

    return (
        <div className={`h-100 dc__window-bg ${showDraftComments ? 'deployment-template__comments-view' : 'flexbox'}`}>
            <div className="dc__border br-4 m-8 flexbox-col dc__content-space flex-grow-1 dc__overflow-scroll bcn-0">
                {renderBody()}

                {showDeleteOverrideDialog && (
                    <DeleteOverrideDialog
                        environmentConfigId={currentEditorTemplateData?.environmentConfig?.id}
                        handleReload={handleReload}
                        handleClose={handleCloseDeleteOverrideDialog}
                        handleShowDeleteDraftOverrideDialog={handleShowDeleteDraftOverrideDialog}
                        reloadEnvironments={reloadEnvironments}
                    />
                )}

                {DeleteOverrideDraftModal && showDeleteDraftOverrideDialog && (
                    <DeleteOverrideDraftModal
                        appId={Number(appId)}
                        envId={Number(envId)}
                        resourceType={3}
                        resourceName={`${environmentName}-DeploymentTemplateOverride`}
                        prepareDataToSave={handlePrepareDataToSaveForProtectedDeleteOverride}
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
                        lockedConfigKeysWithLockType={lockedConfigKeysWithLockType}
                        // TODO: Should not do this on runtime.
                        documents={getLockedDiffModalDocuments()}
                        // TODO: Should not send this and its state as well
                        setLockedConfigKeysWithLockType={setLockedConfigKeysWithLockType}
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
                        // TODO: Util for this name
                        resourceName={
                            environmentName
                                ? `${environmentName}-DeploymentTemplateOverride`
                                : PROTECT_BASE_DEPLOYMENT_TEMPLATE_IDENTIFIER_DTO
                        }
                        prepareDataToSave={prepareDataToSave}
                        toggleModal={handleToggleShowSaveChangesModal}
                        latestDraft={draftTemplateData?.latestDraft}
                        reload={handleReload}
                        closeLockedDiffDrawerWithChildModal={handleCloseSaveChangesModal}
                        showAsModal={!showLockedTemplateDiffModal}
                        saveEligibleChangesCb={showLockedTemplateDiffModal}
                    />
                )}
            </div>

            {DraftComments && showDraftComments && (
                <DraftComments
                    draftId={draftTemplateData?.latestDraft?.draftId}
                    draftVersionId={draftTemplateData?.latestDraft?.draftVersionId}
                    toggleDraftComments={handleToggleDraftComments}
                />
            )}
        </div>
    )
}

export default DeploymentTemplate
