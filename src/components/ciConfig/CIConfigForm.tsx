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

import { useEffect, useState } from 'react'
import {
    CIBuildConfigType,
    CIBuildType,
    showError,
    ToastVariantType,
    ToastManager,
    ConfirmationModal,
    ConfirmationModalVariantType,
    Button,
} from '@devtron-labs/devtron-fe-common-lib'
import { DOCUMENTATION } from '../../config'
import { OptionType } from '../app/types'
import { CIPipelineBuildType, DockerConfigOverrideKeys } from '../ciPipeline/types'
import { getGitProviderIcon, useForm } from '../common'
import { saveCIConfig, updateCIConfig } from './service'
import {
    CIBuildArgType,
    CIConfigFormProps,
    CurrentMaterialType,
    LoadingState,
    SelectedGitMaterialType,
    SourceConfigType,
} from './types'
import warningIconSrc from '../../assets/icons/ic-warning-y6.svg'
import { ReactComponent as BookOpenIcon } from '../../assets/icons/ic-book-open.svg'
import { ReactComponent as NextIcon } from '../../assets/icons/ic-arrow-right.svg'
import CIConfigDiffView from './CIConfigDiffView'
import CIContainerRegistryConfig from './CIContainerRegistryConfig'
import CIDockerFileConfig from './CIDockerFileConfig'
import {
    CI_CONFIG_FORM_VALIDATION,
    getCIConfigFormState,
    getTargetPlatformMap,
    initCurrentCIBuildConfig,
    processBuildArgs,
} from './CIConfig.utils'

export default function CIConfigForm({
    parentReloading,
    dockerRegistries,
    sourceConfig,
    ciConfig,
    reload,
    appId,
    selectedCIPipeline,
    configOverrideView,
    allowOverride,
    updateDockerConfigOverride,
    isCDPipeline,
    isCiPipeline,
    parentState,
    setParentState,
    loadingStateFromParent,
    setLoadingStateFromParent,
    isTemplateView,
    isCreateAppView,
}: CIConfigFormProps) {
    const currentMaterial: CurrentMaterialType =
        allowOverride && selectedCIPipeline?.isDockerConfigOverridden
            ? sourceConfig.material.find(
                  (material) => material.id === selectedCIPipeline.dockerConfigOverride?.ciBuildConfig?.gitMaterialId,
              )
            : ciConfig?.ciBuildConfig?.gitMaterialId
              ? sourceConfig.material.find((material) => material.id === ciConfig?.ciBuildConfig?.gitMaterialId)
              : sourceConfig.material[0]
    const buildCtxGitMaterial =
        allowOverride && selectedCIPipeline?.isDockerConfigOverridden
            ? sourceConfig.material.find(
                  (material) =>
                      material.id === selectedCIPipeline.dockerConfigOverride?.ciBuildConfig?.buildContextGitMaterialId,
              )
            : ciConfig?.ciBuildConfig?.buildContextGitMaterialId
              ? sourceConfig.material.find(
                    (material) => material.id === ciConfig?.ciBuildConfig?.buildContextGitMaterialId,
                )
              : sourceConfig.material[0]

    const getParsedCurrentMaterial = (material?): SelectedGitMaterialType => {
        const _currentMaterial = {
            ...material,
            name: material?.name || currentMaterial.name,
            url: material?.url || currentMaterial.url,
            value: material?.id || currentMaterial.id,
            label: material?.name || currentMaterial.name,
            startIcon: getGitProviderIcon(material?.url || currentMaterial.url),
            checkoutPath: material?.checkoutPath || currentMaterial.checkoutPath,
        }
        return _currentMaterial
    }

    const getParsedSourceConfig = (): SourceConfigType => {
        const _sourceConfig = { ...sourceConfig }
        _sourceConfig.material = _sourceConfig.material.map(getParsedCurrentMaterial)
        return _sourceConfig
    }

    const currentBuildContextGitMaterial = buildCtxGitMaterial || getParsedCurrentMaterial()

    const [selectedMaterial, setSelectedMaterial] = useState<SelectedGitMaterialType>(getParsedCurrentMaterial)
    const [selectedBuildContextGitMaterial, setSelectedBuildContextGitMaterial] =
        useState(currentBuildContextGitMaterial)
    const currentRegistry =
        allowOverride && selectedCIPipeline?.isDockerConfigOverridden
            ? dockerRegistries.find((reg) => reg.id === selectedCIPipeline.dockerConfigOverride?.dockerRegistry)
            : ciConfig && ciConfig.dockerRegistry
              ? dockerRegistries.find((reg) => reg.id === ciConfig.dockerRegistry)
              : dockerRegistries.find((reg) => reg.isDefault)
    const { state, handleOnChange, handleOnSubmit } = useForm(
        getCIConfigFormState(ciConfig, selectedCIPipeline, currentMaterial, currentRegistry),
        CI_CONFIG_FORM_VALIDATION,
        onValidation,
    )
    const [args, setArgs] = useState<CIBuildArgType[]>([])
    const [buildEnvArgs, setBuildEnvArgs] = useState<CIBuildArgType[]>([])
    const [loadingDataState, setLoadingDataState] = useState<LoadingState>({
        loading: false,
        failed: false,
    })
    const [apiInProgress, setApiInProgress] = useState(false)
    const targetPlatformMap = getTargetPlatformMap()
    let _selectedPlatforms = []
    let _customTargetPlatform = false
    if (ciConfig?.ciBuildConfig?.dockerBuildConfig?.targetPlatform) {
        _selectedPlatforms = ciConfig.ciBuildConfig.dockerBuildConfig.targetPlatform.split(',').map((platformValue) => {
            _customTargetPlatform = _customTargetPlatform || !targetPlatformMap.get(platformValue)
            return { label: platformValue, value: platformValue }
        })
    }
    const [selectedTargetPlatforms, setSelectedTargetPlatforms] = useState<OptionType[]>(_selectedPlatforms)
    const [showCustomPlatformWarning, setShowCustomPlatformWarning] = useState<boolean>(_customTargetPlatform)
    const [showCustomPlatformConfirmation, setShowCustomPlatformConfirmation] = useState<boolean>(false)
    const [showConfigOverrideDiff, setShowConfigOverrideDiff] = useState<boolean>(false)
    const configOverridenPipelines = ciConfig?.ciPipelines?.filter(
        (_ci) => _ci.isDockerConfigOverridden && _ci?.pipelineType !== CIPipelineBuildType.CI_JOB,
    )
    const [currentCIBuildConfig, setCurrentCIBuildConfig] = useState<CIBuildConfigType>(
        initCurrentCIBuildConfig(
            allowOverride,
            ciConfig,
            selectedCIPipeline,
            selectedMaterial,
            selectedBuildContextGitMaterial,
            state.dockerfile.value,
            state.buildContext.value,
            state.useRootBuildContext.value,
        ),
    )

    useEffect(() => {
        initBuildArgs()
    }, [])

    useEffect(() => {
        updateParentCIBuildTypeState()
    }, [currentCIBuildConfig.ciBuildType])

    const initBuildArgs = () => {
        // Docker build arguments
        setArgs(processBuildArgs(ciConfig?.ciBuildConfig?.dockerBuildConfig?.args))

        // Buildpack - build env arguments
        setBuildEnvArgs(processBuildArgs(currentCIBuildConfig.buildPackConfig?.args))
    }

    const updateParentCIBuildTypeState = () => {
        if (configOverrideView && setParentState) {
            setParentState({
                ...parentState,
                currentCIBuildType: currentCIBuildConfig.ciBuildType,
            })
        }
    }

    async function onValidation(state) {
        const args2 = args.map(({ k, v, keyError, valueError }, idx) => {
            if (v && !k) {
                keyError = 'This field is required'
            } else if (k && !v) {
                valueError = 'This field is required'
            }
            const arg = { k, v, keyError, valueError }
            return arg
        })
        const areArgsWrong = args2.some((arg) => arg.keyError || arg.valueError)
        if (areArgsWrong) {
            setArgs([...args2])
            return
        }
        let targetPlatforms = ''
        const targetPlatformsSet = new Set()
        for (let index = 0; index < selectedTargetPlatforms.length; index++) {
            const element = selectedTargetPlatforms[index]
            if (!targetPlatformsSet.has(element.value)) {
                targetPlatformsSet.add(element.value)
                targetPlatforms += element.value + (index + 1 === selectedTargetPlatforms.length ? '' : ',')
            }
        }
        if (showCustomPlatformWarning) {
            setShowCustomPlatformConfirmation(!showCustomPlatformConfirmation)
            if (!showCustomPlatformConfirmation) {
                return
            }
        }

        const _ciBuildConfig = { ...currentCIBuildConfig }
        if (_ciBuildConfig.ciBuildType === CIBuildType.BUILDPACK_BUILD_TYPE && _ciBuildConfig.buildPackConfig) {
            _ciBuildConfig[DockerConfigOverrideKeys.buildPackConfig] = {
                builderId: _ciBuildConfig.buildPackConfig.builderId,
                language: _ciBuildConfig.buildPackConfig.language,
                languageVersion: _ciBuildConfig.buildPackConfig.languageVersion,
                projectPath: projectPath.value || './',
                args: buildEnvArgs.reduce((agg, { k, v }) => {
                    if (k && v) {
                        agg[k] = v
                    }
                    return agg
                }, {}),
            }
        } else {
            _ciBuildConfig[DockerConfigOverrideKeys.dockerBuildConfig] = {
                ..._ciBuildConfig.dockerBuildConfig,
                dockerfileRelativePath: dockerfile.value.replace(/^\//, ''),
                dockerfilePath: `${selectedMaterial?.checkoutPath}/${dockerfile.value}`.replace('//', '/'),
                args: args.reduce((agg, { k, v }) => {
                    if (k && v) {
                        agg[k] = v
                    }
                    return agg
                }, {}),
                dockerfileRepository: repository.value,
                targetPlatform: targetPlatforms,
                buildContext: buildContext.value,
            }
        }

        const requestBody = {
            id: ciConfig?.id ?? null,
            appId: +appId,
            dockerRegistry: registry.value || '',
            dockerRepository: repository_name.value?.replace(/\s/g, '') || '',
            beforeDockerBuild: [],
            ciBuildConfig: _ciBuildConfig,
            afterDockerBuild: [],
            appName: '',
            ...(ciConfig && ciConfig.version ? { version: ciConfig.version } : {}),
        }
        setApiInProgress(true)
        try {
            const saveOrUpdate = ciConfig && ciConfig.id ? updateCIConfig : saveCIConfig
            await saveOrUpdate(requestBody, isTemplateView)
            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: 'Successfully saved',
            })
            reload(false, !isCiPipeline)
        } catch (err) {
            showError(err)
        } finally {
            setApiInProgress(false)
        }
    }

    const handleCloseDialog = () => {
        setShowCustomPlatformConfirmation(false)
    }

    const renderConfirmationModal = () => (
        <ConfirmationModal
            variant={ConfirmationModalVariantType.warning}
            title="Please ensure you have set valid target platform for the build"
            subtitle={
                <div>
                    <span className="fs-14 cn-7 dc__block">Custom target platform(s):</span>
                    {selectedTargetPlatforms.map((targetPlatform) =>
                        targetPlatformMap.get(targetPlatform.value) ? null : (
                            <span key={targetPlatform.value} className="fs-13 cn-7 dc__block">{targetPlatform.value}</span>
                        ),
                    )}
                </div>
            }
            buttonConfig={{
                secondaryButtonConfig: {
                    text: 'Go back',
                    onClick: handleCloseDialog,
                },
                primaryButtonConfig: {
                    text: 'Confirm save',
                    onClick: onValidation,
                },
            }}
            handleClose={handleCloseDialog}
        >
            <span className="fs-13 cn-7 lh-1-54">
                The build will fail if the target platform is invalid or unsupported.
            </span>
        </ConfirmationModal>
    )

    const handleOnChangeConfig = (e) => {
        handleOnChange(e)

        if (updateDockerConfigOverride) {
            const { value } = e.target

            switch (e.target.name) {
                case DockerConfigOverrideKeys.repository_name:
                    updateDockerConfigOverride(DockerConfigOverrideKeys.dockerRepository, value)
                    break
                case DockerConfigOverrideKeys.projectPath:
                    updateDockerConfigOverride(DockerConfigOverrideKeys.projectPath, value)
                    break
                case DockerConfigOverrideKeys.dockerfile:
                    updateDockerConfigOverride(DockerConfigOverrideKeys.dockerfileRelativePath, value)
                    break
                case DockerConfigOverrideKeys.buildContext:
                    updateDockerConfigOverride(DockerConfigOverrideKeys.buildContext, value)
                    break
                default:
                    break
            }
        }
    }

    const toggleConfigOverrideDiffModal = () => {
        setShowConfigOverrideDiff(!showConfigOverrideDiff)
    }

    const { repository, dockerfile, projectPath, registry, repository_name, buildContext, key, value } = state
    return (
        <div className="flexbox-col h-100 dc__content-space dc__overflow-hidden">
            <div className="flex-grow-1 dc__overflow-auto">
                <div className={isCreateAppView ? '' : `form__app-compose ${configOverrideView ? 'config-override-view' : ''}`}>
                    {!isCreateAppView && !configOverrideView && (
                        <div className="flex dc__content-space mb-20">
                            <h2 className="form__title m-0-imp" data-testid="build-configuration-heading">
                                Build Configuration
                            </h2>
                            <a
                                className="flex right dc__link"
                                rel="noreferrer noopener"
                                target="_blank"
                                href={DOCUMENTATION.APP_CREATE_CI_CONFIG}
                            >
                                <BookOpenIcon className="icon-dim-16 mr-8" />
                                <span>View documentation</span>
                            </a>
                        </div>
                    )}
                    <CIContainerRegistryConfig
                        appId={appId}
                        configOverrideView={configOverrideView}
                        ciConfig={ciConfig}
                        allowOverride={allowOverride}
                        configOverridenPipelines={configOverridenPipelines}
                        toggleConfigOverrideDiffModal={toggleConfigOverrideDiffModal}
                        updateDockerConfigOverride={updateDockerConfigOverride}
                        dockerRegistries={dockerRegistries}
                        registry={registry}
                        repository_name={repository_name}
                        currentRegistry={currentRegistry}
                        handleOnChangeConfig={handleOnChangeConfig}
                        isCDPipeline={isCDPipeline}
                        isCreateAppView={isCreateAppView}
                    />
                    {!isCreateAppView && (
                        <CIDockerFileConfig
                            ciConfig={ciConfig}
                            sourceConfig={getParsedSourceConfig()}
                            configOverrideView={configOverrideView}
                            allowOverride={allowOverride}
                            selectedCIPipeline={selectedCIPipeline}
                            currentMaterial={getParsedCurrentMaterial()}
                            currentBuildContextGitMaterial={currentBuildContextGitMaterial}
                            selectedMaterial={selectedMaterial}
                            selectedBuildContextGitMaterial={selectedBuildContextGitMaterial}
                            setSelectedMaterial={setSelectedMaterial}
                            setSelectedBuildContextGitMaterial={setSelectedBuildContextGitMaterial}
                            formState={state}
                            updateDockerConfigOverride={updateDockerConfigOverride}
                            args={args}
                            setArgs={setArgs}
                            buildEnvArgs={buildEnvArgs}
                            setBuildEnvArgs={setBuildEnvArgs}
                            handleOnChangeConfig={handleOnChangeConfig}
                            selectedTargetPlatforms={selectedTargetPlatforms}
                            setSelectedTargetPlatforms={setSelectedTargetPlatforms}
                            targetPlatformMap={targetPlatformMap}
                            showCustomPlatformWarning={showCustomPlatformWarning}
                            setShowCustomPlatformWarning={setShowCustomPlatformWarning}
                            currentCIBuildConfig={currentCIBuildConfig}
                            setCurrentCIBuildConfig={setCurrentCIBuildConfig}
                            setLoadingState={configOverrideView ? setLoadingStateFromParent : setLoadingDataState}
                        />
                    )}
                </div>
            </div>
            {!isCreateAppView && (
                <>
                    {!configOverrideView && (
                        <div className="dc__no-shrink py-12 px-20 form__buttons bg__primary dc__border-top">
                            <Button
                                dataTestId="build_config_save_and_next_button"
                                onClick={handleOnSubmit}
                                disabled={
                                    apiInProgress ||
                                    (currentCIBuildConfig.ciBuildType !== CIBuildType.SELF_DOCKERFILE_BUILD_TYPE &&
                                        (loadingDataState.loading ||
                                            loadingDataState.failed ||
                                            loadingStateFromParent?.loading ||
                                            loadingStateFromParent?.failed))
                                }
                                text={!isCiPipeline ? 'Save & Next' : 'Save Configuration'}
                                endIcon={!isCiPipeline ? <NextIcon /> : null}
                            />
                        </div>
                    )}
                    {showCustomPlatformConfirmation && renderConfirmationModal()}
                    {/* Might cause bug in future since we are toggling the state but directly closes the modal on empty workflow */}
                    {/* TODO: Connect with product if empty state is better? */}
                    {configOverridenPipelines?.length > 0 && showConfigOverrideDiff && (
                        <CIConfigDiffView
                            parentReloading={parentReloading}
                            ciConfig={ciConfig}
                            configOverridenPipelines={configOverridenPipelines}
                            toggleConfigOverrideDiffModal={toggleConfigOverrideDiffModal}
                            reload={reload}
                            gitMaterials={sourceConfig.material}
                            isTemplateView={isTemplateView}
                        />
                    )}
                </>
            )}
        </div>
    )
}
