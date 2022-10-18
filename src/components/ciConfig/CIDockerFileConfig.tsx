import React, { Fragment, useState } from 'react'
import ReactSelect from 'react-select'
import { ReactComponent as FileIcon } from '../../assets/icons/ic-file-text.svg'
import { ReactComponent as AddIcon } from '../../assets/icons/ic-add.svg'
import { ReactComponent as ProhibitIcon } from '../../assets/icons/ic-prohibit.svg'
import { ReactComponent as CheckIcon } from '../../assets/icons/ic-check.svg'
import CIAdvancedConfig from './CIAdvancedConfig'
import { _multiSelectStyles } from './CIConfig.utils'
import { CIBuildType } from '../ciPipeline/types'
import CIBuildpackBuildOptions, { repositoryControls, repositoryOption } from './CIBuildpackBuildOptions'

export default function CIDockerFileConfig({
    configOverrideView,
    ciConfig,
    sourceConfig,
    allowOverride,
    _selectedMaterial,
    selectedMaterial,
    setSelectedMaterial,
    repository,
    dockerfile,
    updateDockerConfigOverride,
    args,
    setArgs,
    handleOnChangeConfig,
    selectedTargetPlatforms,
    setSelectedTargetPlatforms,
    targetPlatformMap,
    showCustomPlatformWarning,
    setShowCustomPlatformWarning,
}) {
    const [ciBuildTypeOption, setCIBuildTypeOption] = useState<CIBuildType>(CIBuildType.SELF_DOCKERFILE_BUILD_TYPE)
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

    const handleFileLocationChange = (selectedMaterial): void => {
        setSelectedMaterial(selectedMaterial)
        repository.value = selectedMaterial.name

        if (updateDockerConfigOverride) {
            updateDockerConfigOverride('dockerConfigOverride.ciBuildConfig.gitMaterialId', selectedMaterial.id)
        }
    }

    const renderCIBuildTypeOptions = () => {
        return (
            <div className="flex mb-16">
                {CI_BUILD_TYPE_OPTIONS.map((option) => {
                    const isCurrentlySelected = ciBuildTypeOption === option.id
                    const isGlobalSelection = ciConfig?.ciBuildConfig?.ciBuildType === option.id

                    return (
                        <Fragment key={option.id}>
                            <div
                                id={option.id}
                                className={`flex top w-298 h-80 dc__position-rel pt-10 pb-10 pl-12 pr-12 br-4 cursor bw-1 ${
                                    isCurrentlySelected ? 'bcb-1 eb-2' : 'bcn-0 en-2'
                                }`}
                                onClick={() => {
                                    setCIBuildTypeOption(option.id)
                                }}
                            >
                                {isGlobalSelection && (
                                    <div
                                        className="flex icon-dim-16 bcb-5 stroke-width-4 dc__position-abs"
                                        style={{
                                            top: 0,
                                            right: 0,
                                            borderBottomLeftRadius: '4px',
                                            borderTopRightRadius: '3px',
                                        }}
                                    >
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
                                    <p className="fs-13 fw-4 lh-20 cn-7 m-0">{option.info}</p>
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
                        onChange={(selected) => {
                            handleFileLocationChange(selected)
                        }}
                        isDisabled={configOverrideView && !allowOverride}
                    />
                    {repository.error && <label className="form__error">{repository.error}</label>}
                </div>
                <div className="form__field">
                    <label htmlFor="" className="form__label">
                        Docker file path (relative)*
                    </label>
                    <div className="docker-flie-container">
                        <input
                            tabIndex={4}
                            type="text"
                            className="form__input file-name"
                            placeholder="Dockerfile"
                            name="dockerfile"
                            value={
                                configOverrideView && !allowOverride
                                    ? ciConfig?.ciBuildConfig?.dockerBuildConfig?.dockerfileRelativePath || 'Dockerfile'
                                    : dockerfile.value
                            }
                            onChange={handleOnChangeConfig}
                            autoComplete={'off'}
                            disabled={configOverrideView && !allowOverride}
                        />
                    </div>
                    {dockerfile.error && <label className="form__error">{dockerfile.error}</label>}
                </div>
            </div>
        )
    }

    const renderManagedDockerfileBuildOption = () => {
        return <div></div>
    }

    return (
        <div className="white-card white-card__docker-config dc__position-rel">
            <h3 className="fs-14 fw-6 lh-20 m-0 pb-12">How do you want to build the container image?</h3>
            {renderCIBuildTypeOptions()}
            {ciBuildTypeOption === CIBuildType.SELF_DOCKERFILE_BUILD_TYPE && renderSelfDockerfileBuildOption()}
            {ciBuildTypeOption === CIBuildType.MANAGED_DOCKERFILE_BUILD_TYPE && renderManagedDockerfileBuildOption()}
            {ciBuildTypeOption === CIBuildType.BUILDPACK_BUILD_TYPE && (
                <CIBuildpackBuildOptions
                    sourceConfig={sourceConfig}
                    configOverrideView={configOverrideView}
                    allowOverride={allowOverride}
                    _selectedMaterial={_selectedMaterial}
                    selectedMaterial={selectedMaterial}
                    handleFileLocationChange={handleFileLocationChange}
                    repository={repository}
                />
            )}
            {!configOverrideView && (
                <>
                    <hr className="mt-0 mb-20" />
                    <CIAdvancedConfig
                        args={args}
                        setArgs={setArgs}
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
