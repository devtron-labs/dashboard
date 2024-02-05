import React, { useMemo, useRef } from 'react'
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

import { getUserList } from '../../authorization.service'
import { SortableKeys } from './constants'
import { importComponentFromFELibrary } from '../../../../../components/common'
import { User } from '../../types'
import { getIsAdminOrSystemUser } from '../utils'
import UserPermissionTable from './UserPermissionTable'

const StatusHeaderCell = importComponentFromFELibrary('StatusHeaderCell', null, 'function')

const showStatus = !!StatusHeaderCell

const UserPermissionList = () => {
    const urlFilters = useUrlFilters<SortableKeys>({
        initialSortKey: SortableKeys.email,
    })
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
                () => getUserList(filterConfig, abortControllerRef.current.signal),
                abortControllerRef,
            ),
        [filterConfig],
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

    return (
        <BulkSelectionProvider<BulkSelectionIdentifiersType<Record<User['id'], boolean>>>
            identifiers={allOnThisPageIdentifiers}
            getSelectAllDialogStatus={() => SelectAllDialogStatus.CLOSED}
        >
            <UserPermissionTable
                showStatus={showStatus}
                error={error}
                getUserDataForExport={getUserDataForExport}
                showLoadingState={showLoadingState}
                totalCount={result?.totalCount}
                users={result?.users ?? []}
                refetchUserPermissionList={reload}
                urlFilters={urlFilters}
            />
        </BulkSelectionProvider>
    )
}

export default UserPermissionList
