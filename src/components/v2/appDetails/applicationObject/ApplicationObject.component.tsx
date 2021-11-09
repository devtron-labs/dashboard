import React, { useState, useEffect, Suspense } from 'react';
import K8ResourceComponent from './k8Resource/K8Resource.component';
import { iLink } from '../../utils/tabUtils/tab.type';
import { TabActions, useTab } from '../../utils/tabUtils/useTab';
import './applicationObject.css'
import { ReactComponent as K8ResourceIcon } from '../../../../assets/icons/ic-object.svg';
import { ReactComponent as LogAnalyzerIcon } from '../../../../assets/icons/ic-logs.svg';
import LogAnalyzerComponent from './logAnalyzer/LogAnalyzer.component';
import { tCell } from '../../utils/tableUtils/table.type';
import { NodeDetailTabsType } from '../../../app/types';
import DefaultViewTabComponent from './defaultViewTab/DefaultViewTab.component';
import { NavLink, Route, Switch } from 'react-router-dom';
import { useRouteMatch, useParams, useHistory } from 'react-router';
import { URLS } from '../../../../config';
import './applicationObject.css';
import ApplicationObjectStore from './applicationObject.store';


const ApplicationObjectComponent = () => {
    const { path, url } = useRouteMatch();
    const history = useHistory()
    const params = useParams<{ appId: string, envId: string, name: string, action: string, node: string }>()
    const [applicationObjectTabs, setApplicationObjectTabs] = useState(ApplicationObjectStore.getApplicationObjectTabs())

    const fetchApplicationObjectTabs = () => {
        const tabs = ApplicationObjectStore.getApplicationObjectTabs()
        setApplicationObjectTabs(tabs)
    }

    useEffect(() => {
        const link = url.split(URLS.APP_DETAILS)[0] + URLS.APP_DETAILS + '/'
        ApplicationObjectStore.setBaseURL(link)
        ApplicationObjectStore.initApplicationObjectTab()

        // if (url.indexOf(URLS.APP_DETAILS_K8) === -1 && url.indexOf(URLS.APP_DETAILS_LOG) === -1 && (!params.action || NodeDetailTabs[params.action.toUpperCase()] !== undefined)) {
        //     history.push(link + URLS.APP_DETAILS_K8)
        // }

        fetchApplicationObjectTabs()
    }, [])

    return (
        <div>
            <div className="resource-tree-wrapper flexbox pl-20 pr-20 mt-16">
                <ul className="tab-list">
                    {/* <li className=" ellipsis-right">
                        <NavLink activeClassName="resource-tree-tab bcn-0 cn-9" to={`${baseURL}${URLS.APP_DETAILS_K8}`} className="tab-list__tab cursor cn-9 fw-6 no-decor flex left">
                            <div className="pl-12 pt-8 pb-8 pr-12 flex left"> <span className="icon-dim-16 mr-4"> <K8ResourceIcon /></span> K8 Resources</div>
                        </NavLink>
                    </li>
                    <li className="tab-list__tab ellipsis-right">
                        <NavLink activeClassName="resource-tree-tab bcn-0 cn-9" to={`${baseURL}${URLS.APP_DETAILS_LOG}`} className="cn-9 fw-6 no-decor flex left">
                            <div className={`flex left cursor pl-12 pt-8 pb-8 pr-12`}><span className="icon-dim-16 mr-4"> <LogAnalyzerIcon /></span> Log Analyzer</div>
                        </NavLink>
                    </li> */}
                    {
                        applicationObjectTabs.map((tab: iLink, index: number) => {
                            return (
                                <li key={index + "tab"} className=" ellipsis-right">
                                    <NavLink activeClassName={'resource-tree-tab bcn-0 cn-9'} to={`${tab.url}`} className={'tab-list__tab cursor cn-9 fw-6 no-decor flex left'}>
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
            {/* {selectedTab && tabData()} */}


            <Switch>
                {/* <Route path={`${path}/${URLS.APP_DETAILS_K8}/:node/:action`} render={() => { return <DefaultViewTabComponent handleNodeChange={fetchApplicationObjectTabs} /> }} /> */}
                <Route path={`${path}/${URLS.APP_DETAILS_K8}`} render={() => { return <K8ResourceComponent handleNodeChange={fetchApplicationObjectTabs} /> }} />
                <Route exact path={`${path}/${URLS.APP_DETAILS_LOG}`} render={() => { return <LogAnalyzerComponent handleNodeChange={fetchApplicationObjectTabs} /> }} />
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