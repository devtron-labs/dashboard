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

import { FunctionComponent } from 'react'
import Tippy from '@tippyjs/react'
import ReactSelect from 'react-select'
import { repositoryControls, repositoryOption } from './CIBuildpackBuildOptions'
import { DropdownIndicator, Option, OptionWithIcon, ValueContainerWithIcon } from '../v2/common/ReactSelect.utils'
import { _customStyles } from './CIConfig.utils'
import { CREATE_DOCKER_FILE_LANGUAGE_OPTIONS_TEXT } from './ciConfigConstant'
import { CreateDockerFileLanguageOptionsProps, ResetEditorChangesProps } from './types'
import { ReactComponent as Reset } from '../../assets/icons/ic-arrow-anticlockwise.svg'

const Title: FunctionComponent = () => {
    return (
        <Tippy
            className="default-tt w-200"
            arrow={false}
            placement="top"
            content={CREATE_DOCKER_FILE_LANGUAGE_OPTIONS_TEXT.TITLE_INFO}
        >
            <span className="fs-13 fw-4 lh-20 cn-7 mr-8">{CREATE_DOCKER_FILE_LANGUAGE_OPTIONS_TEXT.TITLE}</span>
        </Tippy>
    )
}

const ResetEditorChanges: FunctionComponent<ResetEditorChangesProps> = ({ resetChanges, editorData, editorValue }) => {
    const showReset = !editorData?.fetching && editorData?.data !== editorValue
    if (!showReset) {
        return null
    }

    return (
        <>
            <div className="h-22 dc__border-right-n1 mr-8 ml-8" />
            <button
                className="flex left p-0 dc__no-background dc__no-border dc__outline-none-imp"
                onClick={resetChanges}
                type="button"
            >
                <div className="icon-dim-12 flex">
                    <Reset className="icon-dim-12" />
                </div>
                <span className="ml-4">Reset changes</span>
            </button>
        </>
    )
}

export const CreateDockerFileLanguageOptions: FunctionComponent<CreateDockerFileLanguageOptionsProps> = ({
    editorData,
    editorValue,
    handleGitRepoChange,
    materialOptions,
    selectedMaterial,
    languageFrameworks,
    selectedLanguage,
    resetChanges,
    currentMaterial,
    languages,
    selectedFramework,
    handleLanguageSelection,
    handleFrameworkSelection,
    readOnly,
}) => {
    const selectedLanguageFrameworks = languageFrameworks?.get(selectedLanguage?.value)
    if (readOnly) {
        return (
            <div className="flex">
                <Title />

                {/* TODO: Look into this condition, this won't ever be true since we derive icon from url  */}
                <div className="flex left">
                    {selectedMaterial?.icon && (
                        <img src={currentMaterial.icon} alt={currentMaterial.label} className="icon-dim-20 mr-8" />
                    )}
                    <span className="fs-13 fw-6 lh-20 cn-9">{currentMaterial?.name}</span>
                </div>

                <div className="h-22 dc__border-right-n1 mr-8 ml-8" />
                <span className="fs-13 fw-4 lh-20 cn-7 mr-8">Language</span>

                <div className="flex left" data-testid="select-create-dockerfile-language-dropdown">
                    {selectedLanguage?.icon && (
                        <img src={selectedLanguage.icon} alt={selectedLanguage.label} className="icon-dim-20 mr-8" />
                    )}
                    <span className="fs-13 fw-6 lh-20 cn-9">{selectedLanguage?.label}</span>
                </div>

                {selectedLanguageFrameworks?.[0]?.value && (
                    <>
                        <div className="h-22 dc__border-right-n1 mr-8 ml-8" />
                        <span className="fs-13 fw-4 lh-20 cn-7 mr-8">Framework</span>
                        <span className="fs-13 fw-6 lh-20 cn-9">{selectedFramework?.label}</span>
                    </>
                )}

                <ResetEditorChanges resetChanges={resetChanges} editorData={editorData} editorValue={editorValue} />
            </div>
        )
    }

    return (
        <div className="flex">
            <Title />
            <ReactSelect
                isSearchable={false}
                options={materialOptions}
                getOptionLabel={(option) => `${option.name}`}
                getOptionValue={(option) => `${option.checkoutPath}`}
                value={selectedMaterial}
                styles={_customStyles}
                components={{
                    IndicatorSeparator: null,
                    Option: repositoryOption,
                    Control: repositoryControls,
                }}
                onChange={handleGitRepoChange}
                classNamePrefix="build-config__select-repository-containing-code"
            />

            {/* // TODO: Will be deleting this code after testing */}
            {/* <SelectPicker
                inputId="select-repository-containing-dockerfile"
                name="select-repository-containing-dockerfile"
                label="Select repository containing Dockerfile"
                classNamePrefix="build-config__select-repository-containing-dockerfile"
                isClearable={false}
                options={getGitRepositoryOptions(materialOptions)}
                value={getSelectedMaterialValue(selectedMaterial)}
                onChange={handleGitRepoChange}
                size={ComponentSizeType.large}
                variant={SelectPickerVariantType.BORDER_LESS}
            /> */}

            <div className="h-22 dc__border-right-n1 mr-8 ml-8" />
            <span className="fs-13 fw-4 lh-20 cn-7 mr-8">Language</span>
            <ReactSelect
                classNamePrefix="select-create-dockerfile-language-dropdown"
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
            />

            {/* // TODO: Will be deleting this code after testing */}
            {/* <SelectPicker
                inputId="select-create-dockerfile-language-dropdown"
                name="select-create-dockerfile-language-dropdown"
                label="Language"
                classNamePrefix="select-create-dockerfile-language-dropdown"
                options={getLanguageOptions(languages)}
                value={getSelectedLanguageValue(selectedLanguage)}
                isSearchable={false}
                onChange={handleLanguageSelection}
            /> */}
            {selectedLanguageFrameworks?.[0]?.value && (
                <>
                    <div className="h-22 dc__border-right-n1 mr-8 ml-8" />
                    <span className="fs-13 fw-4 lh-20 cn-7 mr-8">Framework</span>

                    <ReactSelect
                        options={selectedLanguageFrameworks || []}
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
                    />

                    {/* // TODO: Will be deleting this code after testing */}
                    {/* <SelectPicker
                        inputId="build-config__select-framework"
                        name="build-config__select-framework"
                        label="Framework"
                        classNamePrefix="build-config__select-framework"
                        options={getLanguageOptions(languages)}
                        value={selectedFramework}
                        isSearchable={false}
                        onChange={handleFrameworkSelection}
                    /> */}
                </>
            )}
            <ResetEditorChanges resetChanges={resetChanges} editorData={editorData} editorValue={editorValue} />
        </div>
    )
}

export default CreateDockerFileLanguageOptions
