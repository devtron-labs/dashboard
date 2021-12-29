import React, { useState, useEffect } from 'react';
import K8ResourceComponent from './k8Resource/K8Resource.component';
import './appDetails.scss';
import { ReactComponent as K8ResourceIcon } from '../../../assets/icons/ic-object.svg';
import { ReactComponent as LogAnalyzerIcon } from '../../../assets/icons/ic-logs.svg';
import { ReactComponent as Cross } from '../../../assets/icons/ic-close.svg';
import LogAnalyzerComponent from './logAnalyzer/LogAnalyzer.component';
import { NavLink, Route, Switch } from 'react-router-dom';
import { useRouteMatch, Redirect, useParams, useHistory } from 'react-router';
import { URLS } from '../../../config';
import AppDetailsStore, { AppDetailsTabs } from './appDetails.store';
import { useSharedState } from '../utils/useSharedState';
import { ApplicationObject, NodeType } from './appDetails.type';
import NodeDetailComponent from './k8Resource/nodeDetail/NodeDetail.component';
import Tippy from '@tippyjs/react';
import IndexStore from './index.store';
import EnvironmentStatusComponent from './sourceInfo/environmentStatus/EnvironmentStatus.component';
import EnvironmentSelectorComponent from './sourceInfo/EnvironmentSelector.component';

const AppDetailsComponent = () => {
    const params = useParams<{ appId: string; envId: string; nodeType: string }>();
    const { path, url } = useRouteMatch();
    const [applicationObjectTabs] = useSharedState(
        AppDetailsStore.getAppDetailsTabs(),
        AppDetailsStore.getAppDetailsTabsObservable(),
    );
    const history = useHistory();

    useEffect(() => {
        const _pods = IndexStore.getNodesByKind(NodeType.Pod);
        const isLogAnalyserURL = window.location.href.indexOf(URLS.APP_DETAILS_LOG) > 0;
        AppDetailsStore.initAppDetailsTabs(url, _pods.length > 0, isLogAnalyserURL);
    }, [params.appId, params.envId]);

    const handleCloseTab = (e: any, tabUrl: string) => {
        e.stopPropagation();
        AppDetailsStore.removeAppDetailsTab(tabUrl);
        setTimeout(() => {
            history.push(url);
        }, 1);
    };

    return (
        <div>
            <div className='bcn-1'>
                <EnvironmentSelectorComponent />
                <EnvironmentStatusComponent />
            </div>

            {/*<------- TODO : Error display on app detail -----> */}
            {/* <SyncError appStreamData={streamData} /> */}

            <div className="resource-tree-wrapper bcn-1 flexbox pl-20 pr-20 pt-16">
                <ul className="tab-list">
                    {applicationObjectTabs.map((tab: ApplicationObject, index: number) => {
                        return (
                            <li key={index + 'tab'} className="flex left ellipsis-right ">
                                <Tippy
                                    className={`${
                                        tab.name === AppDetailsTabs.log_analyzer ||
                                        tab.name === AppDetailsTabs.k8s_Resources
                                            ? 'w-0 h-0 bcn-0'
                                            : ''
                                    } default-tt `}
                                    arrow={false}
                                    placement="top"
                                    content={
                                        tab.name !== AppDetailsTabs.log_analyzer &&
                                        tab.name !== AppDetailsTabs.k8s_Resources &&
                                        tab.title
                                    }
                                >
                                    <div className="flex">
                                        <div
                                            className={`${
                                                tab.isSelected ? 'resource-tree-tab bcn-0 cn-9' : ''
                                            } flex left pl-12 pt-8 pb-8 pr-12 `}
                                        >
                                            <NavLink
                                                to={`${tab.url}`}
                                                className={`resource-tree__tab-hover tab-list__tab resource-tab__node cursor cn-9 fw-6 no-decor `}
                                            >
                                                <div className={`flex left ${tab.isSelected ? 'fw-6 cn-9' : ''}`}>
                                                    {tab.title === AppDetailsTabs.log_analyzer ? (
                                                        <span className="icon-dim-16 resource-tree__tab-hover fcb-9">
                                                            {' '}
                                                            <LogAnalyzerIcon />
                                                        </span>
                                                    ) : (
                                                        ''
                                                    )}
                                                    {tab.title === AppDetailsTabs.k8s_Resources ? (
                                                        <span className="icon-dim-16 resource-tree__tab-hover fcn-9 ">
                                                            {' '}
                                                            <K8ResourceIcon />
                                                        </span>
                                                    ) : (
                                                        ''
                                                    )}
                                                    <span
                                                        className={`${
                                                            tab.name !== AppDetailsTabs.k8s_Resources &&
                                                            tab.name !== AppDetailsTabs.log_analyzer
                                                                ? 'mr-8'
                                                                : 'ml-8 text-capitalize '
                                                        } fs-12 `}
                                                    >
                                                        {tab.name}
                                                    </span>
                                                </div>
                                            </NavLink>

                                            {tab.name !== AppDetailsTabs.log_analyzer &&
                                                tab.name !== AppDetailsTabs.k8s_Resources && (
                                                    <span className="resource-tab__close-wrapper flex br-5">
                                                        <Cross
                                                            onClick={(e) => handleCloseTab(e, tab.url)}
                                                            className="icon-dim-16 cursor"
                                                        />
                                                    </span>
                                                )}
                                        </div>
                                        <div className={` ${!tab.isSelected ? 'resource-tree-tab__border' : ''}`}></div>
                                    </div>
                                </Tippy>
                            </li>
                        );
                    })}
                </ul>
            </div>
            <Switch>
                <Route
                    path={`${path}/${URLS.APP_DETAILS_K8}/:nodeType/:podName`}
                    render={() => {
                        return <NodeDetailComponent />;
                    }}
                />
                <Route
                    path={`${path}/${URLS.APP_DETAILS_K8}/:nodeType`}
                    render={() => {
                        return <K8ResourceComponent />;
                    }}
                />
                <Route
                    path={`${path}/${URLS.APP_DETAILS_K8}`}
                    render={() => {
                        return <K8ResourceComponent />;
                    }}
                />
                <Route
                    exact
                    path={`${path}/${URLS.APP_DETAILS_LOG}`}
                    render={() => {
                        return <LogAnalyzerComponent />;
                    }}
                />
                <Redirect to={`${path}/${URLS.APP_DETAILS_K8}`} />
            </Switch>
        </div>
    );
};

export default AppDetailsComponent;
