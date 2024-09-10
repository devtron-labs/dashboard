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

import React, { useEffect, useState } from 'react'
import ReactSelect, { components } from 'react-select'
import CreatableSelect from 'react-select/creatable'
import { stopPropagation, CIBuildType, CustomInput, InfoIconTippy, SelectPicker, ComponentSizeType } from '@devtron-labs/devtron-fe-common-lib'
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
import { getAbsoluteProjectPath } from './CIConfig.utils'
import { OptionType } from '../app/types'
import { DockerConfigOverrideKeys } from '../ciPipeline/types'
import {
    BuilderIdOptionType,
    CIBuildpackBuildOptionsProps,
    InitLanguageOptionType,
    LanguageBuilderOptionType,
    LanguageOptionType,
    VersionsOptionType,
} from './types'
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
import { getGitProviderIcon } from '@Components/common'

export const renderOptionIcon = (option: string) => {
    if (!option) {
        return null
    }

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

export const getGitRepositoryOptions = (sourceMaterials) => {
    return sourceMaterials.map((material) => {
        return {
            value: material.checkoutPath,
            label: material.name,
            startIcon: getGitProviderIcon(material.url),
        }
    })
}

export const getSelectedMaterialValue = (selectedMaterial) => {
    if (selectedMaterial.name) {
        return {
            label: selectedMaterial.name,
            value: selectedMaterial.checkoutPath,
            startIcon: getGitProviderIcon(selectedMaterial.url),
        }
    }
    return null
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

export const releaseTagOption = (props): JSX.Element => {
    props.selectProps.styles.option = getCustomOptionSelectionStyle()
    return (
        <components.Option {...props} onClick={stopPropagation}>
            {props.value}
        </components.Option>
    )
}

export const checkoutPathOption = (props): JSX.Element => {
    props.selectProps.styles.option = getCustomOptionSelectionStyle()
    return <components.Option {...props}>{props.value}</components.Option>
}
export const repositoryControls = (props): JSX.Element => {
    let value = ''
    if (props.hasValue) {
        value = props.getValue()[0].url
    }
    const showGit = value && !value.includes('github') && !value.includes('gitlab') && !value.includes('bitbucket')
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

const BuildContextLabel = () => {
    return (
        <label htmlFor="" className="form__label flexbox-imp flex-align-center">
            {CI_BUILDPACK_OPTION_TEXTS.ProjectPathTippyContent.label}
            <InfoIconTippy
                heading={CI_BUILDPACK_OPTION_TEXTS.ProjectPathTippyContent.heading}
                infoText={CI_BUILDPACK_OPTION_TEXTS.ProjectPathTippyContent.infoText}
                iconClassName="icon-dim-16 fcn-6 ml-4"
            />
        </label>
    )
}

function additionalBuilderTippyContent() {
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

const BuilderTippy = () => {
    return (
        <InfoIconTippy
            heading={CI_BUILDPACK_OPTION_TEXTS.BuilderTippyContent.heading}
            infoText={CI_BUILDPACK_OPTION_TEXTS.BuilderTippyContent.infoText}
            additionalContent={additionalBuilderTippyContent()}
            documentationLinkText={CI_BUILDPACK_OPTION_TEXTS.BuilderTippyContent.documentationLinkText}
            documentationLink={DOCUMENTATION.APP_CI_CONFIG_BUILD_WITHOUT_DOCKER}
            iconClassName="icon-dim-16 fcn-6 ml-4"
        />
    )
}

export default function CIBuildpackBuildOptions({
    ciBuildConfig,
    sourceConfig,
    buildersAndFrameworks,
    setBuildersAndFrameworks,
    configOverrideView,
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
    readOnly,
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
                startIcon: _languageBuilder.LanguageIcon,
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

        let _language = buildersAndFrameworks.selectedLanguage
        let _version = buildersAndFrameworks.selectedVersion
        let _builder = buildersAndFrameworks.selectedBuilder

        // Update buildersAndFrameworks & buildPackConfig only on the first mount of the component
        // for !builderLanguageSupportMap, we will reset the values on init, but not proper solution
        if (!_language || !_version || !_builder || !builderLanguageSupportMap) {
            if (ciBuildConfig?.buildPackConfig) {
                _builder = {
                    label: ciBuildConfig.buildPackConfig.builderId,
                    value: ciBuildConfig.buildPackConfig.builderId,
                    BuilderLangEnvParam: currentBuilderLangEnvParam,
                }
                _language = {
                    label: ciBuildConfig.buildPackConfig.language,
                    value: ciBuildConfig.buildPackConfig.language,
                    startIcon: _builderLanguageSupportMap[ciBuildConfig.buildPackConfig.language]?.LanguageIcon,
                }
                _version = {
                    label: ciBuildConfig.buildPackConfig.languageVersion,
                    value: ciBuildConfig.buildPackConfig.languageVersion,
                }
                _currentCIBuildConfig[DockerConfigOverrideKeys.buildPackConfig] = {
                    ...ciBuildConfig.buildPackConfig,
                    builderLangEnvParam: currentBuilderLangEnvParam,
                    currentBuilderLangEnvParam,
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
                    startIcon: initOption.icon,
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
                    currentBuilderLangEnvParam,
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
        const _buildEnvArgs = [...buildEnvArgs]

        /**
         * If _buildEnvArgs contains only one empty arg
         * - If yes & is init call then push init arg selection to buildEnvArgs array
         * - Else remove empty arg from buildEnvArgs array & proceed
         */
        if (_buildEnvArgs.length === 1 && !_buildEnvArgs[0].k && version !== AUTO_DETECT) {
            if (isInitCall && builder.BuilderLangEnvParam) {
                _buildEnvArgs[0].k = builder.BuilderLangEnvParam
                _buildEnvArgs[0].v = version
                setBuildEnvArgs(_buildEnvArgs)
                return
            }
            _buildEnvArgs.splice(0, 1)
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
            let isArgPresent = false
            let argIdx
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

    const formatCreateLabel = (inputValue: string) => `Use '${inputValue}'`

    const projectPathVal = readOnly ? ciBuildConfig.buildPackConfig?.projectPath : projectPath.value

    if (readOnly) {
        return (
            <div className="form-row__docker buildpack-option-wrapper mb-4">
                <div className="flex top project-material-options">
                    <div className="form__field">
                        <label className="form__label">Repository containing code</label>

                        <div className="flex left">
                            {currentMaterial?.url && renderOptionIcon(currentMaterial.url)}
                            <span className="fs-14 fw-4 lh-20 cn-9">{currentMaterial?.name || 'Not selected'}</span>
                        </div>

                        {repository.error && <label className="form__error">{repository.error}</label>}
                    </div>

                    <div className="form__field">
                        <BuildContextLabel />
                        <span className="fs-14 fw-4 lh-20 cn-9">{getAbsoluteProjectPath(projectPathVal)}</span>
                    </div>
                </div>

                <div className="flex top buildpack-options">
                    <div className="buildpack-language-options">
                        <div className={`form__field ${configOverrideView ? 'mb-0-imp' : ''}`}>
                            <label className="form__label">{CI_BUILDPACK_OPTION_TEXTS.Language}</label>

                            <div className="flex left">
                                {buildersAndFrameworks.selectedLanguage?.startIcon && (
                                    <img
                                        src={buildersAndFrameworks.selectedLanguage.startIcon}
                                        alt={buildersAndFrameworks.selectedLanguage.label}
                                        className="icon-dim-20 mr-8"
                                    />
                                )}
                                <span className="fs-14 fw-4 lh-20 cn-9">
                                    {buildersAndFrameworks.selectedLanguage?.label}
                                </span>
                            </div>
                        </div>

                        <div className={`form__field ${configOverrideView ? 'mb-0-imp' : ''}`}>
                            <label className="form__label">{CI_BUILDPACK_OPTION_TEXTS.Version}</label>
                            <span className="fs-14 fw-4 lh-20 cn-9">
                                {buildersAndFrameworks.selectedVersion?.value}
                            </span>
                        </div>
                    </div>

                    <div className={`form__field ${configOverrideView ? 'mb-0-imp' : ''}`}>
                        <label className="form__label flexbox-imp flex-align-center">
                            {CI_BUILDPACK_OPTION_TEXTS.BuilderTippyContent.heading}

                            <BuilderTippy />
                        </label>

                        <span className="fs-14 fw-4 lh-20 cn-9">{buildersAndFrameworks.selectedBuilder?.label}</span>
                    </div>
                </div>
            </div>
        )
    }



    return (
        <div className="form-row__docker buildpack-option-wrapper mb-4">
            <div className="flex top project-material-options">
                <div className="form__field">

                    <SelectPicker
                        label="Select repository containing code"
                        inputId="build-pack-repository-select"
                        classNamePrefix="build-config__select-repository-containing-code"
                        isSearchable={false}
                        options={sourceConfig.material}
                        value={selectedMaterial}
                        onChange={handleFileLocationChange}
                    />

                    {repository.error && <label className="form__error">{repository.error}</label>}
                </div>
                <div className="form__field">
                    <BuildContextLabel />

                    <div className="project-path-container h-36">
                        <span className="checkout-path-container bcn-1 en-2 bw-1 dc__no-right-border dc__ellipsis-right">
                            ./
                        </span>
                        <CustomInput
                            data-testid="build-pack-project-path-textbox"
                            tabIndex={4}
                            rootClassName="file-name"
                            placeholder="Project path"
                            name="projectPath"
                            value={projectPathVal === './' ? '' : projectPathVal}
                            onChange={handleOnChangeConfig}
                        />
                    </div>
                </div>
            </div>

            <div className="flex top buildpack-options">
                <div className="buildpack-language-options">
                    <div className={`form__field ${configOverrideView ? 'mb-0-imp' : ''}`}>
                        <label className="form__label">{CI_BUILDPACK_OPTION_TEXTS.Language}</label>
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
                        />

                         {/* // TODO: Will be deleting this code after testing */}
                        {/* <SelectPicker
                            inputId="select-create-dockerfile-language-dropdown"
                            name="select-create-dockerfile-language-dropdown"
                            label={CI_BUILDPACK_OPTION_TEXTS.Language}
                            classNamePrefix="select-create-dockerfile-language-dropdown"
                            options={supportedLanguagesList}
                            value={buildersAndFrameworks.selectedLanguage}
                            isSearchable={false}
                            onChange={handleLanguageSelection}
                        /> */}
                    </div>

                    <div className={`form__field ${configOverrideView ? 'mb-0-imp' : ''}`}>
                        <label className="form__label">{CI_BUILDPACK_OPTION_TEXTS.Version}</label>
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
                        />

                        {/* // TODO: Will be deleting this code after testing */}
                        {/* <SelectPicker
                            inputId="build-pack-version-dropdown"
                            name="build-pack-version-dropdown"
                            label={CI_BUILDPACK_OPTION_TEXTS.Version}
                            classNamePrefix="build-pack-version-dropdown"
                            options={builderLanguageSupportMap?.[buildersAndFrameworks.selectedLanguage?.value]?.Versions}
                            value={buildersAndFrameworks.selectedVersion}
                            isSearchable={false}
                            onChange={handleVersionSelection}
                            /> */}
                    </div>
                </div>
                <div className={`form__field ${configOverrideView ? 'mb-0-imp' : ''}`}>
                    <label className="form__label flexbox-imp flex-align-center">
                        {CI_BUILDPACK_OPTION_TEXTS.BuilderTippyContent.selectBuilder}
                        <BuilderTippy />
                    </label>

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
                    />
                </div>
            </div>
        </div>
    )
}
