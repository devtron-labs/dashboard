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
import { useHistory, useParams, useRouteMatch, useLocation } from 'react-router-dom'
import {
    getUserRole,
    BreadCrumb,
    useBreadcrumb,
    ErrorScreenManager,
    DevtronProgressing,
    useAsync,
    useEffectAfterMount,
    PageHeader,
    getResourceGroupListRaw,
    noop,
    WidgetEventDetails,
    ApiResourceGroupType,
    InitTabType,
    useUrlFilters,
    DynamicTabType,
} from '@devtron-labs/devtron-fe-common-lib'
import { UpdateTabUrlParamsType } from '@Components/common/DynamicTabs/Types'
import { ClusterListType } from '@Components/ClusterNodes/types'
import { ClusterOptionType, K8SResourceListType, URLParams } from '../Types'
import {
    ALL_NAMESPACE_OPTION,
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
import { parseSearchParams } from './utils'
import { ResourceListUrlFiltersType } from './types'

const EventsAIResponseWidget = importComponentFromFELibrary('EventsAIResponseWidget', null, 'function')
const MonitoringDashboard = importComponentFromFELibrary('MonitoringDashboard', null, 'function')
const isFELibAvailable = importComponentFromFELibrary('isFELibAvailable', null, 'function')

const ResourceList = () => {
    const { clusterId, namespace, nodeType, node, group } = useParams<URLParams>()
    const { replace, push } = useHistory()
    const { url } = useRouteMatch()
    const location = useLocation()
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
    } = useTabs(URLS.RESOURCE_BROWSER)
    const [logSearchTerms, setLogSearchTerms] = useState<Record<string, string>>()
    const [widgetEventDetails, setWidgetEventDetails] = useState<WidgetEventDetails>(null)
    const [isDataStale, setIsDataStale] = useState(false)
    const [selectedResource, setSelectedResource] = useState<ApiResourceGroupType>({
        gvk: SIDEBAR_KEYS.nodeGVK,
        namespaced: false,
        isGrouped: false,
    })
    const { targetK8sVersion } = useUrlFilters<never, ResourceListUrlFiltersType>({ parseSearchParams })

    const [rawGVKLoader, k8SObjectMapRaw] = useAsync(() => getResourceGroupListRaw(clusterId), [clusterId])

    const [loading, data, error] = useAsync(() =>
        Promise.all([getClusterListMin(), window._env_.K8S_CLIENT ? null : getUserRole()]),
    )

    const [clusterListData = null, userRole = null] = data || []

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

    const lowercaseKindToResourceGroupMap = useMemo(
        () =>
            (k8SObjectMapRaw?.result.apiResources ?? []).reduce<K8SResourceListType['lowercaseKindToResourceGroupMap']>(
                (acc, resourceGroup) => {
                    acc[resourceGroup.gvk.Kind.toLowerCase()] = resourceGroup

                    return acc
                },
                {},
            ),
        [k8SObjectMapRaw],
    )

    const isSuperAdmin = !!userRole?.result.superAdmin

    const isOverviewNodeType = nodeType === SIDEBAR_KEYS.overviewGVK.Kind.toLowerCase()
    const isMonitoringNodeType = nodeType === SIDEBAR_KEYS.monitoringGVK.Kind.toLowerCase()
    const isTerminalNodeType = nodeType === AppDetailsTabs.terminal
    const isUpgradeClusterNodeType = nodeType === SIDEBAR_KEYS.upgradeClusterGVK.Kind.toLowerCase()
    const isNodeTypeEvent = nodeType === SIDEBAR_KEYS.eventGVK.Kind.toLowerCase()
    const isNodeTypeNode = nodeType === SIDEBAR_KEYS.nodeGVK.Kind.toLowerCase()

    const getDynamicTabIdPrefix = () => {
        if (isUpgradeClusterNodeType) {
            return UPGRADE_CLUSTER_CONSTANTS.ID_PREFIX
        }

        if (isNodeTypeNode) {
            return K8S_EMPTY_GROUP
        }

        return `${(!isNodeTypeEvent && group) || K8S_EMPTY_GROUP}_${namespace}`
    }

    const getNodeName = () => {
        if (isUpgradeClusterNodeType) {
            return UPGRADE_CLUSTER_CONSTANTS.NAME
        }

        return node
    }

    const getDynamicTabData = (): InitTabType => ({
        idPrefix: getDynamicTabIdPrefix(),
        name: getNodeName(),
        kind: nodeType || '',
        url,
        isSelected: true,
        type: 'dynamic',
        dynamicTitle: isUpgradeClusterNodeType
            ? `${UPGRADE_CLUSTER_CONSTANTS.DYNAMIC_TITLE} to v${targetK8sVersion}`
            : undefined,
        iconPath: isUpgradeClusterNodeType ? UPGRADE_CLUSTER_CONSTANTS.ICON_PATH : undefined,
    })

    const dynamicActiveTab = tabs.find((tab) => {
        const { idPrefix, kind, name } = getDynamicTabData()
        return tab.type === 'dynamic' && tab.id === getTabId(idPrefix, name, kind)
    })

    const initTabsBasedOnRole = (reInit: boolean) => {
        /* NOTE: selectedCluster is not in useEffect dep list since it arrives with isSuperAdmin (Promise.all) */
        const _tabs = getTabsBasedOnRole({
            selectedCluster,
            namespace,
            isSuperAdmin,
            /* NOTE: if node is available in url but no associated dynamicTab we create a dynamicTab */
            dynamicTabData: (node || isUpgradeClusterNodeType) && getDynamicTabData(),
            isTerminalSelected: isTerminalNodeType,
            isOverviewSelected: isOverviewNodeType,
            isMonitoringDashBoardSelected: isMonitoringNodeType,
        })
        initTabs(
            _tabs,
            reInit,
            !isSuperAdmin ? [getTabId(ResourceBrowserTabsId.terminal, AppDetailsTabs.terminal, '')] : null,
        )
    }

    useEffect(() => initTabsBasedOnRole(false), [isSuperAdmin])
    useEffectAfterMount(() => initTabsBasedOnRole(true), [clusterId])

    useEffectAfterMount(() => {
        /* NOTE: tab selection is interactively done through dynamic tab button clicks
         * but to ensure consistency with url changes and user moving back through browser history,
         * correct active tab state is ensured by this effect */
        if (node || (isUpgradeClusterNodeType && isFELibAvailable)) {
            /* NOTE: if a dynamic tab was removed & user tries to get there through url add it */
            const { idPrefix, kind, name, url: _url } = getDynamicTabData()
            const tabId = getTabId(idPrefix, name, kind)
            /* NOTE if the corresponding tab exists return */
            const match = getTabById(tabId)
            if (match) {
                if (!match.isSelected) {
                    markTabActiveById(match.id)
                }
                return
            }
            /* NOTE: even though addTab updates selection it will override url;
             * thus to prevent that if found markTabActive and don't let this get called */
            addTab({
                idPrefix,
                kind,
                name,
                url: _url,
                iconPath: isUpgradeClusterNodeType ? UPGRADE_CLUSTER_CONSTANTS.ICON_PATH : undefined,
                dynamicTitle: isUpgradeClusterNodeType
                    ? `${UPGRADE_CLUSTER_CONSTANTS.DYNAMIC_TITLE} to v${targetK8sVersion}`
                    : undefined,
            })
                .then(noop)
                .catch(noop)
            return
        }

        // Add here because of dynamic imports
        const nodeTypeToTabIdMap: Record<string, string> = {
            [SIDEBAR_KEYS.overviewGVK.Kind.toLowerCase()]: ResourceBrowserTabsId.cluster_overview,
            [SIDEBAR_KEYS.monitoringGVK.Kind.toLowerCase()]: MonitoringDashboard ? MONITORING_DASHBOARD_TAB_ID : null,
            [AppDetailsTabs.terminal]: ResourceBrowserTabsId.terminal,
        }

        if (nodeType in nodeTypeToTabIdMap) {
            const selectedTabFromNodeType = getTabById(nodeTypeToTabIdMap[nodeType]) ?? ({} as DynamicTabType)
            // Explicitly not using optional chaining to ensure to check the tab exists
            if (selectedTabFromNodeType && !selectedTabFromNodeType.isSelected) {
                markTabActiveById(selectedTabFromNodeType.id)
            }

            return
        }

        markTabActiveById(ResourceBrowserTabsId.k8s_Resources)
    }, [location.pathname])

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

    const refreshData = (): void => {
        const activeTab = tabs.find((tab) => tab.isSelected)
        updateTabComponentKey(activeTab.id)
        updateTabLastSyncMoment(activeTab.id)
        setIsDataStale(false)
    }

    const closeResourceModal = (_refreshData: boolean): void => {
        if (_refreshData) {
            refreshData()
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

    const updateK8sResourceTabLastSyncMoment = () =>
        updateTabLastSyncMoment(getTabById(ResourceBrowserTabsId.k8s_Resources)?.id)

    const getUpdateTabUrlForId =
        (id: UpdateTabUrlParamsType['id']): ClusterListType['updateTabUrl'] =>
        ({ url: _url, dynamicTitle, retainSearchParams }: Omit<UpdateTabUrlParamsType, 'id'>) =>
            updateTabUrl({ id, url: _url, dynamicTitle, retainSearchParams })

    const getRemoveTabByIdentifierForId = (id: string) => () => removeTabByIdentifier(id)

    const handleResourceClick = (e, shouldOverrideSelectedResourceKind: boolean) => {
        const { name, tab, namespace: currentNamespace, origin, kind: kindFromResource } = e.currentTarget.dataset
        const lowercaseKindFromResource = shouldOverrideSelectedResourceKind ? kindFromResource.toLowerCase() : null
        const _group: string =
            (shouldOverrideSelectedResourceKind
                ? lowercaseKindToResourceGroupMap[lowercaseKindFromResource]?.gvk?.Group?.toLowerCase()
                : selectedResource?.gvk.Group.toLowerCase()) || K8S_EMPTY_GROUP
        const _namespace = currentNamespace ?? ALL_NAMESPACE_OPTION.value

        let resourceParam: string
        let kind: string
        let resourceName: string

        if (origin === 'event') {
            const [_kind, _resourceName] = name.split('/')
            const eventKind = shouldOverrideSelectedResourceKind ? lowercaseKindFromResource : _kind
            resourceParam = `${eventKind}/${_group}/${_resourceName}`
            kind = eventKind
            resourceName = _resourceName
        } else {
            kind = shouldOverrideSelectedResourceKind
                ? lowercaseKindFromResource
                : selectedResource.gvk.Kind.toLowerCase()
            resourceParam = `${kind}/${_group}/${name}`
            resourceName = name
        }

        const _url = `${URLS.RESOURCE_BROWSER}/${clusterId}/${_namespace}/${resourceParam}${
            tab ? `/${tab.toLowerCase()}` : ''
        }`
        const idPrefix = kind === 'node' ? `${_group}` : `${_group}_${_namespace}`
        addTab({ idPrefix, kind, name: resourceName, url: _url })
            .then(() => push(_url))
            .catch(noop)
    }

    const renderDynamicTabComponent = (tabId: string): JSX.Element => {
        if (isUpgradeClusterNodeType && isFELibAvailable) {
            return (
                <ClusterUpgradeCompatibilityInfo
                    clusterId={clusterId}
                    clusterName={selectedCluster.label}
                    selectedCluster={selectedCluster}
                    updateTabUrl={getUpdateTabUrlForId(tabId)}
                    addTab={addTab}
                    lowercaseKindToResourceGroupMap={lowercaseKindToResourceGroupMap}
                    handleResourceClick={handleResourceClick}
                />
            )
        }

        if (!node) {
            return null
        }

        return nodeType.toLowerCase() === SIDEBAR_KEYS.nodeGVK.Kind.toLowerCase() ? (
            <NodeDetails
                key={dynamicActiveTab.componentKey}
                isSuperAdmin={isSuperAdmin}
                addTab={addTab}
                lowercaseKindToResourceGroupMap={lowercaseKindToResourceGroupMap}
                updateTabUrl={getUpdateTabUrlForId(tabId)}
            />
        ) : (
            <div className="resource-details-container flexbox-col">
                <NodeDetailComponent
                    key={dynamicActiveTab.componentKey}
                    loadingResources={rawGVKLoader}
                    isResourceBrowserView
                    lowercaseKindToResourceGroupMap={lowercaseKindToResourceGroupMap}
                    logSearchTerms={logSearchTerms}
                    setLogSearchTerms={setLogSearchTerms}
                    removeTabByIdentifier={getRemoveTabByIdentifierForId(tabId)}
                    updateTabUrl={getUpdateTabUrlForId(tabId)}
                    clusterName={selectedCluster.label}
                />
            </div>
        )
    }

    const fixedTabComponents = [
        <ClusterOverview isSuperAdmin={isSuperAdmin} selectedCluster={selectedCluster} addTab={addTab} />,
        <K8SResourceTabComponent
            selectedCluster={selectedCluster}
            selectedResource={selectedResource}
            setSelectedResource={setSelectedResource}
            addTab={addTab}
            renderRefreshBar={renderRefreshBar(
                isDataStale,
                getTabById(ResourceBrowserTabsId.k8s_Resources)?.lastSyncMoment?.toString(),
                refreshData,
            )}
            isSuperAdmin={isSuperAdmin}
            isOpen={!!getTabById(ResourceBrowserTabsId.k8s_Resources)?.isSelected}
            showStaleDataWarning={isDataStale}
            updateK8sResourceTab={getUpdateTabUrlForId(getTabById(ResourceBrowserTabsId.k8s_Resources)?.id)}
            updateK8sResourceTabLastSyncMoment={updateK8sResourceTabLastSyncMoment}
            setWidgetEventDetails={setWidgetEventDetails}
            handleResourceClick={handleResourceClick}
            clusterName={selectedCluster.label}
            lowercaseKindToResourceGroupMap={lowercaseKindToResourceGroupMap}
        />,
        <MonitoringDashboard />,
        ...(isSuperAdmin && getTabById(ResourceBrowserTabsId.terminal)?.isAlive
            ? [<AdminTerminal isSuperAdmin={isSuperAdmin} updateTerminalTabUrl={updateTerminalTabUrl} />]
            : []),
    ]

    const renderMainBody = () => {
        if (error) {
            return <ErrorScreenManager code={error.code} />
        }

        if (loading) {
            return <DevtronProgressing parentClasses="h-100 flex bcn-0" classes="icon-dim-80" />
        }

        return (
            <>
                <div
                    className="h-36 resource-browser-tab flex left w-100 dc__window-bg"
                    style={{ boxShadow: 'inset 0 -1px 0 0 var(--N200)' }}
                >
                    <DynamicTabs
                        tabs={tabs}
                        removeTabByIdentifier={removeTabByIdentifier}
                        markTabActiveById={markTabActiveById}
                        stopTabByIdentifier={stopTabByIdentifier}
                        refreshData={refreshData}
                        setIsDataStale={setIsDataStale}
                        hideTimer={isOverviewNodeType || isMonitoringNodeType || isUpgradeClusterNodeType}
                    />
                </div>
                {/* NOTE: since the terminal is only visibly hidden; we need to make sure it is rendered at the end of the page */}
                {dynamicActiveTab && renderDynamicTabComponent(dynamicActiveTab.id)}
                {tabs.length > 0 &&
                    fixedTabComponents.map((component, index) => {
                        const currentTab = tabs[index]
                        // We will render the fixed tab if it is selected, alive or it should remain mounted
                        // Not using filter, as the index is directly coupled with tabs indexes
                        if (currentTab.isSelected || currentTab.shouldRemainMounted || currentTab.isAlive) {
                            /* NOTE: need to retain terminal layout. Thus hiding it through visibility */
                            const hideClassName =
                                tabs[index].name === AppDetailsTabs.terminal
                                    ? 'cluster-terminal-hidden'
                                    : 'dc__hide-section'

                            return (
                                <div
                                    key={currentTab.componentKey}
                                    className={!tabs[index].isSelected ? hideClassName : ''}
                                >
                                    {component}
                                </div>
                            )
                        }

                        return null
                    })}
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
        <div className="resource-browser-container flexbox-col h-100 bcn-0" ref={resourceBrowserRef}>
            <PageHeader
                isBreadcrumbs
                breadCrumbs={renderBreadcrumbs}
                headerName=""
                renderActionButtons={renderCreateResourceButton(clusterId, closeResourceModal)}
            />
            {renderMainBody()}
        </div>
    )
}

export default ResourceList
