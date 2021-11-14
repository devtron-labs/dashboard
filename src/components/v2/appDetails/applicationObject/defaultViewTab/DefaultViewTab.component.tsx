import React, { useEffect, useState } from 'react'
import { DefaultViewTabsJSON } from '../../../utils/tabUtils/tab.json';
import { iLink } from '../../../utils/tabUtils/link.type';
import { TabActions, useTab } from '../../../utils/tabUtils/useTab';
import EventsComponent from './defaultViewActionTabs/Events.component';
import LogsComponent from './defaultViewActionTabs/Logs.component';
import ManifestComponent from './defaultViewActionTabs/Manifest.component';
import TerminalComponent from './defaultViewActionTabs/Terminal.component';
import './defaultViewTab.css';
import SummaryComponent from './defaultViewActionTabs/Summary.component';
import { NavLink, Route, Switch } from 'react-router-dom';
import { useParams, useRouteMatch } from 'react-router';
import ApplicationObjectStore from '../applicationObject.store';
import { NodeDetailTabs } from '../../node.type';

function DefaultViewTabComponent() {

    const [{ tabs }, dispatch] = useTab(DefaultViewTabsJSON);
    const [selectedTab, setSelectedTab] = useState("")
    const params = useParams<{ action: string, podName: string }>()
    const { url } = useRouteMatch()
    const [urlWithoutAction, setUrlWithoutAction] = useState('')

    const handleTabClick = (_tabName: string) => {
        dispatch({
            type: TabActions.MarkActive,
            tabName: _tabName
        })

        ApplicationObjectStore.setCurrentTab(_tabName)

        setSelectedTab(_tabName)
    }

    useEffect( () =>{
        if(params.podName){
            ApplicationObjectStore.addApplicationObjectTab(params.podName, url)
        }
        
    }, [params.podName])


    useEffect(() => {
        if (params.action) {
            handleTabClick(params.action)
            setUrlWithoutAction(url.split(params.action)[0])
        }
    }, [params.action])

    return (
        <div>
            <div className="bcn-0 flex left top w-100 pl-20 border-bottom pr-20">
                {
                    tabs.map((tab: iLink, index: number) => {
                        return (
                            <div key={index + "resourceTreeTab"} className={`${tab.name.toLowerCase() === selectedTab.toLowerCase() ? 'default-tab-row' : ''} pt-6 pb-6 cursor pl-8 pr-8`}>
                                <NavLink to={`${urlWithoutAction}${tab.name.toLowerCase()}`} className=" no-decor flex left cn-7" >
                                    <span className="default-tab-cell"> {tab.name.toLowerCase()}</span>
                                </NavLink>
                            </div>
                        )
                    })
                }

            </div>
            <div>
                <Switch>
                    <Route path={`${urlWithoutAction}${NodeDetailTabs.MANIFEST}`} render={() => { return <ManifestComponent  /> }} />
                    <Route path={`${urlWithoutAction}${NodeDetailTabs.EVENTS}`} render={() => { return <EventsComponent /> }} />
                    <Route path={`${urlWithoutAction}${NodeDetailTabs.LOGS}`} render={() => { return <LogsComponent /> }} />
                    <Route path={`${urlWithoutAction}${NodeDetailTabs.SUMMARY}`} render={() => { return <SummaryComponent /> }} />
                    <Route path={`${urlWithoutAction}${NodeDetailTabs.TERMINAL}`} render={() => { return <TerminalComponent /> }} />
                </Switch>
            </div>
        </div>
    )
}

export default DefaultViewTabComponent
