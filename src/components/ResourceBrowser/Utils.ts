import queryString from 'query-string'
import { useLocation } from 'react-router-dom'
import { URLS, LAST_SEEN } from '../../config'
import { eventAgeComparator, processK8SObjects } from '../common'
import { AppDetailsTabs, AppDetailsTabsIdPrefix } from '../v2/appDetails/appDetails.store'
import { getAggregator, NodeType } from '../v2/appDetails/appDetails.type'
import { K8S_EMPTY_GROUP, ORDERED_AGGREGATORS, SIDEBAR_KEYS } from './Constants'
import { ApiResourceGroupType, ClusterOptionType, K8SObjectChildMapType, K8SObjectMapType, K8SObjectType, K8sObjectOptionType, GVKType } from './Types'
import TerminalIcon from '../../assets/icons/ic-terminal-fill.svg'
import K8ResourceIcon from '../../assets/icons/ic-object.svg'
import ClusterIcon from '../../assets/icons/ic-world-black.svg'

// Converts k8SObjects list to grouped map
export const getGroupedK8sObjectMap = (_k8SObjectList: K8SObjectType[], nodeType: string): Map<string, K8SObjectMapType> => {
    return _k8SObjectList.reduce((map, _k8sObject) => {
        const childObj = map.get(_k8sObject.name) ?? {
            ..._k8sObject,
            child: new Map<string, K8SObjectChildMapType>(),
        }
        for (const _child of _k8sObject.child) {
            if (childObj.child.has(_child.gvk.Kind)) {
                childObj.child.set(_child.gvk.Kind, {
                    isGrouped: true,
                    isExpanded: _child.gvk.Kind.toLowerCase() === nodeType,
                    data: [...childObj.child.get(_child.gvk.Kind).data, _child],
                })
            } else {
                childObj.child.set(_child.gvk.Kind, {
                    isExpanded: _child.gvk.Kind.toLowerCase() === nodeType,
                    data: [_child],
                })
            }
        }
        map.set(_k8sObject.name, childObj)
        return map
    }, new Map<string, K8SObjectMapType>())
}

export const getK8SObjectMapAfterGroupHeadingClick = (
    e: any,
    k8SObjectMap: Map<string, K8SObjectMapType>,
    preventCollapse: boolean,
) => {
    const splittedKey = e.currentTarget.dataset.groupName.split('/')
    const _k8SObjectMap = new Map<string, K8SObjectMapType>(k8SObjectMap)
    _k8SObjectMap.forEach((value) => value.isExpanded = false)

    if (splittedKey.length > 1) {
        const _selectedK8SObjectObj = _k8SObjectMap.get(splittedKey[0]).child.get(splittedKey[1])
        if (preventCollapse && _selectedK8SObjectObj.isExpanded) {
            return _k8SObjectMap
        }

        _selectedK8SObjectObj.isExpanded = !_selectedK8SObjectObj.isExpanded
        const _childObj = _k8SObjectMap.get(splittedKey[0])
        _childObj.child.set(splittedKey[1], _selectedK8SObjectObj)
        _k8SObjectMap.set(splittedKey[0], _childObj)
    } else {
        const _selectedK8SObjectObj = _k8SObjectMap.get(splittedKey[0])
        if (preventCollapse && _selectedK8SObjectObj.isExpanded) {
            return _k8SObjectMap
        }

        _selectedK8SObjectObj.isExpanded = !_selectedK8SObjectObj.isExpanded
        _k8SObjectMap.set(splittedKey[0], _selectedK8SObjectObj)
    }

    return _k8SObjectMap
}

export const sortEventListData = (eventList: Record<string, any>[]): Record<string, any>[] => {
    if (!eventList?.length) {
        return
    }
    const warningEvents: Record<string, any>[] = []
    const otherEvents: Record<string, any>[] = []
    eventList = eventList.reverse()
    for (const iterator of eventList) {
        if (iterator.type === 'Warning') {
            warningEvents.push(iterator)
        } else {
            otherEvents.push(iterator)
        }
    }
    return [
        ...warningEvents.sort(eventAgeComparator<Record<string, any>>(LAST_SEEN)),
        ...otherEvents.sort(eventAgeComparator<Record<string, any>>(LAST_SEEN)),
    ]
}

export const removeDefaultForStorageClass = (storageList: Record<string, any>[]): Record<string, any>[] => {
    for (const iterator of storageList) {
        if (iterator.name.includes('(default)')) {
            iterator.name = iterator.name.split(' (default)')[0]
        }
    }
    return storageList
}

export const getScrollableResourceClass = (
    className: string,
    showPaginatedView: boolean,
    syncError: boolean,
): string => {
    let _className = className
    if (showPaginatedView && syncError) {
        _className += ' paginated-list-view-with-sync-error'
    } else if (showPaginatedView) {
        _className += ' paginated-list-view'
    } else if (syncError) {
        _className += ' sync-error'
    }
    return _className
}

/* This is a utility function used in #convertK8sObjectMapToOptionsList */
const newK8sObjectOption = (
    label: string,
    gvk: GVKType,
    namespaced: boolean,
    grouped: boolean,
    groupName: string,
): K8sObjectOptionType => {
    return {
        label,
        value: gvk.Group || K8S_EMPTY_GROUP,
        dataset: {
            group: gvk.Group,
            version: gvk.Version,
            kind: gvk.Kind,
            namespaced: `${namespaced}`,
            grouped: `${grouped}`,
        },
        groupName,
    }
}

export const convertK8sObjectMapToOptionsList = (
    k8SObjectMap: Map<string, K8SObjectMapType>,
): K8sObjectOptionType[] => {
    const _k8sObjectOptionsList = []

    /* NOTE: we will map through all objects and their children to create the options
     * The options will be provided as a flat list but the groupings and heirarchies
     * of the options will be decided based on the heirarchy of the @k8SObjectMap
     * hence the complexity. Please refer mentioned types to untangle the complexity */
    k8SObjectMap?.forEach((k8sObject: K8SObjectMapType) => {
        const { child }: { child: Map<string, K8SObjectChildMapType> } = k8sObject

        child.forEach((k8sObjectChild: K8SObjectChildMapType, key: string) => {
            switch (key.toLowerCase()) {
                /* this is a special item in the sidebar added based on presence of a key */
                case SIDEBAR_KEYS.namespaceGVK.Kind.toLowerCase():
                    _k8sObjectOptionsList.push(
                        newK8sObjectOption(SIDEBAR_KEYS.namespaces, SIDEBAR_KEYS.namespaceGVK, false, false, ''),
                    )
                    break

                /* this is a special item in the sidebar added based on presence of a key */
                case SIDEBAR_KEYS.eventGVK.Kind.toLowerCase():
                    _k8sObjectOptionsList.push(
                        newK8sObjectOption(SIDEBAR_KEYS.events, SIDEBAR_KEYS.eventGVK, true, false, ''),
                    )
                    break

                default:
                    k8sObjectChild.data.forEach((data: ApiResourceGroupType) => {
                        _k8sObjectOptionsList.push(
                            newK8sObjectOption(
                                data.gvk.Kind,
                                data.gvk,
                                data.namespaced,
                                k8sObject.child.size > 1,
                                k8sObjectChild.data.length === 1 ? k8sObject.name : `${k8sObject.name}/${key}`,
                            ),
                        )
                    })
            }
        })
    })

    _k8sObjectOptionsList.push(newK8sObjectOption(SIDEBAR_KEYS.nodes, SIDEBAR_KEYS.nodeGVK, false, false, ''))

    return _k8sObjectOptionsList
}

export const updateQueryString = (
    location: ReturnType<typeof useLocation>,
    entries: [key: string, value: string][],
): string => {
    const parsedQueryString = queryString.parse(location.search)
    const keys = Object.keys(parsedQueryString)
    const query = {}
    keys.forEach((key) => {
        query[key] = parsedQueryString[key]
    })
    for (const [key, value] of entries) {
        if (value) {
            query[key] = value
        } else {
            delete query[key]
        }
    }
    return queryString.stringify(query)
}

export const getTabsBasedOnRole = (
    selectedCluster: ClusterOptionType,
    namespace: string,
    isSuperAdmin: boolean,
) => {
    const clusterId = selectedCluster.value
    const tabs = [
        {
            idPrefix: AppDetailsTabsIdPrefix.cluster_overview,
            name: AppDetailsTabs.cluster_overview,
            url: `${
                URLS.RESOURCE_BROWSER
            }/${clusterId}/${namespace}/${SIDEBAR_KEYS.overviewGVK.Kind.toLowerCase()}/${K8S_EMPTY_GROUP}`,
            isSelected: false,
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
            isSelected: true,
            positionFixed: true,
            iconPath: K8ResourceIcon,
            showNameOnSelect: false,
            dynamicTitle: SIDEBAR_KEYS.nodeGVK.Kind,
        },
        ...(!isSuperAdmin
            ? []
            : [
                  {
                      idPrefix: AppDetailsTabsIdPrefix.terminal,
                      name: AppDetailsTabs.terminal,
                      url: `${URLS.RESOURCE_BROWSER}/${clusterId}/${namespace}/${AppDetailsTabs.terminal}/${K8S_EMPTY_GROUP}`,
                      isSelected: false,
                      positionFixed: true,
                      iconPath: TerminalIcon,
                      showNameOnSelect: true,
                      dynamicTitle: `${AppDetailsTabs.terminal} '${selectedCluster.label}'`,
                  },
              ]),
    ]

    return tabs
}

/* TODO: add types */
export const convertResourceGroupListToK8sObjectList = (resource, nodeType): Map<string, K8SObjectMapType> => {
    if (!resource) {
        return null
    }
    const processedData = processK8SObjects(resource, nodeType)
    const _k8SObjectList = ORDERED_AGGREGATORS.map((element) => processedData.k8SObjectMap.get(element) || null).filter(
        (element) => !!element,
    )
    return getGroupedK8sObjectMap(_k8SObjectList, nodeType)
}

export const getResourceFromK8SObjectMap = (
    map: ApiResourceGroupType[],
    nodeType: string,
) => {
    const resource = map?.find((value) => value.gvk.Kind.toLowerCase() === nodeType.toLowerCase())
    return resource && {
        gvk: resource.gvk,
        namespaced: resource.namespaced,
        isGrouped: false,
    }
}
