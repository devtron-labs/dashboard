import React, { useEffect, useState } from 'react'
import CodeEditor from '../../../../CodeEditor/CodeEditor'
import { DefaultViewTabsJSON } from '../../../utils/tabUtils/tab.json';
import { iTab } from '../../../utils/tabUtils/tab.type';
import { TabActions, useTab } from '../../../utils/tabUtils/useTab';
import EventsComponent from './defaultViewActionTabs/Events.component';
import LogsComponent from './defaultViewActionTabs/Logs.component';
import ManifestComponent from './defaultViewActionTabs/Manifest.component';
import TerminalComponent from './defaultViewActionTabs/Terminal.component';
import './defaultViewTab.css';
import { NodeDetailTabs } from '../k8Resource/node.type';
import SummaryComponent from './defaultViewActionTabs/Summary.component';

function DefaultViewTabComponent(props) {

    const [{ tabs }, dispatch] = useTab(DefaultViewTabsJSON);
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
            case NodeDetailTabs.MANIFEST:
                return <ManifestComponent />
            case NodeDetailTabs.LOGS:
                return <LogsComponent />
            case NodeDetailTabs.TERMINAL:
                return <TerminalComponent />
            case NodeDetailTabs.EVENTS:
                return <EventsComponent />
            case NodeDetailTabs.SUMMARY:
                return <SummaryComponent 
                appName={"something"}
                environmentName={ "environment Name"}
                nodeName="Container"
                // nodes={}
                />
        }
    }

    useEffect(() => {
        setSelectedTab(NodeDetailTabs.MANIFEST)
    }, [])

    return (
        <div>
            <div className="bcn-0 flex left top w-100 pl-20 border-bottom pr-20">
                {
                    tabs.map((tab: iTab, index) => {
                        return (
                            <div key={index + "resourceTreeTab"} className={`${tab.isSelected ? 'default-tab-row' : ''} pt-6 pb-6 cursor pl-8 pr-8`}>
                                <a className=" no-decor flex left cn-7" onClick={() => handleTabClick(tab.name)}>
                                    <span className="default-tab-cell"> {tab.name.toLowerCase()}</span>
                                </a>
                            </div>
                        )
                    })
                }

            </div>
            <div>
                {selectedTab && tabData()}
            </div>
        </div>
    )
}

export default DefaultViewTabComponent
