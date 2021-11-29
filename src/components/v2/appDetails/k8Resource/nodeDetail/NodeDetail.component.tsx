import React, {useState } from 'react'
import { DefaultViewTabsJSON } from '../../../utils/tabUtils/tab.json';
import { iLink } from '../../../utils/tabUtils/link.type';
import { TabActions, useTab } from '../../../utils/tabUtils/useTab';
import EventsComponent from './NodeDetailTabs/Events.component';
import LogsComponent from './NodeDetailTabs/Logs.component';
import ManifestComponent from './NodeDetailTabs/Manifest.component';
import TerminalComponent from './NodeDetailTabs/Terminal.component';
import './nodeDetail.css';
import SummaryComponent from './NodeDetailTabs/Summary.component';
import { NavLink, Route, Switch } from 'react-router-dom';
import { useParams, useRouteMatch, useHistory } from 'react-router';
import { NodeDetailTabs } from '../../node.type';

function NodeDetailComponent() {

    const [{ tabs }, dispatch] = useTab(DefaultViewTabsJSON);
    const [selectedTabName, setSelectedTabName] = useState("")
    const { path, url } = useRouteMatch()

    const handleSelectedTab = (_tabName: string) => {
        setSelectedTabName(_tabName)
    }

    return (
        <div>
            <div className="bcn-0 flex left top w-100 pl-20 border-bottom pr-20">
                {
                    (tabs && tabs.length > 0) && tabs.map((tab: iLink, index: number) => {
                        return (
                            <div key={index + "resourceTreeTab"} className={`${tab.name.toLowerCase() === selectedTabName.toLowerCase() ? 'default-tab-row' : ''} pt-6 pb-6 cursor pl-8 pr-8`}>
                                <NavLink to={`${url}/${tab.name.toLowerCase()}`} className=" no-decor flex left cn-7" >
                                    <span className="default-tab-cell"> {tab.name.toLowerCase()}</span>
                                </NavLink>
                            </div>
                        )
                    })
                }
            </div>
            <div>
                <Switch>
                    <Route path={`${path}/${NodeDetailTabs.MANIFEST}`} render={() => { return <ManifestComponent selectedTab={handleSelectedTab}  /> }} />
                    <Route path={`${path}/${NodeDetailTabs.EVENTS}`} render={() => { return <EventsComponent selectedTab={handleSelectedTab} /> }} />
                    <Route path={`${path}/${NodeDetailTabs.LOGS}`} render={() => { return <LogsComponent selectedTab={handleSelectedTab} /> }} />
                    <Route path={`${path}/${NodeDetailTabs.SUMMARY}`} render={() => { return <SummaryComponent selectedTab={handleSelectedTab} /> }} />
                    <Route path={`${path}/${NodeDetailTabs.TERMINAL}`} render={() => { return <TerminalComponent selectedTab={handleSelectedTab} /> }} />
                </Switch>
            </div>
        </div>
    )
}

export default NodeDetailComponent
