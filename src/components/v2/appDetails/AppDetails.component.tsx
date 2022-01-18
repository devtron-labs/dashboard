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
import { ApplicationObject, AppStreamData, NodeType } from './appDetails.type';
import NodeDetailComponent from './k8Resource/nodeDetail/NodeDetail.component';
import Tippy from '@tippyjs/react';
import IndexStore from './index.store';
import EnvironmentStatusComponent from './sourceInfo/environmentStatus/EnvironmentStatus.component';
import EnvironmentSelectorComponent from './sourceInfo/EnvironmentSelector.component';
import SyncErrorComponent from './SyncError.component';
import { Progressing, useEventSource } from '../../common';

const AppDetailsComponent = () => {
    const params = useParams<{ appId: string; envId: string; nodeType: string }>();
    const { path, url } = useRouteMatch();
    const [loading, setLoading] = useState(true);
    const history = useHistory();

    const [streamData, setStreamData] = useState<AppStreamData>(null);
    const [clickedNodes, registerNodeClick] = useState<Map<string, string>>(new Map<string, string>())
    const [applicationObjectTabs] = useSharedState(
        AppDetailsStore.getAppDetailsTabs(),
        AppDetailsStore.getAppDetailsTabsObservable(),
    );

    const appDetails = IndexStore.getAppDetails();
    const Host = process.env.REACT_APP_ORCHESTRATOR_ROOT;
    const pathname = window.location.pathname;

    const syncSSE = useEventSource(
        `${Host}/api/v1/applications/stream?name=${appDetails?.appName}-${appDetails?.environmentName}`,
        [params.appId, params.envId],
        !!appDetails?.appName && !!appDetails?.environmentName,
        (event) => setStreamData(JSON.parse(event.data)),
    );

    useEffect(() => {
        const _pods = IndexStore.getNodesByKind(NodeType.Pod);
        const isLogAnalyserURL = window.location.href.indexOf(URLS.APP_DETAILS_LOG) > 0;
        AppDetailsStore.initAppDetailsTabs(url, _pods.length > 0, isLogAnalyserURL);
    }, [params.appId, params.envId]);

    const handleCloseTab = (e: any, tabIdentifier: string) => {
        e.stopPropagation();
        const pushURL = AppDetailsStore.removeAppDetailsTabByIdentifier(tabIdentifier);
        setTimeout(() => {
            if (pushURL) {
                history.push(pushURL);
            }
        }, 1);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div>
                <EnvironmentSelectorComponent />
                <EnvironmentStatusComponent />
            </div>

            <SyncErrorComponent appStreamData={streamData} />

            <div className="resource-tree-wrapper flexbox pl-20 pr-20">
                <ul className="tab-list">
                    {applicationObjectTabs.map((tab: ApplicationObject, index: number) => {
                        return (
                            <>
                                <li
                                    key={index + 'tab'}
                                    id={`${params.nodeType}_${tab.name}`}
                                    className="flex left ellipsis-right "
                                >
                                    <Tippy
                                        className={`${
                                            tab.name === AppDetailsTabs.log_analyzer ||
                                            tab.name === AppDetailsTabs.k8s_Resources
                                                ? 'hide-section'
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
                                                    <div
                                                        className={`flex left ${tab.isSelected ? 'cn-9' : ''} ${
                                                            tab.isDeleted && 'tab-list__deleted cr-5'
                                                        }`}
                                                    >
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
                                                        <div className="resource-tab__close-wrapper flex br-5">
                                                            <Cross
                                                                onClick={(e) => handleCloseTab(e, tab.title)}
                                                                className="icon-dim-16 cursor"
                                                            />
                                                        </div>
                                                    )}
                                            </div>
                                            <div
                                                className={` ${!tab.isSelected ? 'resource-tree-tab__border' : ''}`}
                                            ></div>
                                        </div>
                                    </Tippy>
                                </li>
                            </>
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
                        return <K8ResourceComponent clickedNodes={clickedNodes} registerNodeClick={registerNodeClick} />;
                    }}
                />
                <Route
                    path={`${path}/${URLS.APP_DETAILS_K8}`}
                    render={() => {
                        return <K8ResourceComponent clickedNodes={clickedNodes} registerNodeClick={registerNodeClick} />;
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
