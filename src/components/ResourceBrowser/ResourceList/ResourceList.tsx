import React, { useState, useEffect, useRef } from 'react'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import {
    convertToOptionsList,
    ErrorScreenManager,
    handleUTCTime,
    processK8SObjects,
    Progressing,
    showError,
    sortObjectArrayAlphabetically,
} from '../../common'
import PageHeader from '../../common/header/PageHeader'
import {
    ApiResourceGroupType,
    ClusterOptionType,
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
import { Nodes, OptionType } from '../../app/types'
import {
    ALL_NAMESPACE_OPTION,
    ERROR_SCREEN_LEARN_MORE,
    ERROR_SCREEN_SUBTITLE,
    EVENT_LIST,
    K8S_RESOURCE_LIST,
    MARK_AS_STALE_DATA_CUT_OFF_MINS,
    ORDERED_AGGREGATORS,
    SIDEBAR_KEYS,
    STALE_DATA_WARNING_TEXT,
} from '../Constants'
import { DOCUMENTATION, URLS } from '../../../config'
import { Sidebar } from './Sidebar'
import { K8SResourceList } from './K8SResourceList'
import { ClusterSelection } from './ClusterSelection'
import { ReactComponent as RefreshIcon } from '../../../assets/icons/ic-arrows_clockwise.svg'
import { ReactComponent as Add } from '../../../assets/icons/ic-add.svg'
import { ReactComponent as Warning } from '../../../assets/icons/ic-warning.svg'
import { CreateResource } from './CreateResource'
import AppDetailsStore, { AppDetailsTabs } from '../../v2/appDetails/appDetails.store'
import NodeTreeTabList from '../../v2/appDetails/k8Resource/NodeTreeTabList'
import NodeDetailComponent from '../../v2/appDetails/k8Resource/nodeDetail/NodeDetail.component'
import { getAggregator, SelectedResourceType, NodeType } from '../../v2/appDetails/appDetails.type'
import Tippy from '@tippyjs/react'
import moment from 'moment'
import ConnectingToClusterState from './ConnectingToClusterState'
import { ServerErrors } from '../../../modals/commonTypes'
import { SOME_ERROR_MSG } from '../../../config/constantMessaging'
import '../ResourceBrowser.scss'

export default function ResourceList() {
    const { clusterId, namespace, nodeType, node } = useParams<{
        clusterId: string
        namespace: string
        nodeType: string
        node: string
    }>()
    const { replace, push } = useHistory()
    const location = useLocation()
    const [loader, setLoader] = useState(false)
    const [clusterLoader, setClusterLoader] = useState(false)
    const [showErrorState, setShowErrorState] = useState(false)
    const [resourceListLoader, setResourceListLoader] = useState(true)
    const [noResults, setNoResults] = useState(false)
    const [k8SObjectList, setK8SObjectList] = useState<K8SObjectType[]>([])
    const [k8SObjectListIndexMap, setK8SObjectListIndexMap] = useState<Map<string, number>>()
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
    const isStaleDataRef = useRef<boolean>(false)
    const resourceListAbortController = new AbortController()
    const sideDataAbortController = useRef<AbortController>(new AbortController())

    useEffect(() => {
        if (typeof window['crate']?.hide === 'function') {
            window['crate'].hide()
        }

        getClusterData()

        // Initialize tabs on load
        AppDetailsStore.initAppDetailsTabs(
            `${URLS.RESOURCE_BROWSER}/${clusterId}/${namespace}`,
            false,
            false,
            true,
            nodeType,
        )
        return (): void => {
            if (typeof window['crate']?.show === 'function') {
                window['crate'].show()
            }
            sideDataAbortController.current.abort()
        }
    }, [])

    // Mark tab active on path change
    useEffect(() => {
        if (selectedResource && !node) {
            AppDetailsStore.markAppDetailsTabActiveByIdentifier(AppDetailsTabs.k8s_Resources)
        }

        if (location.pathname === URLS.RESOURCE_BROWSER) {
            setSelectedCluster(null)
        }

        if (clusterOptions.length > 0 && clusterId != selectedCluster?.value) {
            if (!sideDataAbortController.current.signal.aborted) {
                sideDataAbortController.current.abort()
                sideDataAbortController.current = new AbortController()
            }

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
            AppDetailsStore.updateK8sResourcesTabUrl(
                `${URLS.RESOURCE_BROWSER}/${selectedCluster.value}/${
                    selectedNamespace.value
                }/${selectedResource.gvk.Kind.toLowerCase()}`,
            )
        }
    }, [selectedCluster, selectedNamespace, selectedResource?.gvk?.Kind])

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
        if (clusterId && selectedResource?.namespaced) {
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
            checkIfDataIsStale(_staleDataCheckTime)
            setLastDataSyncTimeString(`Synced ${handleUTCTime(_lastDataSyncTime, true)}`)
        }, 1000)

        return () => {
            clearInterval(interval)
        }
    }, [lastDataSync])

    const checkIfDataIsStale = (_staleDataCheckTime: moment.Moment) => {
        /**
         * Stale data warning to be shown after 15 min. However, kept the cut off mins at 13 instead of 15 to,
         * 1. skip 1st min as render for 1st min has already been started/done
         * 2. skip maintaining unnecessary state just for re-rendering
         */
        if (
            !isStaleDataRef.current &&
            moment().diff(_staleDataCheckTime, 'minutes') > MARK_AS_STALE_DATA_CUT_OFF_MINS
        ) {
            isStaleDataRef.current = true
        }
    }

    const getClusterData = async () => {
        try {
            setClusterLoader(true)
            const { result } = await getClusterList()
            if (result) {
                const _clusterOptions = convertToOptionsList(
                    sortObjectArrayAlphabetically(result, 'cluster_name'),
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
            const { result } = await getResourceGroupList(_clusterId, sideDataAbortController.current.signal)
            if (result) {
                const processedData = processK8SObjects(result.apiResources, nodeType)
                const _k8SObjectMap = processedData.k8SObjectMap
                let _selectedResource = processedData.selectedResource
                const _k8SObjectList: K8SObjectType[] = []
                const _k8SObjectListIndexMap: Map<string, number> = new Map()
                for (let index = 0; index < ORDERED_AGGREGATORS.length; index++) {
                    const element = ORDERED_AGGREGATORS[index]
                    if (_k8SObjectMap.get(element)) {
                        _k8SObjectList.push(_k8SObjectMap.get(element))
                        _k8SObjectListIndexMap.set(element, _k8SObjectList.length - 1)
                    }
                }

                const parentNode = _k8SObjectList[0]
                const childNode = parentNode.child.find((_ch) => _ch.gvk.Kind === Nodes.Pod) ?? parentNode.child[0]
                let isResourceGroupPresent = false
                if (nodeType) {
                    for (const _parentNode of _k8SObjectList) {
                        for (const _childNode of _parentNode.child) {
                            if (_childNode.gvk.Kind.toLowerCase() === nodeType) {
                                isResourceGroupPresent = true
                                break
                            }
                        }
                    }
                }

                if (!isResourceGroupPresent) {
                    parentNode.isExpanded = true
                    const _selectedResourceParam = childNode.gvk.Kind.toLowerCase()
                    replace({
                        pathname: `${URLS.RESOURCE_BROWSER}/${_clusterId}/${
                            namespace || ALL_NAMESPACE_OPTION.value
                        }/${_selectedResourceParam}`,
                    })
                }
                setK8SObjectList(_k8SObjectList)
                setK8SObjectListIndexMap(_k8SObjectListIndexMap)

                const defaultSelected = _selectedResource || {
                    namespaced: childNode.namespaced,
                    gvk: childNode.gvk,
                }
                setSelectedResource(defaultSelected)
                updateResourceSelectionData(defaultSelected)
                setShowErrorState(false)
                setErrorMsg('')
                setErrorStatusCode(0)
            }
        } catch (err) {
            if (!sideDataAbortController.current.signal.aborted) {
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
            } else {
                sideDataAbortController.current = new AbortController()
            }
        } finally {
            setLoader(false)
        }
    }

    const sortEventListData = (eventList: Record<string, any>[]): Record<string, any>[] => {
        const warningEvents: Record<string, any>[] = [],
            otherEvents: Record<string, any>[] = []
        eventList = eventList.reverse()
        for (const iterator of eventList) {
            if (iterator.type === 'Warning') {
                warningEvents.push(iterator)
            } else {
                otherEvents.push(iterator)
            }
        }
        return [...warningEvents, ...otherEvents]
    }

    const handleFilterChanges = (_searchText: string, _resourceList: ResourceDetailType): void => {
        const lowerCaseSearchText = _searchText.toLowerCase()
        const _filteredData = _resourceList.data.filter(
            (resource) =>
                resource.name?.toLowerCase().indexOf(lowerCaseSearchText) >= 0 ||
                resource.namespace?.toLowerCase().indexOf(lowerCaseSearchText) >= 0 ||
                resource.status?.toLowerCase().indexOf(lowerCaseSearchText) >= 0 ||
                resource.message?.toLowerCase().indexOf(lowerCaseSearchText) >= 0 ||
                resource[EVENT_LIST.dataKeys.involvedObject]?.toLowerCase().indexOf(lowerCaseSearchText) >= 0 ||
                resource.source?.toLowerCase().indexOf(lowerCaseSearchText) >= 0 ||
                resource.reason?.toLowerCase().indexOf(lowerCaseSearchText) >= 0 ||
                resource.type?.toLowerCase().indexOf(lowerCaseSearchText) >= 0,
        )
        setFilteredResourceList(_filteredData)
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
                handleFilterChanges(searchText, result)
            } else {
                setFilteredResourceList(result.data)
            }
            setNoResults(result.data.length === 0)
            setResourceListLoader(false)
            setShowErrorState(false)
        } catch (err) {
            if (!resourceListAbortController.signal.aborted) {
                showError(err)
                setResourceListLoader(false)
                setShowErrorState(true)
            }
        }
    }

    const handleGroupHeadingClick = (e): void => {
        const _k8SObjectList = [...k8SObjectList]
        const groupIndex = k8SObjectListIndexMap.get(e.currentTarget.dataset.groupName)
        _k8SObjectList[groupIndex].isExpanded = !_k8SObjectList[groupIndex].isExpanded
        setK8SObjectList(_k8SObjectList)
    }

    const onChangeCluster = (selected, fromClusterSelect?: boolean, skipRedirection?: boolean): void => {
        if (selected.value === selectedCluster?.value) {
            return
        }
        setSelectedCluster(selected)
        getSidebarData(selected.value)
        getNamespaceList(selected.value)

        if (!skipRedirection) {
            const path = `${URLS.RESOURCE_BROWSER}/${selected.value}/${ALL_NAMESPACE_OPTION.value}${
                nodeType ? `/${nodeType}` : ``
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
        setResourceSelectionData(null)
        setNodeSelectionData(null)
        getSidebarData(selectedCluster.value)
    }

    const updateResourceSelectionData = (_selected: ApiResourceGroupType) => {
        if (_selected) {
            setResourceSelectionData((prevData) => ({
                ...prevData,
                [_selected.gvk.Kind.toLowerCase()]: {
                    namespaced: _selected.namespaced,
                    gvk: _selected.gvk,
                },
            }))
        }
    }

    const updateNodeSelectionData = (_selected: Record<string, any>) => {
        if (_selected) {
            if (_selected.isFromEvent) {
                const _resourceName = _selected.name.split('_')[1]
                setNodeSelectionData((prevData) => ({
                    ...prevData,
                    [`${_selected.name}`]: { ..._selected, name: _resourceName },
                }))
            } else {
                setNodeSelectionData((prevData) => ({
                    ...prevData,
                    [`${nodeType}_${_selected.name}`]: _selected,
                }))
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

    const getEventObjectTypeGVK = () => {
        const resourceGroup = getAggregator(nodeType as NodeType)
        const groupIndex = k8SObjectListIndexMap.get(resourceGroup)
        for (let index = 0; index < k8SObjectList[groupIndex].child.length; index++) {
            const element = k8SObjectList[groupIndex].child[index]
            if (element.gvk.Kind.toLowerCase() === nodeType) {
                return element.gvk
            }
        }
    }

    const getSelectedResourceData = () => {
        const selectedNode =
            nodeSelectionData?.[`${nodeType}_${node}`] ??
            resourceList?.data?.find((_resource) => _resource.name === node)
        const _selectedResource = selectedNode?.isFromEvent
            ? getEventObjectTypeGVK()
            : resourceSelectionData?.[nodeType]?.gvk ?? selectedResource?.gvk

        if (!nodeSelectionData?.[`${nodeType}_${node}`]) {
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
        setErrorMsg('')
        getSidebarData(clusterId)
    }

    const renderResourceBrowser = (): JSX.Element => {
        if (node) {
            return (
                <div className="resource-details-container">
                    <NodeDetailComponent
                        loadingResources={resourceListLoader}
                        isResourceBrowserView={true}
                        selectedResource={getSelectedResourceData()}
                        logSearchTerms={logSearchTerms}
                        setLogSearchTerms={setLogSearchTerms}
                    />
                </div>
            )
        }

        return errorMsg || (loader && selectedCluster?.value) ? (
            <ConnectingToClusterState
                loader={loader}
                errorMsg={errorMsg}
                setErrorMsg={setErrorMsg}
                handleRetry={handleRetry}
                abortController={sideDataAbortController.current}
                selectedResource={selectedResource}
                resourceList={resourceList}
                clusterOptions={clusterOptions}
                selectedCluster={selectedCluster}
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
            />
        ) : (
            <div className="resource-browser bcn-0">
                <Sidebar
                    k8SObjectList={k8SObjectList}
                    handleGroupHeadingClick={handleGroupHeadingClick}
                    setSelectedResource={setSelectedResource}
                    updateResourceSelectionData={updateResourceSelectionData}
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
        if ((loader && !selectedCluster?.value) || clusterLoader) {
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
        } else if (!selectedCluster?.value) {
            return <ClusterSelection clusterOptions={clusterOptions} onChangeCluster={onChangeCluster} />
        }

        return (
            <div>
                <div
                    className="h-44 flexbox dc__content-space pr-20"
                    style={{
                        boxShadow: 'inset 0 -1px 0 0 var(--N200)',
                    }}
                >
                    <div className="resource-browser-tab flex left pt-10">
                        <NodeTreeTabList logSearchTerms={logSearchTerms} setLogSearchTerms={setLogSearchTerms} />
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
                                    <div className="cursor cb-5 fw-6 fs-13 flexbox" onClick={showResourceModal}>
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
        <div className="resource-browser-container">
            <PageHeader headerName="Kubernetes Resource Browser" />
            {renderResourceListBody()}
            {showCreateResourceModal && <CreateResource closePopup={closeResourceModal} clusterId={clusterId} />}
        </div>
    )
}
