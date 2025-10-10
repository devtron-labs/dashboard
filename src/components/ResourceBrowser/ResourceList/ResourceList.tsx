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

import { useEffect, useMemo, useState } from 'react'
import { Route, useHistory, useLocation, useParams, useRouteMatch } from 'react-router-dom'

import {
    BreadcrumbText,
    DevtronProgressing,
    ErrorScreenManager,
    getInfrastructureManagementBreadcrumb,
    getResourceGroupListRaw,
    handleAnalyticsEvent,
    Icon,
    RESOURCE_BROWSER_ROUTES,
    URLS,
    useAsync,
    useBreadcrumb,
    useEffectAfterMount,
    useMainContext,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICArrowUpCircle } from '@Icons/ic-arrow-up-circle.svg'
import { ReactComponent as ICChartLineUp } from '@Icons/ic-chart-line-up.svg'
import { ReactComponent as ICObject } from '@Icons/ic-object.svg'
import { ReactComponent as ICTerminalFill } from '@Icons/ic-terminal-fill.svg'
import { ReactComponent as ICWorldBlack } from '@Icons/ic-world-black.svg'
import { ClusterListType } from '@Components/ClusterNodes/types'
import { DynamicTabsProps, DynamicTabsVariantType, UpdateTabUrlParamsType } from '@Components/common/DynamicTabs/types'
import { DEFAULT_CLUSTER_ID } from '@Pages/GlobalConfigurations/ClustersAndEnvironments/cluster.type'

import ClusterOverview from '../../ClusterNodes/ClusterOverview'
import { importComponentFromFELibrary } from '../../common'
import { DynamicTabs, useTabs } from '../../common/DynamicTabs'
import {
    MONITORING_DASHBOARD_TAB_ID,
    RESOURCE_RECOMMENDER_TAB_ID,
    ResourceBrowserTabsId,
    SIDEBAR_KEYS,
    UPGRADE_CLUSTER_CONSTANTS,
} from '../Constants'
import { renderCreateResourceButton } from '../PageHeader.buttons'
import { getClusterListing } from '../ResourceBrowser.service'
import { ClusterDetailBaseParams, ClusterOptionType, K8SResourceListType } from '../Types'
import { getClusterChangeRedirectionUrl, getTabsBasedOnRole } from '../Utils'
import AdminTerminal from './AdminTerminal'
import ClusterSelector from './ClusterSelector'
import ClusterUpgradeCompatibilityInfo from './ClusterUpgradeCompatibilityInfo'
import { DynamicTabComponentWrapper } from './DynamicTabComponentWrapper'
import K8SResourceTabComponent from './K8SResourceTabComponent'
import NodeDetailComponentWrapper from './NodeDetailComponentWrapper'
import NodeDetailWrapper from './NodeDetailWrapper'
import { renderRefreshBar } from './ResourceList.component'
import ResourcePageHeader from './ResourcePageHeader'
import { ResourceRecommenderTableViewWrapper } from './ResourceRecommenderTableViewWrapper'
import { ResourceListProps } from './types'
import { dynamicSort, getClusterOptions } from './utils'

const MonitoringDashboard = importComponentFromFELibrary('MonitoringDashboard', null, 'function')
const ResourceRecommender = importComponentFromFELibrary('ResourceRecommender', null, 'function')
const CompareClusterButton = importComponentFromFELibrary('CompareClusterButton', null, 'function')

const ResourceList = ({ selectedCluster, k8SObjectMapRaw }: ResourceListProps) => {
    const params = useParams<ClusterDetailBaseParams>()
    const { clusterId } = params
    const { path } = useRouteMatch()
    const location = useLocation()
    const {
        tabs,
        initTabs,
        addTab,
        markTabActiveById,
        removeTabByIdentifier,
        updateTabUrl,
        updateTabComponentKey,
        updateTabLastSyncMoment,
        stopTabByIdentifier,
        getTabId,
        getTabById,
    } = useTabs(`${URLS.INFRASTRUCTURE_MANAGEMENT_RESOURCE_BROWSER}/${clusterId}`)
    const [logSearchTerms, setLogSearchTerms] = useState<Record<string, string>>()
    const [isDataStale, setIsDataStale] = useState(false)
    const { setIntelligenceConfig, setAIAgentContext, isResourceRecommendationEnabled } = useMainContext()

    const canRenderResourceRecommender = ResourceRecommender && isResourceRecommendationEnabled

    // This needs to rename, not doing due to time constraints
    const lowercaseKindToResourceGroupMap = useMemo(
        () =>
            (k8SObjectMapRaw?.result.apiResources ?? []).reduce<K8SResourceListType['lowercaseKindToResourceGroupMap']>(
                (acc, resourceGroup) => {
                    // Using Group-Kind as key, but we need to move to using map instead
                    acc[`${resourceGroup.gvk.Group.toLowerCase()}-${resourceGroup.gvk.Kind.toLowerCase()}`] =
                        resourceGroup

                    return acc
                },
                {},
            ),
        [k8SObjectMapRaw],
    )

    const initTabsBasedOnRole = (reInit: boolean) => {
        const _tabs = getTabsBasedOnRole({
            selectedCluster,
            canRenderResourceRecommender,
        })
        initTabs(_tabs, reInit, null)
    }

    useEffect(() => {
        initTabsBasedOnRole(false)

        return () => {
            setIntelligenceConfig(null)
            setAIAgentContext(null)
        }
    }, [])
    useEffectAfterMount(() => initTabsBasedOnRole(true), [clusterId])

    useEffect(() => {
        setAIAgentContext({
            path,
            context: {
                ...params,
                clusterName: selectedCluster.label,
                search: location.search,
            },
        })
    }, [location.pathname, location.search, selectedCluster.label])

    const refreshData = () => {
        const activeTab = tabs.find((tab) => tab.isSelected)
        updateTabComponentKey(activeTab.id)
        updateTabLastSyncMoment(activeTab.id)
        setIsDataStale(false)
    }

    const dynamicTabsTimerConfig = useMemo(
        () =>
            tabs.reduce(
                (acc, tab) => {
                    acc[tab.id] = {
                        reload: refreshData,
                        showTimeSinceLastSync: tab.id === ResourceBrowserTabsId.k8s_Resources,
                    }

                    return acc
                },
                {} as DynamicTabsProps['timerConfig'],
            ),
        [tabs],
    )

    const getUpdateTabUrlForId =
        (id: UpdateTabUrlParamsType['id']): ClusterListType['updateTabUrl'] =>
        ({ url: _url, dynamicTitle, retainSearchParams }: Omit<UpdateTabUrlParamsType, 'id'>) =>
            updateTabUrl({ id, url: _url, dynamicTitle, retainSearchParams })

    const renderTerminal = () => {
        const tab = getTabById(ResourceBrowserTabsId.terminal)

        if (!tab?.isAlive) {
            return null
        }

        return (
            <div className={!tab?.isSelected ? 'cluster-terminal-hidden' : 'flexbox-col flex-grow-1'}>
                <AdminTerminal updateTabUrl={updateTabUrl} key={tab.componentKey} />
            </div>
        )
    }

    const DynamicTabComponentWrapperBaseProps = {
        updateTabUrl,
        markTabActiveById,
        getTabId,
        getTabById,
    }

    if (!tabs.length) {
        return <DevtronProgressing parentClasses="h-100 flex bg__primary" classes="icon-dim-80" />
    }

    return (
        <>
            <DynamicTabs
                tabs={tabs}
                backgroundColorToken="bg__tertiary"
                variant={DynamicTabsVariantType.RECTANGULAR}
                removeTabByIdentifier={removeTabByIdentifier}
                markTabActiveById={markTabActiveById}
                stopTabByIdentifier={stopTabByIdentifier}
                setIsDataStale={setIsDataStale}
                timerConfig={dynamicTabsTimerConfig}
                iconsConfig={{
                    [getTabId(
                        UPGRADE_CLUSTER_CONSTANTS.ID_PREFIX,
                        UPGRADE_CLUSTER_CONSTANTS.NAME,
                        SIDEBAR_KEYS.upgradeClusterGVK.Kind.toLowerCase(),
                    )]: <ICArrowUpCircle className="scn-7" />,
                    [ResourceBrowserTabsId.terminal]: <ICTerminalFill className="fcn-7" />,
                    [ResourceBrowserTabsId.cluster_overview]: <ICWorldBlack className="scn-7" />,
                    [ResourceBrowserTabsId.k8s_Resources]: <ICObject className="fcn-7" />,
                    [MONITORING_DASHBOARD_TAB_ID]: <ICChartLineUp className="scn-7" />,
                    [RESOURCE_RECOMMENDER_TAB_ID]: <Icon name="ic-speedometer" color="N700" />,
                }}
            />
            <Route path={RESOURCE_BROWSER_ROUTES.OVERVIEW} exact>
                <DynamicTabComponentWrapper type="fixed" {...DynamicTabComponentWrapperBaseProps}>
                    <ClusterOverview selectedCluster={selectedCluster} />
                </DynamicTabComponentWrapper>
            </Route>
            {MonitoringDashboard && (
                <Route path={RESOURCE_BROWSER_ROUTES.MONITORING_DASHBOARD} exact>
                    <DynamicTabComponentWrapper type="fixed" {...DynamicTabComponentWrapperBaseProps}>
                        <MonitoringDashboard />
                    </DynamicTabComponentWrapper>
                </Route>
            )}
            <Route path={RESOURCE_BROWSER_ROUTES.TERMINAL} exact>
                <DynamicTabComponentWrapper type="fixed" {...DynamicTabComponentWrapperBaseProps} />
            </Route>
            {ResourceRecommender && (
                <Route path={RESOURCE_BROWSER_ROUTES.RESOURCE_RECOMMENDER} exact>
                    <DynamicTabComponentWrapper type="fixed" {...DynamicTabComponentWrapperBaseProps}>
                        <ResourceRecommender
                            selectedCluster={selectedCluster}
                            ResourceRecommenderTableViewWrapper={ResourceRecommenderTableViewWrapper}
                            dynamicSort={dynamicSort}
                        />
                    </DynamicTabComponentWrapper>
                </Route>
            )}
            {ClusterUpgradeCompatibilityInfo && (
                <Route path={RESOURCE_BROWSER_ROUTES.CLUSTER_UPGRADE} exact>
                    <DynamicTabComponentWrapper type="dynamic" {...DynamicTabComponentWrapperBaseProps} addTab={addTab}>
                        <ClusterUpgradeCompatibilityInfo
                            clusterName={selectedCluster.label}
                            updateTabUrl={getUpdateTabUrlForId(
                                getTabId(
                                    UPGRADE_CLUSTER_CONSTANTS.ID_PREFIX,
                                    UPGRADE_CLUSTER_CONSTANTS.NAME,
                                    SIDEBAR_KEYS.upgradeClusterGVK.Kind.toLowerCase(),
                                ),
                            )}
                            lowercaseKindToResourceGroupMap={lowercaseKindToResourceGroupMap}
                        />
                    </DynamicTabComponentWrapper>
                </Route>
            )}
            <Route path={RESOURCE_BROWSER_ROUTES.NODE_DETAIL} exact>
                <DynamicTabComponentWrapper type="dynamic" {...DynamicTabComponentWrapperBaseProps} addTab={addTab}>
                    <NodeDetailWrapper
                        getTabId={getTabId}
                        lowercaseKindToResourceGroupMap={lowercaseKindToResourceGroupMap}
                        updateTabUrl={updateTabUrl}
                    />
                </DynamicTabComponentWrapper>
            </Route>
            <Route path={RESOURCE_BROWSER_ROUTES.K8S_RESOURCE_DETAIL}>
                <DynamicTabComponentWrapper type="dynamic" {...DynamicTabComponentWrapperBaseProps} addTab={addTab}>
                    <NodeDetailComponentWrapper
                        clusterName={selectedCluster.label}
                        getTabId={getTabId}
                        logSearchTerms={logSearchTerms}
                        lowercaseKindToResourceGroupMap={lowercaseKindToResourceGroupMap}
                        removeTabByIdentifier={removeTabByIdentifier}
                        setLogSearchTerms={setLogSearchTerms}
                        updateTabUrl={updateTabUrl}
                        loadingResources={false}
                    />
                </DynamicTabComponentWrapper>
            </Route>
            <Route path={RESOURCE_BROWSER_ROUTES.K8S_RESOURCE_LIST} exact>
                <DynamicTabComponentWrapper type="fixed" {...DynamicTabComponentWrapperBaseProps}>
                    <K8SResourceTabComponent
                        selectedCluster={selectedCluster}
                        addTab={addTab}
                        renderRefreshBar={renderRefreshBar(
                            isDataStale,
                            getTabById(ResourceBrowserTabsId.k8s_Resources)?.lastSyncMoment?.toString(),
                            refreshData,
                        )}
                        updateK8sResourceTab={getUpdateTabUrlForId(ResourceBrowserTabsId.k8s_Resources)}
                        clusterName={selectedCluster.label}
                        lowercaseKindToResourceGroupMap={lowercaseKindToResourceGroupMap}
                        updateTabLastSyncMoment={updateTabLastSyncMoment}
                    />
                </DynamicTabComponentWrapper>
            </Route>

            {renderTerminal()}
        </>
    )
}

const ResourceListWrapper = () => {
    const { clusterId } = useParams<ClusterDetailBaseParams>()
    const [loading, clusterList, error] = useAsync(() => getClusterListing(true))
    const [lastUpdateTimestamp, setLastUpdateTimestamp] = useState<string>(null)

    const { replace } = useHistory()
    const { setIntelligenceConfig } = useMainContext()

    const clusterOptions: ClusterOptionType[] = useMemo(() => getClusterOptions(clusterList), [clusterList])

    /* NOTE: this is being used as dependency in useEffect down the tree */
    const selectedCluster = useMemo(
        () =>
            clusterOptions?.find((cluster) => String(cluster.value) === clusterId) ?? {
                label: '',
                value: clusterId,
                isProd: false,
                isClusterInCreationPhase: false,
                installationId: 0,
            },
        [clusterId, clusterOptions],
    )

    const onClusterChange = (selected: ClusterOptionType) => {
        handleAnalyticsEvent({
            category: 'Resource Browser',
            action: 'RB_CLUSTER_SWITCH_CLUSTER',
        })
        if (selected.value === selectedCluster?.value) {
            return
        }

        setIntelligenceConfig(null)

        /* if user manually tries default cluster url redirect */
        if (Number(selected.value) === DEFAULT_CLUSTER_ID && window._env_.HIDE_DEFAULT_CLUSTER) {
            replace({
                pathname: URLS.INFRASTRUCTURE_MANAGEMENT_RESOURCE_BROWSER,
            })
            return
        }

        const newPath = getClusterChangeRedirectionUrl(
            selected.isClusterInCreationPhase,
            String(selected.isClusterInCreationPhase ? selected.installationId : selected.value),
        )

        replace({
            pathname: newPath,
        })
    }

    const [rawGVKLoader, k8SObjectMapRaw, , reloadK8sObjectMapRaw] = useAsync(
        () => getResourceGroupListRaw(clusterId),
        [clusterId],
    )

    const closeResourceModal = (_refreshData: boolean) => {
        if (_refreshData) {
            setLastUpdateTimestamp(new Date().toISOString())
            reloadK8sObjectMapRaw()
        }
    }

    const renderPageHeaderActionButtons = () => {
        const clusterConnectionFailed = !!clusterList?.find(({ id }) => clusterId === String(id))?.errorInNodeListing

        return (
            <div className="flexbox dc__align-items-center dc__gap-8">
                {CompareClusterButton && !!clusterId && !clusterConnectionFailed && (
                    <CompareClusterButton sourceClusterId={clusterId} />
                )}
                {renderCreateResourceButton(clusterId, closeResourceModal)()}
            </div>
        )
    }

    const { breadcrumbs } = useBreadcrumb(
        {
            alias: {
                ...getInfrastructureManagementBreadcrumb(),
                'resource-browser': {
                    component: <BreadcrumbText heading="Resource Browser" />,
                    linked: true,
                },
                ':clusterId(\\d+)': {
                    component: (
                        <ClusterSelector
                            onChange={onClusterChange}
                            clusterList={clusterOptions || []}
                            clusterId={clusterId}
                            isClusterListLoading={false}
                        />
                    ),
                    linked: false,
                },
                ':namespace': null,
                ':nodeType': null,
                ':group': null,
                ':node?': null,
            },
        },
        [clusterId, clusterOptions],
    )

    if (error) {
        return <ErrorScreenManager code={error.code} />
    }

    if (loading || rawGVKLoader) {
        return <DevtronProgressing parentClasses="h-100 flex bg__primary" classes="icon-dim-80" />
    }

    return (
        <div className="resource-browser-container flexbox-col h-100 bg__primary">
            <ResourcePageHeader
                breadcrumbs={breadcrumbs}
                renderPageHeaderActionButtons={renderPageHeaderActionButtons}
            />
            <ResourceList
                key={lastUpdateTimestamp}
                selectedCluster={selectedCluster}
                k8SObjectMapRaw={k8SObjectMapRaw}
            />
        </div>
    )
}

export default ResourceListWrapper
