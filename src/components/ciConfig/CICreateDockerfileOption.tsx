import React, { useEffect, useState } from 'react'
import Tippy from '@tippyjs/react'
import ReactSelect from 'react-select'
import { MODES } from '../../config'
import CodeEditor from '../CodeEditor/CodeEditor'
import { copyToClipboard } from '../common'
import { showError, Progressing } from '@devtron-labs/devtron-fe-common-lib'
import {
    DropdownIndicator,
    getCommonSelectStyle,
    Option,
    OptionWithIcon,
    ValueContainerWithIcon,
} from '../v2/common/ReactSelect.utils'
import { ReactComponent as Clipboard } from '../../assets/icons/ic-copy.svg'
import { ReactComponent as Reset } from '../../assets/icons/ic-arrow-anticlockwise.svg'
import { CIBuildType } from '../ciPipeline/types'
import { CICreateDockerfileOptionProps, FrameworkOptionType, LanguageOptionType, TemplateDataType } from './types'
import { renderOptionIcon, repositoryControls, repositoryOption } from './CIBuildpackBuildOptions'
import { USING_ROOT, _customStyles } from './CIConfig.utils'
import BuildContext from './BuildContext'

export default function CICreateDockerfileOption({
    configOverrideView,
    allowOverride,
    frameworks,
    sourceConfig,
    currentMaterial,
    selectedMaterial,
    repository,
    handleFileLocationChange,
    currentCIBuildConfig,
    setCurrentCIBuildConfig,
    setInProgress,
    formState,
    ciConfig,
    handleOnChangeConfig,
}: CICreateDockerfileOptionProps) {
    const [languages, setLanguages] = useState<LanguageOptionType[]>([])
    const [languageFrameworks, setLanguageFrameworks] = useState<Map<string, FrameworkOptionType[]>>()
    const [selectedLanguage, setSelectedLanguage] = useState<LanguageOptionType>()
    const [selectedFramework, setSelectedFramework] = useState<FrameworkOptionType>()
    const [templateData, setTemplateData] = useState<Record<string, TemplateDataType>>() // key: language-framework
    const [editorValue, setEditorValue] = useState<string>('')
    const [copied, setCopied] = useState(false)
    const controller = new AbortController()
    const signal = controller.signal
    const [disable, setDisable] = useState<boolean>(false)
    useEffect(() => {
        if (frameworks.length > 0) {
            const _languageFrameworks = new Map<string, FrameworkOptionType[]>()
            const _languages: LanguageOptionType[] = []
            let initIcon = ''
            for (const _framework of frameworks) {
                if (!_languageFrameworks.has(_framework.Language)) {
                    const _frameworksList = frameworks
                        .filter((f) => f.Language === _framework.Language)
                        .map((lf) => ({
                            label: lf.Framework,
                            value: lf.Framework,
                            templateUrl: lf.TemplateUrl,
                        }))
                    _languageFrameworks.set(_framework.Language, _frameworksList)
                    _languages.push({
                        label: _framework.Language,
                        value: _framework.Language,
                        icon: _framework.LanguageIcon,
                    })

                    if (!initIcon && currentCIBuildConfig.dockerBuildConfig.language === _framework.Language) {
                        initIcon = _framework.LanguageIcon
                    }
                }
            }
            setLanguages(_languages)
            setLanguageFrameworks(_languageFrameworks)

            const _selectedLanguage = currentCIBuildConfig.dockerBuildConfig.language
                ? {
                      label: currentCIBuildConfig.dockerBuildConfig.language,
                      value: currentCIBuildConfig.dockerBuildConfig.language,
                      icon: initIcon,
                  }
                : _languages[0]
            setSelectedLanguage(_selectedLanguage)

            const _frameworks = _languageFrameworks.get(
                currentCIBuildConfig.dockerBuildConfig.language || _languages[0].value,
            )
            const _selectedFramework =
                _frameworks.find((_f) => _f.value === currentCIBuildConfig.dockerBuildConfig.languageFramework) ||
                _frameworks[0]
            setSelectedFramework(_selectedFramework)

            if (
                currentCIBuildConfig.dockerBuildConfig.language &&
                _selectedLanguage.value === currentCIBuildConfig.dockerBuildConfig.language &&
                (!currentCIBuildConfig.dockerBuildConfig.languageFramework ||
                    _selectedFramework.value === currentCIBuildConfig.dockerBuildConfig.languageFramework)
            ) {
                setTemplateData({
                    ...templateData,
                    [getTemplateKey(_selectedLanguage, _selectedFramework)]: {
                        fetching: false,
                        data: currentCIBuildConfig.dockerBuildConfig.dockerfileContent,
                    },
                })
                setEditorValue(currentCIBuildConfig.dockerBuildConfig.dockerfileContent)
            } else {
                getTemplateData(_selectedLanguage, _selectedFramework)
            }
        }

        return (): void => {
            // Abort the ongoing request if user switches between the build types
            controller.abort()
        }
    }, [frameworks])

    const getTemplateKey = (_selectedLanguage: LanguageOptionType, _selectedFramework: FrameworkOptionType) => {
        return `${_selectedLanguage.value}-${_selectedFramework?.value || 'no-framework'}`
    }

    const getTemplateData = async (_selectedLanguage: LanguageOptionType, _selectedFramework: FrameworkOptionType) => {
        const templateKey = getTemplateKey(_selectedLanguage, _selectedFramework)
        const _currentData = templateData?.[templateKey]

        if (_currentData?.fetching) {
            return
        } else if (_currentData?.data) {
            setTemplateData({
                ...templateData,
                [templateKey]: {
                    fetching: false,
                    data: _currentData.data,
                },
            })
            setEditorValue(_currentData.data)
        } else if (_selectedFramework?.templateUrl) {
            setInProgress(true)
            setTemplateData({
                ...templateData,
                [templateKey]: {
                    fetching: true,
                    data: '',
                },
            })

            try {
                const respData = await fetch(_selectedFramework.templateUrl, {
                    method: 'get',
                    signal: signal,
                }).then((res) => {
                    return res.text()
                })

                setTemplateData({
                    ...templateData,
                    [templateKey]: {
                        fetching: false,
                        data: respData,
                    },
                })
                setEditorValue(respData)
                setCurrentCIBuildConfig({
                    ...currentCIBuildConfig,
                    ciBuildType: CIBuildType.MANAGED_DOCKERFILE_BUILD_TYPE,
                    dockerBuildConfig: {
                        ...currentCIBuildConfig.dockerBuildConfig,
                        dockerfileContent: respData,
                        language: _selectedLanguage.value,
                        languageFramework: _selectedFramework.value,
                    },
                })
                setInProgress(false)
            } catch (err) {
                // Don't show error toast or log the error as user aborted the request
                if (!signal.aborted) {
                    showError(err)
                }
                setTemplateData({
                    ...templateData,
                    [templateKey]: {
                        fetching: false,
                        data: '',
                    },
                })
                setEditorValue('')
                setInProgress(false)
            }
        } else {
            setTemplateData({
                ...templateData,
                [templateKey]: {
                    fetching: false,
                    data: '',
                },
            })
            setEditorValue('')
        }
    }

    const handleLanguageSelection = (selected: LanguageOptionType) => {
        setSelectedLanguage(selected)

        const _selectedFramework = languageFrameworks.get(selected.value)?.[0] || null
        setSelectedFramework(_selectedFramework)
        getTemplateData(selected, _selectedFramework)
    }

    const handleFrameworkSelection = (selected: FrameworkOptionType) => {
        setSelectedFramework(selected)
        getTemplateData(selectedLanguage, selected)
    }

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

    const resetChanges = () => {
        const editorData = templateData && templateData[getTemplateKey(selectedLanguage, selectedFramework)]
        setEditorValue(editorData?.data)
        setCurrentCIBuildConfig({
            ...currentCIBuildConfig,
            dockerBuildConfig: {
                ...currentCIBuildConfig.dockerBuildConfig,
                dockerfileContent: editorData?.data,
                language: selectedLanguage?.value,
                languageFramework: selectedFramework?.value,
            },
        })
    }

    const renderLanguageOptions = (editorData: TemplateDataType) => {
        return (
            <div className="flex">
                <span className="fs-13 fw-4 lh-20 cn-7 mr-8">Language</span>
                {configOverrideView && !allowOverride ? (
                    <div className="flex left">
                        {selectedLanguage?.icon && (
                            <img
                                src={selectedLanguage.icon}
                                alt={selectedLanguage.label}
                                className="icon-dim-20 mr-8"
                            />
                        )}
                        <span className="fs-13 fw-6 lh-20 cn-9">{selectedLanguage?.label}</span>
                    </div>
                ) : (
                    <ReactSelect
                        tabIndex={3}
                        options={languages}
                        value={selectedLanguage}
                        isSearchable={false}
                        styles={_customStyles}
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
                {languageFrameworks?.get(selectedLanguage?.value)?.[0]?.value && (
                    <>
                        <div className="h-22 dc__border-right-n1 mr-8 ml-8" />
                        <span className="fs-13 fw-4 lh-20 cn-7 mr-8">Framework</span>
                        {configOverrideView && !allowOverride ? (
                            <span className="fs-13 fw-6 lh-20 cn-9">{selectedFramework?.label}</span>
                        ) : (
                            <ReactSelect
                                tabIndex={3}
                                options={languageFrameworks?.get(selectedLanguage?.value) || []}
                                value={selectedFramework}
                                isSearchable={false}
                                styles={_customStyles}
                                components={{
                                    IndicatorSeparator: null,
                                    DropdownIndicator,
                                    Option,
                                }}
                                onChange={handleFrameworkSelection}
                                isDisabled={configOverrideView && !allowOverride}
                            />
                        )}
                    </>
                )}
                {!editorData?.fetching && editorData?.data !== editorValue && (
                    <>
                        <div className="h-22 dc__border-right-n1 mr-8 ml-8" />
                        <div className="flex left cursor" onClick={resetChanges}>
                            <div className="icon-dim-12 flex">
                                <Reset className="icon-dim-12" />
                            </div>
                            <span className="ml-4">Reset changes</span>
                        </div>
                    </>
                )}
            </div>
        )
    }

    const handleCopyToClipboard = (e) => {
        e.stopPropagation()
        copyToClipboard(editorValue, () => setCopied(true))
    }

    const handleEditorValueChange = (value: string) => {
        setEditorValue(value)

        if (templateData && currentCIBuildConfig.dockerBuildConfig?.language) {
            setCurrentCIBuildConfig({
                ...currentCIBuildConfig,
                dockerBuildConfig: {
                    ...currentCIBuildConfig.dockerBuildConfig,
                    dockerfileContent: value,
                },
            })
        }
    }

    const editorData =
        templateData && selectedLanguage ? templateData[getTemplateKey(selectedLanguage, selectedFramework)] : null
    return (
        <>
            <div>
                <div className="mb-16 form-row__docker">
                    <div className="form__field mb-16">
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
                    <BuildContext
                        disable = {disable}
                        setDisable = {setDisable}
                        formState = {formState}
                        configOverrideView = {configOverrideView}
                        allowOverride = {allowOverride}
                        ciConfig = {ciConfig}
                        handleOnChangeConfig = {handleOnChangeConfig}
                    />
                </div>
            </div>
            <div
                className={`create-dockerfile-option dc__border br-4 dc__overflow-hidden ${
                    configOverrideView ? '' : 'mb-16'
                }`}
            >
                <CodeEditor
                    loading={editorData?.fetching}
                    customLoader={
                        <div className="h-300">
                            <Progressing pageLoader fullHeight />
                        </div>
                    }
                    value={editorValue || editorData?.data}
                    mode={MODES.DOCKERFILE}
                    noParsing={true}
                    height="300px"
                    readOnly={configOverrideView && !allowOverride}
                    onChange={handleEditorValueChange}
                >
                    <CodeEditor.Header>
                        <div className="flex dc__content-space w-100 fs-12 fw-6 cn-7">
                            {renderLanguageOptions(editorData)}
                            {(!configOverrideView || allowOverride) && (
                                <Tippy
                                    className="default-tt"
                                    arrow={false}
                                    placement="bottom"
                                    content={copied ? 'Copied!' : 'Copy'}
                                    trigger="mouseenter click"
                                    onShow={(_tippy) => {
                                        setTimeout(() => {
                                            _tippy.hide()
                                            setCopied(false)
                                        }, 5000)
                                    }}
                                    interactive={true}
                                >
                                    <Clipboard onClick={handleCopyToClipboard} className="icon-dim-16 cursor" />
                                </Tippy>
                            )}
                        </div>
                    </CodeEditor.Header>
                </CodeEditor>
            </div>
        </>
    )
}
