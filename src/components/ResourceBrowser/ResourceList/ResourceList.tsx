import React, { useState, useEffect } from 'react'
import { Redirect, Route, Switch, useHistory, useLocation, useParams, useRouteMatch } from 'react-router-dom'
import { convertToOptionsList, handleUTCTime, processK8SObjects, Progressing, showError } from '../../common'
import PageHeader from '../../common/header/PageHeader'
import { ApiResourceType, K8SObjectType, ResourceDetail, ResourceListPayloadType } from '../Types'
import { getResourceGroupList, getResourceList, namespaceListByClusterId } from '../ResourceBrowser.service'
import { OptionType } from '../../app/types'
import { ALL_NAMESPACE_OPTION, ORDERED_AGGREGATORS } from '../Constants'
import { URLS } from '../../../config'
import { Sidebar } from './Sidebar'
import { K8SResourceList } from './K8SResourceList'
import { ClusterSelection } from './ClusterSelection'
import { getClusterListMinWithoutAuth } from '../../../services/service'
import { ReactComponent as RefreshIcon } from '../../../assets/icons/ic-arrows_clockwise.svg'
import { ReactComponent as Add } from '../../../assets/icons/ic-add.svg'
import { CreateResource } from './CreateResource'
import AppDetailsStore from '../../v2/appDetails/appDetails.store'
import NodeTreeTabList from '../../v2/appDetails/k8Resource/NodeTreeTabList'
import NodeDetailComponent from '../../v2/appDetails/k8Resource/nodeDetail/NodeDetail.component'
import { SelectedResourceType } from '../../v2/appDetails/appDetails.type'
import '../ResourceBrowser.scss'

export default function ResourceList() {
    const { clusterId, namespace, nodeType, node } = useParams<{
        clusterId: string
        namespace: string
        nodeType: string
        node: string
    }>()
    const { replace, push } = useHistory()
    const { path, url } = useRouteMatch()
    const [loader, setLoader] = useState(true)
    const [resourceListLoader, setResourceListLoader] = useState(true)
    const [noResults, setNoResults] = useState(false)
    const [k8SObjectList, setK8SObjectList] = useState<K8SObjectType[]>([])
    const [k8SObjectListIndexMap, setK8SObjectListIndexMap] = useState<Map<string, number>>()
    const [resourceList, setResourceList] = useState<ResourceDetail[]>([])
    const [filteredResourceList, setFilteredResourceList] = useState<ResourceDetail[]>([])
    const [clusterOptions, setClusterOptions] = useState<OptionType[]>()
    const [namespaceOptions, setNamespaceOptions] = useState<OptionType[]>()
    const [selectedCluster, setSelectedCluster] = useState<OptionType>(null)
    const [selectedNamespace, setSelectedNamespace] = useState<OptionType>(null)
    const [selectedResource, setSelectedResource] = useState<ApiResourceType>(null)
    const [logSearchTerms, setLogSearchTerms] = useState<Record<string, string>>()
    const [lastDataSyncTimeString, setLastDataSyncTimeString] = useState('')
    const [lastDataSync, setLastDataSync] = useState(false)
    const [showCreateResourceModal, setShowCreateResourceModal] = useState(false)
    const location = useLocation()

    useEffect(() => {
        getClusterList()
    }, [])

    useEffect(() => {
        if (clusterId) {
            getSidebarData()
        }
    }, [clusterId])

    useEffect(() => {
        if (selectedResource) {
            getResourceListData()
        }
    }, [selectedResource])

    useEffect(() => {
        if (selectedResource?.namespaced) {
            getResourceListData()
        }
    }, [namespace])

    useEffect(() => {
        AppDetailsStore.initAppDetailsTabs(url, false, false)
    }, [clusterId, namespace])

    useEffect(() => {
        const _lastDataSyncTime = Date()
        setLastDataSyncTimeString('Synced ' + handleUTCTime(_lastDataSyncTime, true))
        const interval = setInterval(() => {
            setLastDataSyncTimeString('Synced ' + handleUTCTime(_lastDataSyncTime, true))
        }, 1000)
        return () => {
            clearInterval(interval)
        }
    }, [lastDataSync])

    const getClusterList = async () => {
        try {
            setLoader(true)
            const { result } = await getClusterListMinWithoutAuth()
            const _clusterOptions = convertToOptionsList(result, 'cluster_name', 'id')
            setClusterOptions(_clusterOptions)
            const _selectedCluster = _clusterOptions.find((cluster) => cluster.value == clusterId)
            if (_selectedCluster) {
                setSelectedCluster(_selectedCluster || _clusterOptions[0])
                getNamespaceList(_selectedCluster.value)
            } else if (_clusterOptions.length === 1) {
                onChangeCluster(_clusterOptions[0], true)
            }
        } catch (err) {
            showError(err)
        } finally {
            setLoader(false)
        }
    }

    const getNamespaceList = async (clusterId: string) => {
        try {
            const { result } = await namespaceListByClusterId(clusterId)
            const _namespaceOptions = [ALL_NAMESPACE_OPTION, ...convertToOptionsList(result)]
            setNamespaceOptions(_namespaceOptions)
            setSelectedNamespace(_namespaceOptions[0])
        } catch (err) {
            showError(err)
        }
    }

    const getSidebarData = async (): Promise<void> => {
        try {
            setLoader(true)
            const { result: resourceGroupList } = await getResourceGroupList(clusterId)
            if (resourceGroupList) {
                const processedData = processK8SObjects(resourceGroupList, nodeType)
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
                if (!nodeType) {
                    _k8SObjectList[0].isExpanded = true
                    const _selectedResourceParam = _k8SObjectList[0].child[0].Kind.toLowerCase()
                    replace({
                        pathname: `${URLS.RESOURCE_BROWSER}/${clusterId}/${namespace || ALL_NAMESPACE_OPTION.value}/${
                            URLS.APP_DETAILS_K8
                        }/${_selectedResourceParam}`,
                    })
                }
                setK8SObjectList(_k8SObjectList)
                setK8SObjectListIndexMap(_k8SObjectListIndexMap)
                setSelectedResource(
                    _selectedResource || { namespaced: _k8SObjectList[0].namespaced, gvk: _k8SObjectList[0].child[0] },
                )
            }
        } catch (err) {
            showError(err)
        } finally {
            setLoader(false)
        }
    }

    const getResourceListData = async (): Promise<void> => {
        try {
            setResourceListLoader(true)
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
            const { result } = await getResourceList(resourceListPayload)
            setLastDataSync(!lastDataSync)
            setResourceList(result)
            setFilteredResourceList(result)
            setNoResults(result.length === 0)
        } catch (err) {
            showError(err)
        } finally {
            setResourceListLoader(false)
        }
    }

    const handleGroupHeadingClick = (e): void => {
        const _k8SObjectList = [...k8SObjectList]
        const groupIndex = k8SObjectListIndexMap.get(e.currentTarget.dataset.groupName)
        _k8SObjectList[groupIndex].isExpanded = !_k8SObjectList[groupIndex].isExpanded
        setK8SObjectList(_k8SObjectList)
    }

    const onChangeCluster = (selected, fromClusterSelect?: boolean): void => {
        setSelectedCluster(selected)
        getNamespaceList(selected.value)
        if (fromClusterSelect) {
            replace({
                pathname: `${URLS.RESOURCE_BROWSER}/${selected.value}/${ALL_NAMESPACE_OPTION.value}/${URLS.APP_DETAILS_K8}`,
            })
        } else {
            push({
                pathname: location.pathname.replace(`/${namespace}/`, `/${ALL_NAMESPACE_OPTION.value}/`),
            })
        }
    }

    const refreshData = (): void => {
        setSelectedResource(null)
        getSidebarData()
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

    if (loader) {
        return <Progressing pageLoader />
    }

    const selectedNode = resourceList.find((_resource) => _resource.name === node)

    return (
        <div className="resource-browser-container">
            <PageHeader headerName="Kubernetes object browser" />
            {!selectedCluster?.value ? (
                <ClusterSelection clusterOptions={clusterOptions} onChangeCluster={onChangeCluster} />
            ) : (
                <div>
                    <div
                        className="h-44 flexbox dc__content-space pr-20 pl-20"
                        style={{
                            boxShadow: 'inset 0 -1px 0 0 var(--N200)',
                        }}
                    >
                        <div className="resource-browser-tab flex left pt-10">
                            <NodeTreeTabList logSearchTerms={logSearchTerms} setLogSearchTerms={setLogSearchTerms} />
                        </div>
                        <div className="fs-13 flex pt-12 pb-12">
                            <div
                                className="pointer cb-5 fw-6 fs-13 flexbox pr-12 dc__border-right"
                                onClick={showResourceModal}
                            >
                                <Add className="icon-dim-16 scb-5 mr-5 mt-3" /> Create
                            </div>
                            {lastDataSyncTimeString && (
                                <div className="ml-12 flex">
                                    <span>{lastDataSyncTimeString}</span>
                                    <RefreshIcon className="icon-dim-16 scb-5 ml-8 pointer" onClick={refreshData} />
                                </div>
                            )}
                        </div>
                    </div>
                    <Switch>
                        <Route path={`${path}/${URLS.APP_DETAILS_K8}/:nodeType/:node`}>
                            <div className="resource-details-container">
                                <NodeDetailComponent
                                    isResourceBrowserView={true}
                                    selectedResource={
                                        {
                                            clusterId: Number(clusterId),
                                            group: selectedResource?.gvk?.Group || '',
                                            version: selectedResource?.gvk?.Version || '',
                                            kind: selectedResource?.gvk?.Kind || '',
                                            namespace: selectedNode?.namespace || '',
                                            name: selectedNode?.name || '',
                                            status: selectedNode?.status || '',
                                            containers: selectedNode?.containers || [],
                                        } as SelectedResourceType
                                    }
                                    logSearchTerms={logSearchTerms}
                                    setLogSearchTerms={setLogSearchTerms}
                                />
                            </div>
                        </Route>
                        <Route path={`${path}/${URLS.APP_DETAILS_K8}/:nodeType?`}>
                            <div className="resource-browser bcn-0 pl-8">
                                <Sidebar
                                    k8SObjectList={k8SObjectList}
                                    clusterId={clusterId}
                                    namespace={selectedNamespace?.value || namespace}
                                    handleGroupHeadingClick={handleGroupHeadingClick}
                                    nodeType={nodeType}
                                    setSelectedResource={setSelectedResource}
                                />
                                <K8SResourceList
                                    selectedResource={selectedResource}
                                    resourceList={resourceList}
                                    filteredResourceList={filteredResourceList}
                                    setFilteredResourceList={setFilteredResourceList}
                                    noResults={noResults}
                                    clusterOptions={clusterOptions}
                                    selectedCluster={selectedCluster}
                                    onChangeCluster={onChangeCluster}
                                    namespaceOptions={namespaceOptions}
                                    selectedNamespace={selectedNamespace}
                                    setSelectedNamespace={setSelectedNamespace}
                                    resourceListLoader={resourceListLoader}
                                    getResourceListData={getResourceListData}
                                />
                            </div>
                        </Route>
                        <Redirect to={`${path}/${URLS.APP_DETAILS_K8}`} />
                    </Switch>
                </div>
            )}
            {showCreateResourceModal && <CreateResource closePopup={closeResourceModal} clusterId={clusterId} />}
        </div>
    )
}
