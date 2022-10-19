import React, { useEffect, useState } from 'react'
import ReactSelect from 'react-select'
import { MODES } from '../../config'
import { OptionType } from '../app/types'
import CodeEditor from '../CodeEditor/CodeEditor'
import { showError } from '../common'
import { DropdownIndicator, getCommonSelectStyle, Option } from '../v2/common/ReactSelect.utils'

interface FrameworkOptionType extends OptionType {
    templateUrl: string
}

interface TemplateDataType {
    fetching: boolean
    data: string
}

export default function CICreateDockerfileOption({ configOverrideView, allowOverride, frameworks }) {
    const [languages, setLanguages] = useState<OptionType[]>([])
    const [languageFrameworks, setLanguageFrameworks] = useState<Map<string, FrameworkOptionType[]>>()
    const [selectedLanguage, setSelectedLanguage] = useState<OptionType>()
    const [selectedFramework, setSelectedFramework] = useState<FrameworkOptionType>()
    const [templateData, setTemplateData] = useState<Record<string, TemplateDataType>>() // key: language-framework

    useEffect(() => {
        if (frameworks.length > 0) {
            const _languageFrameworks = new Map<string, FrameworkOptionType[]>()
            for (const _framework of frameworks) {
                if (!_languageFrameworks.has(_framework.Language)) {
                    const _frameworksList = frameworks
                        .filter((f) => f.Language === _framework.Language)
                        .map((lf) => ({
                            label: lf.Framework,
                            value: lf.Framework,
                            templateUrl: _framework.TemplateUrl,
                        }))
                    _languageFrameworks.set(_framework.Language, _frameworksList)
                }
            }

            const _languages = [..._languageFrameworks.keys()].map((_lang) => ({
                label: _lang,
                value: _lang,
            }))
            setLanguages(_languages)
            setLanguageFrameworks(_languageFrameworks)
            setSelectedLanguage(_languages[0])

            const _selectedFramework = _languageFrameworks.get(_languages[0].value)[0]
            setSelectedFramework(_selectedFramework)
            getTemplateData(_languages[0], _selectedFramework)
        }
    }, [frameworks])

    const getTemplateData = async (_selectedLanguage, _selectedFramework) => {
        const templateKey = `${_selectedLanguage?.value}-${_selectedFramework?.value}`
        if (_selectedFramework?.templateUrl) {
            setTemplateData({
                ...templateData,
                [templateKey]: {
                    fetching: true,
                    data: '',
                },
            })

            try {
                const respData = await fetch(_selectedFramework.templateUrl).then((res) => {
                    return res.text()
                })

                setTemplateData({
                    ...templateData,
                    [templateKey]: {
                        fetching: false,
                        data: respData,
                    },
                })
            } catch (err) {
                showError(err)
            }
        } else {
            setTemplateData({
                ...templateData,
                [templateKey]: {
                    fetching: false,
                    data: '',
                },
            })
        }
    }

    const handleLanguageSelection = (selected) => {
        setSelectedLanguage(selected)

        const _selectedFramework = languageFrameworks.get(selected.value)?.[0] || null
        setSelectedFramework(_selectedFramework)
        getTemplateData(selected, _selectedFramework)
    }

    const handleFrameworkSelection = (selected) => {
        setSelectedFramework(selected)
        getTemplateData(selectedLanguage, selected)
    }

    const customStyles = {
        control: (base) => ({
            ...base,
            border: 'none',
            boxShadow: 'none',
            minHeight: '32px',
        }),
        option: (base, state) => ({
            ...base,
            color: 'var(--N900)',
            backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
        }),
        menu: (base) => ({
            ...base,
            marginTop: '2px',
            minWidth: '240px',
        }),
        menuList: (base) => ({
            ...base,
            position: 'relative',
            paddingBottom: 0,
            paddingTop: 0,
            maxHeight: '250px',
        }),
        dropdownIndicator: (base, state) => ({
            ...base,
            padding: 0,
            color: 'var(--N400)',
            transition: 'all .2s ease',
            transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        }),
        noOptionsMessage: (base) => ({
            ...base,
            color: 'var(--N600)',
        }),
    }

    const renderLanguageOptions = () => {
        return (
            <div className="flex">
                <ReactSelect
                    className="mr-12"
                    tabIndex={3}
                    options={languages}
                    value={selectedLanguage}
                    isSearchable={false}
                    styles={customStyles}
                    components={{
                        IndicatorSeparator: null,
                        DropdownIndicator,
                        Option,
                    }}
                    onChange={handleLanguageSelection}
                    isDisabled={configOverrideView && !allowOverride}
                />
                {languageFrameworks?.get(selectedLanguage?.value)?.[0]?.value && (
                    <ReactSelect
                        className="m-0"
                        tabIndex={3}
                        options={languageFrameworks?.get(selectedLanguage?.value) || []}
                        value={selectedFramework}
                        isSearchable={false}
                        styles={customStyles}
                        components={{
                            IndicatorSeparator: null,
                            DropdownIndicator,
                            Option,
                        }}
                        onChange={handleFrameworkSelection}
                        isDisabled={configOverrideView && !allowOverride}
                    />
                )}
            </div>
        )
    }

    const editorData = templateData?.[`${selectedLanguage?.value}-${selectedFramework?.value}`]
    return (
        <div className="create-dockerfile-option dc__border br-4 mb-16 dc__overflow-hidden">
            <CodeEditor loading={editorData?.fetching} value={editorData?.data} mode={MODES.DOCKERFILE} height="200px" readOnly={configOverrideView && !allowOverride}>
                <CodeEditor.Header>
                    <div className="flex fs-12 fw-6 cn-7">{renderLanguageOptions()}</div>
                </CodeEditor.Header>
            </CodeEditor>
            <div></div>
        </div>
    )
}
