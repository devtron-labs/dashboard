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

import { useEffect, useMemo, useRef, useState } from 'react'
import { generatePath, Route, useHistory, useParams } from 'react-router-dom'

import {
    BreadCrumb,
    DevtronProgressing,
    ErrorScreenManager,
    getResourceGroupListRaw,
    PageHeader,
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

import { URLS } from '../../../config'
import { DEFAULT_CLUSTER_ID } from '../../cluster/cluster.type'
import { getClusterListMin } from '../../ClusterNodes/clusterNodes.service'
import ClusterOverview from '../../ClusterNodes/ClusterOverview'
import { convertToOptionsList, importComponentFromFELibrary, sortObjectArrayAlphabetically } from '../../common'
import { DynamicTabs, useTabs } from '../../common/DynamicTabs'
import { AppDetailsTabs } from '../../v2/appDetails/appDetails.store'
import {
    DUMMY_RESOURCE_GVK_VERSION,
    K8S_EMPTY_GROUP,
    MONITORING_DASHBOARD_TAB_ID,
    RESOURCE_BROWSER_ROUTES,
    ResourceBrowserTabsId,
    SIDEBAR_KEYS,
    UPGRADE_CLUSTER_CONSTANTS,
} from '../Constants'
import { renderCreateResourceButton } from '../PageHeader.buttons'
import { clearCacheRepo } from '../ResourceBrowser.service'
import { ClusterDetailBaseParams, ClusterOptionType, K8SResourceListType } from '../Types'
import { getTabsBasedOnRole } from '../Utils'
import AdminTerminal from './AdminTerminal'
import ClusterSelector from './ClusterSelector'
import ClusterUpgradeCompatibilityInfo from './ClusterUpgradeCompatibilityInfo'
import K8SResourceTabComponent from './K8SResourceTabComponent'
import NodeDetailComponentWrapper from './NodeDetailComponentWrapper'
import NodeDetailWrapper from './NodeDetailWrapper'
import { renderRefreshBar } from './ResourceList.component'

const MonitoringDashboard = importComponentFromFELibrary('MonitoringDashboard', null, 'function')
const CompareClusterButton = importComponentFromFELibrary('CompareClusterButton', null, 'function')

const ResourceList = () => {
    const { clusterId } = useParams<ClusterDetailBaseParams>()
    const { replace } = useHistory()
    const resourceBrowserRef = useRef<HTMLDivElement>()
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
    } = useTabs(`${URLS.RESOURCE_BROWSER}/${clusterId}`)
    const [logSearchTerms, setLogSearchTerms] = useState<Record<string, string>>()
    const [isDataStale, setIsDataStale] = useState(false)
    const { setIntelligenceConfig } = useMainContext()

    const [rawGVKLoader, k8SObjectMapRaw, , reloadK8sObjectMapRaw] = useAsync(
        () => getResourceGroupListRaw(clusterId),
        [clusterId],
    )

    const [loading, clusterListData, error] = useAsync(() => getClusterListMin())

    const clusterList = clusterListData?.result || null

    const clusterOptions = useMemo(
        () =>
            clusterList &&
            (convertToOptionsList(
                sortObjectArrayAlphabetically(clusterList, 'name').filter(({ isVirtualCluster }) => !isVirtualCluster),
                'name',
                'id',
                'nodeErrors',
                'isProd',
            ) as ClusterOptionType[]),
        [clusterList],
    )

    /* NOTE: this is being used as dependency in useEffect down the tree */
    const selectedCluster = useMemo(
        () =>
            clusterOptions?.find((cluster) => String(cluster.value) === clusterId) || {
                label: '',
                value: clusterId,
                errorInConnecting: '',
                isProd: false,
            },
        [clusterId, clusterOptions],
    )

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
        })
        initTabs(_tabs, reInit, null)
    }

    useEffect(() => {
        initTabsBasedOnRole(false)

        return () => {
            setIntelligenceConfig(null)
        }
    }, [])
    useEffectAfterMount(() => initTabsBasedOnRole(true), [clusterId])

    useEffect(() => {
        const terminalTab = getTabById(ResourceBrowserTabsId.terminal)
        const newLabel = `Terminal '${selectedCluster.label}'`

        // NOTE: we don't have cluster name on mount therefore need
        // to update the dynamicTitle once we have fetched the cluster name
        if (terminalTab && terminalTab.dynamicTitle !== newLabel) {
            updateTabUrl({
                id: terminalTab.id,
                url: terminalTab.url,
                dynamicTitle: newLabel,
            })
        }
    }, [getTabById(ResourceBrowserTabsId.terminal)?.dynamicTitle, selectedCluster])

    const onClusterChange = (selected) => {
        if (selected.value === selectedCluster?.value) {
            return
        }

        setIntelligenceConfig(null)

        /* if user manually tries default cluster url redirect */
        if (selected.value === DEFAULT_CLUSTER_ID && window._env_.HIDE_DEFAULT_CLUSTER) {
            replace({
                pathname: URLS.RESOURCE_BROWSER,
            })
            return
        }

        const redirectUrl = generatePath(RESOURCE_BROWSER_ROUTES.K8S_RESOURCE_LIST, {
            clusterId: selected.value,
            group: K8S_EMPTY_GROUP,
            kind: 'node',
            version: DUMMY_RESOURCE_GVK_VERSION,
        })

        replace({
            pathname: redirectUrl,
        })
    }

    const { breadcrumbs } = useBreadcrumb(
        {
            alias: {
                'resource-browser': {
                    component: <span className="cb-5 fs-16 dc__capitalize">Resource Browser</span>,
                    linked: true,
                },
                ':clusterId': {
                    component: (
                        <ClusterSelector
                            onChange={onClusterChange}
                            clusterList={clusterOptions || []}
                            clusterId={clusterId}
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

    const refreshData = () => {
        clearCacheRepo()
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

    const closeResourceModal = (_refreshData: boolean) => {
        if (_refreshData) {
            refreshData()
            reloadK8sObjectMapRaw()
        }
    }

    const renderBreadcrumbs = () => <BreadCrumb breadcrumbs={breadcrumbs} />

    const updateTerminalTabUrl = (queryParams: string) => {
        const terminalTab = getTabById(ResourceBrowserTabsId.terminal)
        if (!terminalTab || terminalTab.name !== AppDetailsTabs.terminal) {
            return
        }
        updateTabUrl({ id: terminalTab.id, url: `${terminalTab.url.split('?')[0]}?${queryParams}` })
    }

    const getUpdateTabUrlForId =
        (id: UpdateTabUrlParamsType['id']): ClusterListType['updateTabUrl'] =>
        ({ url: _url, dynamicTitle, retainSearchParams }: Omit<UpdateTabUrlParamsType, 'id'>) =>
            updateTabUrl({ id, url: _url, dynamicTitle, retainSearchParams })

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

    const renderMainBody = () => {
        if (error) {
            return <ErrorScreenManager code={error.code} />
        }

        if (loading || !tabs.length) {
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
                    }}
                />
                <Route path={RESOURCE_BROWSER_ROUTES.OVERVIEW} exact>
                    <ClusterOverview selectedCluster={selectedCluster} addTab={addTab} />
                </Route>
                <Route path={RESOURCE_BROWSER_ROUTES.MONITORING_DASHBOARD} exact>
                    <MonitoringDashboard />
                </Route>
                <Route path={RESOURCE_BROWSER_ROUTES.TERMINAL} exact>
                    <AdminTerminal updateTerminalTabUrl={updateTerminalTabUrl} />
                </Route>
                <Route path={RESOURCE_BROWSER_ROUTES.CLUSTER_UPGRADE} exact>
                    <ClusterUpgradeCompatibilityInfo
                        clusterName={selectedCluster.label}
                        updateTabUrl={getUpdateTabUrlForId(
                            getTabId(
                                UPGRADE_CLUSTER_CONSTANTS.ID_PREFIX,
                                UPGRADE_CLUSTER_CONSTANTS.NAME,
                                SIDEBAR_KEYS.upgradeClusterGVK.Kind.toLowerCase(),
                            ),
                        )}
                        addTab={addTab}
                    />
                </Route>
                <Route path={RESOURCE_BROWSER_ROUTES.NODE_DETAIL} exact>
                    <NodeDetailWrapper
                        addTab={addTab}
                        markTabActiveById={markTabActiveById}
                        getTabId={getTabId}
                        lowercaseKindToResourceGroupMap={lowercaseKindToResourceGroupMap}
                        updateTabUrl={updateTabUrl}
                    />
                </Route>
                <Route path={RESOURCE_BROWSER_ROUTES.K8S_RESOURCE_DETAIL}>
                    <NodeDetailComponentWrapper
                        clusterName={selectedCluster.label}
                        getTabId={getTabId}
                        logSearchTerms={logSearchTerms}
                        lowercaseKindToResourceGroupMap={lowercaseKindToResourceGroupMap}
                        removeTabByIdentifier={removeTabByIdentifier}
                        setLogSearchTerms={setLogSearchTerms}
                        updateTabUrl={updateTabUrl}
                        loadingResources={rawGVKLoader}
                        markTabActiveById={markTabActiveById}
                        addTab={addTab}
                    />
                </Route>
                <Route path={RESOURCE_BROWSER_ROUTES.K8S_RESOURCE_LIST} exact>
                    <K8SResourceTabComponent
                        markTabActiveById={markTabActiveById}
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
                        key={getTabById(ResourceBrowserTabsId.k8s_Resources)?.lastSyncMoment?.toString()}
                    />
                </Route>
            </>
        )
    }

    return (
        <div className="resource-browser-container flexbox-col h-100 bg__primary" ref={resourceBrowserRef}>
            <PageHeader
                isBreadcrumbs
                breadCrumbs={renderBreadcrumbs}
                headerName=""
                renderActionButtons={renderPageHeaderActionButtons}
            />
            {renderMainBody()}
        </div>
    )
}

export default ResourceList
