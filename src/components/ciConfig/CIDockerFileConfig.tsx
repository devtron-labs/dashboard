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

import React, { Fragment, useEffect, useState } from 'react'
import Tippy from '@tippyjs/react'
import {
    CIBuildType,
    ConditionalWrap,
    showError,
    Progressing,
    useMainContext,
} from '@devtron-labs/devtron-fe-common-lib'
import CIAdvancedConfig from './CIAdvancedConfig'
import BuildContext from './BuildContext'
import CISelfDockerBuildOption from './CISelfDockerBuildOption'
import CICreateDockerfileOption from './CICreateDockerfileOption'
import CIBuildpackBuildOptions from './CIBuildpackBuildOptions'
import { CI_BUILDTYPE_ALIAS } from './CIConfig.utils'
import { getBuildpackMetadata, getDockerfileTemplate } from './service'
import { DockerConfigOverrideKeys } from '../ciPipeline/types'
import { BuildersAndFrameworksType, CIDockerFileConfigProps, LoadingState } from './types'
import { RootBuildContext, CI_BUILD_TYPE_OPTIONS } from './ciConfigConstant'
import { FEATURE_DISABLED } from '../../config/constantMessaging'
import { ReactComponent as CheckIcon } from '../../assets/icons/ic-check.svg'
import { ReactComponent as ErrorIcon } from '../../assets/icons/ic-error-exclamation.svg'

export default function CIDockerFileConfig({
    configOverrideView,
    ciConfig,
    sourceConfig,
    allowOverride,
    selectedCIPipeline,
    currentMaterial,
    currentBuildContextGitMaterial,
    selectedMaterial,
    setSelectedMaterial,
    selectedBuildContextGitMaterial,
    setSelectedBuildContextGitMaterial,
    formState,
    updateDockerConfigOverride,
    args,
    setArgs,
    buildEnvArgs,
    setBuildEnvArgs,
    setArgsError,
    handleOnChangeConfig,
    selectedTargetPlatforms,
    setSelectedTargetPlatforms,
    targetPlatformMap,
    showCustomPlatformWarning,
    setShowCustomPlatformWarning,
    currentCIBuildConfig,
    setCurrentCIBuildConfig,
    setLoadingState,
}: CIDockerFileConfigProps) {
    const [ciBuildTypeOption, setCIBuildTypeOption] = useState<CIBuildType>(currentCIBuildConfig.ciBuildType)
    const [buildersAndFrameworks, setBuildersAndFrameworks] = useState<BuildersAndFrameworksType>({
        builders: [],
        frameworks: [],
        selectedBuilder: null,
        selectedLanguage: null,
        selectedVersion: null,
    })
    const [loadingTemplateData, setLoadingTemplateData] = useState<LoadingState>({
        loading: false,
        failed: false,
    })

    const { isAirgapped } = useMainContext()

    const isBuildpackType = ciBuildTypeOption === CIBuildType.BUILDPACK_BUILD_TYPE
    const isDefaultBuildContext = (): boolean => {
        if (window._env_.ENABLE_BUILD_CONTEXT) {
            // TODO: Re-assess with product
            const selectedCIBuildContext = selectedCIPipeline?.dockerConfigOverride?.ciBuildConfig
            const currentOverriddenBuildContext = selectedCIBuildContext?.dockerBuildConfig?.buildContext
            const currentOverriddenGitMaterialId = selectedCIBuildContext?.gitMaterialId
            const currentOverriddenBuildContextGitMaterialId = selectedCIBuildContext?.buildContextGitMaterialId

            const isSameCurrentBuildContext =
                currentOverriddenGitMaterialId === currentOverriddenBuildContextGitMaterialId &&
                !currentOverriddenBuildContext

            const isSameGlobalBuildContext =
                currentMaterial?.id === currentBuildContextGitMaterial?.id &&
                !ciConfig?.ciBuildConfig?.dockerBuildConfig?.buildContext

            return configOverrideView && allowOverride ? isSameCurrentBuildContext : isSameGlobalBuildContext
        }
        return false
    }

    useEffect(() => {
        if (
            (buildersAndFrameworks.builders.length === 0 || buildersAndFrameworks.frameworks.length === 0) &&
            (ciBuildTypeOption === CIBuildType.MANAGED_DOCKERFILE_BUILD_TYPE ||
                ciBuildTypeOption === CIBuildType.BUILDPACK_BUILD_TYPE)
        ) {
            fetchBuildPackAndTemplateData()
        }
    }, [ciBuildTypeOption])

    useEffect(() => {
        if (configOverrideView && updateDockerConfigOverride && currentCIBuildConfig) {
            updateDockerConfigOverride(DockerConfigOverrideKeys.ciBuildConfig, currentCIBuildConfig)
        }
    }, [currentCIBuildConfig])

    useEffect(() => {
        if (configOverrideView && isBuildpackType && buildEnvArgs && updateDockerConfigOverride) {
            updateDockerConfigOverride(DockerConfigOverrideKeys.buildPackConfig, {
                // FIXME: The current CI build config is not updated on change hence some of the previous values might persist
                ...currentCIBuildConfig,
                buildPackConfig: {
                    ...currentCIBuildConfig.buildPackConfig,
                    args: buildEnvArgs.reduce((agg, { key, value }) => {
                        if (key && value) {
                            agg[key] = value
                        }
                        return agg
                    }, {}),
                },
            })
        }
    }, [buildEnvArgs])

    useEffect(() => {
        if (configOverrideView) {
            setCIBuildTypeOption(
                (allowOverride
                    ? selectedCIPipeline.dockerConfigOverride?.ciBuildConfig?.ciBuildType
                    : ciConfig?.ciBuildConfig?.ciBuildType) || currentCIBuildConfig.ciBuildType,
            )
        }
    }, [allowOverride])

    const fetchBuildPackAndTemplateData = () => {
        const _loadingState = {
            loading: true,
            failed: false,
        }
        setLoadingState(_loadingState)
        setLoadingTemplateData(_loadingState)
        Promise.all([getDockerfileTemplate(), getBuildpackMetadata()])
            .then(([{ result: dockerfileTemplate }, { result: buildpackMetadata }]) => {
                setBuildersAndFrameworks({
                    ...buildersAndFrameworks,
                    builders: buildpackMetadata?.LanguageBuilder || [],
                    frameworks: dockerfileTemplate?.LanguageFrameworks || [],
                })
                const _loadingState = {
                    loading: false,
                    failed: false,
                }
                setLoadingTemplateData(_loadingState)
                setLoadingState(_loadingState)
            })
            .catch((err) => {
                showError(err)
                const _loadingState = {
                    loading: false,
                    failed: true,
                }
                setLoadingTemplateData(_loadingState)
                setLoadingState(_loadingState)
            })
    }

    const handleFileLocationChange = (selectedMaterial): void => {
        let buildContextGitMaterialId = 0
        if (window._env_.ENABLE_BUILD_CONTEXT) {
            buildContextGitMaterialId = currentCIBuildConfig.buildContextGitMaterialId

            if (isDefaultBuildContext()) {
                setSelectedBuildContextGitMaterial(selectedMaterial)
                buildContextGitMaterialId = selectedMaterial?.id
            }
        }
        setSelectedMaterial(selectedMaterial)
        formState.repository.value = selectedMaterial.name
        setCurrentCIBuildConfig({
            ...currentCIBuildConfig,
            gitMaterialId: selectedMaterial.id,
            buildContextGitMaterialId: window._env_.ENABLE_BUILD_CONTEXT
                ? buildContextGitMaterialId
                : selectedMaterial.id,
        })
    }

    const handleCIBuildTypeOptionSelection = (id: CIBuildType, isDisabled: boolean) => {
        if (!isDisabled) {
            setCIBuildTypeOption(id)
            setCurrentCIBuildConfig({
                ...currentCIBuildConfig,
                ciBuildType: id,
            })
        }
    }

    const canShowTick = (id: CIBuildType) => {
        if (configOverrideView && allowOverride && selectedCIPipeline?.dockerConfigOverride?.ciBuildConfig) {
            return selectedCIPipeline.dockerConfigOverride.ciBuildConfig.ciBuildType === id
        }

        return ciConfig?.ciBuildConfig?.ciBuildType === id
    }

    // TODO: Move this to a separate file
    const renderCIBuildTypeOptions = () => {
        return (
            <div className="flex mb-16">
                {CI_BUILD_TYPE_OPTIONS.map((option) => {
                    const isCurrentlySelected = ciBuildTypeOption === option.id
                    const showTick = canShowTick(option.id)
                    const isDisabled = isAirgapped && option.id != CIBuildType.SELF_DOCKERFILE_BUILD_TYPE
                    const content = !isDisabled ? option.info : FEATURE_DISABLED
                    const condition = (configOverrideView && allowOverride) || isDisabled

                    return (
                        <Fragment key={option.id}>
                            <ConditionalWrap
                                condition={condition}
                                wrap={(children) => (
                                    <Tippy className="default-tt w-250" arrow={false} placement="top" content={content}>
                                        <div className="flex top left flex-1">{children}</div>
                                    </Tippy>
                                )}
                            >
                                <div
                                    id={option.id}
                                    data-testid={`${option.id}-button`}
                                    className={`flex top left flex-1 ${
                                        configOverrideView ? 'h-40' : 'h-80'
                                    } dc__position-rel pt-10 pb-10 pl-12 pr-12 br-4 cursor bw-1 ${
                                        isCurrentlySelected ? 'bcb-1 eb-2' : 'bg__primary en-2'
                                    }
                                    ${isDisabled ? 'dockerfile-select__option--is-disabled' : ''}`}
                                    onClick={() => {
                                        handleCIBuildTypeOptionSelection(option.id, isDisabled)
                                    }}
                                >
                                    {showTick && (
                                        <div className="build-type-selection flex icon-dim-16 bcb-5 dc__position-abs">
                                            <CheckIcon className="icon-dim-10 scn-0" />
                                        </div>
                                    )}
                                    <div>
                                        <option.icon
                                            className={`icon-dim-20 ${
                                                option.noIconFill
                                                    ? ''
                                                    : `${option.iconStroke ? 'sc' : 'fc'}${
                                                          isCurrentlySelected ? 'n-6' : 'b-5'
                                                      }`
                                            }`}
                                        />
                                    </div>
                                    <div className="ml-10">
                                        <span className={`fs-13 fw-6 lh-20 ${isCurrentlySelected ? 'cn-9' : 'cb-5'}`}>
                                            {option.heading}
                                        </span>
                                        {!configOverrideView && (
                                            <p className="fs-13 fw-4 lh-20 cn-7 m-0">{option.info}</p>
                                        )}
                                    </div>
                                </div>
                            </ConditionalWrap>
                            {option.addDivider && (
                                <div
                                    className={`${configOverrideView ? 'h-40' : 'h-48'} dc__border-right-n1 mr-8 ml-8`}
                                />
                            )}
                        </Fragment>
                    )
                })}
            </div>
        )
    }

    const renderSelfDockerfileBuildOption = () => {
        return (
            <div>
                <CISelfDockerBuildOption
                    readOnly={configOverrideView && !allowOverride}
                    sourceMaterials={sourceConfig.material}
                    readonlyDockerfileRelativePath={`${selectedMaterial?.checkoutPath}/${
                        ciConfig?.ciBuildConfig?.dockerBuildConfig?.dockerfileRelativePath || 'Dockerfile'
                    }`.replace('//', '/')}
                    selectedMaterial={selectedMaterial}
                    dockerFileValue={formState.dockerfile.value}
                    configOverrideView={configOverrideView}
                    currentMaterial={currentMaterial}
                    handleOnChangeConfig={handleOnChangeConfig}
                    handleFileLocationChange={handleFileLocationChange}
                    dockerfileError={formState.dockerfile.error}
                />

                {window._env_.ENABLE_BUILD_CONTEXT && (
                    <BuildContext
                        readOnly={configOverrideView && !allowOverride}
                        isDefaultBuildContext={isDefaultBuildContext()}
                        configOverrideView={configOverrideView}
                        sourceConfig={sourceConfig}
                        selectedBuildContextGitMaterial={selectedBuildContextGitMaterial}
                        currentMaterial={currentMaterial}
                        setSelectedBuildContextGitMaterial={setSelectedBuildContextGitMaterial}
                        repositoryError={formState.repository.error}
                        handleOnChangeConfig={handleOnChangeConfig}
                        buildContextValue={formState.buildContext.value}
                        currentCIBuildConfig={currentCIBuildConfig}
                        formState={formState}
                        setCurrentCIBuildConfig={setCurrentCIBuildConfig}
                        currentBuildContextGitMaterial={currentBuildContextGitMaterial}
                        readOnlyBuildContextPath={`${
                            ciConfig?.ciBuildConfig?.useRootBuildContext
                                ? RootBuildContext
                                : selectedBuildContextGitMaterial?.checkoutPath
                        }/${ciConfig?.ciBuildConfig?.dockerBuildConfig?.buildContext || ''}`.replace('//', '/')}
                    />
                )}
            </div>
        )
    }

    const renderManagedDockerfile = () => {
        return (
            <CICreateDockerfileOption
                configOverrideView={configOverrideView}
                allowOverride={allowOverride}
                frameworks={buildersAndFrameworks.frameworks}
                sourceConfig={sourceConfig}
                currentMaterial={currentMaterial}
                currentBuildContextGitMaterial={currentBuildContextGitMaterial}
                selectedMaterial={selectedMaterial}
                handleFileLocationChange={handleFileLocationChange}
                repository={formState.repository}
                currentCIBuildConfig={currentCIBuildConfig}
                setCurrentCIBuildConfig={setCurrentCIBuildConfig}
                setLoadingState={setLoadingState}
                selectedBuildContextGitMaterial={selectedBuildContextGitMaterial}
                ciConfig={ciConfig}
                formState={formState}
                handleOnChangeConfig={handleOnChangeConfig}
                isDefaultBuildContext={isDefaultBuildContext}
                setSelectedBuildContextGitMaterial={setSelectedBuildContextGitMaterial}
            />
        )
    }

    const renderBuildpackBuildOptions = () => {
        return (
            <CIBuildpackBuildOptions
                ciBuildConfig={
                    configOverrideView && allowOverride
                        ? selectedCIPipeline?.dockerConfigOverride?.ciBuildConfig
                        : ciConfig?.ciBuildConfig
                }
                sourceConfig={sourceConfig}
                buildersAndFrameworks={buildersAndFrameworks}
                setBuildersAndFrameworks={setBuildersAndFrameworks}
                configOverrideView={configOverrideView}
                currentMaterial={currentMaterial}
                selectedMaterial={selectedMaterial}
                handleFileLocationChange={handleFileLocationChange}
                repository={formState.repository}
                projectPath={formState.projectPath}
                handleOnChangeConfig={handleOnChangeConfig}
                currentCIBuildConfig={currentCIBuildConfig}
                setCurrentCIBuildConfig={setCurrentCIBuildConfig}
                buildEnvArgs={buildEnvArgs}
                setBuildEnvArgs={setBuildEnvArgs}
                readOnly={configOverrideView && !allowOverride}
            />
        )
    }

    const renderOptionBasedOnBuildType = () => {
        if (ciBuildTypeOption === CIBuildType.SELF_DOCKERFILE_BUILD_TYPE) {
            return renderSelfDockerfileBuildOption()
        }
        if (loadingTemplateData.loading) {
            return (
                <div className="h-250">
                    <Progressing size={24} fillColor="var(--N500)" />
                </div>
            )
        }
        if (loadingTemplateData.failed) {
            return (
                <div className="flex column h-250 dc__gap-12">
                    <ErrorIcon className="icon-dim-20" />
                    <h3 className="fs-13 fw-6 cn-9 m-0">Failed to fetch</h3>
                    <span className="fs-12 fw-6 cb-5 cursor" onClick={fetchBuildPackAndTemplateData}>
                        Retry
                    </span>
                </div>
            )
        }
        if (ciBuildTypeOption === CIBuildType.MANAGED_DOCKERFILE_BUILD_TYPE) {
            return renderManagedDockerfile()
        }
        if (ciBuildTypeOption === CIBuildType.BUILDPACK_BUILD_TYPE) {
            return renderBuildpackBuildOptions()
        }
        return null
    }

    return (
        <div className="white-card white-card__docker-config dc__position-rel">
            <h3 className="fs-14 fw-6 lh-20 m-0 pb-12">
                {configOverrideView && !allowOverride
                    ? `Build the container image ${CI_BUILDTYPE_ALIAS[ciBuildTypeOption]}`
                    : 'How do you want to build the container image?'}
            </h3>
            {(!configOverrideView || allowOverride) && renderCIBuildTypeOptions()}
            {renderOptionBasedOnBuildType()}
            {!loadingTemplateData.loading && !loadingTemplateData.failed && (
                <>
                    {(!configOverrideView || isBuildpackType) && <hr className="mt-16 mb-16" />}
                    <CIAdvancedConfig
                        configOverrideView={configOverrideView}
                        allowOverride={allowOverride}
                        args={isBuildpackType ? buildEnvArgs : args}
                        setArgs={isBuildpackType ? setBuildEnvArgs : setArgs}
                        setArgsError={setArgsError}
                        isBuildpackType={isBuildpackType}
                        selectedTargetPlatforms={selectedTargetPlatforms}
                        setSelectedTargetPlatforms={setSelectedTargetPlatforms}
                        targetPlatformMap={targetPlatformMap}
                        showCustomPlatformWarning={showCustomPlatformWarning}
                        setShowCustomPlatformWarning={setShowCustomPlatformWarning}
                    />
                </>
            )}
        </div>
    )
}
