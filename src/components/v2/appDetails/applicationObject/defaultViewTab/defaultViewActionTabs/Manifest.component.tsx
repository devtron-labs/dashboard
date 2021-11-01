import React, { useEffect, useState } from 'react'
import CodeEditor from '../../../../../CodeEditor/CodeEditor';
import { ManifestTabJSON } from '../../../../utils/tabUtils/tab.json';
import { iTab } from '../../../../utils/tabUtils/tab.type';
import { TabActions, useTab } from '../../../../utils/tabUtils/useTab';
import { ReactComponent as Edit } from '../../../../../../assets/icons/ic-edit.svg';

function ManifestComponent() {

    const [{ tabs }, dispatch] = useTab(ManifestTabJSON);
    const [selectedTab, setSelectedTab] = useState("")


    const handleTabClick = (_tabName: string) => {
        dispatch({
            type: TabActions.MarkActive,
            tabName: _tabName
        })
        setSelectedTab(_tabName)
    }

    const tabData = () => {
        switch (selectedTab) {
            // case "K8 Resources":
            //     return <K8ResourceComponent
            //         addResourceTabClick={addResourceTabClick}
            //     />
            // case "Log Analyzer":
            //     return <LogAnalyzerComponent />
            // default:
            //     return <DefaultViewTabComponent data={defaultViewData} />
        }
    }

    const renderCodeEditor = () => {
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

    useEffect(() => {
        handleTabClick(ManifestTabJSON[0].name)
    }, [])


    return (
        <div className="bcn-0">
            <div className="flex left pl-20 pr-20 border-bottom">
                {
                    tabs.map((tab: iTab, index) => {
                        return (
                            <div key={index + "tab"} className={`cursor pl-4 pt-8 pb-8 pr-4`}>
                                <div className={`${tab.isSelected ? 'selected-manifest-tab cn-0' : ' bcn-1'} bw-1 pl-6 pr-6 br-4 en-2 no-decor flex left`} onClick={() => handleTabClick(tab.name)}>
                                    {tab.name}
                                </div>
                            </div>
                        )
                    })
                }
                <div className="pl-16 pr-16">|</div>
                <div className="flex left cb-5">
                    <Edit className="icon-dim-16 pr-4 fc-5" /> Edit Live Manifest
                </div>
            </div>
            {renderCodeEditor()}
        </div>
    )
}

export default ManifestComponent
