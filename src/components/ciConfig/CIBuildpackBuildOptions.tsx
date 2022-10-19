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
import { getBuildpackMetadata } from './service'
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
    currentCIBuildConfig,
    setCurrentCIBuildConfig,
}) {
    const [buildersList, setBuildersList] = useState<OptionType[]>([])
    const [selectedBuilder, setSelectedBuilder] = useState<OptionType>()
    const [selectedLanguage, setSelectedLanguage] = useState<OptionType>()
    const [selectedVersion, setSelectedVersion] = useState<OptionType>()
    const [builderLanguageSupportMap, setBuilderLanguageSupportMap] = useState<Map<string, any>>()
    const [supportedLanguagesList, setSupportedLanguagesList] = useState<OptionType[]>([])
    const [supportedVersionsMap, setSupportedVersionsMap] = useState<Map<string, string[]>>()
    const [supportedVersionsList, setSupportedVersionsList] = useState<OptionType[]>([])

    useEffect(() => {
        if (builders.length > 0) {
            initBuilderData()
        }
    }, [builders])

    const initBuilderData = () => {
        const _buildersList = []
        const _builderLanguageSupportMap = new Map<string, any>()
        for (const _builder of builders) {
            _buildersList.push({
                label: _builder.Id,
                value: _builder.Id,
            })
            _builderLanguageSupportMap.set(_builder.Id, _builder.LanguageSupport)
        }

        setBuildersList(_buildersList)
        setBuilderLanguageSupportMap(_builderLanguageSupportMap)

        // Revisit
        const languageSupport = _builderLanguageSupportMap.get(_buildersList[0].value)
        const _supportedLanguagesList = []
        const _supportedVersionsMap = new Map<string, string[]>()
        for (const _lang of languageSupport) {
            _supportedLanguagesList.push({ label: _lang.Language, value: _lang.Language })
            _supportedVersionsMap.set(_lang.Language, _lang.Versions)
        }
        setSupportedLanguagesList(_supportedLanguagesList)
        const _supportedVersions =
            _supportedVersionsMap.get(_supportedLanguagesList[0].value)?.map((ver) => ({
                label: ver,
                value: ver,
            })) || []
        setSupportedVersionsMap(_supportedVersionsMap)
        setSupportedVersionsList(_supportedVersions)
        setSelectedBuilder(
            ciConfig?.ciBuildConfig?.buildPackConfig?.builderId
                ? {
                      label: ciConfig.ciBuildConfig.buildPackConfig.builderId,
                      value: ciConfig.ciBuildConfig.buildPackConfig.builderId,
                  }
                : _buildersList[0],
        )
        setSelectedLanguage(
            ciConfig?.ciBuildConfig?.buildPackConfig?.language
                ? {
                      label: ciConfig.ciBuildConfig.buildPackConfig.language,
                      value: ciConfig.ciBuildConfig.buildPackConfig.language,
                  }
                : _supportedLanguagesList[0],
        )
        setSelectedVersion(
            ciConfig?.ciBuildConfig?.buildPackConfig?.languageVersion
                ? {
                      label: ciConfig.ciBuildConfig.buildPackConfig.languageVersion,
                      value: ciConfig.ciBuildConfig.buildPackConfig.languageVersion,
                  }
                : _supportedVersions[0],
        )

        // Revisit
        setCurrentCIBuildConfig({
            ...currentCIBuildConfig,
            ciBuildType: CIBuildType.BUILDPACK_BUILD_TYPE,
            buildPackConfig: ciConfig?.ciBuildConfig?.buildPackConfig
                ? ciConfig.ciBuildConfig.buildPackConfig
                : {
                      builderId: _buildersList[0].value,
                      language: _supportedLanguagesList[0].value,
                      languageVersion: _supportedVersions[0].value,
                  },
            dockerBuildConfig: null,
        })
    }

    const handleBuilderSelection = (selected: OptionType) => {
        setSelectedBuilder(selected)

        const languageSupport = builderLanguageSupportMap.get(selected.value)
        const _supportedLanguagesList = []
        const _supportedVersionsMap = new Map<string, string[]>()
        let isLanguagePresent = false
        for (const _lang of languageSupport) {
            _supportedLanguagesList.push({ label: _lang.Language, value: _lang.Language })
            _supportedVersionsMap.set(_lang.Language, _lang.Versions)

            if (!isLanguagePresent && _lang.Language === selectedLanguage?.value) {
                isLanguagePresent = true
            }
        }
        setSupportedLanguagesList(_supportedLanguagesList)
        setSupportedVersionsMap(_supportedVersionsMap)

        if (!isLanguagePresent) {
            setSelectedLanguage(_supportedLanguagesList[0])
        }

        // update version
        setCurrentCIBuildConfig({
            ...currentCIBuildConfig,
            ciBuildType: CIBuildType.BUILDPACK_BUILD_TYPE,
            buildPackConfig: {
                builderId: selected.value,
                language: isLanguagePresent ? selectedLanguage?.value : _supportedLanguagesList[0].value,
                languageVersion: selectedVersion?.value,
            },
        })
    }

    const handleLanguageSelection = (selected) => {
        setSelectedLanguage(selected)

        const _supportedVersions =
            supportedVersionsMap.get(selected.value)?.map((ver) => ({
                label: ver,
                value: ver,
            })) || []

        setSupportedVersionsList(_supportedVersions)

        const _selectedVersion =
            _supportedVersions.find((ver) => ver.value === selectedVersion?.value) || _supportedVersions[0]
        setSelectedVersion(_selectedVersion)

        // update version
        setCurrentCIBuildConfig({
            ...currentCIBuildConfig,
            buildPackConfig: {
                builderId: selectedBuilder?.value,
                language: selected.value,
                languageVersion: _selectedVersion.value,
            },
        })
    }

    const handleVersionSelection = (selected) => {
        setSelectedVersion(selected)

        // update version
        setCurrentCIBuildConfig({
            ...currentCIBuildConfig,
            buildPackConfig: {
                builderId: selectedBuilder?.value,
                language: selectedLanguage?.value,
                languageVersion: selected.value,
            },
        })
    }

    return (
        <div className="form-row__docker buildpack-option-wrapper mb-4">
            <div className="flex buildpack-options">
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
                        options={supportedVersionsList}
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
            </div>
            <div className="form__field">
                <label className="form__label">Select a builder</label>
                <ReactSelect
                    className="m-0"
                    tabIndex={3}
                    options={buildersList}
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
    )
}
