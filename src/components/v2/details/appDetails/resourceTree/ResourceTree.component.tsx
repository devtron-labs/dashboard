import React, { useState, useEffect } from 'react';
import K8ResourceComponent from '../k8Resource/K8Resource.component';
import { iTab } from '../utils/tabUtils/tab.type';
import { TabActions, useTab } from '../utils/tabUtils/useTab';
import './resourceTree.css'
import { ReactComponent as K8Resource } from '../../../../../assets/icons/ic-object.svg';
import { ReactComponent as LogAnalyser } from '../../../../../assets/icons/ic-logs.svg';
import LogAnalyzerComponent from '../logAnalyzer/LogAnalyzer.component';
import { tCell } from '../utils/tableUtils/table.type';
import { NodeDetailTabsType } from '../../../../app/types';
import DefaultViewTabComponent from '../defaultViewTab/DefaultViewTab.component';
import { ResourceTabsJSON } from '../utils/tabUtils/tab.json';


function ResourceTreeComponent() {

    const [{ tabs }, dispatch] = useTab(ResourceTabsJSON);
    const [selectedTab, setSelectedTab] = useState("")
    const [defaultViewData, setDefaultViewData] = useState({})

    const addResourceTabClick = (ndtt: NodeDetailTabsType, cell: tCell) => {
        
        dispatch({
            type: TabActions.AddTab,
            tabName: ndtt.valueOf().toString()
        })

        setDefaultViewData({
            cell: cell,
            ndtt: ndtt,
        })

        setSelectedTab(ndtt.valueOf().toString())
    }

    const handleTabClick = (_tabName: string) => {
        dispatch({
            type: TabActions.MarkActive,
            tabName: _tabName
        })
        setSelectedTab(_tabName)
    }

    const tabData = () => {
        switch (selectedTab) {
            case "K8 Resources":
                return <K8ResourceComponent
                    addResourceTabClick={addResourceTabClick}
                />
            case "Log Analyzer":
                return <LogAnalyzerComponent />
            default:
                return <DefaultViewTabComponent data={defaultViewData} />
        }
    }

    const getTabIcon = (icon: string) => {
        switch (icon) {
            case "K8Resource": return <K8Resource />
            case "LogAnalyser": return <LogAnalyser />
            default: return ""
        }
    }

    useEffect(() => {
        handleTabClick("K8 Resources")
    }, [])

    return (
        <div>
            <div className="resource-tree-wrapper flexbox pl-20 pr-20 mt-16">
                {
                    tabs.map((tab: iTab, index) => {
                        return (
                            <div key={index + "tab"} className={`${tab.isSelected ? 'resource-tree-tab bcn-0' : ''} cursor pl-12 pt-8 pb-8 pr-12`}>
                                <a className="cn-9 fw-6 no-decor flex left" onClick={() => handleTabClick(tab.name)}>
                                    {tab.icon && <span className="icon-dim-16 mr-4">{getTabIcon(tab?.icon)} </span>} {tab.name}
                                </a>
                            </div>
                        )
                    })
                }
            </div>
            {selectedTab && tabData()}
        </div>
    )
}

export default ResourceTreeComponent
