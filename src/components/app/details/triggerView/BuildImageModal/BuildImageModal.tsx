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
    stopPropagation,
    ToastManager,
    ToastVariantType,
    Tooltip,
    useAsync,
    usePrompt,
    WorkflowNodeType,
} from '@devtron-labs/devtron-fe-common-lib'

import { getCIMaterialList } from '@Components/app/service'
import { handleSourceNotConfigured } from '@Components/ApplicationGroup/AppGroup.utils'
import { EnvironmentList } from '@Components/CIPipelineN/EnvironmentList'
import { getCIPipelineURL, importComponentFromFELibrary } from '@Components/common'
import { BUILD_STATUS, SOURCE_NOT_CONFIGURED } from '@Config/constants'

import { getModuleConfigured } from '../../appDetails/appDetails.service'
import { IGNORE_CACHE_INFO, TRIGGER_VIEW_GA_EVENTS } from '../Constants'
import { BuildImageModalProps, CIMaterialRouterProps } from '../types'
import BuildImageHeader from './BuildImageHeader'
import GitInfoMaterial from './GitInfoMaterial'
import { triggerBuild } from './service'
import { GitInfoMaterialProps } from './types'
import { getTriggerBuildPayload } from './utils'

const getRuntimeParams = importComponentFromFELibrary('getRuntimeParams', null, 'function')
const AllowedWithWarningTippy = importComponentFromFELibrary('AllowedWithWarningTippy')
const validateRuntimeParameters = importComponentFromFELibrary(
    'validateRuntimeParameters',
    () => ({ isValid: true, cellError: {} }),
    'function',
)

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

    usePrompt({
        shouldPrompt: isBuildTriggerLoading,
    })

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

    const onClickTriggerCINode = async () => {
        handleAnalyticsEvent(TRIGGER_VIEW_GA_EVENTS.CITriggered)
        setIsBuildTriggerLoading(true)

        const payload = getTriggerBuildPayload({
            materialList,
            ciConfiguredGitMaterialId: selectedWorkflow?.ciConfiguredGitMaterialId,
            runtimeParams,
            selectedEnv,
            invalidateCache,
            isJobCI: ciNode?.isJobCI,
            ciNodeId: +ciNodeId,
        })

        if (typeof payload === 'string') {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: payload,
            })
            setIsBuildTriggerLoading(false)
            return
        }

        try {
            await triggerBuild({ payload, redirectToCIPipeline })
            handleClose()
        } catch {
            // Do nothing
        } finally {
            setIsBuildTriggerLoading(false)
        }
    }

    const handleRuntimeParamChange: GitInfoMaterialProps['handleRuntimeParamChange'] = (updatedRuntimeParams) => {
        setRuntimeParams(updatedRuntimeParams)
    }

    const handleStartBuildAction = async (e: SyntheticEvent) => {
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
        await onClickTriggerCINode()
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
                disabled={!canTrigger || showContentLoader}
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
                    <Icon name="ic-storage" color={null} size={24} />
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
            progressingProps={{
                pageLoader: true,
            }}
        >
            {!showContentLoader && (
                <GitInfoMaterial
                    appId={appId}
                    workflowId={selectedWorkflow?.id}
                    node={ciNode}
                    isJobView={isJobView}
                    setMaterialList={setMaterialList}
                    materialList={materialList}
                    showWebhookModal={showWebhookModal}
                    reloadCompleteMaterialList={reloadMaterialList}
                    runtimeParams={runtimeParams}
                    runtimeParamsErrorState={runtimeParamsErrorState}
                    handleRuntimeParamChange={handleRuntimeParamChange}
                    handleRuntimeParamError={handleRuntimeParamError}
                    selectedEnv={selectedEnv}
                    handleDisplayWebhookModal={handleDisplayWebhookModal}
                    selectedCIPipeline={selectedCIPipeline}
                    handleReloadWithWorkflows={handleReloadWithWorkflows}
                />
            )}
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
                        <BuildImageHeader
                            showWebhookModal={showWebhookModal}
                            handleWebhookModalBack={handleWebhookModalBack}
                            pipelineName={ciNode?.title}
                            isJobView={isJobView}
                            handleClose={handleClose}
                        />

                        <div className="flex-grow-1 dc__overflow-auto w-100">{renderContent()}</div>
                    </div>

                    {ciNode?.isTriggerBlocked || showWebhookModal || materialListError ? null : (
                        <div className="flexbox dc__content-space dc__gap-12 py-16 px-20 border__primary--top dc__no-shrink">
                            {isJobView ? renderEnvironments() : renderCacheInfo()}
                            {renderCTAButton()}
                        </div>
                    )}
                </div>
            </Drawer>
            <Prompt when={isBuildTriggerLoading} message={DEFAULT_ROUTE_PROMPT_MESSAGE} />
        </>
    )
}

export default BuildImageModal
