import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import {
    getUserRole,
    BreadCrumb,
    useBreadcrumb,
    ErrorScreenManager,
    DevtronProgressing,
    useAsync,
    useEffectAfterMount,
    PageHeader,
    UseRegisterShortcutProvider,
} from '@devtron-labs/devtron-fe-common-lib'
import { ShortcutProvider } from 'react-keybind'
import { ClusterOptionType, URLParams } from '../Types'
import { ALL_NAMESPACE_OPTION, K8S_EMPTY_GROUP, SIDEBAR_KEYS } from '../Constants'
import { URLS } from '../../../config'
import { convertToOptionsList, sortObjectArrayAlphabetically } from '../../common'
import { CreateResource } from './CreateResource'
import { AppDetailsTabs } from '../../v2/appDetails/appDetails.store'
import NodeDetailComponent from '../../v2/appDetails/k8Resource/nodeDetail/NodeDetail.component'
import { DynamicTabs, useTabs } from '../../common/DynamicTabs'
import { getTabsBasedOnRole } from '../Utils'
import { getResourceGroupListRaw } from '../ResourceBrowser.service'
import { getClusterListMin } from '../../ClusterNodes/clusterNodes.service'
import ClusterSelector from './ClusterSelector'
import ClusterOverview from '../../ClusterNodes/ClusterOverview'
import NodeDetails from '../../ClusterNodes/NodeDetails'
import { DEFAULT_CLUSTER_ID } from '../../cluster/cluster.type'
import K8SResourceTabComponent from './K8SResourceTabComponent'
import AdminTerminal from './AdminTerminal'
import { renderCreateResourceButton } from '../PageHeader.buttons'
import { renderRefreshBar } from './ResourceList.component'

const ResourceList = () => {
    const { clusterId, namespace, nodeType, node } = useParams<URLParams>()
    const { replace } = useHistory()
    const {
        tabs,
        initTabs,
        addTab,
        markTabActiveByIdentifier,
        markTabActiveById,
        removeTabByIdentifier,
        updateTabUrl,
        updateTabComponentKey,
        updateTabLastSyncMoment,
        stopTabByIdentifier,
    } = useTabs(URLS.RESOURCE_BROWSER)
    const [logSearchTerms, setLogSearchTerms] = useState<Record<string, string>>()
    const [showCreateResourceModal, setShowCreateResourceModal] = useState(false)
    const [isDataStale, setIsDataStale] = useState(false)

    /* TODO: Find use for this error */
    const [rawGVKLoader, k8SObjectMapRaw /*rawGVKError*/] = useAsync(
        () => getResourceGroupListRaw(clusterId),
        [clusterId],
    )

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

    const isSuperAdmin = userRole?.result.superAdmin || false

    /* FIXME: could use constants for the tab indices */
    const dynamicActiveTab = tabs.find((tab, index) => index > (isSuperAdmin ? 2 : 1) && tab.isSelected)

    const initTabsBasedOnRole = (reInit: boolean) => {
        const _tabs = getTabsBasedOnRole(selectedCluster, namespace, isSuperAdmin)

        initTabs(_tabs, reInit)
    }

    useEffect(() => initTabsBasedOnRole(false), [isSuperAdmin])
    useEffectAfterMount(() => initTabsBasedOnRole(true), [clusterId])

    useEffect(() => {
        if (typeof window['crate']?.hide === 'function') {
            window['crate'].hide()
        }

        // Clean up on unmount
        return (): void => {
            /* TODO: figure this out */
            if (typeof window['crate']?.show === 'function') {
                window['crate'].show()
            }
        }
    }, [])

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

    const showResourceModal = (): void => {
        setShowCreateResourceModal(true)
    }

    const closeResourceModal = (_refreshData: boolean): void => {
        if (_refreshData) {
            refreshData()
        }
        setShowCreateResourceModal(false)
    }

    const renderBreadcrumbs = () => {
        return <BreadCrumb breadcrumbs={breadcrumbs} />
    }

    const updateTerminalTabUrl = useCallback(
        (queryParams: string) => {
            const terminalTab = tabs[2]
            if (!terminalTab && terminalTab.name !== AppDetailsTabs.terminal) {
                return
            }
            updateTabUrl(terminalTab.id, `${terminalTab.url.split('?')[0]}?${queryParams}`)
            if (!terminalTab.isSelected) {
                return
            }
            replace({ search: queryParams })
        },
        [tabs],
    )

    const updateK8sResourceTab = (url: string, dynamicTitle = '') => {
        updateTabUrl(tabs[1].id, url, dynamicTitle)
        replace(url)
    }

    const refreshData = (): void => {
        const activeTab = tabs.find((tab) => tab.isSelected)
        updateTabComponentKey(activeTab.id)
        updateTabLastSyncMoment(activeTab.id)
        setIsDataStale(false)
    }

    const renderDynamicTabComponent = (): JSX.Element => {
        if (!node) {
            return null
        }

        return nodeType.toLowerCase() === SIDEBAR_KEYS.nodeGVK.Kind.toLowerCase() ? (
            <NodeDetails
                isSuperAdmin={isSuperAdmin}
                markTabActiveByIdentifier={markTabActiveByIdentifier}
                addTab={addTab}
                k8SObjectMapRaw={k8SObjectMapRaw?.result.apiResources || null}
            />
        ) : (
            <div className="resource-details-container">
                <NodeDetailComponent
                    loadingResources={rawGVKLoader}
                    isResourceBrowserView
                    k8SObjectMapRaw={k8SObjectMapRaw?.result.apiResources || null}
                    markTabActiveByIdentifier={markTabActiveByIdentifier}
                    addTab={addTab}
                    logSearchTerms={logSearchTerms}
                    setLogSearchTerms={setLogSearchTerms}
                    removeTabByIdentifier={removeTabByIdentifier}
                />
            </div>
        )
    }

    const updateK8sResourceTabLastSyncMoment = () => {
        updateTabLastSyncMoment(tabs[1].id)
    }

    const fixedTabComponents = [
        <ClusterOverview isSuperAdmin={isSuperAdmin} selectedCluster={selectedCluster} />,
        <K8SResourceTabComponent
            selectedCluster={selectedCluster}
            addTab={addTab}
            renderRefreshBar={renderRefreshBar(isDataStale, tabs?.[1]?.lastSyncMoment?.toString(), refreshData)}
            isSuperAdmin={isSuperAdmin}
            showStaleDataWarning={isDataStale}
            updateK8sResourceTab={updateK8sResourceTab}
            updateK8sResourceTabLastSyncMoment={updateK8sResourceTabLastSyncMoment}
        />,
        ...(isSuperAdmin && tabs[2]?.name === AppDetailsTabs.terminal && tabs[2].isAlive
            ? [<AdminTerminal isSuperAdmin={isSuperAdmin} updateTerminalTabUrl={updateTerminalTabUrl} />]
            : []),
    ]

    const renderInvisible = (component: React.ReactNode, hide: boolean) => {
        return <div className={hide ? `hidden` : ''}>{component}</div>
    }

    const renderKeyedTabComponent = (component: React.ReactNode, key: string) => {
        return <div key={key}>{component}</div>
    }

    const renderMainBody = () => {
        if (error) {
            return (
                <div className="flex" style={{ height: 'calc(100vh - 48px)' }}>
                    <ErrorScreenManager code={error['code']} />
                </div>
            )
        }

        if (loading) {
            return (
                <div style={{ height: 'calc(100vh - 48px)' }}>
                    <DevtronProgressing parentClasses="h-100 flex bcn-0" classes="icon-dim-80" />
                </div>
            )
        }

        return (
            <>
                <div
                    className="h-36 flexbox dc__content-space"
                    style={{
                        boxShadow: 'inset 0 -1px 0 0 var(--N200)',
                    }}
                >
                    <div className="resource-browser-tab flex left w-100">
                        <DynamicTabs
                            tabs={tabs}
                            removeTabByIdentifier={removeTabByIdentifier}
                            markTabActiveById={markTabActiveById}
                            stopTabByIdentifier={stopTabByIdentifier}
                            enableShortCut={!showCreateResourceModal}
                            refreshData={refreshData}
                            isOverview={nodeType === SIDEBAR_KEYS.overviewGVK.Kind.toLowerCase()}
                            setIsDataStale={setIsDataStale}
                        />
                    </div>
                </div>
                {tabs.length > 0 &&
                    fixedTabComponents.map((component, index) =>
                        renderInvisible(
                            renderKeyedTabComponent(component, tabs[index].componentKey),
                            !tabs[index].isSelected,
                        ),
                    )}
                {/* NOTE: to allow for shareable urls if node is available in url but no associated
                 * dynamicTab we allow for this to pass into renderDynamicTabComponent as that will
                 * create the missing tab */}
                {(dynamicActiveTab || node) &&
                    renderKeyedTabComponent(renderDynamicTabComponent(), dynamicActiveTab?.componentKey || node)}
            </>
        )
    }

    return (
        <UseRegisterShortcutProvider>
            <ShortcutProvider>
                <div className="resource-browser-container h-100 bcn-0">
                    <PageHeader
                        isBreadcrumbs
                        breadCrumbs={renderBreadcrumbs}
                        headerName=""
                        renderActionButtons={renderCreateResourceButton(showResourceModal)}
                    />
                    {renderMainBody()}
                    {showCreateResourceModal && <CreateResource closePopup={closeResourceModal} clusterId={clusterId} />}
                </div>
            </ShortcutProvider>
        </UseRegisterShortcutProvider>
    )
}

export default ResourceList
