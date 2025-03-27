/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

const UpdateTemplateConfig = ({
    formState,
    isJobView,
    handleFormStateChange,
    formErrorState,
}: UpdateTemplateConfigProps) => {
    const stringTemplateDbId = formState.templateConfig.id.toString()

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

    const handleWorkflowConfigChange: WorkflowProps['onChange'] = (workflowConfig, workflowIdToErrorMessageMap) => {
        handleFormStateChange({
            action: CreateAppFormStateActionType.updateWorkflowConfig,
            value: {
                data: workflowConfig,
                workflowIdToErrorMessageMap,
            },
        })
    }

    return (
        <>
            <div className="divider__secondary--horizontal" />
            <div className="br-8 border__secondary bg__primary p-20 pb-0-imp flexbox-col dc__gap-16">
                <h4 className="fs-14 fw-6 lh-20 cn-9 m-0">Code Source</h4>
                <MaterialList
                    isCreateAppView
                    respondOnSuccess={noop}
                    appId={stringTemplateDbId}
                    isJobView={isJobView}
                    handleGitMaterialsChange={handleGitMaterialsChange}
                    setRepo={noop}
                    toggleRepoSelectionTippy={noop}
                    isTemplateView
                />
            </div>
            <div className="br-8 border__secondary bg__primary p-20 flexbox-col dc__gap-16">
                <h4 className="fs-14 fw-6 lh-20 cn-9 m-0">Build Configuration</h4>
                <CIConfig
                    isCreateAppView
                    isTemplateView
                    appId={stringTemplateDbId}
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
                <Workflow
                    templateId={stringTemplateDbId}
                    onChange={handleWorkflowConfigChange}
                    workflowIdToErrorMessageMap={formErrorState.workflowConfig}
                />
            </div>
        </>
    )
}

export default UpdateTemplateConfig
