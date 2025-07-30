import { Dispatch, SetStateAction, SyntheticEvent, useMemo, useState } from 'react'
import { Prompt, useHistory, useLocation } from 'react-router-dom'

import {
    ACTION_STATE,
    AnimatedDeployButton,
    API_STATUS_CODES,
    ArtifactInfo,
    ButtonStyleType,
    CDMaterialServiceEnum,
    CDMaterialSidebarType,
    ConditionalWrap,
    DEFAULT_ROUTE_PROMPT_MESSAGE,
    DEPLOYMENT_CONFIG_DIFF_SORT_KEY,
    DeploymentAppTypes,
    DeploymentNodeType,
    DeploymentStrategyType,
    DeploymentWithConfigType,
    Drawer,
    EnvResourceType,
    ErrorScreenManager,
    FilterStates,
    genericCDMaterialsService,
    getIsApprovalPolicyConfigured,
    handleAnalyticsEvent,
    Icon,
    MODAL_TYPE,
    ModuleNameMap,
    ModuleStatus,
    noop,
    PipelineDeploymentStrategy,
    ServerErrors,
    showError,
    SortingOrder,
    stopPropagation,
    ToastManager,
    ToastVariantType,
    Tooltip,
    triggerCDNode,
    uploadCDPipelineFile,
    useAsync,
    useDownload,
    usePrompt,
    useSearchString,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'
import { URL_PARAM_MODE_TYPE } from '@Components/common/helpers/types'
import { getModuleInfo } from '@Components/v2/devtronStackManager/DevtronStackManager.service'
import { URLS } from '@Config/routes'

import { getCanDeployWithoutApproval, getCanImageApproverDeploy, getWfrId } from '../cdMaterials.utils'
import { CDButtonLabelMap } from '../config'
import { CD_MATERIAL_GA_EVENT, TRIGGER_VIEW_GA_EVENTS } from '../Constants'
import { PipelineConfigDiff, usePipelineDeploymentConfig } from '../PipelineConfigDiff'
import { PipelineConfigDiffStatusTile } from '../PipelineConfigDiff/PipelineConfigDiffStatusTile'
import { FilterConditionViews, MATERIAL_TYPE } from '../types'
import DeployImageContent from './DeployImageContent'
import DeployImageHeader from './DeployImageHeader'
import MaterialListSkeleton from './MaterialListSkeleton'
import RuntimeParamsSidebar from './RuntimeParamsSidebar'
import { getMaterialResponseList } from './service'
import { DeployImageContentProps, DeployImageModalProps, DeployViewStateType } from './types'
import {
    getAllowWarningWithTippyNodeTypeProp,
    getCDArtifactId,
    getConfigToDeployValue,
    getDeployButtonIcon,
    getInitialSelectedConfigToDeploy,
    getIsImageApprover,
    getTriggerArtifactInfoProps,
    handleTriggerErrorMessageForHelmManifestPush,
    showErrorIfNotAborted,
} from './utils'

const ApprovalInfoTippy = importComponentFromFELibrary('ApprovalInfoTippy')
const getDeploymentStrategies: (pipelineIds: number[]) => Promise<PipelineDeploymentStrategy[]> =
    importComponentFromFELibrary('getDeploymentStrategies', null, 'function')
const AllowedWithWarningTippy = importComponentFromFELibrary('AllowedWithWarningTippy')
const SelectDeploymentStrategy = importComponentFromFELibrary('SelectDeploymentStrategy', null, 'function')
const DeploymentWindowConfirmationDialog = importComponentFromFELibrary('DeploymentWindowConfirmationDialog')
const validateRuntimeParameters = importComponentFromFELibrary(
    'validateRuntimeParameters',
    () => ({ isValid: true, cellError: {} }),
    'function',
)
const getRuntimeParamsPayload = importComponentFromFELibrary('getRuntimeParamsPayload', null, 'function')
const downloadManifestForVirtualEnvironment = importComponentFromFELibrary(
    'downloadManifestForVirtualEnvironment',
    null,
    'function',
)

const DeployImageModal = ({
    appId,
    envId,
    appName,
    stageType,
    pipelineId,
    materialType,
    handleClose,
    handleSuccess,
    deploymentAppType,
    isVirtualEnvironment,
    envName,
    showPluginWarningBeforeTrigger: _showPluginWarningBeforeTrigger = false,
    consequence,
    configurePluginURL,
    triggerType,
    isRedirectedFromAppDetails,
    isTriggerBlockedDueToPlugin,
    parentEnvironmentName,
}: DeployImageModalProps) => {
    const history = useHistory()
    const { pathname } = useLocation()
    const { searchParams } = useSearchString()
    const { handleDownload } = useDownload()
    const searchImageTag = searchParams.search || ''

    const [isInitialDataLoading, initialDataResponse, initialDataError, reloadInitialData, unTypedSetInitialData] =
        useAsync(
            () =>
                getMaterialResponseList({
                    stageType,
                    pipelineId,
                    appId,
                    envId,
                    materialType,
                    initialSearch: searchImageTag,
                }),
            [searchImageTag],
        )

    const [, moduleInfoRes] = useAsync(() => getModuleInfo(ModuleNameMap.SECURITY))

    const isSecurityModuleInstalled = moduleInfoRes && moduleInfoRes?.result?.status === ModuleStatus.INSTALLED

    const setInitialData: Dispatch<SetStateAction<typeof initialDataResponse>> = unTypedSetInitialData

    const [pipelineStrategiesLoading, pipelineStrategies, pipelineStrategiesError, reloadStrategies] = useAsync(
        () => getDeploymentStrategies([pipelineId]),
        [pipelineId],
        !!getDeploymentStrategies && !!pipelineId,
    )

    const [isDeploymentLoading, setIsDeploymentLoading] = useState<boolean>(false)
    const [deploymentStrategy, setDeploymentStrategy] = useState<DeploymentStrategyType | null>(null)
    const [showPluginWarningOverlay, setShowPluginWarningOverlay] = useState<boolean>(false)
    const [showDeploymentWindowConfirmation, setShowDeploymentWindowConfirmation] = useState(false)

    const [deployViewState, setDeployViewState] = useState<Omit<DeployViewStateType, 'appliedSearchText'>>({
        searchText: searchImageTag,
        filterView: FilterConditionViews.ALL,
        showConfiguredFilters: false,
        currentSidebarTab: CDMaterialSidebarType.IMAGE,
        runtimeParamsErrorState: {
            isValid: true,
            cellError: {},
        },
        materialInEditModeMap: new Map(),
        showAppliedFilters: false,
        appliedFilterList: [],
        isLoadingOlderImages: false,
        showSearchBar: false,
    })

    const isCDNode = stageType === DeploymentNodeType.CD
    const isPreOrPostCD = stageType === DeploymentNodeType.PRECD || stageType === DeploymentNodeType.POSTCD

    const materialResponse = initialDataResponse?.[0] || null
    const deploymentWindowMetadata = initialDataResponse?.[1] ?? ({} as (typeof initialDataResponse)[1])
    const policyConsequences = initialDataResponse?.[2] ?? ({} as (typeof initialDataResponse)[2])
    const materialList = materialResponse?.materials || []
    const selectedMaterial = materialList.find((material) => material.isSelected)
    const isRollbackTrigger = materialType === MATERIAL_TYPE.rollbackMaterialList
    const isExceptionUser = materialResponse?.deploymentApprovalInfo?.approvalConfigData?.isExceptionUser ?? false
    const isApprovalConfigured = getIsApprovalPolicyConfigured(
        materialResponse?.deploymentApprovalInfo?.approvalConfigData,
    )
    const canApproverDeploy = materialResponse?.canApproverDeploy ?? false
    const showConfigDiffView = searchParams.mode === URL_PARAM_MODE_TYPE.REVIEW_CONFIG && searchParams.deploy
    const isSelectImageTrigger = materialType === MATERIAL_TYPE.inputMaterialList
    const areMaterialsPassingFilters =
        materialList.filter((materialDetails) => materialDetails.filterState === FilterStates.ALLOWED).length > 0
    const selectedConfigToDeploy = getInitialSelectedConfigToDeploy(materialType, searchParams)
    const showPluginWarningBeforeTrigger = _showPluginWarningBeforeTrigger && isPreOrPostCD
    const allowWarningWithTippyNodeTypeProp = getAllowWarningWithTippyNodeTypeProp(stageType)
    const runtimeParamsList = materialResponse?.runtimeParams || []
    const requestedUserId = materialResponse?.requestedUserId

    usePrompt({ shouldPrompt: isDeploymentLoading })

    const pipelineStrategyOptions = useMemo(
        () =>
            (pipelineStrategies ?? []).flatMap(({ error, strategies }) => {
                if (error) {
                    return []
                }
                return strategies
            }),
        [pipelineStrategies],
    )

    const wfrId = getWfrId(selectedMaterial, materialList)

    const {
        pipelineDeploymentConfigLoading,
        pipelineDeploymentConfig,
        radioSelectConfig,
        diffFound,
        noLastDeploymentConfig,
        noSpecificDeploymentConfig,
        canDeployWithConfig,
        canReviewConfig,
        scopeVariablesConfig,
        urlFilters,
        lastDeploymentWfrId,
        errorConfig,
    } = usePipelineDeploymentConfig({
        appId,
        envId,
        appName,
        envName,
        deploymentStrategy,
        setDeploymentStrategy,
        pipelineStrategyOptions,
        isRollbackTriggerSelected: isRollbackTrigger,
        pipelineId,
        wfrId,
    })

    const handleClosePluginWarningOverlay = () => {
        setShowPluginWarningOverlay(false)
    }

    const handleConfirmationClose = (e: SyntheticEvent) => {
        e.stopPropagation()
        handleClosePluginWarningOverlay()
        setShowDeploymentWindowConfirmation(false)
    }

    const onClickSetInitialParams = (modeParamValue: URL_PARAM_MODE_TYPE) => {
        const newParams = new URLSearchParams({
            ...searchParams,
            sortBy: DEPLOYMENT_CONFIG_DIFF_SORT_KEY,
            sortOrder: SortingOrder.ASC,
            mode: modeParamValue,
            deploy: getConfigToDeployValue(materialType, searchParams),
        })

        if (modeParamValue === URL_PARAM_MODE_TYPE.LIST) {
            newParams.delete('sortOrder')
            newParams.delete('sortBy')
        }

        history.push({
            pathname:
                modeParamValue === URL_PARAM_MODE_TYPE.REVIEW_CONFIG
                    ? // Replace consecutive trailing single slashes
                      `${pathname.replace(/\/+$/g, '')}/${URLS.APP_DIFF_VIEW}/${EnvResourceType.DeploymentTemplate}`
                    : `${pathname.split(`/${URLS.APP_DIFF_VIEW}`)[0]}`,
            search: newParams.toString(),
        })
    }

    const loadOlderImages = async () => {
        // TODO: Move to util
        handleAnalyticsEvent(CD_MATERIAL_GA_EVENT.FetchMoreImagesClicked)
        if (!deployViewState.isLoadingOlderImages) {
            // TODO: Move to util
            const isConsumedImageAvailable =
                materialList.some((materialItem) => materialItem.deployed && materialItem.latest) ?? false

            setDeployViewState((prevState) => ({
                ...prevState,
                isLoadingOlderImages: true,
            }))

            try {
                const newMaterialsResponse = await genericCDMaterialsService(
                    isRollbackTrigger ? CDMaterialServiceEnum.ROLLBACK : CDMaterialServiceEnum.CD_MATERIALS,
                    pipelineId,
                    stageType,
                    null,
                    {
                        offset: materialList.length - Number(isConsumedImageAvailable),
                        size: 20,
                        search: searchImageTag,
                    },
                )

                // NOTE: Looping through _newResponse and removing elements that are already deployed and latest
                // NOTE: This is done to avoid duplicate images
                const filteredNewMaterialResponse = [...newMaterialsResponse.materials].filter(
                    (materialItem) => !(materialItem.deployed && materialItem.latest),
                )

                // updating the index of materials to maintain consistency
                const _newMaterialsResponse = filteredNewMaterialResponse.map((materialItem, index) => ({
                    ...materialItem,
                    index: materialList.length + index,
                }))

                const newMaterials = structuredClone(materialList).concat(_newMaterialsResponse)
                // Made a change not updating whole response rather updating only materials
                setInitialData((prevData) => {
                    const updatedMaterialResponse = structuredClone(prevData[0])
                    updatedMaterialResponse.materials = newMaterials
                    return [updatedMaterialResponse, prevData[1], prevData[2]]
                })

                const baseSuccessMessage = `Fetched ${_newMaterialsResponse.length} images.`
                if (materialResponse?.resourceFilters?.length && !searchImageTag) {
                    const eligibleImages = _newMaterialsResponse.filter(
                        (mat) => mat.filterState === FilterStates.ALLOWED,
                    ).length

                    const infoMessage =
                        eligibleImages === 0
                            ? 'No new eligible images found.'
                            : `${eligibleImages} new eligible images found.`

                    if (deployViewState.filterView === FilterConditionViews.ELIGIBLE) {
                        ToastManager.showToast({
                            variant: ToastVariantType.info,
                            description: `${baseSuccessMessage} ${infoMessage}`,
                        })
                    } else {
                        ToastManager.showToast({
                            variant: ToastVariantType.success,
                            description: `${baseSuccessMessage} ${infoMessage}`,
                        })
                    }
                } else {
                    ToastManager.showToast({
                        variant: ToastVariantType.success,
                        description: baseSuccessMessage,
                    })
                }
            } catch (error) {
                showError(error)
            } finally {
                setDeployViewState((prevState) => ({
                    ...prevState,
                    isLoadingOlderImages: false,
                }))
            }
        }
    }

    const handleReviewConfigParams = () => onClickSetInitialParams(URL_PARAM_MODE_TYPE.REVIEW_CONFIG)

    const handleNavigateToListView = () => onClickSetInitialParams(URL_PARAM_MODE_TYPE.LIST)

    const isDeployButtonDisabled = () => {
        const selectedImage = materialList.find((artifact) => artifact.isSelected)

        return (
            !selectedImage ||
            !areMaterialsPassingFilters ||
            (isRollbackTrigger && (pipelineDeploymentConfigLoading || !canDeployWithConfig())) ||
            (selectedConfigToDeploy.value === DeploymentWithConfigType.LATEST_TRIGGER_CONFIG && noLastDeploymentConfig)
        )
    }

    const renderDeployCTATippyContent = () => {
        if (!areMaterialsPassingFilters) {
            return (
                <>
                    <h2 className="fs-12 fw-6 lh-18 m-0">No eligible images found!</h2>
                    <p className="fs-12 fw-4 lh-18 m-0">
                        Please select an image that passes the configured filters to deploy
                    </p>
                </>
            )
        }

        return (
            <>
                <h2 className="fs-12 fw-6 lh-18 m-0">Selected Config not available!</h2>
                <p className="fs-12 fw-4 lh-18 m-0">
                    {selectedConfigToDeploy.value === DeploymentWithConfigType.SPECIFIC_TRIGGER_CONFIG &&
                    noSpecificDeploymentConfig
                        ? 'Please select a different image or configuration to deploy'
                        : 'Please select a different configuration to deploy'}
                </p>
            </>
        )
    }

    const getDeployCTATippyWrapper = (children) => (
        <Tooltip alwaysShowTippyOnHover placement="top" content={renderDeployCTATippyContent()}>
            {children}
        </Tooltip>
    )

    const redirectToDeploymentStepsPage = () => {
        history.push(`/app/${appId}/cd-details/${envId}/${pipelineId}`)
    }

    const handleDeployment = (
        nodeType: DeploymentNodeType,
        _appId: number,
        ciArtifactId: number,
        deploymentWithConfig?: string,
        computedWfrId?: number,
    ) => {
        const updatedRuntimeParamsErrorState = validateRuntimeParameters(runtimeParamsList)
        setDeployViewState((prevState) => ({
            ...prevState,
            runtimeParamsErrorState: updatedRuntimeParamsErrorState,
        }))
        if (!updatedRuntimeParamsErrorState.isValid) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Please resolve all the errors before deploying',
            })
            return
        }

        handleAnalyticsEvent(TRIGGER_VIEW_GA_EVENTS.CDTriggered(nodeType))
        setIsDeploymentLoading(true)

        if (_appId && pipelineId && ciArtifactId) {
            triggerCDNode({
                pipelineId: Number(pipelineId),
                ciArtifactId: Number(ciArtifactId),
                appId: Number(_appId),
                stageType: nodeType,
                deploymentWithConfig,
                wfrId: computedWfrId,
                abortControllerRef: null,
                isRollbackTrigger,
                ...(getRuntimeParamsPayload
                    ? { runtimeParamsPayload: getRuntimeParamsPayload(runtimeParamsList ?? []) }
                    : {}),
                skipIfHibernated: false,
                ...(SelectDeploymentStrategy && deploymentStrategy ? { strategy: deploymentStrategy } : {}),
            })
                .then((response) => {
                    if (response.result) {
                        if (isVirtualEnvironment && deploymentAppType === DeploymentAppTypes.MANIFEST_DOWNLOAD) {
                            const { helmPackageName } = response.result
                            downloadManifestForVirtualEnvironment?.({
                                appId: _appId,
                                envId,
                                helmPackageName,
                                cdWorkflowType: nodeType,
                                handleDownload,
                            })
                        }

                        const msg =
                            materialType === MATERIAL_TYPE.rollbackMaterialList
                                ? 'Rollback Initiated'
                                : 'Deployment Initiated'

                        ToastManager.showToast({
                            variant: ToastVariantType.success,
                            description: msg,
                        })
                        setIsDeploymentLoading(false)
                        handleSuccess?.()
                        handleClose()
                    }
                })
                .catch((errors: ServerErrors) => {
                    if (isVirtualEnvironment && deploymentAppType === DeploymentAppTypes.MANIFEST_PUSH) {
                        handleTriggerErrorMessageForHelmManifestPush({
                            serverError: errors,
                            searchParams,
                            redirectToDeploymentStepsPage,
                        })
                    } else {
                        showErrorIfNotAborted(errors)
                    }

                    setIsDeploymentLoading(false)
                })
        } else {
            let message = _appId ? '' : 'app id missing '
            message += pipelineId ? '' : 'pipeline id missing '
            message += ciArtifactId ? '' : 'Artifact id missing '
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: message,
            })
            setIsDeploymentLoading(false)
        }
    }

    const deployTrigger = (e: SyntheticEvent) => {
        e.stopPropagation()
        handleConfirmationClose(e)
        // Blocking the deploy action if already deploying or config is not available
        if (isDeployButtonDisabled()) {
            return
        }

        const artifactId = +getCDArtifactId(selectedMaterial, materialList)

        if (isRollbackTrigger || isSelectImageTrigger) {
            const computedWfrId = isRollbackTrigger ? wfrId : lastDeploymentWfrId
            handleDeployment(stageType, appId, artifactId, selectedConfigToDeploy.value, computedWfrId)
            return
        }

        handleDeployment(stageType, appId, artifactId)
    }

    const onClickDeploy = (e, disableDeployButton: boolean) => {
        e.stopPropagation()
        if (!disableDeployButton) {
            if (!showPluginWarningOverlay && showPluginWarningBeforeTrigger) {
                setShowPluginWarningOverlay(true)
                return
            }

            if (
                deploymentWindowMetadata.userActionState &&
                deploymentWindowMetadata.userActionState !== ACTION_STATE.ALLOWED
            ) {
                setShowDeploymentWindowConfirmation(true)
                return
            }

            deployTrigger(e)
        }
    }

    const getDeployButtonStyle = (
        userActionState: string,
        canDeployWithoutApproval: boolean,
        canImageApproverDeploy: boolean,
    ): ButtonStyleType => {
        if (userActionState === ACTION_STATE.BLOCKED) {
            return ButtonStyleType.negative
        }
        if (userActionState === ACTION_STATE.PARTIAL || canDeployWithoutApproval || canImageApproverDeploy) {
            return ButtonStyleType.warning
        }
        return ButtonStyleType.default
    }

    const onSearchApply = (newSearchText: string) => {
        const newParams = new URLSearchParams({
            ...searchParams,
            search: newSearchText,
        })

        setDeployViewState((prevState) => ({
            ...prevState,
            searchText: newSearchText,
        }))

        history.push({
            pathname,
            search: newParams.toString(),
        })
    }

    const uploadRuntimeParamsFile: DeployImageContentProps['uploadRuntimeParamsFile'] = ({
        file,
        allowedExtensions,
        maxUploadSize,
    }) => uploadCDPipelineFile({ file, allowedExtensions, maxUploadSize, appId, envId })

    const renderTriggerDeployButton = (disableDeployButton: boolean) => {
        const { userActionState } = deploymentWindowMetadata
        const canDeployWithoutApproval = getCanDeployWithoutApproval(selectedMaterial, isExceptionUser)
        const canImageApproverDeploy = getCanImageApproverDeploy(selectedMaterial, canApproverDeploy, isExceptionUser)

        return (
            <AnimatedDeployButton
                dataTestId="cd-trigger-deploy-button"
                isLoading={isDeploymentLoading}
                onButtonClick={(e) => onClickDeploy(e, disableDeployButton)}
                startIcon={getDeployButtonIcon(deploymentWindowMetadata, stageType)}
                text={
                    canDeployWithoutApproval
                        ? 'Deploy without approval'
                        : `${
                              userActionState === ACTION_STATE.BLOCKED
                                  ? 'Deployment is blocked'
                                  : CDButtonLabelMap[stageType]
                          }${isVirtualEnvironment ? ' to isolated env' : ''}`
                }
                endIcon={userActionState === ACTION_STATE.BLOCKED ? <Icon name="ic-info-outline" color={null} /> : null}
                style={getDeployButtonStyle(userActionState, canDeployWithoutApproval, canImageApproverDeploy)}
                disabled={disableDeployButton}
                tooltipContent={
                    canDeployWithoutApproval || canImageApproverDeploy
                        ? 'You are authorized to deploy as an exception user'
                        : ''
                }
                animateStartIcon={
                    isCDNode && !disableDeployButton && (!userActionState || userActionState === ACTION_STATE.ALLOWED)
                }
            />
        )
    }

    const setMaterialResponse: DeployImageContentProps['setMaterialResponse'] = (callback) => {
        setInitialData((prevData) => {
            const updatedMaterialResponse = callback(structuredClone(prevData[0]))
            return [updatedMaterialResponse, prevData[1], prevData[2]]
        })
    }

    const renderFooter = () => {
        const disableDeployButton =
            isDeployButtonDisabled() ||
            (!isExceptionUser &&
                materialList.length > 0 &&
                !canApproverDeploy &&
                getIsImageApprover(selectedMaterial?.userApprovalMetadata))

        const hideConfigDiffSelector = isApprovalConfigured && disableDeployButton

        return (
            <div
                className={`w-100 ${
                    (!isRollbackTrigger && !isSelectImageTrigger) ||
                    showConfigDiffView ||
                    stageType === DeploymentNodeType.PRECD ||
                    stageType === DeploymentNodeType.POSTCD
                        ? 'flex right'
                        : 'flexbox dc__content-space'
                }`}
            >
                {!hideConfigDiffSelector &&
                (isRollbackTrigger || isSelectImageTrigger) &&
                !showConfigDiffView &&
                isCDNode ? (
                    <PipelineConfigDiffStatusTile
                        isLoading={pipelineDeploymentConfigLoading}
                        radioSelectConfig={radioSelectConfig}
                        hasDiff={diffFound}
                        onClick={handleReviewConfigParams}
                        noLastDeploymentConfig={noLastDeploymentConfig}
                        canReviewConfig={canReviewConfig()}
                        renderConfigNotAvailableTooltip={renderDeployCTATippyContent}
                    />
                ) : (
                    // NOTE: needed so that the button is pushed to the right since justify-content is set to space-between
                    <div />
                )}
                <div className="flex dc__gap-8">
                    {SelectDeploymentStrategy &&
                        isCDNode &&
                        +(pipelineStrategies?.[0]?.error?.code || 0) !== API_STATUS_CODES.NOT_FOUND && (
                            <SelectDeploymentStrategy
                                pipelineIds={[pipelineId]}
                                deploymentStrategy={deploymentStrategy}
                                setDeploymentStrategy={setDeploymentStrategy}
                                isBulkStrategyChange={false}
                                possibleStrategyOptions={pipelineStrategyOptions}
                                pipelineStrategiesLoading={pipelineStrategiesLoading}
                                pipelineStrategiesError={pipelineStrategiesError ?? pipelineStrategies?.[0]?.error}
                                reloadPipelineStrategies={reloadStrategies}
                            />
                        )}
                    <ConditionalWrap
                        condition={!pipelineDeploymentConfigLoading && isDeployButtonDisabled()}
                        wrap={getDeployCTATippyWrapper}
                    >
                        {AllowedWithWarningTippy && showPluginWarningBeforeTrigger ? (
                            <AllowedWithWarningTippy
                                consequence={consequence}
                                configurePluginURL={configurePluginURL}
                                showTriggerButton
                                onTrigger={(e) => onClickDeploy(e, disableDeployButton)}
                                nodeType={allowWarningWithTippyNodeTypeProp}
                                visible={showPluginWarningOverlay}
                                onClose={handleClosePluginWarningOverlay}
                            >
                                {renderTriggerDeployButton(disableDeployButton)}
                            </AllowedWithWarningTippy>
                        ) : (
                            renderTriggerDeployButton(disableDeployButton)
                        )}
                    </ConditionalWrap>
                </div>
            </div>
        )
    }

    const deployViewStateProps: DeployImageContentProps['deployViewState'] = {
        ...deployViewState,
        appliedSearchText: searchImageTag,
    }

    const renderContent = () => {
        if (isInitialDataLoading) {
            return (
                <div
                    className={`flexbox-col h-100 dc__overflow-auto ${isPreOrPostCD ? 'display-grid cd-material__container-with-sidebar' : ''}`}
                >
                    {isPreOrPostCD && (
                        <RuntimeParamsSidebar
                            areTabsDisabled
                            currentSidebarTab={deployViewState.currentSidebarTab}
                            handleSidebarTabChange={noop}
                            runtimeParamsErrorState={deployViewState.runtimeParamsErrorState}
                            appName={appName}
                        />
                    )}

                    <MaterialListSkeleton />
                </div>
            )
        }

        if (initialDataError) {
            return (
                <ErrorScreenManager
                    code={initialDataError?.code}
                    reload={reloadInitialData}
                    on404Redirect={handleClose}
                />
            )
        }

        if (showConfigDiffView && canReviewConfig()) {
            return (
                <PipelineConfigDiff
                    {...pipelineDeploymentConfig}
                    isLoading={pipelineDeploymentConfigLoading}
                    errorConfig={errorConfig}
                    radioSelectConfig={radioSelectConfig}
                    scopeVariablesConfig={scopeVariablesConfig}
                    urlFilters={urlFilters}
                />
            )
        }

        return (
            <DeployImageContent
                appId={appId}
                envId={envId}
                materialResponse={materialResponse}
                isRollbackTrigger={isRollbackTrigger}
                isTriggerBlockedDueToPlugin={isTriggerBlockedDueToPlugin}
                configurePluginURL={configurePluginURL}
                isBulkTrigger={false}
                deploymentWindowMetadata={deploymentWindowMetadata}
                pipelineId={pipelineId}
                handleClose={handleClose}
                isRedirectedFromAppDetails={isRedirectedFromAppDetails}
                deployViewState={deployViewStateProps}
                onSearchApply={onSearchApply}
                stageType={stageType}
                uploadRuntimeParamsFile={uploadRuntimeParamsFile}
                appName={appName}
                isSecurityModuleInstalled={isSecurityModuleInstalled}
                envName={envName}
                reloadMaterials={reloadInitialData}
                parentEnvironmentName={parentEnvironmentName}
                isVirtualEnvironment={isVirtualEnvironment}
                loadOlderImages={loadOlderImages}
                policyConsequences={policyConsequences}
                triggerType={triggerType}
                setMaterialResponse={setMaterialResponse}
                setDeployViewState={setDeployViewState}
            />
        )
    }

    return (
        <>
            <Drawer position="right" width="1024px" onClose={handleClose} onEscape={handleClose}>
                <div
                    className="flexbox-col dc__content-space h-100 bg__modal--primary shadow__modal dc__overflow-auto"
                    onClick={stopPropagation}
                >
                    <div className="flexbox-col dc__overflow-auto flex-grow-1">
                        {!deployViewState.showAppliedFilters && !deployViewState.showConfiguredFilters && (
                            <DeployImageHeader
                                handleClose={handleClose}
                                envName={envName}
                                stageType={stageType}
                                isRollbackTrigger={isRollbackTrigger}
                                isVirtualEnvironment={isVirtualEnvironment}
                                handleNavigateToMaterialListView={showConfigDiffView ? handleNavigateToListView : null}
                            >
                                {showConfigDiffView && selectedMaterial && (
                                    <ArtifactInfo
                                        {...getTriggerArtifactInfoProps({
                                            material: selectedMaterial,
                                            showApprovalInfoTippy:
                                                (isCDNode || isRollbackTrigger) &&
                                                isApprovalConfigured &&
                                                ApprovalInfoTippy,
                                            isRollbackTrigger,
                                            appId,
                                            pipelineId,
                                            isExceptionUser,
                                            reloadMaterials: reloadInitialData,
                                            requestedUserId,
                                        })}
                                    />
                                )}
                            </DeployImageHeader>
                        )}

                        <div className="flex-grow-1 dc__overflow-auto bg__tertiary w-100">{renderContent()}</div>
                    </div>

                    {initialDataError || isInitialDataLoading || materialList.length === 0 ? null : (
                        <div className="flexbox dc__content-space dc__gap-12 py-16 px-20 border__primary--top dc__no-shrink">
                            {renderFooter()}
                        </div>
                    )}
                </div>
            </Drawer>

            {DeploymentWindowConfirmationDialog && showDeploymentWindowConfirmation && (
                <DeploymentWindowConfirmationDialog
                    onClose={handleConfirmationClose}
                    type={MODAL_TYPE.DEPLOY}
                    onClickActionButton={deployTrigger}
                    appId={appId}
                    envId={envId}
                    envName={envName}
                />
            )}

            <Prompt when={isDeploymentLoading} message={DEFAULT_ROUTE_PROMPT_MESSAGE} />
        </>
    )
}

export default DeployImageModal
