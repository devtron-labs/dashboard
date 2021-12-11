import React, { useState } from 'react'
import CodeEditor from '../../../CodeEditor/CodeEditor';
import Select from 'react-select';
import { multiSelectStyles, SingleSelectOption as Option, } from '../../common/ReactSelectCustomization'
import { useEffect } from 'react';
import AppDetailsStore, { AppDetailsTabs } from '../appDetails.store';
import LogsComponent from '../k8Resource/nodeDetail/NodeDetailTabs/Logs.component';
import IndexStore from '../index.store';
import { useParams, useRouteMatch } from 'react-router';


function LogAnalyzerComponent() {
    const [selectedTabName, setSelectedTabName] = useState("")
    const { url } = useRouteMatch()
    const params = useParams<{ actionName: string, podName: string, nodeType: string }>()

    useEffect(() => {
        AppDetailsStore.markAppDetailsTabActive(AppDetailsTabs.log_analyzer)
    }, [])

    const handleSelectedTab = (_tabName: string) => {
        setSelectedTabName(_tabName)
        IndexStore.setActiveNodeDetailTab(params.nodeType)
        AppDetailsStore.markAppDetailsTabActive(_tabName, url)
    }

    const renderFilters = () => {
        return <div className=" row bcn-0 pl-20 pr-20 pt-6 pb-6 border-bottom flex flex-justify">
            <div className="flex left col-md-8">
                <div className="flexbox pr-8 border-right ">
                    <span style={{ paddingTop: '4px' }} >Pod</span>
                    <div style={{ minWidth: '145px' }}>
                        <Select
                            className="br-4 pl-8"
                            // options={Array.isArray(environments) ? environments.map(env => ({ label: env.environmentName, value: env.environmentId })) : []}
                            placeholder='All Pods'
                            // value={envId ? { value: +envId, label: environmentName } : null}
                            // onChange={(selected, meta) => selectEnvironment((selected as any).value)}
                            closeMenuOnSelect
                            // components={{ IndicatorSeparator: null, Option, DropdownIndicator: disabled ? null : components.DropdownIndicator }}
                            styles={{
                                ...multiSelectStyles,
                                control: (base, state) => ({ ...base, border: '1px solid #0066cc', backgroundColor: 'transparent', minHeight: '24px !important' }),
                                singleValue: (base, state) => ({ ...base, fontWeight: 600, color: '#06c' }),
                                valueContainer: (provided, state) => ({
                                    ...provided,
                                    height: '20px',
                                }),
                                indicatorsContainer: (provided, state) => ({
                                    ...provided,
                                    height: '20px',
                                }),

                            }}
                            // isDisabled={disabled}
                            isSearchable={false}
                        />
                    </div>
                </div>
                <div className="flexbox ml-8">
                    <span style={{ paddingTop: '4px' }}>Container</span>
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
                                control: (base, state) => ({ ...base, border: '1px solid #0066cc', backgroundColor: 'transparent', minHeight: '24px !important' }),
                                singleValue: (base, state) => ({ ...base, fontWeight: 600, color: '#06c' }),
                                indicatorsContainer: (provided, state) => ({
                                    ...provided,
                                    height: '24px',
                                }),
                            }}
                            // isDisabled={disabled}
                            isSearchable={false}
                        />
                    </div>
                </div>
            </div>
            <div className="col-md-4"><input className="w-100 bcn-1 en-2 bw-0 pl-8 pt-6 pb-6 pr-8" type="text" placeholder="find or grepin logs" /></div>
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
            {/* {renderFilters()}
            {renderCodeEditorAnalyzer()} */}
            <div className=" pl-20 pr-20" style={{ minHeight: '600px', background: 'black' }}>
                {/* <LogsComponent selectedTab={handleSelectedTab} /> */}
            </div>
        </div>
    )
}

export default LogAnalyzerComponent
