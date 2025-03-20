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

import { useState, useEffect, useMemo, useRef } from 'react'
import { useHistory, useParams, useRouteMatch, Switch, Route, Redirect } from 'react-router-dom'
import {
    BreadCrumb,
    useBreadcrumb,
    ErrorScreenManager,
    DevtronProgressing,
    useAsync,
    useEffectAfterMount,
    PageHeader,
    getResourceGroupListRaw,
    noop,
    ALL_NAMESPACE_OPTION,
    WidgetEventDetails,
} from '@devtron-labs/devtron-fe-common-lib'
import { DynamicTabsVariantType, DynamicTabsProps } from '@Components/common/DynamicTabs/types'
import { ReactComponent as ICArrowUpCircle } from '@Icons/ic-arrow-up-circle.svg'
import { ReactComponent as ICTerminalFill } from '@Icons/ic-terminal-fill.svg'
import { ReactComponent as ICObject } from '@Icons/ic-object.svg'
import { ReactComponent as ICWorldBlack } from '@Icons/ic-world-black.svg'
import { ReactComponent as ICChartLineUp } from '@Icons/ic-chart-line-up.svg'
import { ClusterOptionType, K8SResourceListType, URLParams } from '../Types'
import {
    K8S_EMPTY_GROUP,
    MONITORING_DASHBOARD_TAB_ID,
    ResourceBrowserTabsId,
    SIDEBAR_KEYS,
    UPGRADE_CLUSTER_CONSTANTS,
} from '../Constants'
import { URLS } from '../../../config'
import { convertToOptionsList, importComponentFromFELibrary, sortObjectArrayAlphabetically } from '../../common'
import { AppDetailsTabs } from '../../v2/appDetails/appDetails.store'
import NodeDetailComponent from '../../v2/appDetails/k8Resource/nodeDetail/NodeDetail.component'
import { DynamicTabs, useTabs } from '../../common/DynamicTabs'
import { getTabsBasedOnRole } from '../Utils'
import { getClusterListMin } from '../../ClusterNodes/clusterNodes.service'
import ClusterSelector from './ClusterSelector'
import ClusterOverview from '../../ClusterNodes/ClusterOverview'
import NodeDetails from '../../ClusterNodes/NodeDetails'
import { DEFAULT_CLUSTER_ID } from '../../cluster/cluster.type'
import K8SResourceTabComponent from './K8SResourceTabComponent'
import AdminTerminal from './AdminTerminal'
import { renderRefreshBar } from './ResourceList.component'
import { renderCreateResourceButton } from '../PageHeader.buttons'
import ClusterUpgradeCompatibilityInfo from './ClusterUpgradeCompatibilityInfo'
import { MonitoringDashboardWrapper } from './MonitoringDashboardWrapper'
import { AdminTerminalWrapper } from './AdminTerminalWrapper'

const EventsAIResponseWidget = importComponentFromFELibrary('EventsAIResponseWidget', null, 'function')
const CompareClusterButton = importComponentFromFELibrary('CompareClusterButton', null, 'function')
const isFELibAvailable = importComponentFromFELibrary('isFELibAvailable', null, 'function')

const ResourceList = () => {
    const { clusterId } = useParams<URLParams>()
    const { replace, push } = useHistory()
    const { path: routeMatchPath } = useRouteMatch()
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
    const [widgetEventDetails, setWidgetEventDetails] = useState<WidgetEventDetails>(null)
    const [isDataStale, setIsDataStale] = useState(false)

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
            clusterOptions?.find((cluster) => String(cluster.value) === clusterId) ?? {
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
        initTabs(_tabs, reInit, null, false)
    }

    useEffect(() => initTabsBasedOnRole(false), [])
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
    useEffectAfterMount(() => initTabsBasedOnRole(true), [clusterId])

    const onClusterChange = (selected) => {
        if (selected.value === selectedCluster?.value) {
            return
        }

        // Close holmesGPT Response Widget on cluster change
        setWidgetEventDetails(null)

        /* if user manually tries default cluster url redirect */
        if (selected.value === DEFAULT_CLUSTER_ID && window._env_.HIDE_DEFAULT_CLUSTER) {
            replace({
                pathname: URLS.RESOURCE_BROWSER,
            })
            return
        }

        const path = `${URLS.RESOURCE_BROWSER}/${selected.value}/${
            ALL_NAMESPACE_OPTION.value
        }/${SIDEBAR_KEYS.nodeGVK.Kind.toLowerCase()}/${K8S_EMPTY_GROUP}`

        replace({
            pathname: path,
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

    const handleResourceClick = (e) => {
        const { name, tab, namespace = ALL_NAMESPACE_OPTION.value, kind, group } = e.currentTarget.dataset

        const _url = `${URLS.RESOURCE_BROWSER}/${clusterId}/${namespace}/${kind}/${group}/${name}${
            tab ? `/${tab.toLowerCase()}` : ''
        }`

        const idPrefix = kind === 'node' ? `${group}` : `${group}_${namespace}`

        addTab({ idPrefix, kind, name, url: _url })
            .then(() => push(_url))
            .catch(noop)
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

    /** NOTE: special handling to keep this mounted! */
    const renderAdminTerminal = () => {
        const terminalTab = getTabById(ResourceBrowserTabsId.terminal)

        return (
            <div
                className={
                    terminalTab?.isSelected ? 'flex-grow-1 flexbox-col dc__overflow-hidden' : 'cluster-terminal-hidden'
                }
            >
                {terminalTab?.isAlive && (
                    <AdminTerminal key={terminalTab?.componentKey} updateTerminalTabUrl={updateTerminalTabUrl} />
                )}
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

                {renderAdminTerminal()}

                <Switch>
                    {/* TODO: make better paths */}
                    <Route path={`${routeMatchPath}/${SIDEBAR_KEYS.overviewGVK.Kind.toLowerCase()}`}>
                        <ClusterOverview
                            key={getTabById(ResourceBrowserTabsId.cluster_overview)?.componentKey}
                            selectedCluster={selectedCluster}
                            addTab={addTab}
                            markTabActiveById={markTabActiveById}
                        />
                    </Route>

                    {isFELibAvailable && (
                        <Route path={`${routeMatchPath}/${SIDEBAR_KEYS.monitoringGVK.Kind.toLowerCase()}`}>
                            <MonitoringDashboardWrapper markTabActiveById={markTabActiveById} />
                        </Route>
                    )}

                    <Route path={`${routeMatchPath}/${ResourceBrowserTabsId.terminal}`}>
                        {/* Terminal tab wrapper to mark tab active while actual rendering is handled by renderAdminTerminal */}
                        <AdminTerminalWrapper markTabActiveById={markTabActiveById} />
                    </Route>

                    {isFELibAvailable && (
                        <Route path={`${routeMatchPath}/${SIDEBAR_KEYS.upgradeClusterGVK.Kind.toLowerCase()}`}>
                            <ClusterUpgradeCompatibilityInfo
                                clusterId={clusterId}
                                clusterName={selectedCluster.label}
                                selectedCluster={selectedCluster}
                                updateTabUrl={updateTabUrl}
                                addTab={addTab}
                                lowercaseKindToResourceGroupMap={lowercaseKindToResourceGroupMap}
                                handleResourceClick={handleResourceClick}
                                markTabActiveById={markTabActiveById}
                                getTabId={getTabId}
                            />
                        </Route>
                    )}

                    <Route path={`${routeMatchPath}/node/:node`}>
                        <NodeDetails
                            addTab={addTab}
                            lowercaseKindToResourceGroupMap={lowercaseKindToResourceGroupMap}
                            updateTabUrl={updateTabUrl}
                            markTabActiveById={markTabActiveById}
                            getTabId={getTabId}
                        />
                    </Route>

                    <Route path={`${routeMatchPath}/:namespace/:nodeType/:group/:node`}>
                        <div className="flexbox-col flex-grow-1 dc__overflow-hidden">
                            <NodeDetailComponent
                                addTab={addTab}
                                loadingResources={rawGVKLoader}
                                isResourceBrowserView
                                lowercaseKindToResourceGroupMap={lowercaseKindToResourceGroupMap}
                                logSearchTerms={logSearchTerms}
                                setLogSearchTerms={setLogSearchTerms}
                                removeTabByIdentifier={removeTabByIdentifier}
                                updateTabUrl={updateTabUrl}
                                clusterName={selectedCluster.label}
                                getTabId={getTabId}
                                markTabActiveById={markTabActiveById}
                            />
                        </div>
                    </Route>

                    <Route path={`${routeMatchPath}/:namespace/:nodeType/:group/`}>
                        <K8SResourceTabComponent
                            key={getTabById(ResourceBrowserTabsId.k8s_Resources)?.componentKey}
                            selectedCluster={selectedCluster}
                            addTab={addTab}
                            renderRefreshBar={renderRefreshBar(
                                isDataStale,
                                getTabById(ResourceBrowserTabsId.k8s_Resources)?.lastSyncMoment?.toString(),
                                refreshData,
                            )}
                            showStaleDataWarning={isDataStale}
                            updateTabUrl={updateTabUrl}
                            updateTabLastSyncMoment={updateTabLastSyncMoment}
                            setWidgetEventDetails={setWidgetEventDetails}
                            handleResourceClick={handleResourceClick}
                            clusterName={selectedCluster.label}
                            lowercaseKindToResourceGroupMap={lowercaseKindToResourceGroupMap}
                            markTabActiveById={markTabActiveById}
                        />
                    </Route>

                    <Redirect to={URLS.RESOURCE_BROWSER} />
                </Switch>

                {EventsAIResponseWidget && widgetEventDetails && (
                    <EventsAIResponseWidget
                        parentRef={resourceBrowserRef}
                        handleResourceClick={handleResourceClick}
                        widgetEventDetails={widgetEventDetails}
                        setWidgetEventDetails={setWidgetEventDetails}
                    />
                )}
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
