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
    logExceptionToSentry,
    noop,
    RecentlyVisitedGroupedOptionsType,
    RecentlyVisitedOptions,
} from '@devtron-labs/devtron-fe-common-lib'

import { sortObjectArrayAlphabetically } from '@Components/common'

import {
    clusterOverviewNodeText,
    ERROR_SCREEN_LEARN_MORE,
    ERROR_SCREEN_SUBTITLE,
    LEARN_MORE,
    LOCAL_STORAGE_EXISTS,
    LOCAL_STORAGE_KEY_FOR_APPLIED_COLUMNS,
    OPTIONAL_NODE_LIST_HEADERS,
    SIDEBAR_KEYS,
    TARGET_K8S_VERSION_SEARCH_KEY,
} from '../Constants'
import { ClusterOptionType, K8SResourceListType, ShowAIButtonConfig } from '../Types'
import { ResourceListUrlFiltersType } from './types'

export const parseSearchParams = (searchParams: URLSearchParams) => ({
    targetK8sVersion: searchParams.get(TARGET_K8S_VERSION_SEARCH_KEY),
})

export const getAppliedColumnsFromLocalStorage = () => {
    if (!LOCAL_STORAGE_EXISTS) {
        // NOTE: show all headers by default
        return [...OPTIONAL_NODE_LIST_HEADERS]
    }

    try {
        const appliedColumns = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_FOR_APPLIED_COLUMNS))

        if (!Array.isArray(appliedColumns) || !appliedColumns.every((column) => typeof column === 'string')) {
            throw new Error()
        }

        return appliedColumns
    } catch {
        // NOTE: show all headers by default
        return [...OPTIONAL_NODE_LIST_HEADERS]
    }
}

export const saveAppliedColumnsInLocalStorage = (appliedColumns: string[]) => {
    if (!LOCAL_STORAGE_EXISTS || !Array.isArray(appliedColumns)) {
        return
    }

    try {
        localStorage.setItem(LOCAL_STORAGE_KEY_FOR_APPLIED_COLUMNS, JSON.stringify(appliedColumns))
    } catch {
        noop()
    }
}

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
