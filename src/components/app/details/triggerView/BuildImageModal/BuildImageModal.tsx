/**
 * Service layer requirements:
 * - We need to have filteredCIPipelines
 * - Will find the selected pipeline from filteredCIPipelines from which we will get envId [in case of job view]
 * - isLoading as prop for when workflows are loading
 * - If !isLoading and filteredCIPipelines does not contain the selected pipeline, we will show error
 */

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

import {
    APIResponseHandler,
    Button,
    ButtonStyleType,
    ButtonVariantType,
    Checkbox,
    CIMaterialType,
    CIPipelineNodeType,
    ComponentSizeType,
    Drawer,
    ErrorScreenManagerProps,
    Icon,
    ModuleNameMap,
    stopPropagation,
    useAsync,
    WorkflowNodeType,
} from '@devtron-labs/devtron-fe-common-lib'

import { getCIMaterialList } from '@Components/app/service'
import { EnvironmentList } from '@Components/CIPipelineN/EnvironmentList'
import { importComponentFromFELibrary } from '@Components/common'

import { getModuleConfigured } from '../../appDetails/appDetails.service'
import BranchRegexModal from '../BranchRegexModal'
import { BuildImageModalProps, CIMaterialRouterProps } from '../types'

const getRuntimeParams = importComponentFromFELibrary('getRuntimeParams', null, 'function')

/**
 * TODO:
 * - On save/change of branch call plugin state api and update the state of workflow
 */
const BuildImageModal = ({
    handleClose,
    isJobView,
    filteredCIPipelines,
    workflows,
    reloadWorkflows,
    updateWorkflows,
    appId,
    environmentLists,
}: BuildImageModalProps) => {
    const { ciNodeId } = useParams<Pick<CIMaterialRouterProps, 'ciNodeId'>>()
    const materialListAbortControllerRef = useRef<AbortController>(new AbortController())

    const [showRegexBranchChangeModal, setShowRegexBranchChangeModal] = useState<boolean>(false)
    const [selectedEnv, setSelectedEnv] = useState<BuildImageModalProps['environmentLists'][number] | null>(null)

    // Workflows will be present since this modal is only opened when workflows are loaded
    const ciNode = (workflows || [])
        .flatMap((workflow) => workflow.nodes)
        .find((node) => node.type === CIPipelineNodeType.CI && node.id === ciNodeId)
    // TODO: Add as much type as possible to selectedCIPipeline
    const selectedCIPipeline = (filteredCIPipelines || []).find((_ci) => _ci.id === +ciNodeId)
    const workflowId = workflows?.find((workflow) =>
        workflow.nodes.some((node) => node.type === WorkflowNodeType.CI && Number(node.id) === +ciNodeId),
    )?.id

    const getMaterialList = async (): Promise<CIMaterialType[]> => {
        const { result: materialList } = await getCIMaterialList(
            {
                pipelineId: ciNodeId,
            },
            materialListAbortControllerRef.current.signal,
        )

        setShowRegexBranchChangeModal(
            !!selectedCIPipeline?.ciMaterial?.some(
                (material) =>
                    material.isRegex &&
                    materialList.some((_mat) => _mat.gitMaterialId === material.gitMaterialId && !_mat.value),
            ),
        )

        return materialList
    }

    const [areRuntimeParamsLoading, runtimeParams, runtimeParamsError, reloadRuntimeParams] = useAsync(
        () => getRuntimeParams(ciNodeId, true),
        [ciNodeId],
        !!ciNodeId && !!getRuntimeParams,
    )

    const [isMaterialListLoading, materialList, materialListError, reloadMaterialList, setMaterialList] = useAsync(
        getMaterialList,
        [ciNodeId, appId],
        !!ciNodeId && !!appId,
    )

    const [isLoadingBlobStorageModule, blobStorageModuleRes, , reloadBlobStorageModule] = useAsync(() =>
        getModuleConfigured(ModuleNameMap.BLOB_STORAGE),
    )

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

    useEffect(() => {
        if (isJobView && environmentLists?.length > 0) {
            const envId = selectedCIPipeline?.environmentId || 0
            const _selectedEnv = environmentLists.find((env) => +env.id === +envId)
            setSelectedEnv(_selectedEnv)
        }

        return () => materialListAbortControllerRef.current.abort()
    }, [])

    const showContentLoader = areRuntimeParamsLoading || isMaterialListLoading

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
        if (this.props.isFirstTrigger) {
            return (
                <div className="flexbox">
                    <Info className="icon-dim-20 mr-8" />
                    <div>
                        <div className="fw-6 fs-13">{IGNORE_CACHE_INFO.FirstTrigger.title}</div>
                        <div className="fw-4 fs-12">{IGNORE_CACHE_INFO.FirstTrigger.infoText}</div>
                    </div>
                </div>
            )
        }
        if (!this.state.isBlobStorageConfigured) {
            return (
                <div className="flexbox flex-align-center">
                    <Storage className="icon-dim-24 mr-8" />
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
        if (!this.props.isCacheAvailable) {
            return (
                <div className="flexbox">
                    <Info className="icon-dim-20 mr-8" />
                    <div>
                        <div className="fw-6 fs-13">{IGNORE_CACHE_INFO.CacheNotAvailable.title}</div>
                        <div className="fw-4 fs-12">{IGNORE_CACHE_INFO.CacheNotAvailable.infoText}</div>
                    </div>
                </div>
            )
        }
        return (
            <Checkbox
                isChecked={this.context.invalidateCache}
                onClick={this.onClickStopPropagation}
                rootClassName="form__checkbox-label--ignore-cache mb-0 flex top"
                value="CHECKED"
                onChange={this.context.toggleInvalidateCache}
                data-testid="set-clone-directory"
            >
                <div className="mr-5">
                    <div className="fs-13 fw-6 lh-20">{IGNORE_CACHE_INFO.IgnoreCache.title}</div>

                    <div className="flex dc__gap-4">
                        <span className="fs-12 fw-4 lh-16">{IGNORE_CACHE_INFO.IgnoreCache.infoText}</span>

                        <Tooltip content={IGNORE_CACHE_INFO.IgnoreCache.infoTooltipContent} alwaysShowTippyOnHover>
                            {/* NOTE: need to wrap react elements with html elements when passing as children to tooltip */}
                            <div>
                                <ICInfoOutline className="dc__no-shrink icon-dim-16 flex scn-6" />
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
            <>
                <div />

                {showRegexBranchChangeModal && (
                    <BranchRegexModal
                        material={materialList}
                        selectedCIPipeline={selectedCIPipeline}
                        title={ciNode?.title}
                        // FIXME: Later add
                        isChangeBranchClicked={false}
                        onCloseBranchRegexModal={handleCloseBranchRegexModal}
                        appId={appId}
                        workflowId={workflowId}
                        handleReload={handleReloadWithWorkflows}
                    />
                )}
            </>
        </APIResponseHandler>
    )

    return (
        <Drawer position="right" width="1024px" onClose={handleClose} onEscape={handleClose}>
            <div
                className="flexbox-col dc__content-space h-100 bg__modal--primary shadow__modal dc__overflow-auto"
                onClick={stopPropagation}
            >
                <div className="flexbox-col dc__overflow-auto flex-grow-1">
                    <div className="px-20 py-12 flexbox dc__content-space dc__align-items-center border__primary--bottom">
                        <h2 className="m-0 fs-16 fw-6 lh-24 cn-9">
                            {isJobView ? 'Pipeline:' : 'Build Pipeline:'} {ciNode?.title}
                        </h2>

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

                    <div className="flexbox flex-grow-1 dc__overflow-auto w-100">{renderContent()}</div>
                </div>

                <div className="flexbox dc__content-end dc__gap-12 py-16 px-20 border__primary--top dc__no-shrink">
                    {isJobView ? renderEnvironments() : renderCacheInfo()}
                </div>
            </div>
        </Drawer>
    )
}

export default BuildImageModal
