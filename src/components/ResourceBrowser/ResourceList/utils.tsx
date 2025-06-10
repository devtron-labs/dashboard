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

import { ClusterDetail, logExceptionToSentry, noop } from '@devtron-labs/devtron-fe-common-lib'

import { sortObjectArrayAlphabetically } from '@Components/common'

import {
    LOCAL_STORAGE_EXISTS,
    LOCAL_STORAGE_KEY_FOR_APPLIED_COLUMNS,
    OPTIONAL_NODE_LIST_HEADERS,
    TARGET_K8S_VERSION_SEARCH_KEY,
} from '../Constants'
import { ClusterOptionType, K8SResourceListType, ResourceStatusFilter, ShowAIButtonConfig } from '../Types'
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

export const getResourceStatusType = (status: string): ResourceStatusFilter => {
    if (!status) {
        return null
    }

    let normalizedStatus = status.toLowerCase()

    if (normalizedStatus && /[:/ ]/.test(normalizedStatus)) {
        normalizedStatus = normalizedStatus.replace(/[:/ ]/g, '__')
    }

    if (normalizedStatus.match(/^init__/) && !normalizedStatus.match(/^init__crashloopbackoff/)) {
        return ResourceStatusFilter.PENDING
    }

    switch (normalizedStatus) {
        case 'healthy':
        case 'synced':
        case 'sync.ok':
        case 'running':
        case 'bound':
        case 'active':
        case 'ready':
        case 'created':
        case 'scalingreplicasetdown':
        case 'deployed':
            return ResourceStatusFilter.HEALTHY

        case 'completed':
        case 'complete':
            return ResourceStatusFilter.COMPLETED

        case 'starting':
        case 'initiating':
        case 'suspended':
        case 'switchedtoactiveservice':
        case 'containercreating':
        case 'pending':
        case 'podinitializing':
        case 'uninstalling':
        case 'pending-install':
        case 'pending-upgrade':
        case 'pending-rollback':
        case 'progressing': // added from progressing
        case 'inprogress':
        case 'initiated':
        case 'updated': // added from waiting
        case 'waiting':
            return ResourceStatusFilter.PENDING

        case 'degraded':
        case 'oomkilled':
        case 'sync.failed':
        case 'failed':
        case 'error':
        case 'imagepullbackoff':
        case 'errimagepull':
        case 'warning':
        case 'outofsync':
        case 'terminating':
        case 'crashloopbackoff':
        case 'init__crashloopbackoff':
        case 'createcontainerconfigerror':
        case 'deleted':
        case 'not__ready':
        case 'evicted':
        case 'disconnect':
        case 'syncfail':
        case 'superseded':
            return ResourceStatusFilter.ERROR

        default:
            return ResourceStatusFilter.UNKNOWN
    }
}
