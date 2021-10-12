import React, { useState } from 'react';
import { useParams } from 'react-router';
import { FragmentHOC } from '../../../../../../common';
import { ReactComponent as Object } from '../../../../assets/icons/ic-object.svg';
import { NodeDetailTabs } from './eventsLogsTabs.types';
import Select, { components } from 'react-select';
import { multiSelectStyles, SingleSelectOption as Option, } from '../../../common/MultiSelect/MutiSelectCustomisation'
import CodeEditor from '../../../../../../CodeEditor/CodeEditor';

export default function EventsLogsTabsModal() {
    return (
        <div className=" mt-16 ">
            {/* <ResourceTreeTabs /> */}
        </div>
    )
}

export function EventsLogsTabSelector() {
    const params = useParams<{ appId: string; envId: string; tab?: NodeDetailTabs; kind?: NodeDetailTabs }>();
    return (<FragmentHOC style={{ boxShadow: 'inset 0 -1px 0 0 #d0d4d9' }}>
        <div className="events-logs__dropdown-selector w-100 bcn-0 left pl-24">
            <span className="events-logs__label"> Pod</span>
            <div className="w-200 mr-8" >
                <Select
                    placeholder='Select Pods'
                    closeMenuOnSelect
                    components={{
                        IndicatorSeparator: null,
                        Option
                    }}
                    options={
                        [
                            { label: "All Pods", value: "All Pods" },
                            { label: "All new Pods", value: "All new Pods" },
                            { label: "All old Pods", value: "All old Pods" }
                        ]
                    }
                    styles={{
                        ...multiSelectStyles,
                        control: (base, state) => ({ ...base, border: 'none', backgroundColor: 'transparent' }),
                        singleValue: (base, state) => ({ ...base, fontWeight: 600, color: '#06c' })
                    }}
                    isSearchable={false}
                />
            </div>
            <span className="events-logs__label"> Container</span>
            <div style={{ width: '200px' }}>
                <Select
                    placeholder='Select Container'
                    closeMenuOnSelect
                    components={{ IndicatorSeparator: null }}
                    options={
                        [
                            { label: "demo-1", value: "demo-1" },
                            { label: "shivani-demo", value: "shivani-demo" },
                            { label: "old Pods", value: "old Pods" }
                        ]
                    }
                    styles={{
                        // ...multiSelectStyles,
                        control: (base, state) => ({ ...base, border: 'none', backgroundColor: 'transparent' }),
                        singleValue: (base, state) => ({ ...base, fontWeight: 600, color: '#06c' })
                    }}
                    isSearchable={false}
                />
            </div>

        </div>
        <div>
            <CodeEditor
                theme='vs-gray--dt'
                height={400}
                // value={this.state.codeEditorPayload}
                mode="yaml"
            // onChange={(event) => { this.handleConfigChange(event) }}
            >
            </CodeEditor>
        </div>

    </FragmentHOC>)
}