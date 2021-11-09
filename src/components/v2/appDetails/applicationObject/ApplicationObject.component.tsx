import React, { useState, useEffect } from 'react';
import K8ResourceComponent from './k8Resource/K8Resource.component';
import { iLink } from '../../utils/tabUtils/tab.type';
import './applicationObject.css'
import { ReactComponent as K8ResourceIcon } from '../../../../assets/icons/ic-object.svg';
import { ReactComponent as LogAnalyzerIcon } from '../../../../assets/icons/ic-logs.svg';
import LogAnalyzerComponent from './logAnalyzer/LogAnalyzer.component';
import DefaultViewTabComponent from './defaultViewTab/DefaultViewTab.component';
import { NavLink, Route, Switch } from 'react-router-dom';
import { useRouteMatch, Redirect } from 'react-router';
import { URLS } from '../../../../config';
import './applicationObject.css';
import ApplicationObjectStore from './applicationObject.store';
import { useSharedState } from '../../utils/useSharedState';


const ApplicationObjectComponent = () => {
    const { path, url } = useRouteMatch();
    const [applicationObjectTabs] = useSharedState(ApplicationObjectStore.getApplicationObjectTabs(), ApplicationObjectStore.getApplicationObjectTabsObservable())

    useEffect(() => {
        const link = url.split(URLS.APP_DETAILS)[0] + URLS.APP_DETAILS + '/'
        ApplicationObjectStore.setBaseURL(link)
        ApplicationObjectStore.initApplicationObjectTab()
    }, [])


    return (
        <div>
            <div className="resource-tree-wrapper flexbox pl-20 pr-20 mt-16">
                <ul className="tab-list">
                    {applicationObjectTabs && applicationObjectTabs.map((tab: iLink, index: number) => {
                        return (
                            <li key={index + "tab"} className=" ellipsis-right">
                                <NavLink to={`${tab.url}`} className={`${tab.isSelected ? "resource-tree-tab bcn-0 cn-9": ""}tab-list__tab cursor cn-9 fw-6 no-decor flex left`}>
                                    <div className="pl-12 pt-8 pb-8 pr-12 flex left" >
                                        {tab.name === URLS.APP_DETAILS_LOG ? <span className="icon-dim-16 mr-4"> <LogAnalyzerIcon /></span> : ''}
                                        {tab.name === URLS.APP_DETAILS_K8 ? <span className="icon-dim-16 mr-4"> <K8ResourceIcon /></span> : ''}
                                        {tab.name}
                                    </div>
                                </NavLink>
                            </li>
                        )
                    })
                    }
                </ul>
            </div>
            <Switch>
                <Route exact path={`${path}/${URLS.APP_DETAILS_K8}/:iNodeType/:podName/:action`} render={() => { return <DefaultViewTabComponent /> }} />
                <Route path={`${path}/${URLS.APP_DETAILS_K8}`} render={() => { return <K8ResourceComponent /> }} />
                <Route exact path={`${path}/${URLS.APP_DETAILS_LOG}`} render={() => { return <LogAnalyzerComponent /> }} />
                <Redirect to={`${path}/${URLS.APP_DETAILS_K8}`} />
            </Switch>
        </div>
    )
}

export default ApplicationObjectComponent;























    // const addResourceTabClick = (ndtt: NodeDetailTabsType, cell: tCell) => {
    //     dispatch({
    //         type: TabActions.AddTab,
    //         tabName: ndtt.valueOf().toString()
    //     })

    //     setDefaultViewData({
    //         cell: cell,
    //         ndtt: ndtt,
    //     })

    //     setSelectedTab(ndtt.valueOf().toString())
    // }

    // const handleTabClick = (_tabName: string) => {
    //     dispatch({
    //         type: TabActions.MarkActive,
    //         tabName: _tabName
    //     })
    //     setSelectedTab(_tabName)
    // }


    // const tabData = () => {
    //     switch (selectedTab) {
    //         case "K8 Resources":
    //             return <K8ResourceComponent />
    //         case "Log Analyzer":
    //             return <LogAnalyzerComponent />
    //         default:
    //             return <DefaultViewTabComponent data={defaultViewData} />
    //     }
    // }


    // const tabData = () => {
    //     return showDefault ? <DefaultViewTabComponent /> : 

    // }