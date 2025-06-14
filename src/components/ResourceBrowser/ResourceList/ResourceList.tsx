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
import { useHistory, useLocation, useParams, useRouteMatch } from 'react-router-dom'

import {
    ALL_NAMESPACE_OPTION,
    ApiResourceGroupType,
    DevtronProgressing,
    DynamicTabType,
    ErrorScreenManager,
    getGroupVersionFromApiVersion,
    getResourceGroupListRaw,
    InitTabType,
    noop,
    useAsync,
    useBreadcrumb,
    useEffectAfterMount,
    useMainContext,
    useUrlFilters,
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
import ClusterOverview from '../../ClusterNodes/ClusterOverview'
import NodeDetails from '../../ClusterNodes/NodeDetails'
import { importComponentFromFELibrary } from '../../common'
import { DynamicTabs, useTabs } from '../../common/DynamicTabs'
import { AppDetailsTabs } from '../../v2/appDetails/appDetails.store'
import NodeDetailComponent from '../../v2/appDetails/k8Resource/nodeDetail/NodeDetail.component'
import {
    K8S_EMPTY_GROUP,
    MONITORING_DASHBOARD_TAB_ID,
    ResourceBrowserTabsId,
    SIDEBAR_KEYS,
    UPGRADE_CLUSTER_CONSTANTS,
} from '../Constants'
import { renderCreateResourceButton } from '../PageHeader.buttons'
import { getClusterListing } from '../ResourceBrowser.service'
import { ClusterOptionType, K8SResourceListType, URLParams } from '../Types'
import { getClusterChangeRedirectionUrl, getTabsBasedOnRole } from '../Utils'
import AdminTerminal from './AdminTerminal'
import ClusterSelector from './ClusterSelector'
import ClusterUpgradeCompatibilityInfo from './ClusterUpgradeCompatibilityInfo'
import K8SResourceTabComponent from './K8SResourceTabComponent'
import { renderRefreshBar } from './ResourceList.component'
import ResourcePageHeader from './ResourcePageHeader'
import { ResourceListUrlFiltersType } from './types'
import {
    getClusterOptions,
    getFirstResourceFromKindResourceMap,
    getUpgradeCompatibilityTippyConfig,
    parseSearchParams,
} from './utils'

const MonitoringDashboard = importComponentFromFELibrary('MonitoringDashboard', null, 'function')
const CompareClusterButton = importComponentFromFELibrary('CompareClusterButton', null, 'function')
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
    } = useTabs(`${URLS.RESOURCE_BROWSER}/${clusterId}`)
    const [logSearchTerms, setLogSearchTerms] = useState<Record<string, string>>()
    const [isDataStale, setIsDataStale] = useState(false)
    const [selectedResource, setSelectedResource] = useState<ApiResourceGroupType>(null)
    const { targetK8sVersion } = useUrlFilters<never, ResourceListUrlFiltersType>({ parseSearchParams })
    const { setIntelligenceConfig } = useMainContext()

    const [rawGVKLoader, k8SObjectMapRaw, , reloadK8sObjectMapRaw] = useAsync(
        () => getResourceGroupListRaw(clusterId),
        [clusterId],
    )

    const [loading, clusterList, error] = useAsync(() => getClusterListing(true))

    const clusterOptions: ClusterOptionType[] = useMemo(() => getClusterOptions(clusterList), [clusterList])

    /* NOTE: this is being used as dependency in useEffect down the tree */
    const selectedCluster = useMemo(
        () =>
            clusterOptions?.find((cluster) => String(cluster.value) === clusterId) || {
                label: '',
                value: clusterId,
                isProd: false,
                isClusterInCreationPhase: false,
                installationId: 0,
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

    const getUpgradeCompatibilityTabConfigOverride = () =>
        isUpgradeClusterNodeType
            ? {
                  iconPath: UPGRADE_CLUSTER_CONSTANTS.ICON_PATH,
                  dynamicTitle: `${UPGRADE_CLUSTER_CONSTANTS.DYNAMIC_TITLE} to v${targetK8sVersion}`,
                  tippyConfig: getUpgradeCompatibilityTippyConfig({
                      targetK8sVersion,
                  }),
              }
            : {}

    const getDynamicTabData = (): InitTabType => ({
        idPrefix: getDynamicTabIdPrefix(),
        name: getNodeName(),
        kind: nodeType || '',
        url,
        isSelected: true,
        type: 'dynamic',
        ...getUpgradeCompatibilityTabConfigOverride(),
    })

    const dynamicActiveTab = tabs.find((tab) => {
        const { idPrefix, kind, name } = getDynamicTabData()
        return tab.type === 'dynamic' && tab.id === getTabId(idPrefix, name, kind)
    })

    const initTabsBasedOnRole = (reInit: boolean) => {
        const _tabs = getTabsBasedOnRole({
            selectedCluster,
            namespace,
            /* NOTE: if node is available in url but no associated dynamicTab we create a dynamicTab */
            dynamicTabData: (node || isUpgradeClusterNodeType) && getDynamicTabData(),
            isTerminalSelected: isTerminalNodeType,
            isOverviewSelected: isOverviewNodeType,
            isMonitoringDashBoardSelected: isMonitoringNodeType,
        })

        initTabs(_tabs, reInit, null, true)
    }

    useEffect(() => {
        initTabsBasedOnRole(false)

        return () => {
            setIntelligenceConfig(null)
        }
    }, [])

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
                    markTabActiveById(match.id).catch(noop)
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
                ...getUpgradeCompatibilityTabConfigOverride(),
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
                markTabActiveById(selectedTabFromNodeType.id).catch(noop)
            }

            return
        }

        markTabActiveById(ResourceBrowserTabsId.k8s_Resources).catch(noop)
    }, [location.pathname])

    const onClusterChange = (selected: ClusterOptionType) => {
        if (selected.value === selectedCluster?.value) {
            return
        }

        setIntelligenceConfig(null)

        /* if user manually tries default cluster url redirect */
        if (Number(selected.value) === DEFAULT_CLUSTER_ID && window._env_.HIDE_DEFAULT_CLUSTER) {
            replace({
                pathname: URLS.RESOURCE_BROWSER,
            })
            return
        }

        const path = getClusterChangeRedirectionUrl(
            selected.isClusterInCreationPhase,
            String(selected.isClusterInCreationPhase ? selected.installationId : selected.value),
        )

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
                            isClusterListLoading={loading}
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
        const {
            name,
            tab,
            namespace: currentNamespace,
            origin,
            kind: kindFromResource,
            apiVersion,
        } = e.currentTarget.dataset

        const lowercaseKindFromResource = shouldOverrideSelectedResourceKind ? kindFromResource.toLowerCase() : null

        let _group: string = apiVersion
            ? getGroupVersionFromApiVersion(apiVersion).group.toLowerCase() || K8S_EMPTY_GROUP
            : ''

        _group =
            _group ||
            (shouldOverrideSelectedResourceKind
                ? getFirstResourceFromKindResourceMap(
                      lowercaseKindToResourceGroupMap,
                      lowercaseKindFromResource,
                  )?.gvk?.Group?.toLowerCase()
                : selectedResource?.gvk.Group.toLowerCase()) ||
            K8S_EMPTY_GROUP

        const _namespace = currentNamespace ?? ALL_NAMESPACE_OPTION.value

        let resourceParam: string
        let kind: string
        let resourceName: string

        if (origin === 'event') {
            const [_kind, _resourceName] = name.split('/')
            const eventKind = shouldOverrideSelectedResourceKind ? lowercaseKindFromResource : _kind
            // For event, we should read the group for kind from the resource group map else fallback to empty group

            _group =
                getFirstResourceFromKindResourceMap(lowercaseKindToResourceGroupMap, eventKind)?.gvk?.Group ||
                K8S_EMPTY_GROUP

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
                addTab={addTab}
                lowercaseKindToResourceGroupMap={lowercaseKindToResourceGroupMap}
                updateTabUrl={getUpdateTabUrlForId(tabId)}
            />
        ) : (
            <div className="flexbox-col flex-grow-1 dc__overflow-hidden">
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
        <ClusterOverview selectedCluster={selectedCluster} addTab={addTab} />,
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
            isOpen={!!getTabById(ResourceBrowserTabsId.k8s_Resources)?.isSelected}
            updateK8sResourceTab={getUpdateTabUrlForId(getTabById(ResourceBrowserTabsId.k8s_Resources)?.id)}
            updateK8sResourceTabLastSyncMoment={updateK8sResourceTabLastSyncMoment}
            handleResourceClick={handleResourceClick}
            clusterName={selectedCluster.label}
            lowercaseKindToResourceGroupMap={lowercaseKindToResourceGroupMap}
        />,
        ...(MonitoringDashboard ? [<MonitoringDashboard />] : []),
        ...(getTabById(ResourceBrowserTabsId.terminal)?.isAlive
            ? [<AdminTerminal updateTerminalTabUrl={updateTerminalTabUrl} />]
            : []),
    ]

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
                                    className={
                                        !tabs[index].isSelected
                                            ? hideClassName
                                            : 'flex-grow-1 flexbox-col dc__overflow-hidden'
                                    }
                                >
                                    {component}
                                </div>
                            )
                        }

                        return null
                    })}
            </>
        )
    }

    return (
        <div className="resource-browser-container flexbox-col h-100 bg__primary" ref={resourceBrowserRef}>
            <ResourcePageHeader
                breadcrumbs={breadcrumbs}
                renderPageHeaderActionButtons={renderPageHeaderActionButtons}
            />
            {renderMainBody()}
        </div>
    )
}

export default ResourceList
