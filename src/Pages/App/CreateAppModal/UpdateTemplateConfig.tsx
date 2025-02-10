import { noop } from '@devtron-labs/devtron-fe-common-lib'

import MaterialList from '@Components/material/MaterialList'
import CIConfig from '@Components/ciConfig/CIConfig'
import { CIConfigProps } from '@Components/ciConfig/types'
import { DockerConfigOverrideKeys } from '@Components/ciPipeline/types'
import { MaterialListProps } from '@Components/material/material.types'

import { Workflow, WorkflowProps } from './Workflow'
import { CreateAppFormStateActionType, UpdateTemplateConfigProps } from './types'

const parentState: CIConfigProps['parentState'] = {
    loadingState: null,
    selectedCIPipeline: null,
    dockerRegistries: null,
    sourceConfig: null,
    ciConfig: null,
    defaultDockerConfigs: null,
    currentCIBuildType: null,
}

const UpdateTemplateConfig = ({ formState, isJobView, handleFormStateChange }: UpdateTemplateConfigProps) => {
    const stringTemplateId = formState.templateConfig.templateId.toString()

    const handleBuildConfigurationChange: CIConfigProps['updateDockerConfigOverride'] = (key, value) => {
        switch (key) {
            case DockerConfigOverrideKeys.dockerRegistry:
                handleFormStateChange({
                    action: CreateAppFormStateActionType.updateBuildConfiguration,
                    value: {
                        ...formState.buildConfiguration,
                        dockerRegistry: value,
                    },
                })
                break
            case DockerConfigOverrideKeys.dockerRepository:
                handleFormStateChange({
                    action: CreateAppFormStateActionType.updateBuildConfiguration,
                    value: {
                        ...formState.buildConfiguration,
                        dockerRepository: value,
                    },
                })
                break
            default:
                break
        }
    }

    const handleCIConfigParentStateUpdate: CIConfigProps['setParentState'] = (updatedParentStateOrHandler) => {
        const {
            ciConfig: { dockerRegistry, dockerRepository },
        } = updatedParentStateOrHandler

        handleFormStateChange({
            action: CreateAppFormStateActionType.updateBuildConfiguration,
            value: {
                dockerRegistry,
                dockerRepository,
            },
        })
    }

    const handleGitMaterialsChange: MaterialListProps['handleGitMaterialsChange'] = (updatedGitMaterial, isError) => {
        handleFormStateChange({
            action: CreateAppFormStateActionType.updateGitMaterials,
            value: {
                data: updatedGitMaterial.map(({ id, gitProvider, url }) => ({
                    gitMaterialId: id,
                    gitAccountId: gitProvider.id,
                    gitMaterialURL: url,
                })),
                isError,
            },
        })
    }

    const handleWorkflowConfigChange: WorkflowProps['onChange'] = (workflowConfig, isError) => {
        handleFormStateChange({
            action: CreateAppFormStateActionType.updateWorkflowConfig,
            value: {
                data: workflowConfig,
                isError,
            },
        })
    }

    return (
        <>
            <div className="divider__secondary--horizontal" />
            <div className="br-8 border__secondary bg__primary p-20 flexbox-col dc__gap-16">
                <h4 className="fs-14 fw-6 lh-20 cn-9 m-0">Code Source</h4>
                <MaterialList
                    isCreateAppView
                    respondOnSuccess={noop}
                    appId={stringTemplateId}
                    isJobView={isJobView}
                    handleGitMaterialsChange={handleGitMaterialsChange}
                    setRepo={noop}
                    toggleRepoSelectionTippy={noop}
                />
            </div>
            <div className="br-8 border__secondary bg__primary p-20 flexbox-col dc__gap-16">
                <h4 className="fs-14 fw-6 lh-20 cn-9 m-0">Build Configuration</h4>
                <CIConfig
                    isCreateAppView
                    appId={stringTemplateId}
                    configOverrideView={false}
                    allowOverride={false}
                    isCDPipeline={false}
                    respondOnSuccess={noop}
                    parentState={parentState}
                    setParentState={handleCIConfigParentStateUpdate}
                    updateDockerConfigOverride={handleBuildConfigurationChange}
                />
            </div>
            <div className="br-8 border__secondary bg__primary p-20 flexbox-col dc__gap-16">
                <h4 className="fs-14 fw-6 lh-20 cn-9 m-0">Workflows</h4>
                <Workflow templateId={stringTemplateId} onChange={handleWorkflowConfigChange} />
            </div>
        </>
    )
}

export default UpdateTemplateConfig
