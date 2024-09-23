/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useState, useEffect, useRef } from 'react'
import { K8ResourceComponent } from './k8Resource/K8Resource.component'
import './appDetails.scss'
import LogAnalyzerComponent from './logAnalyzer/LogAnalyzer.component'
import { Route, Switch, useRouteMatch, Redirect, useParams } from 'react-router-dom'
import { URLS } from '../../../config'
import AppDetailsStore from './appDetails.store'
import { NodeTreeDetailTabProps, NodeType } from './appDetails.type'
import NodeDetailComponent from './k8Resource/nodeDetail/NodeDetail.component'
import IndexStore from './index.store'
import NodeTreeTabList from './k8Resource/NodeTreeTabList'

const NodeTreeDetailTab = ({
    appDetails,
    externalLinks,
    monitoringTools,
    isDevtronApp = false,
    isExternalApp,
    isDeploymentBlocked,
}: NodeTreeDetailTabProps) => {
    const params = useParams<{ appId: string; envId: string; nodeType: string }>()
    const { path, url } = useRouteMatch()
    const [clickedNodes, registerNodeClick] = useState<Map<string, string>>(new Map<string, string>())
    const tabRef = useRef<HTMLDivElement>(null)
    const [logSearchTerms, setLogSearchTerms] = useState<Record<string, string>>()

    useEffect(() => {
        const _pods = IndexStore.getNodesByKind(NodeType.Pod)
        const isLogAnalyserURL = window.location.href.indexOf(URLS.APP_DETAILS_LOG) > 0
        AppDetailsStore.initAppDetailsTabs(url, _pods.length > 0, isLogAnalyserURL, isExternalApp)
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
                        appType={appDetails.appType}
                        isExternalApp={isExternalApp}
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
                                        isDeploymentBlocked={isDeploymentBlocked}
                                        clusterId={appDetails.clusterId}
                                        isExternalApp={isExternalApp}
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
                                        isExternalApp={isExternalApp}
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
                                        clusterId={appDetails.clusterId}
                                        isDeploymentBlocked={isDeploymentBlocked}
                                        isExternalApp={isExternalApp}
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
                                        isDeploymentBlocked={isDeploymentBlocked}
                                        clusterId={appDetails.clusterId}
                                        isExternalApp={isExternalApp}
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
                                        isExternalApp={isExternalApp}
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
