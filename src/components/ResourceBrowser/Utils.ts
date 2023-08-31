import moment from 'moment'
import { LAST_SEEN } from '../../config'
import { Nodes } from '../app/types'
import { eventAgeComparator } from '../common'
import { getAggregator, NodeType } from '../v2/appDetails/appDetails.type'
import { K8S_EMPTY_GROUP, MARK_AS_STALE_DATA_CUT_OFF_MINS, SIDEBAR_KEYS } from './Constants'
import { ApiResourceGroupType, K8SObjectChildMapType, K8SObjectMapType, K8SObjectType } from './Types'

const updatePersistedTabsData = (key: string, value: any) => {
    try {
        const persistedTabsData = localStorage.getItem('persisted-tabs-data')
        if (persistedTabsData) {
            localStorage.setItem(
                'persisted-tabs-data',
                JSON.stringify({
                    ...JSON.parse(persistedTabsData),
                    [key]: value,
                }),
            )
        }
    } catch (err) {}
}

export const getUpdatedResourceSelectionData = (
    prevData: Record<string, ApiResourceGroupType>,
    selected: ApiResourceGroupType,
    initSelection: boolean,
    group: string,
): Record<string, ApiResourceGroupType> => {
    const _updatedResourceSelectionData = {
        ...prevData,
        [`${selected.gvk.Kind.toLowerCase()}_${
            (initSelection && group) || selected.gvk.Group.toLowerCase() || K8S_EMPTY_GROUP
        }`]: selected,
    }
    updatePersistedTabsData('resourceSelectionData', _updatedResourceSelectionData)

    return _updatedResourceSelectionData
}

export const getUpdatedNodeSelectionData = (
    prevData: Record<string, Record<string, any>>,
    selected: Record<string, any>,
    resourceKey: string,
    resourceName?: string,
): Record<string, Record<string, any>> => {
    const _updatedNodeSelectionData = {
        ...prevData,
        [resourceKey]: resourceName ? { ...selected, name: resourceName } : selected,
    }
    updatePersistedTabsData('nodeSelectionData', _updatedNodeSelectionData)

    return _updatedNodeSelectionData
}

export const getEventObjectTypeGVK = (k8SObjectMap: Map<string, K8SObjectMapType>, nodeType: string) => {
    const _resourceGroupType = getAggregator(nodeType as NodeType)
    const _selectedGroup = k8SObjectMap.get(_resourceGroupType)
    for (const [key, value] of _selectedGroup.child) {
        if (key.toLowerCase() === nodeType) {
            return value.data[0].gvk
        }
    }

    return null
}

// Converts k8SObjects list to grouped map
export const getGroupedK8sObjectMap = (_k8SObjectList: K8SObjectType[], nodeType: string) => {
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
    return [
        ...warningEvents.sort(eventAgeComparator<Record<string, any>>(LAST_SEEN)),
        ...otherEvents.sort(eventAgeComparator<Record<string, any>>(LAST_SEEN)),
    ]
}

export const getParentAndChildNodes = (_k8SObjectList: K8SObjectType[], nodeType: string, group: string) => {
    const parentNode = _k8SObjectList[0]
    const childNode = parentNode.child.find((_ch) => _ch.gvk.Kind === Nodes.Pod) ?? parentNode.child[0]
    let isResourceGroupPresent = false
    let groupedChild = null
    if (nodeType) {
        for (const _parentNode of _k8SObjectList) {
            for (const _childNode of _parentNode.child) {
                if (
                    _childNode.gvk.Kind.toLowerCase() === nodeType ||
                    (_childNode.gvk.Group.toLowerCase() === group ||
                        SIDEBAR_KEYS.eventGVK.Group.toLowerCase() === group ||
                        K8S_EMPTY_GROUP === group)
                ) {
                    isResourceGroupPresent = true
                    groupedChild = _childNode
                    break
                }
            }
        }
    }

    return {
        parentNode,
        childNode,
        isResourceGroupPresent,
        groupedChild,
    }
}

export const checkIfDataIsStale = (
    isStaleDataRef: React.MutableRefObject<boolean>,
    _staleDataCheckTime: moment.Moment,
) => {
    /**
     * Stale data warning to be shown after 15 min. However, kept the cut off mins at 13 instead of 15 to,
     * 1. skip 1st min as render for 1st min has already been started/done
     * 2. skip maintaining unnecessary state just for re-rendering
     */
    if (!isStaleDataRef.current && moment().diff(_staleDataCheckTime, 'minutes') > MARK_AS_STALE_DATA_CUT_OFF_MINS) {
        isStaleDataRef.current = true
    }
}
