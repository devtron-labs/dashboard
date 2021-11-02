import React, { useState, useEffect, Suspense } from 'react';
import K8ResourceComponent from './k8Resource/K8Resource.component';
import { iTab } from '../../utils/tabUtils/tab.type';
import { TabActions, useTab } from '../../utils/tabUtils/useTab';
import './applicationObject.css'
import { ReactComponent as K8Resource } from '../../../../assets/icons/ic-object.svg';
import { ReactComponent as LogAnalyzer } from '../../../../assets/icons/ic-logs.svg';
import LogAnalyzerComponent from './logAnalyzer/LogAnalyzer.component';
import { tCell } from '../../utils/tableUtils/table.type';
import { NodeDetailTabsType } from '../../../app/types';
import DefaultViewTabComponent from './defaultViewTab/DefaultViewTab.component';
import { ResourceTabsJSON } from '../../utils/tabUtils/tab.json';
import { generatePath, NavLink, Redirect, Route, Switch } from 'react-router-dom';
import { useRouteMatch, useParams, useLocation, useHistory } from 'react-router';
import { URLS } from '../../../../config';
import { Progressing, useSearchString } from '../../../common';
import './applicationObject.css';

function ApplicationObjectComponent() {

    const [{ tabs }, dispatch] = useTab(ResourceTabsJSON);
    const [selectedTab, setSelectedTab] = useState("")
    const [defaultViewData, setDefaultViewData] = useState({})
    const location = useLocation();
    const { path } = useRouteMatch();
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
            case "LogAnalyser": return <LogAnalyzer />
            default: return ""
        }
    }

    useEffect(() => {
        handleTabClick("K8 Resources")
    }, [])

    return (
        <div>
            <div className="resource-tree-wrapper flexbox pl-20 pr-20 mt-16">
                {/* {
                    tabs.map((tab: iTab, index) => {
                        let itab = tab.name;
                        let gen = `${itab}`
                        return (
                            <div key={index + "tab"} className={`${tab.isSelected ? 'resource-tree-tab bcn-0' : ''} cursor pl-12 pt-8 pb-8 pr-12`}>
                                <NavLink to={gen} className="cn-9 fw-6 no-decor flex left">
                                    {tab.icon && <span className="icon-dim-16 mr-4">{getTabIcon(tab?.icon)} </span>} {tab.name}
                                </NavLink>
                            </div>
                        )
                    })
                }
           */}
                <ul className="tab-list">
                    <li className=" ellipsis-right">
                        <NavLink activeClassName="resource-tree-tab bcn-0 cn-9" to={`k8-resources`} className="tab-list__tab cursor cn-9 fw-6 no-decor flex left">
                            <div className="pl-12 pt-8 pb-8 pr-12 flex left"> <span className="icon-dim-16 mr-4"> <K8Resource /></span> K8 Resources</div>
                        </NavLink>
                    </li>
                    <li className="tab-list__tab ellipsis-right">
                        <NavLink activeClassName="resource-tree-tab bcn-0 cn-9" to={`log-analyzer`} className="cn-9 fw-6 no-decor flex left">
                            <div className={`flex left cursor pl-12 pt-8 pb-8 pr-12`}><span className="icon-dim-16 mr-4"> <LogAnalyzer /></span> Log Analyzer</div>
                        </NavLink>
                    </li>
                </ul>
            </div>
            <div>
                <Switch>
                    <Route exact path={`${path}/${URLS.APP_DETAILS_K8}`} component={K8ResourceComponent} />
                    <Route exact path={`${path}/${URLS.APP_DETAILS_LOG}`} component={LogAnalyzerComponent} />
                    <Route exact path={`${path}/${URLS.APP_DETAILS_DEFAULT}`} component={DefaultViewTabComponent} />
                    <Redirect exact to={`${path}/${URLS.APP_DETAILS_K8}`} />
                </Switch>
            </div>
            {/* {selectedTab && tabData()} */}
        </div>
    )
}

export default ApplicationObjectComponent
