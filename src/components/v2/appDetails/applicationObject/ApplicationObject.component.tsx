import React, { useState, useEffect } from 'react';
import K8ResourceComponent from './k8Resource/K8Resource.component';
import { iLink } from '../../utils/tabUtils/link.type';
import './applicationObject.css'
import { ReactComponent as K8ResourceIcon } from '../../../../assets/icons/ic-object.svg';
import { ReactComponent as LogAnalyzerIcon } from '../../../../assets/icons/ic-logs.svg';
import LogAnalyzerComponent from './logAnalyzer/LogAnalyzer.component';
import DefaultViewTabComponent from './defaultViewTab/DefaultViewTab.component';
import { NavLink, Route, Switch } from 'react-router-dom';
import { useRouteMatch, Redirect } from 'react-router';
import { URLS } from '../../../../config';
import { Progressing, showError } from '../../../common';
import './applicationObject.css';
import ApplicationObjectStore from './applicationObject.store';
import { useSharedState } from '../../utils/useSharedState';
import { getInstalledAppDetail, getInstalledChartDetail } from '../appDetails.api';
import AppDetailsStore from '../appDetail.store';
import { EnvType } from '../appDetail.type';


const ApplicationObjectComponent = () => {
    const { path, url } = useRouteMatch();
    const [applicationObjectTabs] = useSharedState(ApplicationObjectStore.getApplicationObjectTabs(), ApplicationObjectStore.getApplicationObjectTabsObservable())
    const [isLoading, setIsLoading] = useState(true)
    const {envType, appId, envId} = AppDetailsStore.getEnvDetails()

    useEffect(() => {
        const link = url.split(URLS.APP_DETAILS)[0] + URLS.APP_DETAILS + '/'
        ApplicationObjectStore.setBaseURL(link)
        ApplicationObjectStore.initApplicationObjectTab()

        const init = async () => {
            let response = null;
            try {
                if(envType === EnvType.CHART){
                    response = await getInstalledChartDetail(appId, envId);
                    console.log(response)
                }else{
                    response = await getInstalledAppDetail(appId, envId);
                    console.log(response)
                }
                
                AppDetailsStore.setAppDetails(response.result);

                setIsLoading(false)
            } catch (e) {
                console.log("error while fetching InstalledAppDetail", e)
                // alert('error loading data')
            } 
        }

        console.log("ApplicationObjectComponent refreshed", new Date().getTime())

        init();
    }, [])

    return (
        <div>
            {isLoading ?  <div style={{ height: "560px" }} className="flex">
                    <Progressing pageLoader />
                </div>
                :
                <div>
                    <div className="resource-tree-wrapper flexbox pl-20 pr-20 mt-16">
                        <ul className="tab-list">
                            {applicationObjectTabs && applicationObjectTabs.map((tab: iLink, index: number) => {
                                return (
                                    <li key={index + "tab"} className=" ellipsis-right">
                                        <NavLink to={`${tab.url}`} className={`${tab.isSelected ? "resource-tree-tab bcn-0 cn-9" : ""}tab-list__tab cursor cn-9 fw-6 no-decor flex left`}>
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
            }

        </div>
    )
}

export default ApplicationObjectComponent;