import React, { useState, useEffect, useRef } from 'react'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import {
    convertToOptionsList,
    handleUTCTime,
    processK8SObjects,
    sortObjectArrayAlphabetically,
} from '../../common'
import { showError, Progressing, ErrorScreenManager, ServerErrors } from '@devtron-labs/devtron-fe-common-lib'
import PageHeader from '../../common/header/PageHeader'
import {
    ApiResourceGroupType,
    ClusterOptionType,
    K8SObjectMapType,
    K8SObjectType,
    ResourceDetailType,
    ResourceListPayloadType,
} from '../Types'
import {
    getClusterList,
    getResourceGroupList,
    getResourceList,
    namespaceListByClusterId,
} from '../ResourceBrowser.service'
import { OptionType } from '../../app/types'
import {
    ALL_NAMESPACE_OPTION,
    ERROR_SCREEN_LEARN_MORE,
    ERROR_SCREEN_SUBTITLE,
    EVENT_LIST,
    K8S_EMPTY_GROUP,
    K8S_RESOURCE_LIST,
    ORDERED_AGGREGATORS,
    SIDEBAR_KEYS,
    STALE_DATA_WARNING_TEXT,
} from '../Constants'
import { DOCUMENTATION, URLS } from '../../../config'
import Sidebar from './Sidebar'
import { K8SResourceList } from './K8SResourceList'
import { ClusterSelection } from './ClusterSelection'
import { ReactComponent as RefreshIcon } from '../../../assets/icons/ic-arrows_clockwise.svg'
import { ReactComponent as Add } from '../../../assets/icons/ic-add.svg'
import { ReactComponent as Warning } from '../../../assets/icons/ic-warning.svg'
import K8ResourceIcon from '../../../assets/icons/ic-object.svg'
import { CreateResource } from './CreateResource'
import { AppDetailsTabs, AppDetailsTabsIdPrefix } from '../../v2/appDetails/appDetails.store'
import NodeDetailComponent from '../../v2/appDetails/k8Resource/nodeDetail/NodeDetail.component'
import { SelectedResourceType } from '../../v2/appDetails/appDetails.type'
import Tippy from '@tippyjs/react'
import moment from 'moment'
import ConnectingToClusterState from './ConnectingToClusterState'
import { SOME_ERROR_MSG } from '../../../config/constantMessaging'
import searchWorker from '../../../config/searchWorker'
import WebWorker from '../../app/WebWorker'
import { ShortcutProvider } from 'react-keybind'
import { DynamicTabs, useTabs } from '../../common/DynamicTabs'
import {
    checkIfDataIsStale,
    getEventObjectTypeGVK,
    getGroupedK8sObjectMap,
    getK8SObjectMapAfterGroupHeadingClick,
    getParentAndChildNodes,
    getUpdatedNodeSelectionData,
    getUpdatedResourceSelectionData,
    sortEventListData,
} from '../Utils'
import '../ResourceBrowser.scss'

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
    const { tabs, initTabs, addTab, markTabActiveByIdentifier, removeTabByIdentifier, updateTabUrl } = useTabs(
        `${URLS.RESOURCE_BROWSER}`,
    )
    const [loader, setLoader] = useState(false)
    const [clusterLoader, setClusterLoader] = useState(false)
    const [showErrorState, setShowErrorState] = useState(false)
    const [resourceListLoader, setResourceListLoader] = useState(true)
    const [noResults, setNoResults] = useState(false)
    const [k8SObjectMap, setK8SObjectMap] = useState<Map<string, K8SObjectMapType>>()
    const [resourceList, setResourceList] = useState<ResourceDetailType>()
    const [filteredResourceList, setFilteredResourceList] = useState<Record<string, any>[]>([])
    const [searchText, setSearchText] = useState('')
    const [searchApplied, setSearchApplied] = useState(false)
    const [clusterOptions, setClusterOptions] = useState<ClusterOptionType[]>([])
    const [namespaceOptions, setNamespaceOptions] = useState<OptionType[]>([])
    const [selectedCluster, setSelectedCluster] = useState<ClusterOptionType>(null)
    const [selectedNamespace, setSelectedNamespace] = useState<OptionType>(null)
    const [selectedResource, setSelectedResource] = useState<ApiResourceGroupType>(null)
    const [logSearchTerms, setLogSearchTerms] = useState<Record<string, string>>()
    const [lastDataSyncTimeString, setLastDataSyncTimeString] = useState('')
    const [lastDataSync, setLastDataSync] = useState(false)
    const [showCreateResourceModal, setShowCreateResourceModal] = useState(false)
    const [resourceSelectionData, setResourceSelectionData] = useState<Record<string, ApiResourceGroupType>>()
    const [nodeSelectionData, setNodeSelectionData] = useState<Record<string, Record<string, any>>>()
    const [errorStatusCode, setErrorStatusCode] = useState(0)
    const [errorMsg, setErrorMsg] = useState('')
    const [showSelectClusterState, setShowSelectClusterState] = useState(false)
    const isStaleDataRef = useRef<boolean>(false)
    const resourceListAbortController = new AbortController()
    const sideDataAbortController = useRef<{
        prev: AbortController
        new: AbortController
    }>({
        prev: null,
        new: new AbortController(),
    })
    const searchWorkerRef = useRef(null)
    useEffect(() => {
        if (typeof window['crate']?.hide === 'function') {
            window['crate'].hide()
        }

        // Get cluster data &  Initialize tabs on mount
        getClusterData()
        initTabs([
            {
                idPrefix: AppDetailsTabsIdPrefix.k8s_Resources,
                name: AppDetailsTabs.k8s_Resources,
                url: `${URLS.RESOURCE_BROWSER}/${clusterId}/${namespace}${nodeType ? `/${nodeType}` : ''}`,
                isSelected: true,
                positionFixed: true,
                iconPath: K8ResourceIcon,
            },
        ])

        // Retain selection data
        try {
            const persistedTabsData = localStorage.getItem('persisted-tabs-data')
            if (persistedTabsData) {
                const parsedTabsData = JSON.parse(persistedTabsData)
                setResourceSelectionData(parsedTabsData.resourceSelectionData)
                setNodeSelectionData(parsedTabsData.nodeSelectionData)
            }
        } catch (err) {}

        // Clean up on unmount
        return (): void => {
            if (typeof window['crate']?.show === 'function') {
                window['crate'].show()
            }
            stopSearchWorker()
            resourceListAbortController.abort()
            abortReqAndUpdateSideDataController()
        }
    }, [])

    // Mark tab active on path change
    useEffect(() => {
        if (selectedResource && !node) {
            markTabActiveByIdentifier(AppDetailsTabsIdPrefix.k8s_Resources, AppDetailsTabs.k8s_Resources)
        }

        if (location.pathname === URLS.RESOURCE_BROWSER) {
            abortReqAndUpdateSideDataController()
            setSelectedCluster(null)
            setLoader(false)
        } else if (clusterOptions.length > 0 && clusterId != selectedCluster?.value) {
            const _clusterOption = clusterOptions.find((_option) => _option.value == clusterId)
            if (_clusterOption) {
                onChangeCluster(
                    clusterOptions.find((_option) => _option.value == clusterId),
                    false,
                    true,
                )
            }
        }
    }, [location.pathname])

    // Update K8sResources tab url on cluster/namespace/kind changes
    useEffect(() => {
        if (selectedCluster?.value && selectedNamespace?.value && selectedResource?.gvk?.Kind) {
            updateTabUrl(
                `${AppDetailsTabsIdPrefix.k8s_Resources}-${AppDetailsTabs.k8s_Resources}`,
                `${URLS.RESOURCE_BROWSER}/${selectedCluster.value}/${
                    selectedNamespace.value
                }/${selectedResource.gvk.Kind.toLowerCase()}/${
                    selectedResource.gvk.Group.toLowerCase() || K8S_EMPTY_GROUP
                }`,
            )
        }
    }, [selectedCluster, selectedNamespace, selectedResource])

    useEffect(() => {
        if (clusterId && selectedResource) {
            getResourceListData()
            setSearchText('')
            setSearchApplied(false)

            return (): void => {
                resourceListAbortController.abort()
            }
        }
    }, [selectedResource])

    useEffect(() => {
        if (!loader && clusterId && selectedResource?.namespaced) {
            getResourceListData(true)

            return (): void => {
                resourceListAbortController.abort()
            }
        }
    }, [namespace])

    useEffect(() => {
        const _lastDataSyncTime = Date()
        const _staleDataCheckTime = moment()
        isStaleDataRef.current = false

        setLastDataSyncTimeString(`Synced ${handleUTCTime(_lastDataSyncTime, true)}`)
        const interval = setInterval(() => {
            checkIfDataIsStale(isStaleDataRef, _staleDataCheckTime)
            setLastDataSyncTimeString(`Synced ${handleUTCTime(_lastDataSyncTime, true)}`)
        }, 1000)

        return () => {
            clearInterval(interval)
        }
    }, [lastDataSync])

    const getClusterData = async () => {
        try {
            setClusterLoader(true)
            const { result } = await getClusterList()
            if (result) {
                const _clusterList = result.filter((resource) => !resource?.isVirtualCluster)
                const _clusterOptions = convertToOptionsList(
                    sortObjectArrayAlphabetically(_clusterList, 'cluster_name'),
                    'cluster_name',
                    'id',
                    'errorInConnecting',
                )
                setClusterOptions(_clusterOptions as ClusterOptionType[])
                const _selectedCluster = _clusterOptions.find((cluster) => cluster.value == clusterId)
                if (_selectedCluster) {
                    onChangeCluster(_selectedCluster, false, true)
                } else if (_clusterOptions.length === 1) {
                    onChangeCluster(_clusterOptions[0], true)
                }
            }
        } catch (err) {
            if (err['code'] === 403) {
                setErrorStatusCode(err['code'])
            } else {
                showError(err)
            }
        } finally {
            setClusterLoader(false)
        }
    }

    const getNamespaceList = async (_clusterId: string) => {
        try {
            const { result } = await namespaceListByClusterId(_clusterId)
            if (Array.isArray(result)) {
                const _namespaceOptions = [ALL_NAMESPACE_OPTION, ...convertToOptionsList(result.sort())]
                setNamespaceOptions(_namespaceOptions)

                const _selectedNamespace = _namespaceOptions.find((_namespace) => _namespace.value === namespace)
                setSelectedNamespace(_selectedNamespace ?? _namespaceOptions[0])
            }
        } catch (err) {
            showError(err)
        }
    }

    const getSidebarData = async (_clusterId): Promise<void> => {
        if (!_clusterId) return
        try {
            setLoader(true)
            sideDataAbortController.current.new = new AbortController()
            const { result } = await getResourceGroupList(_clusterId, sideDataAbortController.current.new.signal)
            if (result) {
                const processedData = processK8SObjects(result.apiResources, nodeType)
                const _k8SObjectMap = processedData.k8SObjectMap
                const _k8SObjectList: K8SObjectType[] = []

                for (const element of ORDERED_AGGREGATORS) {
                    if (_k8SObjectMap.get(element)) {
                        _k8SObjectList.push(_k8SObjectMap.get(element))
                    }
                }

                const { parentNode, childNode, isResourceGroupPresent, groupedChild } = getParentAndChildNodes(
                    _k8SObjectList,
                    nodeType,
                    group,
                )

                if (!isResourceGroupPresent) {
                    parentNode.isExpanded = true
                    const _selectedResourceParam = childNode.gvk.Kind.toLowerCase()
                    replace({
                        pathname: `${URLS.RESOURCE_BROWSER}/${_clusterId}/${
                            namespace || ALL_NAMESPACE_OPTION.value
                        }/${_selectedResourceParam}/${childNode.gvk.Group.toLowerCase() || K8S_EMPTY_GROUP}`,
                    })
                }
                const defaultSelected = groupedChild ??
                    processedData.selectedResource ?? {
                        namespaced: childNode.namespaced,
                        gvk: childNode.gvk,
                    }
                setK8SObjectMap(getGroupedK8sObjectMap(_k8SObjectList, nodeType))
                setSelectedResource(defaultSelected)
                updateResourceSelectionData(defaultSelected, true)
                setShowErrorState(false)
                setErrorMsg('')
                setErrorStatusCode(0)
            }
            setLoader(false)
        } catch (err) {
            if (err['code'] > 0) {
                if (err['code'] === 403) {
                    setErrorStatusCode(err['code'])
                } else if (err['code'] === 404) {
                    setSelectedCluster(null)
                    replace({
                        pathname: URLS.RESOURCE_BROWSER,
                    })
                }
                setShowErrorState(true)
                setErrorMsg(
                    (err instanceof ServerErrors && Array.isArray(err.errors)
                        ? err.errors[0]?.userMessage
                        : err['message']) ?? SOME_ERROR_MSG,
                )
                setLoader(false)
            } else if (sideDataAbortController.current.prev?.signal.aborted) {
                sideDataAbortController.current.prev = null
            }
        }
    }

    const stopSearchWorker = () => {
        if (searchWorkerRef.current) {
            searchWorkerRef.current.postMessage({ type: 'stop' })
            searchWorkerRef.current = null
        }
    }

    const handleFilterChanges = (
        _searchText: string,
        _resourceList: ResourceDetailType,
        hideLoader?: boolean,
    ): void => {
        if (!searchWorkerRef.current) {
            searchWorkerRef.current = new WebWorker(searchWorker)
            searchWorkerRef.current.onmessage = (e) => {
                setFilteredResourceList(e.data)

                // Hide loader after search retention
                if (hideLoader) {
                    setResourceListLoader(false)
                }
            }
        }

        if(resourceList) {
            searchWorkerRef.current.postMessage({
                type: 'start',
                payload: {
                    searchText: _searchText,
                    list: _resourceList.data,
                    searchInKeys: [
                        'name',
                        'namespace',
                        'status',
                        'message',
                        EVENT_LIST.dataKeys.involvedObject,
                        'source',
                        'reason',
                        'type',
                    ],
                    origin: new URL(process.env.PUBLIC_URL, window.location.href).origin,
                },
            })
        }
    }

    const getResourceListData = async (retainSearched?: boolean): Promise<void> => {
        try {
            setResourceListLoader(true)
            setResourceList(null)
            setFilteredResourceList([])

            const resourceListPayload: ResourceListPayloadType = {
                clusterId: Number(clusterId),
                k8sRequest: {
                    resourceIdentifier: {
                        groupVersionKind: selectedResource.gvk,
                    },
                },
            }
            if (selectedResource.namespaced) {
                resourceListPayload.k8sRequest.resourceIdentifier.namespace =
                    namespace === ALL_NAMESPACE_OPTION.value ? '' : namespace
            }
            const { result } = await getResourceList(resourceListPayload, resourceListAbortController.signal)
            setLastDataSync(!lastDataSync)
            if (selectedResource?.gvk.Kind === SIDEBAR_KEYS.eventGVK.Kind && result.data.length) {
                result.data = sortEventListData(result.data)
            }
            setResourceList(result)

            if (retainSearched) {
                handleFilterChanges(searchText, result, true)
            } else {
                setFilteredResourceList(result.data)
                setResourceListLoader(false)
            }
            setNoResults(result.data.length === 0)
            setShowErrorState(false)
        } catch (err) {
            if (!resourceListAbortController.signal.aborted) {
                showError(err)
                setResourceListLoader(false)
                setShowErrorState(true)
            }
        }
    }

    const handleGroupHeadingClick = (e: any, preventCollapse?: boolean): void => {
        setK8SObjectMap(getK8SObjectMapAfterGroupHeadingClick(e, k8SObjectMap, preventCollapse))
    }

    const onChangeCluster = (selected, fromClusterSelect?: boolean, skipRedirection?: boolean): void => {
        if (selected.value === selectedCluster?.value) {
            return
        } else if (showSelectClusterState) {
            setShowSelectClusterState(false)
        }

        if (sideDataAbortController.current.prev?.signal.aborted) {
            sideDataAbortController.current.prev = null
        }
        abortReqAndUpdateSideDataController()
        setSelectedCluster(selected)
        getSidebarData(selected.value)
        getNamespaceList(selected.value)

        if (!skipRedirection) {
            const path = `${URLS.RESOURCE_BROWSER}/${selected.value}/${ALL_NAMESPACE_OPTION.value}${
                nodeType ? `/${nodeType}/${group || K8S_EMPTY_GROUP}` : ''
            }`
            if (fromClusterSelect) {
                replace({
                    pathname: path,
                })
            } else {
                push({
                    pathname: path,
                })
            }
        }
    }

    const refreshData = (): void => {
        setSelectedResource(null)
        getSidebarData(selectedCluster.value)
    }

    const updateResourceSelectionData = (_selected: ApiResourceGroupType, initSelection?: boolean) => {
        if (_selected) {
            stopSearchWorker()
            setResourceSelectionData((prevData) =>
                getUpdatedResourceSelectionData(prevData, _selected, initSelection, group),
            )
        }
    }

    const updateNodeSelectionData = (_selected: Record<string, any>) => {
        if (_selected) {
            if (_selected.isFromEvent) {
                setNodeSelectionData((prevData) =>
                    getUpdatedNodeSelectionData(
                        prevData,
                        _selected,
                        `${_selected.name}_${group}`,
                        _selected.name.split('_')[1],
                    ),
                )
            } else {
                setNodeSelectionData((prevData) =>
                    getUpdatedNodeSelectionData(prevData, _selected, `${nodeType}_${_selected.name}_${group}`),
                )
            }
        }
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

    const getSelectedResourceData = () => {
        if (resourceListLoader) {
            return null
        }

        const selectedNode =
            nodeSelectionData?.[`${nodeType}_${node}_${group}`] ??
            resourceList?.data?.find((_resource) => _resource.name === node)
        const _selectedResource = selectedNode?.isFromEvent
            ? getEventObjectTypeGVK(k8SObjectMap, nodeType)
            : resourceSelectionData?.[`${nodeType}_${group}`]?.gvk ?? selectedResource?.gvk
        if (!nodeSelectionData?.[`${nodeType}_${node}_${group}`]) {
            updateNodeSelectionData(selectedNode)
        }


        return {
            clusterId: Number(clusterId),
            group: _selectedResource?.Group || '',
            version: _selectedResource?.Version || '',
            kind: _selectedResource?.Kind || '',
            namespace: selectedNode?.namespace || '',
            name: selectedNode?.name || '',
            containers: selectedNode?.containers || [],
        } as SelectedResourceType
    }

    const clearSearch = (): void => {
        if (searchApplied) {
            handleFilterChanges('', resourceList)
            setSearchApplied(false)
        }
        setSearchText('')
    }

    const handleRetry = () => {
        abortReqAndUpdateSideDataController(true)
        getSidebarData(clusterId)
    }

    const abortReqAndUpdateSideDataController = (emptyPrev?: boolean) => {
        if (emptyPrev) {
            sideDataAbortController.current.prev = null
        } else {
            sideDataAbortController.current.new.abort()
            sideDataAbortController.current.prev = sideDataAbortController.current.new
        }
        setErrorMsg('')
    }

    const renderResourceBrowser = (): JSX.Element => {
        if (node) {
            return (
                <div className="resource-details-container">
                    <NodeDetailComponent
                        loadingResources={resourceListLoader}
                        isResourceBrowserView={true}
                        selectedResource={getSelectedResourceData()}
                        markTabActiveByIdentifier={markTabActiveByIdentifier}
                        addTab={addTab}
                        logSearchTerms={logSearchTerms}
                        setLogSearchTerms={setLogSearchTerms}
                    />
                </div>
            )
        }

        return showSelectClusterState || errorMsg || loader ? (
            <ConnectingToClusterState
                loader={loader}
                errorMsg={errorMsg}
                setErrorMsg={setErrorMsg}
                handleRetry={handleRetry}
                sideDataAbortController={sideDataAbortController.current}
                selectedResource={selectedResource}
                resourceList={resourceList}
                clusterOptions={clusterOptions}
                selectedCluster={selectedCluster}
                setSelectedCluster={setSelectedCluster}
                onChangeCluster={onChangeCluster}
                namespaceOptions={namespaceOptions}
                selectedNamespace={selectedNamespace}
                setSelectedNamespace={setSelectedNamespace}
                searchText={searchText}
                setSearchText={setSearchText}
                searchApplied={searchApplied}
                setSearchApplied={setSearchApplied}
                handleFilterChanges={handleFilterChanges}
                clearSearch={clearSearch}
                showSelectClusterState={showSelectClusterState}
                setShowSelectClusterState={setShowSelectClusterState}
            />
        ) : (
            <div className="resource-browser bcn-0">
                <Sidebar
                    k8SObjectMap={k8SObjectMap}
                    handleGroupHeadingClick={handleGroupHeadingClick}
                    selectedResource={selectedResource}
                    setSelectedResource={setSelectedResource}
                    updateResourceSelectionData={updateResourceSelectionData}
                    isCreateModalOpen={showCreateResourceModal}
                />
                <K8SResourceList
                    selectedResource={selectedResource}
                    resourceList={resourceList}
                    filteredResourceList={filteredResourceList}
                    noResults={noResults}
                    clusterOptions={clusterOptions}
                    selectedCluster={selectedCluster}
                    onChangeCluster={onChangeCluster}
                    namespaceOptions={namespaceOptions}
                    selectedNamespace={selectedNamespace}
                    setSelectedNamespace={setSelectedNamespace}
                    resourceListLoader={resourceListLoader}
                    getResourceListData={getResourceListData}
                    updateNodeSelectionData={updateNodeSelectionData}
                    searchText={searchText}
                    setSearchText={setSearchText}
                    searchApplied={searchApplied}
                    setSearchApplied={setSearchApplied}
                    handleFilterChanges={handleFilterChanges}
                    clearSearch={clearSearch}
                    isCreateModalOpen={showCreateResourceModal}
                    addTab={addTab}
                />
            </div>
        )
    }

    const unauthorizedInfoText = () => {
        return (
            <>
                {ERROR_SCREEN_SUBTITLE}&nbsp;
                <a
                    className="dc__link"
                    href={DOCUMENTATION.K8S_RESOURCES_PERMISSIONS}
                    target="_blank"
                    rel="noreferrer noopener"
                >
                    {ERROR_SCREEN_LEARN_MORE}
                </a>
            </>
        )
    }

    const renderResourceListBody = () => {
        if (!showSelectClusterState && ((loader && !selectedCluster?.value) || clusterLoader)) {
            return (
                <div style={{ height: 'calc(100vh - 48px)' }}>
                    <Progressing pageLoader />
                </div>
            )
        } else if (errorStatusCode > 0) {
            return (
                <div className="error-screen-wrapper flex column" style={{ height: 'calc(100vh - 92px)' }}>
                    <ErrorScreenManager
                        code={errorStatusCode}
                        subtitle={unauthorizedInfoText()}
                        subtitleClass="w-300"
                    />
                </div>
            )
        } else if (!showSelectClusterState && !selectedCluster?.value) {
            return <ClusterSelection clusterOptions={clusterOptions} onChangeCluster={onChangeCluster} />
        }

        return (
            <div>
                <div
                    className="h-36 flexbox dc__content-space pr-20"
                    style={{
                        boxShadow: 'inset 0 -1px 0 0 var(--N200)',
                    }}
                >
                    <div className="resource-browser-tab flex left w-100">
                        <DynamicTabs tabs={tabs} removeTabByIdentifier={removeTabByIdentifier} />
                    </div>
                    <div className="fs-13 flex pt-12 pb-12">
                        {!loader && !showErrorState && (
                            <>
                                <Tippy
                                    className="default-tt"
                                    arrow={false}
                                    placement="top"
                                    content={K8S_RESOURCE_LIST.createResource}
                                >
                                    <div
                                        className="cursor cb-5 fw-6 fs-13 flexbox"
                                        data-testid="create-resource"
                                        onClick={showResourceModal}
                                    >
                                        <Add className="icon-dim-16 fcb-5 mr-5 mt-3" /> Create
                                    </div>
                                </Tippy>
                                {!node && lastDataSyncTimeString && (
                                    <div className="ml-12 flex pl-12 dc__border-left">
                                        {resourceListLoader ? (
                                            <span className="dc__loading-dots">Syncing</span>
                                        ) : (
                                            <>
                                                {isStaleDataRef.current && (
                                                    <Tippy
                                                        className="default-tt w-200"
                                                        placement="bottom"
                                                        arrow={false}
                                                        content={STALE_DATA_WARNING_TEXT}
                                                    >
                                                        <Warning className="icon-dim-16 mr-4" />
                                                    </Tippy>
                                                )}
                                                <span>{lastDataSyncTimeString}</span>
                                                <RefreshIcon
                                                    className="icon-dim-16 scb-5 ml-8 cursor"
                                                    onClick={refreshData}
                                                />
                                            </>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
                {renderResourceBrowser()}
            </div>
        )
    }

    return (
        <ShortcutProvider>
            <div className="resource-browser-container">
                <PageHeader headerName="Kubernetes Resource Browser" />
                {renderResourceListBody()}
                {showCreateResourceModal && <CreateResource closePopup={closeResourceModal} clusterId={clusterId} />}
            </div>
        </ShortcutProvider>
    )
}
