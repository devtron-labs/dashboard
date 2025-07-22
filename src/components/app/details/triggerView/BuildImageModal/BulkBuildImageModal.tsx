import { useEffect, useRef, useState } from 'react'

import {
    API_STATUS_CODES,
    ApiQueuingWithBatch,
    Button,
    CIMaterialType,
    CommonNodeAttr,
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
    SourceTypeMap,
    stopPropagation,
    stringComparatorBySortOrder,
    ToastManager,
    ToastVariantType,
    useAsync,
    WorkflowNodeType,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as MechanicalOperation } from '@Images/ic-mechanical-operation.svg'
import { getCIMaterialList } from '@Components/app/service'
import { BulkCIDetailType, ResponseRowType } from '@Components/ApplicationGroup/AppGroup.types'
import {
    BULK_CI_BUILD_STATUS,
    BULK_CI_MATERIAL_STATUS,
    BULK_CI_RESPONSE_STATUS_TEXT,
    BulkResponseStatus,
    ENV_TRIGGER_VIEW_GA_EVENTS,
    SKIPPED_RESOURCES_MESSAGE,
    SKIPPED_RESOURCES_STATUS_TEXT,
} from '@Components/ApplicationGroup/Constants'
import TriggerResponseModalBody, {
    TriggerResponseModalFooter,
} from '@Components/ApplicationGroup/Details/TriggerView/TriggerResponseModal'
import { importComponentFromFELibrary } from '@Components/common'
import { SOURCE_NOT_CONFIGURED } from '@Config/constants'

import { getModuleConfigured } from '../../appDetails/appDetails.service'
import { CI_MATERIAL_EMPTY_STATE_MESSAGING, IGNORE_CACHE_INFO } from '../Constants'
import BuildImageHeader from './BuildImageHeader'
import GitInfoMaterial from './GitInfoMaterial'
import { triggerBuild } from './service'
import { BulkBuildImageModalProps, GitInfoMaterialProps } from './types'
import { getCanNodeHaveMaterial, getIsRegexBranchNotAvailable, getTriggerBuildPayload } from './utils'

const getRuntimeParams = importComponentFromFELibrary('getRuntimeParams', null, 'function')
const validateRuntimeParameters = importComponentFromFELibrary(
    'validateRuntimeParameters',
    () => ({ isValid: true, cellError: {} }),
    'function',
)

const BulkBuildImageModal = ({
    handleClose,
    workflows,
    reloadWorkflows,
    filteredCIPipelineMap,
}: BulkBuildImageModalProps) => {
    const [selectedAppIdState, setSelectedAppIdState] = useState<number | null>(null)
    const [showWebhookModal, setShowWebhookModal] = useState(false)
    const [isBuildTriggerLoading, setIsBuildTriggerLoading] = useState(false)
    const [responseList, setResponseList] = useState<ResponseRowType[]>([])

    const [blobStorageConfigurationLoading, blobStorageConfiguration] = useAsync(
        () => getModuleConfigured(ModuleNameMap.BLOB_STORAGE),
        [],
    )

    const blobStorageNotConfigured = !blobStorageConfigurationLoading && !blobStorageConfiguration?.result?.enabled

    const getWarningMessage = (ciNode: CommonNodeAttr): string => {
        if (ciNode.isLinkedCD) {
            return 'Uses another environment as image source'
        }

        if (ciNode.isLinkedCI) {
            return 'Has linked build pipeline'
        }

        if (ciNode.type === WorkflowNodeType.WEBHOOK) {
            return 'Has webhook build pipeline'
        }

        return ''
    }

    const getErrorMessage = (
        _appId: number,
        _ciNode: CommonNodeAttr,
        filteredCIPipelines: BulkCIDetailType['filteredCIPipelines'],
        materialList: CIMaterialType[],
    ): string => {
        const selectedCIPipeline = filteredCIPipelines?.find((_ci) => _ci.id === +_ciNode.id)

        if (_ciNode.inputMaterialList?.length > 0) {
            if (getIsRegexBranchNotAvailable(selectedCIPipeline, materialList)) {
                return 'Primary branch is not set'
            }
            if (selectedCIPipeline?.ciMaterial) {
                const invalidInputMaterial = _ciNode.inputMaterialList.find(
                    (_mat) =>
                        _mat.isBranchError ||
                        _mat.isRepoError ||
                        _mat.isDockerFileError ||
                        _mat.isMaterialSelectionError ||
                        (_mat.type === SourceTypeMap.WEBHOOK && _mat.history.length === 0),
                )

                if (invalidInputMaterial) {
                    if (invalidInputMaterial.isRepoError) {
                        return invalidInputMaterial.repoErrorMsg
                    }
                    if (invalidInputMaterial.isDockerFileError) {
                        return invalidInputMaterial.dockerFileErrorMsg
                    }
                    if (invalidInputMaterial.isBranchError) {
                        return invalidInputMaterial.branchErrorMsg
                    }
                    if (invalidInputMaterial.isMaterialSelectionError) {
                        return invalidInputMaterial.materialSelectionErrorMsg
                    }
                    return CI_MATERIAL_EMPTY_STATE_MESSAGING.NoMaterialFound
                }
            }
        }
        return ''
    }

    const initialDataAbortControllerRef = useRef<AbortController>(new AbortController())

    // Returns map of appId to BulkCIDetailType
    const getInitialAppList = async (appId?: number): Promise<Record<number, BulkCIDetailType>> => {
        const validWorkflows = workflows.filter(
            (workflow) =>
                workflow.isSelected &&
                (!appId || workflow.appId === appId) &&
                workflow.nodes.some(
                    (node) => node.type === WorkflowNodeType.CI || node.type === WorkflowNodeType.WEBHOOK,
                ),
        )

        const { ciMaterialPromiseList, runtimeParamsPromiseList } = validWorkflows.reduce(
            (acc, workflow) => {
                const currentNode = workflow.nodes.find(
                    (node) => node.type === WorkflowNodeType.CI || node.type === WorkflowNodeType.WEBHOOK,
                )

                if (getCanNodeHaveMaterial(currentNode)) {
                    acc.ciMaterialPromiseList.push(() => [])
                    acc.runtimeParamsPromiseList.push(() => [])

                    return acc
                }

                acc.ciMaterialPromiseList.push(() =>
                    getCIMaterialList(
                        {
                            pipelineId: currentNode.id,
                        },
                        initialDataAbortControllerRef.current.signal,
                    ),
                )

                // TODO: Check runtime param page should show error state in case of its error
                if (getRuntimeParams) {
                    acc.runtimeParamsPromiseList.push(() => getRuntimeParams(currentNode.id))
                } else {
                    acc.runtimeParamsPromiseList.push(() => [])
                }

                return acc
            },
            { ciMaterialPromiseList: [], runtimeParamsPromiseList: [] },
        )

        if (ciMaterialPromiseList.length === 0) {
            return []
        }

        const ciMaterialList =
            await ApiQueuingWithBatch<Awaited<ReturnType<typeof getCIMaterialList>>>(ciMaterialPromiseList)
        // TODO: Add show regex modal logic later
        const runtimeParamsList = await ApiQueuingWithBatch<RuntimePluginVariables[]>(runtimeParamsPromiseList)

        return validWorkflows.reduce<Record<number, BulkCIDetailType>>((acc, workflow, index) => {
            const node = workflow.nodes.find(
                (currentNode) =>
                    currentNode.type === WorkflowNodeType.CI || currentNode.type === WorkflowNodeType.WEBHOOK,
            )

            if (!node) {
                return acc
            }

            const currentMaterial =
                (ciMaterialList[index].status === PromiseAllStatusType.FULFILLED
                    ? ciMaterialList[index].value?.result
                    : []) || []
            const runtimeParams =
                runtimeParamsList[index].status === PromiseAllStatusType.FULFILLED ? runtimeParamsList[index].value : []

            acc[workflow.appId] = {
                workflowId: workflow.id,
                appId: workflow.appId,
                name: workflow.name,
                node,
                material: currentMaterial,
                materialInitialError:
                    ciMaterialList[index].status === PromiseAllStatusType.REJECTED
                        ? ciMaterialList[index].reason
                        : null,
                runtimeParams: runtimeParams || [],
                runtimeParamsInitialError:
                    runtimeParamsList[index].status === PromiseAllStatusType.REJECTED
                        ? runtimeParamsList[index].reason
                        : null,
                runtimeParamsErrorState: {
                    isValid: runtimeParamsList[index].status !== PromiseAllStatusType.REJECTED,
                    cellError: {},
                },
                warningMessage: getWarningMessage(node),
                errorMessage: getErrorMessage(
                    workflow.appId,
                    node,
                    filteredCIPipelineMap.get(String(workflow.appId)),
                    currentMaterial,
                ),
                filteredCIPipelines: filteredCIPipelineMap.get(String(workflow.appId)),
                ignoreCache: false,
                ciConfiguredGitMaterialId: workflow.ciConfiguredGitMaterialId,
            }

            return acc
        }, {})
    }

    const [isLoadingAppInfoMap, appInfoMapRes, , , setAppInfoMapRes] = useAsync(getInitialAppList)
    const [isLoadingSingleAppInfoMap, setIsLoadingSingleAppInfoMap] = useState<boolean>(false)

    const appInfoMap = appInfoMapRes || {}

    const sortedAppList = Object.values(appInfoMap).sort((a, b) => stringComparatorBySortOrder(a.name, b.name))

    const selectedAppId = selectedAppIdState ?? sortedAppList[0]?.appId ?? null

    const reloadSelectedAppMaterialList = async () => {
        try {
            setIsLoadingSingleAppInfoMap(true)
            initialDataAbortControllerRef.current.abort()
            initialDataAbortControllerRef.current = new AbortController()
            const currentAppInfo = await getInitialAppList(selectedAppId)
            setAppInfoMapRes((prevAppInfoMapRes) => {
                const updatedAppInfoMap = { ...prevAppInfoMapRes }
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

    useEffect(() => () => {
        initialDataAbortControllerRef.current.abort()
    })

    const handleWebhookModalBack = () => {
        setShowWebhookModal(false)
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

    const getPayloadFromAppDetails = (appDetails: BulkCIDetailType) =>
        getTriggerBuildPayload({
            materialList: appDetails.material,
            ciConfiguredGitMaterialId: appDetails.ciConfiguredGitMaterialId,
            runtimeParams: appDetails.runtimeParams,
            invalidateCache: appDetails.ignoreCache,
            isJobCI: appDetails.node?.isJobCI,
            ciNodeId: +(appDetails.node?.id || 0),
            selectedEnv: null,
        })

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

        const newResourceList: ResponseRowType[] = []
        const appsToTrigger = sortedAppList.filter((appDetails) => {
            if (appsToRetry && !appsToRetry[appDetails.appId]) {
                return false
            }

            if (!getCanNodeHaveMaterial(appDetails.node)) {
                newResourceList.push({
                    appId: appDetails.appId,
                    appName: appDetails.name,
                    statusText: SKIPPED_RESOURCES_STATUS_TEXT,
                    status: BulkResponseStatus.SKIP,
                    message: SKIPPED_RESOURCES_MESSAGE,
                })
            }

            const payload = getPayloadFromAppDetails(appDetails)

            if (typeof payload === 'string') {
                newResourceList.push({
                    appId: appDetails.appId,
                    appName: appDetails.name,
                    statusText: SKIPPED_RESOURCES_STATUS_TEXT,
                    status: BulkResponseStatus.SKIP,
                    message: payload,
                })
            }

            return getCanNodeHaveMaterial(appDetails.node) && typeof payload !== 'string'
        })

        const promiseList = appsToTrigger.map((appDetails) => {
            const payload = getPayloadFromAppDetails(appDetails) as Exclude<
                ReturnType<typeof getTriggerBuildPayload>,
                string
            >

            return () => triggerBuild({ payload })
        })

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

    // TODO: Need to understand this
    const isStartBuildDisabled = (): boolean =>
        sortedAppList.some(
            (app) =>
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
                    // TODO: Refetch workflows after triggering build
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
            const updatedAppInfoMap = { ...prevAppInfoMapRes }
            const currentApp = updatedAppInfoMap[selectedAppId]

            if (currentApp) {
                currentApp.material = getUpdatedMaterialList(currentApp.material)
            }

            return updatedAppInfoMap
        })
    }

    const handleRuntimeParamChange: GitInfoMaterialProps['handleRuntimeParamChange'] = (updatedRuntimeParams) => {
        setAppInfoMapRes((prevAppInfoMapRes) => {
            const updatedAppInfoMap = { ...prevAppInfoMapRes }
            const currentApp = updatedAppInfoMap[selectedAppId]
            if (currentApp) {
                currentApp.runtimeParams = updatedRuntimeParams
            }
            return updatedAppInfoMap
        })
    }

    const handleRuntimeParamError: GitInfoMaterialProps['handleRuntimeParamError'] = (errorState) => {
        setAppInfoMapRes((prevAppInfoMapRes) => {
            const updatedAppInfoMap = { ...prevAppInfoMapRes }
            const currentApp = updatedAppInfoMap[selectedAppId]
            if (currentApp) {
                currentApp.runtimeParamsErrorState = errorState
            }
            return updatedAppInfoMap
        })
    }

    const toggleSelectedAppIgnoreCache = () => {
        setAppInfoMapRes((prevAppInfoMapRes) => {
            const updatedAppInfoMap = { ...prevAppInfoMapRes }
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
                ? BULK_CI_BUILD_STATUS(sortedAppList.length)
                : BULK_CI_MATERIAL_STATUS(sortedAppList.length)

            return <GenericEmptyState {...message} SvgImage={MechanicalOperation} contentClassName="text-center" />
        }

        if (isLoadingSingleAppInfoMap) {
            return <Progressing pageLoader />
        }

        const appData = appInfoMap[selectedAppId]
        const selectedCIPipeline = appData.filteredCIPipelines?.find((_ci) => _ci.id === +appData.node.id)

        return (
            <GitInfoMaterial
                key={selectedAppId}
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
        <Drawer position="right" minWidth="1024px" maxWidth="1200px" onClose={handleClose} onEscape={handleClose}>
            <div
                className="flexbox-col dc__content-space h-100 bg__modal--primary shadow__modal dc__overflow-auto"
                onClick={stopPropagation}
            >
                <div
                    className="flexbox-col dc__content-space h-100 bg__modal--primary shadow__modal dc__overflow-auto"
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
