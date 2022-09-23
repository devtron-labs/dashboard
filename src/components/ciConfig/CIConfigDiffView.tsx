import React, { useEffect } from 'react'
import { noop, Progressing, VisibleModal } from '../common'
import { ReactComponent as CloseIcon } from '../../assets/icons/ic-cross.svg'
import { Workflow } from '../workflowEditor/Workflow'
import { Link, useHistory, useLocation, useParams, useRouteMatch } from 'react-router-dom'
import { URLS } from '../../config'

export default function CIConfigDiffView({
    ciConfig,
    configOverridenPipelines,
    configOverrides,
    processedWorkflows,
    toggleConfigOverrideDiffModal,
}) {
    const history = useHistory()
    const location = useLocation()
    const match = useRouteMatch<{
        appId: string
    }>()
    const { appId } = useParams<{
        appId: string
    }>()
    const wfCIMap = new Map<number, number>()
    const _configOverridenWorkflows = configOverrides?.workflows?.filter((_cwf) => {
        const _ciPipeline = configOverridenPipelines.find((_ci) => _ci.id === _cwf.ciPipelineId)
        if (!!_ciPipeline) {
            wfCIMap.set(_cwf.id, _ciPipeline.id)
            return _ciPipeline
        }
    })
    const _overridenWorkflows = processedWorkflows.workflows.filter(
        (_wf) => !!_configOverridenWorkflows.find((_cwf) => _cwf.id === +_wf.id),
    )
    const globalCIConfig = {
        dockerRegistry: ciConfig?.dockerRegistry,
        dockerRepository: ciConfig?.dockerRepository,
        dockerBuildConfig: {
            gitMaterialId: ciConfig?.dockerBuildConfig?.gitMaterialId,
            dockerfileRelativePath: ciConfig?.dockerBuildConfig?.dockerfileRelativePath,
        },
    }

    const renderDetailedValue = (parentClassName: string, title: string, value: string) => {
        return (
            <div className={parentClassName}>
                <div className="cn-6 pt-8 pl-16 pr-16 lh-16">{title}</div>
                <div className="cn-9 fs-13 pb-8 pl-16 pr-16 lh-20 mh-28">{value}</div>
            </div>
        )
    }

    const renderValueDiff = (baseValue, currentValue, changedBGColor, configName) => {
        return (
            <>
                {baseValue ? (
                    renderDetailedValue(changedBGColor ? 'code-editor-red-diff' : '', configName, baseValue)
                ) : (
                    <div />
                )}
                {currentValue ? (
                    renderDetailedValue(changedBGColor ? 'code-editor-green-diff' : '', configName, currentValue)
                ) : (
                    <div />
                )}
            </>
        )
    }

    const renderConfigDiff = (_configOverridenWorkflows, wfId) => {
        const _currentWorkflow = _configOverridenWorkflows?.find((_wf) => +wfId === _wf.id)
        const _currentPipelineOverride = configOverridenPipelines?.find(
            (_ci) => _currentWorkflow.ciPipelineId === _ci.id,
        )?.dockerConfigOverride
        const changedDockerRegistryBGColor = globalCIConfig?.dockerRegistry !== _currentPipelineOverride?.dockerRegistry
        const changedDockerRepositoryBGColor =
            globalCIConfig?.dockerRepository !== _currentPipelineOverride?.dockerRepository
        const changedDockerfileRelativePathBGColor =
            globalCIConfig?.dockerBuildConfig?.dockerfileRelativePath !==
            _currentPipelineOverride?.dockerBuildConfig?.dockerfileRelativePath
        const changedGitMaterialBGColor =
            globalCIConfig?.dockerBuildConfig?.gitMaterialId !==
            _currentPipelineOverride?.dockerBuildConfig?.gitMaterialId

        let globalGitMaterialName, currentMaterialName
        if (ciConfig?.materials) {
            for (const gitMaterial of ciConfig.materials) {
                if (gitMaterial.gitMaterialId === globalCIConfig?.dockerBuildConfig?.gitMaterialId) {
                    globalGitMaterialName = gitMaterial.materialName
                }

                if (gitMaterial.gitMaterialId === _currentPipelineOverride?.dockerBuildConfig?.gitMaterialId) {
                    currentMaterialName = gitMaterial.materialName
                }
            }
        }

        return (
            <div className="config-override-diff__values dc__border dc__bottom-radius-4">
                {renderValueDiff(
                    globalCIConfig?.dockerRegistry,
                    _currentPipelineOverride.dockerRegistry,
                    changedDockerRegistryBGColor,
                    'Container registry',
                )}
                {renderValueDiff(
                    globalCIConfig?.dockerRepository,
                    _currentPipelineOverride.dockerRepository,
                    changedDockerRepositoryBGColor,
                    'Container Repository',
                )}
                {renderValueDiff(
                    globalGitMaterialName,
                    currentMaterialName,
                    changedGitMaterialBGColor,
                    'Git Repository',
                )}
                {renderValueDiff(
                    globalCIConfig?.dockerBuildConfig?.dockerfileRelativePath,
                    _currentPipelineOverride?.dockerBuildConfig?.dockerfileRelativePath,
                    changedDockerfileRelativePathBGColor,
                    'Docker file path',
                )}
            </div>
        )
    }

    const renderConfigDiffModalTitle = () => {
        return (
            <div className="flex flex-align-center flex-justify bcn-0 pr-20 dc__border-bottom">
                <h2 className="fs-16 fw-6 lh-1-43 m-0 pt-16 pb-16 pl-20 pr-20">Override details</h2>
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

    const renderViewBuildPipelineRow = (_wfId: number) => {
        return (
            <div className="flex dc__content-space pl-16 pr-16 pb-10 bcn-0 dc__border-left dc__border-right">
                <span className="fs-14 fw-4 lh-20">Build pipeline is overriden</span>
                <Link
                    to={`${URLS.APP}/${appId}/${URLS.APP_CONFIG}/${URLS.APP_WORKFLOW_CONFIG}/${_wfId}/${
                        URLS.APP_CI_CONFIG
                    }/${wfCIMap.get(_wfId)}/build`}
                    className="fs-14 fw-4 lh-20"
                >
                    View build pipeline
                </Link>
            </div>
        )
    }

    return (
        <VisibleModal className="">
            <div className="modal__body modal__config-override-diff br-0 modal__body--p-0 dc__overflow-hidden">
                {renderConfigDiffModalTitle()}
                <div className="config-override-diff__view p-20 dc__window-bg dc__overflow-scroll">
                    {processedWorkflows.processing ? (
                        <Progressing pageLoader />
                    ) : (
                        _overridenWorkflows.map((_wf) => (
                            <div className="mb-20">
                                <Workflow
                                    key={_wf.id}
                                    id={+_wf.id}
                                    name={_wf.name}
                                    startX={_wf.startX}
                                    startY={_wf.startY}
                                    height={_wf.height}
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
                                    cdWorkflowList={_configOverridenWorkflows}
                                />
                                {renderViewBuildPipelineRow(+_wf.id)}
                                {renderConfigDiff(_configOverridenWorkflows, _wf.id)}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </VisibleModal>
    )
}
