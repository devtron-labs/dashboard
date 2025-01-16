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

import { useState, useEffect } from 'react'
import { Route, Switch, useRouteMatch, Redirect, useLocation, useParams } from 'react-router-dom'
import { DynamicTabs, useTabs } from '@Components/common/DynamicTabs'
import { EnvResourceType, noop } from '@devtron-labs/devtron-fe-common-lib'
import { DynamicTabsProps, DynamicTabsVariantType } from '@Components/common/DynamicTabs/types'
import { ReactComponent as ICObject } from '@Icons/ic-object.svg'
import { ReactComponent as ICLogs } from '@Icons/ic-logs.svg'
import { K8ResourceComponent } from './k8Resource/K8Resource.component'
import LogAnalyzerComponent from './logAnalyzer/LogAnalyzer.component'
import { URLS } from '../../../config'
import { AppDetailsTabs, getInitialTabs } from './appDetails.store'
import { K8ResourceComponentProps, NodeTreeDetailTabProps, NodeType } from './appDetails.type'
import IndexStore from './index.store'
import NodeDetailComponentWrapper from './NodeDetailComponentWrapper'
import './appDetails.scss'

const NodeTreeDetailTab = ({
    appDetails,
    externalLinks,
    monitoringTools,
    isDevtronApp = false,
    isExternalApp,
    isDeploymentBlocked,
    isVirtualEnvironment,
    handleReloadResourceTree,
    isReloadResourceTreeInProgress,
}: NodeTreeDetailTabProps) => {
    const { appId, envId } = useParams<Record<'appId' | 'envId', string>>()
    const {
        tabs,
        initTabs,
        markTabActiveById,
        removeTabByIdentifier,
        stopTabByIdentifier,
        addTab,
        getTabId,
        updateTabUrl,
        // NOTE: fallback to 0th index since that is the k8s_resource tab
    } = useTabs(`${URLS.APP}/${appId}/${URLS.APP_DETAILS}/${envId}`, 0)
    const { url: routeMatchUrl, path: routeMatchPath } = useRouteMatch()
    const location = useLocation()
    const [clickedNodes, registerNodeClick] = useState<Map<string, string>>(new Map<string, string>())
    const [logSearchTerms, setLogSearchTerms] = useState<Record<string, string>>()
    const displayLogAnalyzer = IndexStore.getNodesByKind(NodeType.Pod).length > 0 && !isVirtualEnvironment

    useEffect(() => {
        initTabs(
            getInitialTabs(location.pathname, routeMatchUrl, displayLogAnalyzer),
            false,
            !displayLogAnalyzer ? [AppDetailsTabs.log_analyzer] : null,
        )
    }, [displayLogAnalyzer])

    const handleMarkK8sResourceTabSelected = () => {
        markTabActiveById(AppDetailsTabs.k8s_Resources).then(noop).catch(noop)
    }

    const handleUpdateK8sResourceTabUrl: K8ResourceComponentProps['handleUpdateK8sResourceTabUrl'] = (props) => {
        updateTabUrl({ id: AppDetailsTabs.k8s_Resources, ...props })
    }

    const handleMarkLogAnalyzerTabSelected = () => {
        markTabActiveById(AppDetailsTabs.log_analyzer).then(noop).catch(noop)
    }

    // NOTE: don't render any of the components before tabs are initialized
    // this is cuz, the components mark their own corresponding tabs as the selected tabs on mount
    return (
        appDetails?.resourceTree?.nodes?.length > 0 &&
        tabs.length && (
            <>
                <div
                    className="dc__position-sticky dc__left-0 bg__primary dc__top-0"
                    style={{ paddingTop: '7px', zIndex: 10 }}
                >
                    <DynamicTabs
                        variant={DynamicTabsVariantType.ROUNDED}
                        markTabActiveById={markTabActiveById}
                        removeTabByIdentifier={removeTabByIdentifier}
                        stopTabByIdentifier={stopTabByIdentifier}
                        tabs={tabs}
                        timerConfig={tabs.reduce(
                            (acc, tab) => {
                                if (tab.id === AppDetailsTabs.k8s_Resources) {
                                    acc[tab.id] = {
                                        isLoading: isReloadResourceTreeInProgress,
                                        reload: handleReloadResourceTree,
                                    }
                                }

                                return acc
                            },
                            {} as DynamicTabsProps['timerConfig'],
                        )}
                        iconsConfig={{
                            [AppDetailsTabs.k8s_Resources]: <ICObject className="fcn-7" />,
                            [AppDetailsTabs.log_analyzer]: <ICLogs className="fcn-7" />,
                        }}
                    />
                </div>
                <div className="node-tree-detail-tab__content flexbox-col w-100">
                    <Switch>
                        <Route
                            path={[
                                `${routeMatchPath}/${URLS.APP_DETAILS_K8}/:nodeType/${URLS.APP_DIFF_VIEW}/:resourceType(${Object.values(EnvResourceType).join('|')})/:resourceName?`,
                                `${routeMatchPath}/${URLS.APP_DETAILS_K8}/:nodeType/group/:resourceName`,
                            ]}
                            render={() => (
                                <K8ResourceComponent
                                    clickedNodes={clickedNodes}
                                    registerNodeClick={registerNodeClick}
                                    externalLinks={externalLinks}
                                    monitoringTools={monitoringTools}
                                    isDevtronApp={isDevtronApp}
                                    isDeploymentBlocked={isDeploymentBlocked}
                                    clusterId={appDetails.clusterId}
                                    isExternalApp={isExternalApp}
                                    addTab={addTab}
                                    handleMarkK8sResourceTabSelected={handleMarkK8sResourceTabSelected}
                                    tabs={tabs}
                                    removeTabByIdentifier={removeTabByIdentifier}
                                    handleUpdateK8sResourceTabUrl={handleUpdateK8sResourceTabUrl}
                                />
                            )}
                        />
                        <Route
                            path={`${routeMatchPath}/${URLS.APP_DETAILS_K8}/:nodeType/:podName`}
                            render={() => (
                                <NodeDetailComponentWrapper
                                    addTab={addTab}
                                    getTabId={getTabId}
                                    markTabActiveById={markTabActiveById}
                                    // NOTE: Node detail component requires updateTabUrl to retain sub tab selection (manifest, events, ..etc)
                                    updateTabUrl={updateTabUrl}
                                    nodeDetailComponentProps={{
                                        logSearchTerms,
                                        setLogSearchTerms,
                                        isExternalApp,
                                        lowercaseKindToResourceGroupMap: {},
                                        tabs,
                                    }}
                                />
                            )}
                        />
                        <Route
                            path={`${routeMatchPath}/${URLS.APP_DETAILS_K8}/:nodeType`}
                            render={() => (
                                <K8ResourceComponent
                                    clickedNodes={clickedNodes}
                                    registerNodeClick={registerNodeClick}
                                    externalLinks={externalLinks}
                                    monitoringTools={monitoringTools}
                                    isDevtronApp={isDevtronApp}
                                    clusterId={appDetails.clusterId}
                                    isDeploymentBlocked={isDeploymentBlocked}
                                    isExternalApp={isExternalApp}
                                    addTab={addTab}
                                    handleMarkK8sResourceTabSelected={handleMarkK8sResourceTabSelected}
                                    tabs={tabs}
                                    removeTabByIdentifier={removeTabByIdentifier}
                                    handleUpdateK8sResourceTabUrl={handleUpdateK8sResourceTabUrl}
                                />
                            )}
                        />
                        <Route
                            path={`${routeMatchPath}/${URLS.APP_DETAILS_K8}`}
                            render={() => (
                                <K8ResourceComponent
                                    clickedNodes={clickedNodes}
                                    registerNodeClick={registerNodeClick}
                                    externalLinks={externalLinks}
                                    monitoringTools={monitoringTools}
                                    isDevtronApp={isDevtronApp}
                                    isDeploymentBlocked={isDeploymentBlocked}
                                    clusterId={appDetails.clusterId}
                                    isExternalApp={isExternalApp}
                                    addTab={addTab}
                                    handleMarkK8sResourceTabSelected={handleMarkK8sResourceTabSelected}
                                    tabs={tabs}
                                    removeTabByIdentifier={removeTabByIdentifier}
                                    handleUpdateK8sResourceTabUrl={handleUpdateK8sResourceTabUrl}
                                />
                            )}
                        />
                        <Route
                            exact
                            path={`${routeMatchPath}/${URLS.APP_DETAILS_LOG}`}
                            render={() => (
                                <LogAnalyzerComponent
                                    logSearchTerms={logSearchTerms}
                                    setLogSearchTerms={setLogSearchTerms}
                                    isExternalApp={isExternalApp}
                                    handleMarkLogAnalyzerTabSelected={handleMarkLogAnalyzerTabSelected}
                                />
                            )}
                        />
                        <Redirect to={`${routeMatchPath}/${URLS.APP_DETAILS_K8}`} />
                    </Switch>
                </div>
            </>
        )
    )
}

export default NodeTreeDetailTab
