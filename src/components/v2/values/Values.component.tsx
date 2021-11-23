import { versions } from 'process'
import React, { useRef, useState } from 'react'
import { ChartValuesSelect } from '../../charts/util/ChartValueSelect'
import CodeEditor from '../../CodeEditor/CodeEditor'
import { Select } from '../../common'
import ReactSelect from 'react-select';
import { styles, menuList, DropdownIndicator } from '../../charts/charts.util';
import AsyncSelect from 'react-select/async';
import '../../charts/modal/DeployChart.scss';

function ValuesComponent() {
    const deployChartForm = useRef(null);
    let environmentId = 1
    let teamId = 1
    let isUpdate = environmentId && teamId;
    const [appName, setAppName] = useState('')

    return (
        // <div className="container-fluid ">
        //     <div className="row justify-content-center">
                    <div className="deploy-chart-container readmeCollapsed " >
                        {/* <div className="header-container flex column bcn-0 pt-16 pb-16">
                            <div className="title">prometheus-community/alert</div>
                            <div className="border" />
                        </div> */}
                        <div className="deploy-chart-body bcn-0 m-auto ">
                            <div className="overflown" ref={deployChartForm}>
                                <div className="hide-scroll">
                                    <label className="form__row form__row--w-100">
                                        <span className="form__label">App Name</span>
                                        <input autoComplete="off" tabIndex={1} placeholder="App name" className="form__input"
                                            value={appName} autoFocus disabled={!!isUpdate} onChange={e => setAppName(e.target.value)} />
                                    </label>
                                    <label className="form__row form__row--w-100">
                                        <span className="form__label">Project</span>
                                        <ReactSelect
                                            components={{
                                                IndicatorSeparator: null,
                                                DropdownIndicator
                                            }}
                                            placeholder="Select Project"
                                            // value={selectedProject}
                                            styles={{
                                                ...styles,
                                                ...menuList,
                                            }}
                                        // onChange={selectProject}
                                        // options={projects}
                                        />
                                    </label>
                                    <div className="form__row form__row--w-100">
                                        <span className="form__label">Environment</span>
                                        <ReactSelect
                                            components={{
                                                IndicatorSeparator: null,
                                                DropdownIndicator
                                            }}
                                            // isDisabled={!!isUpdate}
                                            placeholder="Select Environment"
                                            // value={selectedEnvironment}
                                            styles={{
                                                ...styles,
                                                ...menuList,
                                            }}
                                        // onChange={selectEnvironment}
                                        // options={environments}
                                        />
                                    </div>
                                    {
                                        isUpdate &&
                                        <div className="form__row form__row--w-100">
                                            <span className="form__label">Repo/Chart</span>
                                            {/* <AsyncSelect
                                    cacheOptions
                                    // defaultOptions={repoChartOptions}
                                    // formatOptionLabel={repoChartSelectOptionLabel}
                                    // value={repoChartValue}
                                    // loadOptions={repoChartLoadOptions}
                                    // onFocus={handlerepoChartFocus}
                                    // onChange={handleRepoChartValueChange}
                                    components={{
                                        IndicatorSeparator: () => null,
                                        // Option: repoChartOptionLabel
                                    }}
                                    styles={{
                                        control: (base, state) => ({
                                            ...base,
                                            boxShadow: 'none',
                                            border: state.isFocused ? '1px solid var(--B500)' : '1px solid var(--N500)',
                                            cursor: 'pointer'
                                        }),
                                        option: (base, state) => {
                                            return ({
                                                ...base,
                                                color: 'var(--N900)',
                                                backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
                                                padding: '10px 12px'
                                            })
                                        },
                                    }}
                                /> */}
                                        </div>
                                    }
                                    <div className="form__row form__row--flex form__row--w-100">
                                        {
                                            isUpdate === null ?
                                                <div className="w-50">
                                                    <span className="form__label">Chart Version</span>
                                                    <Select tabIndex={4}
                                                        rootClassName="select-button--default"
                                                        // value={selectedVersion}
                                                        onChange={event => { }}
                                                    >
                                                    </Select>
                                                </div>
                                                :
                                                <div className="w-50">
                                                    <span className="form__label">Chart Version</span>
                                                    <Select tabIndex={4}
                                                        rootClassName="select-button--default"
                                                        // value={selectedVersion}
                                                        onChange={event => { }}
                                                    >
                                                    </Select>
                                                </div>
                                        }
                                        <span className="mr-16"></span>
                                        <div className="w-50">
                                            <span className="form__label">Chart Values*</span>
                                            {/* <ChartValuesSelect 
                                chartValuesList={[]} 
                                // chartValues={} 
                                redirectToChartValues={redirectToChartValues}
                                    onChange={(event) => { setChartValues(event) }}
                                     /> */}
                                        </div>
                                    </div>
                                    <div className="code-editor-container">
                                        <CodeEditor
                                            // value={textRef}
                                            noParsing
                                            mode="yaml"
                                        // onChange={value => { setTextRef(value) }}
                                        >
                                            <CodeEditor.Header>
                                                <span className="bold">values.yaml</span>
                                            </CodeEditor.Header>
                                        </CodeEditor>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
        //         </div>
        // </div>
    )
}

export default ValuesComponent
