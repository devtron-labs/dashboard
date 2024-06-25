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

import React, { useState } from 'react'
import ReactSelect from 'react-select'
import { ScriptType } from '@devtron-labs/devtron-fe-common-lib'
import CodeEditor from '../CodeEditor/CodeEditor'
import { yamlEditorSelectStyle } from './ciPipeline.utils'
import { OptionType } from '../app/types'

/**
 * @deprecated - Not getting used anywhere
 */
export const YAMLScriptComponent = ({
    editorValue,
    handleEditorValueChange,
    showSample,
    height,
}: {
    editorValue: string
    handleEditorValueChange: (string) => void
    showSample?: boolean
    height?: string
}) => {
    const scriptTypeOptions: OptionType[] = [ScriptType.SHELL, ScriptType.CONTAINERIMAGE].map((scriptType) => ({
        label: scriptType,
        value: scriptType,
    }))
    const [selectedScriptType, setSelectedScriptType] = useState<OptionType>(scriptTypeOptions[0])
    const [selectedTab, setSelectedTab] = useState<string>('editor')

    return (
        <div>
            <div className="flexbox justify-space border-bottom-1-n2">
                <ul className="ml-20 tab-list">
                    <li
                        className={`mr-16 pointer ${selectedTab === 'editor' ? 'active-tab cn-9 fw-6' : ''}`}
                        onClick={() => setSelectedTab('editor')}
                    >
                        <div>YAML editor</div>
                    </li>
                    {showSample && (
                        <li
                            className={`mr-16 pointer ${selectedTab === 'sample' ? 'active-tab cn-9 fw-6' : ''}`}
                            onClick={() => setSelectedTab('sample')}
                        >
                            <div>Sample YAML</div>
                        </li>
                    )}
                </ul>

                {showSample && (
                    <ReactSelect
                        defaultValue={selectedScriptType}
                        tabIndex={1}
                        onChange={(selectedValue) => {
                            setSelectedScriptType(selectedValue)
                        }}
                        options={scriptTypeOptions}
                        isSearchable={false}
                        styles={yamlEditorSelectStyle}
                        components={{
                            IndicatorSeparator: null,
                        }}
                        menuPosition="fixed"
                    />
                )}
            </div>
            <CodeEditor
                value={editorValue}
                height={height || 'calc(100vh - 200px)'}
                mode="yaml"
                onChange={handleEditorValueChange}
            />
        </div>
    )
}
