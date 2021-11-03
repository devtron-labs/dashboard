import React, { useEffect, useState } from 'react'
import { DefaultViewTabsJSON } from '../../../utils/tabUtils/tab.json';
import { iLink } from '../../../utils/tabUtils/tab.type';
import { TabActions, useTab } from '../../../utils/tabUtils/useTab';
import EventsComponent from './defaultViewActionTabs/Events.component';
import LogsComponent from './defaultViewActionTabs/Logs.component';
import ManifestComponent from './defaultViewActionTabs/Manifest.component';
import TerminalComponent from './defaultViewActionTabs/Terminal.component';
import './defaultViewTab.css';
import { NodeDetailTabs } from '../k8Resource/node.type';
import SummaryComponent from './defaultViewActionTabs/Summary.component';
import { useParams } from 'react-router';
import { NavLink } from 'react-router-dom';

function DefaultViewTabComponent() {

    const [{ tabs }, dispatch] = useTab(DefaultViewTabsJSON);
    const [selectedTab, setSelectedTab] = useState("")
    const params = useParams<{ action: string }>()

    const handleTabClick = (_tabName: string) => {
        dispatch({
            type: TabActions.MarkActive,
            tabName: _tabName
        })
        setSelectedTab(_tabName)
    }

    const tabData = () => {
        switch (selectedTab.toUpperCase()) {
            case NodeDetailTabs.MANIFEST:
                return <ManifestComponent />
            case NodeDetailTabs.LOGS:
                return <LogsComponent />
            case NodeDetailTabs.TERMINAL:
                return <TerminalComponent />
            case NodeDetailTabs.EVENTS:
                return <EventsComponent />
            case NodeDetailTabs.SUMMARY:
                return <SummaryComponent />
        }
    }

    useEffect(() => {
        if (params.action) {
            handleTabClick(params.action)
        }
    }, [params.action])

    return (
        <div>
            <div className="bcn-0 flex left top w-100 pl-20 border-bottom pr-20">
                {
                    tabs.map((tab: iLink, index) => {
                        return (
                            <div key={index + "resourceTreeTab"} className={`${tab.name.toLowerCase() === selectedTab.toLowerCase() ? 'default-tab-row' : ''} pt-6 pb-6 cursor pl-8 pr-8`}>
                                <NavLink to={`${tab.name.toLowerCase()}`} className=" no-decor flex left cn-7" onClick={() => handleTabClick(tab.name)}>
                                    <span className="default-tab-cell"> {tab.name.toLowerCase()}</span>
                                </NavLink>
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
