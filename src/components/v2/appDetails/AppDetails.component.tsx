import React, { useState, useEffect } from 'react';
import K8ResourceComponent from './k8Resource/K8Resource.component';
import { iLink } from '../utils/tabUtils/link.type';
import './appDetails.css';
import { ReactComponent as K8ResourceIcon } from '../../../assets/icons/ic-object.svg';
import { ReactComponent as LogAnalyzerIcon } from '../../../assets/icons/ic-logs.svg';
import { ReactComponent as Cross } from '../../../assets/icons/ic-close.svg';
import LogAnalyzerComponent from './logAnalyzer/LogAnalyzer.component';
import { NavLink, Route, Switch } from 'react-router-dom';
import { useRouteMatch, Redirect, useParams, useHistory } from 'react-router';
import { URLS } from '../../../config';
import { Progressing } from '../../common';
import AppDetailsStore from './appDetails.store';
import { useSharedState } from '../utils/useSharedState';
import { getInstalledAppDetail, getInstalledChartDetail } from './appDetails.api';
import IndexStore from './index.store';
import { EnvType } from './appDetails.type';
import SourceInfoComponent from './sourceInfo/SourceInfo.component';
import NodeDetailComponent from './k8Resource/nodeDetail/NodeDetail.component';


const AppDetailsComponent = ({ envType }) => {
    const params = useParams<{ appId: string, envId: string, nodeType: string }>()
    const { path, url } = useRouteMatch();
    const [applicationObjectTabs] = useSharedState(AppDetailsStore.getApplicationObjectTabs(), AppDetailsStore.getApplicationObjectTabsObservable())
    const [isLoading, setIsLoading] = useState(true)
    const history = useHistory();

    useEffect(() => {
        IndexStore.setEnvDetails(envType, +params.appId, +params.envId)
        AppDetailsStore.initApplicationObjectTab(url)
        IndexStore.getAppDetails()
        const init = async () => {
            let response = null;
            try {
                if (envType === EnvType.CHART) {
                    response = await getInstalledChartDetail(+params.appId, +params.envId);
                } else {
                    response = await getInstalledAppDetail(+params.appId, +params.envId);
                }

                IndexStore.setAppDetails(response.result);

                setIsLoading(false)
            } catch (e) {
                console.log("error while fetching InstalledAppDetail", e)
                // alert('error loading data')
            }
        }

        init();
    }, [params.appId, params.envId])

    const handleCloseTab = (e: any, tabName: string) => {
        e.stopPropagation()
        AppDetailsStore.removeApplicationObjectTab(tabName)
        setTimeout(() => {
            history.push(url)
        }, 1);

    }

    return (
        <div>
            {isLoading ? <div style={{ height: "560px" }} className="flex">
                <Progressing pageLoader />
            </div>
                :
                <div>
                    <SourceInfoComponent />
                    <div className="resource-tree-wrapper flexbox pl-20 pr-20 mt-16">
                        <ul className="tab-list">
                            {applicationObjectTabs.map((tab: iLink, index: number) => {
                                return (
                                    <li key={index + "tab"} className="flex left  ellipsis-right">
                                        <div className={`${tab.isSelected ? " resource-tree-tab bcn-0 cn-9" : ""} flex left pl-12 pt-8 pb-8 pr-12 `}>
                                            <NavLink to={`${tab.url}`} className={`tab-list__tab resource-tab__node cursor cn-9 fw-6 no-decor `}>
                                                <div className={`flex left ${tab.isSelected ? "fw-6 cn-9" : ""}`} >
                                                    {tab.name === URLS.APP_DETAILS_LOG ? <span className="icon-dim-16 mr-4"> <LogAnalyzerIcon /></span> : ''}
                                                    {tab.name === URLS.APP_DETAILS_K8 ? <span className="icon-dim-16 mr-4"> <K8ResourceIcon /></span> : ''}
                                                    <span className={`${tab.name !== URLS.APP_DETAILS_LOG && tab.name !== URLS.APP_DETAILS_K8 ? 'mr-8' : 'ml-8'} `}> {tab.name}</span>
                                                </div>
                                            </NavLink>

                                            {(tab.name !== URLS.APP_DETAILS_LOG && tab.name !== URLS.APP_DETAILS_K8) &&
                                              <Cross onClick={(e) => handleCloseTab(e, tab.name)} className="icon-dim-16 cursor" /> 
                                            }
                                        </div>
                                    </li>
                                )
                            })
                            }
                        </ul>
                    </div>
                    <Switch>
                        {/* <Route path={`${path}/${URLS.APP_DETAILS_K8}/:nodeType`} render={() => { return <K8ResourceComponent /> }} /> */}
                        <Route path={`${path}/${URLS.APP_DETAILS_K8}/:nodeType/:podName`} render={() => { return <NodeDetailComponent /> }} />
                        <Route path={`${path}/${URLS.APP_DETAILS_K8}`} render={() => { return <K8ResourceComponent /> }} />
                        <Route exact path={`${path}/${URLS.APP_DETAILS_LOG}`} render={() => { return <LogAnalyzerComponent /> }} />
                        <Redirect to={`${path}/${URLS.APP_DETAILS_K8}`} />
                    </Switch>
                </div>
            }

        </div>
    )
}

export default AppDetailsComponent;