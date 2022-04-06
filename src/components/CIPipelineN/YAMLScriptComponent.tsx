import React, { useState } from 'react'
import { ScriptType } from '../ciPipeline/types'
import CodeEditor from '../CodeEditor/CodeEditor'
import ReactSelect from 'react-select'

export function YAMLScriptComponent({
    editorValue,
    handleEditorValueChange,
}: {
    editorValue: string
    handleEditorValueChange: (string) => void
}) {
    const scriptTypeOptions: { label: string; value: string }[] = [ScriptType.SHELL, ScriptType.DOCKERFILE].map(
        (scriptType) => ({ label: scriptType, value: scriptType }),
    )
    const [selectedScriptType, setSelectedScriptType] = useState<{ label: string; value: string }>(scriptTypeOptions[0])
    const [selectedTab, setSelectedTab] = useState<string>('editor')

    const tempMultiSelectStyles = {
        control: (base, state) => ({
            ...base,
            boxShadow: 'none',
            minHeight: 'auto',
            border: 'none',
            width: 'max-content',
        }),
        option: (base, state) => {
            return {
                ...base,
                fontWeight: '500',
                color: 'var(--N900)',
                fontSize: '12px',
                padding: '5px 10px',
                minWidth: '200px',
            }
        },
        dropdownIndicator: (styles) => ({ ...styles, padding: 0 }),
        menu: (base, state) => {
            return {
                ...base,
                width: '150px',
            }
        },
    }
    return (
        <div>
            <div className="flexbox justify-space border-bottom-1-n2">
                <ul className="ml-20 tab-list">
                    <li
                        className={`mr-16 pt-5 pointer ${selectedTab === 'editor' ? 'active-tab cn-9 fw-6' : ''}`}
                        onClick={() => setSelectedTab('editor')}
                    >
                        <div>YAML editor</div>
                    </li>
                    <li
                        className={`mr-16 pt-5 pointer ${selectedTab === 'sample' ? 'active-tab cn-9 fw-6' : ''}`}
                        onClick={() => setSelectedTab('sample')}
                    >
                        <div>Sample YAML</div>
                    </li>
                </ul>

                <ReactSelect
                    defaultValue={selectedScriptType}
                    tabIndex={1}
                    onChange={(selectedValue) => {
                        setSelectedScriptType(selectedValue)
                    }}
                    options={scriptTypeOptions}
                    isSearchable={false}
                    styles={tempMultiSelectStyles}
                    components={{
                        IndicatorSeparator: null,
                    }}
                    menuPortalTarget={document.getElementById('visible-modal')}
                />
            </div>
            <CodeEditor value={editorValue} height={600} mode="yaml" onChange={handleEditorValueChange}></CodeEditor>
        </div>
    )
}
