import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import {
    Progressing,
    getUserRole,
    BreadCrumb,
    useBreadcrumb,
    ErrorScreenManager,
    Reload,
    DevtronProgressing,
    useAsync,
    abortPreviousRequests,
} from '@devtron-labs/devtron-fe-common-lib'
import { ShortcutProvider } from 'react-keybind'
import moment from 'moment'
import {
    convertToOptionsList,
    createGroupSelectList,
    filterImageList,
    sortObjectArrayAlphabetically,
} from '../../common'
import PageHeader from '../../common/header/PageHeader'
import { ApiResourceGroupType, ClusterOptionType, K8SObjectMapType, ResourceListPayloadType } from '../Types'
import {
    getResourceGroupList,
    getResourceGroupListRaw,
    getResourceList,
    namespaceListByClusterId,
} from '../ResourceBrowser.service'
import { ALL_NAMESPACE_OPTION, K8S_EMPTY_GROUP, SIDEBAR_KEYS } from '../Constants'
import { URLS } from '../../../config'
import Sidebar from './Sidebar'
import { K8SResourceList } from './K8SResourceList'
import { ReactComponent as Add } from '../../../assets/icons/ic-add.svg'
import { ReactComponent as Warning } from '../../../assets/icons/ic-warning.svg'
import { CreateResource } from './CreateResource'
import { AppDetailsTabs, AppDetailsTabsIdPrefix } from '../../v2/appDetails/appDetails.store'
import NodeDetailComponent from '../../v2/appDetails/k8Resource/nodeDetail/NodeDetail.component'
import { SelectedResourceType } from '../../v2/appDetails/appDetails.type'
import ConnectingToClusterState from './ConnectingToClusterState'
import { DynamicTabs, useTabs } from '../../common/DynamicTabs'
import {
    getK8SObjectMapAfterGroupHeadingClick,
    getTabsBasedOnRole,
    convertResourceGroupListToK8sObjectList,
    getEventObjectTypeGVK,
    getResourceFromK8SObjectMap,
} from '../Utils'
import '../ResourceBrowser.scss'
import { getHostURLConfiguration } from '../../../services/service'
import { clusterNamespaceList, getClusterList, getClusterListMin } from '../../ClusterNodes/clusterNodes.service'
import ClusterSelector from './ClusterSelector'
import ClusterOverview from '../../ClusterNodes/ClusterOverview'
import ClusterTerminal from '../../ClusterNodes/ClusterTerminal'
import { createTaintsList } from '../../cluster/cluster.util'
import NodeDetailsList from '../../ClusterNodes/NodeDetailsList'
import NodeDetails from '../../ClusterNodes/NodeDetails'
import { DEFAULT_CLUSTER_ID } from '../../cluster/cluster.type'
import { useOnComponentUpdate } from '../../common/helpers/Helpers'

const ResourceList = () => {
    const { clusterId, namespace, nodeType, node, group } = useParams<{
        clusterId: string
        namespace: string
        nodeType: string
        node: string
        group: string
    }>()
    const { replace, push } = useHistory()
    const {
        tabs,
        initTabs,
        addTab,
        markTabActiveByIdentifier,
        markTabActiveById,
        removeTabByIdentifier,
        updateTabUrl,
        stopTabByIdentifier,
    } = useTabs(URLS.RESOURCE_BROWSER)
    const [searchText, setSearchText] = useState('')
    const [logSearchTerms, setLogSearchTerms] = useState<Record<string, string>>()
    const [lastDataSyncMoment, setLastDataSyncMoment] = useState<moment.Moment>()
    const [showCreateResourceModal, setShowCreateResourceModal] = useState(false)
    const [isDataStale, setIsDataStale] = useState(false)

    const [detailClusterListLoading, detailClusterList, detailClusterListError] = useAsync(getClusterList)

    const selectedDetailsCluster = useMemo(
        () => detailClusterList?.result.find((cluster) => cluster.id === +clusterId) || null,
        [detailClusterList, clusterId],
    )

    /* FIXME: check proper usage of controllers */
    const resourceListAbortController = useRef(null)
    const sideDataAbortController = useRef(null)

    /* TODO: Find use for this error */
    const [rawGVKLoader, _k8SObjectMapRaw, rawGVKError] = useAsync(
        () => getResourceGroupListRaw(clusterId),
        [clusterId],
    )

    /* TODO: on resourceSwitch update namespace to default ? */
    const k8SObjectMapRaw = useMemo(
        () => convertResourceGroupListToK8sObjectList(_k8SObjectMapRaw?.result.apiResources || [], nodeType),
        [_k8SObjectMapRaw, nodeType],
    )

    const selectedResource = useMemo(
        () => getResourceFromK8SObjectMap(k8SObjectMapRaw, nodeType),
        [k8SObjectMapRaw, nodeType]
    )

    /* TODO: propagate resourceListDataError rename this to resourceListBody or something */
    const [resourceListLoader, resourceListData, resourceListDataError, reloadResourceListData] = useAsync(() => {
        if (!selectedResource) {
            return null
        }
        const resourceListPayload: ResourceListPayloadType = {
            clusterId: +clusterId,
            k8sRequest: {
                resourceIdentifier: {
                    groupVersionKind: selectedResource.gvk,
                    ...(selectedResource.namespaced && {
                        namespace: namespace === ALL_NAMESPACE_OPTION.value ? '' : namespace,
                    }),
                },
            },
        }
        return abortPreviousRequests(
            () => getResourceList(resourceListPayload, resourceListAbortController.current.signal),
            resourceListAbortController,
        )
    }, [selectedResource, clusterId, namespace])

    useEffect(() => setLastDataSyncMoment(moment()), [resourceListData])

    const resourceList = useMemo(() => resourceListData?.result || null, [resourceListData])

    const [sidebarDataLoading, _k8SObjectMap, sidebarDataError, getSidebarData] = useAsync(async () => {
        return abortPreviousRequests(
            () => getResourceGroupList(clusterId, sideDataAbortController.current.signal),
            sideDataAbortController,
        )
    }, [clusterId])

    const [k8SObjectMapLoading, k8SObjectMap, , , setK8SObjectMap] = useAsync<Map<string, K8SObjectMapType>>(
        async () => convertResourceGroupListToK8sObjectList(_k8SObjectMap?.result.apiResources || [], nodeType),
        [_k8SObjectMap, nodeType],
    )

    const errorMessage = sidebarDataError?.errors[0]?.userMessage || sidebarDataError?.['message'] || ''

    const [loading, data, error] = useAsync(() =>
        Promise.all([
            getClusterListMin(),
            getHostURLConfiguration('DEFAULT_TERMINAL_IMAGE_LIST'),
            window._env_.K8S_CLIENT ? null : getUserRole(),
            clusterNamespaceList(),
        ]),
    )

    const [clusterListData = null, hostUrlConfig = null, userRole = null, namespaceList = null] = data || []

    const clusterList = useMemo(() => clusterListData?.result || [], [clusterListData])

    const clusterOptions: ClusterOptionType[] = useMemo(
        () =>
            convertToOptionsList(
                sortObjectArrayAlphabetically(clusterList, 'name'),
                'name',
                'id',
                'nodeErrors',
            ) as ClusterOptionType[],
        [clusterList],
    )

    const selectedCluster = clusterOptions.find((cluster) => String(cluster.value) === clusterId)
                            || { label: '', value: clusterId, errorInConnecting: '' }

    const imageList = useMemo(() => JSON.parse(hostUrlConfig?.result.value || '[]'), [hostUrlConfig?.result])

    const isSuperAdmin = userRole?.result.superAdmin || false

    const initTabsBasedOnRole = (reInit: boolean) => {
        const _tabs = getTabsBasedOnRole(selectedCluster, namespace, isSuperAdmin)

        initTabs(_tabs, reInit)

        /* mark the active tab based on nodeType */
        const activeTab = _tabs.find((tab) => tab.url.toLowerCase().includes(nodeType.toLowerCase())) || _tabs[1]
        if (!activeTab) {
            return
        }
        markTabActiveByIdentifier(activeTab.idPrefix, activeTab.name)
    }

    /* FIXME: should we retain tab data ? */
    useEffect(() => initTabsBasedOnRole(false), [isSuperAdmin])
    useOnComponentUpdate(() => initTabsBasedOnRole(true), [clusterId])

    const namespaceDefaultList = namespaceList?.result || []

    useEffect(() => {
        if (typeof window['crate']?.hide === 'function') {
            window['crate'].hide()
        }

        // Clean up on unmount
        return (): void => {
            if (typeof window['crate']?.show === 'function') {
                window['crate'].show()
            }
            /* TODO: bind the call properly */
            resourceListAbortController.current?.abort()
            sideDataAbortController.current?.abort()
        }
    }, [])

    const hideSyncWarning = sidebarDataLoading || rawGVKLoader || !isDataStale || resourceListLoader || node

    /* TODO: Find use for this loading state */
    const [namespaceByClusterIdListLoading, namespaceByClusterIdList] = useAsync(
        () => namespaceListByClusterId(clusterId),
        [clusterId],
    )

    const namespaceOptions = useMemo(
        () => [ALL_NAMESPACE_OPTION, ...convertToOptionsList(namespaceByClusterIdList?.result.sort() || [])],
        [namespaceByClusterIdList],
    )

    const selectedNamespace = useMemo(
        () => namespaceOptions.find((_namespace) => _namespace.value === namespace) || namespaceOptions[0],
        [namespaceOptions, namespace],
    )

    const refreshData = (): void => {
        setLastDataSyncMoment(moment())
        setIsDataStale(false)
        reloadResourceListData()
    }

    const renderRefreshBar = () => {
        if (hideSyncWarning) {
            return null
        }
        return (
            <div className="fs-13 flex left w-100 bcy-1 h-32 warning-icon-y7-imp dc__border-bottom-y2">
                <div className="pl-12 flex fs-13 pt-6 pb-6 pl-12">
                    <Warning className="icon-dim-20 mr-8" />
                    <span>Last synced {lastDataSyncMoment.toString()}. The data might be stale. </span>
                    <span className="cb-5 ml-4 fw-6 cursor" onClick={refreshData}>
                        Sync now
                    </span>
                </div>
            </div>
        )
    }

    const handleGroupHeadingClick = (e: React.MouseEvent<HTMLElement>, preventCollapse?: boolean): void => {
        setK8SObjectMap(getK8SObjectMapAfterGroupHeadingClick(e, k8SObjectMap, preventCollapse))
    }

    const onClusterChange = (selected) => {
        if (selected.value === selectedCluster?.value) {
            return
        }

        sideDataAbortController.current?.abort()
        resourceListAbortController.current?.abort()

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
                            clusterList={clusterOptions}
                            clusterId={clusterId}
                        />
                    ),
                    linked: false,
                },
                ':namespace?': null,
                ':nodeType?': null,
                ':group?': null,
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

    const handleRetry = () => {
        sideDataAbortController.current?.abort()
        getSidebarData()
    }

    const getSelectedResourceData = () => {
        return {
            clusterId: +clusterId,
            kind: selectedResource.gvk.Kind as string,
            version: selectedResource.gvk.Version,
            group: selectedResource.gvk.Group,
            namespace: namespace,
            name: node,
            containers: [],
        } as SelectedResourceType
    }

    const renderBreadcrumbs = () => {
        return <BreadCrumb breadcrumbs={breadcrumbs} />
    }

    const renderSelectedResourceBody = () => {
        if (!selectedResource) {
            return (
                <div className="h-100 node-data-container bcn-0">
                    <Progressing pageLoader />
                </div>
            )
        }
        if (nodeType === SIDEBAR_KEYS.nodeGVK.Kind.toLowerCase()) {
            return (
                <NodeDetailsList
                    clusterId={clusterId}
                    isSuperAdmin={isSuperAdmin}
                    nodeK8sVersions={selectedDetailsCluster?.nodeK8sVersions}
                    renderCallBackSync={renderRefreshBar}
                    addTab={addTab}
                    syncError={!hideSyncWarning}
                    setLastDataSyncMoment={setLastDataSyncMoment}
                />
            )
        }
        return (
            <K8SResourceList
                /* TODO: propagate resourceListDataError */
                selectedResource={selectedResource}
                resourceList={resourceList}
                noResults={!resourceListData}
                selectedCluster={selectedCluster}
                namespaceOptions={namespaceOptions}
                selectedNamespace={selectedNamespace}
                resourceListLoader={resourceListLoader || !selectedResource || rawGVKLoader}
                searchText={searchText}
                setSearchText={setSearchText}
                isCreateModalOpen={showCreateResourceModal}
                addTab={addTab}
                renderCallBackSync={renderRefreshBar}
                syncError={!hideSyncWarning}
                k8SObjectMapRaw={k8SObjectMapRaw ?? k8SObjectMap}
                updateTabUrl={updateTabUrl}
            />
        )
    }

    const renderClusterTerminalLoader = (): JSX.Element => {
        if (detailClusterListLoading) {
            return (
                <div className="h-100 node-data-container bcn-0">
                    <Progressing pageLoader />
                </div>
            )
        }

        if (detailClusterListError || !namespaceDefaultList[selectedDetailsCluster.name]) {
            const errCode = detailClusterListError?.errors[0]?.['code'] || detailClusterListError?.['code']
            return (
                <div className="bcn-0 node-data-container flex">
                    {isSuperAdmin ? <Reload /> : <ErrorScreenManager code={errCode} />}
                </div>
            )
        }

        return null
    }

    const renderClusterTerminal = (): JSX.Element => {
        return (
            null && <ClusterTerminal
                showTerminal={!detailClusterListLoading && !detailClusterListError && nodeType === AppDetailsTabs.terminal}
                clusterId={+clusterId}
                nodeGroups={createGroupSelectList(selectedDetailsCluster.nodeDetails, 'nodeName')}
                taints={createTaintsList(selectedDetailsCluster.nodeDetails, 'nodeName')}
                clusterImageList={filterImageList(imageList, selectedDetailsCluster.serverVersion) || []}
                namespaceList={namespaceDefaultList[selectedDetailsCluster.name]}
                isNodeDetailsPage
            />
        )
    }

    const renderDetails = (): JSX.Element => {
        if (nodeType === SIDEBAR_KEYS.nodeGVK.Kind.toLowerCase() && node) {
            return (
                <NodeDetails
                    isSuperAdmin={isSuperAdmin}
                    markTabActiveByIdentifier={markTabActiveByIdentifier}
                    addTab={addTab}
                    k8SObjectMapRaw={k8SObjectMapRaw ?? k8SObjectMap}
                    lastDataSyncMoment={lastDataSyncMoment}
                />
            )
        }
        if (node && !rawGVKLoader) {
            return (
                <div className="resource-details-container">
                    <NodeDetailComponent
                        loadingResources={rawGVKLoader}
                        isResourceBrowserView
                        selectedResource={getSelectedResourceData()}
                        markTabActiveByIdentifier={markTabActiveByIdentifier}
                        addTab={addTab}
                        logSearchTerms={logSearchTerms}
                        setLogSearchTerms={setLogSearchTerms}
                        removeTabByIdentifier={removeTabByIdentifier}
                    />
                </div>
            )
        }
        if (nodeType === AppDetailsTabs.cluster_overview.toLocaleLowerCase()) {
            return (
                <ClusterOverview
                    isSuperAdmin={isSuperAdmin}
                    selectedCluster={selectedCluster}
                />
            )
        }

        return sidebarDataLoading || rawGVKLoader || sidebarDataError ? (
            <ConnectingToClusterState
                loader={sidebarDataLoading || rawGVKLoader}
                errorMsg={errorMessage}
                selectedCluster={selectedCluster}
                handleRetry={handleRetry}
                sideDataAbortController={sideDataAbortController.current}
            />
        ) : (
            <div className="resource-browser bcn-0">
                <Sidebar
                    k8SObjectMap={k8SObjectMap}
                    handleGroupHeadingClick={handleGroupHeadingClick}
                    selectedResource={selectedResource}
                    isCreateModalOpen={showCreateResourceModal}
                    updateTabUrl={updateTabUrl}
                />
                {renderSelectedResourceBody()}
            </div>
        )
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
                            lastDataSyncMoment={lastDataSyncMoment}
                            loader={resourceListLoader}
                            isOverview={nodeType === SIDEBAR_KEYS.overviewGVK.Kind.toLowerCase()}
                            setIsDataStale={setIsDataStale}
                        />
                    </div>
                </div>
                {nodeType === AppDetailsTabs.terminal ? renderClusterTerminalLoader() : renderDetails()}
                {renderClusterTerminal()}
            </>
        )
    }

    const renderCreateResourceButton = useCallback(
        () => (
            <>
                <div
                    className="cursor flex cta small h-28 pl-8 pr-10 pt-5 pb-5 lh-n fcb-5 mr-16"
                    data-testid="create-resource"
                    onClick={showResourceModal}
                >
                    <Add className="icon-dim-16 fcb-5 mr-5" />
                    Create resource
                </div>
                <span className="dc__divider" />
            </>
        ),
        [showResourceModal],
    )

    return (
        <ShortcutProvider>
            <div className="resource-browser-container h-100 bcn-0">
                <PageHeader
                    isBreadcrumbs
                    breadCrumbs={renderBreadcrumbs}
                    headerName=""
                    renderActionButtons={!sidebarDataLoading && k8SObjectMap && renderCreateResourceButton}
                />
                {renderMainBody()}
                {showCreateResourceModal && <CreateResource closePopup={closeResourceModal} clusterId={clusterId} />}
            </div>
        </ShortcutProvider>
    )
}

export default ResourceList
