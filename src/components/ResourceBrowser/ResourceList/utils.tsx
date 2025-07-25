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

import {
    BaseRecentlyVisitedEntitiesTypes,
    ClusterDetail,
    DocLink,
    DocLinkProps,
    GVKType,
    logExceptionToSentry,
    numberComparatorBySortOrder,
    RecentlyVisitedGroupedOptionsType,
    RecentlyVisitedOptions,
    RESOURCE_BROWSER_ROUTES,
    stringComparatorBySortOrder,
    TreeHeading,
    TreeItem,
    TreeNode,
    versionComparatorBySortOrder,
} from '@devtron-labs/devtron-fe-common-lib'

import { AggregationKeys } from '@Components/app/types'
import { importComponentFromFELibrary, k8sStyledAgeToSeconds, sortObjectArrayAlphabetically } from '@Components/common'
import { UseTabsReturnType } from '@Components/common/DynamicTabs/types'

import {
    clusterOverviewNodeText,
    ERROR_SCREEN_LEARN_MORE,
    ERROR_SCREEN_SUBTITLE,
    K8S_EMPTY_GROUP,
    LEARN_MORE,
    NODE_K8S_VERSION_FILTER_KEY,
    NODE_SEARCH_KEYS_TO_OBJECT_KEYS,
    ResourceBrowserRouteToTabIdMap,
    SIDEBAR_KEYS,
    TARGET_K8S_VERSION_SEARCH_KEY,
    UPGRADE_CLUSTER_CONSTANTS,
} from '../Constants'
import {
    ClusterOptionType,
    K8SResourceListType,
    NODE_SEARCH_KEYS,
    NodeListSearchFilterType,
    RBResourceSidebarDataAttributeType,
    ShowAIButtonConfig,
} from '../Types'
import { convertResourceGroupListToK8sObjectList } from '../Utils'
import { K8sResourceListFilterType, NodeSearchListOptionType, ResourceListUrlFiltersType } from './types'

const getFilterOptionsFromSearchParams = importComponentFromFELibrary(
    'getFilterOptionsFromSearchParams',
    null,
    'function',
)

export const parseSearchParams = (searchParams: URLSearchParams) => ({
    targetK8sVersion: searchParams.get(TARGET_K8S_VERSION_SEARCH_KEY),
})

export const getUpgradeCompatibilityTippyConfig = ({
    targetK8sVersion,
}: Pick<ResourceListUrlFiltersType, 'targetK8sVersion'>) => ({
    title: 'Upgrade compatibility',
    descriptions: [
        {
            info: 'Target Version',
            value: `v${targetK8sVersion}`,
        },
    ],
})

// Note: this is a hack to handle the case where the event kind is not present in the resource group map
// This will break for the kind with multiple groups
export const getFirstResourceFromKindResourceMap = (
    lowercaseKindToResourceGroupMap: K8SResourceListType['lowercaseKindToResourceGroupMap'],
    kind: string,
) => {
    // Logging to sentry as kind is expected to be received
    if (!kind) {
        logExceptionToSentry('Kind is not present in the resource')
    }

    return Object.values(lowercaseKindToResourceGroupMap).find(
        (resourceGroup) => resourceGroup.gvk.Kind?.toLowerCase() === kind?.toLowerCase(),
    )
}

export const getClusterOptions = (clusterList: ClusterDetail[]): ClusterOptionType[] =>
    clusterList
        ? sortObjectArrayAlphabetically(clusterList, 'name')
              .filter(({ isVirtualCluster }) => !isVirtualCluster)
              .map(({ name, id, nodeErrors, isProd, installationId }) => ({
                  label: name,
                  value: String(id ?? '0'),
                  description: nodeErrors,
                  installationId,
                  isProd,
                  isClusterInCreationPhase: !!installationId && !id,
              }))
        : []

export const getShowAIButton = (aiButtonConfig: ShowAIButtonConfig, columnName: string, value: string) => {
    if (!aiButtonConfig || columnName !== aiButtonConfig.column) {
        return false
    }
    if (aiButtonConfig.includeValues) {
        return aiButtonConfig.includeValues.has(value)
    }
    return !aiButtonConfig.excludeValues.has(value)
}

export const unauthorizedInfoText = (nodeType?: string) => {
    const emptyStateData = {
        text: ERROR_SCREEN_SUBTITLE,
        link: 'K8S_RESOURCES_PERMISSIONS' as DocLinkProps['docLinkKey'],
        linkText: ERROR_SCREEN_LEARN_MORE,
    }

    if (nodeType === SIDEBAR_KEYS.overviewGVK.Kind.toLowerCase()) {
        emptyStateData.text = clusterOverviewNodeText(true)
        emptyStateData.link = 'GLOBAL_CONFIG_PERMISSION'
        emptyStateData.linkText = LEARN_MORE
    } else if (nodeType === SIDEBAR_KEYS.nodeGVK.Kind.toLowerCase()) {
        emptyStateData.text = clusterOverviewNodeText(false)
        emptyStateData.link = 'GLOBAL_CONFIG_PERMISSION'
        emptyStateData.linkText = LEARN_MORE
    }

    return (
        <>
            {emptyStateData.text}&nbsp;
            <DocLink
                dataTestId="rb-permission-error-documentation"
                docLinkKey={emptyStateData.link}
                text={emptyStateData.linkText}
                fontWeight="normal"
            />
        </>
    )
}

export const getOptionsValue = (option: ClusterOptionType, isInstallationStatusView: boolean) =>
    // NOTE: all the options with value equal to that of the selected option will be highlighted
    // therefore, since installed clusters that are in creation phase have value = '0', we need to instead
    // get its value as installationId. Prefixing it with installation- to avoid collision with normal clusters have same value of
    // clusterId as this installationId
    isInstallationStatusView ? `installation-${String(option.installationId)}` : option.value

const getAllCluster = ({ clusterList, isInstallationStatusView }) => ({
    label: 'All Clusters',
    options: clusterList?.map((option) => ({
        ...option,
        value: +getOptionsValue(option, isInstallationStatusView),
    })) as RecentlyVisitedOptions[],
})

export const getClusterSelectOptions = (
    clusterList,
    recentlyVisitedResources,
    isInstallationStatusView,
): RecentlyVisitedGroupedOptionsType[] =>
    recentlyVisitedResources?.length
        ? [
              {
                  label: 'Recently Visited',
                  options: recentlyVisitedResources.map((cluster: BaseRecentlyVisitedEntitiesTypes) => ({
                      label: cluster.name,
                      value: cluster.id,
                      isRecentlyVisited: true,
                  })) as RecentlyVisitedOptions[],
              },
              getAllCluster({ clusterList, isInstallationStatusView }),
          ]
        : [getAllCluster({ clusterList, isInstallationStatusView })]
export const parseK8sResourceListSearchParams = (searchParams: URLSearchParams): K8sResourceListFilterType => {
    const namespace = searchParams.get('namespace')
    const eventType = searchParams.get('eventType')

    return {
        ...(namespace ? { selectedNamespace: namespace } : {}),
        ...(getFilterOptionsFromSearchParams ? getFilterOptionsFromSearchParams(searchParams) : {}),
        ...Object.values(NODE_SEARCH_KEYS).reduce((acc, key) => {
            const value = searchParams.get(key)
            if (value) {
                acc[key] = value
            }
            return acc
        }, {}),
        ...(searchParams.get(NODE_K8S_VERSION_FILTER_KEY)
            ? { [NODE_K8S_VERSION_FILTER_KEY]: searchParams.get(NODE_K8S_VERSION_FILTER_KEY) }
            : {}),
        ...(eventType ? { eventType } : {}),
    }
}

const numberInStringComparator = <T extends string>(a: T, b: T) =>
    numberComparatorBySortOrder(a ? parseInt(a.match(/^\d+/)[0], 10) : 0, b ? parseInt(b.match(/^\d+/)[0], 10) : 0)

const durationComparator = <T extends string>(a: T, b: T) => k8sStyledAgeToSeconds(a) - k8sStyledAgeToSeconds(b)

const propertyComparatorMap = {
    age: durationComparator,
    duration: durationComparator,
    'last schedule': durationComparator,
    'last seen': durationComparator,
    capacity: numberInStringComparator,
    cpu: numberInStringComparator,
    memory: numberInStringComparator,
    window: durationComparator,
    errors: numberInStringComparator,
    'k8s version': versionComparatorBySortOrder,
    taints: numberInStringComparator,
    'cpu usage (%)': numberInStringComparator,
    'cpu allocatable': numberInStringComparator,
    'mem usage (%)': numberInStringComparator,
    'mem allocatable': numberInStringComparator,
    'cpu usage (absolute)': numberInStringComparator,
    restarts: numberInStringComparator,
}

/**
 * Dynamically sorts an array of objects based on a specified property and sorting order.
 * @param  property - The property by which to sort the objects.
 * @param  sortOrder - The sorting order ('ASC' for ascending, 'DESC' for descending).
 * @returns A sorting function.
 */
export const dynamicSort = (property: string) => (valueA: unknown, valueB: unknown) => {
    // Special cases handling where the property is not in sortable format.
    if (Object.keys(propertyComparatorMap).includes(property)) {
        return propertyComparatorMap[property](valueA, valueB)
    }

    // Handling of numbers and if one property is number and the other is string.
    if (typeof valueA === 'number' || typeof valueB === 'number') {
        return numberComparatorBySortOrder(
            typeof valueA === 'number' ? valueA : 0,
            typeof valueB === 'number' ? valueB : 0,
        )
    }

    // Handling of strings and numbers in string type.
    if (typeof valueA === 'string' && typeof valueB === 'string') {
        if (!Number.isNaN(Number(valueA)) && !Number.isNaN(Number(valueB))) {
            return numberComparatorBySortOrder(Number(valueA), Number(valueB))
        }
        return stringComparatorBySortOrder(valueA, valueB)
    }

    return 0
}

export const isItemASearchMatchForNodeListing = (item: Record<string, any>, searchParams: Record<string, any>) => {
    const isK8sVersionFilterAppliedAndMatchFound =
        !searchParams[NODE_K8S_VERSION_FILTER_KEY] ||
        searchParams[NODE_K8S_VERSION_FILTER_KEY].includes(item[NODE_K8S_VERSION_FILTER_KEY])

    if (!isK8sVersionFilterAppliedAndMatchFound) {
        return false
    }

    const doesAnyNodeSearchKeyExists = Object.values(NODE_SEARCH_KEYS).some((key) => Object.hasOwn(searchParams, key))

    const doesItemHaveAnyMatchingSearchKey =
        !doesAnyNodeSearchKeyExists ||
        Object.values(NODE_SEARCH_KEYS).reduce((isFound, searchKey) => {
            if (!searchParams[searchKey]) {
                return isFound
            }

            const searchTextFromSearchKey = searchParams[searchKey]

            return !!searchTextFromSearchKey?.split(',').some((text) => {
                const trimmedText = text.trim()
                const objectKey = NODE_SEARCH_KEYS_TO_OBJECT_KEYS[searchKey]

                // NOTE: if corresponding value in data is anything other than primitives like string, or number
                // handle it appropriately likewise
                if (searchKey === NODE_SEARCH_KEYS.LABEL) {
                    const [searchKeyFromLabelText, searchValueFromLabelText] = trimmedText.split('=')

                    return (
                        !!item[objectKey]?.some(
                            ({ key, value }) => key === searchKeyFromLabelText && value === searchValueFromLabelText,
                        ) && isFound
                    )
                }

                return String(item[objectKey] ?? '').includes(trimmedText) && isFound
            })
        }, true)

    return isK8sVersionFilterAppliedAndMatchFound && doesItemHaveAnyMatchingSearchKey
}

export const getClassNameForColumn = (name: string, isNodeUnschedulable: boolean) => {
    if (name === 'message') {
        return 'dc__word-break'
    }

    return name === 'status' && isNodeUnschedulable ? 'dc__no-shrink' : 'dc__truncate'
}

export const getStatusClass = (status: string, isNodeListing: boolean) => {
    let statusPostfix = status?.toLowerCase()

    if (statusPostfix && (statusPostfix.includes(':') || statusPostfix.includes('/') || statusPostfix.includes(' '))) {
        statusPostfix = statusPostfix.replace(':', '__').replace('/', '__').replace(' ', '__')
    }

    return `f-${statusPostfix} ${isNodeListing ? 'dc__capitalize' : ''}`
}

export const getColumnSize = (field: string, isEventListing: boolean) => {
    if (!isEventListing) {
        return {
            range: {
                maxWidth: 600,
                minWidth: field === 'name' ? 200 : 120,
                startWidth: field === 'name' ? 300 : 200,
            },
        }
    }

    switch (field) {
        case 'message':
            return {
                range: {
                    maxWidth: 800,
                    minWidth: 180,
                    startWidth: 460,
                },
            }
        case 'type':
            return { fixed: 20 }
        case 'namespace':
        case 'involved object':
        case 'source':
            return {
                range: {
                    maxWidth: 600,
                    minWidth: 80,
                    startWidth: 140,
                },
            }
        case 'explainButton':
            return { fixed: 80 }
        default:
            return {
                range: {
                    maxWidth: 300,
                    minWidth: 80,
                    startWidth: 100,
                },
            }
    }
}

export const getColumnComparator = (field: string, isEventListing: boolean) =>
    field === 'message' && isEventListing ? null : dynamicSort(field)

export const getTabIdParamsForPath = (
    path: string,
    params: Record<string, string>,
): Parameters<UseTabsReturnType['getTabId']> => {
    if (path === RESOURCE_BROWSER_ROUTES.CLUSTER_UPGRADE) {
        return [
            UPGRADE_CLUSTER_CONSTANTS.ID_PREFIX,
            UPGRADE_CLUSTER_CONSTANTS.NAME,
            SIDEBAR_KEYS.upgradeClusterGVK.Kind.toLowerCase(),
        ]
    }

    if (path === RESOURCE_BROWSER_ROUTES.NODE_DETAIL) {
        const { name } = params
        return [K8S_EMPTY_GROUP, name, 'node']
    }

    if (path === RESOURCE_BROWSER_ROUTES.K8S_RESOURCE_DETAIL) {
        const { version, kind, group, name, namespace } = params
        const ID_PREFIX = `${group}-${version}-${namespace}`
        return [ID_PREFIX, name, kind]
    }

    logExceptionToSentry(`Unknown path: ${path}`)
    return null
}

export const getTabIdForTab = (
    path: string,
    getTabId: UseTabsReturnType['getTabId'],
    params: Record<string, string>,
) => {
    if (ResourceBrowserRouteToTabIdMap[path]) {
        return ResourceBrowserRouteToTabIdMap[path]
    }

    const functionParams = getTabIdParamsForPath(path, params)
    return functionParams ? getTabId(...functionParams) : null
}

export const getRBSidebarTreeViewNodeId = ({ Group, Version, Kind }: GVKType) =>
    `${Group.toLowerCase()}-${Version.toLowerCase()}-${Kind.toLowerCase()}`

const getRBSidebarTreeViewNodeDataAttributes = ({
    Group,
    Version,
    Kind,
}: GVKType): RBResourceSidebarDataAttributeType => ({
    'data-group': Group.toLowerCase(),
    'data-version': Version.toLowerCase(),
    'data-kind': Kind.toLowerCase(),
})

export const getRBSidebarTreeViewNodes = (list: ReturnType<typeof convertResourceGroupListToK8sObjectList>) => {
    const fixedNodes: TreeNode<RBResourceSidebarDataAttributeType>[] = (
        [
            !!list?.size &&
                !!list.get(AggregationKeys.Nodes) && {
                    type: 'item',
                    title: SIDEBAR_KEYS.nodes,
                    id: getRBSidebarTreeViewNodeId(SIDEBAR_KEYS.nodeGVK),
                    dataAttributes: getRBSidebarTreeViewNodeDataAttributes(SIDEBAR_KEYS.nodeGVK),
                },

            !!list?.size &&
                !!list.get(AggregationKeys.Events) && {
                    type: 'item',
                    title: SIDEBAR_KEYS.events,
                    id: getRBSidebarTreeViewNodeId(SIDEBAR_KEYS.eventGVK),
                    dataAttributes: getRBSidebarTreeViewNodeDataAttributes(SIDEBAR_KEYS.eventGVK),
                },

            !!list?.size &&
                !!list.get(AggregationKeys.Namespaces) && {
                    type: 'item',
                    title: SIDEBAR_KEYS.namespaces,
                    id: getRBSidebarTreeViewNodeId(SIDEBAR_KEYS.namespaceGVK),
                    dataAttributes: getRBSidebarTreeViewNodeDataAttributes(SIDEBAR_KEYS.namespaceGVK),
                },
        ] satisfies TreeNode<RBResourceSidebarDataAttributeType>[]
    ).filter(Boolean)

    const dynamicNodesList = list?.size
        ? [...list.values()].filter(
              (k8sObject) =>
                  !(
                      k8sObject.name === AggregationKeys.Events ||
                      k8sObject.name === AggregationKeys.Namespaces ||
                      k8sObject.name === AggregationKeys.Nodes
                  ),
          )
        : []

    const dynamicNodes = dynamicNodesList.map<TreeHeading<RBResourceSidebarDataAttributeType>>((k8sObject) => ({
        id: `${k8sObject.name}-parent`,
        type: 'heading',
        title: k8sObject.name,
        items: [...k8sObject.child.entries()]
            .filter(([key]) => {
                const keyLowerCased = key.toLowerCase()
                return !(
                    keyLowerCased === 'node' ||
                    keyLowerCased === SIDEBAR_KEYS.namespaceGVK.Kind.toLowerCase() ||
                    keyLowerCased === SIDEBAR_KEYS.eventGVK.Kind.toLowerCase()
                )
            })
            .map<TreeNode<RBResourceSidebarDataAttributeType>>(([key, value]) => {
                if (value.data.length === 1) {
                    const childData = value.data[0]
                    const nodeName = childData.gvk.Kind
                    return {
                        type: 'item',
                        title: nodeName,
                        id: getRBSidebarTreeViewNodeId(childData.gvk),
                        dataAttributes: getRBSidebarTreeViewNodeDataAttributes(childData.gvk),
                    } satisfies TreeItem<RBResourceSidebarDataAttributeType>
                }

                return {
                    type: 'heading',
                    id: `${k8sObject.name}/${key}-child`,
                    title: key,
                    dataAttributes: null,
                    items: value.data.map<TreeItem<RBResourceSidebarDataAttributeType>>((childData) => {
                        const nodeName = childData.gvk.Group ? childData.gvk.Group : childData.gvk.Kind

                        return {
                            type: 'item',
                            title: nodeName,
                            id: getRBSidebarTreeViewNodeId(childData.gvk),
                            dataAttributes: getRBSidebarTreeViewNodeDataAttributes(childData.gvk),
                        }
                    }),
                } satisfies TreeHeading<RBResourceSidebarDataAttributeType>
            }),
    }))

    return fixedNodes.concat(dynamicNodes)
}

export const getNodeSearchKeysOptionsList = (rows: NodeListSearchFilterType['rows']) => {
    const { labels, nodeGroups } = (rows || []).reduce<{
        labels: Map<string, NodeSearchListOptionType>
        nodeGroups: Map<string, NodeSearchListOptionType>
    }>(
        (acc, curr) => {
            ;(curr.data.labels as { key: string; value: string }[]).forEach(({ key, value }) => {
                if (!acc.labels.has(`${key}/${value}`)) {
                    acc.labels.set(`${key}/${value}`, {
                        label: `${key}=${value}`,
                        value: `${key}=${value}`,
                        identifier: NODE_SEARCH_KEYS.LABEL,
                    })
                }
            })

            if (!acc.nodeGroups.has(curr.data.nodeGroup as string)) {
                acc.nodeGroups.set(curr.data.nodeGroup as string, {
                    label: curr.data.nodeGroup,
                    value: curr.data.nodeGroup as string,
                    identifier: NODE_SEARCH_KEYS.NODE_GROUP,
                })
            }

            return acc
        },
        { labels: new Map(), nodeGroups: new Map() },
    )

    return {
        labels: Array.from(labels)
            .map(([, value]) => value)
            .sort((a, b) => stringComparatorBySortOrder(a.label as string, b.label as string)),
        nodeGroups: Array.from(nodeGroups)
            .map(([, value]) => value)
            .sort((a, b) => stringComparatorBySortOrder(a.label as string, b.label as string)),
    }
}
