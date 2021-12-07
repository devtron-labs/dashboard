import React, {useEffect, useState } from 'react'
import EventsComponent from './NodeDetailTabs/Events.component';
import LogsComponent from './NodeDetailTabs/Logs.component';
import ManifestComponent from './NodeDetailTabs/Manifest.component';
import TerminalComponent from './NodeDetailTabs/Terminal.component';
import './nodeDetail.css';
import SummaryComponent from './NodeDetailTabs/Summary.component';
import { NavLink, Route, Switch } from 'react-router-dom';
import { useParams, useRouteMatch, useHistory } from 'react-router';
import { NodeDetailTab } from './nodeDetail.type';
import { getNodeDetailTabs } from './nodeDetail.util';
import { NodeType } from '../../appDetails.type';

function NodeDetailComponent() {

    const params = useParams<{ actionName: string, podName: string, nodeType: string }>()

    const [tabs, setTabs] = useState([])

    const [selectedTabName, setSelectedTabName] = useState("")
    const { path, url } = useRouteMatch()

    useEffect(() => {
       
        if(params.nodeType){
            const _tabs = getNodeDetailTabs(params.nodeType as NodeType)
            setTabs(_tabs)
        }

    }, [params.nodeType, params.podName])

    const handleSelectedTab = (_tabName: string) => {
        setSelectedTabName(_tabName)
    }

    return (
        <div>
            <div className="bcn-0 flex left top w-100 pl-20 border-bottom pr-20">
                {
                    (tabs && tabs.length > 0) && tabs.map((tab: string, index: number) => {
                        return (
                            <div key={index + "resourceTreeTab"} className={`${tab.toLowerCase() === selectedTabName.toLowerCase() ? 'default-tab-row cb-5' : 'cn-7'} pt-6 pb-6 cursor pl-8 pr-8`}>
                                <NavLink to={`${url}/${tab.toLowerCase()}`} className=" no-decor flex left" >
                                    <span className="default-tab-cell"> {tab.toLowerCase()}</span>
                                </NavLink>
                            </div>
                        )
                    })
                }
            </div>
            <div>
                <Switch>
                    <Route path={`${path}/${NodeDetailTab.MANIFEST}`} render={() => { return <ManifestComponent selectedTab={handleSelectedTab}  /> }} />
                    <Route path={`${path}/${NodeDetailTab.EVENTS}`} render={() => { return <EventsComponent selectedTab={handleSelectedTab} /> }} />
                    <Route path={`${path}/${NodeDetailTab.LOGS}`} render={() => { return <LogsComponent selectedTab={handleSelectedTab} /> }} />
                    <Route path={`${path}/${NodeDetailTab.SUMMARY}`} render={() => { return <SummaryComponent selectedTab={handleSelectedTab} /> }} />
                    <Route path={`${path}/${NodeDetailTab.TERMINAL}`} render={() => { return <TerminalComponent selectedTab={handleSelectedTab} /> }} />
                </Switch>
            </div>
        </div>
    )
}

export default NodeDetailComponent
