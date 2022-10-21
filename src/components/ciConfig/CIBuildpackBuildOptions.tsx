import React, { useEffect, useState } from 'react'
import ReactSelect, { components } from 'react-select'
import {
    DropdownIndicator,
    getCommonSelectStyle,
    getCustomOptionSelectionStyle,
    Option,
} from '../v2/common/ReactSelect.utils'
import { ReactComponent as GitLab } from '../../assets/icons/git/gitlab.svg'
import { ReactComponent as Git } from '../../assets/icons/git/git.svg'
import { ReactComponent as GitHub } from '../../assets/icons/git/github.svg'
import { ReactComponent as BitBucket } from '../../assets/icons/git/bitbucket.svg'
import { _multiSelectStyles } from './CIConfig.utils'
import { OptionType } from '../app/types'
import { CIBuildType } from '../ciPipeline/types'

export const repositoryOption = (props): JSX.Element => {
    props.selectProps.styles.option = getCustomOptionSelectionStyle()
    return (
        <components.Option {...props}>
            {props.data.url.includes('gitlab') && <GitLab className="mr-8 dc__vertical-align-middle icon-dim-20" />}
            {props.data.url.includes('github') && <GitHub className="mr-8 dc__vertical-align-middle icon-dim-20" />}
            {props.data.url.includes('bitbucket') && (
                <BitBucket className="mr-8 dc__vertical-align-middle icon-dim-20" />
            )}
            {props.data.url.includes('gitlab') ||
            props.data.url.includes('github') ||
            props.data.url.includes('bitbucket') ? null : (
                <Git className="mr-8 dc__vertical-align-middle icon-dim-20" />
            )}

            {props.label}
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

interface BuilderIdOptionType extends OptionType {
    BuilderLangEnvParam: string
}

interface LanguageBuilderType {
    Versions: OptionType[]
    BuilderLanguageMetadata: BuilderIdOptionType[]
}

export default function CIBuildpackBuildOptions({
    ciConfig,
    sourceConfig,
    builders,
    configOverrideView,
    allowOverride,
    _selectedMaterial,
    selectedMaterial,
    handleFileLocationChange,
    repository,
    projectPath,
    handleOnChangeConfig,
    currentCIBuildConfig,
    setCurrentCIBuildConfig,
}) {
    const [supportedLanguagesList, setSupportedLanguagesList] = useState<OptionType[]>([])
    const [selectedBuilder, setSelectedBuilder] = useState<BuilderIdOptionType>()
    const [selectedLanguage, setSelectedLanguage] = useState<OptionType>()
    const [selectedVersion, setSelectedVersion] = useState<OptionType>()
    const [builderLanguageSupportMap, setBuilderLanguageSupportMap] = useState<Record<string, LanguageBuilderType>>()

    useEffect(() => {
        if (builders.length > 0) {
            initBuilderData()
        }
    }, [builders])

    const initBuilderData = () => {
        const _supportedLanguagesList = []
        const _builderLanguageSupportMap: Record<string, LanguageBuilderType> = {}
        let initOption = null
        for (const _languageBuilder of builders) {
            _builderLanguageSupportMap[_languageBuilder.Language] = {
                Versions: _languageBuilder.Versions?.map((ver) => ({
                    label: ver,
                    value: ver,
                })),
                BuilderLanguageMetadata: _languageBuilder.BuilderLanguageMetadata?.map((_builder) => ({
                    label: _builder.Id,
                    value: _builder.Id,
                    BuilderLangEnvParam: _builder.BuilderLangEnvParam,
                })),
            }
            _supportedLanguagesList.push({
                label: _languageBuilder.Language,
                value: _languageBuilder.Language,
            })

            if (!initOption) {
                initOption = {
                    language: _languageBuilder.Language,
                    version: _languageBuilder.Versions[0],
                    builderId: _languageBuilder.BuilderLanguageMetadata[0].Id,
                    BuilderLangEnvParam: _languageBuilder.BuilderLanguageMetadata[0].BuilderLangEnvParam,
                }
            }
        }
        setSupportedLanguagesList(_supportedLanguagesList)
        setBuilderLanguageSupportMap(_builderLanguageSupportMap)

        const currentBuilderLangEnvParam = _builderLanguageSupportMap[
            ciConfig?.ciBuildConfig?.buildPackConfig?.language
        ]?.BuilderLanguageMetadata?.find(
            (_builder) => _builder.value === ciConfig.ciBuildConfig.buildPackConfig.builderId,
        )?.BuilderLangEnvParam
        setSelectedBuilder(
            ciConfig?.ciBuildConfig?.buildPackConfig?.builderId
                ? {
                      label: ciConfig.ciBuildConfig.buildPackConfig.builderId,
                      value: ciConfig.ciBuildConfig.buildPackConfig.builderId,
                      BuilderLangEnvParam: currentBuilderLangEnvParam,
                  }
                : {
                      label: initOption.builderId,
                      value: initOption.builderId,
                      BuilderLangEnvParam: initOption.BuilderLangEnvParam,
                  },
        )
        setSelectedLanguage(
            ciConfig?.ciBuildConfig?.buildPackConfig?.language
                ? {
                      label: ciConfig.ciBuildConfig.buildPackConfig.language,
                      value: ciConfig.ciBuildConfig.buildPackConfig.language,
                  }
                : {
                      label: initOption.language,
                      value: initOption.language,
                  },
        )
        setSelectedVersion(
            ciConfig?.ciBuildConfig?.buildPackConfig?.languageVersion
                ? {
                      label: ciConfig.ciBuildConfig.buildPackConfig.languageVersion,
                      value: ciConfig.ciBuildConfig.buildPackConfig.languageVersion,
                  }
                : {
                      label: initOption.version,
                      value: initOption.version,
                  },
        )
        setCurrentCIBuildConfig({
            ...currentCIBuildConfig,
            ciBuildType: CIBuildType.BUILDPACK_BUILD_TYPE,
            buildPackConfig: ciConfig?.ciBuildConfig?.buildPackConfig
                ? ciConfig.ciBuildConfig.buildPackConfig
                : {
                      builderId: initOption.builderId,
                      language: initOption.language,
                      languageVersion: initOption.version,
                      builderLangEnvParam: initOption.BuilderLangEnvParam,
                      currentBuilderLangEnvParam,
                  },
        })
    }

    const handleLanguageSelection = (selected: OptionType) => {
        setSelectedLanguage(selected)

        const _languageBuilder = builderLanguageSupportMap[selected.value]
        const _selectedVersion =
            _languageBuilder.Versions.find((ver) => ver.value === selectedVersion?.value) ||
            _languageBuilder.Versions[0]
        setSelectedVersion(_selectedVersion)

        const _selectedBuilder =
            _languageBuilder.BuilderLanguageMetadata.find((_builder) => _builder.value === selectedBuilder.value) ||
            _languageBuilder.BuilderLanguageMetadata[0]
        setSelectedBuilder(_selectedBuilder)

        setCurrentCIBuildConfig({
            ...currentCIBuildConfig,
            buildPackConfig: {
                builderId: _selectedBuilder.value,
                language: selected.value,
                languageVersion: _selectedVersion.value,
                builderLangEnvParam: _selectedBuilder.BuilderLangEnvParam,
            },
        })
    }

    const handleVersionSelection = (selected: OptionType) => {
        setSelectedVersion(selected)
        setCurrentCIBuildConfig({
            ...currentCIBuildConfig,
            buildPackConfig: {
                builderId: selectedBuilder.value,
                language: selectedLanguage.value,
                languageVersion: selected.value,
                builderLangEnvParam: selectedBuilder.BuilderLangEnvParam,
            },
        })
    }

    const handleBuilderSelection = (selected: BuilderIdOptionType) => {
        setSelectedBuilder(selected)
        setCurrentCIBuildConfig({
            ...currentCIBuildConfig,
            buildPackConfig: {
                builderId: selected.value,
                language: selectedLanguage.value,
                languageVersion: selectedVersion.value,
                builderLangEnvParam: selected.BuilderLangEnvParam,
            },
        })
    }

    return (
        <div className="form-row__docker buildpack-option-wrapper mb-4">
            <div className="flex top project-material-options">
                <div className="form__field">
                    <label className="form__label">Repo containing code you want to build</label>
                    <ReactSelect
                        className="m-0"
                        tabIndex={3}
                        isMulti={false}
                        isClearable={false}
                        options={sourceConfig.material}
                        getOptionLabel={(option) => `${option.name}`}
                        getOptionValue={(option) => `${option.checkoutPath}`}
                        value={configOverrideView && !allowOverride ? _selectedMaterial : selectedMaterial}
                        styles={getCommonSelectStyle({
                            control: (base, state) => ({
                                ...base,
                                minHeight: '36px',
                                boxShadow: 'none',
                                backgroundColor: 'var(--N50)',
                                border: state.isFocused ? '1px solid var(--B500)' : '1px solid var(--N200)',
                                cursor: 'pointer',
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
                    {repository.error && <label className="form__error">{repository.error}</label>}
                </div>
                <div className="form__field">
                    <label htmlFor="" className="form__label">
                        Project path (relative)*
                    </label>
                    <input
                        tabIndex={4}
                        type="text"
                        className="form__input file-name"
                        placeholder="Enter the project path"
                        name="projectPath"
                        value={
                            configOverrideView && !allowOverride
                                ? ciConfig.ciBuildConfig.buildPackConfig?.projectPath || './'
                                : projectPath.value
                        }
                        onChange={handleOnChangeConfig}
                        autoComplete={'off'}
                        disabled={configOverrideView && !allowOverride}
                    />
                    {projectPath.error && <label className="form__error">{projectPath.error}</label>}
                </div>
            </div>
            <div className="flex top buildpack-options">
                <div className="form__field">
                    <label className="form__label">Language</label>
                    <ReactSelect
                        className="m-0"
                        tabIndex={3}
                        options={supportedLanguagesList}
                        value={selectedLanguage}
                        styles={getCommonSelectStyle({
                            control: (base, state) => ({
                                ...base,
                                minHeight: '36px',
                                boxShadow: 'none',
                                backgroundColor: 'var(--N50)',
                                border: state.isFocused ? '1px solid var(--B500)' : '1px solid var(--N200)',
                                cursor: 'pointer',
                            }),
                        })}
                        components={{
                            IndicatorSeparator: null,
                            DropdownIndicator,
                            Option,
                        }}
                        onChange={handleLanguageSelection}
                        isDisabled={configOverrideView && !allowOverride}
                    />
                </div>
                <div className="form__field">
                    <label className="form__label">Version</label>
                    <ReactSelect
                        className="m-0"
                        tabIndex={3}
                        isLoading={!builderLanguageSupportMap?.[selectedLanguage?.value]}
                        options={builderLanguageSupportMap?.[selectedLanguage?.value]?.Versions}
                        value={selectedVersion}
                        styles={getCommonSelectStyle({
                            control: (base, state) => ({
                                ...base,
                                minHeight: '36px',
                                boxShadow: 'none',
                                backgroundColor: 'var(--N50)',
                                border: state.isFocused ? '1px solid var(--B500)' : '1px solid var(--N200)',
                                cursor: 'pointer',
                            }),
                        })}
                        components={{
                            IndicatorSeparator: null,
                            DropdownIndicator,
                            Option,
                        }}
                        onChange={handleVersionSelection}
                        isDisabled={configOverrideView && !allowOverride}
                    />
                </div>
                <div className="form__field">
                    <label className="form__label">Select a builder</label>
                    <ReactSelect
                        className="m-0"
                        tabIndex={3}
                        isLoading={!builderLanguageSupportMap?.[selectedLanguage?.value]}
                        options={builderLanguageSupportMap?.[selectedLanguage?.value]?.BuilderLanguageMetadata}
                        value={selectedBuilder}
                        styles={getCommonSelectStyle({
                            control: (base, state) => ({
                                ...base,
                                minHeight: '36px',
                                boxShadow: 'none',
                                backgroundColor: 'var(--N50)',
                                border: state.isFocused ? '1px solid var(--B500)' : '1px solid var(--N200)',
                                cursor: 'pointer',
                            }),
                        })}
                        components={{
                            IndicatorSeparator: null,
                            DropdownIndicator,
                            Option,
                        }}
                        onChange={handleBuilderSelection}
                        isDisabled={configOverrideView && !allowOverride}
                    />
                </div>
            </div>
        </div>
    )
}
