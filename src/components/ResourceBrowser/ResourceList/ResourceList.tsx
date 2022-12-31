import React, { useState, useEffect } from 'react'
import { useHistory, useParams, useLocation } from 'react-router'
import { convertToOptionsList, handleUTCTime, Progressing, showError } from '../../common'
import PageHeader from '../../common/header/PageHeader'
import { GVKType, K8SObjectType, ResourceDetail, resourceListPayloadType } from '../Types'
import { getResourceGroupList, getResourceList, namespaceListByClusterId } from '../ResourceBrowser.service'
import { OptionType } from '../../app/types'
import { ALL_NAMESPACE_OPTION } from '../Constants'
import { URLS } from '../../../config'
import { getAggregator } from '../../app/details/appDetails/utils'
import { Sidebar } from './Sidebar'
import { K8SResourceList } from './K8SResourceList'
import { ClusterSelectionComponent } from './ClusterSelectionComponent'
import { getClusterListMinWithoutAuth } from '../../../services/service'
import { ReactComponent as CubeIcon } from '../../../assets/icons/ic-cube.svg'
import { ReactComponent as CloseIcon } from '../../../assets/icons/ic-cross.svg'
import { ReactComponent as RefreshIcon } from '../../../assets/icons/ic-arrows_clockwise.svg'
import { ReactComponent as Add } from '../../../assets/icons/ic-add.svg'
import '../ResourceBrowser.scss'

export default function ResourceList() {
    const { clusterId, namespace, kind, node } = useParams<{
        clusterId: string
        namespace: string
        kind: string
        node: string
    }>()
    const { replace, push } = useHistory()
    const [loader, setLoader] = useState(false)
    const [resourceListLoader, setResourceListLoader] = useState(false)
    const [noResults, setNoResults] = useState(false)
    const [k8SObjectList, setK8SObjectList] = useState<K8SObjectType[]>([])
    const [k8SObjectListIndexMap, setK8SObjectListIndexMap] = useState<Map<string, number>>()
    const [resourceList, setResourceList] = useState<ResourceDetail[]>([])
    const [filteredResourceList, setFilteredResourceList] = useState<ResourceDetail[]>([])
    const [clusterOptions, setClusterOptions] = useState<OptionType[]>()
    const [namespaceOptions, setNamespaceOptions] = useState<OptionType[]>()
    const [selectedCluster, setSelectedCluster] = useState<OptionType>(null)
    const [selectedNamespace, setSelectedNamespace] = useState<OptionType>(null)
    const [selectedResource, setSelectedResource] = useState(kind || '')
    const [selectedGVK, setSelectedGVK] = useState<GVKType>(null)
    const [lastDataSyncTimeString, setLastDataSyncTimeString] = useState('')
    const [lastDataSync, setLastDataSync] = useState(false)

    useEffect(() => {
        getClusterList()
    }, [])

    useEffect(() => {
        if (clusterId) {
            getSidebarData()
        }
    }, [clusterId])

    useEffect(() => {
        if (selectedGVK) {
            getResourceListData()
        }
    }, [selectedGVK, namespace])

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
            const _clusterOptions = convertToOptionsList(result, null, 'cluster_name', 'id')
            setClusterOptions(_clusterOptions)
            const _selectedCluster = _clusterOptions.find((cluster) => cluster.value == clusterId)
            if (_selectedCluster) {
                setSelectedCluster(_selectedCluster || _clusterOptions[0])
                getNamespaceList(_selectedCluster.value)
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
            const { result: result1 } = await getResourceGroupList(clusterId)
            const _k8SObjectListIndexMap = new Map<string, number>()
            const _k8SObjectList = []
            let _selectedGVK
            for (let index = 0; index < result1.length; index++) {
                const element = result1[index]
                const groupParent = element.gvk.Group.endsWith('.k8s.io') ? 'Others' : getAggregator(element.gvk.Kind)
                const k8SObjectIndex = _k8SObjectListIndexMap.get(groupParent)
                if (element.gvk.Kind.toLowerCase() === selectedResource) {
                    _selectedGVK = element.gvk
                }
                if (k8SObjectIndex === undefined) {
                    _k8SObjectList.push({
                        name: groupParent,
                        isExpanded: element.gvk.Kind.toLowerCase() === selectedResource,
                        child: [element.gvk],
                    })
                    _k8SObjectListIndexMap.set(groupParent, _k8SObjectList.length - 1)
                } else {
                    if (
                        !_k8SObjectList[k8SObjectIndex].isExpanded &&
                        element.gvk.Kind.toLowerCase() === selectedResource
                    ) {
                        _k8SObjectList[k8SObjectIndex].isExpanded = true
                    }
                    _k8SObjectList[k8SObjectIndex].child.push(element.gvk)
                }
            }
            if (!selectedResource) {
                _k8SObjectList[0].isExpanded = true
                const _selectedResource = _k8SObjectList[0].child[0].Kind.toLowerCase()
                setSelectedResource(_selectedResource)
                _selectedGVK = _k8SObjectList[0].child[0]
                replace({
                    pathname: `${URLS.RESOURCE_BROWSER}/${clusterId}/${
                        namespace || ALL_NAMESPACE_OPTION.value
                    }/${_selectedResource}`,
                })
            }
            setK8SObjectList(_k8SObjectList)
            setK8SObjectListIndexMap(_k8SObjectListIndexMap)
            setSelectedGVK(_selectedGVK)
        } catch (err) {
            showError(err)
        } finally {
            setLoader(false)
        }
    }

    const getResourceListData = async (): Promise<void> => {
        try {
            setResourceListLoader(true)
            const resourceListPayload: resourceListPayloadType = {
                clusterId: Number(clusterId),
                k8sRequest: {
                    resourceIdentifier: {
                        groupVersionKind: selectedGVK,
                    },
                },
            }
            if (namespace && namespace !== ALL_NAMESPACE_OPTION.value) {
                resourceListPayload.k8sRequest.resourceIdentifier.namespace = namespace
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
        const path = `${URLS.RESOURCE_BROWSER}/${selected.value}/${ALL_NAMESPACE_OPTION.value}`
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

    const refreshData=():void=>{
      setSelectedGVK(null)
      getSidebarData()
    }

    if (loader) {
        return <Progressing pageLoader />
    }

    return (
        <div className="resource-browser-container">
            <PageHeader headerName="Kubernetes object browser" />
            {!selectedCluster?.value ? (
                <ClusterSelectionComponent clusterOptions={clusterOptions} onChangeCluster={onChangeCluster} />
            ) : (
                <div>
                    <div className="h-44 flexbox dc__content-space pr-20 pl-20">
                        <div className="resource-browser-tab flex left pt-10">
                            <div className="flex fw-6 fs-12 h-32 pt-7 pr-12 pb-7 pl-12 active bcn-0">
                                <CubeIcon className="icon-dim-16 scn-9 mr-8" />
                                K8s Objects
                            </div>
                            <div className="flex fw-6 fs-12 h-32 pt-7 pr-12 pb-7 pl-12">
                                Pod/...-qff78
                                <CloseIcon className="icon-dim-16 ml-8" />
                            </div>
                        </div>
                        <div className="fs-13 flex pt-12 pb-12">
                            <div
                                className="pointer cb-5 fw-6 fs-13 flexbox pr-12 dc__border-right"
                                onClick={() => {}}
                            >
                                <Add className="icon-dim-16 scb-5 mr-5 mt-3" /> Create
                            </div>
                            {lastDataSyncTimeString && (
                                <div className="ml-12 flex">
                                    <span>
                                        {lastDataSyncTimeString}
                                    </span>
                                    <RefreshIcon className="icon-dim-16 scb-5 ml-8 pointer" onClick={refreshData} />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="resource-browser bcn-0">
                        <Sidebar
                            k8SObjectList={k8SObjectList}
                            clusterId={clusterId}
                            namespace={selectedNamespace?.value || namespace}
                            selectedResource={selectedResource}
                            setSelectedResource={setSelectedResource}
                            handleGroupHeadingClick={handleGroupHeadingClick}
                            setSelectedGVK={setSelectedGVK}
                        />
                        <K8SResourceList
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
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
