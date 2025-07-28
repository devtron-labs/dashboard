import { SyntheticEvent, useMemo, useState } from 'react'
import { Prompt, useHistory, useLocation } from 'react-router-dom'

import {
    ACTION_STATE,
    AnimatedDeployButton,
    API_STATUS_CODES,
    ArtifactInfo,
    Button,
    ButtonStyleType,
    ButtonVariantType,
    CDMaterialSidebarType,
    CommonNodeAttr,
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
    getIsApprovalPolicyConfigured,
    handleAnalyticsEvent,
    Icon,
    MODAL_TYPE,
    PipelineDeploymentStrategy,
    ServerErrors,
    SortingOrder,
    stopPropagation,
    ToastManager,
    ToastVariantType,
    Tooltip,
    triggerCDNode,
    useAsync,
    useDownload,
    usePrompt,
    useSearchString,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'
import { URL_PARAM_MODE_TYPE } from '@Components/common/helpers/types'
import { URLS } from '@Config/routes'

import { getCanDeployWithoutApproval, getCanImageApproverDeploy, getWfrId } from '../cdMaterials.utils'
import { CDButtonLabelMap } from '../config'
import { TRIGGER_VIEW_GA_EVENTS } from '../Constants'
import { PipelineConfigDiff, usePipelineDeploymentConfig } from '../PipelineConfigDiff'
import { PipelineConfigDiffStatusTile } from '../PipelineConfigDiff/PipelineConfigDiffStatusTile'
import { MATERIAL_TYPE, RuntimeParamsErrorState } from '../types'
import DeployImageHeader from './DeployImageHeader'
import MaterialListSkeleton from './MaterialListSkeleton'
import RuntimeParamsSidebar from './RuntimeParamsSidebar'
import { getMaterialResponseList } from './service'
import { DeployImageModalProps, RuntimeParamsSidebarProps } from './types'
import {
    getCDArtifactId,
    getCDModalHeaderText,
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
}: DeployImageModalProps) => {
    const history = useHistory()
    const { pathname } = useLocation()
    const { searchParams } = useSearchString()
    const { handleDownload } = useDownload()
    const [isInitialDataLoading, initialDataResponse, initialDataError, reloadInitialData] = useAsync(() =>
        getMaterialResponseList({
            stageType,
            pipelineId,
            appId,
            envId,
            materialType,
            initialSearch: searchParams.search || '',
        }),
    )

    const [pipelineStrategiesLoading, pipelineStrategies, pipelineStrategiesError, reloadStrategies] = useAsync(
        () => getDeploymentStrategies([pipelineId]),
        [pipelineId],
        !!getDeploymentStrategies && !!pipelineId,
    )

    const [currentSidebarTab, setCurrentSidebarTab] = useState<CDMaterialSidebarType>(CDMaterialSidebarType.PARAMETERS)
    const [runtimeParamsErrorState, setRuntimeParamsErrorState] = useState<RuntimeParamsErrorState>({
        isValid: true,
        cellError: {},
    })
    const [isDeploymentLoading, setIsDeploymentLoading] = useState<boolean>(false)
    const [deploymentStrategy, setDeploymentStrategy] = useState<DeploymentStrategyType | null>(null)
    const [showPluginWarningOverlay, setShowPluginWarningOverlay] = useState<boolean>(false)
    const [showDeploymentWindowConfirmation, setShowDeploymentWindowConfirmation] = useState(false)

    const isCDNode = stageType === DeploymentNodeType.CD
    const isPreOrPostCD = stageType === DeploymentNodeType.PRECD || stageType === DeploymentNodeType.POSTCD

    const materialResponse = initialDataResponse?.[0] || null
    const deploymentWindowMetadata = initialDataResponse?.[1] ?? ({} as (typeof initialDataResponse)[1])
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
    // This check assumes we have isPreOrPostCD as true
    const allowWarningWithTippyNodeTypeProp: CommonNodeAttr['type'] =
        stageType === DeploymentNodeType.PRECD ? 'PRECD' : 'POSTCD'
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

    const handleSidebarTabChange: RuntimeParamsSidebarProps['handleSidebarTabChange'] = (e) => {
        setCurrentSidebarTab(e.target.value as CDMaterialSidebarType)
    }

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

    const handleReviewConfigParams = () => onClickSetInitialParams(URL_PARAM_MODE_TYPE.REVIEW_CONFIG)

    const handleNavigateToListView = () => onClickSetInitialParams(URL_PARAM_MODE_TYPE.LIST)

    const onRuntimeParamsError = (updatedRuntimeParamsErrorState: typeof runtimeParamsErrorState) => {
        setRuntimeParamsErrorState(updatedRuntimeParamsErrorState)
    }

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
        onRuntimeParamsError(updatedRuntimeParamsErrorState)
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
                className={`trigger-modal__trigger dc__position-sticky dc__zi-10 ${
                    (!isRollbackTrigger && !isSelectImageTrigger) ||
                    showConfigDiffView ||
                    stageType === DeploymentNodeType.PRECD ||
                    stageType === DeploymentNodeType.POSTCD
                        ? 'flex right'
                        : ''
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

    const renderContent = () => {
        if (isInitialDataLoading) {
            return (
                <div
                    className={`flexbox-col h-100 dc__overflow-auto ${isPreOrPostCD ? 'display-grid cd-material__container-with-sidebar' : ''}`}
                >
                    <RuntimeParamsSidebar
                        areTabsDisabled
                        currentSidebarTab={currentSidebarTab}
                        handleSidebarTabChange={handleSidebarTabChange}
                        runtimeParamsErrorState={runtimeParamsErrorState}
                        appName={appName}
                    />

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

        return <div />
    }

    const renderPipelineConfigDiffHeader = () => (
        <div className="flex dc__gap-16">
            <Button
                dataTestId="cd-trigger-back-button"
                ariaLabel="Navigate to list view"
                showAriaLabelInTippy={false}
                variant={ButtonVariantType.borderLess}
                style={ButtonStyleType.neutral}
                icon={<Icon name="ic-arrow-right" rotateBy={180} color={null} />}
                onClick={handleNavigateToListView}
            />

            <h2 className="modal__title">
                {getCDModalHeaderText({
                    isRollbackTrigger,
                    stageType,
                    envName,
                    isVirtualEnvironment,
                })}
            </h2>
            {selectedMaterial && (
                <ArtifactInfo
                    {...getTriggerArtifactInfoProps({
                        material: selectedMaterial,
                        showApprovalInfoTippy:
                            (isCDNode || isRollbackTrigger) && isApprovalConfigured && ApprovalInfoTippy,
                        isRollbackTrigger,
                        appId,
                        pipelineId,
                        isExceptionUser,
                        reloadMaterials: reloadInitialData,
                        requestedUserId,
                    })}
                />
            )}
        </div>
    )

    return (
        <>
            <Drawer position="right" width="1024px" onClose={handleClose} onEscape={handleClose}>
                <div
                    className="flexbox-col dc__content-space h-100 bg__modal--primary shadow__modal dc__overflow-auto"
                    onClick={stopPropagation}
                >
                    <div
                        className="flexbox-col dc__content-space h-100 bg__modal--primary shadow__modal dc__overflow-auto"
                        onClick={stopPropagation}
                    >
                        <div className="flexbox-col dc__overflow-auto flex-grow-1">
                            {showConfigDiffView ? (
                                renderPipelineConfigDiffHeader()
                            ) : (
                                <DeployImageHeader
                                    handleClose={handleClose}
                                    envName={envName}
                                    stageType={stageType}
                                    isRollbackTrigger={isRollbackTrigger}
                                    isVirtualEnvironment={isVirtualEnvironment}
                                />
                            )}
                            <div className="flex-grow-1 dc__overflow-auto w-100">{renderContent()}</div>
                        </div>

                        {initialDataError || isInitialDataLoading ? null : (
                            <div className="flexbox dc__content-space dc__gap-12 py-16 px-20 border__primary--top dc__no-shrink">
                                {renderFooter()}
                            </div>
                        )}
                    </div>
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
