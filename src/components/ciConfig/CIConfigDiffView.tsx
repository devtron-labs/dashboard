import React from 'react'
import { noop, Progressing, VisibleModal } from '../common'
import { ReactComponent as CloseIcon } from '../../assets/icons/ic-cross.svg'
import { Workflow } from '../workflowEditor/Workflow'
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom'

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
    const _configOverridenWorkflows = configOverrides?.workflows?.filter(
        (_cwf) => !!configOverridenPipelines.find((_ci) => _ci.id === _cwf.ciPipelineId),
    )
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

    const renderValueDiff = (baseValue, currentValue, configName) => {
        return (
            <>
                {baseValue ? renderDetailedValue('code-editor-red-diff', configName, baseValue) : <div />}
                {currentValue ? renderDetailedValue('code-editor-green-diff', configName, currentValue) : <div />}
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
        if (changedGitMaterialBGColor && ciConfig?.materials) {
            for (const gitMaterial of ciConfig.materials) {
                if (gitMaterial.gitMaterialId === globalCIConfig?.dockerBuildConfig?.gitMaterialId) {
                    globalGitMaterialName = gitMaterial.materialName
                } else if (gitMaterial.gitMaterialId === _currentPipelineOverride?.dockerBuildConfig?.gitMaterialId) {
                    currentMaterialName = gitMaterial.materialName
                }
            }
        }

        return (
            <div className="config-override-diff__values dc__border dc__no-top-border dc__bottom-radius-4">
                {changedDockerRegistryBGColor &&
                    renderValueDiff(
                        globalCIConfig?.dockerRegistry,
                        _currentPipelineOverride.dockerRegistry,
                        'Container registry',
                    )}
                {changedDockerRepositoryBGColor &&
                    renderValueDiff(
                        globalCIConfig?.dockerRepository,
                        _currentPipelineOverride.dockerRepository,
                        'Container Repository',
                    )}
                {changedGitMaterialBGColor &&
                    renderValueDiff(globalGitMaterialName, currentMaterialName, 'Git Repository')}
                {changedDockerfileRelativePathBGColor &&
                    renderValueDiff(
                        globalCIConfig?.dockerBuildConfig?.dockerfileRelativePath,
                        _currentPipelineOverride?.dockerBuildConfig?.dockerfileRelativePath,
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

    return (
        <VisibleModal className="">
            <div className="modal__body modal__config-override-diff br-0 modal__body--p-0 dc__overflow-hidden">
                {renderConfigDiffModalTitle()}
                <div className="config-override-diff__view p-20 dc__overflow-scroll">
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
                                    height={'238px'}
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
                                {renderConfigDiff(_configOverridenWorkflows, _wf.id)}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </VisibleModal>
    )
}
