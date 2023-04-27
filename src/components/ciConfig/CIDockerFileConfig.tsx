import React, { Fragment, useEffect, useState } from 'react'
import ReactSelect from 'react-select'
import { ReactComponent as FileIcon } from '../../assets/icons/ic-file-text.svg'
import { ReactComponent as AddIcon } from '../../assets/icons/ic-add.svg'
import { ReactComponent as BuildpackIcon } from '../../assets/icons/ic-builpack.svg'
import { ReactComponent as CheckIcon } from '../../assets/icons/ic-check.svg'
import CIAdvancedConfig from './CIAdvancedConfig'
import {CI_BUILDTYPE_ALIAS, _multiSelectStyles, USING_ROOT} from './CIConfig.utils'
import { CIBuildType, DockerConfigOverrideKeys } from '../ciPipeline/types'
import CIBuildpackBuildOptions, {
    renderOptionIcon,
    repositoryControls,
    repositoryOption,
} from './CIBuildpackBuildOptions'
import { getBuildpackMetadata, getDockerfileTemplate } from './service'
import CICreateDockerfileOption from './CICreateDockerfileOption'
import { showError, ConditionalWrap } from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'
import { BuildersAndFrameworksType, CIDockerFileConfigProps } from './types'
import BuildContext from './BuildContext'

export default function CIDockerFileConfig({
    configOverrideView,
    ciConfig,
    sourceConfig,
    allowOverride,
    selectedCIPipeline,
    currentMaterial,
    selectedMaterial,
    setSelectedMaterial,
    formState,
    updateDockerConfigOverride,
    args,
    setArgs,
    buildEnvArgs,
    setBuildEnvArgs,
    handleOnChangeConfig,
    selectedTargetPlatforms,
    setSelectedTargetPlatforms,
    targetPlatformMap,
    showCustomPlatformWarning,
    setShowCustomPlatformWarning,
    currentCIBuildConfig,
    setCurrentCIBuildConfig,
    setInProgress,
}: CIDockerFileConfigProps) {
    const [ciBuildTypeOption, setCIBuildTypeOption] = useState<CIBuildType>(currentCIBuildConfig.ciBuildType)
    const [buildersAndFrameworks, setBuildersAndFrameworks] = useState<BuildersAndFrameworksType>({
        builders: [],
        frameworks: [],
        selectedBuilder: null,
        selectedLanguage: null,
        selectedVersion: null,
    })
    const isBuildpackType = ciBuildTypeOption === CIBuildType.BUILDPACK_BUILD_TYPE
    const CI_BUILD_TYPE_OPTIONS = [
        {
            id: CIBuildType.SELF_DOCKERFILE_BUILD_TYPE,
            heading: 'I have a Dockerfile',
            info: 'Requires a Dockerfile, gives full control of the build process.',
            icon: FileIcon,
            noIconFill: false,
            iconStroke: true,
            addDivider: true,
        },
        {
            id: CIBuildType.MANAGED_DOCKERFILE_BUILD_TYPE,
            heading: 'Create Dockerfile',
            info: 'Select from available templates and create a Dockerfile.',
            icon: AddIcon,
            noIconFill: false,
            iconStroke: false,
            addDivider: true,
        },
        {
            id: CIBuildType.BUILDPACK_BUILD_TYPE,
            heading: 'Build without Dockerfile',
            info: 'Uses buildpack to build container image.',
            icon: BuildpackIcon,
            noIconFill: true,
            iconStroke: false,
            addDivider: false,
        },
    ]
    // const [spanValue,setSpanValue] = useState<string>(" Set build context ")
    const [disable,setDisable] = useState<boolean>(formState.buildContext ? false : true)
    useEffect(() => {
        setInProgress(true)
        Promise.all([getDockerfileTemplate(), getBuildpackMetadata()])
            .then(([{ result: dockerfileTemplate }, { result: buildpackMetadata }]) => {
                setBuildersAndFrameworks({
                    ...buildersAndFrameworks,
                    builders: buildpackMetadata?.LanguageBuilder || [],
                    frameworks: dockerfileTemplate?.LanguageFrameworks || [],
                })
                setInProgress(false)
            })
            .catch((err) => {
                showError(err)
                setInProgress(false)
            })
    }, [])

    useEffect(() => {
        if (disable) {
            if (configOverrideView) {
                setCurrentCIBuildConfig({
                    ...currentCIBuildConfig,
                    dockerBuildConfig: {
                        ...currentCIBuildConfig.dockerBuildConfig,
                        buildContext: '.',
                    },
                })
            } else {
                formState.buildContext.value = '.'
            }
        }
    }, [disable])

    useEffect(() => {
        if (configOverrideView && updateDockerConfigOverride && currentCIBuildConfig) {
            updateDockerConfigOverride(DockerConfigOverrideKeys.ciBuildConfig, currentCIBuildConfig)
        }
    }, [currentCIBuildConfig])

    useEffect(() => {
        if (configOverrideView && isBuildpackType && buildEnvArgs && updateDockerConfigOverride) {
            updateDockerConfigOverride(DockerConfigOverrideKeys.buildPackConfig, {
                ...currentCIBuildConfig,
                buildPackConfig: {
                    ...currentCIBuildConfig.buildPackConfig,
                    args: buildEnvArgs.reduce((agg, { k, v }) => {
                        if (k && v) agg[k] = v
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

    const handleFileLocationChange = (selectedMaterial): void => {
        setSelectedMaterial(selectedMaterial)
        formState.repository.value = selectedMaterial.name
        setCurrentCIBuildConfig({
            ...currentCIBuildConfig,
            gitMaterialId: selectedMaterial.id,
        })
    }

    const handleCIBuildTypeOptionSelection = (id: CIBuildType) => {
        setCIBuildTypeOption(id)
        setCurrentCIBuildConfig({
            ...currentCIBuildConfig,
            ciBuildType: id,
        })
    }

    const canShowTick = (id: CIBuildType) => {
        if (configOverrideView && allowOverride && selectedCIPipeline?.dockerConfigOverride?.ciBuildConfig) {
            return selectedCIPipeline.dockerConfigOverride.ciBuildConfig.ciBuildType === id
        }

        return ciConfig?.ciBuildConfig?.ciBuildType === id
    }

    const renderCIBuildTypeOptions = () => {
        return (
            <div className="flex mb-16">
                {CI_BUILD_TYPE_OPTIONS.map((option) => {
                    const isCurrentlySelected = ciBuildTypeOption === option.id
                    const showTick = canShowTick(option.id)

                    return (
                        <Fragment key={option.id}>
                            <ConditionalWrap
                                condition={configOverrideView && allowOverride}
                                wrap={(children) => (
                                    <Tippy
                                        className="default-tt w-250"
                                        arrow={false}
                                        placement="top"
                                        content={option.info}
                                    >
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
                                        isCurrentlySelected ? 'bcb-1 eb-2' : 'bcn-0 en-2'
                                    }`}
                                    onClick={() => {
                                        handleCIBuildTypeOptionSelection(option.id)
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
                <div className="mb-4 form-row__docker">
                    <div className={`form__field ${configOverrideView ? 'mb-0-imp' : ''}`}>
                        <label className="form__label">{`${
                            configOverrideView && !allowOverride ? 'Repository' : 'Select repository'
                        } containing Dockerfile`}</label>
                        {configOverrideView && !allowOverride ? (
                            <div className="flex left">
                                {currentMaterial?.url && renderOptionIcon(currentMaterial.url)}
                                <span className="fs-14 fw-4 lh-20 cn-9">{currentMaterial?.name || 'Not selected'}</span>
                            </div>
                        ) : (
                            <ReactSelect
                                className="m-0"
                                tabIndex={3}
                                isMulti={false}
                                isClearable={false}
                                options={sourceConfig.material}
                                getOptionLabel={(option) => `${option.name}`}
                                getOptionValue={(option) => `${option.checkoutPath}`}
                                value={configOverrideView && !allowOverride ? currentMaterial : selectedMaterial}
                                styles={{
                                    ..._multiSelectStyles,
                                    menu: (base) => ({
                                        ...base,
                                        marginTop: '0',
                                    }),
                                }}
                                components={{
                                    IndicatorSeparator: null,
                                    Option: repositoryOption,
                                    Control: repositoryControls,
                                }}
                                onChange={handleFileLocationChange}
                                isDisabled={configOverrideView && !allowOverride}
                            />
                        )}
                        {formState.repository.error && (
                            <label className="form__error">{formState.repository.error}</label>
                        )}
                    </div>
                    <div className={`form__field ${configOverrideView ? 'mb-0-imp' : ''}`}>
                        <label htmlFor="" className="form__label dc__required-field">
                            Dockerfile Path (Relative)
                        </label>
                        {configOverrideView && !allowOverride ? (
                            <span className="fs-14 fw-4 lh-20 cn-9">
                                {`${selectedMaterial?.checkoutPath}/${
                                    ciConfig?.ciBuildConfig?.dockerBuildConfig?.dockerfileRelativePath || 'Dockerfile'
                                }`.replace('//', '/')}
                            </span>
                        ) : (
                            <div className="docker-file-container">
                                <Tippy
                                    className="default-tt"
                                    arrow={false}
                                    placement="top"
                                    content={selectedMaterial?.checkoutPath}
                                >
                                    <span className="checkout-path-container bcn-1 en-2 bw-1 dc__no-right-border dc__ellipsis-right">
                                        {selectedMaterial?.checkoutPath}
                                    </span>
                                </Tippy>
                                <input
                                    tabIndex={4}
                                    type="text"
                                    className="form__input file-name"
                                    placeholder="Dockerfile"
                                    name="dockerfile"
                                    value={
                                        configOverrideView && !allowOverride
                                            ? ciConfig?.ciBuildConfig?.dockerBuildConfig?.dockerfileRelativePath ||
                                              'Dockerfile'
                                            : formState.dockerfile.value
                                    }
                                    onChange={handleOnChangeConfig}
                                    autoComplete={'off'}
                                    autoFocus={!configOverrideView}
                                    disabled={configOverrideView && !allowOverride}
                                />
                            </div>
                        )}
                        {formState.dockerfile.error && (
                            <label className="form__error">{formState.dockerfile.error}</label>
                        )}
                    </div>
                </div>
                <div className="mb-4 w-100">
                    <BuildContext
                        disable={disable}
                        setDisable={setDisable}
                        formState={formState}
                        configOverrideView={configOverrideView}
                        allowOverride={allowOverride}
                        ciConfig={ciConfig}
                        handleOnChangeConfig={handleOnChangeConfig}
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="white-card white-card__docker-config dc__position-rel">
            <h3 className="fs-14 fw-6 lh-20 m-0 pb-12">
                {configOverrideView && !allowOverride
                    ? `Build the container image ${CI_BUILDTYPE_ALIAS[ciBuildTypeOption]}`
                    : 'How do you want to build the container image?'}
            </h3>
            {(!configOverrideView || allowOverride) && renderCIBuildTypeOptions()}
            {ciBuildTypeOption === CIBuildType.SELF_DOCKERFILE_BUILD_TYPE && renderSelfDockerfileBuildOption()}
            {ciBuildTypeOption === CIBuildType.MANAGED_DOCKERFILE_BUILD_TYPE && (
                <CICreateDockerfileOption
                    configOverrideView={configOverrideView}
                    allowOverride={allowOverride}
                    frameworks={buildersAndFrameworks.frameworks}
                    sourceConfig={sourceConfig}
                    currentMaterial={currentMaterial}
                    selectedMaterial={selectedMaterial}
                    handleFileLocationChange={handleFileLocationChange}
                    repository={formState.repository}
                    currentCIBuildConfig={currentCIBuildConfig}
                    setCurrentCIBuildConfig={setCurrentCIBuildConfig}
                    setInProgress={setInProgress}
                    ciConfig={ciConfig}
                    formState={formState}
                    handleOnChangeConfig={handleOnChangeConfig}
                />
            )}
            {ciBuildTypeOption === CIBuildType.BUILDPACK_BUILD_TYPE && (
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
                    allowOverride={allowOverride}
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
                />
            )}
            {(!configOverrideView || isBuildpackType) && <hr className="mt-16 mb-16" />}
            <CIAdvancedConfig
                configOverrideView={configOverrideView}
                allowOverride={allowOverride}
                args={isBuildpackType ? buildEnvArgs : args}
                setArgs={isBuildpackType ? setBuildEnvArgs : setArgs}
                isBuildpackType={isBuildpackType}
                selectedTargetPlatforms={selectedTargetPlatforms}
                setSelectedTargetPlatforms={setSelectedTargetPlatforms}
                targetPlatformMap={targetPlatformMap}
                showCustomPlatformWarning={showCustomPlatformWarning}
                setShowCustomPlatformWarning={setShowCustomPlatformWarning}
            />
        </div>
    )
}
