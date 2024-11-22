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

import { useState, useEffect, useMemo } from 'react'
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
} from '@devtron-labs/devtron-fe-common-lib'
import { ClusterOptionType, FIXED_TABS_INDICES, URLParams } from '../Types'
import { ALL_NAMESPACE_OPTION, K8S_EMPTY_GROUP, SIDEBAR_KEYS } from '../Constants'
import { URLS } from '../../../config'
import { convertToOptionsList, sortObjectArrayAlphabetically } from '../../common'
import { AppDetailsTabs, AppDetailsTabsIdPrefix } from '../../v2/appDetails/appDetails.store'
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

const ResourceList = () => {
    const { clusterId, namespace, nodeType, node, group } = useParams<URLParams>()
    const { replace } = useHistory()
    const { url } = useRouteMatch()
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
    } = useTabs(URLS.RESOURCE_BROWSER)
    const [logSearchTerms, setLogSearchTerms] = useState<Record<string, string>>()
    const [isDataStale, setIsDataStale] = useState(false)

    const [rawGVKLoader, k8SObjectMapRaw] = useAsync(() => getResourceGroupListRaw(clusterId), [clusterId])

    const [loading, data, error] = useAsync(() =>
        Promise.all([getClusterListMin(), window._env_.K8S_CLIENT ? null : getUserRole()]),
    )

    const [clusterListData = null, userRole = null] = data || []

    const clusterList = clusterListData?.result || null

    const clusterOptions: ClusterOptionType[] = useMemo(
        () =>
            clusterList &&
            (convertToOptionsList(
                sortObjectArrayAlphabetically(clusterList, 'name'),
                'name',
                'id',
                'nodeErrors',
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
            },
        [clusterId, clusterOptions],
    )

    const isSuperAdmin = !!userRole?.result.superAdmin

    const isOverviewNodeType = nodeType === SIDEBAR_KEYS.overviewGVK.Kind.toLowerCase()
    const isTerminalNodeType = nodeType === AppDetailsTabs.terminal

    const getDynamicTabData = () => {
        const isNodeTypeEvent = nodeType === SIDEBAR_KEYS.eventGVK.Kind.toLowerCase()
        const isNodeTypeNode = nodeType === SIDEBAR_KEYS.nodeGVK.Kind.toLowerCase()
        return {
            idPrefix: isNodeTypeNode
                ? K8S_EMPTY_GROUP
                : `${(!isNodeTypeEvent && group) || K8S_EMPTY_GROUP}_${namespace}`,
            name: node,
            kind: nodeType,
            url,
            isSelected: true,
            position: Number.MAX_SAFE_INTEGER,
        }
    }

    /* NOTE: dynamic tabs must have position as Number.MAX_SAFE_INTEGER */
    const dynamicActiveTab = tabs.find((tab) => {
        const { idPrefix, kind, name } = getDynamicTabData()
        return tab.position === Number.MAX_SAFE_INTEGER && tab.id === getTabId(idPrefix, name, kind)
    })

    const initTabsBasedOnRole = (reInit: boolean) => {
        /* NOTE: selectedCluster is not in useEffect dep list since it arrives with isSuperAdmin (Promise.all) */
        const _tabs = getTabsBasedOnRole(
            selectedCluster,
            namespace,
            isSuperAdmin,
            /* NOTE: if node is available in url but no associated dynamicTab we create a dynamicTab */
            node && getDynamicTabData(),
            isTerminalNodeType,
            isOverviewNodeType,
        )
        initTabs(
            _tabs,
            reInit,
            !isSuperAdmin ? [getTabId(AppDetailsTabsIdPrefix.terminal, AppDetailsTabs.terminal, '')] : null,
        )
    }

    useEffect(() => initTabsBasedOnRole(false), [isSuperAdmin])
    useEffectAfterMount(() => initTabsBasedOnRole(true), [clusterId])

    useEffectAfterMount(() => {
        /* NOTE: tab selection is interactively done through dynamic tab button clicks
         * but to ensure consistency with url changes and user moving back through browser history,
         * correct active tab state is ensured by this effect */
        if (node) {
            /* NOTE: if a dynamic tab was removed & user tries to get there through url add it */
            const { idPrefix, kind, name, url: _url } = getDynamicTabData()
            /* NOTE if the corresponding tab exists return */
            const match = tabs.find((tab) => tab.id === getTabId(idPrefix, name, kind))
            if (match) {
                if (!match.isSelected) {
                    markTabActiveById(match.id)
                }
                return
            }
            /* NOTE: even though addTab updates selection it will override url;
             * thus to prevent that if found markTabActive and don't let this get called */
            addTab(idPrefix, kind, name, _url).then(noop).catch(noop)
            return
        }
        /* NOTE: it is unlikely that tabs is empty when this is called but it can happen */
        if (isOverviewNodeType) {
            if (tabs[FIXED_TABS_INDICES.OVERVIEW] && !tabs[FIXED_TABS_INDICES.OVERVIEW].isSelected) {
                markTabActiveById(tabs[FIXED_TABS_INDICES.OVERVIEW].id)
            }
            return
        }
        if (isTerminalNodeType) {
            if (tabs[FIXED_TABS_INDICES.ADMIN_TERMINAL] && !tabs[FIXED_TABS_INDICES.ADMIN_TERMINAL].isSelected) {
                markTabActiveById(tabs[FIXED_TABS_INDICES.ADMIN_TERMINAL].id)
            }
            return
        }
        if (tabs[FIXED_TABS_INDICES.K8S_RESOURCE_LIST] && !tabs[FIXED_TABS_INDICES.K8S_RESOURCE_LIST].isSelected) {
            markTabActiveById(tabs[FIXED_TABS_INDICES.K8S_RESOURCE_LIST].id)
        }
    }, [location.pathname])

    const onClusterChange = (selected) => {
        if (selected.value === selectedCluster?.value) {
            return
        }

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
        const terminalTab = tabs[FIXED_TABS_INDICES.ADMIN_TERMINAL]
        if (!terminalTab || terminalTab.name !== AppDetailsTabs.terminal) {
            return
        }
        updateTabUrl(terminalTab.id, `${terminalTab.url.split('?')[0]}?${queryParams}`)
    }

    const updateK8sResourceTabLastSyncMoment = () =>
        updateTabLastSyncMoment(tabs[FIXED_TABS_INDICES.K8S_RESOURCE_LIST]?.id)

    const getUpdateTabUrlForId = (id: string) => (_url: string, dynamicTitle?: string) =>
        updateTabUrl(id, _url, dynamicTitle)

    const getRemoveTabByIdentifierForId = (id: string) => () => removeTabByIdentifier(id)

    const renderDynamicTabComponent = (tabId: string): JSX.Element => {
        if (!node) {
            return null
        }

        return nodeType.toLowerCase() === SIDEBAR_KEYS.nodeGVK.Kind.toLowerCase() ? (
            <NodeDetails
                key={dynamicActiveTab.componentKey}
                isSuperAdmin={isSuperAdmin}
                addTab={addTab}
                k8SObjectMapRaw={k8SObjectMapRaw?.result.apiResources || null}
                updateTabUrl={getUpdateTabUrlForId(tabId)}
            />
        ) : (
            <div className="resource-details-container flexbox-col">
                <NodeDetailComponent
                    key={dynamicActiveTab.componentKey}
                    loadingResources={rawGVKLoader}
                    isResourceBrowserView
                    k8SObjectMapRaw={k8SObjectMapRaw?.result.apiResources || null}
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
        <ClusterOverview
            key={tabs[FIXED_TABS_INDICES.OVERVIEW]?.componentKey}
            isSuperAdmin={isSuperAdmin}
            selectedCluster={selectedCluster}
        />,
        <K8SResourceTabComponent
            key={tabs[FIXED_TABS_INDICES.K8S_RESOURCE_LIST]?.componentKey}
            selectedCluster={selectedCluster}
            addTab={addTab}
            renderRefreshBar={renderRefreshBar(
                isDataStale,
                tabs?.[FIXED_TABS_INDICES.K8S_RESOURCE_LIST]?.lastSyncMoment?.toString(),
                refreshData,
            )}
            isSuperAdmin={isSuperAdmin}
            isOpen={!!tabs?.[FIXED_TABS_INDICES.K8S_RESOURCE_LIST]?.isSelected}
            showStaleDataWarning={isDataStale}
            updateK8sResourceTab={getUpdateTabUrlForId(tabs[FIXED_TABS_INDICES.K8S_RESOURCE_LIST]?.id)}
            updateK8sResourceTabLastSyncMoment={updateK8sResourceTabLastSyncMoment}
            k8SObjectMapRaw={k8SObjectMapRaw?.result?.apiResources || null}
        />,
        ...(isSuperAdmin &&
        tabs[FIXED_TABS_INDICES.ADMIN_TERMINAL]?.name === AppDetailsTabs.terminal &&
        tabs[FIXED_TABS_INDICES.ADMIN_TERMINAL].isAlive
            ? [
                  <AdminTerminal
                      key={tabs[FIXED_TABS_INDICES.ADMIN_TERMINAL].componentKey}
                      isSuperAdmin={isSuperAdmin}
                      updateTerminalTabUrl={updateTerminalTabUrl}
                  />,
              ]
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
                        isOverview={isOverviewNodeType}
                    />
                </div>
                {/* NOTE: since the terminal is only visibly hidden; we need to make sure it is rendered at the end of the page */}
                {dynamicActiveTab && renderDynamicTabComponent(dynamicActiveTab.id)}
                {tabs.length > 0 &&
                    fixedTabComponents.map((component, index) => {
                        /* NOTE: need to retain terminal layout. Thus hiding it through visibility */
                        const hideClassName =
                            tabs[index].name === AppDetailsTabs.terminal
                                ? 'cluster-terminal-hidden'
                                : 'dc__hide-section'
                        return (
                            <div key={component.key} className={!tabs[index].isSelected ? hideClassName : ''}>
                                {component}
                            </div>
                        )
                    })}
            </>
        )
    }

    return (
        <div className="resource-browser-container h-100 bcn-0">
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
