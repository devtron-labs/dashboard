import React, { Fragment, useEffect, useState } from 'react'
import ReactSelect from 'react-select'
import { ReactComponent as FileIcon } from '../../assets/icons/ic-file-text.svg'
import { ReactComponent as AddIcon } from '../../assets/icons/ic-add.svg'
import { ReactComponent as BuildpackIcon } from '../../assets/icons/ic-builpack.svg'
import { ReactComponent as CheckIcon } from '../../assets/icons/ic-check.svg'
import { ReactComponent as Dropdown } from '../../assets/icons/ic-chevron-down.svg'
import CIAdvancedConfig from './CIAdvancedConfig'
import { CI_BUILDTYPE_ALIAS, _multiSelectStyles } from './CIConfig.utils'
import { CIBuildType, DockerConfigOverrideKeys } from '../ciPipeline/types'
import CIBuildpackBuildOptions, {
    checkoutPathOption,
    renderOptionIcon,
    repositoryControls,
    repositoryOption,
} from './CIBuildpackBuildOptions'
import { getBuildpackMetadata, getDockerfileTemplate } from './service'
import CICreateDockerfileOption from './CICreateDockerfileOption'
import { showError, ConditionalWrap, TippyCustomized, TippyTheme, OptionType } from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'
import { BuildersAndFrameworksType, CIDockerFileConfigProps } from './types'
import { ReactComponent as QuestionFilled } from '../../assets/icons/ic-help.svg'
import { ReactComponent as Question } from '../../assets/icons/ic-help-outline.svg'
import { RootBuildContext } from './ciConfigConstant'

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
    const isDefaultBuildContext = (): boolean => {
        if(window._env_.ENABLE_BUILD_CONTEXT) {
            let currentOverriddenGitMaterialId = 0, currentOverriddenBuildContextGitMaterialId = 0;
            let currentOverriddenBuildContext = ciConfig?.ciPipelines?.[0]?.dockerConfigOverride?.ciBuildConfig?.dockerBuildConfig?.buildContext
            currentOverriddenGitMaterialId = ciConfig?.ciPipelines?.[0]?.dockerConfigOverride?.ciBuildConfig?.gitMaterialId
            currentOverriddenBuildContextGitMaterialId = ciConfig?.ciPipelines?.[0]?.dockerConfigOverride?.ciBuildConfig?.buildContextGitMaterialId
            return (configOverrideView && allowOverride) ?
                (currentOverriddenGitMaterialId === currentOverriddenBuildContextGitMaterialId) && (!currentOverriddenBuildContext || (currentOverriddenBuildContext === ''))
                : ((currentMaterial.id === currentBuildContextGitMaterial.id) && (!(ciConfig?.ciBuildConfig?.dockerBuildConfig?.buildContext) || ciConfig?.ciBuildConfig?.dockerBuildConfig?.buildContext === ''))
        }
        return false
    }

    const [isCollapsed, setIsCollapsed] = useState<boolean>(!isDefaultBuildContext())
    const buildContextCheckoutPath = selectedBuildContextGitMaterial
        ? selectedBuildContextGitMaterial.checkoutPath
        : currentMaterial?.checkoutPath
    let checkoutPathArray = [{ label: RootBuildContext, value: RootBuildContext }]
    if (buildContextCheckoutPath !== RootBuildContext) {
        checkoutPathArray.push({ label: buildContextCheckoutPath, value: buildContextCheckoutPath })
    }
    const [checkoutPathOptions, setCheckoutPathOptions] = useState<OptionType[]>(checkoutPathArray)

    useEffect(() => {
        let checkoutPathArray = [{ label: RootBuildContext, value: RootBuildContext }]
        if (selectedBuildContextGitMaterial?.checkoutPath !== RootBuildContext) {
            checkoutPathArray.push({
                label: selectedBuildContextGitMaterial?.checkoutPath,
                value: selectedBuildContextGitMaterial?.checkoutPath,
            })
        }
        setCheckoutPathOptions(checkoutPathArray)
    }, [selectedBuildContextGitMaterial])

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

    const handleBuildContextPathChange = (selectedBuildContextGitMaterial): void => {
        setSelectedBuildContextGitMaterial(selectedBuildContextGitMaterial)
        formState.repository.value = selectedBuildContextGitMaterial.name
        setCurrentCIBuildConfig({
            ...currentCIBuildConfig,
            buildContextGitMaterialId: selectedBuildContextGitMaterial.id,
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

    const getBuildContextAdditionalContent = () => {
        return (
            <div className="p-12 fs-13">
                {
                    'To build all files from the root, use (.) as the build context, or set build context by referring a subdirectory path such as '
                }
                <span className="bcn-1 pt-2 pb-2 br-6 pl-4 pr-4 dc__ff-monospace fs-13 fw-4 cn-7">{'/myfolder'}</span>
                {' or '}
                <span className="bcn-1 pt-2 pb-2 br-6 pl-4 pr-4 dc__ff-monospace fs-13 fw-4 cn-7">
                    {'/myfolder/buildhere'}
                </span>
                {'  if path not set, default path will be root dir of selected git repository'}
            </div>
        )
    }
    const useRootBuildContextFlagFormState = currentCIBuildConfig?.useRootBuildContext
    const [useRootBuildContextFlag, setUseRootBuildContextFlag] = useState<boolean>(useRootBuildContextFlagFormState)

    const handleBuildContextCheckoutPathChange = (checkoutPath) => {
        const val = checkoutPath.value
        let flag = false
        if (val === RootBuildContext) {
            flag = true
        }
        setUseRootBuildContextFlag(flag)
        formState.useRootBuildContext.value = flag
        setCurrentCIBuildConfig({
            ...currentCIBuildConfig,
            useRootBuildContext: flag,
        })
    }
    const toggleCollapse = (e) => {
        setIsCollapsed(!isCollapsed)
    }

    const getSelectedBuildContextGitMaterial = ():any => {
        return selectedBuildContextGitMaterial ? selectedBuildContextGitMaterial : currentMaterial
    }
    const getCheckoutPathValue = (
        selectedMaterial: any,
        currentMaterial: any,
        useRootBuildContextFlag: boolean,
    ): OptionType => {
        const path = configOverrideView && !allowOverride
            ? currentBuildContextGitMaterial?.checkoutPath
            : getSelectedBuildContextGitMaterial()?.checkoutPath
        const val = useRootBuildContextFlag
            ? RootBuildContext
            : path

        return { label: val, value: val }
    }

    const renderInfoCard = (): JSX.Element => {
        return (
            <TippyCustomized
                theme={TippyTheme.white}
                className="w-300 h-100 fcv-5"
                placement="right"
                Icon={QuestionFilled}
                heading="Docker build context"
                infoText="Specify the set of files to be built by referring to a specific subdirectory, relative to the root of your repository."
                showCloseButton={true}
                trigger="click"
                interactive={true}
                documentationLinkText="View Documentation"
                additionalContent={getBuildContextAdditionalContent()}
            >
                <div className="icon-dim-16 fcn-5 ml-8 cursor">
                    <Question />
                </div>
            </TippyCustomized>
        )
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
                <div className={`${configOverrideView ? 'mb-12' : ''}  form-row__docker`}>
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
                                classNamePrefix="build-config__select-repository-containing-dockerfile"
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
                                        paddingBottom: '4px',
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
                                    data-testid="dockerfile-path-text-box"
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

                {window._env_.ENABLE_BUILD_CONTEXT && (!configOverrideView || allowOverride) && (
                    <div className="flex left row ml-0 build-context-label fs-13 mb-6">
                        <span className="flex pointer" onClick={toggleCollapse}>
                            <Dropdown
                                className="icon-dim-26 rotate "
                                data-testid="set-build-context-button"
                                style={{ ['--rotateBy' as any]: isCollapsed ? '360deg' : '270deg' }}
                            />
                            Set Build context
                        </span>
                        {!configOverrideView || allowOverride ? (
                            <div className="flex row ml-0">{renderInfoCard()}</div>
                        ) : null}
                    </div>
                )}

                {window._env_.ENABLE_BUILD_CONTEXT && (!configOverrideView || allowOverride ? isCollapsed : true) && (
                    <div className={`form-row__docker ${!configOverrideView || allowOverride ? 'ml-24' : ''}`}>
                        <div className={`form__field ${configOverrideView ? 'mb-0-imp' : ''}`}>
                            <label className="form__label">{`${
                                configOverrideView && !allowOverride ? 'Repository' : 'Select repo'
                            }  containing build context`}</label>
                            {configOverrideView && !allowOverride ? (
                                <div className="flex left">
                                    {currentBuildContextGitMaterial?.url &&
                                        renderOptionIcon(currentBuildContextGitMaterial.url)}
                                    <span className="fs-14 fw-4 lh-20 cn-9">
                                        {currentBuildContextGitMaterial?.name || 'Not selected'}
                                    </span>
                                </div>
                            ) : (
                                <ReactSelect
                                    className="m-0"
                                    classNamePrefix="build-config__select-repository-containing-build-context"
                                    tabIndex={3}
                                    isMulti={false}
                                    isClearable={false}
                                    options={sourceConfig.material}
                                    getOptionLabel={(option) => `${option.name}`}
                                    getOptionValue={(option) => `${option.checkoutPath}`}
                                    value={
                                        configOverrideView && !allowOverride
                                            ? currentBuildContextGitMaterial
                                            : getSelectedBuildContextGitMaterial()
                                    }
                                    styles={{
                                        ..._multiSelectStyles,
                                        menu: (base) => ({
                                            ...base,
                                            marginTop: '0',
                                            paddingBottom: '4px',
                                        }),
                                    }}
                                    components={{
                                        IndicatorSeparator: null,
                                        Option: repositoryOption,
                                        Control: repositoryControls,
                                    }}
                                    onChange={handleBuildContextPathChange}
                                    isDisabled={configOverrideView && !allowOverride}
                                />
                            )}
                            {formState.repository.error && (
                                <label className="form__error">{formState.repository.error}</label>
                            )}
                        </div>
                        <div className={`form__field ${configOverrideView ? 'mb-0-imp' : ''}`}>
                            <label htmlFor="" className="form__label">
                                Build Context (Relative)
                            </label>
                            {configOverrideView && !allowOverride ? (
                                <span className="fs-14 fw-4 lh-20 cn-9">
                                    {`${
                                        ciConfig?.ciBuildConfig?.useRootBuildContext
                                            ? RootBuildContext
                                            : selectedBuildContextGitMaterial?.checkoutPath
                                    }/${ciConfig?.ciBuildConfig?.dockerBuildConfig?.buildContext || ''}`.replace(
                                        '//',
                                        '/',
                                    )}
                                </span>
                            ) : (
                                <div className="docker-file-container">
                                    <ReactSelect
                                        className="m-0 br-0"
                                        classNamePrefix="build-config__select-checkout-path-for-build-context"
                                        tabIndex={4}
                                        isMulti={false}
                                        isClearable={false}
                                        isSearchable={false}
                                        options={checkoutPathOptions}
                                        getOptionLabel={(option) => `${option.label}`}
                                        getOptionValue={(option) => `${option.value}`}
                                        value={getCheckoutPathValue(
                                            selectedMaterial,
                                            currentMaterial,
                                            useRootBuildContextFlag,
                                        )}
                                        styles={{
                                            ..._multiSelectStyles,
                                            menu: (base) => ({
                                                ...base,
                                                marginTop: '0',
                                                paddingBottom: '4px',
                                                width:
                                                    checkoutPathOptions?.length === 2 &&
                                                    checkoutPathOptions[1].value.length > 3
                                                        ? '120px'
                                                        : '100%',
                                            }),
                                            control: (base) => ({
                                                ...base,
                                                borderTopRightRadius: '0px',
                                                borderBottomRightRadius: '0px',
                                                borderRight: '0px',
                                            }),
                                            dropdownIndicator: (base) => ({
                                                ...base,
                                                paddingLeft: '0px',
                                            }),
                                        }}
                                        components={{
                                            IndicatorSeparator: null,
                                            Option: checkoutPathOption,
                                        }}
                                        onChange={handleBuildContextCheckoutPathChange}
                                        isDisabled={configOverrideView && !allowOverride}
                                    />
                                    <input
                                        tabIndex={4}
                                        type="text"
                                        className="form__input file-name"
                                        data-testid="build-context-path-text-box"
                                        placeholder="Project Path"
                                        name="buildContext"
                                        value={
                                            configOverrideView && !allowOverride
                                                ? ciConfig?.ciBuildConfig?.dockerBuildConfig?.buildContext || ''
                                                : formState.buildContext.value
                                        }
                                        onChange={handleOnChangeConfig}
                                        autoComplete="off"
                                        autoFocus={!configOverrideView}
                                        disabled={configOverrideView && !allowOverride}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}
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
                    currentBuildContextGitMaterial={currentBuildContextGitMaterial}
                    selectedMaterial={selectedMaterial}
                    handleFileLocationChange={handleFileLocationChange}
                    handleBuildContextPathChange={handleBuildContextPathChange}
                    repository={formState.repository}
                    currentCIBuildConfig={currentCIBuildConfig}
                    setCurrentCIBuildConfig={setCurrentCIBuildConfig}
                    setInProgress={setInProgress}
                    selectedBuildContextGitMaterial={selectedBuildContextGitMaterial}
                    ciConfig={ciConfig}
                    formState={formState}
                    handleOnChangeConfig={handleOnChangeConfig}
                    renderInfoCard={renderInfoCard}
                    isDefaultBuildContext={isDefaultBuildContext}
                    handleBuildContextCheckoutPathChange={handleBuildContextCheckoutPathChange}
                    getCheckoutPathValue={getCheckoutPathValue}
                    useRootBuildContextFlag={useRootBuildContextFlag}
                    checkoutPathOptions={checkoutPathOptions}
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
