import React, { useEffect, useState } from 'react'
import ReactSelect, { components } from 'react-select'
import CreatableSelect from 'react-select/creatable'
import {
    DropdownIndicator,
    getCommonSelectStyle,
    getCustomOptionSelectionStyle,
    Option,
    OptionWithIcon,
    ValueContainerWithIcon,
} from '../v2/common/ReactSelect.utils'
import { ReactComponent as GitLab } from '../../assets/icons/git/gitlab.svg'
import { ReactComponent as Git } from '../../assets/icons/git/git.svg'
import { ReactComponent as GitHub } from '../../assets/icons/git/github.svg'
import { ReactComponent as BitBucket } from '../../assets/icons/git/bitbucket.svg'
import { ReactComponent as QuestionIcon } from '../v2/assets/icons/ic-question.svg'
import { ReactComponent as HelpIcon } from '../../assets/icons/ic-help.svg'
import { getAbsoluteProjectPath, _multiSelectStyles } from './CIConfig.utils'
import { OptionType } from '../app/types'
import { CIBuildType, DockerConfigOverrideKeys } from '../ciPipeline/types'
import {
    BuilderIdOptionType,
    CIBuildpackBuildOptionsProps,
    InitLanguageOptionType,
    LanguageBuilderOptionType,
    LanguageOptionType,
    VersionsOptionType,
} from './types'
import { TippyCustomized, TippyTheme } from '@devtron-labs/devtron-fe-common-lib'
import { DOCUMENTATION } from '../../config'
import {
    AUTO_DETECT,
    BUILDER_SELECT_STYLES,
    CI_BUILDPACK_OPTION_TEXTS,
    LANGUAGE_SELECT_STYLES,
    USE_CUSTOM_BUILDER,
    VERSION_DETECT_OPTION,
    VERSION_SELECT_STYLES,
} from './ciConfigConstant'

export const renderOptionIcon = (option: string) => {
    if (!option) return null

    const isGitLab = option.includes('gitlab')
    const isGitHub = option.includes('github')
    const isBitBucket = option.includes('bitbucket')
    return isGitLab || isGitHub || isBitBucket ? (
        <>
            {isGitLab && <GitLab className="mr-8 dc__vertical-align-middle icon-dim-20" />}
            {isGitHub && <GitHub className="mr-8 dc__vertical-align-middle icon-dim-20" />}
            {isBitBucket && <BitBucket className="mr-8 dc__vertical-align-middle icon-dim-20" />}
        </>
    ) : (
        <Git className="mr-8 dc__vertical-align-middle icon-dim-20" />
    )
}

export const repositoryOption = (props): JSX.Element => {
    props.selectProps.styles.option = getCustomOptionSelectionStyle()
    return (
        <components.Option {...props}>
            {props.data.url && renderOptionIcon(props.data.url)}
            {props.label}
        </components.Option>
    )
}
export const releaseTagOption = (props) : JSX.Element => {
    props.selectProps.styles.option = getCustomOptionSelectionStyle()
    return (
        <components.Option {...props}>
            <Git className="mr-8 dc__vertical-align-middle icon-dim-20" />
            {props.value}
        </components.Option>
    )
}

export const checkoutPathOption = (props) : JSX.Element => {
    props.selectProps.styles.option = getCustomOptionSelectionStyle()
    return (
        <components.Option {...props}>
            {props.value}
        </components.Option>
    )
}
export const repositoryControls = (props): JSX.Element => {
    let value = ''
    if (props.hasValue) {
        value = props.getValue()[0].url
    }
    let showGit = value && !value.includes('github') && !value.includes('gitlab') && !value.includes('bitbucket')
    return (
        <components.Control {...props}>
            {value.includes('github') && <GitHub className="icon-dim-20 ml-10" />}
            {value.includes('gitlab') && <GitLab className="icon-dim-20 ml-10" />}
            {value.includes('bitbucket') && <BitBucket className="icon-dim-20 ml-10" />}
            {showGit && <Git className="icon-dim-20 ml-10" />}
            {props.children}
        </components.Control>
    )
}

const menuListComponent = (props): JSX.Element => {
    return (
        <components.MenuList {...props}>
            <div className="fw-4 lh-20 pl-8 pr-8 pt-6 pb-6 cn-7 fs-13 dc__italic-font-style">{USE_CUSTOM_BUILDER}</div>
            {props.children}
        </components.MenuList>
    )
}

export default function CIBuildpackBuildOptions({
    ciBuildConfig,
    sourceConfig,
    buildersAndFrameworks,
    setBuildersAndFrameworks,
    configOverrideView,
    allowOverride,
    currentMaterial,
    selectedMaterial,
    handleFileLocationChange,
    repository,
    projectPath,
    handleOnChangeConfig,
    currentCIBuildConfig,
    setCurrentCIBuildConfig,
    buildEnvArgs,
    setBuildEnvArgs,
}: CIBuildpackBuildOptionsProps) {
    const [supportedLanguagesList, setSupportedLanguagesList] = useState<LanguageOptionType[]>([])
    const [builderLanguageSupportMap, setBuilderLanguageSupportMap] =
        useState<Record<string, LanguageBuilderOptionType>>()

    useEffect(() => {
        if (buildersAndFrameworks.builders.length > 0) {
            initBuilderData()
        }
    }, [buildersAndFrameworks.builders])

    const initBuilderData = () => {
        const _supportedLanguagesList: LanguageOptionType[] = []
        const _builderLanguageSupportMap: Record<string, LanguageBuilderOptionType> = {}
        let initOption = null
        for (const _languageBuilder of buildersAndFrameworks.builders) {
            const versionOptions: VersionsOptionType[] =
                _languageBuilder.Versions?.map((ver) => ({
                    label: ver,
                    value: ver,
                })) || []
            versionOptions.push(VERSION_DETECT_OPTION)
            _builderLanguageSupportMap[_languageBuilder.Language] = {
                LanguageIcon: _languageBuilder.LanguageIcon,
                Versions: versionOptions,
                BuilderLanguageMetadata:
                    _languageBuilder.BuilderLanguageMetadata?.map((_builder) => ({
                        label: _builder.Id,
                        value: _builder.Id,
                        BuilderLangEnvParam: _builder.BuilderLangEnvParam,
                    })) || [],
            }
            _supportedLanguagesList.push({
                label: _languageBuilder.Language,
                value: _languageBuilder.Language,
                icon: _languageBuilder.LanguageIcon,
            })

            if (!initOption) {
                initOption = {
                    language: _languageBuilder.Language,
                    icon: _languageBuilder.LanguageIcon,
                    version: _languageBuilder.Versions[0],
                    builderId: _languageBuilder.BuilderLanguageMetadata[0].Id,
                    BuilderLangEnvParam: _languageBuilder.BuilderLanguageMetadata[0].BuilderLangEnvParam,
                }
            }
        }
        setSupportedLanguagesList(_supportedLanguagesList)
        updateConfigAndBuildersData(initOption, _builderLanguageSupportMap)
    }

    const updateConfigAndBuildersData = (
        initOption: InitLanguageOptionType,
        _builderLanguageSupportMap: Record<string, LanguageBuilderOptionType>,
    ): void => {
        const currentBuilderLangEnvParam = _builderLanguageSupportMap[
            ciBuildConfig?.buildPackConfig?.language
        ]?.BuilderLanguageMetadata?.find(
            (_builder) => _builder.value === ciBuildConfig.buildPackConfig.builderId,
        )?.BuilderLangEnvParam
        const _currentCIBuildConfig = {
            ...currentCIBuildConfig,
            ciBuildType: CIBuildType.BUILDPACK_BUILD_TYPE,
        }

        let _language = buildersAndFrameworks.selectedLanguage,
            _version = buildersAndFrameworks.selectedVersion,
            _builder = buildersAndFrameworks.selectedBuilder

        // Update buildersAndFrameworks & buildPackConfig only on the first mount of the component
        if (!_language || !_version || !_builder) {
            if (ciBuildConfig?.buildPackConfig) {
                _builder = {
                    label: ciBuildConfig.buildPackConfig.builderId,
                    value: ciBuildConfig.buildPackConfig.builderId,
                    BuilderLangEnvParam: currentBuilderLangEnvParam,
                }
                _language = {
                    label: ciBuildConfig.buildPackConfig.language,
                    value: ciBuildConfig.buildPackConfig.language,
                    icon: _builderLanguageSupportMap[ciBuildConfig.buildPackConfig.language]?.LanguageIcon,
                }
                _version = {
                    label: ciBuildConfig.buildPackConfig.languageVersion,
                    value: ciBuildConfig.buildPackConfig.languageVersion,
                }
                _currentCIBuildConfig[DockerConfigOverrideKeys.buildPackConfig] = {
                    ...ciBuildConfig.buildPackConfig,
                    builderLangEnvParam: currentBuilderLangEnvParam,
                    currentBuilderLangEnvParam: currentBuilderLangEnvParam,
                }

                // Update BuilderLanguageMetadata with previously saved custom option
                const languageBuilderOption = _builderLanguageSupportMap[ciBuildConfig.buildPackConfig.language]
                if (
                    languageBuilderOption.BuilderLanguageMetadata.findIndex(
                        (_metadata) => _metadata.value === _builder.value,
                    ) === -1
                ) {
                    _builderLanguageSupportMap[ciBuildConfig.buildPackConfig.language] = {
                        ...languageBuilderOption,
                        BuilderLanguageMetadata: [
                            ...languageBuilderOption.BuilderLanguageMetadata,
                            {
                                label: _builder.value,
                                value: _builder.value,
                                BuilderLangEnvParam: currentBuilderLangEnvParam ?? '',
                            },
                        ],
                    }
                }
            } else {
                _builder = {
                    label: initOption.builderId,
                    value: initOption.builderId,
                    BuilderLangEnvParam: initOption.BuilderLangEnvParam,
                }
                _language = {
                    label: initOption.language,
                    value: initOption.language,
                    icon: initOption.icon,
                }
                _version = {
                    label: initOption.version,
                    value: initOption.version,
                }
                _currentCIBuildConfig[DockerConfigOverrideKeys.buildPackConfig] = {
                    ..._currentCIBuildConfig.buildPackConfig,
                    builderId: initOption.builderId,
                    language: initOption.language,
                    languageVersion: initOption.version,
                    builderLangEnvParam: initOption.BuilderLangEnvParam,
                    currentBuilderLangEnvParam: currentBuilderLangEnvParam,
                }
            }

            setBuilderLanguageSupportMap(_builderLanguageSupportMap)
            setBuildersAndFrameworks({
                ...buildersAndFrameworks,
                selectedBuilder: _builder,
                selectedLanguage: _language,
                selectedVersion: _version,
            })
            updateBuildEnvArgs(_version.value, _builder, true)
        }

        // Always set currentCIBuildConfig on init for changing ciBuildType
        setCurrentCIBuildConfig(_currentCIBuildConfig)
    }

    const handleLanguageSelection = (selected: LanguageOptionType) => {
        const _languageBuilder = builderLanguageSupportMap[selected.value]
        const _selectedVersion =
            _languageBuilder.Versions.find((ver) => ver.value === buildersAndFrameworks.selectedVersion?.value) ||
            _languageBuilder.Versions[0]
        const _selectedBuilder =
            _languageBuilder.BuilderLanguageMetadata.find(
                (_builder) => _builder.value === buildersAndFrameworks.selectedBuilder?.value,
            ) || _languageBuilder.BuilderLanguageMetadata[0]
        setBuildersAndFrameworks({
            ...buildersAndFrameworks,
            selectedBuilder: _selectedBuilder,
            selectedLanguage: selected,
            selectedVersion: _selectedVersion,
        })
        setCurrentCIBuildConfig({
            ...currentCIBuildConfig,
            buildPackConfig: {
                ...currentCIBuildConfig.buildPackConfig,
                builderId: _selectedBuilder.value,
                language: selected.value,
                languageVersion: _selectedVersion.value,
                builderLangEnvParam: _selectedBuilder.BuilderLangEnvParam,
            },
        })
        updateBuildEnvArgs(_selectedVersion.value, _selectedBuilder)
    }

    const handleVersionSelection = (selected: OptionType) => {
        setBuildersAndFrameworks({
            ...buildersAndFrameworks,
            selectedVersion: selected,
        })
        setCurrentCIBuildConfig({
            ...currentCIBuildConfig,
            buildPackConfig: {
                ...currentCIBuildConfig.buildPackConfig,
                builderId: buildersAndFrameworks.selectedBuilder.value,
                language: buildersAndFrameworks.selectedLanguage.value,
                languageVersion: selected.value,
                builderLangEnvParam: buildersAndFrameworks.selectedBuilder.BuilderLangEnvParam,
            },
        })
        updateBuildEnvArgs(selected.value, buildersAndFrameworks.selectedBuilder)
    }

    const handleBuilderSelection = (selected: BuilderIdOptionType) => {
        setBuildersAndFrameworks({
            ...buildersAndFrameworks,
            selectedBuilder: selected,
        })
        setCurrentCIBuildConfig({
            ...currentCIBuildConfig,
            buildPackConfig: {
                ...currentCIBuildConfig.buildPackConfig,
                builderId: selected.value,
                language: buildersAndFrameworks.selectedLanguage.value,
                languageVersion: buildersAndFrameworks.selectedVersion.value,
                builderLangEnvParam: selected.BuilderLangEnvParam,
                currentBuilderLangEnvParam: buildersAndFrameworks.selectedBuilder.value,
            },
        })
        updateBuildEnvArgs(buildersAndFrameworks.selectedVersion.value, selected)
        setBuilderLanguageSupportMap((prevState) => {
            const prevValue = prevState[buildersAndFrameworks.selectedLanguage.value]
            if (prevValue.BuilderLanguageMetadata.findIndex((_metadata) => _metadata.value === selected.value) === -1) {
                return {
                    ...prevState,
                    [buildersAndFrameworks.selectedLanguage.value]: {
                        ...prevValue,
                        BuilderLanguageMetadata: [
                            ...prevValue.BuilderLanguageMetadata,
                            {
                                label: selected.value,
                                value: selected.value,
                                BuilderLangEnvParam: '',
                            },
                        ],
                    },
                }
            }
            return prevState
        })
    }

    const updateBuildEnvArgs = (version: string, builder: BuilderIdOptionType, isInitCall?: boolean) => {
        let _buildEnvArgs = [...buildEnvArgs]

        /**
         * If _buildEnvArgs contains only one empty arg
         * - If yes & is init call then push init arg selection to buildEnvArgs array
         * - Else remove empty arg from buildEnvArgs array & proceed
         */
        if (_buildEnvArgs.length === 1 && !_buildEnvArgs[0].k && version !== AUTO_DETECT) {
            if (isInitCall) {
                _buildEnvArgs[0].k = builder.BuilderLangEnvParam
                _buildEnvArgs[0].v = version
                setBuildEnvArgs(_buildEnvArgs)
                return
            } else {
                _buildEnvArgs.splice(0, 1)
            }
        }

        /**
         * 1. First check if version is set to Autodetect & env arg is present in the array
         * - If yes then remove the env arg from args & proceed to set the buildEnvArgs state
         * - Else proceed to 2
         * 2. Check if builderId or version has been changed or related arg is not present
         * - First check if there's an existing language env arg is present
         *      - If yes then update the env arg with provided version & BuilderLangEnvParam
         * - Second check
         *      - If env arg is not present & builderLangEnvParam is present
         *          then push the arg to buildEnvArgs array
         *      - Else if env arg is present & builderLangEnvParam is empty
         *          then remove the arg from buildEnvArgs array
         * - Proceed to set the buildEnvArgs state
         */
        if (version === AUTO_DETECT && !isInitCall) {
            _buildEnvArgs.forEach((arg, idx) => {
                if (arg.k === builder.BuilderLangEnvParam) {
                    _buildEnvArgs.splice(idx, 1)
                }
            })
        } else if (
            version !== AUTO_DETECT &&
            (currentCIBuildConfig.buildPackConfig.builderId !== builder.value ||
                currentCIBuildConfig.buildPackConfig.languageVersion !== version)
        ) {
            let isArgPresent = false,
                argIdx
            _buildEnvArgs.forEach((_arg, idx) => {
                if (
                    !isArgPresent &&
                    (currentCIBuildConfig.buildPackConfig.currentBuilderLangEnvParam === _arg.k ||
                        currentCIBuildConfig.buildPackConfig.builderLangEnvParam === _arg.k ||
                        builder.BuilderLangEnvParam === _arg.k)
                ) {
                    isArgPresent = true
                    argIdx = idx
                    _arg.k = builder.BuilderLangEnvParam
                    _arg.v = version
                }
            })

            if (!isArgPresent && builder.BuilderLangEnvParam) {
                _buildEnvArgs.push({
                    k: builder.BuilderLangEnvParam,
                    v: version,
                    keyError: '',
                    valueError: '',
                })
            } else if (isArgPresent && argIdx >= 0 && !builder.BuilderLangEnvParam) {
                _buildEnvArgs.splice(argIdx, 1)
            }
        }

        // At the last step, if _buildEnvArgs is empty then push an empty args option to show empty fields
        if (_buildEnvArgs.length === 0) {
            _buildEnvArgs.push({
                k: '',
                v: '',
                keyError: '',
                valueError: '',
            })
        }
        setBuildEnvArgs(_buildEnvArgs)
    }

    const formatOptionLabel = (option: VersionsOptionType) => {
        return (
            <div className="flex left column w-100 dc__ellipsis-right">
                <span>{option.label}</span>
                {option.infoText && <small className="cn-6">{option.infoText}</small>}
            </div>
        )
    }

    const additionalBuilderTippyContent = () => {
        return (
            <div className="p-12 fs-13 fw-4 lh-20">
                <span>{CI_BUILDPACK_OPTION_TEXTS.BuilderTippyContent.additionalContent.label}</span>
                <ol className="dc__list-style-disc m-0 pl-20">
                    {CI_BUILDPACK_OPTION_TEXTS.BuilderTippyContent.additionalContent.listItems.map((_item) => (
                        <li key={_item}>{_item}</li>
                    ))}
                </ol>
            </div>
        )
    }

    const formatCreateLabel = (inputValue: string) => `Use '${inputValue}'`

    const projectPathVal =
        configOverrideView && !allowOverride ? ciBuildConfig.buildPackConfig?.projectPath : projectPath.value

    return (
        <div className="form-row__docker buildpack-option-wrapper mb-4">
            <div className="flex top project-material-options">
                <div className="form__field">
                    <label className="form__label">{`${
                        configOverrideView && !allowOverride ? 'Repository' : 'Select repository'
                    } containing code`}</label>
                    {configOverrideView && !allowOverride ? (
                        <div className="flex left">
                            {currentMaterial?.url && renderOptionIcon(currentMaterial.url)}
                            <span className="fs-14 fw-4 lh-20 cn-9">{currentMaterial?.name || 'Not selected'}</span>
                        </div>
                    ) : (
                        <ReactSelect
                            classNamePrefix="build-config__select-repository-containing-code"
                            className="m-0"
                            tabIndex={3}
                            isSearchable={false}
                            options={sourceConfig.material}
                            getOptionLabel={(option) => `${option.name}`}
                            getOptionValue={(option) => `${option.checkoutPath}`}
                            value={configOverrideView && !allowOverride ? currentMaterial : selectedMaterial}
                            styles={getCommonSelectStyle({
                                control: (base, state) => ({
                                    ...base,
                                    minHeight: '36px',
                                    boxShadow: 'none',
                                    backgroundColor: 'var(--N50)',
                                    border: state.isFocused ? '1px solid var(--B500)' : '1px solid var(--N200)',
                                    cursor: 'pointer',
                                }),
                                menu: (base) => ({
                                    ...base,
                                    marginTop: '0',
                                    minWidth: '226px',
                                }),
                            })}
                            components={{
                                IndicatorSeparator: null,
                                Option: repositoryOption,
                                Control: repositoryControls,
                            }}
                            onChange={handleFileLocationChange}
                            isDisabled={configOverrideView && !allowOverride}
                        />
                    )}
                    {repository.error && <label className="form__error">{repository.error}</label>}
                </div>
                <div className="form__field">
                    <label htmlFor="" className="form__label flexbox-imp flex-align-center">
                        {CI_BUILDPACK_OPTION_TEXTS.ProjectPathTippyContent.label}
                        <TippyCustomized
                            theme={TippyTheme.white}
                            className="w-300"
                            placement="top"
                            Icon={HelpIcon}
                            iconClass="fcv-5"
                            heading={CI_BUILDPACK_OPTION_TEXTS.ProjectPathTippyContent.heading}
                            infoText={CI_BUILDPACK_OPTION_TEXTS.ProjectPathTippyContent.infoText}
                            showCloseButton={true}
                            trigger="click"
                            interactive={true}
                        >
                            <QuestionIcon className="icon-dim-16 fcn-6 ml-4 cursor" />
                        </TippyCustomized>
                    </label>
                    {configOverrideView && !allowOverride ? (
                        <span className="fs-14 fw-4 lh-20 cn-9">{getAbsoluteProjectPath(projectPathVal)}</span>
                    ) : (
                        <div className="project-path-container h-36">
                            <span className="checkout-path-container bcn-1 en-2 bw-1 dc__no-right-border dc__ellipsis-right">
                                ./
                            </span>
                            <input
                                data-testid="build-pack-project-path-textbox"
                                tabIndex={4}
                                type="text"
                                className="form__input file-name"
                                placeholder="Project path"
                                name="projectPath"
                                value={projectPathVal === './' ? '' : projectPathVal}
                                onChange={handleOnChangeConfig}
                                autoComplete={'off'}
                                disabled={configOverrideView && !allowOverride}
                            />
                        </div>
                    )}
                </div>
            </div>
            <div className="flex top buildpack-options">
                <div className="buildpack-language-options">
                    <div className={`form__field ${configOverrideView ? 'mb-0-imp' : ''}`}>
                        <label className="form__label">{CI_BUILDPACK_OPTION_TEXTS.Language}</label>
                        {configOverrideView && !allowOverride ? (
                            <div className="flex left">
                                {buildersAndFrameworks.selectedLanguage?.icon && (
                                    <img
                                        src={buildersAndFrameworks.selectedLanguage.icon}
                                        alt={buildersAndFrameworks.selectedLanguage.label}
                                        className="icon-dim-20 mr-8"
                                    />
                                )}
                                <span className="fs-14 fw-4 lh-20 cn-9">
                                    {buildersAndFrameworks.selectedLanguage?.label}
                                </span>
                            </div>
                        ) : (
                            <ReactSelect
                                classNamePrefix="build-pack-language-dropdown"
                                className="m-0"
                                tabIndex={3}
                                options={supportedLanguagesList}
                                value={buildersAndFrameworks.selectedLanguage}
                                isSearchable={false}
                                styles={getCommonSelectStyle(LANGUAGE_SELECT_STYLES)}
                                components={{
                                    IndicatorSeparator: null,
                                    DropdownIndicator,
                                    Option: OptionWithIcon,
                                    ValueContainer: ValueContainerWithIcon,
                                }}
                                onChange={handleLanguageSelection}
                                isDisabled={configOverrideView && !allowOverride}
                            />
                        )}
                    </div>
                    <div className={`form__field ${configOverrideView ? 'mb-0-imp' : ''}`}>
                        <label className="form__label">{CI_BUILDPACK_OPTION_TEXTS.Version}</label>
                        {configOverrideView && !allowOverride ? (
                            <span className="fs-14 fw-4 lh-20 cn-9">
                                {buildersAndFrameworks.selectedVersion?.value}
                            </span>
                        ) : (
                            <ReactSelect
                                classNamePrefix="build-pack-version-dropdown"
                                className="m-0"
                                tabIndex={3}
                                isLoading={!builderLanguageSupportMap?.[buildersAndFrameworks.selectedLanguage?.value]}
                                options={
                                    builderLanguageSupportMap?.[buildersAndFrameworks.selectedLanguage?.value]?.Versions
                                }
                                value={buildersAndFrameworks.selectedVersion}
                                formatOptionLabel={formatOptionLabel}
                                isSearchable={false}
                                styles={getCommonSelectStyle(VERSION_SELECT_STYLES)}
                                components={{
                                    IndicatorSeparator: null,
                                    DropdownIndicator,
                                    Option,
                                }}
                                onChange={handleVersionSelection}
                                isDisabled={configOverrideView && !allowOverride}
                            />
                        )}
                    </div>
                </div>
                <div className={`form__field ${configOverrideView ? 'mb-0-imp' : ''}`}>
                    <label className="form__label flexbox-imp flex-align-center">
                        {configOverrideView && !allowOverride
                            ? CI_BUILDPACK_OPTION_TEXTS.BuilderTippyContent.heading
                            : CI_BUILDPACK_OPTION_TEXTS.BuilderTippyContent.selectBuilder}
                        <TippyCustomized
                            theme={TippyTheme.white}
                            className="w-300"
                            placement="top"
                            Icon={HelpIcon}
                            iconClass="fcv-5"
                            heading={CI_BUILDPACK_OPTION_TEXTS.BuilderTippyContent.heading}
                            infoText={CI_BUILDPACK_OPTION_TEXTS.BuilderTippyContent.infoText}
                            additionalContent={additionalBuilderTippyContent()}
                            documentationLinkText={CI_BUILDPACK_OPTION_TEXTS.BuilderTippyContent.documentationLinkText}
                            documentationLink={DOCUMENTATION.APP_CI_CONFIG_BUILD_WITHOUT_DOCKER}
                            showCloseButton={true}
                            trigger="click"
                            interactive={true}
                        >
                            <QuestionIcon className="icon-dim-16 fcn-6 ml-4 cursor" />
                        </TippyCustomized>
                    </label>
                    {configOverrideView && !allowOverride ? (
                        <span className="fs-14 fw-4 lh-20 cn-9">{buildersAndFrameworks.selectedBuilder?.label}</span>
                    ) : (
                        <CreatableSelect
                            classNamePrefix="build-pack-select-builder-dropdown"
                            placeholder={CI_BUILDPACK_OPTION_TEXTS.BuilderTippyContent.selectBuilder}
                            className="m-0"
                            tabIndex={3}
                            isLoading={!builderLanguageSupportMap?.[buildersAndFrameworks.selectedLanguage?.value]}
                            options={
                                builderLanguageSupportMap?.[buildersAndFrameworks.selectedLanguage?.value]
                                    ?.BuilderLanguageMetadata
                            }
                            value={buildersAndFrameworks.selectedBuilder}
                            formatCreateLabel={formatCreateLabel}
                            styles={getCommonSelectStyle(BUILDER_SELECT_STYLES)}
                            components={{
                                IndicatorSeparator: null,
                                DropdownIndicator,
                                Option,
                                MenuList: menuListComponent,
                            }}
                            onChange={handleBuilderSelection}
                            isDisabled={configOverrideView && !allowOverride}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
