import React, { useState, useEffect } from 'react';
import K8ResourceComponent from './k8Resource/K8Resource.component';
import { iLink } from '../utils/tabUtils/link.type';
import './appDetails.css';
import { ReactComponent as K8ResourceIcon } from '../../../assets/icons/ic-object.svg';
import { ReactComponent as LogAnalyzerIcon } from '../../../assets/icons/ic-logs.svg';
import LogAnalyzerComponent from './logAnalyzer/LogAnalyzer.component';
import { NavLink, Route, Switch } from 'react-router-dom';
import { useRouteMatch, Redirect, useParams } from 'react-router';
import { URLS } from '../../../config';
import { Progressing, showError } from '../../common';
import AppDetailsStore from './appDetails.store';
import { useSharedState } from '../utils/useSharedState';
import { getInstalledAppDetail, getInstalledChartDetail } from './appDetails.api';
import IndexStore from './index.store';
import { EnvType } from './appDetails.type';
import AppHeaderComponent from '../appHeader/AppHeader.component';
import SourceInfoComponent from './sourceInfo/SourceInfo.component';
import DefaultViewTabComponent from './k8Resource/defaultViewTab/DefaultViewTab.component';


const AppDetailsComponent = ({ envType }) => {
    const params = useParams<{ appId: string, envId: string }>()
    const { path, url } = useRouteMatch();
    const [applicationObjectTabs] = useSharedState(AppDetailsStore.getApplicationObjectTabs(), AppDetailsStore.getApplicationObjectTabsObservable())
    const [isLoading, setIsLoading] = useState(true)
    // const { appId, envId } = IndexStore.getEnvDetails()

    useEffect(() => {
        IndexStore.setEnvDetails(envType, +params.appId, +params.envId)

        const link = url.split(URLS.APP_DETAILS)[0] + URLS.APP_DETAILS + '/'
        AppDetailsStore.setBaseURL(link)
        AppDetailsStore.initApplicationObjectTab()

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
                    {console.log('appdetail path', path)}
                    <Switch>
                        <Route path={`${path}/${URLS.APP_DETAILS_K8}/:nodeType/:podName`} render={() => { return <DefaultViewTabComponent /> }} />
                        <Route path={`${path}/${URLS.APP_DETAILS_K8}`} render={() => { return <K8ResourceComponent /> }} />
                        <Route exact path={`${path}/${URLS.APP_DETAILS_LOG}`} render={() => { return <LogAnalyzerComponent /> }} />
                    </Switch>
                </div>
            }

        </div>
    )
}

export default AppDetailsComponent;