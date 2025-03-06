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
import ReactGA from 'react-ga4'
import { Route, Switch, useRouteMatch, Redirect, useLocation, useHistory } from 'react-router-dom'
import { DynamicTabs, useTabs } from '@Components/common/DynamicTabs'
import { EnvResourceType, noop } from '@devtron-labs/devtron-fe-common-lib'
import { DynamicTabsProps, DynamicTabsVariantType } from '@Components/common/DynamicTabs/types'
import { ReactComponent as ICObject } from '@Icons/ic-object.svg'
import { ReactComponent as ICLogs } from '@Icons/ic-logs.svg'
import { K8ResourceComponent } from './k8Resource/K8Resource.component'
import LogAnalyzerComponent from './logAnalyzer/LogAnalyzer.component'
import { URLS } from '../../../config'
import { APP_DETAILS_DYNAMIC_TABS_FALLBACK_INDEX, AppDetailsTabs, getInitialTabs } from './appDetails.store'
import { K8ResourceComponentProps, NodeTreeDetailTabProps, NodeType } from './appDetails.type'
import IndexStore from './index.store'
import NodeDetailComponentWrapper from './NodeDetailComponentWrapper'
import { getApplicationsGAEvent } from './k8Resource/utils'
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
    const { url: routeMatchUrl, path: routeMatchPath } = useRouteMatch()
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
    } = useTabs(routeMatchUrl, APP_DETAILS_DYNAMIC_TABS_FALLBACK_INDEX)
    const location = useLocation()
    const { push } = useHistory()
    const [clickedNodes, registerNodeClick] = useState<Map<string, string>>(new Map<string, string>())
    const [logSearchTerms, setLogSearchTerms] = useState<Record<string, string>>()
    const displayLogAnalyzer = IndexStore.getNodesByKind(NodeType.Pod).length > 0 && !isVirtualEnvironment

    useEffect(() => {
        const initialTabs = getInitialTabs(location.pathname, routeMatchUrl, displayLogAnalyzer)

        initTabs(initialTabs, false, !displayLogAnalyzer ? [AppDetailsTabs.log_analyzer] : null)

        // NOTE: if we need to hide (remove) logAnalyzer tab but user was on this tab then we need
        if (!displayLogAnalyzer && location.pathname.includes(URLS.APP_DETAILS_LOG)) {
            push(initialTabs[APP_DETAILS_DYNAMIC_TABS_FALLBACK_INDEX].url)
        }
    }, [displayLogAnalyzer])

    const handleMarkK8sResourceTabSelected = () => {
        markTabActiveById(AppDetailsTabs.k8s_Resources).catch(noop)
    }

    const handleUpdateK8sResourceTabUrl: K8ResourceComponentProps['handleUpdateK8sResourceTabUrl'] = (props) => {
        updateTabUrl({ id: AppDetailsTabs.k8s_Resources, ...props })
    }

    const handleMarkLogAnalyzerTabSelected = () => {
        markTabActiveById(AppDetailsTabs.log_analyzer).catch(noop)
    }

    const handleReloadK8sResourceTab = () => {
        handleReloadResourceTree()
        ReactGA.event({
            category: getApplicationsGAEvent(appDetails.appType),
            action: getApplicationsGAEvent(appDetails.appType),
        })
    }

    // NOTE: don't render any of the components before tabs are initialized
    // this is cuz, the components mark their own corresponding tabs as the selected tabs on mount
    return (
        appDetails?.resourceTree?.nodes?.length > 0 &&
        tabs.length && (
            <div className="dc__position-sticky dc__top-0 h-100 dc__no-shrink flexbox-col">
                <div className="bg__primary pt-7 dc__no-shrink">
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
                                        reload: handleReloadK8sResourceTab,
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
                <div className="flexbox-col w-100 flex-grow-1">
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
                                    handleMarkLogAnalyzerTabSelected={handleMarkLogAnalyzerTabSelected}
                                />
                            )}
                        />
                        <Redirect to={`${routeMatchPath}/${URLS.APP_DETAILS_K8}`} />
                    </Switch>
                </div>
            </div>
        )
    )
}

export default NodeTreeDetailTab
