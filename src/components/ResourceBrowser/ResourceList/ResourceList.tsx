import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { NavLink, useHistory, useLocation, useParams } from 'react-router-dom'
import {
    showError,
    Progressing,
    ServerErrors,
    getUserRole,
    BreadCrumb,
    useBreadcrumb,
    ErrorScreenManager,
    Reload,
    DevtronProgressing,
    useAsync,
} from '@devtron-labs/devtron-fe-common-lib'
import { ShortcutProvider } from 'react-keybind'
import {
    convertToOptionsList,
    createGroupSelectList,
    filterImageList,
    processK8SObjects,
    sortObjectArrayAlphabetically,
} from '../../common'
import PageHeader from '../../common/header/PageHeader'
import {
    ApiResourceGroupType,
    ClusterOptionType,
    K8SObjectMapType,
    K8SObjectType,
    ResourceListPayloadType,
} from '../Types'
import {
    getResourceGroupList,
    getResourceGroupListRaw,
    getResourceList,
    namespaceListByClusterId,
} from '../ResourceBrowser.service'
import { Nodes, OptionType } from '../../app/types'
import { ALL_NAMESPACE_OPTION, EVENT_LIST, K8S_EMPTY_GROUP, ORDERED_AGGREGATORS, SIDEBAR_KEYS } from '../Constants'
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
import { SOME_ERROR_MSG } from '../../../config/constantMessaging'
import { DynamicTabs, useTabs } from '../../common/DynamicTabs'
import {
    getEventObjectTypeGVK,
    getGroupedK8sObjectMap,
    getK8SObjectMapAfterGroupHeadingClick,
    getParentAndChildNodes,
    getUpdatedNodeSelectionData,
    getUpdatedResourceSelectionData,
    removeDefaultForStorageClass,
    sortEventListData,
    getTabsBasedOnRole,
    convertResourceGroupListToK8sObjectList,
} from '../Utils'
import '../ResourceBrowser.scss'
import { ClusterCapacityType, ClusterDetail, ClusterImageList } from '../../ClusterNodes/types'
import { getHostURLConfiguration } from '../../../services/service'
import { clusterNamespaceList, getClusterList, getClusterListMin } from '../../ClusterNodes/clusterNodes.service'
import ClusterSelector from './ClusterSelector'
import ClusterOverview from '../../ClusterNodes/ClusterOverview'
import ClusterTerminal from '../../ClusterNodes/ClusterTerminal'
import { createTaintsList } from '../../cluster/cluster.util'
import NodeDetailsList from '../../ClusterNodes/NodeDetailsList'
import NodeDetails from '../../ClusterNodes/NodeDetails'
import { DEFAULT_CLUSTER_ID } from '../../cluster/cluster.type'

export default function ResourceList() {
    const { clusterId, namespace, nodeType, node, group } = useParams<{
        clusterId: string
        namespace: string
        nodeType: string
        node: string
        group: string
    }>()
    const { replace, push } = useHistory()
    const location = useLocation()
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
    const [selectedResource, setSelectedResource] = useState<ApiResourceGroupType>({
        namespaced: false,
        gvk: SIDEBAR_KEYS.nodeGVK,
    })
    const [logSearchTerms, setLogSearchTerms] = useState<Record<string, string>>()
    const [lastDataSyncTimeString, setLastDataSyncTimeString] = useState('')
    const [showCreateResourceModal, setShowCreateResourceModal] = useState(false)

    const [detailClusterListLoading, detailClusterList, detailClusterListError] = useAsync(getClusterList)

    const selectedDetailsCluster = useMemo(
        () => detailClusterList?.result.find((cluster) => cluster.id === +clusterId) || null,
        [detailClusterList, clusterId],
    )

    /* FIXME: check proper usage of controllers */
    const isStaleDataRef = useRef<boolean>(false)
    const resourceListAbortController = new AbortController()
    const sideDataAbortController = useRef<{
        prev: AbortController
        new: AbortController
    }>({
        prev: null,
        new: new AbortController(),
    })

    /* rename this to resourceListBody or something */
    const [resourceListLoader, resourceListData, resourceListDataError] = useAsync(
        () => {
            const resourceListPayload: ResourceListPayloadType = {
                clusterId: +clusterId,
                k8sRequest: {
                    resourceIdentifier: {
                        groupVersionKind: selectedResource.gvk,
                        ...(selectedResource.namespaced && { namespace: namespace === ALL_NAMESPACE_OPTION.value ? '' : namespace })
                    },
                },
            }
            return getResourceList(resourceListPayload, resourceListAbortController.signal)
        },
        [selectedResource, clusterId, namespace]
    )

    const resourceList = useMemo(() => resourceListData?.result || null, [resourceListData])

    const [sidebarDataLoading, _k8SObjectMap, sidebarDataError, getSidebarData] = useAsync(
        async () => {
            sideDataAbortController.current.new = new AbortController()
            return await getResourceGroupList(clusterId, sideDataAbortController.current.new.signal)
        },
        [clusterId],
    )

    const [, k8SObjectMap, , , setK8SObjectMap] = useAsync<Map<string, K8SObjectMapType>>(
        async () => await convertResourceGroupListToK8sObjectList(_k8SObjectMap?.result.apiResources || [], nodeType),
        [_k8SObjectMap, nodeType]
    )

    const errorMessage = sidebarDataError?.errors[0]?.userMessage || sidebarDataError?.['message'] || ''

    const [loading, data, error] = useAsync(() =>
        Promise.all([
            getClusterListMin(),
            getHostURLConfiguration('DEFAULT_TERMINAL_IMAGE_LIST'),
            window._env_.K8S_CLIENT ? null : getUserRole(),
            clusterNamespaceList(),
        ])
    )

    const [clusterListData, hostUrlConfig, userRole, namespaceList] = data || []

    const clusterList = useMemo(() => clusterListData?.result || [], [clusterListData])

    const clusterOptions: ClusterOptionType[] = useMemo(() =>
        convertToOptionsList(
            sortObjectArrayAlphabetically(clusterList, 'name'),
            'name', 'id', 'nodeErrors',
        ) as ClusterOptionType[],
        [clusterList],
    )

    const selectedCluster = useMemo(() =>
        clusterOptions.find((cluster) => cluster.value === clusterId) || {
            label: '',
            value: clusterId,
            errorInConnecting: '',
        },
        [clusterOptions, clusterId],
    )

    const imageList = useMemo(() => JSON.parse(hostUrlConfig?.result.value || '[]'), [hostUrlConfig?.result])

    const initTabsBasedOnRole = useCallback((reInit: boolean, _isSuperAdmin?: boolean) => {
            const _tabs = getTabsBasedOnRole(clusterId, namespace, _isSuperAdmin)

            /* FIXME: persisted tabs */
            // try {
            //     const persistedTabsData = localStorage.getItem('persisted-tabs-data')
            //     if (persistedTabsData) {
            //         const parsedTabsData = JSON.parse(persistedTabsData)
            //         setResourceSelectionData(parsedTabsData.resourceSelectionData)
            //         setNodeSelectionData(parsedTabsData.nodeSelectionData)
            //     }
            // } catch (err) {}

            if (reInit) {
                initTabs(_tabs, true)
                return
            }

            initTabs(
                _tabs,
                false,
                !_isSuperAdmin ? [`${AppDetailsTabsIdPrefix.terminal}-${AppDetailsTabs.terminal}`] : null,
            )
        },
        [clusterId, namespace]
    )

    const isSuperAdmin: boolean = useMemo(() => {
            const _isSuperAdmin = userRole?.result.superAdmin || false
            initTabsBasedOnRole(true, _isSuperAdmin)
            return _isSuperAdmin
        },
        [userRole?.result],
    )

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
            resourceListAbortController.abort()
            abortReqAndUpdateSideDataController()
        }
    }, [])

    const [rawGVKLoader, _k8SObjectMapRaw, rawGVKError] = useAsync(() => getResourceGroupListRaw(clusterId), [clusterId])

    const k8SObjectMapRaw = useMemo(
        () => convertResourceGroupListToK8sObjectList(_k8SObjectMapRaw?.result.apiResources || [], nodeType),
        [_k8SObjectMapRaw, nodeType]
    )

    const hideSyncWarning: boolean =
        sidebarDataLoading ||
        rawGVKLoader ||
        !isStaleDataRef.current ||
        !(!node && lastDataSyncTimeString && !resourceListLoader)


    const [namespaceByClusterIdListLoading, namespaceByClusterIdList] = useAsync(
        () => namespaceListByClusterId(clusterId),
        [clusterId],
    )

    const namespaceOptions = useMemo(
        // FIXME: why was there a check for isArray on result?
        () => [ALL_NAMESPACE_OPTION, ...convertToOptionsList(namespaceByClusterIdList?.result.sort() || [])],
        [namespaceByClusterIdList],
    )

    const selectedNamespace = useMemo(
        () => namespaceOptions.find((_namespace) => _namespace.value === namespace) || namespaceOptions[0],
        [namespaceOptions, namespace],
    )

    const renderRefreshBar = () => {
        if (hideSyncWarning) {
            return null
        }
        return (
            <div className="fs-13 flex left w-100 bcy-1 h-32 warning-icon-y7-imp dc__border-bottom-y2">
                <div className="pl-12 flex fs-13 pt-6 pb-6 pl-12">
                    <Warning className="icon-dim-20 mr-8" />
                    <span>Last synced {lastDataSyncTimeString}. The data might be stale. </span>
                    <span className="cb-5 ml-4 fw-6 cursor" onClick={refreshData}>
                        Sync now
                    </span>
                </div>
            </div>
        )
    }

    const handleGroupHeadingClick = (e: any, preventCollapse?: boolean): void => {
        setK8SObjectMap(getK8SObjectMapAfterGroupHeadingClick(e, k8SObjectMap, preventCollapse))
    }

    const onChangeCluster = (selected, fromClusterSelect?: boolean, skipRedirection?: boolean): void => {
        if (selected.value === selectedCluster?.value) {
            return
        }

        if (sideDataAbortController.current.prev?.signal.aborted) {
            sideDataAbortController.current.prev = null
        }

        abortReqAndUpdateSideDataController()

        if (selected.value === DEFAULT_CLUSTER_ID && window._env_.HIDE_DEFAULT_CLUSTER) {
            replace({
                pathname: URLS.RESOURCE_BROWSER,
            })
            return
        }

        if (skipRedirection) {
            return
        }

        const path = `${URLS.RESOURCE_BROWSER}/${selected.value}/${
            ALL_NAMESPACE_OPTION.value
        }/${SIDEBAR_KEYS.nodeGVK.Kind.toLowerCase()}/${K8S_EMPTY_GROUP}`

        if (fromClusterSelect) {
            replace({
                pathname: path,
            })
            initTabsBasedOnRole(true, isSuperAdmin)
        } else {
            push({
                pathname: path,
            })
        }
    }

    const onClusterChange = (value) => {
        onChangeCluster(value, true, false)
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

    const refreshData = (): void => {
        setSelectedResource({...selectedResource})
        setLastDataSyncTimeString(Date())
    }

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
        abortReqAndUpdateSideDataController(true)
        getSidebarData()
    }

    const abortReqAndUpdateSideDataController = (emptyPrev?: boolean) => {
        if (emptyPrev) {
            sideDataAbortController.current.prev = null
        } else {
            sideDataAbortController.current.new.abort()
            sideDataAbortController.current.prev = sideDataAbortController.current.new
        }
    }

    const renderSelectedResourceBody = () => {
        if (nodeType === SIDEBAR_KEYS.nodeGVK.Kind.toLowerCase()) {
            return (
                <NodeDetailsList
                    clusterId={clusterId}
                    isSuperAdmin={isSuperAdmin}
                    nodeK8sVersions={selectedDetailsCluster?.nodeK8sVersions}
                    renderCallBackSync={renderRefreshBar}
                    addTab={addTab}
                    syncError={!hideSyncWarning}
                    setLastDataSyncTimeString={setLastDataSyncTimeString}
                />
            )
        }
        return (
            <K8SResourceList
                selectedResource={selectedResource}
                resourceList={resourceList}
                noResults={!resourceListData}
                selectedCluster={selectedCluster}
                namespaceOptions={namespaceOptions}
                selectedNamespace={selectedNamespace}
                resourceListLoader={resourceListLoader}
                searchText={searchText}
                setSearchText={setSearchText}
                isCreateModalOpen={showCreateResourceModal}
                addTab={addTab}
                renderCallBackSync={renderRefreshBar}
                syncError={!hideSyncWarning}
                k8SObjectMapRaw={k8SObjectMapRaw ?? k8SObjectMap}
            />
        )
    }

    const renderClusterTerminal = (): JSX.Element => {
        if (detailClusterListLoading) {
            return (
                <div className="h-100 node-data-container bcn-0">
                    <Progressing pageLoader />
                </div>
            )
        }

        if (!namespaceDefaultList?.[selectedDetailsCluster.name]) {
            return (
                <div className="bcn-0 node-data-container flex">
                    {isSuperAdmin ? <Reload /> : <ErrorScreenManager code={403} />}
                </div>
            )
        }

        const _imageList = filterImageList(imageList, selectedDetailsCluster.serverVersion)

        return (
            <ClusterTerminal
                showTerminal={true}
                clusterId={+clusterId}
                nodeGroups={createGroupSelectList(selectedDetailsCluster.nodeDetails, 'nodeName')}
                taints={createTaintsList(selectedDetailsCluster.nodeDetails, 'nodeName')}
                clusterImageList={_imageList}
                namespaceList={namespaceDefaultList[selectedDetailsCluster.name]}
                isNodeDetailsPage /* FIXME: what is the use of this ? */
            />
        )
    }

    const getSelectedResourceData = () => {
        if (sidebarDataLoading || rawGVKLoader || loading) {
            return null
        }

        const selectedNode = resourceList?.data.find(
            (_resource) => _resource.name === node && (!_resource.namespace || _resource.namespace === namespace),
        )

        const _selectedResource = getEventObjectTypeGVK(k8SObjectMapRaw ?? k8SObjectMap, nodeType)

        const data = {
            clusterId: +clusterId,
            kind: selectedResource.gvk.Kind as string,
            version: selectedResource.gvk.Version,
            group: selectedResource.gvk.Group,
            namespace: selectedNode?.namespace || '',
            name: selectedNode?.name || '',
            containers: selectedNode?.containers || [],
        } as SelectedResourceType
        console.log(data)
        return data
    }

    const renderDetails = (): JSX.Element => {
        if (nodeType === SIDEBAR_KEYS.nodeGVK.Kind.toLowerCase() && node) {
            return (
                <NodeDetails
                    isSuperAdmin={isSuperAdmin}
                    markTabActiveByIdentifier={markTabActiveByIdentifier}
                    addTab={addTab}
                    k8SObjectMapRaw={k8SObjectMapRaw ?? k8SObjectMap}
                    lastDataSyncTimeString={lastDataSyncTimeString} // TODO: update
                />
            )
        }
        if (node) {
            return (
                <div className="resource-details-container">
                    <NodeDetailComponent
                        loadingResources={resourceListLoader || rawGVKLoader || sidebarDataLoading}
                        isResourceBrowserView
                        /* FIXME: */
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
                    setSelectedResource={setSelectedResource}
                    selectedCluster={selectedCluster}
                    sideDataAbortController={sideDataAbortController.current}
                />
            )
        }

        /* TODO: handle retry */
        return sidebarDataLoading || rawGVKLoader ||  sidebarDataError ? (
            <ConnectingToClusterState
                loader={sidebarDataLoading}
                errorMsg={errorMessage}
                selectedCluster={selectedCluster}
                handleRetry={handleRetry} // here
                sideDataAbortController={sideDataAbortController.current}
            />
        ) : (
            <div className="resource-browser bcn-0">
                <Sidebar
                    k8SObjectMap={k8SObjectMap}
                    handleGroupHeadingClick={handleGroupHeadingClick}
                    selectedResource={selectedResource}
                    setSelectedResource={setSelectedResource}
                    isCreateModalOpen={showCreateResourceModal}
                    updateTabUrl={updateTabUrl}
                />
                {renderSelectedResourceBody()}
            </div>
        )
    }

    const createResourceButton = () => (
        !sidebarDataLoading &&
        k8SObjectMap && (
            <>
                <div
                    className="cursor flex cta small h-28 pl-8 pr-10 pt-5 pb-5 lh-n fcb-5 mr-16"
                    data-testid="create-resource"
                    onClick={showResourceModal}
                >
                    <Add className="icon-dim-16 fcb-5 mr-5" /> Create resource
                </div>
                <span className="dc__divider" />
            </>
        )
    )

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
                            lastDataSyncTimeString={lastDataSyncTimeString}
                            loader={sidebarDataLoading || rawGVKLoader}
                            isOverview={nodeType === SIDEBAR_KEYS.overviewGVK.Kind.toLowerCase()}
                            isStaleDataRef={isStaleDataRef}
                            setLastDataSyncTimeString={setLastDataSyncTimeString}
                        />
                    </div>
                </div>
                {nodeType === AppDetailsTabs.terminal ? renderClusterTerminal() : renderDetails()}
            </>
        )
    }

    /* TODO: move it up */
    const renderBreadcrumbs = () => {
        return <BreadCrumb breadcrumbs={breadcrumbs} />
    }

    return (
        <ShortcutProvider>
            <div className="resource-browser-container h-100 bcn-0">
                <PageHeader
                    isBreadcrumbs={true}
                    breadCrumbs={renderBreadcrumbs}
                    headerName={''}
                    renderActionButtons={createResourceButton}
                />
                {renderMainBody()}
                {showCreateResourceModal && <CreateResource closePopup={closeResourceModal} clusterId={clusterId} />}
            </div>
        </ShortcutProvider>
    )
}
