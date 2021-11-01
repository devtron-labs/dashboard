import React, { useState, useEffect } from 'react';
import K8ResourceComponent from './k8Resource/K8Resource.component';
import { iTab } from '../../utils/tabUtils/tab.type';
import { TabActions, useTab } from '../../utils/tabUtils/useTab';
import './applicationObject.css'
import { ReactComponent as K8Resource } from '../../../../assets/icons/ic-object.svg';
import { ReactComponent as LogAnalyser } from '../../../../assets/icons/ic-logs.svg';
import LogAnalyzerComponent from './logAnalyzer/LogAnalyzer.component';
import { tCell } from '../../utils/tableUtils/table.type';
import { NodeDetailTabsType } from '../../../app/types';
import DefaultViewTabComponent from './defaultViewTab/DefaultViewTab.component';
import { ResourceTabsJSON } from '../../utils/tabUtils/tab.json';
import { generatePath, NavLink } from 'react-router-dom';
import { useRouteMatch, useParams, useLocation } from 'react-router';


function ApplicationObjectComponent() {

    const [{ tabs }, dispatch] = useTab(ResourceTabsJSON);
    const [selectedTab, setSelectedTab] = useState("")
    const [defaultViewData, setDefaultViewData] = useState({})
    const { path } = useRouteMatch()
    const location = useLocation();

    const params = useParams<{ appId: string, envId: string, name }>()

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
                        let itab = tab.name;
                        console.log(tab.name)
                        return (
                            <div key={index + "tab"} className={`${tab.isSelected ? 'resource-tree-tab bcn-0' : ''} cursor pl-12 pt-8 pb-8 pr-12`}>
                                <NavLink to={generatePath(path, { ...params, itab }) + location.search} className="cn-9 fw-6 no-decor flex left">
                                    {tab.icon && <span className="icon-dim-16 mr-4">{getTabIcon(tab?.icon)} </span>} {tab.name}
                                </NavLink>
                            </div>
                        )
                    })
                }
            </div>
            {selectedTab && tabData()}
        </div>
    )
}

export default ApplicationObjectComponent
