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

import React, { useContext, useEffect, useState } from 'react'
import { CIBuildConfigType, CIBuildType, noop } from '@devtron-labs/devtron-fe-common-lib'
import CIConfig from '../ciConfig/CIConfig'
import DockerArgs from './DockerArgs'
import CustomImageTags from './CustomImageTags'
import TargetPlatformSelector from '../ciConfig/TargetPlatformSelector'
import { ComponentStates } from '../../Pages/Shared/EnvironmentOverride/EnvironmentOverrides.types'
import { AdvancedConfigOptionsProps, CIConfigParentState } from '../ciConfig/types'
import { DockerConfigOverrideKeys } from '../ciPipeline/types'
import { OptionType } from '../app/types'
import { DockerArgsAction, HandleDockerArgsUpdateType } from './types'
import { getTargetPlatformMap } from '../ciConfig/CIConfig.utils'
import { pipelineContext } from '../workflowEditor/workflowEditor'
import '../ciConfig/CIConfig.scss'

export default function AdvancedConfigOptions({ ciPipeline, appId, isTemplateView }: AdvancedConfigOptionsProps) {
    const { formData, setFormData, loadingState, setLoadingState, formDataErrorObj, setFormDataErrorObj } =
        useContext(pipelineContext)
    const [collapsedSection, setCollapsedSection] = useState<boolean>(false)
    // TODO: Should be getting that from formData, redundant state
    const [allowOverride, setAllowOverride] = useState<boolean>(ciPipeline?.isDockerConfigOverridden ?? false)
    const [parentState, setParentState] = useState<CIConfigParentState>({
        loadingState: ComponentStates.loading,
        selectedCIPipeline: ciPipeline ? { ...ciPipeline } : null,
        dockerRegistries: null,
        sourceConfig: null,
        ciConfig: null,
        defaultDockerConfigs: null,
        currentCIBuildType: null,
    })
    const [targetPlatforms, setTargetPlatforms] = useState<string>('')
    const targetPlatformMap = getTargetPlatformMap()
    const [selectedTargetPlatforms, setSelectedTargetPlatforms] = useState<OptionType[]>([])
    const [showCustomPlatformWarning, setShowCustomPlatformWarning] = useState<boolean>(false)

    const isGlobalAndNotBuildpack =
        !allowOverride && parentState.ciConfig?.ciBuildConfig.ciBuildType !== CIBuildType.BUILDPACK_BUILD_TYPE
    const isCurrentCITypeBuildpack = parentState.currentCIBuildType === CIBuildType.BUILDPACK_BUILD_TYPE
    const hasParentLoaded = parentState?.loadingState === ComponentStates.loaded
    const showNonBuildpackOptions = hasParentLoaded && (isGlobalAndNotBuildpack || !isCurrentCITypeBuildpack)

    useEffect(() => {
        if (parentState.ciConfig) {
            populateCurrentPlatformsData()
        }
    }, [parentState.ciConfig, allowOverride])

    const populateCurrentPlatformsData = () => {
        const _targetPlatforms =
            allowOverride && parentState.selectedCIPipeline?.isDockerConfigOverridden
                ? parentState.selectedCIPipeline?.dockerConfigOverride?.ciBuildConfig?.dockerBuildConfig?.targetPlatform
                : parentState.ciConfig.ciBuildConfig?.dockerBuildConfig?.targetPlatform
        setTargetPlatforms(_targetPlatforms)

        let _customTargetPlatform = false
        let _selectedPlatforms = []
        if (_targetPlatforms?.length > 0) {
            _selectedPlatforms = _targetPlatforms.split(',').map((platformValue) => {
                if (!_customTargetPlatform) {
                    _customTargetPlatform = !targetPlatformMap.get(platformValue)
                }
                return { label: platformValue, value: platformValue }
            })
        }
        setSelectedTargetPlatforms(_selectedPlatforms)
        setShowCustomPlatformWarning(_customTargetPlatform)
    }

    // All updates to docker args will be handled here, which will will be further merged into formData on introduction of reducer
    const handleDockerArgsUpdate = ({ action, argData }: HandleDockerArgsUpdateType) => {
        setFormData((prevFormData) => {
            const _form = structuredClone(prevFormData)

            switch (action) {
                case DockerArgsAction.ADD:
                    _form.args.unshift({ key: '', value: '' })
                    break

                case DockerArgsAction.UPDATE_KEY:
                    _form.args[argData.index]['key'] = argData.value
                    break

                case DockerArgsAction.UPDATE_VALUE:
                    _form.args[argData.index]['value'] = argData.value
                    break

                case DockerArgsAction.DELETE:
                    _form.args = _form.args.filter((_, index) => index !== argData.index)
                    break
            }

            return _form
        })
    }

    const updateDockerConfigOverride = (
        key: string,
        value: CIBuildConfigType | OptionType[] | boolean | string,
    ): void => {
        setFormData((prevFormData) => {
            const _form = structuredClone(prevFormData)

            // Init the dockerConfigOverride with global values if dockerConfigOverride data is not present
            if (!formData.dockerConfigOverride || !Object.keys(formData.dockerConfigOverride).length) {
                if (parentState.selectedCIPipeline?.isDockerConfigOverridden) {
                    _form.dockerConfigOverride = { ...parentState.selectedCIPipeline.dockerConfigOverride }
                } else if (parentState?.ciConfig) {
                    _form.dockerConfigOverride = {
                        dockerRegistry: parentState.ciConfig.dockerRegistry,
                        dockerRepository: parentState.ciConfig.dockerRepository,
                        ciBuildConfig: parentState.ciConfig.ciBuildConfig,
                    }
                }
            }

            // Update the specific config value present at different level from dockerConfigOverride
            if (key === DockerConfigOverrideKeys.isDockerConfigOverridden) {
                const _value = value as boolean
                _form.isDockerConfigOverridden = _value
                setAllowOverride(_value)
            } else if (
                key === DockerConfigOverrideKeys.dockerRegistry ||
                key === DockerConfigOverrideKeys.dockerRepository
            ) {
                _form.dockerConfigOverride[key] = value as string
            } else if (key === DockerConfigOverrideKeys.targetPlatform) {
                _form.dockerConfigOverride.ciBuildConfig = {
                    ..._form.dockerConfigOverride.ciBuildConfig,
                    dockerBuildConfig: {
                        ..._form.dockerConfigOverride.ciBuildConfig.dockerBuildConfig,
                        targetPlatform: (value as OptionType[])
                            .map((_selectedTarget) => _selectedTarget.label)
                            .join(','),
                    },
                }
            } else if (key === DockerConfigOverrideKeys.dockerfileRelativePath) {
                _form.dockerConfigOverride.ciBuildConfig.dockerBuildConfig.dockerfileRelativePath = value as string
            } else if (key === DockerConfigOverrideKeys.buildContext) {
                _form.dockerConfigOverride.ciBuildConfig.dockerBuildConfig.buildContext = value as string
            } else if (key === DockerConfigOverrideKeys.projectPath) {
                _form.dockerConfigOverride.ciBuildConfig.buildPackConfig.projectPath = value as string
            } else {
                _form.dockerConfigOverride.ciBuildConfig = value as CIBuildConfigType
            }

            // No need to pass the id in the request
            if (_form.dockerConfigOverride.ciBuildConfig?.hasOwnProperty(DockerConfigOverrideKeys.id)) {
                delete _form.dockerConfigOverride.ciBuildConfig.id
            }

            return _form
        })
    }

    const toggleAdvancedOptions = (): void => {
        setCollapsedSection(!collapsedSection)
    }

    const toggleAllowOverride = (): void => {
        if (updateDockerConfigOverride) {
            updateDockerConfigOverride(DockerConfigOverrideKeys.isDockerConfigOverridden, !allowOverride)
        }
    }

    return (
        <div className="ci-advanced-options__container mb-20">
            <hr />
            <div className="ci-advanced-options__toggle flex left pointer" onClick={toggleAdvancedOptions}>
                <div>
                    <h2 className="fs-14 fw-6 cn-9 lh-20 m-0">Override Options</h2>
                    <p className="fs-13 fw-4 cn-7 lh-20 m-0">
                        Override container registry, container image for this pipeline.
                    </p>
                </div>
                <button
                    className={`allow-config-override flex h-28 ml-auto cta ${allowOverride ? 'delete' : 'ghosted'}`}
                    data-testid={`create-build-pipeline-${allowOverride ? 'delete' : 'allow'}-override-button`}
                    onClick={toggleAllowOverride}
                    type="button"
                >
                    {`${allowOverride ? 'Delete' : 'Allow'} Override`}
                </button>
            </div>
            <div className="ci-advanced-options__wrapper">
                <CIConfig
                    respondOnSuccess={noop}
                    configOverrideView
                    allowOverride={allowOverride}
                    parentState={parentState}
                    setParentState={setParentState}
                    updateDockerConfigOverride={updateDockerConfigOverride}
                    loadingStateFromParent={loadingState}
                    setLoadingStateFromParent={setLoadingState}
                    appId={appId}
                    isTemplateView={isTemplateView}
                />

                {showNonBuildpackOptions && (
                    <div className="white-card white-card__docker-config dc__position-rel mb-15">
                        <TargetPlatformSelector
                            allowOverride={allowOverride}
                            selectedTargetPlatforms={selectedTargetPlatforms}
                            setSelectedTargetPlatforms={setSelectedTargetPlatforms}
                            showCustomPlatformWarning={showCustomPlatformWarning}
                            setShowCustomPlatformWarning={setShowCustomPlatformWarning}
                            targetPlatformMap={targetPlatformMap}
                            targetPlatform={targetPlatforms}
                            configOverrideView
                            updateDockerConfigOverride={updateDockerConfigOverride}
                        />
                    </div>
                )}

                {hasParentLoaded && (
                    <CustomImageTags
                        savedTagPattern={parentState.selectedCIPipeline.customTag?.tagPattern}
                        formData={formData}
                        setFormData={setFormData}
                        formDataErrorObj={formDataErrorObj}
                        setFormDataErrorObj={setFormDataErrorObj}
                    />
                )}

                {showNonBuildpackOptions && (
                    <DockerArgs args={formData.args} handleDockerArgsUpdate={handleDockerArgsUpdate} />
                )}
            </div>
        </div>
    )
}
