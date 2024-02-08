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
    UserStatus,
} from '@devtron-labs/devtron-fe-common-lib'

import { getUserList } from '../../authorization.service'
import { SortableKeys } from './constants'
import { importComponentFromFELibrary } from '../../../../../components/common'
import { User } from '../../types'
import { getIsAdminOrSystemUser } from '../utils'
import UserPermissionContainer from './UserPermissionContainer'
import { BulkSelectionModalConfig, BulkSelectionModalTypes } from '../../shared/components/BulkSelection'
import useSearchParams from '../../shared/components/useSearchParams/useSearchParams'

const StatusHeaderCell = importComponentFromFELibrary('StatusHeaderCell', null, 'function')

const showStatus = !!StatusHeaderCell

interface SearchParams {
    status: UserStatus[]
}

const parseSearchParams = (searchParams: URLSearchParams): SearchParams => ({
    status: searchParams
        .getAll('status')
        .filter((status) =>
            [UserStatus.active, UserStatus.inactive, UserStatus.temporary].includes(status as UserStatus),
        ) as UserStatus[],
})

const UserPermissionList = () => {
    const [bulkSelectionModalConfig, setBulkSelectionModalConfig] = useState<BulkSelectionModalConfig>({
        type: null,
    })
    const {
        params: { status },
        updateSearchParams,
    } = useSearchParams<SearchParams>({
        parseSearchParams,
    })

    const _urlFilters = useUrlFilters<SortableKeys>({
        initialSortKey: SortableKeys.email,
    })

    const updateStatuses = (statuses: UserStatus[]) => {
        updateSearchParams({
            status: statuses,
            pageNumber: 1,
        } as SearchParams)
        // TODO (v2): We cannot do this since the search params won't change
        // _urlFilters.changePage(1)
    }

    const clearFilters = () => {
        _urlFilters.clearFilters()
        updateSearchParams({} as SearchParams, { overrideExisting: true })
    }

    const urlFilters = { ..._urlFilters, statuses: status, updateStatuses, clearFilters }
    const { pageSize, offset, searchKey, sortBy, sortOrder } = urlFilters
    const filterConfig = useMemo(
        () => ({
            size: pageSize,
            offset,
            searchKey,
            sortBy,
            sortOrder,
            status,
        }),
        [pageSize, offset, searchKey, sortBy, sortOrder, JSON.stringify(status)],
    )

    const abortControllerRef = useRef(new AbortController())
    const [isLoading, result, error, reload] = useAsync(
        () =>
            abortPreviousRequests(
                () => getUserList(filterConfig, abortControllerRef.current.signal),
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
            result?.users.reduce((acc, user) => {
                if (!getIsAdminOrSystemUser(user.emailId)) {
                    acc[user.id] = true
                }
                return acc
            }, {}) ?? {},
        [result],
    )

    const showLoadingState = isLoading || getIsRequestAborted(error)

    const getUserDataForExport = () =>
        getUserList({
            ...filterConfig,
            showAll: true,
            offset: null,
            size: null,
            sortBy: SortableKeys.email,
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
        <BulkSelectionProvider<BulkSelectionIdentifiersType<Record<User['id'], boolean>>>
            identifiers={allOnThisPageIdentifiers}
            getSelectAllDialogStatus={getSelectAllDialogStatus}
        >
            <UserPermissionContainer
                showStatus={showStatus}
                error={error}
                getUserDataForExport={getUserDataForExport}
                showLoadingState={showLoadingState}
                totalCount={result?.totalCount}
                users={result?.users ?? []}
                refetchUserPermissionList={reload}
                urlFilters={urlFilters}
                bulkSelectionModalConfig={bulkSelectionModalConfig}
                setBulkSelectionModalConfig={setBulkSelectionModalConfig}
            />
        </BulkSelectionProvider>
    )
}

export default UserPermissionList
