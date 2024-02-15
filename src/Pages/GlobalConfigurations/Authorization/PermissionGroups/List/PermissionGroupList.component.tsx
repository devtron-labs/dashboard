import React, { useMemo, useRef, useState } from 'react'
import {
    SortingOrder,
    useAsync,
    useUrlFilters,
    abortPreviousRequests,
    getIsRequestAborted,
    SelectAllDialogStatus,
    BulkSelectionProvider,
    BulkSelectionIdentifiersType,
} from '@devtron-labs/devtron-fe-common-lib'

import { getPermissionGroupList } from '../../authorization.service'
import { SortableKeys } from './constants'
import { PermissionGroup } from '../../types'
import PermissionGroupContainer from './PermissionGroupContainer'
import { BulkSelectionModalConfig, BulkSelectionModalTypes } from '../../shared/components/BulkSelection'

const PermissionGroupList = () => {
    const [bulkSelectionModalConfig, setBulkSelectionModalConfig] = useState<BulkSelectionModalConfig>({
        type: null,
    })
    const urlFilters = useUrlFilters<SortableKeys>({ initialSortKey: SortableKeys.name })
    const { pageSize, offset, searchKey, sortBy, sortOrder } = urlFilters
    const filterConfig = useMemo(
        () => ({
            size: pageSize,
            offset,
            searchKey,
            sortBy,
            sortOrder,
        }),
        [pageSize, offset, searchKey, sortBy, sortOrder],
    )
    const abortControllerRef = useRef(new AbortController())
    const [isLoading, result, error, reload] = useAsync(
        () =>
            abortPreviousRequests(
                () => getPermissionGroupList(filterConfig, abortControllerRef.current.signal),
                abortControllerRef,
            ),
        [filterConfig],
        true,
        {
            resetOnChange: false,
        },
    )
    const allOnThisPageIdentifiers = useMemo(
        () =>
            result?.permissionGroups.reduce((acc, group) => {
                acc[group.id] = true
                return acc
            }, {}) ?? {},
        [result],
    )

    const showLoadingState = isLoading || getIsRequestAborted(error)

    const getPermissionGroupDataForExport = () =>
        getPermissionGroupList({
            ...filterConfig,
            showAll: true,
            offset: null,
            size: null,
            sortBy: SortableKeys.name,
            sortOrder: SortingOrder.ASC,
        })

    const getSelectAllDialogStatus = () => {
        // Set to show the modal, the function is called only if there is an existing selection,
        // so the modal won't open if there is no selection
        setBulkSelectionModalConfig({
            type: BulkSelectionModalTypes.selectAllAcrossPages,
        })

        return SelectAllDialogStatus.OPEN
    }

    return (
        <BulkSelectionProvider<BulkSelectionIdentifiersType<Record<PermissionGroup['id'], boolean>>>
            identifiers={allOnThisPageIdentifiers}
            getSelectAllDialogStatus={getSelectAllDialogStatus}
        >
            <PermissionGroupContainer
                error={error}
                getPermissionGroupDataForExport={getPermissionGroupDataForExport}
                showLoadingState={showLoadingState}
                totalCount={result?.totalCount ?? 0}
                permissionGroups={result?.permissionGroups ?? []}
                refetchPermissionGroupList={reload}
                urlFilters={urlFilters}
                bulkSelectionModalConfig={bulkSelectionModalConfig}
                setBulkSelectionModalConfig={setBulkSelectionModalConfig}
            />
        </BulkSelectionProvider>
    )
}

export default PermissionGroupList
