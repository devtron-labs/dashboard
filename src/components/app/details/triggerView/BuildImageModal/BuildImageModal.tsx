/**
 * Service layer requirements:
 * - We need to have filteredCIPipelines
 * - Will find the selected pipeline from filteredCIPipelines from which we will get envId [in case of job view]
 * - isLoading as prop for when workflows are loading
 * - If !isLoading and filteredCIPipelines does not contain the selected pipeline, we will show error
 */

import { SyntheticEvent, useEffect, useRef, useState } from 'react'
import { Prompt, useHistory, useParams } from 'react-router-dom'

import {
    APIResponseHandler,
    Button,
    ButtonStyleType,
    ButtonVariantType,
    Checkbox,
    CIMaterialType,
    CIPipelineNodeType,
    CommonNodeAttr,
    ComponentSizeType,
    ConsequenceAction,
    DEFAULT_ROUTE_PROMPT_MESSAGE,
    DocLink,
    Drawer,
    ErrorScreenManagerProps,
    handleAnalyticsEvent,
    Icon,
    ModuleNameMap,
    noop,
    ServerErrors,
    showError,
    stopPropagation,
    TOAST_ACCESS_DENIED,
    ToastManager,
    ToastVariantType,
    Tooltip,
    useAsync,
    WorkflowNodeType,
} from '@devtron-labs/devtron-fe-common-lib'

import { getCIMaterialList, triggerCINode } from '@Components/app/service'
import { handleSourceNotConfigured } from '@Components/ApplicationGroup/AppGroup.utils'
import { CIPipelineBuildType } from '@Components/ciPipeline/types'
import { EnvironmentList } from '@Components/CIPipelineN/EnvironmentList'
import { getCIPipelineURL, importComponentFromFELibrary } from '@Components/common'
import { CI_CONFIGURED_GIT_MATERIAL_ERROR, NO_TASKS_CONFIGURED_ERROR } from '@Config/constantMessaging'
import { BUILD_STATUS, DEFAULT_GIT_BRANCH_VALUE, SOURCE_NOT_CONFIGURED } from '@Config/constants'

import { getModuleConfigured } from '../../appDetails/appDetails.service'
import BranchRegexModal from '../BranchRegexModal'
import { IGNORE_CACHE_INFO, TRIGGER_VIEW_GA_EVENTS } from '../Constants'
import { BuildImageModalProps, CIMaterialRouterProps, CIPipelineMaterialDTO } from '../types'
import GitInfoMaterial from './GitInfoMaterial'
import { GitInfoMaterialProps } from './types'

const getRuntimeParams = importComponentFromFELibrary('getRuntimeParams', null, 'function')
const AllowedWithWarningTippy = importComponentFromFELibrary('AllowedWithWarningTippy')
const validateRuntimeParameters = importComponentFromFELibrary(
    'validateRuntimeParameters',
    () => ({ isValid: true, cellError: {} }),
    'function',
)
const getRuntimeParamsPayload = importComponentFromFELibrary('getRuntimeParamsPayload', null, 'function')

/**
 * TODO:
 * - On save/change of branch call plugin state api and update the state of workflow
 */
const BuildImageModal = ({
    handleClose,
    isJobView,
    filteredCIPipelines: filteredCIPipelinesProp,
    filteredCIPipelineMap,
    workflows,
    reloadWorkflows,
    appId: appIdProp,
    environmentLists,
}: BuildImageModalProps) => {
    const { push } = useHistory()
    const { ciNodeId } = useParams<Pick<CIMaterialRouterProps, 'ciNodeId'>>()
    const materialListAbortControllerRef = useRef<AbortController>(new AbortController())

    const [showRegexBranchChangeModal, setShowRegexBranchChangeModal] = useState<boolean>(false)
    const [selectedEnv, setSelectedEnv] = useState<GitInfoMaterialProps['selectedEnv'] | null>(null)
    const [invalidateCache, setInvalidateCache] = useState<boolean>(false)
    const [runtimeParamsErrorState, setRuntimeParamsErrorState] = useState<
        GitInfoMaterialProps['runtimeParamsErrorState']
    >({
        isValid: true,
        cellError: {},
    })
    const [isBuildTriggerLoading, setIsBuildTriggerLoading] = useState<boolean>(false)
    const [showWebhookModal, setShowWebhookModal] = useState<boolean>(false)

    const selectedWorkflow = workflows?.find((workflow) =>
        workflow.nodes.some((node) => node.type === WorkflowNodeType.CI && Number(node.id) === +ciNodeId),
    )
    const workflowId = selectedWorkflow?.id
    // Workflows will be present since this modal is only opened when workflows are loaded
    const ciNode = selectedWorkflow?.nodes.find((node) => node.type === CIPipelineNodeType.CI && node.id === ciNodeId)
    const appId = appIdProp || selectedWorkflow?.appId
    const filteredCIPipelines = filteredCIPipelinesProp || filteredCIPipelineMap?.get(String(appId)) || []

    // TODO: Add as much type as possible to selectedCIPipeline
    const selectedCIPipeline = (filteredCIPipelines || []).find((_ci) => _ci.id === +ciNodeId)

    const onMaterialUpdate = (newMaterialList: CIMaterialType[]) => {
        setShowRegexBranchChangeModal(
            !!selectedCIPipeline?.ciMaterial?.some(
                (material) =>
                    material.isRegex &&
                    newMaterialList.some((_mat) => _mat.gitMaterialId === material.gitMaterialId && !_mat.value),
            ),
        )
    }

    const getMaterialList = async (): Promise<CIMaterialType[]> => {
        const { result: materialListResponse } = await getCIMaterialList(
            {
                pipelineId: ciNodeId,
            },
            materialListAbortControllerRef.current.signal,
        )

        const configuredMaterialList = new Map<number, Set<number>>()
        if (ciNode) {
            const gitMaterials = new Map<number, string[]>()
            materialListResponse?.forEach((material) => {
                gitMaterials[material.gitMaterialId] = [material.gitMaterialName.toLowerCase(), material.value]
            })

            configuredMaterialList[selectedWorkflow.name] = new Set<number>()

            handleSourceNotConfigured(
                configuredMaterialList,
                selectedWorkflow,
                materialListResponse || [],
                !gitMaterials[selectedWorkflow.ciConfiguredGitMaterialId],
            )
        }

        onMaterialUpdate(materialListResponse)
        return materialListResponse
    }

    const [areRuntimeParamsLoading, runtimeParams, runtimeParamsError, reloadRuntimeParams, setRuntimeParams] =
        useAsync<GitInfoMaterialProps['runtimeParams']>(
            () => getRuntimeParams(ciNodeId, true),
            [ciNodeId],
            !!ciNodeId && !!getRuntimeParams,
        )

    const [isMaterialListLoading, _materialList, materialListError, reloadMaterialList, setMaterialList] = useAsync(
        getMaterialList,
        [ciNodeId],
        !!ciNodeId,
    )

    const materialList = _materialList || []

    const [isLoadingBlobStorageModule, blobStorageModuleRes, , reloadBlobStorageModule] = useAsync(() =>
        getModuleConfigured(ModuleNameMap.BLOB_STORAGE),
    )

    useEffect(() => {
        if (isJobView && environmentLists?.length > 0) {
            const envId = selectedCIPipeline?.environmentId || 0
            const _selectedEnv = environmentLists.find((env) => +env.id === +envId)
            setSelectedEnv(_selectedEnv)
        }

        return () => materialListAbortControllerRef.current.abort()
    }, [])

    // TODO: Maybe extract component for storage module for bulk view as well
    const isBlobStorageConfigured = !!blobStorageModuleRes?.result?.enabled

    const handleReload = () => {
        reloadMaterialList()
        reloadRuntimeParams()
        reloadBlobStorageModule()
    }

    const handleReloadWithWorkflows = () => {
        reloadWorkflows()
        handleReload()
    }

    const handleCloseBranchRegexModal = () => {
        setShowRegexBranchChangeModal(false)
    }

    const handleShowRegexBranchChangeModal = () => {
        setShowRegexBranchChangeModal(true)
    }

    const toggleInvalidateCache = () => {
        setInvalidateCache((prev) => !prev)
    }

    const showContentLoader = areRuntimeParamsLoading || isMaterialListLoading || isLoadingBlobStorageModule

    const getErrorScreenManagerProps = (): ErrorScreenManagerProps => {
        if (materialListError) {
            return {
                code: materialListError.code,
                reload: handleReload,
            }
        }

        if (runtimeParamsError) {
            return {
                code: runtimeParamsError.code,
                reload: handleReload,
            }
        }

        return {}
    }

    const handleRuntimeParamError: GitInfoMaterialProps['handleRuntimeParamError'] = (
        updatedRuntimeParamsErrorState,
    ) => {
        setRuntimeParamsErrorState(updatedRuntimeParamsErrorState)
    }

    const getCIPipelineURLWrapper = (): string =>
        getCIPipelineURL(String(appId), String(workflowId), true, ciNodeId, false, ciNode?.isJobCI, false)

    const redirectToCIPipeline = () => {
        push(getCIPipelineURLWrapper())
    }

    const handleWebhookModalBack = () => {
        setShowWebhookModal(false)
    }

    const handleDisplayWebhookModal = () => {
        setShowWebhookModal(true)
    }

    const onClickTriggerCINode = () => {
        handleAnalyticsEvent(TRIGGER_VIEW_GA_EVENTS.CITriggered)
        setIsBuildTriggerLoading(true)

        const dockerfileConfiguredGitMaterialId = selectedWorkflow?.ciConfiguredGitMaterialId

        const gitMaterials = new Map<number, string[]>()
        const ciPipelineMaterials: CIPipelineMaterialDTO[] = []

        materialList.forEach((material) => {
            gitMaterials[material.gitMaterialId] = [material.gitMaterialName.toLowerCase(), material.value]

            if (material.value === DEFAULT_GIT_BRANCH_VALUE) {
                return
            }

            const history = material.history.filter((historyItem) => historyItem.isSelected)
            if (!history.length) {
                history.push(material.history[0])
            }

            history.forEach((element) => {
                const historyItem: CIPipelineMaterialDTO = {
                    Id: material.id,
                    GitCommit: {
                        Commit: element.commit,
                    },
                }
                if (!element.commit) {
                    historyItem.GitCommit.WebhookData = {
                        id: element.webhookData.id,
                    }
                }
                ciPipelineMaterials.push(historyItem)
            })
        })

        if (gitMaterials[dockerfileConfiguredGitMaterialId][1] === DEFAULT_GIT_BRANCH_VALUE) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: CI_CONFIGURED_GIT_MATERIAL_ERROR.replace(
                    '$GIT_MATERIAL_ID',
                    `"${gitMaterials[dockerfileConfiguredGitMaterialId][0]}"`,
                ),
            })
            setIsBuildTriggerLoading(false)
            return
        }

        const envId = selectedEnv && selectedEnv.id !== 0 ? selectedEnv.id : undefined
        const runtimeParamsPayload = getRuntimeParamsPayload?.(runtimeParams ?? [])

        const payload = {
            pipelineId: +ciNodeId,
            ciPipelineMaterials,
            invalidateCache,
            environmentId: envId,
            pipelineType: ciNode?.isJobCI ? CIPipelineBuildType.CI_JOB : CIPipelineBuildType.CI_BUILD,
            ...(getRuntimeParamsPayload ? runtimeParamsPayload : {}),
        }

        // TODO: Lets move this service later
        triggerCINode(payload)
            .then((response) => {
                if (response.result) {
                    ToastManager.showToast({
                        variant: ToastVariantType.success,
                        description: 'Pipeline Triggered',
                    })
                    handleClose()
                }
            })
            .catch((errors: ServerErrors) => {
                if (errors.code === 403) {
                    ToastManager.showToast({
                        variant: ToastVariantType.notAuthorized,
                        description: TOAST_ACCESS_DENIED.SUBTITLE,
                    })
                } else if (errors instanceof ServerErrors && Array.isArray(errors.errors) && errors.code === 409) {
                    errors.errors.map((err) =>
                        ToastManager.showToast({
                            variant: ToastVariantType.error,
                            description: err.internalMessage,
                        }),
                    )
                } else {
                    errors.errors.forEach((error) => {
                        if (error.userMessage === NO_TASKS_CONFIGURED_ERROR) {
                            ToastManager.showToast({
                                variant: ToastVariantType.error,
                                title: 'Nothing to execute',
                                description: error.userMessage,
                                buttonProps: {
                                    text: 'Edit Pipeline',
                                    dataTestId: 'edit-pipeline-btn',
                                    onClick: redirectToCIPipeline,
                                },
                            })
                        } else {
                            showError([error])
                        }
                    })
                }
            })
            .finally(() => {
                setIsBuildTriggerLoading(false)
            })
    }

    const handleRuntimeParamChange: GitInfoMaterialProps['handleRuntimeParamChange'] = (updatedRuntimeParams) => {
        setRuntimeParams(updatedRuntimeParams)
    }

    const handleStartBuildAction = (e: SyntheticEvent) => {
        const runtimeParamsUpdatedErrorState = validateRuntimeParameters(runtimeParams)
        handleRuntimeParamError(runtimeParamsUpdatedErrorState)

        if (!runtimeParamsUpdatedErrorState.isValid) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Please resolve all the errors before starting the build',
            })
            return
        }

        e.stopPropagation()
        onClickTriggerCINode()
    }

    const renderCTAButtonWithIcon = (isCTAActionable: boolean = true) => {
        const isMaterialActive = materialList.some((material) => material.active)
        const canTrigger = materialList.reduce(
            (isValid, mat) =>
                (isValid && !mat.isMaterialLoading && !!mat.history.find((history) => history.isSelected)) ||
                (!mat.isDockerFileError && mat.branchErrorMsg === SOURCE_NOT_CONFIGURED && isMaterialActive),
            true,
        )

        return (
            <Button
                dataTestId="ci-trigger-start-build-button"
                text={isJobView || ciNode?.isJobCI ? 'Run Job' : 'Start Build'}
                disabled={!canTrigger}
                isLoading={isBuildTriggerLoading}
                onClick={isCTAActionable ? handleStartBuildAction : noop}
                size={ComponentSizeType.large}
                startIcon={<Icon name="ic-play-outline" color={null} />}
            />
        )
    }

    const renderCTAButton = () => {
        const nodeType: CommonNodeAttr['type'] = 'CI'

        if (
            AllowedWithWarningTippy &&
            ciNode?.pluginBlockState?.action === ConsequenceAction.ALLOW_UNTIL_TIME &&
            !isJobView
        ) {
            return (
                <AllowedWithWarningTippy
                    consequence={ciNode.pluginBlockState}
                    configurePluginURL={getCIPipelineURL(
                        String(appId),
                        String(workflowId),
                        true,
                        ciNodeId,
                        false,
                        ciNode.isJobCI,
                        false,
                    )}
                    showTriggerButton
                    onTrigger={handleStartBuildAction}
                    nodeType={nodeType}
                    isJobView={ciNode.isJobCI}
                >
                    {renderCTAButtonWithIcon(false)}
                </AllowedWithWarningTippy>
            )
        }

        return renderCTAButtonWithIcon()
    }

    const renderEnvironments = () => (
        <EnvironmentList
            isBuildStage={false}
            environments={environmentLists}
            selectedEnv={selectedEnv}
            setSelectedEnv={setSelectedEnv}
            isBorderLess
        />
    )

    const renderCacheInfo = () => {
        if (ciNode?.status?.toLowerCase() === BUILD_STATUS.NOT_TRIGGERED) {
            return (
                <div className="flexbox dc__align-items-center dc__gap-8">
                    <Icon name="ic-info-filled" color="B500" size={20} />
                    <div>
                        <div className="fw-6 fs-13">{IGNORE_CACHE_INFO.FirstTrigger.title}</div>
                        <div className="fw-4 fs-12">{IGNORE_CACHE_INFO.FirstTrigger.infoText}</div>
                    </div>
                </div>
            )
        }
        if (!isBlobStorageConfigured) {
            return (
                <div className="flexbox dc__align-items-center dc__gap-8">
                    {/* FIXME: Why is this not picking up :/ */}
                    {/* <Icon name="ic-storage" color={null} size={24} /> */}
                    <div>
                        <div className="fw-6 fs-13">{IGNORE_CACHE_INFO.BlobStorageNotConfigured.title}</div>
                        <div className="fw-4 fs-12 flexbox">
                            <span>{IGNORE_CACHE_INFO.BlobStorageNotConfigured.infoText}</span>&nbsp;
                            <DocLink
                                dataTestId="trigger-view-blob-storage-configure"
                                docLinkKey="BLOB_STORAGE"
                                text={IGNORE_CACHE_INFO.BlobStorageNotConfigured.configure}
                                size={ComponentSizeType.small}
                                fontWeight="normal"
                                openInNewTab
                                showExternalIcon
                            />
                        </div>
                    </div>
                </div>
            )
        }
        if (!ciNode?.storageConfigured) {
            return (
                <div className="flexbox dc__align-items-center dc__gap-8">
                    <Icon name="ic-info-filled" color="B500" size={20} />
                    <div>
                        <div className="fw-6 fs-13">{IGNORE_CACHE_INFO.CacheNotAvailable.title}</div>
                        <div className="fw-4 fs-12">{IGNORE_CACHE_INFO.CacheNotAvailable.infoText}</div>
                    </div>
                </div>
            )
        }
        return (
            <Checkbox
                isChecked={invalidateCache}
                onClick={stopPropagation}
                rootClassName="mb-0 flex top"
                value="CHECKED"
                onChange={toggleInvalidateCache}
                data-testid="set-clone-directory"
            >
                <div>
                    <div className="fs-13 fw-6 lh-20">{IGNORE_CACHE_INFO.IgnoreCache.title}</div>

                    <div className="flex dc__gap-4">
                        <span className="fs-12 fw-4 lh-16">{IGNORE_CACHE_INFO.IgnoreCache.infoText}</span>

                        <Tooltip content={IGNORE_CACHE_INFO.IgnoreCache.infoTooltipContent} alwaysShowTippyOnHover>
                            <div>
                                <Icon name="ic-info-outline" color="N600" size={16} />
                            </div>
                        </Tooltip>
                    </div>
                </div>
            </Checkbox>
        )
    }

    // TODO: Make sure empty states in case of filter
    const renderContent = () => (
        <APIResponseHandler
            isLoading={showContentLoader}
            error={materialListError}
            errorScreenManagerProps={getErrorScreenManagerProps()}
        >
            {/* TODO: Add prompt for unsaved changes */}
            {/* TODO: Check by changing ciNodeId to `abc` */}
            <GitInfoMaterial
                appId={appId}
                workflow={selectedWorkflow}
                isJobView={isJobView}
                setMaterialList={setMaterialList}
                materialList={materialList}
                showWebhookModal={showWebhookModal}
                reloadCompleteMaterialList={reloadMaterialList}
                onClickShowBranchRegexModal={handleShowRegexBranchChangeModal}
                runtimeParams={runtimeParams}
                runtimeParamsErrorState={runtimeParamsErrorState}
                handleRuntimeParamChange={handleRuntimeParamChange}
                handleRuntimeParamError={handleRuntimeParamError}
                selectedEnv={selectedEnv}
                handleDisplayWebhookModal={handleDisplayWebhookModal}
            />
        </APIResponseHandler>
    )

    return (
        <>
            <Drawer position="right" width="1024px" onClose={handleClose} onEscape={handleClose}>
                <div
                    className="flexbox-col dc__content-space h-100 bg__modal--primary shadow__modal dc__overflow-auto"
                    onClick={stopPropagation}
                >
                    <div className="flexbox-col dc__overflow-auto flex-grow-1">
                        <div className="px-20 py-12 flexbox dc__content-space dc__align-items-center border__primary--bottom">
                            {showWebhookModal ? (
                                <div className="flexbox dc__gap-12" data-testid="build-deploy-pipeline-name-heading">
                                    <Button
                                        dataTestId="webhook-back-button"
                                        ariaLabel="Back"
                                        icon={<Icon name="ic-arrow-right" color="N700" rotateBy={180} />}
                                        variant={ButtonVariantType.borderLess}
                                        size={ComponentSizeType.xs}
                                        showAriaLabelInTippy={false}
                                        style={ButtonStyleType.neutral}
                                        onClick={handleWebhookModalBack}
                                    />

                                    <h2 className="m-0 fs-16 fw-6 lh-24 cn-9 flexbox">
                                        <span className="dc__truncate dc__mxw-250">{ciNode?.title}</span>
                                        <span className="fs-16">&nbsp;/ All received webhooks </span>
                                    </h2>
                                </div>
                            ) : (
                                <h2 className="m-0 fs-16 fw-6 lh-24 cn-9 dc__truncate">
                                    {isJobView ? 'Pipeline:' : 'Build Pipeline:'} {ciNode?.title}
                                </h2>
                            )}

                            <Button
                                dataTestId="header-close-button"
                                ariaLabel="Close"
                                showAriaLabelInTippy={false}
                                onClick={handleClose}
                                variant={ButtonVariantType.borderLess}
                                style={ButtonStyleType.negativeGrey}
                                icon={<Icon name="ic-close-large" color={null} />}
                                size={ComponentSizeType.xs}
                            />
                        </div>

                        <div className="flex-grow-1 dc__overflow-auto w-100">{renderContent()}</div>
                    </div>

                    {ciNode?.isTriggerBlocked || showWebhookModal ? null : (
                        <div className="flexbox dc__content-space dc__gap-12 py-16 px-20 border__primary--top dc__no-shrink">
                            {isJobView ? renderEnvironments() : renderCacheInfo()}
                            {renderCTAButton()}
                        </div>
                    )}
                </div>
            </Drawer>
            <Prompt when={isBuildTriggerLoading} message={DEFAULT_ROUTE_PROMPT_MESSAGE} />

            {showRegexBranchChangeModal && (
                <BranchRegexModal
                    material={materialList}
                    selectedCIPipeline={selectedCIPipeline}
                    title={ciNode?.title}
                    onCloseBranchRegexModal={handleCloseBranchRegexModal}
                    appId={appId}
                    workflowId={workflowId}
                    // This will ensure ciTriggerDetails are also updated
                    handleReload={handleReloadWithWorkflows}
                />
            )}
        </>
    )
}

export default BuildImageModal
