/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react'
import { useLocation } from 'react-router-dom'
import moment from 'moment'
import queryString from 'query-string'

import {
    ALL_NAMESPACE_OPTION,
    ApiResourceGroupType,
    DATE_TIME_FORMAT_STRING,
    GVKType,
    InitTabType,
    K8sResourceDetailDataType,
    K8sResourceDetailType,
    ResponseType,
} from '@devtron-labs/devtron-fe-common-lib'

import { LAST_SEEN, URLS } from '../../config'
import { eventAgeComparator, importComponentFromFELibrary, processK8SObjects } from '../common'
import { AppDetailsTabs } from '../v2/appDetails/appDetails.store'
import {
    JUMP_TO_KIND_SHORT_NAMES,
    K8S_EMPTY_GROUP,
    MONITORING_DASHBOARD_TAB_ID,
    NODE_LIST_HEADERS,
    ORDERED_AGGREGATORS,
    ResourceBrowserTabsId,
    SIDEBAR_KEYS,
} from './Constants'
import {
    GetTabsBasedOnRoleParamsType,
    K8SObjectChildMapType,
    K8SObjectMapType,
    K8sObjectOptionType,
    K8SObjectType,
    NodeRowDetail,
} from './Types'

const getMonitoringDashboardTabConfig = importComponentFromFELibrary(
    'getMonitoringDashboardTabConfig',
    null,
    'function',
)

// Converts k8SObjects list to grouped map
export const getGroupedK8sObjectMap = (
    _k8SObjectList: K8SObjectType[],
    nodeType: string,
): Map<string, K8SObjectMapType> =>
    _k8SObjectList.reduce((map, _k8sObject) => {
        const childObj = map.get(_k8sObject.name) ?? {
            ..._k8sObject,
            child: new Map<string, K8SObjectChildMapType>(),
        }
        _k8sObject.child.forEach((_child) => {
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
        })
        map.set(_k8sObject.name, childObj)
        return map
    }, new Map<string, K8SObjectMapType>())

export const getK8SObjectMapAfterGroupHeadingClick = (
    e: React.MouseEvent<HTMLButtonElement> | { currentTarget: { dataset: { groupName: string } } },
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

        _selectedK8SObjectObj.isExpanded = preventCollapse || !_selectedK8SObjectObj.isExpanded
        const _childObj = _k8SObjectMap.get(splittedKey[0])
        _childObj.isExpanded = true
        _childObj.child.set(splittedKey[1], _selectedK8SObjectObj)
        _k8SObjectMap.set(splittedKey[0], _childObj)
    } else {
        const _selectedK8SObjectObj = _k8SObjectMap.get(splittedKey[0])
        if (preventCollapse && _selectedK8SObjectObj.isExpanded) {
            return _k8SObjectMap
        }

        _selectedK8SObjectObj.isExpanded = preventCollapse || !_selectedK8SObjectObj.isExpanded
        _k8SObjectMap.set(splittedKey[0], _selectedK8SObjectObj)
    }

    return _k8SObjectMap
}

export const sortEventListData = (eventList: K8sResourceDetailDataType[]): K8sResourceDetailDataType[] => {
    if (!eventList?.length) {
        return []
    }
    const warningEvents: K8sResourceDetailDataType[] = []
    const otherEvents: K8sResourceDetailDataType[] = []
    eventList.forEach((event) => {
        if (event.type === 'Warning') {
            warningEvents.push(event)
        } else {
            otherEvents.push(event)
        }
    })
    return [
        ...warningEvents.sort(eventAgeComparator<K8sResourceDetailDataType>(LAST_SEEN)),
        ...otherEvents.sort(eventAgeComparator<K8sResourceDetailDataType>(LAST_SEEN)),
    ]
}

export const removeDefaultForStorageClass = (storageList: K8sResourceDetailDataType[]): K8sResourceDetailDataType[] =>
    storageList.map((storage) =>
        (storage.name as string).includes('(default)')
            ? {
                  ...storage,
                  name: (storage.name as string).split(' (default)')[0],
              }
            : storage,
    )

/* This is a utility function used in #convertK8sObjectMapToOptionsList */
const newK8sObjectOption = (
    label: string,
    description: string,
    gvk: GVKType,
    namespaced: boolean,
    grouped: boolean,
    groupName: string,
    shortNames: ApiResourceGroupType['shortNames'],
): K8sObjectOptionType => ({
    label,
    description,
    value: gvk.Group || K8S_EMPTY_GROUP,
    dataset: {
        group: gvk.Group,
        version: gvk.Version,
        kind: gvk.Kind,
        namespaced: `${namespaced}`,
        grouped: `${grouped}`,
        shortNames,
    },
    groupName,
})

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
                case SIDEBAR_KEYS.nodeGVK.Kind.toLowerCase():
                    _k8sObjectOptionsList.push(
                        newK8sObjectOption(
                            SIDEBAR_KEYS.nodes,
                            '',
                            SIDEBAR_KEYS.nodeGVK,
                            false,
                            false,
                            '',
                            JUMP_TO_KIND_SHORT_NAMES.nodes,
                        ),
                    )
                    break

                /* this is a special item in the sidebar added based on presence of a key */
                case SIDEBAR_KEYS.namespaceGVK.Kind.toLowerCase():
                    _k8sObjectOptionsList.push(
                        newK8sObjectOption(
                            SIDEBAR_KEYS.namespaces,
                            '',
                            SIDEBAR_KEYS.namespaceGVK,
                            false,
                            false,
                            '',
                            JUMP_TO_KIND_SHORT_NAMES.namespaces,
                        ),
                    )
                    break

                /* this is a special item in the sidebar added based on presence of a key */
                case SIDEBAR_KEYS.eventGVK.Kind.toLowerCase():
                    _k8sObjectOptionsList.push(
                        newK8sObjectOption(
                            SIDEBAR_KEYS.events,
                            '',
                            SIDEBAR_KEYS.eventGVK,
                            true,
                            false,
                            '',
                            JUMP_TO_KIND_SHORT_NAMES.events,
                        ),
                    )
                    break

                default:
                    k8sObjectChild.data.forEach((data: ApiResourceGroupType) => {
                        _k8sObjectOptionsList.push(
                            newK8sObjectOption(
                                data.gvk.Kind,
                                k8sObjectChild.data.length === 1 ? '' : data.gvk.Group,
                                data.gvk,
                                data.namespaced,
                                k8sObject.child.size > 1,
                                k8sObjectChild.data.length === 1 ? k8sObject.name : `${k8sObject.name}/${key}`,
                                data.shortNames,
                            ),
                        )
                    })
            }
        })
    })

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
    entries.forEach(([key, value]) => {
        if (value) {
            query[key] = value
        } else {
            delete query[key]
        }
    })
    return queryString.stringify(query)
}

export const getURLBasedOnSidebarGVK = (kind: GVKType['Kind'], clusterId: string, namespace: string): string =>
    `${URLS.RESOURCE_BROWSER}/${clusterId}/${namespace}/${kind.toLowerCase()}/${K8S_EMPTY_GROUP}`

export const getTabsBasedOnRole = ({
    selectedCluster,
    namespace,
    dynamicTabData,
    isTerminalSelected = false,
    isOverviewSelected = false,
    isMonitoringDashBoardSelected = false,
}: GetTabsBasedOnRoleParamsType): InitTabType[] => {
    const clusterId = selectedCluster.value

    const tabs: InitTabType[] = [
        {
            id: ResourceBrowserTabsId.cluster_overview,
            name: AppDetailsTabs.cluster_overview,
            url: getURLBasedOnSidebarGVK(SIDEBAR_KEYS.overviewGVK.Kind, clusterId, namespace),
            isSelected: isOverviewSelected,
            showNameOnSelect: false,
            type: 'fixed',
        },
        {
            id: ResourceBrowserTabsId.k8s_Resources,
            name: AppDetailsTabs.k8s_Resources,
            url: getURLBasedOnSidebarGVK(SIDEBAR_KEYS.nodeGVK.Kind, clusterId, namespace),
            isSelected: !isTerminalSelected && !dynamicTabData && !isOverviewSelected && !isMonitoringDashBoardSelected,
            type: 'fixed',
            showNameOnSelect: false,
            dynamicTitle: SIDEBAR_KEYS.nodeGVK.Kind,
            shouldRemainMounted: true,
        },
        ...(getMonitoringDashboardTabConfig
            ? [
                  getMonitoringDashboardTabConfig(
                      getURLBasedOnSidebarGVK(SIDEBAR_KEYS.monitoringGVK.Kind, clusterId, namespace),
                      isMonitoringDashBoardSelected,
                      MONITORING_DASHBOARD_TAB_ID,
                  ),
              ]
            : []),
        {
            id: ResourceBrowserTabsId.terminal,
            name: AppDetailsTabs.terminal,
            url: `${URLS.RESOURCE_BROWSER}/${clusterId}/${namespace}/${AppDetailsTabs.terminal}/${K8S_EMPTY_GROUP}`,
            isSelected: isTerminalSelected,
            type: 'fixed',
            showNameOnSelect: true,
            isAlive: isTerminalSelected,
            dynamicTitle: `${AppDetailsTabs.terminal} '${selectedCluster.label}'`,
        },
        ...(dynamicTabData ? [dynamicTabData] : []),
    ]

    return tabs
}

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

export const getRenderNodeButton =
    (
        resourceData: K8sResourceDetailDataType,
        columnName: string,
        handleNodeClick: (e: React.MouseEvent<HTMLButtonElement>) => void,
    ) =>
    (children: React.ReactNode) => (
        <button
            type="button"
            className="dc__unset-button-styles dc__no-decor flex"
            data-name={resourceData[columnName]}
            onClick={handleNodeClick}
            aria-label={`Select ${resourceData[columnName]}`}
        >
            <span className="dc__link">{children}</span>
        </button>
    )

export const renderResourceValue = (value: string) => {
    const isDateValue = moment(value, 'YYYY-MM-DDTHH:mm:ssZ', true).isValid()

    return isDateValue ? moment(value).format(DATE_TIME_FORMAT_STRING) : value
}

/**
 * Provided a js object we will return a flattened object such that the nested
 * keys are all direct children created by joining each level using (.)
 *
 * Ex: given object = { x: 'a', y: { a: 'b' } } returns { x: 'a', 'y.a': b }
 *
 * @param ob any js object
 * @returns object without any nesting; nested keys will be
 */
const flattenObject = (ob: object): Record<string, any> => {
    const toReturn = {}

    Object.entries(ob).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            const flatObject = flattenObject(value)

            Object.entries(flatObject).forEach(([flatObjectKey, flatObjectValue]) => {
                toReturn[`${key}.${flatObjectKey}`] = flatObjectValue
            })
        } else {
            toReturn[key] = value
        }
    })

    return toReturn
}

// NOTE: Please understand the big comment on @flattenObject to understand this
export const parseNodeList = (response: ResponseType<NodeRowDetail[]>): ResponseType<K8sResourceDetailType> => ({
    ...response,
    result: {
        headers: [...NODE_LIST_HEADERS] as string[],
        data: response.result.map((data) => {
            const _flattenNodeData = flattenObject(data)
            const meta: Record<string, any> = {}

            if (data.errors) {
                meta.errorCount = String(Object.keys(data.errors).length || '')
            }

            meta.taintCount =
                Object.hasOwn(data, 'taints') && 'taints' in data ? String(Object.keys(data.taints).length || '') : ''

            return { ..._flattenNodeData, ...meta }
        }),
    },
})

export const getClusterChangeRedirectionUrl = (isInstallationCluster: boolean, clusterId: string) =>
    isInstallationCluster
        ? `${URLS.RESOURCE_BROWSER}/installation-cluster/${clusterId}`
        : `${URLS.RESOURCE_BROWSER}/${clusterId}/${
              ALL_NAMESPACE_OPTION.value
          }/${SIDEBAR_KEYS.nodeGVK.Kind.toLowerCase()}/${K8S_EMPTY_GROUP}`
