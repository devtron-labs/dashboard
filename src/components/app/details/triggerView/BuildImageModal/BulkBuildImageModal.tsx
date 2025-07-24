import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'

import {
    API_STATUS_CODES,
    ApiQueuingWithBatch,
    Button,
    ComponentSizeType,
    DocLink,
    Drawer,
    GenericEmptyState,
    handleAnalyticsEvent,
    Icon,
    ModuleNameMap,
    Progressing,
    PromiseAllStatusType,
    RuntimePluginVariables,
    showError,
    stopPropagation,
    stringComparatorBySortOrder,
    ToastManager,
    ToastVariantType,
    useAsync,
    WorkflowNodeType,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as MechanicalOperation } from '@Images/ic-mechanical-operation.svg'
import { BulkCIDetailType, ResponseRowType } from '@Components/ApplicationGroup/AppGroup.types'
import {
    BULK_CI_BUILD_STATUS,
    BULK_CI_MATERIAL_STATUS,
    BULK_CI_RESPONSE_STATUS_TEXT,
    BulkResponseStatus,
    ENV_TRIGGER_VIEW_GA_EVENTS,
} from '@Components/ApplicationGroup/Constants'
import TriggerResponseModalBody, {
    TriggerResponseModalFooter,
} from '@Components/ApplicationGroup/Details/TriggerView/TriggerResponseModal'
import { importComponentFromFELibrary } from '@Components/common'
import { SOURCE_NOT_CONFIGURED } from '@Config/constants'

import { getModuleConfigured } from '../../appDetails/appDetails.service'
import { IGNORE_CACHE_INFO } from '../Constants'
import BuildImageHeader from './BuildImageHeader'
import GitInfoMaterial from './GitInfoMaterial'
import { getCIMaterials } from './service'
import { BulkBuildImageModalProps, GitInfoMaterialProps } from './types'
import {
    getBulkCIDataPromiseGetterList,
    getBulkCIErrorMessage,
    getTriggerCIPromiseListAndSkippedResources,
    parseBulkCIResponseIntoBulkCIDetail,
} from './utils'

const validateRuntimeParameters = importComponentFromFELibrary(
    'validateRuntimeParameters',
    () => ({ isValid: true, cellError: {} }),
    'function',
)

const BulkBuildImageModal = ({
    handleClose: handleCloseProp,
    workflows,
    reloadWorkflows,
    filteredCIPipelineMap,
    reloadWorkflowStatus,
}: BulkBuildImageModalProps) => {
    const [selectedAppIdState, setSelectedAppIdState] = useState<number | null>(null)
    const [showWebhookModal, setShowWebhookModal] = useState(false)
    const [isBuildTriggerLoading, setIsBuildTriggerLoading] = useState(false)
    const [responseList, setResponseList] = useState<ResponseRowType[]>([])

    const [blobStorageConfigurationLoading, blobStorageConfiguration] = useAsync(() =>
        getModuleConfigured(ModuleNameMap.BLOB_STORAGE),
    )

    const blobStorageNotConfigured = !blobStorageConfigurationLoading && !blobStorageConfiguration?.result?.enabled

    const initialDataAbortControllerRef = useRef<AbortController>(new AbortController())

    const selectedWorkflows = workflows.filter(
        (workflow) =>
            workflow.isSelected &&
            workflow.nodes.some((node) => node.type === WorkflowNodeType.CI || node.type === WorkflowNodeType.WEBHOOK),
    )

    const [numberOfAppsLoading, setNumberOfAppsLoading] = useState<number>(0)

    // Returns map of appId to BulkCIDetailType
    const getInitialAppList = async (appId?: number): Promise<Record<number, BulkCIDetailType>> => {
        const validWorkflows = selectedWorkflows.filter((workflow) => !appId || workflow.appId === appId)

        const { ciMaterialPromiseList, runtimeParamsPromiseList } = getBulkCIDataPromiseGetterList(
            validWorkflows,
            initialDataAbortControllerRef,
        )

        setNumberOfAppsLoading(validWorkflows.length)

        if (ciMaterialPromiseList.length === 0) {
            return []
        }

        const ciMaterialList =
            await ApiQueuingWithBatch<Awaited<ReturnType<typeof getCIMaterials>>>(ciMaterialPromiseList)
        const runtimeParamsList = await ApiQueuingWithBatch<RuntimePluginVariables[]>(runtimeParamsPromiseList)

        setNumberOfAppsLoading(0)

        const bulkCIDetailsMap = parseBulkCIResponseIntoBulkCIDetail({
            ciMaterialList,
            runtimeParamsList,
            validWorkflows,
            filteredCIPipelineMap,
        })

        return bulkCIDetailsMap
    }

    const [isLoadingAppInfoMap, appInfoMapRes, , , setAppInfoMapResWithoutType] = useAsync(getInitialAppList)
    const [isLoadingSingleAppInfoMap, setIsLoadingSingleAppInfoMap] = useState<boolean>(false)

    const setAppInfoMapRes: Dispatch<SetStateAction<Record<number, BulkCIDetailType>>> = setAppInfoMapResWithoutType

    const appInfoMap = appInfoMapRes || {}

    const sortedAppList = Object.values(appInfoMap).sort((a, b) => stringComparatorBySortOrder(a.name, b.name))

    const selectedAppId = selectedAppIdState ?? sortedAppList[0]?.appId ?? null

    const reloadSelectedAppMaterialList = async () => {
        try {
            setIsLoadingSingleAppInfoMap(true)
            initialDataAbortControllerRef.current.abort()
            initialDataAbortControllerRef.current = new AbortController()
            // Will also handle error state
            const currentAppInfo = await getInitialAppList(selectedAppId)
            setAppInfoMapRes((prevAppInfoMapRes) => {
                const updatedAppInfoMap = structuredClone(prevAppInfoMapRes)
                updatedAppInfoMap[selectedAppId] = currentAppInfo[selectedAppId]
                return updatedAppInfoMap
            })
        } catch (error) {
            showError(error)
        } finally {
            setIsLoadingSingleAppInfoMap(false)
        }
    }

    const handleReloadSelectedMaterialWithWorkflows = async () => {
        try {
            await reloadSelectedAppMaterialList()
            reloadWorkflows()
        } catch (error) {
            showError(error)
        }
    }

    useEffect(
        () => () => {
            initialDataAbortControllerRef.current.abort()
        },
        [],
    )

    const handleWebhookModalBack = () => {
        setShowWebhookModal(false)
    }

    const handleClose = () => {
        if (responseList.length) {
            reloadWorkflowStatus()
        }
        handleCloseProp()
    }

    const validateBulkRuntimeParams = (): boolean => {
        const currentAppList = structuredClone(sortedAppList)
        const updatedAppInfoMap = structuredClone(appInfoMap)

        const isRuntimeParamErrorPresent = currentAppList.some((app) => {
            const validationState = validateRuntimeParameters(app.runtimeParams)
            updatedAppInfoMap[app.appId].runtimeParamsErrorState = validationState
            return !validationState.isValid
        })

        setAppInfoMapRes(updatedAppInfoMap)
        if (isRuntimeParamErrorPresent) {
            setIsBuildTriggerLoading(false)
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Please resolve all the runtime parameter errors before triggering the pipeline',
            })
            return false
        }
        return true
    }

    const getResponseStatusFromCode = (errorCode: number): BulkResponseStatus => {
        switch (errorCode) {
            case API_STATUS_CODES.EXPECTATION_FAILED:
                return BulkResponseStatus.SKIP

            case API_STATUS_CODES.PERMISSION_DENIED:
                return BulkResponseStatus.UNAUTHORIZE

            default:
                return BulkResponseStatus.FAIL
        }
    }

    const handleTriggerBuild = async (appsToRetry?: Record<string, boolean>) => {
        if (!validateBulkRuntimeParams()) {
            return
        }

        handleAnalyticsEvent(ENV_TRIGGER_VIEW_GA_EVENTS.BulkCITriggered)
        setIsBuildTriggerLoading(true)

        const {
            promiseList,
            appsToTrigger,
            skippedResourceList: newResourceList,
        } = getTriggerCIPromiseListAndSkippedResources(sortedAppList, appsToRetry)

        if (!promiseList.length) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'No valid CI pipeline found',
            })
            setIsBuildTriggerLoading(false)
            return
        }

        try {
            const responseArray = await ApiQueuingWithBatch(promiseList)

            responseArray.forEach((response, index) => {
                const baseResponse: Pick<ResponseRowType, 'appId' | 'appName'> = {
                    appId: appsToTrigger[index].appId,
                    appName: appsToTrigger[index].name,
                }
                if (response.status === PromiseAllStatusType.FULFILLED) {
                    newResourceList.push({
                        ...baseResponse,
                        statusText: BULK_CI_RESPONSE_STATUS_TEXT[BulkResponseStatus.PASS],
                        status: BulkResponseStatus.PASS,
                        message: '',
                    })
                } else {
                    const errorReason = response.reason
                    const errorMessage = errorReason.errors[0].userMessage
                    const bulkStatus = getResponseStatusFromCode(errorReason.code)
                    newResourceList.push({
                        ...baseResponse,
                        statusText: BULK_CI_RESPONSE_STATUS_TEXT[bulkStatus],
                        status: bulkStatus,
                        message: errorMessage,
                    })
                }
            })

            setResponseList(newResourceList)
        } catch {
            // Do nothing
        } finally {
            setIsBuildTriggerLoading(false)
        }
    }

    const onClickStartBuild = async () => {
        await handleTriggerBuild()
    }

    const isStartBuildDisabled = (): boolean =>
        sortedAppList.some(
            (app) =>
                !!app.runtimeParamsInitialError ||
                !!app.materialInitialError ||
                app.node.isTriggerBlocked ||
                (app.errorMessage &&
                    (app.errorMessage !== SOURCE_NOT_CONFIGURED ||
                        !app.material.some(
                            (_mat) => !_mat.isBranchError && !_mat.isRepoError && !_mat.isMaterialSelectionError,
                        ))),
        )

    const handleDisplayWebhookModal = () => {
        setShowWebhookModal(true)
    }

    const renderFooter = () => {
        if (responseList.length) {
            return (
                <TriggerResponseModalFooter
                    closePopup={handleClose}
                    responseList={responseList}
                    isLoading={isBuildTriggerLoading}
                    onClickRetryBuild={handleTriggerBuild}
                />
            )
        }

        return (
            <div
                className={`dc__border-top flex right bg__primary px-20 py-16 ${
                    blobStorageNotConfigured ? 'dc__content-space' : ''
                }`}
            >
                {blobStorageNotConfigured && (
                    <div className="flexbox dc__align-items-center dc__gap-8">
                        <Icon name="ic-storage" size={24} color={null} />

                        <div>
                            <div className="fw-6 fs-13">{IGNORE_CACHE_INFO.BlobStorageNotConfigured.title}</div>
                            <div className="fw-4 fs-12 flexbox">
                                <span>{IGNORE_CACHE_INFO.BlobStorageNotConfigured.infoText}</span>&nbsp;
                                <DocLink
                                    dataTestId="blob-storage-doc-link"
                                    docLinkKey="BLOB_STORAGE"
                                    text={IGNORE_CACHE_INFO.BlobStorageNotConfigured.configure}
                                    size={ComponentSizeType.small}
                                    showExternalIcon
                                    fontWeight="normal"
                                />
                            </div>
                        </div>
                    </div>
                )}
                <Button
                    dataTestId="start-build"
                    onClick={onClickStartBuild}
                    disabled={isStartBuildDisabled()}
                    isLoading={isBuildTriggerLoading}
                    text="Start build"
                    startIcon={<Icon name="ic-play-outline" size={16} color="N0" />}
                />
            </div>
        )
    }

    const setCurrentAppMaterialList: GitInfoMaterialProps['setMaterialList'] = (getUpdatedMaterialList) => {
        setAppInfoMapRes((prevAppInfoMapRes) => {
            const updatedAppInfoMap = structuredClone(prevAppInfoMapRes)
            const currentApp = updatedAppInfoMap[selectedAppId]

            if (currentApp) {
                currentApp.material = getUpdatedMaterialList(currentApp.material)
                currentApp.errorMessage = getBulkCIErrorMessage(
                    currentApp.appId,
                    currentApp.node,
                    currentApp.filteredCIPipelines,
                    currentApp.material,
                )
            }

            return updatedAppInfoMap
        })
    }

    const handleRuntimeParamChange: GitInfoMaterialProps['handleRuntimeParamChange'] = (updatedRuntimeParams) => {
        setAppInfoMapRes((prevAppInfoMapRes) => {
            const updatedAppInfoMap = structuredClone(prevAppInfoMapRes)
            const currentApp = updatedAppInfoMap[selectedAppId]
            if (currentApp) {
                currentApp.runtimeParams = updatedRuntimeParams
            }
            return updatedAppInfoMap
        })
    }

    const handleRuntimeParamError: GitInfoMaterialProps['handleRuntimeParamError'] = (errorState) => {
        setAppInfoMapRes((prevAppInfoMapRes) => {
            const updatedAppInfoMap = structuredClone(prevAppInfoMapRes)
            const currentApp = updatedAppInfoMap[selectedAppId]
            if (currentApp) {
                currentApp.runtimeParamsErrorState = errorState
            }
            return updatedAppInfoMap
        })
    }

    const toggleSelectedAppIgnoreCache = () => {
        setAppInfoMapRes((prevAppInfoMapRes) => {
            const updatedAppInfoMap = structuredClone(prevAppInfoMapRes)
            const currentApp = updatedAppInfoMap[selectedAppId]

            if (currentApp) {
                currentApp.ignoreCache = !currentApp.ignoreCache
            }
            return updatedAppInfoMap
        })
    }

    const handleAppChange = (appId: number) => {
        setSelectedAppIdState(appId)
    }

    const renderContent = () => {
        if (isLoadingAppInfoMap || isBuildTriggerLoading) {
            const message = isBuildTriggerLoading
                ? BULK_CI_BUILD_STATUS(numberOfAppsLoading)
                : BULK_CI_MATERIAL_STATUS(numberOfAppsLoading)

            return <GenericEmptyState {...message} SvgImage={MechanicalOperation} contentClassName="text-center" />
        }

        if (isLoadingSingleAppInfoMap) {
            return <Progressing pageLoader />
        }

        const appData = appInfoMap[selectedAppId]
        const selectedCIPipeline = appData.filteredCIPipelines?.find((_ci) => _ci.id === +appData.node.id)

        return (
            <GitInfoMaterial
                workflowId={appData.workflowId}
                appId={selectedAppId}
                node={appData.node}
                setMaterialList={setCurrentAppMaterialList}
                materialList={appData.material}
                runtimeParams={appData.runtimeParams}
                runtimeParamsErrorState={appData.runtimeParamsErrorState}
                showWebhookModal={showWebhookModal}
                handleDisplayWebhookModal={handleDisplayWebhookModal}
                handleRuntimeParamChange={handleRuntimeParamChange}
                handleRuntimeParamError={handleRuntimeParamError}
                selectedCIPipeline={selectedCIPipeline}
                reloadCompleteMaterialList={reloadSelectedAppMaterialList}
                handleReloadWithWorkflows={handleReloadSelectedMaterialWithWorkflows}
                isBulkTrigger
                appList={sortedAppList}
                handleAppChange={handleAppChange}
                isBlobStorageConfigured={!blobStorageNotConfigured}
                toggleSelectedAppIgnoreCache={toggleSelectedAppIgnoreCache}
            />
        )
    }

    return (
        <Drawer position="right" width="1080px" onClose={handleClose} onEscape={handleClose}>
            <div
                className="flexbox-col dc__content-space h-100 bg__modal--primary shadow__modal dc__overflow-auto bulk-ci-trigger-container"
                onClick={stopPropagation}
            >
                <div
                    className="flexbox-col dc__content-space h-100 bg__modal--primary shadow__modal dc__overflow-auto bulk-ci-trigger"
                    onClick={stopPropagation}
                >
                    <div className="flexbox-col dc__overflow-auto flex-grow-1">
                        {responseList.length > 0 ? (
                            <TriggerResponseModalBody responseList={responseList} isLoading={isBuildTriggerLoading} />
                        ) : (
                            <>
                                <BuildImageHeader
                                    showWebhookModal={showWebhookModal}
                                    handleWebhookModalBack={handleWebhookModalBack}
                                    pipelineName={appInfoMap?.[selectedAppId]?.node?.title}
                                    handleClose={handleClose}
                                    isBulkTrigger
                                />

                                <div className="flex-grow-1 dc__overflow-auto w-100">{renderContent()}</div>
                            </>
                        )}
                    </div>

                    {!showWebhookModal && !isLoadingAppInfoMap && renderFooter()}
                </div>
            </div>
        </Drawer>
    )
}

export default BulkBuildImageModal
