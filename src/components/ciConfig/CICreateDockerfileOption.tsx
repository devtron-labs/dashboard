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

import { useEffect, useState } from 'react'
import { showError, Progressing, CIBuildType, ClipboardButton, CodeEditor } from '@devtron-labs/devtron-fe-common-lib'
import { MODES } from '../../config'
import CreateDockerFileLanguageOptions from './CreateDockerFileLanguageOptions'
import BuildContext from './BuildContext'
import { RootBuildContext } from './ciConfigConstant'
import { CICreateDockerfileOptionProps, FrameworkOptionType, LanguageOptionType, TemplateDataType } from './types'
import { getGitProviderIcon } from '@Components/common'

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
    setLoadingState,
    selectedBuildContextGitMaterial,
    currentBuildContextGitMaterial,
    ciConfig,
    formState,
    handleOnChangeConfig,
    isDefaultBuildContext,
    setSelectedBuildContextGitMaterial,
}: CICreateDockerfileOptionProps) {
    const [languages, setLanguages] = useState<LanguageOptionType[]>([])
    const [languageFrameworks, setLanguageFrameworks] = useState<Map<string, FrameworkOptionType[]>>()
    const [selectedLanguage, setSelectedLanguage] = useState<LanguageOptionType>()
    const [selectedFramework, setSelectedFramework] = useState<FrameworkOptionType>()
    const [templateData, setTemplateData] = useState<Record<string, TemplateDataType>>() // key: language-framework
    const [editorValue, setEditorValue] = useState<string>('')
    const controller = new AbortController()
    const { signal } = controller

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
                        startIcon: getGitProviderIcon(_framework.LanguageIcon)
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
                      startIcon: getGitProviderIcon(initIcon)
                  }
                : _languages[0]
            setSelectedLanguage(_selectedLanguage)

            const _frameworks = _languageFrameworks.get(
                currentCIBuildConfig.dockerBuildConfig.language || _languages[0].value.toString(),
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
            setLoadingState((prevState) => ({
                ...prevState,
                loading: true,
            }))
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
                    signal,
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
                        language: _selectedLanguage.value.toString(),
                        languageFramework: _selectedFramework.value,
                    },
                })
                setLoadingState((prevState) => ({
                    ...prevState,
                    loading: false,
                }))
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
                setLoadingState((prevState) => ({
                    ...prevState,
                    loading: false,
                }))
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

        const _selectedFramework = languageFrameworks.get(selected.value.toString())?.[0] || null
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
                language: selectedLanguage?.value.toString(),
                languageFramework: selectedFramework?.value,
            },
        })
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
                    noParsing
                    height="300px"
                    readOnly={configOverrideView && !allowOverride}
                    onChange={handleEditorValueChange}
                >
                    <CodeEditor.Header>
                        <div className="flex dc__content-space w-100 fs-12 fw-6 cn-7">
                            <CreateDockerFileLanguageOptions
                                editorData={editorData}
                                editorValue={editorValue}
                                handleGitRepoChange={handleGitRepoChange}
                                materialOptions={sourceConfig.material}
                                selectedMaterial={selectedMaterial}
                                languageFrameworks={languageFrameworks}
                                selectedLanguage={selectedLanguage}
                                resetChanges={resetChanges}
                                currentMaterial={currentMaterial}
                                languages={languages}
                                selectedFramework={selectedFramework}
                                handleLanguageSelection={handleLanguageSelection}
                                handleFrameworkSelection={handleFrameworkSelection}
                                readOnly={configOverrideView && !allowOverride}
                            />

                            {(!configOverrideView || allowOverride) && <ClipboardButton content={editorValue} />}
                        </div>
                    </CodeEditor.Header>
                </CodeEditor>
            </div>

            {window._env_.ENABLE_BUILD_CONTEXT && (
                <BuildContext
                    readOnly={configOverrideView && !allowOverride}
                    isDefaultBuildContext={isDefaultBuildContext()}
                    configOverrideView={configOverrideView}
                    sourceConfig={sourceConfig}
                    selectedBuildContextGitMaterial={selectedBuildContextGitMaterial}
                    currentMaterial={currentMaterial}
                    setSelectedBuildContextGitMaterial={setSelectedBuildContextGitMaterial}
                    repositoryError={formState.repository.error}
                    handleOnChangeConfig={handleOnChangeConfig}
                    buildContextValue={formState.buildContext.value}
                    currentCIBuildConfig={currentCIBuildConfig}
                    formState={formState}
                    setCurrentCIBuildConfig={setCurrentCIBuildConfig}
                    currentBuildContextGitMaterial={currentBuildContextGitMaterial}
                    readOnlyBuildContextPath={`${
                        ciConfig?.ciBuildConfig?.useRootBuildContext
                            ? RootBuildContext
                            : selectedBuildContextGitMaterial?.checkoutPath
                    }/${ciConfig?.ciBuildConfig?.dockerBuildConfig?.buildContext || ''}`.replace('//', '/')}
                />
            )}
        </>
    )
}
