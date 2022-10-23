import React, { Fragment, useEffect, useState } from 'react'
import ReactSelect from 'react-select'
import { ReactComponent as FileIcon } from '../../assets/icons/ic-file-text.svg'
import { ReactComponent as AddIcon } from '../../assets/icons/ic-add.svg'
import { ReactComponent as ProhibitIcon } from '../../assets/icons/ic-prohibit.svg'
import { ReactComponent as CheckIcon } from '../../assets/icons/ic-check.svg'
import CIAdvancedConfig from './CIAdvancedConfig'
import { _multiSelectStyles } from './CIConfig.utils'
import { CIBuildType } from '../ciPipeline/types'
import CIBuildpackBuildOptions, { repositoryControls, repositoryOption } from './CIBuildpackBuildOptions'
import { getBuildpackMetadata, getDockerfileTemplate } from './service'
import CICreateDockerfileOption from './CICreateDockerfileOption'
import { showError } from '../common'
import Tippy from '@tippyjs/react'
import { OptionType } from '../app/types'
import { BuilderIdOptionType, BuildersAndFrameworksType, VersionsOptionType } from './types'

export default function CIDockerFileConfig({
    configOverrideView,
    ciConfig,
    sourceConfig,
    allowOverride,
    selectedCIPipeline,
    _selectedMaterial,
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
}) {
    const [ciBuildTypeOption, setCIBuildTypeOption] = useState<CIBuildType>(currentCIBuildConfig.ciBuildType)
    const [buildersAndFrameworks, setBuildersAndFrameworks] = useState<BuildersAndFrameworksType>({
        builders: [],
        frameworks: [],
        selectedBuilder: null,
        selectedLanguage: null,
        selectedVersion: null,
    })
    const isBuildpackType = currentCIBuildConfig.ciBuildType === CIBuildType.BUILDPACK_BUILD_TYPE
    const CI_BUILD_TYPE_OPTIONS = [
        {
            id: CIBuildType.SELF_DOCKERFILE_BUILD_TYPE,
            heading: 'I have a Dockerfile',
            info: 'Requires a Dockerfile, gives full control of the build process.',
            icon: FileIcon,
            iconStroke: true,
            addDivider: true,
        },
        {
            id: CIBuildType.MANAGED_DOCKERFILE_BUILD_TYPE,
            heading: 'Create Dockerfile',
            info: 'Select from available templates and create a Dockerfile.',
            icon: AddIcon,
            iconStroke: false,
            addDivider: true,
        },
        {
            id: CIBuildType.BUILDPACK_BUILD_TYPE,
            heading: 'Build without Dockerfile',
            info: 'Uses buildpack to build container image.',
            icon: ProhibitIcon,
            iconStroke: false,
            addDivider: false,
        },
    ]

    useEffect(() => {
        Promise.all([getDockerfileTemplate(), getBuildpackMetadata()])
            .then(([{ result: dockerfileTemplate }, { result: buildpackMetadata }]) => {
                setBuildersAndFrameworks({
                    ...buildersAndFrameworks,
                    builders: buildpackMetadata?.LanguageBuilder || [],
                    frameworks: dockerfileTemplate?.LanguageFrameworks || [],
                })
            })
            .catch((err) => {
                showError(err)
            })
    }, [])

    useEffect(() => {
        if (configOverrideView && updateDockerConfigOverride && currentCIBuildConfig) {
            updateDockerConfigOverride('ciBuildConfig', currentCIBuildConfig)
        }
    }, [currentCIBuildConfig])

    useEffect(() => {
        if (configOverrideView && isBuildpackType && buildEnvArgs && updateDockerConfigOverride) {
            updateDockerConfigOverride('buildPackConfig', {
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

    const handleFileLocationChange = (selectedMaterial): void => {
        setSelectedMaterial(selectedMaterial)
        formState.repository.value = selectedMaterial.name

        if (updateDockerConfigOverride) {
            updateDockerConfigOverride('gitMaterialId', {
                ...currentCIBuildConfig,
                gitMaterialId: selectedMaterial.id,
            })
        }
    }

    const handleCIBuildTypeOptionSelection = (id: CIBuildType) => {
        setCIBuildTypeOption(id)
        setCurrentCIBuildConfig({
            ...currentCIBuildConfig,
            ciBuildType: id,
        })

        if (updateDockerConfigOverride) {
            updateDockerConfigOverride('ciBuildType', {
                ...currentCIBuildConfig,
                ciBuildType: id,
            })
        }
    }

    const renderCIBuildTypeOptions = () => {
        return (
            <div className="flex mb-16">
                {CI_BUILD_TYPE_OPTIONS.map((option) => {
                    const isCurrentlySelected = ciBuildTypeOption === option.id
                    const isGlobalSelection =
                        (!configOverrideView && ciConfig?.ciBuildConfig?.ciBuildType === option.id) ||
                        (configOverrideView &&
                            allowOverride &&
                            selectedCIPipeline?.dockerConfigOverride?.ciBuildConfig?.ciBuildType === option.id)

                    return (
                        <Fragment key={option.id}>
                            <div
                                id={option.id}
                                className={`flex top left ${
                                    configOverrideView ? 'w-212 h-40' : 'w-298 h-80'
                                } dc__position-rel pt-10 pb-10 pl-12 pr-12 br-4 cursor bw-1 ${
                                    isCurrentlySelected ? 'bcb-1 eb-2' : 'bcn-0 en-2'
                                }`}
                                onClick={() => {
                                    handleCIBuildTypeOptionSelection(option.id)
                                }}
                            >
                                {isGlobalSelection && (
                                    <div className="build-type-selection flex icon-dim-16 bcb-5 dc__position-abs">
                                        <CheckIcon className="icon-dim-10 scn-0" />
                                    </div>
                                )}
                                <div>
                                    <option.icon
                                        className={`icon-dim-20 ${option.iconStroke ? 'sc' : 'fc'}${
                                            isCurrentlySelected ? 'n-6' : 'b-5'
                                        }`}
                                    />
                                </div>
                                <div className="ml-10">
                                    <span className={`fs-13 fw-6 lh-20 ${isCurrentlySelected ? 'cn-9' : 'cb-5'}`}>
                                        {option.heading}
                                    </span>
                                    {!configOverrideView && <p className="fs-13 fw-4 lh-20 cn-7 m-0">{option.info}</p>}
                                </div>
                            </div>
                            {option.addDivider && <div className="h-48 dc__border-right-n1 mr-8 ml-8" />}
                        </Fragment>
                    )
                })}
            </div>
        )
    }

    const renderSelfDockerfileBuildOption = () => {
        return (
            <div className="mb-4 form-row__docker">
                <div className="form__field">
                    <label className="form__label">Select repository containing Dockerfile</label>
                    <ReactSelect
                        className="m-0"
                        tabIndex={3}
                        isMulti={false}
                        isClearable={false}
                        options={sourceConfig.material}
                        getOptionLabel={(option) => `${option.name}`}
                        getOptionValue={(option) => `${option.checkoutPath}`}
                        value={configOverrideView && !allowOverride ? _selectedMaterial : selectedMaterial}
                        styles={_multiSelectStyles}
                        components={{
                            IndicatorSeparator: null,
                            Option: repositoryOption,
                            Control: repositoryControls,
                        }}
                        onChange={handleFileLocationChange}
                        isDisabled={configOverrideView && !allowOverride}
                    />
                    {formState.repository.error && <label className="form__error">{formState.repository.error}</label>}
                </div>
                <div className="form__field">
                    <label htmlFor="" className="form__label">
                        Docker file path (relative)*
                    </label>
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
                                    ? ciConfig?.ciBuildConfig?.dockerBuildConfig?.dockerfileRelativePath || 'Dockerfile'
                                    : formState.dockerfile.value
                            }
                            onChange={handleOnChangeConfig}
                            autoComplete={'off'}
                            disabled={configOverrideView && !allowOverride}
                        />
                    </div>
                    {formState.dockerfile.error && <label className="form__error">{formState.dockerfile.error}</label>}
                </div>
            </div>
        )
    }

    return (
        <div className="white-card white-card__docker-config dc__position-rel">
            <h3 className="fs-14 fw-6 lh-20 m-0 pb-12">How do you want to build the container image?</h3>
            {renderCIBuildTypeOptions()}
            {ciBuildTypeOption === CIBuildType.SELF_DOCKERFILE_BUILD_TYPE && renderSelfDockerfileBuildOption()}
            {ciBuildTypeOption === CIBuildType.MANAGED_DOCKERFILE_BUILD_TYPE && (
                <CICreateDockerfileOption
                    configOverrideView={configOverrideView}
                    allowOverride={allowOverride}
                    frameworks={buildersAndFrameworks.frameworks}
                    currentCIBuildConfig={currentCIBuildConfig}
                    setCurrentCIBuildConfig={setCurrentCIBuildConfig}
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
                    _selectedMaterial={_selectedMaterial}
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
