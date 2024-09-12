import { useEffect, useState, SyntheticEvent } from 'react'
import {
    BaseURLParams,
    ConfigurationType,
    DeploymentChartVersionType,
    DeploymentTemplateQueryParamsType,
    DraftState,
    showError,
    useMainContext,
    useUrlFilters,
    YAMLStringify,
    DeploymentTemplateConfigState,
    DeploymentTemplateTabsType,
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
} from '@devtron-labs/devtron-fe-common-lib'
import { useParams } from 'react-router-dom'
import YAML from 'yaml'
import { toast } from 'react-toastify'
import { FloatingVariablesSuggestions, importComponentFromFELibrary } from '@Components/common'
import { getChartReferences } from '@Services/service'
import {
    getDeploymentTemplate,
    saveDeploymentTemplate,
    updateDeploymentTemplate,
} from '@Components/deploymentConfig/service'
import {
    applyCompareDiffOfTempFormDataOnOriginalData,
    getDeploymentTemplateQueryParser,
} from '@Components/deploymentConfig/utils'
import DeploymentConfigToolbar from '@Components/deploymentConfig/DeploymentTemplateView/DeploymentConfigToolbar'
import { NO_SCOPED_VARIABLES_MESSAGE } from '@Components/deploymentConfig/constants'
import { getModuleInfo } from '@Components/v2/devtronStackManager/DevtronStackManager.service'
import { SuccessToastBody } from '@Components/deploymentConfig/DeploymentTemplateView/DeploymentTemplateView.component'
import {
    DeploymentTemplateChartStateType,
    DeploymentTemplateEditorDataStateType,
    DeploymentTemplateProps,
    ResolvedEditorTemplateType,
} from './types'
import { BASE_DEPLOYMENT_TEMPLATE_ENV_ID, PROTECT_BASE_DEPLOYMENT_TEMPLATE_IDENTIFIER_DTO } from './constants'
import DeploymentTemplateOptionsHeader from './DeploymentTemplateOptionsHeader'
import DeploymentTemplateForm from './DeploymentTemplateForm'
import DeploymentTemplateCTA from './DeploymentTemplateCTA'

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
const ConfigToolbar = importComponentFromFELibrary('ConfigToolbar')
const DraftComments = importComponentFromFELibrary('DraftComments')

// FIXME: What if selectedTab is 3 and person re-freshes the page and it was approved? and cases like that
const DeploymentTemplate = ({
    // TODO: Might have to make optional
    respondOnSuccess,
    isUnSet,
    isCiPipeline,
    // FIXME: Why unused?
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    environments,
    isProtected,
    reloadEnvironments,
    environmentName,
}: DeploymentTemplateProps) => {
    // TODO: fetchEnvConfig(-1)
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
     */
    const [draftTemplateData, setDraftTemplateData] = useState<DeploymentTemplateConfigState>(null)
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
    // FIXME: Need to look into this
    const [wasGuiOrHideLockedKeysEdited, setWasGuiOrHideLockedKeysEdited] = useState<boolean>(false)
    const [showDraftComments, setShowDraftComments] = useState<boolean>(false)

    const [hideLockedKeys, setHideLockedKeys] = useState<boolean>(false)
    const [lockedConfigKeysWithLockType, setLockedConfigKeysWithLockType] = useState<ConfigKeysWithLockType>({
        config: [],
        allowed: false,
    })
    /**
     * State to show locked changes modal in case user is non super admin and is changing locked keys
     * Would be showing an info bar in locked modal
     * TODO: Maybe can combine state with showLockedTemplateDiffModal
     */
    const [showLockedDiffForApproval, setShowLockedDiffForApproval] = useState<boolean>(false)
    const [isSaving, setIsSaving] = useState<boolean>(false)
    const [showLockedTemplateDiffModal, setShowLockedTemplateDiffModal] = useState<boolean>(false)
    const [showSaveChangesModal, setShowSaveChangesModal] = useState<boolean>(false)

    // Question: Have remove appId dependency is it fine?
    const [, grafanaModuleStatus] = useAsync(() => getModuleInfo(ModuleNameMap.GRAFANA), [])

    const { selectedTab, updateSearchParams, showReadMe, editMode } = useUrlFilters<
        never,
        DeploymentTemplateQueryParamsType
    >({
        parseSearchParams: getDeploymentTemplateQueryParser(isSuperAdmin),
    })

    // TODO: Redundant check since published template enum is set based on isDraftMode
    const isPublishedValuesView: boolean = !!(
        selectedTab === DeploymentTemplateTabsType.PUBLISHED &&
        isProtected &&
        draftTemplateData?.latestDraft
    )

    const isDraftMode: boolean = isProtected && !!draftTemplateData?.latestDraft

    const getChartList = async () => {
        const chartRefResp = await getChartReferences(+appId)

        const { chartRefs, latestAppChartRef, latestChartRef, chartMetadata } = chartRefResp.result
        const selectedChartId: number = latestAppChartRef || latestChartRef
        const chart = chartRefs.find((chartRef) => chartRef.id === selectedChartId)
        const chartRefsData = {
            charts: chartRefs,
            chartsMetadata: chartMetadata,
            selectedChartRefId: selectedChartId,
            selectedChart: chart,
        }

        return chartRefsData
    }

    const handleRemoveResolvedVariables = () => {
        setIsResolvingVariables(false)
        setResolveScopedVariables(false)
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
            toast.error('Something went wrong while parsing locked keys')
        }

        return currentEditorTemplateData.editorTemplate
    }

    const getCurrentEditorPayloadForScopedVariables = (
        editorTemplateData: typeof currentEditorTemplateData,
    ): string => {
        if (isPublishedValuesView) {
            return publishedTemplateData.editorTemplate
        }

        if (hideLockedKeys) {
            try {
                const templateWithLockedKeys = getCurrentTemplateWithLockedKeys()
                return templateWithLockedKeys
            } catch {
                // Do nothing
            }
        }

        return editorTemplateData.editorTemplate
    }

    // TODO: Check all YAMLStringify for locked keys
    // FIXME: Maybe can remove param as well
    const getPayloadForOriginalTemplateVariables = (
        editorTemplateData: typeof currentEditorTemplateData,
    ): GetResolvedDeploymentTemplateProps => {
        if (isPublishedValuesView) {
            return {
                appId: +appId,
                chartRefId: publishedTemplateData.selectedChartRefId,
                // NOTE: Sending whole yaml as also doing calculation for locked keys while fetching scoped variables
                values: publishedTemplateData.editorTemplate,
                ...(envId && { envId: +envId }),
            }
        }

        if (selectedTab === DeploymentTemplateTabsType.COMPARE) {
            // TODO: Fill later
            // NOTE: might have to bring as param instead of state since onChange need to be handled
        }

        return {
            appId: +appId,
            chartRefId: editorTemplateData.selectedChartRefId,
            values: YAMLStringify(editorTemplateData.originalTemplate),
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
            toast.error('Something went wrong while parsing locked keys')
        }
    }

    const handleLoadScopedVariables = async (
        editorTemplateData: typeof currentEditorTemplateData = currentEditorTemplateData,
    ) => {
        // TODO: can think about adding abort controller
        try {
            setIsResolvingVariables(true)

            const [currentEditorTemplate, defaultTemplate] = await Promise.all([
                getResolvedDeploymentTemplate({
                    appId: +appId,
                    chartRefId: editorTemplateData.selectedChartRefId,
                    values: getCurrentEditorPayloadForScopedVariables(editorTemplateData),
                    ...(envId && { envId: +envId }),
                }),
                // TODO: In case of compare view, envId is different we get that from chart maybe? Confirm once.
                getResolvedDeploymentTemplate(getPayloadForOriginalTemplateVariables(editorTemplateData)),
            ])
            if (!currentEditorTemplate.areVariablesPresent) {
                toast.error(NO_SCOPED_VARIABLES_MESSAGE)
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

            const { editorTemplate: resolvedOriginalTemplateWithoutLockedKeys } = getEditorTemplateAndLockedKeys(
                defaultTemplate.resolvedData,
                // No need to send locked keys here since on load we do not resolve scoped variables
            )

            setResolvedOriginalTemplate({
                originalTemplate: defaultTemplate.resolvedData,
                templateWithoutLockedKeys: resolvedOriginalTemplateWithoutLockedKeys,
            })

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
        // TODO: Complete this
        const isCompareAndApprovalState = false
        if (resolveScopedVariables || isCompareAndApprovalState) {
            return
        }

        try {
            // Unset unableToParseYaml flag when yaml is successfully parsed
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

    const handleToggleReadmeMode = () => {
        // TODO: Need to add wasGuiOrHideLockedKeysEdited here as well
        updateSearchParams({
            showReadMe: !showReadMe,
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
        updateSearchParams({
            editMode: ConfigurationType.GUI,
        })
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

        updateSearchParams({
            editMode: ConfigurationType.YAML,
        })
    }

    const getCurrentTemplateSelectedChart = (): DeploymentChartVersionType => {
        // Checking if we have draft present, so that means we are on published page
        if (isPublishedValuesView && publishedTemplateData) {
            return publishedTemplateData.selectedChart
        }

        return currentEditorTemplateData?.selectedChart
    }

    /**
     * Fetched published deployment template
     */
    const handleFetchDeploymentTemplate = async (
        chartId: number,
        chartName: string,
        lockedConfigKeys: string[] = lockedConfigKeysWithLockType.config,
    ): Promise<Omit<DeploymentTemplateConfigState, 'selectedChartRefId' | 'selectedChart'>> => {
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
        } = await getDeploymentTemplate(+appId, chartId, null, chartName)

        const stringifiedTemplate = YAMLStringify(defaultAppOverride)
        const response = {
            originalTemplate: defaultAppOverride,
            schema,
            readme,
            guiSchema,
            isAppMetricsEnabled,
            chartConfig: { id, refChartTemplate, refChartTemplateVersion, chartRefId, readme },
            editorTemplate: stringifiedTemplate,
        }

        const { editorTemplate: editorTemplateWithoutLockedKeys } = getEditorTemplateAndLockedKeys(
            stringifiedTemplate,
            lockedConfigKeys,
        )
        return { ...response, editorTemplateWithoutLockedKeys }

        // TODO: Handle protected state
    }

    const handleInitializePublishedData = async (
        chartRefsData: Awaited<ReturnType<typeof getChartList>>,
        lockedConfigKeys: string[],
    ): Promise<DeploymentTemplateConfigState> => {
        const publishedTemplateDetails = await handleFetchDeploymentTemplate(
            +chartRefsData.selectedChartRefId,
            chartRefsData.selectedChart.name,
            lockedConfigKeys,
        )

        const templateDataWithSelectedChartDetails: DeploymentTemplateConfigState = {
            ...publishedTemplateDetails,
            selectedChart: chartRefsData.selectedChart,
            selectedChartRefId: chartRefsData.selectedChartRefId,
        }

        setPublishedTemplateData(templateDataWithSelectedChartDetails)
        return templateDataWithSelectedChartDetails
    }

    const handleInitializeCurrentEditorWithPublishedData = (publishedData: DeploymentTemplateConfigState) => {
        const clonedTemplateData = structuredClone(publishedData)
        delete clonedTemplateData.editorTemplateWithoutLockedKeys

        // Since hideLockedKeys is initially false so saving it as whole
        setCurrentEditorTemplateData({
            ...clonedTemplateData,
            unableToParseYaml: false,
            removedPatches: [],
        })
    }

    // Should it be method or should duplicate?
    const handleInitializePublishedDataWithCurrentEditorData = async (
        chartRefsData: Awaited<ReturnType<typeof getChartList>>,
        lockedConfigKeys: string[],
    ) => {
        const publishedData = await handleInitializePublishedData(chartRefsData, lockedConfigKeys)
        handleInitializeCurrentEditorWithPublishedData(publishedData)
    }

    // Should remove edit draft mode in case of error?
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
                    ? `${environmentName}-DeploymentTemplateOverride`
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
        // TODO: Add redirection in case of guiSchema === '{}'

        if (
            draftResponse?.result &&
            (draftResponse.result.draftState === DraftState.Init ||
                draftResponse.result.draftState === DraftState.AwaitApproval)
        ) {
            const latestDraft = draftResponse.result
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

            const clonedTemplateData = structuredClone(response)
            delete clonedTemplateData.editorTemplateWithoutLockedKeys

            // Since hideLockedKeys is initially false so saving it as whole
            setCurrentEditorTemplateData({
                ...clonedTemplateData,
                unableToParseYaml: false,
                removedPatches: [],
            })

            // TODO: Handle initial tab selection
            const isApprovalPending = latestDraft.draftState === DraftState.AwaitApproval
            if (isApprovalPending) {
                updateSearchParams({ selectedTab: DeploymentTemplateTabsType.COMPARE })
                return
            }

            updateSearchParams({ selectedTab: DeploymentTemplateTabsType.PUBLISHED })
            return
        }

        // TODO: Can move above this if
        handleInitializeCurrentEditorWithPublishedData(publishedDataPromiseResponse.value)
    }

    // TODO: Should move all these api calls to provider itself
    const handleInitialDataLoad = async () => {
        // TODO: Can be collected together
        setPublishedTemplateData(null)
        setCurrentEditorTemplateData(null)
        setDraftTemplateData(null)

        setIsLoadingInitialData(true)
        setInitialLoadError(null)

        try {
            // TODO: Ask if needed
            // reloadEnvironments()
            const [chartRefsDataResponse, lockedKeysConfigResponse] = await Promise.allSettled([
                getChartList(),
                getJsonPath ? getJsonPath(appId, envId || BASE_DEPLOYMENT_TEMPLATE_ENV_ID) : Promise.resolve(null),
            ])
            if (chartRefsDataResponse.status === 'rejected') {
                throw chartRefsDataResponse.reason
            }
            const chartRefsData = chartRefsDataResponse.value

            // TODO: Can move block somewhere to make const
            let lockedKeysConfig: typeof lockedConfigKeysWithLockType = {
                config: [],
                allowed: false,
            }
            // Not handling error since user can save without locked keys
            if (lockedKeysConfigResponse.status === 'fulfilled' && lockedKeysConfigResponse.value?.result) {
                lockedKeysConfig = structuredClone(lockedKeysConfigResponse.value.result)
            }

            setLockedConfigKeysWithLockType(lockedKeysConfig)

            setChartDetails({
                charts: chartRefsData.charts,
                chartsMetadata: chartRefsData.chartsMetadata,
            })

            if (isProtected && typeof getDraftByResourceName === 'function') {
                // TODO: Ask earlier in case of error we remove draft but i guess should show error screen
                await handleLoadProtectedDeploymentTemplate(chartRefsData, lockedKeysConfig.config)
                // TODO: Tab selection
                // TODO: Here also do'nt forget to get hideLockedKeys
                return
            }

            await handleInitializePublishedDataWithCurrentEditorData(chartRefsData, lockedKeysConfig.config)
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
        // TODO: Check if async, and on change of isProtected maybe should re-call this
        await reloadEnvironments()
        await handleInitialDataLoad()
    }

    const prepareDataToSave = (skipReadmeAndSchema: boolean = false) => {
        const editorTemplate = getCurrentTemplateWithLockedKeys()
        const editorTemplateObject = YAML.parse(editorTemplate)

        const baseRequestData = {
            ...(currentEditorTemplateData.chartConfig.chartRefId === currentEditorTemplateData.selectedChart.id
                ? currentEditorTemplateData.chartConfig
                : {}),

            appId: +appId,
            chartRefId: currentEditorTemplateData.selectedChart.id,
            // TODO: Ask backend team for this
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

    const handleSaveTemplate = async () => {
        setIsSaving(true)
        try {
            // TODO: Check in case of envOverrides the service names are same but are different entities
            const apiService = currentEditorTemplateData.chartConfig.id
                ? updateDeploymentTemplate
                : saveDeploymentTemplate

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
            toast.success(<SuccessToastBody chartConfig={currentEditorTemplateData.chartConfig} />)
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

    const handleTabSelection = (index: DeploymentTemplateTabsType) => {
        handleRemoveResolvedVariables()

        // TODO: Should be handled when we switch mode to yaml or uncheck hide locked keys
        // try {
        //     if (wasGuiOrHideLockedKeysEdited) {
        //         applyCompareDiffOfTempFormDataOnOriginalData(state.data, state.tempFormData, editorOnChange)
        //     }
        // } catch {}

        switch (index) {
            // 1 is published in case of protected config else current values in case of normal
            case 1:
                // FIXME: The enums should correspond to case values directly
                updateSearchParams({
                    selectedTab: isDraftMode ? DeploymentTemplateTabsType.PUBLISHED : DeploymentTemplateTabsType.EDIT,
                })
                break
            // 3 is edit draft in case of protected config
            case 3:
                updateSearchParams({ selectedTab: DeploymentTemplateTabsType.EDIT })
                break
            // 2 is compare values view
            case 2:
                updateSearchParams({
                    selectedTab: DeploymentTemplateTabsType.COMPARE,
                })
                break
            default:
                break
        }
    }

    const getSelectedTabIndexFromSelectedTab = () => {
        switch (selectedTab) {
            case DeploymentTemplateTabsType.COMPARE:
                return 2
            case DeploymentTemplateTabsType.EDIT: {
                if (isDraftMode) {
                    return 3
                }

                return 1
            }
            default:
                return 1
        }
    }

    const restoreLastSavedTemplate = () => {
        // TODO: Ask product once for this
        handleRemoveResolvedVariables()
        setWasGuiOrHideLockedKeysEdited(false)

        // TODO: Handle compare view
        const originalTemplateData =
            selectedTab === DeploymentTemplateTabsType.EDIT && isDraftMode ? draftTemplateData : publishedTemplateData
        const stringifiedYAML = YAMLStringify(originalTemplateData.originalTemplate)

        // No need to send locked keys here since on load we do not call this while loading
        const { editorTemplate, removedPatches } = getEditorTemplateAndLockedKeys(stringifiedYAML)

        // When restoring would restore everything, including schema, readme, etc
        // TODO: handle isEnvOverride

        setCurrentEditorTemplateData({
            ...originalTemplateData,
            editorTemplate: hideLockedKeys ? editorTemplate : stringifiedYAML,
            removedPatches: hideLockedKeys ? removedPatches : [],
            unableToParseYaml: false,
        })
    }

    // TODO: Need a method for chart change and one for chart version change
    const handleChartChange = async (selectedChart: DeploymentChartVersionType) => {
        // FIXME: Should only update config, and not editor template
        // TODO: Not the intended loading state, will change later
        setIsLoadingInitialData(true)
        try {
            const { id, name, isAppMetricsSupported } = selectedChart
            setInitialLoadError(null)
            // No need to send locked config here since won't call this method on load
            // TODO: Can be a util for whole process itself
            const templateData = await handleFetchDeploymentTemplate(+id, name)
            // TODO: Sync with product for which values to retains!!!
            // FIXME: From tech POV, it should be simple,
            // Since we want to retain edited values so, not changing editorTemplate
            // TODO: Ask if to retain app config
            const updatedEditorTemplateData: typeof currentEditorTemplateData = {
                ...currentEditorTemplateData,
                isAppMetricsEnabled: isAppMetricsSupported ? currentEditorTemplateData.isAppMetricsEnabled : false,
                selectedChart,
                selectedChartRefId: +id,
                schema: templateData.schema,
                readme: templateData.readme,
                guiSchema: templateData.guiSchema,
            }

            setCurrentEditorTemplateData(updatedEditorTemplateData)
            // TODO: Handle locked keys
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

    const getCurrentEditorValue = (): string => {
        if (resolveScopedVariables) {
            if (hideLockedKeys) {
                return resolvedEditorTemplate.templateWithoutLockedKeys
            }

            return resolvedEditorTemplate.originalTemplate
        }

        if (isPublishedValuesView) {
            if (hideLockedKeys) {
                return publishedTemplateData.editorTemplateWithoutLockedKeys
            }

            return publishedTemplateData.editorTemplate
        }

        if (selectedTab === DeploymentTemplateTabsType.COMPARE) {
            // TODO: Have to consider both draft and approval
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

        if (selectedTab === DeploymentTemplateTabsType.COMPARE) {
            // TODO: Have to consider both draft and approval
        }

        if (currentEditorTemplateData) {
            return YAMLStringify(currentEditorTemplateData.originalTemplate)
        }

        return ''
    }

    const getLockedDiffModalDocuments = () => {
        const editorTemplate = getCurrentTemplateWithLockedKeys()

        return {
            unedited: currentEditorTemplateData.originalTemplate,
            edited: YAML.parse(editorTemplate),
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

        if (showReadMe) {
            return <div>README</div>
        }

        return (
            <DeploymentTemplateForm
                editMode={editMode}
                hideLockedKeys={hideLockedKeys}
                lockedConfigKeysWithLockType={lockedConfigKeysWithLockType}
                // TODO: Add compare and approval variable here as well
                readOnly={isPublishedValuesView || resolveScopedVariables}
                selectedTab={selectedTab}
                currentEditorTemplateData={currentEditorTemplateData}
                isUnSet={isUnSet}
                wasGuiOrHideLockedKeysEdited={wasGuiOrHideLockedKeysEdited}
                handleEnableWasGuiOrHideLockedKeysEdited={handleEnableWasGuiOrHideLockedKeysEdited}
                handleChangeToYAMLMode={handleChangeToYAMLMode}
                editorOnChange={handleEditorChange}
                editedDocument={getCurrentEditorValue()}
                uneditedDocument={getUneditedDocument()}
            />
        )
    }

    const renderCTA = () => {
        const selectedChart =
            isPublishedValuesView && !showReadMe
                ? publishedTemplateData?.selectedChart
                : currentEditorTemplateData?.selectedChart

        if (!selectedChart) {
            return null
        }

        // Have remove check of gui mode for app metrics TODO: ask product
        const showApplicationMetrics =
            !!chartDetails?.charts?.length &&
            !!selectedChart &&
            window._env_.APPLICATION_METRICS_ENABLED &&
            grafanaModuleStatus?.result?.status === ModuleStatus.INSTALLED

        const isAppMetricsEnabled =
            isPublishedValuesView && !showReadMe
                ? !!publishedTemplateData?.isAppMetricsEnabled
                : !!currentEditorTemplateData?.isAppMetricsEnabled

        const isLoading = isLoadingInitialData || isResolvingVariables || isSaving

        const isDisabled =
            resolveScopedVariables ||
            currentEditorTemplateData.unableToParseYaml ||
            isLoadingInitialData ||
            isResolvingVariables ||
            isSaving

        if (isProtected) {
            return (
                <ProtectedDeploymentTemplateCTA
                    selectedTab={selectedTab}
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
                // TODO: Confirm with product about scoped variable disable action
                // FIXME: Create variable for complete loading
                // TODO: Add for env override as well
                isDisabled={isDisabled}
                isAppMetricsEnabled={isAppMetricsEnabled}
                showApplicationMetrics={showApplicationMetrics}
                toggleAppMetrics={handleAppMetricsToggle}
                showReadMe={showReadMe}
                selectedChart={selectedChart}
                selectedTab={selectedTab}
                // FIXME: On environment override
                isInheriting={false}
                isCiPipeline={isCiPipeline}
                handleSave={handleTriggerSave}
            />
        )
    }

    const renderValuesView = () => (
        <div className="flexbox-col flex-grow-1 dc__overflow-scroll">
            {window._env_.ENABLE_SCOPED_VARIABLES && (
                <div className="variables-widget-position">
                    <FloatingVariablesSuggestions zIndex={100} appId={appId} hideObjectVariables={false} />
                </div>
            )}

            <DeploymentTemplateOptionsHeader
                disableVersionSelect={isPublishedValuesView || isResolvingVariables || isSaving}
                editMode={editMode}
                showReadMe={showReadMe}
                isUnSet={isUnSet}
                selectedTab={selectedTab}
                handleChangeToGUIMode={handleChangeToGUIMode}
                handleChangeToYAMLMode={handleChangeToYAMLMode}
                unableToParseYaml={currentEditorTemplateData?.unableToParseYaml}
                // Have'nt added check for compare since not showing the component altogether at that moment
                canEditTemplate={!isPublishedValuesView}
                restoreLastSavedTemplate={restoreLastSavedTemplate}
                handleChartChange={handleChartChange}
                chartDetails={chartDetails}
                selectedChart={getCurrentTemplateSelectedChart()}
            />

            {renderEditorComponent()}
            {renderCTA()}
        </div>
    )

    return (
        <div className="h-100 flexbox">
            <div className="dc__border br-4 m-8 flexbox-col dc__content-space flex-grow-1 dc__overflow-scroll bcn-0">
                {ConfigToolbar ? (
                    <ConfigToolbar
                        loading={isLoadingInitialData || isResolvingVariables || isSaving}
                        draftId={draftTemplateData?.latestDraft?.draftId}
                        draftVersionId={draftTemplateData?.latestDraft?.draftVersionId}
                        selectedTabIndex={getSelectedTabIndexFromSelectedTab()}
                        handleTabSelection={handleTabSelection}
                        noReadme={editMode === ConfigurationType.GUI}
                        showReadme={showReadMe}
                        isReadmeAvailable={!!currentEditorTemplateData?.readme}
                        handleReadMeClick={handleToggleReadmeMode}
                        handleCommentClick={handleToggleDraftComments}
                        commentsPresent={draftTemplateData?.latestDraft?.commentsCount > 0}
                        isDraftMode={isDraftMode}
                        isApprovalPending={draftTemplateData?.latestDraft?.draftState === DraftState.AwaitApproval}
                        approvalUsers={draftTemplateData?.latestDraft?.approvers}
                        showValuesPostfix
                        reload={handleReload}
                        convertVariables={resolveScopedVariables}
                        setConvertVariables={handleToggleResolveScopedVariables}
                        componentType={3}
                        setShowLockedDiffForApproval={setShowLockedDiffForApproval}
                        setHideLockedKeys={handleSetHideLockedKeys}
                        hideLockedKeys={hideLockedKeys}
                        lockedConfigKeysWithLockType={lockedConfigKeysWithLockType}
                        inValidYaml={!!currentEditorTemplateData?.unableToParseYaml}
                        appId={appId}
                        envId={envId || BASE_DEPLOYMENT_TEMPLATE_ENV_ID}
                    />
                ) : (
                    <DeploymentConfigToolbar
                        selectedTabIndex={getSelectedTabIndexFromSelectedTab()}
                        handleTabSelection={handleTabSelection}
                        noReadme={editMode === ConfigurationType.GUI}
                        showReadme={showReadMe}
                        handleReadMeClick={handleToggleReadmeMode}
                        convertVariables={resolveScopedVariables}
                        setConvertVariables={handleToggleResolveScopedVariables}
                        unableToParseYaml={!!currentEditorTemplateData?.unableToParseYaml}
                    />
                )}

                {renderValuesView()}

                {DeploymentTemplateLockedDiff && showLockedTemplateDiffModal && (
                    <DeploymentTemplateLockedDiff
                        closeModal={handleCloseLockedDiffModal}
                        showLockedDiffForApproval={showLockedDiffForApproval}
                        onSave={handleSaveTemplate}
                        isSaving={isSaving}
                        lockedConfigKeysWithLockType={lockedConfigKeysWithLockType}
                        // TODO: Should not do this on runtime.
                        documents={getLockedDiffModalDocuments()}
                        setLockedConfigKeysWithLockType={setLockedConfigKeysWithLockType}
                        appId={appId}
                        envId={envId || BASE_DEPLOYMENT_TEMPLATE_ENV_ID}
                    />
                )}

                {SaveChangesModal && showSaveChangesModal && (
                    <SaveChangesModal
                        appId={Number(appId)}
                        envId={+envId || BASE_DEPLOYMENT_TEMPLATE_ENV_ID}
                        resourceType={3}
                        resourceName={
                            environmentName ? `${environmentName}-DeploymentTemplateOverride` : 'BaseDeploymentTemplate'
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
