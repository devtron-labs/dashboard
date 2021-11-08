import React from 'react'
import CodeEditor from '../../../../CodeEditor/CodeEditor';
import Select, { components } from 'react-select';
import { multiSelectStyles, SingleSelectOption as Option, } from '../../../../common'

function LogAnalyzerComponent(props) {

    const renderFilters = () => {
        return <div className=" row bcn-0 pl-20 pr-20 pt-6 pb-6 border-bottom flex flex-justify">
            <div className="flex left col-md-6">
                <div className="flexbox pr-8">
                    Pod
                    <div style={{ minWidth: '145px' }}>
                        <Select
                            className="br-4 pl-8"
                            // options={Array.isArray(environments) ? environments.map(env => ({ label: env.environmentName, value: env.environmentId })) : []}
                            placeholder='All Pods'
                            // value={envId ? { value: +envId, label: environmentName } : null}
                            // onChange={(selected, meta) => selectEnvironment((selected as any).value)}
                            closeMenuOnSelect
                            // components={{ IndicatorSeparator: null, Option, DropdownIndicator: disabled ? null : components.DropdownIndicator }}
                            // styles={{
                            //     ...multiSelectStyles,
                            //     control: (base, state) => ({ ...base, border: '1px solid #0066cc', backgroundColor: 'transparent' }),
                            //     singleValue: (base, state) => ({ ...base, fontWeight: 600, color: '#06c' })
                            // }}
                            // isDisabled={disabled}
                            isSearchable={false}
                        />
                    </div>
                </div>
                <div className="flexbox">Container
                <div style={{ minWidth: '145px' }}>
                        <Select
                            className="br-4 pl-8"
                            // options={Array.isArray(environments) ? environments.map(env => ({ label: env.environmentName, value: env.environmentId })) : []}
                            placeholder='All Containers'
                            // value={envId ? { value: +envId, label: environmentName } : null}
                            // onChange={(selected, meta) => selectEnvironment((selected as any).value)}
                            closeMenuOnSelect
                            // components={{ IndicatorSeparator: null, Option, DropdownIndicator: disabled ? null : components.DropdownIndicator }}
                            styles={{
                                ...multiSelectStyles,
                                control: (base, state) => ({ ...base, border: '1px solid #0066cc', backgroundColor: 'transparent', height: '20px' }),
                                singleValue: (base, state) => ({ ...base, fontWeight: 600, color: '#06c' })
                            }}
                            // isDisabled={disabled}
                            isSearchable={false}
                        />
                    </div>
                </div>
            </div>
            <div className="col-md-6"><input className="w-100" type="text" placeholder="find or grepin logs" /></div>
        </div>
    }

    const renderCodeEditorAnalyzer = () => {
        return <div>
            <CodeEditor
                theme='vs-gray--dt'
                height={500}
                // value={this.state.codeEditorPayload}
                mode="yaml"
            // onChange={(event) => { this.handleConfigChange(event) }}
            >
            </CodeEditor>
        </div>
    }

    return (
        <div>
            {renderFilters()}
            {renderCodeEditorAnalyzer()}
        </div>
    )
}

export default LogAnalyzerComponent
