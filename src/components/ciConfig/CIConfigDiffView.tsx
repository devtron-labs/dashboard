import React, { useState } from 'react'
import { showError, Progressing, Drawer, DeleteDialog, noop } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as CloseIcon } from '../../assets/icons/ic-cross.svg'
import { ReactComponent as EditIcon } from '../../assets/icons/ic-pencil.svg'
import { ReactComponent as DeleteIcon } from '../../assets/icons/ic-delete-interactive.svg'
import { Workflow } from '../workflowEditor/Workflow'
import { Link, useHistory, useLocation, useParams, useRouteMatch } from 'react-router-dom'
import { URLS } from '../../config'
import { CIConfigDiffViewProps } from './types'
import { WorkflowType } from '../app/details/triggerView/types'
import { DockerConfigOverrideType } from '../ciPipeline/types'
import { CIBuildConfigDiff } from './CIBuildConfigDiff'
import Tippy from '@tippyjs/react'
import { getInitDataWithCIPipeline, saveCIPipeline } from '../ciPipeline/ciPipeline.service'
import { toast } from 'react-toastify'

export default function CIConfigDiffView({
    parentReloading,
    ciConfig,
    configOverridenPipelines,
    configOverrideWorkflows,
    processedWorkflows,
    toggleConfigOverrideDiffModal,
    reload,
    gitMaterials,
}: CIConfigDiffViewProps) {
    const history = useHistory()
    const location = useLocation()
    const match = useRouteMatch<{
        appId: string
    }>()
    const { appId } = useParams<{
        appId: string
    }>()
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [deleteInProgress, setDeleteInProgress] = useState(false)
    const [selectedWFId, setSelectedWFId] = useState(0)
    const wfCIMap = new Map<number, number>()
    const _configOverridenWorkflows = configOverrideWorkflows.filter((_cwf) => {
        const _ciPipeline = configOverridenPipelines?.find((_ci) => _ci.id === _cwf.ciPipelineId)
        if (!!_ciPipeline) {
            wfCIMap.set(_cwf.id, _ciPipeline.id)
            return _ciPipeline
        }
    })
    const _overridenWorkflows = processedWorkflows.workflows.filter(
        (_wf) => !!_configOverridenWorkflows.find((_cwf) => _cwf.id === +_wf.id),
    )
    let globalCIConfig = {} as DockerConfigOverrideType
    if (ciConfig) {
        globalCIConfig = {
            dockerRegistry: ciConfig.dockerRegistry,
            dockerRepository: ciConfig.dockerRepository,
            ciBuildConfig: ciConfig.ciBuildConfig,
        }
    }

    const renderConfigDiffModalTitle = (): JSX.Element => {
        return (
            <div className="flex flex-align-center flex-justify bcn-0 pr-20 dc__border-bottom">
                <h2 className="fs-16 fw-6 lh-1-43 m-0 pt-16 pb-16 pl-20 pr-20">Override Details</h2>
                <button
                    type="button"
                    className="dc__transparent flex icon-dim-24"
                    onClick={toggleConfigOverrideDiffModal}
                >
                    <CloseIcon className="icon-dim-20" />
                </button>
            </div>
        )
    }

    const renderViewBuildPipelineRow = (_wfId: number): JSX.Element => {
        return (
            <div
                className="flex dc__position-abs dc__content-space"
                style={{
                    top: '20px',
                    right: '16px',
                }}
            >
                <Tippy className="default-tt" arrow={false} placement="top" content="Edit override">
                    <Link
                        to={`${URLS.APP}/${appId}/${URLS.APP_CONFIG}/${URLS.APP_WORKFLOW_CONFIG}/${_wfId}/${
                            URLS.APP_CI_CONFIG
                        }/${wfCIMap.get(_wfId)}/build`}
                        className="flex mr-16"
                    >
                        <EditIcon className="icon-dim-24" />
                    </Link>
                </Tippy>
                <Tippy className="default-tt" arrow={false} placement="top" content="Delete override">
                    <DeleteIcon
                        className="icon-dim-24 scr-5 cursor"
                        onClick={() => toggleDeleteDialogVisibility(_wfId)}
                    />
                </Tippy>
            </div>
        )
    }

    // Todo: Revisit when restructuring/revamping pipeline flow painting/rendering
    const getWorkflowHeight = (_wf: WorkflowType) => {
        const gitMaterialCount = _wf.nodes.filter((_nd) => _nd.type === 'GIT')?.length

        if (gitMaterialCount > 3) {
            return _wf.height
        }

        const ci = _wf.nodes.find((node) => node.type == 'CI')
        if (ci) {
            const _cdNamesList =
                _configOverridenWorkflows?.find((_cwf) => _cwf.ciPipelineId === +ci.id)?.cdPipelines || []

            if (gitMaterialCount === 1) {
                return 110 + _cdNamesList.length * 20
            } else if (gitMaterialCount === 2) {
                return _cdNamesList.length <= 5
                    ? 200
                    : _cdNamesList.length <= 7
                    ? 230
                    : _cdNamesList.length <= 9
                    ? 250
                    : 280
            }
        }

        return 280
    }

    const toggleDeleteDialogVisibility = (workflowId?: number) => {
        setShowDeleteDialog(!showDeleteDialog)
        setSelectedWFId(showDeleteDialog ? 0 : workflowId)
    }

    const deleteOverride = async () => {
        const ciPipelineId = wfCIMap.get(selectedWFId)
        if (ciPipelineId) {
            setDeleteInProgress(true)
            try {
                const { form, ciPipeline } = await getInitDataWithCIPipeline(appId, `${ciPipelineId}`, true)
                if (form && ciPipeline) {
                    const response = await saveCIPipeline(
                        {
                            ...form,
                            scanEnabled: form.scanEnabled,
                            isDockerConfigOverridden: false,
                            dockerConfigOverride: {},
                        },
                        ciPipeline,
                        form.materials,
                        +appId,
                        selectedWFId,
                        false,
                        form.webhookConditionList,
                        form.ciPipelineSourceTypeOptions,
                    )

                    if (response) {
                        setShowDeleteDialog(false)
                        toast.success('Deleted successfully!')
                        reload(true)
                        return
                    }
                }
                toast.error('Unable to delete override! Please try again after sometime.')
            } catch (e) {
                showError(e)
            } finally {
                setDeleteInProgress(false)
            }
        } else {
            toast.error('Unable to delete override! Please try again after sometime.')
        }
    }

    return (
        <Drawer parentClassName="dc__overflow-hidden" position="right" width="87%" minWidth="1024px" maxWidth="1246px">
            <div className="modal__body modal__config-override-diff br-0 modal__body--p-0 dc__overflow-hidden">
                {renderConfigDiffModalTitle()}
                <div className="config-override-diff__view h-100 p-20 dc__window-bg dc__overflow-scroll">
                    {parentReloading || processedWorkflows.processing ? (
                        <Progressing pageLoader />
                    ) : (
                        _overridenWorkflows.map((_wf) => (
                            <div className="mb-20 dc__position-rel">
                                <Workflow
                                    key={_wf.id}
                                    id={+_wf.id}
                                    name={_wf.name}
                                    startX={_wf.startX}
                                    startY={_wf.startY}
                                    height={getWorkflowHeight(_wf)}
                                    width={'100%'}
                                    nodes={_wf.nodes}
                                    history={history}
                                    location={location}
                                    match={match}
                                    handleCDSelect={noop}
                                    handleCISelect={noop}
                                    openEditWorkflow={noop}
                                    showDeleteDialog={noop}
                                    addCIPipeline={noop}
                                    addWebhookCD={noop}
                                    cdWorkflowList={_configOverridenWorkflows}
                                />
                                {renderViewBuildPipelineRow(+_wf.id)}
                                <CIBuildConfigDiff
                                    configOverridenWorkflows={_configOverridenWorkflows}
                                    wfId={_wf.id}
                                    configOverridenPipelines={configOverridenPipelines}
                                    materials={ciConfig?.materials}
                                    globalCIConfig={globalCIConfig}
                                    gitMaterials = {gitMaterials}
                                />
                            </div>
                        ))
                    )}
                </div>
                {showDeleteDialog && (
                    <DeleteDialog
                        title="Delete Override"
                        description="Are you sure you want to delete override for this pipeline"
                        deletePrefix="Confirm "
                        closeDelete={toggleDeleteDialogVisibility}
                        delete={deleteOverride}
                        apiCallInProgress={deleteInProgress}
                    />
                )}
            </div>
        </Drawer>
    )
}
