import { Dispatch, SetStateAction, SyntheticEvent, useMemo, useRef, useState } from 'react'

import {
    ACTION_STATE,
    AnimatedDeployButton,
    API_STATUS_CODES,
    ApiQueuingWithBatch,
    BULK_DEPLOY_ACTIVE_IMAGE_TAG,
    BULK_DEPLOY_LATEST_IMAGE_TAG,
    ButtonStyleType,
    CDMaterialResponseType,
    CDMaterialServiceEnum,
    CDMaterialSidebarType,
    CDMaterialType,
    DEPLOYMENT_WINDOW_TYPE,
    DeploymentNodeType,
    DeploymentStrategyTypeWithDefault,
    DeploymentWindowProfileMetaData,
    Drawer,
    FilterStates,
    genericCDMaterialsService,
    GenericEmptyState,
    getStageTitle,
    Icon,
    MODAL_TYPE,
    ModuleNameMap,
    ModuleStatus,
    PipelineIdsVsDeploymentStrategyMap,
    PromiseAllStatusType,
    ResponseType,
    SelectPickerOptionType,
    showError,
    stopPropagation,
    stringComparatorBySortOrder,
    ToastManager,
    ToastVariantType,
    TriggerBlockType,
    triggerCDNode,
    uploadCDPipelineFile,
    useAsync,
    useMainContext,
    WorkflowNodeType,
    WorkflowType,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as MechanicalOperation } from '@Images/ic-mechanical-operation.svg'
import {
    BulkCDDetailDerivedFromNode,
    ResponseRowType,
    TriggerVirtualEnvResponseRowType,
} from '@Components/ApplicationGroup/AppGroup.types'
import {
    BULK_CD_DEPLOYMENT_STATUS,
    BULK_CD_MATERIAL_STATUS,
    BULK_CD_RESPONSE_STATUS_TEXT,
    BULK_VIRTUAL_RESPONSE_STATUS,
    BulkResponseStatus,
    BUTTON_TITLE,
} from '@Components/ApplicationGroup/Constants'
import TriggerResponseModalBody, {
    TriggerResponseModalFooter,
} from '@Components/ApplicationGroup/Details/TriggerView/TriggerResponseModal'
import { getSelectedAppListForBulkStrategy } from '@Components/ApplicationGroup/Details/TriggerView/utils'
import { getCDPipelineURL, importComponentFromFELibrary, useAppContext } from '@Components/common'
import { getModuleInfo } from '@Components/v2/devtronStackManager/DevtronStackManager.service'

import { getIsMaterialApproved } from '../cdMaterials.utils'
import { FilterConditionViews } from '../types'
import DeployImageContent from './DeployImageContent'
import DeployImageHeader from './DeployImageHeader'
import { loadOlderImages } from './service'
import { BuildDeployModalProps, DeployImageContentProps, GetInitialAppListProps } from './types'

const BulkCDStrategy = importComponentFromFELibrary('BulkCDStrategy', null, 'function')
const SkipHibernatedCheckbox = importComponentFromFELibrary('SkipHibernatedCheckbox', null, 'function')
const SelectDeploymentStrategy = importComponentFromFELibrary('SelectDeploymentStrategy', null, 'function')
const getDeploymentWindowStateAppGroup = importComponentFromFELibrary(
    'getDeploymentWindowStateAppGroup',
    null,
    'function',
)
const processDeploymentWindowMetadata = importComponentFromFELibrary(
    'processDeploymentWindowMetadata',
    null,
    'function',
)
const BulkDeployResistanceTippy = importComponentFromFELibrary('BulkDeployResistanceTippy')
const validateRuntimeParameters = importComponentFromFELibrary(
    'validateRuntimeParameters',
    () => ({ isValid: true, cellError: {} }),
    'function',
)
const getRuntimeParamsPayload = importComponentFromFELibrary('getRuntimeParamsPayload', null, 'function')

const BulkDeployModal = ({ handleClose, stageType, workflows, isVirtualEnvironment, envId }: BuildDeployModalProps) => {
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

    const handleNavigateToListView = () => {
        setShowStrategyFeasibilityPage(false)
        setPipelineIdVsStrategyMap({})
    }

    const hideResistanceBox = (): void => {
        setShowResistanceBox(false)
    }

    const getDeploymentWindowResponse = async (appEnvList: (Pick<WorkflowType, 'appId'> & { envId: number })[]) => {
        if (!getDeploymentWindowStateAppGroup) {
            return {}
        }

        try {
            const response = await getDeploymentWindowStateAppGroup(appEnvList)
            return response
        } catch (error) {
            showError(error)
            return {}
        }
    }

    const getTagsRelatedToMaterial = (updatedMaterials: CDMaterialType[]): string => {
        const selectedImage = updatedMaterials.find((material) => material.isSelected)

        const selectedTagParsedName =
            selectedImageTagOption.value.length > 15
                ? `${selectedImageTagOption.value.slice(0, 15)}...`
                : selectedImageTagOption.value

        const isNoImageSelected = !updatedMaterials.some((material) => material.isSelected)
        const noImageWarning = isNoImageSelected ? `Tag ${selectedTagParsedName} is not present` : ''

        const isSelectedImageVulnerable = selectedImage?.vulnerable ?? false
        const securityWarning = isSelectedImageVulnerable ? `Tag ${selectedTagParsedName} has vulnerabilities` : ''

        const isSelectedImageInEligible = selectedImage?.filterState !== FilterStates.ALLOWED
        const inEligibleFilterWarning = isSelectedImageInEligible
            ? `Tag ${selectedTagParsedName} is not eligible for deployment`
            : ''

        return noImageWarning || securityWarning || inEligibleFilterWarning
    }

    // If tag is not present, and image is selected we will show mixed tag
    const getUpdatedMaterialsForTagSelection = (tagName: string, materials: CDMaterialType[]) => {
        const sourceMaterials = structuredClone(materials)

        const updatedMaterials = sourceMaterials.map((material, materialIndex) => {
            if (tagName === BULK_DEPLOY_LATEST_IMAGE_TAG.value && materialIndex === 0) {
                return {
                    ...material,
                    isSelected: true,
                }
            }

            if (tagName === BULK_DEPLOY_ACTIVE_IMAGE_TAG.value && material.deployed && material.latest) {
                return {
                    ...material,
                    isSelected: true,
                }
            }

            const isTagPresent = material.imageReleaseTags?.some((tag) => tag.tagName === tagName)

            if (isTagPresent) {
                return {
                    ...material,
                    isSelected: true,
                }
            }

            return {
                ...material,
                isSelected: false,
            }
        })

        const selectedImage = updatedMaterials.find((material) => material.isSelected)

        const tagsWarning = getTagsRelatedToMaterial(updatedMaterials)

        if (selectedImage && tagsWarning) {
            selectedImage.isSelected = false
        }

        return {
            tagsWarning,
            updatedMaterials,
        }
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

        const baseBulkCDDetailMap = validWorkflows.reduce<Record<number, BulkCDDetailDerivedFromNode>>(
            (acc, workflow) => {
                const selectedCINode = workflow.nodes.find(
                    (node) => node.type === WorkflowNodeType.CI || node.type === WorkflowNodeType.WEBHOOK,
                )
                const doesWorkflowContainsWebhook = selectedCINode?.type === WorkflowNodeType.WEBHOOK

                // Will not be undefined since we are filtering workflows with CD node
                const cdNode = workflow.nodes.find(
                    (node) => node.type === DeploymentNodeType.CD && +node.environmentId === +envId,
                )

                // Could be undefined
                const currentStageNode = workflow.nodes.find(
                    (node) => node.type === stageType && +node.environmentId === +envId,
                )

                const isTriggerBlockedDueToPlugin =
                    currentStageNode?.isTriggerBlocked && currentStageNode?.showPluginWarning

                const isTriggerBlockedDueToMandatoryTags =
                    currentStageNode.isTriggerBlocked &&
                    currentStageNode.triggerBlockedInfo?.blockedBy === TriggerBlockType.MANDATORY_TAG

                const stageText = getStageTitle(stageType)

                const blockedStageWarning =
                    isTriggerBlockedDueToPlugin || isTriggerBlockedDueToMandatoryTags ? `${stageText} is blocked` : ''

                const noStageWarning = !currentStageNode ? `No ${stageText} stage` : ''

                acc[workflow.appId] = {
                    appId: workflow.appId,
                    appName: workflow.name,
                    pipelineId: +cdNode.id,
                    parentEnvironmentName: currentStageNode?.parentEnvironmentName,
                    isTriggerBlockedDueToPlugin,
                    configurePluginURL: getCDPipelineURL(
                        String(workflow.appId),
                        workflow.id,
                        doesWorkflowContainsWebhook ? '0' : selectedCINode.id,
                        doesWorkflowContainsWebhook,
                        cdNode.id,
                        true,
                    ),
                    // TODO: Test this since earlier it was using cdNode.triggerType
                    triggerType: currentStageNode?.triggerType,
                    warningMessage: noStageWarning || blockedStageWarning || '',
                    triggerBlockedInfo: currentStageNode?.triggerBlockedInfo,
                    stageNotAvailable: !currentStageNode,
                    showPluginWarning: currentStageNode?.showPluginWarning,
                    consequence: currentStageNode?.pluginBlockState,
                }

                return acc
            },
            {},
        )

        const cdMaterialPromiseList = validWorkflows.map<() => Promise<CDMaterialResponseType>>((workflow) => {
            const currentStageNode = workflow.nodes.find(
                (node) => node.type === stageType && +node.environmentId === +envId,
            )

            if (!currentStageNode) {
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
            .filter((workflow) => !baseBulkCDDetailMap[workflow.appId].warningMessage)
            .map((workflow) => ({
                appId: workflow.appId,
                envId: +envId,
            }))

        const deploymentWindowResponse = await getDeploymentWindowResponse(appEnvList)

        const deploymentWindowMap: Record<number, DeploymentWindowProfileMetaData> = {}
        let _isPartialActionAllowed = false

        deploymentWindowResponse?.result?.appData?.forEach((data) => {
            deploymentWindowMap[data.appId] = processDeploymentWindowMetadata(data.deploymentProfileList, envId)
            if (!_isPartialActionAllowed) {
                _isPartialActionAllowed =
                    deploymentWindowMap[data.appId].type === DEPLOYMENT_WINDOW_TYPE.BLACKOUT ||
                    !deploymentWindowMap[data.appId].isActive
                        ? deploymentWindowMap[data.appId].userActionState === ACTION_STATE.PARTIAL
                        : false
            }
        })

        const bulkCDDetailsMap: DeployImageContentProps['appInfoMap'] = {}

        cdMaterialResponseList.forEach((materialResponse, index) => {
            const { appId } = validWorkflows[index]

            if (materialResponse.status === PromiseAllStatusType.FULFILLED) {
                const { tagsWarning, updatedMaterials } = getUpdatedMaterialsForTagSelection(
                    selectedImageTagOption.value,
                    materialResponse.value.materials,
                )

                const parsedTagsWarning = searchText ? '' : tagsWarning

                const updatedWarningMessage =
                    baseBulkCDDetailMap[appId].warningMessage ||
                    deploymentWindowMap[appId]?.warningMessage ||
                    parsedTagsWarning

                // In case of search and reload even though method gives whole state, will only update deploymentWindowMetadata, warningMessage and materialResponse
                bulkCDDetailsMap[appId] = {
                    ...baseBulkCDDetailMap[appId],
                    materialResponse: {
                        ...materialResponse.value,
                        materials: searchText ? materialResponse.value.materials : updatedMaterials,
                    },
                    deploymentWindowMetadata: deploymentWindowMap[appId],
                    areMaterialsLoading: false,
                    deployViewState: {
                        searchText: '',
                        appliedSearchText: '',
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
                        showSearchBar: true,
                    },
                    warningMessage: updatedWarningMessage,
                    materialError: null,
                }
            } else {
                bulkCDDetailsMap[appId] = {
                    ...baseBulkCDDetailMap[appId],
                    materialResponse: null,
                    deploymentWindowMetadata: null,
                    deployViewState: null,
                    materialError: materialResponse.reason,
                    areMaterialsLoading: false,
                }
            }
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

        const { deploymentWindowMetadata, materialResponse, materialError, warningMessage } =
            response[selectedAppId] || {}

        if (materialError) {
            showError(materialError)
        } else {
            setAppInfoMap((prev) => ({
                ...prev,
                [selectedAppId]: {
                    ...prev[selectedAppId],
                    warningMessage,
                    materialResponse: {
                        ...prev[selectedAppId].materialResponse,
                        materials: materialResponse?.materials || [],
                    },
                    materialError,
                    deploymentWindowMetadata,
                },
            }))
        }

        setAppInfoMap((prev) => ({
            ...prev,
            [selectedAppId]: {
                ...prev[selectedAppId],
                areMaterialsLoading: false,
            },
        }))
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

    const sortedAppList = Object.values(appInfoMap || {}).sort((a, b) =>
        stringComparatorBySortOrder(a.appName, b.appName),
    )

    const appIds = sortedAppList.map((app) => app.appId)
    const cdPipelineIds = sortedAppList.map((app) => +app.pipelineId)

    const validateBulkRuntimeParams = (): boolean => {
        let isRuntimeParamErrorPresent = false

        const updatedAppInfoRes = Object.values(appInfoMap).reduce<typeof appInfoMap>((acc, appDetails) => {
            const runtimeParams = appDetails.materialResponse?.runtimeParams || {}
            const validationState = validateRuntimeParameters(runtimeParams)
            isRuntimeParamErrorPresent = !isRuntimeParamErrorPresent && !validationState.isValid

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

    // Disable for any areMaterialsLoading
    const onClickTriggerBulkCD = async (appsToRetry?: Record<string, boolean>) => {
        if (!validateBulkRuntimeParams()) {
            return
        }

        setIsDeploymentLoading(true)

        const { cdTriggerPromiseFunctions, triggeredAppIds } = Object.values(appInfoMap).reduce<{
            cdTriggerPromiseFunctions: (() => Promise<ResponseType>)[]
            triggeredAppIds: number[]
        }>(
            (acc, appDetails) => {
                if (appsToRetry && !appsToRetry[appDetails.appId.toString()]) {
                    return acc
                }

                const selectedImage = appDetails.materialResponse?.materials.find((material) => material.isSelected)

                if (!selectedImage) {
                    return acc
                }

                const pipelineId = +appDetails.pipelineId
                const strategy = pipelineIdVsStrategyMap[pipelineId]

                if (bulkDeploymentStrategy === 'DEFAULT' || !!strategy) {
                    acc.cdTriggerPromiseFunctions.push(() =>
                        triggerCDNode({
                            pipelineId,
                            ciArtifactId: +selectedImage.id,
                            appId: +appDetails.appId,
                            stageType,
                            ...(getRuntimeParamsPayload
                                ? {
                                      runtimeParamsPayload: getRuntimeParamsPayload(
                                          appDetails.materialResponse.runtimeParams ?? [],
                                      ),
                                  }
                                : {}),
                            skipIfHibernated: skipHibernatedApps,
                            // strategy DEFAULT means custom chart
                            ...(strategy && strategy !== 'DEFAULT' ? { strategy } : {}),
                        }),
                    )

                    acc.triggeredAppIds.push(+appDetails.appId)
                }

                return acc
            },
            {
                cdTriggerPromiseFunctions: [],
                triggeredAppIds: [],
            },
        )

        if (!triggeredAppIds.length) {
            setIsDeploymentLoading(false)
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'No applications selected for deployment',
            })
            return
        }

        setResponseList([])
        const newResponseList: typeof responseList = []
        const apiResponse = await ApiQueuingWithBatch<ResponseType>(cdTriggerPromiseFunctions)
        apiResponse.forEach((response, index) => {
            const appDetails = appInfoMap[triggeredAppIds[index]]

            // TODO: Common: extract statusType from code
            if (response.status === PromiseAllStatusType.FULFILLED) {
                const statusType = isVirtualEnvironment
                    ? BULK_VIRTUAL_RESPONSE_STATUS[BulkResponseStatus.PASS]
                    : BULK_CD_RESPONSE_STATUS_TEXT[BulkResponseStatus.PASS]

                const virtualEnvResponseRowType: TriggerVirtualEnvResponseRowType = isVirtualEnvironment
                    ? {
                          isVirtual: true,
                          helmPackageName: response.value?.result?.helmPackageName,
                          cdWorkflowType: stageType,
                      }
                    : {}

                newResponseList.push({
                    appId: appDetails.appId,
                    appName: appDetails.appName,
                    statusText: statusType,
                    status: BulkResponseStatus.PASS,
                    envId: +envId,
                    message: '',
                    ...virtualEnvResponseRowType,
                })
            } else {
                const errorReason = response.reason
                if (errorReason.code === API_STATUS_CODES.EXPECTATION_FAILED) {
                    const statusType = isVirtualEnvironment
                        ? BULK_VIRTUAL_RESPONSE_STATUS[BulkResponseStatus.SKIP]
                        : BULK_CD_RESPONSE_STATUS_TEXT[BulkResponseStatus.SKIP]

                    newResponseList.push({
                        appId: appDetails.appId,
                        appName: appDetails.appName,
                        statusText: statusType,
                        status: BulkResponseStatus.SKIP,
                        message: errorReason.errors[0].userMessage,
                    })
                } else if (errorReason.code === 403 || errorReason.code === 422) {
                    const statusType = isVirtualEnvironment
                        ? BULK_VIRTUAL_RESPONSE_STATUS[BulkResponseStatus.UNAUTHORIZE]
                        : BULK_CD_RESPONSE_STATUS_TEXT[BulkResponseStatus.UNAUTHORIZE]

                    newResponseList.push({
                        appId: appDetails.appId,
                        appName: appDetails.appName,
                        statusText: statusType,
                        status: BulkResponseStatus.UNAUTHORIZE,
                        message: errorReason.errors[0].userMessage,
                    })
                } else {
                    const statusType = isVirtualEnvironment
                        ? BULK_VIRTUAL_RESPONSE_STATUS[BulkResponseStatus.FAIL]
                        : BULK_CD_RESPONSE_STATUS_TEXT[BulkResponseStatus.FAIL]

                    newResponseList.push({
                        appId: appDetails.appId,
                        appName: appDetails.appName,
                        statusText: statusType,
                        status: BulkResponseStatus.FAIL,
                        message: errorReason.errors[0].userMessage,
                    })
                }
            }
        })

        setResponseList(newResponseList)
        setIsDeploymentLoading(false)
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

        const selectedApp = appInfoMap[selectedAppId]
        const updatedMaterials = getUpdatedMaterialsForTagSelection(
            tagOption.value,
            selectedApp.materialResponse?.materials || [],
        )
        const { tagsWarning, updatedMaterials: newMaterials } = updatedMaterials

        const { tagsWarning: previousTagWarning } = getUpdatedMaterialsForTagSelection(
            selectedImageTagOption.value,
            selectedApp.materialResponse?.materials || [],
        )

        setAppInfoMap((prev) => ({
            ...prev,
            [selectedAppId]: {
                ...prev[selectedAppId],
                materialResponse: {
                    ...prev[selectedAppId].materialResponse,
                    materials: newMaterials,
                },
                warningMessage: previousTagWarning ? tagsWarning : prev[selectedAppId].warningMessage,
            },
        }))
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

    const isDeployButtonDisabled = useMemo(
        () =>
            isDeploymentLoading ||
            isLoadingAppInfoMap ||
            Object.values(appInfoMap).some((appDetails) => {
                const { materialResponse, deployViewState } = appDetails
                const isMaterialsLoading = appDetails.areMaterialsLoading
                return isMaterialsLoading || !materialResponse || !deployViewState
            }),
        [appInfoMap, isDeploymentLoading, isLoadingAppInfoMap],
    )

    const canDeployWithoutApproval = useMemo(
        () =>
            Object.values(appInfoMap).some((appDetails) => {
                const isExceptionUser =
                    appDetails.materialResponse?.deploymentApprovalInfo?.approvalConfigData?.isExceptionUser ?? false

                if (!isExceptionUser) {
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
                const isExceptionUser =
                    appDetails.materialResponse?.deploymentApprovalInfo?.approvalConfigData?.isExceptionUser ?? false

                if (!isExceptionUser) {
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
                    SvgImage={MechanicalOperation}
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
                isRedirectedFromAppDetails={false}
                onSearchApply={reloadOrSearchSelectedApp}
                stageType={stageType}
                uploadRuntimeParamsFile={uploadRuntimeParamsFile}
                appName={appName}
                isSecurityModuleInstalled={isSecurityModuleInstalled}
                envName={envName}
                reloadMaterials={reloadOrSearchSelectedApp}
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
                            animateStartIcon={isCDStage}
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
                        handleNavigateToMaterialListView={showStrategyFeasibilityPage ? handleNavigateToListView : null}
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
    )
}

export default BulkDeployModal
