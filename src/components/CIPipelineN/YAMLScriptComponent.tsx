import React, { useState } from 'react'
import { ScriptType } from '../ciPipeline/types'
import CodeEditor from '../CodeEditor/CodeEditor'
import ReactSelect from 'react-select'
import { yamlEditorSelectStyle } from './ciPipeline.utils'
import { OptionType } from '../app/types'

export function YAMLScriptComponent({
    editorValue,
    handleEditorValueChange,
    showSample,
    height,
}: {
    editorValue: string
    handleEditorValueChange: (string) => void
    showSample?: boolean
    height?: string
}) {
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
                        menuPortalTarget={document.getElementById('visible-modal')}
                    />
                )}
            </div>
            <CodeEditor
                value={editorValue}
                height={height ? height : 'calc(100vh - 200px)'}
                mode="yaml"
                onChange={handleEditorValueChange}
            ></CodeEditor>
        </div>
    )
}
