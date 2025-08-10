import { Dispatch, SetStateAction, SyntheticEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Prompt } from 'react-router-dom'

import {
    AnimatedDeployButton,
    ApiQueuingWithBatch,
    BULK_DEPLOY_LATEST_IMAGE_TAG,
    ButtonStyleType,
    CDMaterialResponseType,
    CDMaterialServiceEnum,
    DEFAULT_ROUTE_PROMPT_MESSAGE,
    DeploymentNodeType,
    DeploymentStrategyTypeWithDefault,
    Drawer,
    genericCDMaterialsService,
    GenericEmptyState,
    Icon,
    MODAL_TYPE,
    ModuleNameMap,
    ModuleStatus,
    PipelineIdsVsDeploymentStrategyMap,
    ResponseType,
    SelectPickerOptionType,
    showError,
    stopPropagation,
    stringComparatorBySortOrder,
    ToastManager,
    ToastVariantType,
    uploadCDPipelineFile,
    useAsync,
    useMainContext,
    usePrompt,
} from '@devtron-labs/devtron-fe-common-lib'

import { ResponseRowType } from '@Components/ApplicationGroup/AppGroup.types'
import {
    BULK_CD_DEPLOYMENT_STATUS,
    BULK_CD_MATERIAL_STATUS,
    BUTTON_TITLE,
} from '@Components/ApplicationGroup/Constants'
import TriggerResponseModalBody, {
    TriggerResponseModalFooter,
} from '@Components/ApplicationGroup/Details/TriggerView/TriggerResponseModal'
import { getSelectedAppListForBulkStrategy } from '@Components/ApplicationGroup/Details/TriggerView/utils'
import { importComponentFromFELibrary, useAppContext } from '@Components/common'
import { getModuleInfo } from '@Components/v2/devtronStackManager/DevtronStackManager.service'

import { getIsMaterialApproved } from '../cdMaterials.utils'
import DeployImageContent from './DeployImageContent'
import DeployImageHeader from './DeployImageHeader'
import { getAppGroupDeploymentWindowMap, loadOlderImages } from './service'
import { BuildDeployModalProps, DeployImageContentProps, GetInitialAppListProps } from './types'
import {
    getBaseBulkCDDetailsMap,
    getBulkCDDetailsMapFromResponse,
    getIsExceptionUser,
    getResponseRowFromTriggerCDResponse,
    getTriggerCDPromiseMethods,
    getUpdatedMaterialsForTagSelection,
} from './utils'

const BulkCDStrategy = importComponentFromFELibrary('BulkCDStrategy', null, 'function')
const SkipHibernatedCheckbox = importComponentFromFELibrary('SkipHibernatedCheckbox', null, 'function')
const SelectDeploymentStrategy = importComponentFromFELibrary('SelectDeploymentStrategy', null, 'function')
const BulkDeployResistanceTippy = importComponentFromFELibrary('BulkDeployResistanceTippy')
const validateRuntimeParameters = importComponentFromFELibrary(
    'validateRuntimeParameters',
    () => ({ isValid: true, cellError: {} }),
    'function',
)

const BulkDeployModal = ({
    handleClose: handleCloseProp,
    handleSuccess,
    stageType,
    workflows,
    isVirtualEnvironment,
    envId,
}: BuildDeployModalProps) => {
    const { currentEnvironmentName: envName } = useAppContext()
    const { canFetchHelmAppStatus } = useMainContext()

    const [showStrategyFeasibilityPage, setShowStrategyFeasibilityPage] = useState(false)
    const [selectedAppId, setSelectedAppId] = useState<number | null>(null)
    const [isDeploymentLoading, setIsDeploymentLoading] = useState(false)
    const [skipHibernatedApps, setSkipHibernatedApps] = useState<boolean>(false)
    const [responseList, setResponseList] = useState<ResponseRowType[]>([])
    const [numberOfAppsLoading, setNumberOfAppsLoading] = useState<number>(0)
    const [isPartialActionAllowed, setIsPartialActionAllowed] = useState(false)
    const [bulkDeploymentStrategy, setBulkDeploymentStrategy] = useState<DeploymentStrategyTypeWithDefault>('DEFAULT')
    const [showResistanceBox, setShowResistanceBox] = useState(false)
    const [pipelineIdVsStrategyMap, setPipelineIdVsStrategyMap] = useState<PipelineIdsVsDeploymentStrategyMap>({})
    const [selectedImageTagOption, setSelectedImageTagOption] =
        useState<SelectPickerOptionType<string>>(BULK_DEPLOY_LATEST_IMAGE_TAG)

    const [, moduleInfoRes] = useAsync(() => getModuleInfo(ModuleNameMap.SECURITY))

    const initialDataAbortControllerRef = useRef<AbortController>(new AbortController())

    const isSecurityModuleInstalled = moduleInfoRes && moduleInfoRes?.result?.status === ModuleStatus.INSTALLED
    const isCDStage = stageType === DeploymentNodeType.CD

    usePrompt({ shouldPrompt: isDeploymentLoading })

    useEffect(
        () => () => {
            initialDataAbortControllerRef.current.abort()
        },
        [],
    )

    const handleNavigateToListView = () => {
        setShowStrategyFeasibilityPage(false)
        setPipelineIdVsStrategyMap({})
    }

    const hideResistanceBox = (): void => {
        setShowResistanceBox(false)
    }

    /**
     * WARNING: This method is not supposed to throw any error, it should always return a map of appId to BulkCDDetailType
     */
    const getInitialAppList = async ({
        appIdToReload,
        searchText,
    }: GetInitialAppListProps): Promise<DeployImageContentProps['appInfoMap']> => {
        const validWorkflows = workflows.filter(
            (workflow) =>
                workflow.isSelected &&
                (!appIdToReload || workflow.appId === appIdToReload) &&
                // Not checking pre/post cd since we need to even workflows without the stageType reason being we show warning messages for them
                workflow.nodes.some((node) => node.type === DeploymentNodeType.CD && +node.environmentId === +envId),
        )

        if (validWorkflows.length === 0) {
            return {}
        }

        const baseBulkCDDetailMap = getBaseBulkCDDetailsMap(validWorkflows, stageType, envId)

        const cdMaterialPromiseList = validWorkflows.map<() => Promise<CDMaterialResponseType>>((workflow) => {
            const currentStageNode = workflow.nodes.find(
                (node) => node.type === stageType && +node.environmentId === +envId,
            )

            if (!currentStageNode || baseBulkCDDetailMap[workflow.appId].errorMessage) {
                return () => null
            }

            return () =>
                genericCDMaterialsService(
                    CDMaterialServiceEnum.CD_MATERIALS,
                    +currentStageNode.id,
                    stageType,
                    initialDataAbortControllerRef.current.signal,
                    {
                        offset: 0,
                        size: 20,
                        search: searchText || '',
                    },
                )
        })

        if (!appIdToReload) {
            setNumberOfAppsLoading(validWorkflows.length)
        }

        const cdMaterialResponseList =
            await ApiQueuingWithBatch<Awaited<ReturnType<(typeof cdMaterialPromiseList)[number]>>>(
                cdMaterialPromiseList,
            )

        const appEnvList = validWorkflows
            .filter((workflow) => !baseBulkCDDetailMap[workflow.appId].errorMessage)
            .map((workflow) => ({
                appId: workflow.appId,
                envId: +envId,
            }))

        const { deploymentWindowMap, isPartialActionAllowed: _isPartialActionAllowed } =
            await getAppGroupDeploymentWindowMap(appEnvList, envId)

        const bulkCDDetailsMap = getBulkCDDetailsMapFromResponse({
            searchText,
            validWorkflows,
            cdMaterialResponseList,
            selectedTagName: selectedImageTagOption.value,
            baseBulkCDDetailMap,
            deploymentWindowMap,
        })

        if (!appIdToReload) {
            setIsPartialActionAllowed(_isPartialActionAllowed)
            setNumberOfAppsLoading(0)
            setSelectedAppId(validWorkflows[0].appId)
        }

        return bulkCDDetailsMap
    }

    const [isLoadingAppInfoMap, _appInfoMap, , , unTypedSetAppInfoMap] = useAsync(() => getInitialAppList({}))
    const appInfoMap: typeof _appInfoMap = _appInfoMap || {}
    const setAppInfoMap: Dispatch<SetStateAction<typeof appInfoMap>> = unTypedSetAppInfoMap

    const reloadOrSearchSelectedApp = async (searchText?: string) => {
        initialDataAbortControllerRef.current.abort()
        initialDataAbortControllerRef.current = new AbortController()

        setAppInfoMap((prev) => ({
            ...prev,
            [selectedAppId]: {
                ...prev[selectedAppId],
                areMaterialsLoading: true,
            },
        }))

        const response = await getInitialAppList({
            appIdToReload: selectedAppId,
            searchText: searchText || appInfoMap[selectedAppId]?.deployViewState?.appliedSearchText || '',
        })

        setAppInfoMap((prev) => ({
            ...prev,
            [selectedAppId]: {
                ...prev[selectedAppId],
                areMaterialsLoading: false,
            },
        }))

        const { deploymentWindowMetadata, materialError, errorMessage, tagsWarningMessage } =
            response[selectedAppId] || {}

        if (materialError) {
            showError(materialError)
            return
        }

        if (!appInfoMap[selectedAppId]) {
            setAppInfoMap((prev) => ({
                ...prev,
                ...response[selectedAppId],
            }))
            return
        }

        setAppInfoMap((prev) => ({
            ...prev,
            [selectedAppId]: {
                ...prev[selectedAppId],
                materialResponse: response[selectedAppId]?.materialResponse,
                errorMessage,
                tagsWarningMessage,
                materialError,
                deploymentWindowMetadata,
                deployViewState: {
                    ...prev[selectedAppId].deployViewState,
                    materialInEditModeMap: new Map(),
                    runtimeParamsErrorState: {
                        isValid: true,
                        cellError: {},
                    },
                },
            },
        }))
    }

    const reloadMaterials = async () => {
        await reloadOrSearchSelectedApp()
    }

    const handleLoadOlderImages = async () => {
        try {
            // Even if user changes selectedAppId this will persist since a state closure
            const selectedApp = appInfoMap[selectedAppId]

            setAppInfoMap((prev) => ({
                ...prev,
                [selectedAppId]: {
                    ...prev[selectedAppId],
                    deployViewState: {
                        ...prev[selectedAppId].deployViewState,
                        isLoadingOlderImages: true,
                    },
                },
            }))

            const materialList = selectedApp.materialResponse?.materials || []
            const appDetails = appInfoMap[selectedAppId]
            const { materialResponse, deployViewState } = appDetails
            const newMaterials = await loadOlderImages({
                materialList,
                resourceFilters: materialResponse?.resourceFilters,
                filterView: deployViewState.filterView,
                appliedSearchText: appDetails.deployViewState.appliedSearchText || '',
                stageType,
                isRollbackTrigger: false,
                pipelineId: appDetails.pipelineId,
            })

            setAppInfoMap((prev) => ({
                ...prev,
                [selectedAppId]: {
                    ...prev[selectedAppId],
                    materialResponse: {
                        ...prev[selectedAppId].materialResponse,
                        materials: newMaterials,
                    },
                    deployViewState: {
                        ...prev[selectedAppId].deployViewState,
                        isLoadingOlderImages: false,
                    },
                },
            }))
        } catch (error) {
            showError(error)
        } finally {
            setAppInfoMap((prev) => ({
                ...prev,
                [selectedAppId]: {
                    ...prev[selectedAppId],
                    deployViewState: {
                        ...prev[selectedAppId].deployViewState,
                        isLoadingOlderImages: false,
                    },
                },
            }))
        }
    }

    const uploadRuntimeParamsFile: DeployImageContentProps['uploadRuntimeParamsFile'] = ({
        file,
        allowedExtensions,
        maxUploadSize,
    }) => {
        const selectedApp = appInfoMap[selectedAppId]

        return uploadCDPipelineFile({
            file,
            allowedExtensions,
            maxUploadSize,
            appId: selectedApp.appId,
            envId,
        })
    }

    const { appIds, cdPipelineIds } = useMemo(() => {
        const sortedAppList = Object.values(appInfoMap).sort((a, b) =>
            stringComparatorBySortOrder(a.appName, b.appName),
        )

        return {
            appIds: sortedAppList.map((app) => app.appId),
            cdPipelineIds: sortedAppList.map((app) => +app.pipelineId),
        }
    }, [appInfoMap])

    const validateBulkRuntimeParams = (): boolean => {
        let isRuntimeParamErrorPresent = false

        const updatedAppInfoRes = Object.values(appInfoMap).reduce<typeof appInfoMap>((acc, appDetails) => {
            const runtimeParams = appDetails.materialResponse?.runtimeParams || []
            const validationState = validateRuntimeParameters(runtimeParams)
            isRuntimeParamErrorPresent = isRuntimeParamErrorPresent || !validationState.isValid

            acc[appDetails.appId] = {
                ...appDetails,
                deployViewState: {
                    ...appDetails.deployViewState,
                    runtimeParamsErrorState: validationState,
                },
            }

            return acc
        }, {})

        setAppInfoMap(updatedAppInfoRes)

        if (isRuntimeParamErrorPresent) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Please resolve all the runtime parameter errors before triggering the pipeline',
            })
            return false
        }

        return true
    }

    const onClickTriggerBulkCD = async (appsToRetry?: Record<string, boolean>) => {
        if (!validateBulkRuntimeParams()) {
            return
        }

        const { cdTriggerPromiseFunctions, triggeredAppIds } = getTriggerCDPromiseMethods({
            appInfoMap,
            appsToRetry,
            skipHibernatedApps,
            pipelineIdVsStrategyMap,
            stageType,
            bulkDeploymentStrategy,
        })

        setIsDeploymentLoading(true)
        setNumberOfAppsLoading(triggeredAppIds.length)

        if (!triggeredAppIds.length) {
            setIsDeploymentLoading(false)
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'No valid applications are present for deployment',
            })
            return
        }

        setResponseList([])
        const apiResponse = await ApiQueuingWithBatch<ResponseType>(cdTriggerPromiseFunctions)
        const newResponseList = getResponseRowFromTriggerCDResponse({
            apiResponse,
            appInfoMap,
            triggeredAppIds,
            envId,
            isVirtualEnvironment,
            stageType,
        })

        setResponseList(newResponseList)
        setIsDeploymentLoading(false)
        setNumberOfAppsLoading(0)
    }

    const setDeployViewState: DeployImageContentProps['setDeployViewState'] = (getUpdatedDeployViewState) => {
        setAppInfoMap((prev) => {
            const updatedDeployViewState = getUpdatedDeployViewState(prev[selectedAppId].deployViewState)
            return {
                ...prev,
                [selectedAppId]: {
                    ...prev[selectedAppId],
                    deployViewState: updatedDeployViewState,
                },
            }
        })
    }

    const setMaterialResponse: DeployImageContentProps['setMaterialResponse'] = (getUpdatedMaterialResponse) => {
        setAppInfoMap((prev) => {
            const updatedMaterialResponse = getUpdatedMaterialResponse(prev[selectedAppId].materialResponse)
            return {
                ...prev,
                [selectedAppId]: {
                    ...prev[selectedAppId],
                    materialResponse: updatedMaterialResponse,
                },
            }
        })
    }

    const onClickDeploy = async (e: SyntheticEvent) => {
        stopPropagation(e)

        if (showStrategyFeasibilityPage) {
            setShowStrategyFeasibilityPage(false)
        }
        if (isPartialActionAllowed && BulkDeployResistanceTippy && !showResistanceBox) {
            setShowResistanceBox(true)
        } else {
            await onClickTriggerBulkCD()
            setShowResistanceBox(false)
        }
    }

    const handleTagChange: DeployImageContentProps['handleTagChange'] = (tagOption) => {
        setSelectedImageTagOption(tagOption)

        setAppInfoMap((prev) => {
            const updatedAppInfoMap = structuredClone(prev)
            Object.values(updatedAppInfoMap).forEach((appDetails) => {
                const { tagsWarning, updatedMaterials } = getUpdatedMaterialsForTagSelection(
                    tagOption.value,
                    appDetails.materialResponse?.materials || [],
                )

                updatedAppInfoMap[appDetails.appId] = {
                    ...appDetails,
                    materialResponse: {
                        ...appDetails.materialResponse,
                        materials: updatedMaterials,
                    },
                    tagsWarningMessage: tagsWarning,
                }
            })
            return updatedAppInfoMap
        })
    }

    const changeApp: DeployImageContentProps['changeApp'] = (appId) => {
        setSelectedAppId(appId)
    }

    const onClickStartDeploy = async (e: SyntheticEvent) => {
        if (BulkCDStrategy && bulkDeploymentStrategy !== 'DEFAULT') {
            setShowStrategyFeasibilityPage(true)
            return
        }
        await onClickDeploy(e)
    }

    const onImageSelection: DeployImageContentProps['onImageSelection'] = () => {
        // Will just clear the tagsWarningMessage for app others are handled in DeployImageContent
        setAppInfoMap((prev) => ({
            ...prev,
            [selectedAppId]: {
                ...prev[selectedAppId],
                tagsWarningMessage: '',
            },
        }))
    }

    const isDeployButtonDisabled = useMemo(() => {
        const atleastOneImageSelected = Object.values(appInfoMap).some((appDetails) =>
            (appDetails.materialResponse?.materials || []).some((material) => material.isSelected),
        )

        if (!atleastOneImageSelected) {
            return true
        }

        return (
            isDeploymentLoading ||
            isLoadingAppInfoMap ||
            // Not disabling deploy button even if there is a warning message, since apps with warning will not have selected materials
            // and hence will not be deployed
            Object.values(appInfoMap).some((appDetails) => {
                const { areMaterialsLoading } = appDetails
                return areMaterialsLoading
            })
        )
    }, [appInfoMap, isDeploymentLoading, isLoadingAppInfoMap])

    const canDeployWithoutApproval = useMemo(
        () =>
            Object.values(appInfoMap).some((appDetails) => {
                if (!getIsExceptionUser(appDetails.materialResponse)) {
                    return false
                }

                return (appDetails.materialResponse?.materials || []).some(
                    (material) => material.isSelected && !getIsMaterialApproved(material.userApprovalMetadata),
                )
            }),
        [appInfoMap],
    )

    const canImageApproverDeploy = useMemo(
        () =>
            Object.values(appInfoMap).some((appDetails) => {
                if (!getIsExceptionUser(appDetails.materialResponse)) {
                    return false
                }

                return (appDetails.materialResponse?.materials || []).some(
                    (material) =>
                        material.isSelected &&
                        !appDetails.materialResponse?.canApproverDeploy &&
                        material.userApprovalMetadata?.hasCurrentUserApproved,
                )
            }),
        [appInfoMap],
    )

    const handleClose = () => {
        handleCloseProp()
        if (responseList.length) {
            handleSuccess()
        }
    }

    const renderContent = () => {
        if (BulkCDStrategy && showStrategyFeasibilityPage) {
            return (
                <BulkCDStrategy
                    envName={envName}
                    onClickDeploy={onClickDeploy}
                    bulkDeploymentStrategy={bulkDeploymentStrategy}
                    pipelineIdVsStrategyMap={pipelineIdVsStrategyMap}
                    setPipelineIdVsStrategyMap={setPipelineIdVsStrategyMap}
                    appList={getSelectedAppListForBulkStrategy(appInfoMap)}
                />
            )
        }

        if (responseList.length) {
            return (
                <TriggerResponseModalBody
                    responseList={responseList}
                    isLoading={isDeploymentLoading}
                    isVirtualEnv={isVirtualEnvironment}
                />
            )
        }

        if (isLoadingAppInfoMap || isDeploymentLoading) {
            const message = isDeploymentLoading
                ? BULK_CD_DEPLOYMENT_STATUS(numberOfAppsLoading, envName)
                : BULK_CD_MATERIAL_STATUS(numberOfAppsLoading)

            return (
                <GenericEmptyState
                    imgName="img-mechanical-operation"
                    title={message.title}
                    subTitle={message.subTitle}
                    contentClassName="text-center"
                />
            )
        }

        const {
            materialResponse,
            isTriggerBlockedDueToPlugin,
            configurePluginURL,
            deploymentWindowMetadata,
            pipelineId,
            appName,
            parentEnvironmentName,
            triggerType,
            deployViewState,
        } = appInfoMap[selectedAppId]

        return (
            <DeployImageContent
                appId={selectedAppId}
                envId={envId}
                materialResponse={materialResponse}
                isRollbackTrigger={false}
                isTriggerBlockedDueToPlugin={isTriggerBlockedDueToPlugin}
                configurePluginURL={configurePluginURL}
                isBulkTrigger
                deploymentWindowMetadata={deploymentWindowMetadata}
                pipelineId={pipelineId}
                handleClose={handleClose}
                onSearchApply={reloadOrSearchSelectedApp}
                stageType={stageType}
                uploadRuntimeParamsFile={uploadRuntimeParamsFile}
                appName={appName}
                isSecurityModuleInstalled={isSecurityModuleInstalled}
                envName={envName}
                reloadMaterials={reloadMaterials}
                parentEnvironmentName={parentEnvironmentName}
                isVirtualEnvironment={isVirtualEnvironment}
                loadOlderImages={handleLoadOlderImages}
                triggerType={triggerType}
                deployViewState={deployViewState}
                setDeployViewState={setDeployViewState}
                setMaterialResponse={setMaterialResponse}
                appInfoMap={appInfoMap}
                handleTagChange={handleTagChange}
                changeApp={changeApp}
                selectedTagName={selectedImageTagOption.value}
                onImageSelection={onImageSelection}
            />
        )
    }

    const renderFooter = () => {
        if (responseList.length) {
            return (
                <TriggerResponseModalFooter
                    closePopup={handleClose}
                    responseList={responseList}
                    isLoading={isDeploymentLoading}
                    onClickRetryDeploy={onClickTriggerBulkCD}
                />
            )
        }

        const showSkipHibernatedCheckbox = !!SkipHibernatedCheckbox && canFetchHelmAppStatus

        return (
            <div
                className={`dc__border-top flex ${showSkipHibernatedCheckbox ? 'dc__content-space' : 'right'} bg__primary px-20 py-16`}
            >
                {showSkipHibernatedCheckbox && (
                    <SkipHibernatedCheckbox
                        isDeploymentLoading={isDeploymentLoading}
                        envId={envId}
                        envName={envName}
                        appIds={appIds}
                        skipHibernated={skipHibernatedApps}
                        setSkipHibernated={setSkipHibernatedApps}
                    />
                )}
                <div className="flex dc__gap-8">
                    {SelectDeploymentStrategy && isCDStage && !isDeploymentLoading && !responseList.length && (
                        <SelectDeploymentStrategy
                            pipelineIds={cdPipelineIds}
                            isBulkStrategyChange
                            deploymentStrategy={bulkDeploymentStrategy}
                            setDeploymentStrategy={setBulkDeploymentStrategy}
                        />
                    )}

                    <div className="dc__position-rel tippy-over">
                        <AnimatedDeployButton
                            dataTestId="cd-trigger-deploy-button"
                            text={BUTTON_TITLE[stageType]}
                            startIcon={<Icon name={isCDStage ? 'ic-rocket-launch' : 'ic-play-outline'} color={null} />}
                            onButtonClick={onClickStartDeploy}
                            disabled={isDeployButtonDisabled}
                            isLoading={isDeploymentLoading}
                            animateStartIcon={isCDStage && !isDeployButtonDisabled}
                            style={
                                canDeployWithoutApproval || canImageApproverDeploy
                                    ? ButtonStyleType.warning
                                    : ButtonStyleType.default
                            }
                            tooltipContent={
                                canDeployWithoutApproval || canImageApproverDeploy
                                    ? 'You are authorized to deploy as an exception user for some applications'
                                    : ''
                            }
                        />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            <Drawer position="right" width="75%" minWidth="1024px" maxWidth="1200px">
                <div
                    className="flexbox-col dc__content-space h-100 bg__modal--primary shadow__modal dc__overflow-auto bulk-ci-trigger-container"
                    onClick={stopPropagation}
                >
                    <div className="flexbox-col dc__overflow-auto flex-grow-1">
                        <DeployImageHeader
                            handleClose={handleClose}
                            envName={envName}
                            stageType={stageType}
                            isRollbackTrigger={false}
                            isVirtualEnvironment={isVirtualEnvironment}
                            handleNavigateToMaterialListView={
                                showStrategyFeasibilityPage ? handleNavigateToListView : null
                            }
                            title={showStrategyFeasibilityPage ? 'Deployment feasibility for' : ''}
                        />

                        <div className="flex-grow-1 dc__overflow-auto bg__tertiary w-100">{renderContent()}</div>
                    </div>

                    {isLoadingAppInfoMap || showStrategyFeasibilityPage ? null : renderFooter()}
                </div>

                {showResistanceBox && (
                    <BulkDeployResistanceTippy
                        actionHandler={onClickStartDeploy}
                        handleOnClose={hideResistanceBox}
                        modalType={MODAL_TYPE.DEPLOY}
                    />
                )}
            </Drawer>

            <Prompt when={isDeploymentLoading} message={DEFAULT_ROUTE_PROMPT_MESSAGE} />
        </>
    )
}

export default BulkDeployModal
