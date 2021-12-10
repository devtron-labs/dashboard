import React, { useState, useEffect } from 'react';
import K8ResourceComponent from './k8Resource/K8Resource.component';
import './appDetails.css';
import { ReactComponent as K8ResourceIcon } from '../../../assets/icons/ic-object.svg';
import { ReactComponent as LogAnalyzerIcon } from '../../../assets/icons/ic-logs.svg';
import { ReactComponent as Cross } from '../../../assets/icons/ic-close.svg';
import LogAnalyzerComponent from './logAnalyzer/LogAnalyzer.component';
import { NavLink, Route, Switch } from 'react-router-dom';
import { useRouteMatch, Redirect, useParams, useHistory } from 'react-router';
import { URLS } from '../../../config';
import { Progressing } from '../../common';
import AppDetailsStore, { AppDetailsTabs } from './appDetails.store';
import { useSharedState } from '../utils/useSharedState';
import { getInstalledAppDetail, getInstalledChartDetail } from './appDetails.api';
import IndexStore from './index.store';
import { ApplicationObject, EnvType } from './appDetails.type';
import SourceInfoComponent from './sourceInfo/SourceInfo.component';
import NodeDetailComponent from './k8Resource/nodeDetail/NodeDetail.component';
import Tippy from '@tippyjs/react';

const AppDetailsComponent = ({ envType }) => {
    const params = useParams<{ appId: string, envId: string, nodeType: string }>()
    const { path, url } = useRouteMatch();
    const [applicationObjectTabs] = useSharedState(AppDetailsStore.getAppDetailsTabs(), AppDetailsStore.getAppDetailsTabsObservable())
    const [isLoading, setIsLoading] = useState(true)
    const history = useHistory();

    useEffect(() => {
        IndexStore.setEnvDetails(envType, +params.appId, +params.envId)
        AppDetailsStore.initAppDetailsTabs(url)
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
        AppDetailsStore.removeAppDetailsTab(tabName)
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
                            {applicationObjectTabs.map((tab: ApplicationObject, index: number) => {
                                return (
                                    <li key={index + "tab"} className="flex left ellipsis-right ">
                                        <Tippy
                                            className={`${((tab.name === AppDetailsTabs.log_analyzer) || (tab.name === AppDetailsTabs.k8s_Resources)) ? 'w-0 h-0 bcn-0' : ''} default-tt `}
                                            arrow={false}
                                            placement="top"
                                            content={(tab.name !== AppDetailsTabs.log_analyzer) && (tab.name !== AppDetailsTabs.k8s_Resources) && tab.title}
                                        >
                                            <div className="flex">
                                                <div className={`${tab.isSelected ? "resource-tree-tab bcn-0 cn-9" : ""} flex left pl-12 pt-8 pb-8 pr-12 `}>
                                                    <NavLink to={`${tab.url}`} className={`resource-tree__tab-hover tab-list__tab resource-tab__node cursor cn-9 fw-6 no-decor `}>
                                                        <div className={`flex left ${tab.isSelected ? "fw-6 cn-9" : ""}`} >
                                                            {tab.name === AppDetailsTabs.log_analyzer ? <span className="icon-dim-16 resource-tree__tab-hover fcb-5"> <LogAnalyzerIcon /></span> : ''}
                                                            {tab.name === AppDetailsTabs.k8s_Resources ? <span className="icon-dim-16 resource-tree__tab-hover "> <K8ResourceIcon /></span> : ''}
                                                            <span className={`${tab.name !== AppDetailsTabs.k8s_Resources && tab.name !== AppDetailsTabs.log_analyzer ? 'mr-8' : 'ml-8 text-capitalize '} fs-12 `}>
                                                                {tab.name}
                                                            </span>
                                                        </div>
                                                    </NavLink>

                                                    {(tab.name !== AppDetailsTabs.log_analyzer && tab.name !== AppDetailsTabs.k8s_Resources) &&
                                                       <span className="resource-tab__close-wrapper flex br-5 bcn-5 fcn-0"> <Cross onClick={(e) => handleCloseTab(e, tab.name)} className="icon-dim-16 cursor" /></span>
                                                    }
                                                </div>
                                                <div className={` ${!tab.isSelected ? 'resource-tree-tab__border' : ''}`}></div>
                                            </div>
                                        </Tippy>
                                    </li>
                                )
                            })
                            }
                        </ul>
                    </div>
                    <Switch>
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