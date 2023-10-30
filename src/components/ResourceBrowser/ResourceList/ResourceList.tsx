import React, { useState, useEffect, useRef } from 'react'
import { NavLink, useHistory, useLocation, useParams } from 'react-router-dom'
import {
    convertToOptionsList,
    createGroupSelectList,
    filterImageList,
    processK8SObjects,
    sortObjectArrayAlphabetically,
} from '../../common'
import { showError, Progressing, ServerErrors, getUserRole, BreadCrumb, useBreadcrumb, ErrorScreenManager, Reload } from '@devtron-labs/devtron-fe-common-lib'
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
    getResourceGroupList,
    getResourceGroupListRaw,
    getResourceList,
    namespaceListByClusterId,
} from '../ResourceBrowser.service'
import { Nodes, OptionType } from '../../app/types'
import {
    ALL_NAMESPACE_OPTION,
    EVENT_LIST,
    K8S_EMPTY_GROUP,
    ORDERED_AGGREGATORS,
    SIDEBAR_KEYS,
} from '../Constants'
import { URLS } from '../../../config'
import Sidebar from './Sidebar'
import { K8SResourceList } from './K8SResourceList'
import { ReactComponent as Add } from '../../../assets/icons/ic-add.svg'
import { ReactComponent as Warning } from '../../../assets/icons/ic-warning.svg'
import K8ResourceIcon from '../../../assets/icons/ic-object.svg'
import ClusterIcon from '../../../assets/icons/ic-world-black.svg'
import { CreateResource } from './CreateResource'
import { AppDetailsTabs, AppDetailsTabsIdPrefix } from '../../v2/appDetails/appDetails.store'
import NodeDetailComponent from '../../v2/appDetails/k8Resource/nodeDetail/NodeDetail.component'
import { SelectedResourceType } from '../../v2/appDetails/appDetails.type'
import ConnectingToClusterState from './ConnectingToClusterState'
import { SOME_ERROR_MSG } from '../../../config/constantMessaging'
import searchWorker from '../../../config/searchWorker'
import WebWorker from '../../app/WebWorker'
import { ShortcutProvider } from 'react-keybind'
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
} from '../Utils'
import '../ResourceBrowser.scss'
import { ClusterCapacityType, ClusterDetail, ClusterImageList } from '../../ClusterNodes/types'
import { getHostURLConfiguration } from '../../../services/service'
import { clusterNamespaceList, getClusterList, getClusterListMin } from '../../ClusterNodes/clusterNodes.service'
import ClusterSelectionList from '../../ClusterNodes/ClusterSelectionList'
import ClusterSelector from './ClusterSelector'
import ClusterOverview from '../../ClusterNodes/ClusterOverview'
import TerminalIcon from '../../../assets/icons/ic-terminal-fill.svg'
import ClusterTerminal from '../../ClusterNodes/ClusterTerminal'
import { createTaintsList } from '../../cluster/cluster.util'
import NodeDetailsList from '../../ClusterNodes/NodeDetailsList'
import NodeDetails from '../../ClusterNodes/NodeDetails'


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
    const { tabs, initTabs, addTab, markTabActiveByIdentifier, removeTabByIdentifier, updateTabUrl, stopTabByIdentifier } = useTabs(
        `${URLS.RESOURCE_BROWSER}`,
    )
    const [loader, setLoader] = useState(false)
    const [rawGVKLoader, setRawGVKLoader] = useState(false)
    const [clusterLoader, setClusterLoader] = useState(false)
    const [showErrorState, setShowErrorState] = useState(false)
    const [resourceListLoader, setResourceListLoader] = useState(true)
    const [noResults, setNoResults] = useState(false)
    const [k8SObjectMap, setK8SObjectMap] = useState<Map<string, K8SObjectMapType>>()
    const [k8SObjectMapRaw, setK8SObjectMapRaw] = useState<Map<string, K8SObjectMapType>>()
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
    const [accessDeniedCode, setAccessDeniedCode] = useState(0)
    const [errorMsg, setErrorMsg] = useState('')
    const [imageList, setImageList] = useState<ClusterImageList[]>(null)
    const [namespaceDefaultList, setNameSpaceList] = useState<string[]>()
    const [clusterCapacityData, setClusterCapacityData] = useState<ClusterCapacityType>(null)
    const [terminalClusterData, setTerminalCluster] = useState<ClusterDetail[]>()
    const [selectedTerminal, setSelectedTerminal] = useState<ClusterDetail>()
    const [clusterErrorTitle, setClusterErrorTitle] = useState('')
    const [terminalLoader, setTerminalLoader] = useState(false)
    const [clusterList, setClusterList] = useState<ClusterDetail[]>([])
    const [toggleSync, setToggle] = useState(false)
    const isStaleDataRef = useRef<boolean>(false)
    const superAdminRef = useRef<boolean>(!!window._env_.K8S_CLIENT)
    const resourceListAbortController = new AbortController()
    const sideDataAbortController = useRef<{
        prev: AbortController
        new: AbortController
    }>({
        prev: null,
        new: new AbortController(),
    })
    const isOverview = nodeType === SIDEBAR_KEYS.overviewGVK.Kind.toLowerCase()
    const isTerminal = nodeType === AppDetailsTabs.terminal
    const isNodes = nodeType === SIDEBAR_KEYS.nodeGVK.Kind.toLowerCase()
    const searchWorkerRef = useRef(null)
    const hideSyncWarning: boolean = loader || rawGVKLoader || showErrorState || !isStaleDataRef.current || !(!node && lastDataSyncTimeString && !resourceListLoader)
    useEffect(() => {
        if (typeof window['crate']?.hide === 'function') {
            window['crate'].hide()
        }

        // Get cluster data &  Initialize tabs on mount
        getClusterData()

        // Retain selection data
        try {
            const persistedTabsData = localStorage.getItem('persisted-tabs-data')
            if (persistedTabsData) {
                const parsedTabsData = JSON.parse(persistedTabsData)
                setResourceSelectionData(parsedTabsData.resourceSelectionData)
                setNodeSelectionData(parsedTabsData.nodeSelectionData)
            }
        } catch (err) { }

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

    useEffect(() => {
        getDetailsClusterList()
    },[toggleSync])

    useEffect(() => {
        if (clusterId && terminalClusterData?.length > 0) {
            const _selectedCluster = terminalClusterData.find((list) => list.id == +clusterId)
            if (_selectedCluster) {
                setSelectedTerminal(_selectedCluster)
            }
        }
    }, [clusterId, terminalClusterData])

    // Mark tab active on path change
    useEffect(() => {
        if (tabs.length > 0 && nodeType === AppDetailsTabs.terminal) {
            markTabActiveByIdentifier(AppDetailsTabsIdPrefix.terminal, AppDetailsTabs.terminal)
        } else if (nodeType == AppDetailsTabs.cluster_overview.toLocaleLowerCase()) {
            const url = `${
                URLS.RESOURCE_BROWSER
            }/${clusterId}/${namespace}/${SIDEBAR_KEYS.overviewGVK.Kind.toLowerCase()}/${K8S_EMPTY_GROUP}`

            updateTabUrl(`${AppDetailsTabsIdPrefix.cluster_overview}-${AppDetailsTabs.cluster_overview}`, url)
            markTabActiveByIdentifier(AppDetailsTabsIdPrefix.cluster_overview, AppDetailsTabs.cluster_overview)
        } else if (selectedResource && !node) {
            if (nodeType === SIDEBAR_KEYS.nodeGVK.Kind.toLowerCase()) getSidebarData(clusterId)
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

        if (!superAdminRef.current && !k8SObjectMapRaw) {
            getGVKData(clusterId)
        }
    }, [location.pathname])

    const getGVKData = async (_clusterId): Promise<void> => {
      if (!_clusterId) return
      try {
          setRawGVKLoader(true)
          setK8SObjectMapRaw(null)
          const { result } = await getResourceGroupListRaw(_clusterId)
          if (result) {
              const processedData = processK8SObjects(result.apiResources, nodeType)
              const _k8SObjectMap = processedData.k8SObjectMap
              const _k8SObjectList: K8SObjectType[] = []
              for (const element of ORDERED_AGGREGATORS) {
                  if (_k8SObjectMap.get(element)) {
                      _k8SObjectList.push(_k8SObjectMap.get(element))
                  }
              }
              setK8SObjectMapRaw(getGroupedK8sObjectMap(_k8SObjectList, nodeType))
          }
          setRawGVKLoader(false)
      } catch (err) {
          setRawGVKLoader(false)
      }
  }

    // Update K8sResources tab url on cluster/namespace/kind changes

    useEffect(() => {
        if (selectedCluster?.value && selectedNamespace?.value && selectedResource?.gvk?.Kind) {
            const updateData = [
                {
                    id: `${AppDetailsTabsIdPrefix.k8s_Resources}-${AppDetailsTabs.k8s_Resources}`,
                    url: `${URLS.RESOURCE_BROWSER}/${selectedCluster.value}/${
                        selectedNamespace.value
                    }/${selectedResource.gvk.Kind.toLowerCase()}/${
                        selectedResource.gvk.Group.toLowerCase() || K8S_EMPTY_GROUP
                    }`,
                    dynamicTitle: selectedResource.gvk.Kind,
                },
            ]
            updateData.forEach((data) => updateTabUrl(data.id, data.url, data.dynamicTitle))
        }
        return (): void => {
            resourceListAbortController.abort()
        }
    }, [selectedCluster, selectedNamespace, selectedResource])

    useEffect(() => {
        if (!superAdminRef.current) {
            return
        }
        if (selectedCluster?.value && selectedNamespace?.value && nodeType) {
          const _searchParam = tabs[1]?.url.split('?')[1] ? `?${tabs[1].url.split('?')[1]}` : ''
          updateTabUrl(
              `${AppDetailsTabsIdPrefix.terminal}-${AppDetailsTabs.terminal}`,
              `${URLS.RESOURCE_BROWSER}/${selectedCluster.value}/${
                  selectedNamespace.value ? selectedNamespace.value : ALL_NAMESPACE_OPTION.value
              }/${AppDetailsTabs.terminal}/${K8S_EMPTY_GROUP}${
                  nodeType === AppDetailsTabs.terminal ? location.search : _searchParam
              }`,
              `${AppDetailsTabs.terminal} '${selectedCluster.label}'`,
          )
        } else {
            removeTabByIdentifier(`${AppDetailsTabsIdPrefix.terminal}-${AppDetailsTabs.terminal}`)
        }
        if (tabs.length > 0 && nodeType === AppDetailsTabs.terminal) {
            markTabActiveByIdentifier(AppDetailsTabsIdPrefix.terminal, AppDetailsTabs.terminal)
        }
    }, [clusterCapacityData, location.search])
    useEffect(() => {
        if (clusterId && selectedResource && selectedResource.gvk.Kind!==SIDEBAR_KEYS.overviewGVK.Kind && !isOverview && !isTerminal && !isNodes) {
            getResourceListData()
            setSearchText('')
            setSearchApplied(false)
        } else if (isNodes) {
            setResourceListLoader(false)
            setLastDataSync(!lastDataSync)
        }
    }, [selectedResource])

    useEffect(() => {
        if (!loader && clusterId && selectedResource?.namespaced && !isOverview && !isNodes) {
            getResourceListData(true)
        }
    }, [selectedNamespace])

   

    const getDetailsClusterList = async () => {
        setTerminalLoader(true)
        getClusterList()
            .then((response) => {
                if (response.result) {
                  response.result.sort((a, b) => a['name'].localeCompare(b['name']))
                  setTerminalCluster(response.result)
                  setClusterList(response.result)
                }
                setTerminalLoader(false)
            })
            .catch((err) => {
                setTerminalLoader(false)
                if (err['code'] !== 403) {
                    showError(err)
                }
            })
    }

    const getClusterData = async () => {
        try {
            setClusterLoader(true)
            setAccessDeniedCode(0)
            const [clusterList, hostUrlConfig, userRole, namespaceList] = await Promise.all([
                getClusterListMin(),
                getHostURLConfiguration('DEFAULT_TERMINAL_IMAGE_LIST'),
                window._env_.K8S_CLIENT ? null : getUserRole(),
                clusterNamespaceList(),
            ])
            if (clusterList.result) {
                const _clusterList = clusterList.result
                const _clusterOptions = convertToOptionsList(
                    sortObjectArrayAlphabetically(_clusterList, 'name'),
                    'name',
                    'id',
                    'nodeErrors',
                )
                setClusterOptions(_clusterOptions as ClusterOptionType[])
                setClusterList(_clusterList)
                const _selectedCluster = _clusterOptions.find((cluster) => cluster.value == clusterId)
                if (_selectedCluster) {
                    onChangeCluster(_selectedCluster, false, true)
                }
                if (nodeType !== SIDEBAR_KEYS.overviewGVK.Kind.toLowerCase()) {
                    getSidebarData(clusterId)
                }
            }

            if (hostUrlConfig.result) {
                const imageValue: string = hostUrlConfig.result.value
                setImageList(JSON.parse(imageValue))
            }
            if (userRole?.result) {
                superAdminRef.current=userRole.result.superAdmin
                initTabsBasedOnRole(false, userRole.result.superAdmin)
            }
            if (namespaceList.result) {
                setNameSpaceList(namespaceList.result)
            }
        } catch (err) {
            if (err['code'] === 403) {
                setAccessDeniedCode(err['code'])
            } else {
                showError(err)
            }
            initTabsBasedOnRole(false)
        } finally {
            setClusterLoader(false)
        }
    }

    const initTabsBasedOnRole = (reInit: boolean, _isSuperAdmin?: boolean) => {
        const _tabs = [
            {
                idPrefix: AppDetailsTabsIdPrefix.cluster_overview,
                name: AppDetailsTabs.cluster_overview,
                url: `${
                    URLS.RESOURCE_BROWSER
                }/${clusterId}/${namespace}/${SIDEBAR_KEYS.overviewGVK.Kind.toLowerCase()}/${K8S_EMPTY_GROUP}`,
                isSelected: true,
                positionFixed: true,
                iconPath: ClusterIcon,
                showNameOnSelect: false,
            },
            {
                idPrefix: AppDetailsTabsIdPrefix.k8s_Resources,
                name: AppDetailsTabs.k8s_Resources,
                url: `${
                    URLS.RESOURCE_BROWSER
                }/${clusterId}/${namespace}/${SIDEBAR_KEYS.nodeGVK.Kind.toLowerCase()}/${K8S_EMPTY_GROUP}`,
                isSelected: false,
                positionFixed: true,
                iconPath: K8ResourceIcon,
                showNameOnSelect: false,
            },
        ]
        if (superAdminRef.current) {
            _tabs.push({
                idPrefix: AppDetailsTabsIdPrefix.terminal,
                name: AppDetailsTabs.terminal,
                url: `${URLS.RESOURCE_BROWSER}/${clusterId}/${namespace}/${AppDetailsTabs.terminal}/${K8S_EMPTY_GROUP}${location.search}`,
                isSelected: false,
                positionFixed: true,
                iconPath: TerminalIcon,
                showNameOnSelect: true,
            })
        }

        if (reInit) {
            initTabs(_tabs, true)
        } else {
            initTabs(
                _tabs,
                false,
                !superAdminRef.current ? [`${AppDetailsTabsIdPrefix.terminal}-${AppDetailsTabs.terminal}`] : null,
            )
        }
        setSelectedResource({
            namespaced: false,
            gvk: SIDEBAR_KEYS.nodeGVK,
        })
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
            setK8SObjectMap(null)
            setLoader(true)
            sideDataAbortController.current.new = new AbortController()
            const { result } = await getResourceGroupList(_clusterId, sideDataAbortController.current.new.signal)
            if (result) {
                const processedData = processK8SObjects(result.apiResources, nodeType)
                const _k8SObjectMap = processedData.k8SObjectMap
                const _k8SObjectList: K8SObjectType[] = []
                const currentNodeType = clusterId == _clusterId ? nodeType || SIDEBAR_KEYS.overviewGVK.Kind.toLowerCase() : SIDEBAR_KEYS.overviewGVK.Kind.toLowerCase()

                for (const element of ORDERED_AGGREGATORS) {
                    if (_k8SObjectMap.get(element)) {
                        _k8SObjectList.push(_k8SObjectMap.get(element))
                    }
                }

                const { parentNode, childNode, isResourceGroupPresent, groupedChild } = getParentAndChildNodes(
                    _k8SObjectList,
                    currentNodeType,
                    group,
                )

                if (!isResourceGroupPresent && !node) {
                    parentNode.isExpanded = true
                    const searchParam =location.search? `/${location.search}`:''
                    replace({
                        pathname: `${URLS.RESOURCE_BROWSER}/${_clusterId}/${namespace || ALL_NAMESPACE_OPTION.value
                            }/${SIDEBAR_KEYS.overviewGVK.Kind.toLowerCase()}/${K8S_EMPTY_GROUP}${searchParam}`,
                    })
                }

                const defaultSelected = groupedChild ??
                    processedData.selectedResource ?? {
                        namespaced: false,
                        gvk: SIDEBAR_KEYS.nodeGVK,
                    }

                setK8SObjectMap(getGroupedK8sObjectMap(_k8SObjectList, nodeType))
                setSelectedResource(defaultSelected)
                updateResourceSelectionData(defaultSelected, true)
                setShowErrorState(false)
                setErrorMsg('')
            }
            setLoader(false)
        } catch (err) {
            if (err['code'] > 0) {
                if (err['code'] === 404) {
                    setSelectedCluster(null)
                    replace({
                        pathname: URLS.RESOURCE_BROWSER,
                    })
                } else if (err['code'] === 403) {
                    if (!node) {
                        const searchParam = location.search ? `/${location.search}` : ''
                        replace({
                            pathname: `${URLS.RESOURCE_BROWSER}/${_clusterId}/${
                                namespace || ALL_NAMESPACE_OPTION.value
                            }/${SIDEBAR_KEYS.overviewGVK.Kind.toLowerCase()}/${K8S_EMPTY_GROUP}${searchParam}`,
                        })
                    }
                    setSelectedResource({
                        namespaced: false,
                        gvk: SIDEBAR_KEYS.nodeGVK,
                    })
                } else {
                    setErrorMsg(
                        (err instanceof ServerErrors && Array.isArray(err.errors)
                            ? err.errors[0]?.userMessage
                            : err['message']) ?? SOME_ERROR_MSG,
                    )
                }
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

        if (resourceList) {
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
                        'age',
                        'node',
                        'ip'
                    ],
                    origin: new URL(process.env.PUBLIC_URL, window.location.href).origin,
                },
            })
        }
    }

    const renderRefreshBar = () => {
        if (hideSyncWarning) {
            return null
        }
        return <div className="fs-13 flex left w-100 bcy-1 h-32 warning-icon-y7-imp dc__border-bottom-y2">
            <div className="pl-12 flex fs-13 pt-6 pb-6 pl-12">
                <Warning className="icon-dim-20 mr-8" />
                <span>Last synced {lastDataSyncTimeString}. The data might be stale. </span>
                <span className='cb-5 ml-4 fw-6 cursor' onClick={refreshData}>Sync now</span>
            </div>
        </div>
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
            if (selectedResource?.gvk.Kind === SIDEBAR_KEYS.eventGVK.Kind && result.data.length) {
                result.data = sortEventListData(result.data)
            }
            if (selectedResource?.gvk.Kind === Nodes.StorageClass) {
                result.data = removeDefaultForStorageClass(result.data)
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
            setLastDataSync(!lastDataSync)
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
        }
        if (sideDataAbortController.current.prev?.signal.aborted) {
            sideDataAbortController.current.prev = null
        }
        abortReqAndUpdateSideDataController()
        setSelectedCluster(selected)
        getNamespaceList(selected.value)

        if (!skipRedirection) {
            const path = `${URLS.RESOURCE_BROWSER}/${selected.value}/${
                ALL_NAMESPACE_OPTION.value
            }/${SIDEBAR_KEYS.overviewGVK.Kind.toLowerCase()}/${K8S_EMPTY_GROUP}`
            if (fromClusterSelect) {
                initTabsBasedOnRole(true)
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
                ':clusterId?': {
                    component: <ClusterSelector onChange={onClusterChange} clusterList={clusterOptions} clusterId={clusterId} />,
                    linked: false,
                },
                ':namespace?': null,
                ':nodeType?': null,
                ':group?': null,
                ':node?': null
            },
        },
        [clusterId, clusterOptions],
    )

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

    const updateNodeSelectionData = (_selected: Record<string, any>, _group?: string) => {
        if (_selected) {
            const _nodeType = _selected.isFromEvent || _selected.isFromNodeDetails ? '' : nodeType + '_'
            setNodeSelectionData((prevData) =>
                getUpdatedNodeSelectionData(
                    prevData,
                    _selected,
                    `${_nodeType}${_selected.name}_${_selected.namespace ?? namespace}_${_group ?? group}`,
                    _selected.isFromEvent || _selected.isFromNodeDetails ? _selected.name.split('_')[1] : null,
                ),
            )
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
        if (resourceListLoader || rawGVKLoader || loader) {
            return null
        }

        const selectedNode =
            nodeSelectionData?.[`${nodeType}_${node}_${namespace}_${group}`] ??
            resourceList?.data?.find(
                (_resource) => _resource.name === node && (!_resource.namespace || _resource.namespace === namespace),
            )
        const _selectedResource =
            selectedNode?.isFromEvent || selectedNode?.isFromNodeDetails
                ? getEventObjectTypeGVK(k8SObjectMapRaw ?? k8SObjectMap, nodeType)
                : resourceSelectionData?.[`${nodeType}_${group}`]?.gvk ??
                  getEventObjectTypeGVK(k8SObjectMapRaw ?? k8SObjectMap, nodeType)
        if (!nodeSelectionData?.[`${nodeType}_${node}_${namespace}_${group}`]) {
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

    const renderListBar = () => {
        if (nodeType === SIDEBAR_KEYS.nodeGVK.Kind.toLowerCase()) {
            return (
                <NodeDetailsList
                    clusterId={clusterId}
                    isSuperAdmin={superAdminRef.current}
                    nodeK8sVersions={clusterCapacityData?.nodeK8sVersions}
                    renderCallBackSync={renderRefreshBar}
                    addTab={addTab}
                    syncError={!hideSyncWarning}
                    lastDataSync={lastDataSync}
                    setLastDataSync={setLastDataSync}
                />
            )
        } else {
            return (
                <K8SResourceList
                    selectedResource={selectedResource}
                    resourceList={resourceList}
                    filteredResourceList={filteredResourceList}
                    noResults={noResults}
                    selectedCluster={selectedCluster}
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
                    renderCallBackSync={renderRefreshBar}
                    syncError={!hideSyncWarning}
                    k8SObjectMapRaw={k8SObjectMapRaw ?? k8SObjectMap}
                />
            )
        }
    }

    const renderResourceBrowser = (): JSX.Element => {
        if (nodeType === SIDEBAR_KEYS.nodeGVK.Kind.toLowerCase() && node) {
            return (
                <NodeDetails
                    isSuperAdmin={superAdminRef.current}
                    markTabActiveByIdentifier={markTabActiveByIdentifier}
                    addTab={addTab}
                    updateNodeSelectionData={updateNodeSelectionData}
                    k8SObjectMapRaw={k8SObjectMapRaw ?? k8SObjectMap}
                    lastDataSync={lastDataSync}
                />
            )
        }
        if (nodeType === AppDetailsTabs.terminal) {
            const _imageList = selectedTerminal ? filterImageList(imageList, selectedTerminal.serverVersion) : []
            if (terminalLoader) {
                return (
                    <div className="h-100 node-data-container bcn-0">
                        <Progressing pageLoader />
                    </div>
                )
            } else if (!selectedTerminal || !namespaceDefaultList?.[selectedTerminal.name]) {
                return (
                    <div className="bcn-0 node-data-container flex">
                        {superAdminRef.current ? <Reload /> : <ErrorScreenManager code={403} />}
                    </div>
                )
            }
            return (
                <ClusterTerminal
                    clusterId={+clusterId}
                    nodeGroups={createGroupSelectList(selectedTerminal?.nodeDetails, 'nodeName')}
                    taints={createTaintsList(selectedTerminal?.nodeDetails, 'nodeName')}
                    clusterImageList={_imageList}
                    namespaceList={namespaceDefaultList[selectedTerminal.name]}
                    isNodeDetailsPage={true}
                />
            )
        } else if (node) {
            return (
                <div className="resource-details-container">
                    <NodeDetailComponent
                        loadingResources={resourceListLoader || rawGVKLoader || loader}
                        isResourceBrowserView={true}
                        selectedResource={getSelectedResourceData()}
                        markTabActiveByIdentifier={markTabActiveByIdentifier}
                        addTab={addTab}
                        logSearchTerms={logSearchTerms}
                        setLogSearchTerms={setLogSearchTerms}
                        removeTabByIdentifier={removeTabByIdentifier}
                    />
                </div>
            )
        } else if (nodeType === AppDetailsTabs.cluster_overview.toLocaleLowerCase())
            return (
                <ClusterOverview
                    isSuperAdmin={superAdminRef.current}
                    clusterCapacityData={clusterCapacityData}
                    setClusterErrorTitle={setClusterErrorTitle}
                    setSelectedResource={setSelectedResource}
                    setClusterCapacityData={setClusterCapacityData}
                    selectedCluster={selectedCluster}
                    setSelectedCluster={setSelectedCluster}
                    sideDataAbortController={sideDataAbortController.current}
                />
            )
        return loader || rawGVKLoader || errorMsg ? (
            <ConnectingToClusterState
                loader={loader}
                errorMsg={errorMsg}
                setErrorMsg={setErrorMsg}
                selectedCluster={selectedCluster}
                setSelectedCluster={setSelectedCluster}
                handleRetry={handleRetry}
                sideDataAbortController={sideDataAbortController.current}
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
                    isClusterError={!!clusterErrorTitle}
                />
                {renderListBar()}
            </div>
        )
    }

    const addClusterButton = () => {
        if (clusterId) return (!loader && !showErrorState && k8SObjectMap &&
            <><div
                className="cursor flex cta small h-28 pl-8 pr-10 pt-5 pb-5 lh-n fcb-5 mr-16"
                data-testid="create-resource"
                onClick={showResourceModal}
            >
                <Add className="icon-dim-16 fcb-5 mr-5" /> Create resource
            </div>
                <span className="dc__divider" /></>)

        return (
            <>
                <NavLink className="flex dc__no-decor cta small h-28 pl-8 pr-10 pt-5 pb-5 lh-n fcb-5 mr-16" to={URLS.GLOBAL_CONFIG_CLUSTER}>
                    <Add
                        data-testid="add_cluster_button"
                        className="icon-dim-16 mr-4 fcb-5 dc__vertical-align-middle"
                    />
                    Add cluster
                </NavLink>
                <span className="dc__divider" />
            </>
        )
    }

    const renderBreadcrumbs = () => {
        return <BreadCrumb breadcrumbs={breadcrumbs} />
    }

    const refreshSync = () => {
        setToggle(!toggleSync)
    }

    const renderResourceListBody = () => {
        if(accessDeniedCode) {
            return (
                <div className='flex' style={{ height: 'calc(100vh - 48px)' }}>
                    <ErrorScreenManager code={accessDeniedCode} />
                </div>
            )
        } else if ((loader && !selectedCluster?.value) || clusterLoader) {
            return (
                <div style={{ height: 'calc(100vh - 48px)' }}>
                    <Progressing pageLoader />
                </div>
            )
        } else if (!selectedCluster?.value) {
            return (
                <ClusterSelectionList
                    clusterOptions={clusterList}
                    onChangeCluster={onChangeCluster}
                    isSuperAdmin={superAdminRef.current}
                    clusterListLoader={terminalLoader}
                    refreshData={refreshSync}
                />
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
                        <DynamicTabs tabs={tabs} removeTabByIdentifier={removeTabByIdentifier} stopTabByIdentifier={stopTabByIdentifier} enableShortCut={!showCreateResourceModal} refreshData={refreshData} lastDataSync={lastDataSync} loader={loader||rawGVKLoader||clusterLoader||resourceListLoader} isOverview={isOverview} isStaleDataRef={isStaleDataRef} setLastDataSyncTimeString={setLastDataSyncTimeString}/>
                    </div>
                </div>
                {renderResourceBrowser()}
                </>
        )
    }
    return (
        <ShortcutProvider>
            <div className="resource-browser-container">
                <PageHeader isBreadcrumbs={!!clusterId} breadCrumbs={renderBreadcrumbs} headerName={!clusterId ? 'Kubernetes Resource Browser' : ''} renderActionButtons={addClusterButton} />
                {renderResourceListBody()}
                {showCreateResourceModal && <CreateResource closePopup={closeResourceModal} clusterId={clusterId} />}
            </div>
        </ShortcutProvider>
    )
}
