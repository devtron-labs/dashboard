import { logExceptionToSentry, noop } from '@devtron-labs/devtron-fe-common-lib'
import {
    TARGET_K8S_VERSION_SEARCH_KEY,
    LOCAL_STORAGE_EXISTS,
    LOCAL_STORAGE_KEY_FOR_APPLIED_COLUMNS,
    OPTIONAL_NODE_LIST_HEADERS,
} from '../Constants'
import { ResourceListUrlFiltersType } from './types'
import { K8SResourceListType } from '../Types'

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
