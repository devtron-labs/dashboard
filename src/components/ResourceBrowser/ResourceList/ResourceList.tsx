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
import { Route, useHistory, useParams, useRouteMatch } from 'react-router-dom'

import {
    ALL_NAMESPACE_OPTION,
    BreadCrumb,
    DevtronProgressing,
    ErrorScreenManager,
    getResourceGroupListRaw,
    noop,
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
import {
    DynamicTabsProps,
    DynamicTabsVariantType,
    UpdateTabUrlParamsType,
    UseTabsReturnType,
} from '@Components/common/DynamicTabs/types'

import { URLS } from '../../../config'
import { DEFAULT_CLUSTER_ID } from '../../cluster/cluster.type'
import { getClusterListMin } from '../../ClusterNodes/clusterNodes.service'
import ClusterOverview from '../../ClusterNodes/ClusterOverview'
import NodeDetails from '../../ClusterNodes/NodeDetails'
import { convertToOptionsList, importComponentFromFELibrary, sortObjectArrayAlphabetically } from '../../common'
import { DynamicTabs, useTabs } from '../../common/DynamicTabs'
import { AppDetailsTabs } from '../../v2/appDetails/appDetails.store'
import {
    K8S_EMPTY_GROUP,
    MONITORING_DASHBOARD_TAB_ID,
    ResourceBrowserTabsId,
    SIDEBAR_KEYS,
    UPGRADE_CLUSTER_CONSTANTS,
} from '../Constants'
import { renderCreateResourceButton } from '../PageHeader.buttons'
import { ClusterOptionType, K8SResourceListType, ResourceBrowserDetailBaseParams } from '../Types'
import { getTabsBasedOnRole } from '../Utils'
import AdminTerminal from './AdminTerminal'
import ClusterSelector from './ClusterSelector'
import ClusterUpgradeCompatibilityInfo from './ClusterUpgradeCompatibilityInfo'
import K8SResourceTabComponent from './K8SResourceTabComponent'
import NodeDetailComponentWrapper from './NodeDetailComponentWrapper'
import { renderRefreshBar } from './ResourceList.component'
import { getFirstResourceFromKindResourceMap } from './utils'

const MonitoringDashboard = importComponentFromFELibrary('MonitoringDashboard', null, 'function')
const CompareClusterButton = importComponentFromFELibrary('CompareClusterButton', null, 'function')

interface NodeDetailParams {
    name: string
}

const NodeDetailWrapper = ({
    addTab,
    markTabActiveById,
    getTabId,
    updateTabUrl,
    lowercaseKindToResourceGroupMap,
}: Omit<ClusterListType, 'updateTabUrl'> &
    Pick<UseTabsReturnType, 'addTab' | 'markTabActiveById' | 'getTabId' | 'updateTabUrl'>) => {
    const { url } = useRouteMatch()
    const { name } = useParams<NodeDetailParams>()

    const id = getTabId(K8S_EMPTY_GROUP, name, 'node')

    const updateTabUrlHandler: ClusterListType['updateTabUrl'] = (props) => updateTabUrl({ id, ...props })

    useEffect(() => {
        markTabActiveById(id)
            .then((wasFound) => {
                if (!wasFound) {
                    addTab({
                        idPrefix: K8S_EMPTY_GROUP,
                        kind: 'node',
                        name,
                        url,
                    }).catch(noop)
                }
            })
            .catch(noop)
    }, [])

    return (
        <NodeDetails
            updateTabUrl={updateTabUrlHandler}
            lowercaseKindToResourceGroupMap={lowercaseKindToResourceGroupMap}
            addTab={addTab}
        />
    )
}

const ResourceList = () => {
    const { clusterId } = useParams<ResourceBrowserDetailBaseParams>()
    const { replace, push } = useHistory()
    const { path } = useRouteMatch()
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

        // TODO: change this to use the new URL builder
        const redirectUrl = `${URLS.RESOURCE_BROWSER}/${selected.value}/${
            ALL_NAMESPACE_OPTION.value
        }/${SIDEBAR_KEYS.nodeGVK.Kind.toLowerCase()}/${K8S_EMPTY_GROUP}`

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

    const updateK8sResourceTabLastSyncMoment = () =>
        updateTabLastSyncMoment(getTabById(ResourceBrowserTabsId.k8s_Resources)?.id)

    const getUpdateTabUrlForId =
        (id: UpdateTabUrlParamsType['id']): ClusterListType['updateTabUrl'] =>
        ({ url: _url, dynamicTitle, retainSearchParams }: Omit<UpdateTabUrlParamsType, 'id'>) =>
            updateTabUrl({ id, url: _url, dynamicTitle, retainSearchParams })

    const handleResourceClick = (e, shouldOverrideSelectedResourceKind: boolean) => {
        const { name, tab, namespace: currentNamespace, origin, kind: kindFromResource } = e.currentTarget.dataset
        const lowercaseKindFromResource = shouldOverrideSelectedResourceKind ? kindFromResource.toLowerCase() : null
        let _group: string = shouldOverrideSelectedResourceKind
            ? getFirstResourceFromKindResourceMap(
                  lowercaseKindToResourceGroupMap,
                  lowercaseKindFromResource,
              )?.gvk?.Group?.toLowerCase()
            : K8S_EMPTY_GROUP
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
            kind = lowercaseKindFromResource
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
                <Route path={`${path}/overview`} exact>
                    <ClusterOverview selectedCluster={selectedCluster} addTab={addTab} />
                </Route>
                <Route path={`${path}/monitoring-dashboard`} exact>
                    <MonitoringDashboard />
                </Route>
                <Route path={`${path}/terminal`} exact>
                    <AdminTerminal updateTerminalTabUrl={updateTerminalTabUrl} />
                </Route>
                <Route path={`${path}/cluster-upgrade`} exact>
                    <ClusterUpgradeCompatibilityInfo
                        clusterId={clusterId}
                        clusterName={selectedCluster.label}
                        selectedCluster={selectedCluster}
                        updateTabUrl={getUpdateTabUrlForId(
                            getTabId(
                                UPGRADE_CLUSTER_CONSTANTS.ID_PREFIX,
                                UPGRADE_CLUSTER_CONSTANTS.NAME,
                                SIDEBAR_KEYS.upgradeClusterGVK.Kind.toLowerCase(),
                            ),
                        )}
                        addTab={addTab}
                        lowercaseKindToResourceGroupMap={lowercaseKindToResourceGroupMap}
                        handleResourceClick={handleResourceClick}
                    />
                </Route>
                <Route path={`${path}/node/:name`} exact>
                    <NodeDetailWrapper
                        addTab={addTab}
                        markTabActiveById={markTabActiveById}
                        getTabId={getTabId}
                        lowercaseKindToResourceGroupMap={lowercaseKindToResourceGroupMap}
                        updateTabUrl={updateTabUrl}
                    />
                </Route>
                <Route path={`${path}/:namespace/:kind/:group/:version/:name`}>
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
                <Route path={`${path}/:kind/:group/:version`} exact>
                    <K8SResourceTabComponent
                        markTabActiveById={markTabActiveById}
                        selectedCluster={selectedCluster}
                        addTab={addTab}
                        renderRefreshBar={renderRefreshBar(
                            isDataStale,
                            getTabById(ResourceBrowserTabsId.k8s_Resources)?.lastSyncMoment?.toString(),
                            refreshData,
                        )}
                        isOpen
                        updateK8sResourceTab={getUpdateTabUrlForId(ResourceBrowserTabsId.k8s_Resources)}
                        updateK8sResourceTabLastSyncMoment={updateK8sResourceTabLastSyncMoment}
                        clusterName={selectedCluster.label}
                        lowercaseKindToResourceGroupMap={lowercaseKindToResourceGroupMap}
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
