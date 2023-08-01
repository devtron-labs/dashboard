import React, { useState, useEffect, useRef } from 'react';
import K8ResourceComponent from './k8Resource/K8Resource.component';
import './appDetails.scss';
import LogAnalyzerComponent from './logAnalyzer/LogAnalyzer.component';
import { Route, Switch, useLocation } from 'react-router-dom';
import { useRouteMatch, Redirect, useParams } from 'react-router';
import { URLS } from '../../../config';
import AppDetailsStore from './appDetails.store';
import { NodeType, NodeTreeDetailTabProps } from './appDetails.type';
import NodeDetailComponent from './k8Resource/nodeDetail/NodeDetail.component';
import IndexStore from './index.store';
import NodeTreeTabList from './k8Resource/NodeTreeTabList';

function NodeTreeDetailTab({
    appDetails,
    externalLinks,
    monitoringTools,
    isDevtronApp = false,
}: NodeTreeDetailTabProps) {
    const params = useParams<{ appId: string; envId: string; nodeType: string }>()
    const { path, url } = useRouteMatch()
    const [clickedNodes, registerNodeClick] = useState<Map<string, string>>(new Map<string, string>())
    const tabRef = useRef<HTMLDivElement>(null)
    const [logSearchTerms, setLogSearchTerms] = useState<Record<string, string>>()

    useEffect(() => {
        const _pods = IndexStore.getNodesByKind(NodeType.Pod)
        const isLogAnalyserURL = window.location.href.indexOf(URLS.APP_DETAILS_LOG) > 0
        AppDetailsStore.initAppDetailsTabs(url, _pods.length > 0, isLogAnalyserURL)
    }, [params.appId, params.envId])

    const handleFocusTabs = () => {
        if (tabRef?.current) {
            tabRef.current.focus()
        }
    }

    return (
        <>
            {appDetails?.resourceTree?.nodes?.length > 0 && (
                <>
                    <NodeTreeTabList
                        logSearchTerms={logSearchTerms}
                        setLogSearchTerms={setLogSearchTerms}
                        tabRef={tabRef}
                    />
                    <Switch>
                        <Route
                            path={`${path}/${URLS.APP_DETAILS_K8}/:nodeType/group/:resourceName`}
                            render={() => {
                                return (
                                    <K8ResourceComponent
                                        clickedNodes={clickedNodes}
                                        registerNodeClick={registerNodeClick}
                                        handleFocusTabs={handleFocusTabs}
                                        externalLinks={externalLinks}
                                        monitoringTools={monitoringTools}
                                        isDevtronApp={isDevtronApp}
                                    />
                                )
                            }}
                        />
                        <Route
                            path={`${path}/${URLS.APP_DETAILS_K8}/:nodeType/:podName`}
                            render={() => {
                                return (
                                    <NodeDetailComponent
                                        logSearchTerms={logSearchTerms}
                                        setLogSearchTerms={setLogSearchTerms}
                                    />
                                )
                            }}
                        />
                        <Route
                            path={`${path}/${URLS.APP_DETAILS_K8}/:nodeType`}
                            render={() => {
                                return (
                                    <K8ResourceComponent
                                        clickedNodes={clickedNodes}
                                        registerNodeClick={registerNodeClick}
                                        handleFocusTabs={handleFocusTabs}
                                        externalLinks={externalLinks}
                                        monitoringTools={monitoringTools}
                                        isDevtronApp={isDevtronApp}
                                    />
                                )
                            }}
                        />
                        <Route
                            path={`${path}/${URLS.APP_DETAILS_K8}`}
                            render={() => {
                                return (
                                    <K8ResourceComponent
                                        clickedNodes={clickedNodes}
                                        registerNodeClick={registerNodeClick}
                                        handleFocusTabs={handleFocusTabs}
                                        externalLinks={externalLinks}
                                        monitoringTools={monitoringTools}
                                        isDevtronApp={isDevtronApp}
                                    />
                                )
                            }}
                        />
                        <Route
                            exact
                            path={`${path}/${URLS.APP_DETAILS_LOG}`}
                            render={() => {
                                return (
                                    <LogAnalyzerComponent
                                        logSearchTerms={logSearchTerms}
                                        setLogSearchTerms={setLogSearchTerms}
                                    />
                                )
                            }}
                        />
                        <Redirect to={`${path}/${URLS.APP_DETAILS_K8}`} />
                    </Switch>
                </>
            )}
        </>
    )
}

export default NodeTreeDetailTab
