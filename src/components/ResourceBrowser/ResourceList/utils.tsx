import { noop } from '@devtron-labs/devtron-fe-common-lib'
import {
    NODE_LIST_HEADERS,
    TARGET_K8S_VERSION_SEARCH_KEY,
    LOCAL_STORAGE_EXISTS,
    LOCAL_STORAGE_KEY_FOR_APPLIED_COLUMNS,
} from '../Constants'
import { ResourceListUrlFiltersType } from './types'

export const parseSearchParams = (searchParams: URLSearchParams) => ({
    targetK8sVersion: searchParams.get(TARGET_K8S_VERSION_SEARCH_KEY),
})

export const getAppliedColumnsFromLocalStorage = () => {
    if (!LOCAL_STORAGE_EXISTS) {
        return [...NODE_LIST_HEADERS]
    }

    try {
        const appliedColumns = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_FOR_APPLIED_COLUMNS))

        if (!Array.isArray(appliedColumns) || !appliedColumns.every((column) => typeof column === 'string')) {
            throw new Error()
        }

        return appliedColumns
    } catch {
        return [...NODE_LIST_HEADERS]
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
