import React, { useEffect, useState } from 'react'
import Tippy from '@tippyjs/react'
import ReactSelect from 'react-select'
import { MODES } from '../../config'
import CodeEditor from '../CodeEditor/CodeEditor'
import { copyToClipboard } from '../common'
import { showError, Progressing } from '@devtron-labs/devtron-fe-common-lib'
import {
    DropdownIndicator,
    Option,
    OptionWithIcon,
    ValueContainerWithIcon,
} from '../v2/common/ReactSelect.utils'
import { ReactComponent as Clipboard } from '../../assets/icons/ic-copy.svg'
import { ReactComponent as Dropdown } from '../../assets/icons/ic-chevron-down.svg'
import { ReactComponent as Reset } from '../../assets/icons/ic-arrow-anticlockwise.svg'
import { CIBuildType } from '../ciPipeline/types'
import { CICreateDockerfileOptionProps, FrameworkOptionType, LanguageOptionType, TemplateDataType } from './types'
import {
    checkOutPathControls,
    checkoutPathOption,
    renderOptionIcon,
    repositoryControls,
    repositoryOption
} from './CIBuildpackBuildOptions'
import { _customStyles, _multiSelectStyles } from './CIConfig.utils'

export default function CICreateDockerfileOption({
    configOverrideView,
    allowOverride,
    frameworks,
    sourceConfig,
    currentMaterial,
    selectedMaterial,
    handleFileLocationChange,
    currentCIBuildConfig,
    setCurrentCIBuildConfig,
    setInProgress,
    selectedBuildContextGitMaterial,
    handleBuildContextPathChange,
    currentBuildContextGitMaterial,
    ciConfig,
    formState,
    handleOnChangeConfig,
    renderInfoCard,
    isDefaultBuildContext,
    getCheckoutPathValue,
    handleBuildContextCheckoutPathChange,
    useRootBuildContextFlag,
    checkoutPathOptions,
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

    const handleGitRepoChange = (selectedMaterial) => {
        handleFileLocationChange(selectedMaterial)
    }
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
                 <Tippy
                     className="default-tt w-200"
                     arrow={false}
                     placement="top"
                     content="Dockerfile will be placed at the root of the selected repo path"
                 >
                    <span className={`fs-13 fw-4 lh-20 cn-7 ${configOverrideView && !allowOverride ? 'mr-8' : ''}`}>
                        Repo to place Dockerfile
                    </span>
                 </Tippy>

                {configOverrideView && !allowOverride ? (
                    <div className="flex left">
                        {selectedMaterial?.icon && (
                            <img
                                src={currentMaterial.icon}
                                alt={currentMaterial.label}
                                className="icon-dim-20 mr-8"
                            />
                        )}
                        <span className="fs-13 fw-6 lh-20 cn-9">{currentMaterial?.name}</span>
                    </div>
                ) : (
                    <ReactSelect
                        tabIndex={3}
                        isSearchable={false}
                        options={sourceConfig.material}
                        getOptionLabel={(option) => `${option.name}`}
                        getOptionValue={(option) => `${option.checkoutPath}`}
                        value={configOverrideView && !allowOverride ? currentMaterial : selectedMaterial}
                        styles={_customStyles}
                        components={{
                            IndicatorSeparator: null,
                            Option: repositoryOption,
                            Control: repositoryControls,
                        }}
                        onChange={handleGitRepoChange}
                        isDisabled={configOverrideView && !allowOverride}
                        classNamePrefix="build-config__select-repository-containing-code"
                    />
                )}
                <div className="h-22 dc__border-right-n1 mr-8 ml-8" />
                <span className="fs-13 fw-4 lh-20 cn-7 mr-8">Language</span>
                {configOverrideView && !allowOverride ? (
                    <div className="flex left" data-testid="select-create-dockerfile-language-dropdown">
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
                            classNamePrefix="select-create-dockerfile-language-dropdown"
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
                                    classNamePrefix="build-config__select-framework"
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

    const [isCollapsed, setIsCollapsed] = useState<boolean>(!isDefaultBuildContext())
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
    const toggleCollapse = (e) => {
        setIsCollapsed(!isCollapsed)
    }
    const editorData =
        templateData && selectedLanguage ? templateData[getTemplateKey(selectedLanguage, selectedFramework)] : null
    return (
        <>
            <div
                className={`create-dockerfile-option dc__border br-4 dc__overflow-hidden ${
                    configOverrideView ? 'mb-12' : 'mb-16'
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
            {window._env_.ENABLE_BUILD_CONTEXT && (!configOverrideView || allowOverride) && (
                <div className="flex left row ml-0 build-context-label fs-13 mb-6">
                    <span className="flex pointer" onClick={toggleCollapse}>
                        <Dropdown
                            className="icon-dim-26 rotate"
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
                            configOverrideView && !allowOverride ? 'Repository' : 'Select repository'
                        }  for BuildContext`}</label>
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
                                        : selectedBuildContextGitMaterial ? selectedBuildContextGitMaterial : currentMaterial
                                }
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
                            Build Context Path (Relative)
                        </label>
                        {configOverrideView && !allowOverride ? (
                            <span className="fs-14 fw-4 lh-20 cn-9">
                                {`${selectedBuildContextGitMaterial?.checkoutPath}/${
                                    ciConfig?.ciBuildConfig?.dockerBuildConfig?.buildContext
                                }`.replace('//', '/')}
                            </span>
                        ) : (
                            <div className="docker-file-container">
                                <ReactSelect
                                    className="m-0 w-25"
                                    classNamePrefix="build-config__select-checkout-path-for-build-context"
                                    tabIndex={4}
                                    isMulti={false}
                                    isClearable={false}
                                    isSearchable={false}
                                    options={checkoutPathOptions}
                                    getOptionLabel={(option) => `${option.label}`}
                                    getOptionValue={(option) => `${option.value}`}
                                    value={
                                        getCheckoutPathValue(selectedMaterial,currentMaterial,useRootBuildContextFlag)
                                    }
                                    styles={{
                                        ..._multiSelectStyles,
                                        menu: (base) => ({
                                            ...base,
                                            marginTop: '0',
                                            paddingBottom: '4px',
                                            width: checkoutPathOptions?.length === 2 && checkoutPathOptions[1].value.length > 3 ? '120px' : '100%',
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
                                        Control: checkOutPathControls,
                                    }}
                                    onChange={handleBuildContextCheckoutPathChange}
                                    isDisabled={configOverrideView && !allowOverride}
                                />
                                <input
                                    tabIndex={4}
                                    type="text"
                                    className="form__input file-name"
                                    data-testid="build-context-path-text-box"
                                    placeholder="Enter Path"
                                    name="buildContext"
                                    value={
                                        configOverrideView && !allowOverride
                                            ? ciConfig?.ciBuildConfig?.dockerBuildConfig?.buildContext || ''
                                            : formState.buildContext.value
                                    }
                                    onChange={handleOnChangeConfig}
                                    autoComplete={'off'}
                                    autoFocus={!configOverrideView}
                                    disabled={configOverrideView && !allowOverride}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
