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
import { NavLink, Redirect, Route, Switch } from 'react-router-dom';
import { URLS } from '../../../../../config';
import { useRouteMatch, useHistory } from 'react-router';
import ApplicationObjectStore from '../applicationObject.store';
import K8ResourceComponent from '../k8Resource/K8Resource.component';
import LogAnalyzerComponent from '../logAnalyzer/LogAnalyzer.component';

function DefaultViewTabComponent({handleNodeChange} ) {

    const [{ tabs }, dispatch] = useTab(DefaultViewTabsJSON);
    const [selectedTab, setSelectedTab] = useState("")
    const params = useParams<{ action: string }>()
    const { url, path } = useRouteMatch()
    const history = useHistory()
    const [ urlWithoutAction, setUrlWithoutAction] = useState('')

    const handleTabClick = (_tabName: string) => {
        dispatch({
            type: TabActions.MarkActive,
            tabName: _tabName
        })

        ApplicationObjectStore.setCurrentTab(_tabName)
        
        setSelectedTab(_tabName)
        
       handleNodeChange()
    }

    const tabData = () => {
        switch (selectedTab) {
            case NodeDetailTabs.MANIFEST:
                return <ManifestComponent handleNodeChange={handleNodeChange}/>
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
            setUrlWithoutAction(url.split(params.action)[0])
        } 
    }, [params.action])

    // useEffect(() => {
    //     // const link = url.split(URLS.APP_DETAILS)[0] + URLS.APP_DETAILS + '/'

    //     if (!params.action || NodeDetailTabs[params.action.toUpperCase()] === undefined) {
    //         history.push(ApplicationObjectStore.getBaseURL() + URLS.APP_DETAILS_K8 + ApplicationObjectStore.getCurrentTab())
    //     }
    // }, [params.action])

    useEffect(() => {
        ApplicationObjectStore.markApplicationObjectTabActive(ApplicationObjectStore.getCurrentTab())
    }, [])

    return (
        <div>
            <div className="bcn-0 flex left top w-100 pl-20 border-bottom pr-20">
                {
                    tabs.map((tab: iLink, index) => {
                        return (
                            <div key={index + "resourceTreeTab"} className={`${tab.name.toLowerCase() === selectedTab.toLowerCase() ? 'default-tab-row' : ''} pt-6 pb-6 cursor pl-8 pr-8`}>
                                <NavLink to={`${url}/${tab.name.toLowerCase()}`} className=" no-decor flex left cn-7" >
                                    <span className="default-tab-cell"> {tab.name.toLowerCase()}</span>
                                </NavLink>
                            </div>
                        )
                    })
                }

            </div>
            <div>
                {/* {selectedTab && tabData()} */}
                <Switch>
                    {console.log(urlWithoutAction)}
                <Route path={`${urlWithoutAction}${NodeDetailTabs.MANIFEST}`} render={() => { return <ManifestComponent  handleNodeChange={handleNodeChange}/> }} />
                <Route path={`${urlWithoutAction}${NodeDetailTabs.EVENTS}`} render={() => { return <EventsComponent  /> }} />
                <Route path={`${urlWithoutAction}${NodeDetailTabs.LOGS}`} render={() => { return <LogsComponent  /> }} />
                <Route path={`${urlWithoutAction}${NodeDetailTabs.SUMMARY}`} render={() => { return <SummaryComponent  /> }} />
                <Route path={`${urlWithoutAction}${NodeDetailTabs.TERMINAL}`} render={() => { return <TerminalComponent  /> }} />
            </Switch>
            </div>
        </div>
    )
}

export default DefaultViewTabComponent
