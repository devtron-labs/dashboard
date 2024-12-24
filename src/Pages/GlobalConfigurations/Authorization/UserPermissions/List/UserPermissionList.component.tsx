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

import { useMemo, useRef, useState } from 'react'
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
    UserListSortableKeys,
} from '@devtron-labs/devtron-fe-common-lib'

import { getUserList } from '../../authorization.service'
import { importComponentFromFELibrary } from '../../../../../components/common'
import { User } from '../../types'
import { getIsAdminOrSystemUser, parseSearchParams } from '../utils'
import UserPermissionContainer from './UserPermissionContainer'
import { BulkSelectionModalConfig, BulkSelectionModalTypes } from '../../Shared/components/BulkSelection'
import { UserListFilter, UserPermissionContainerProps } from './types'

const StatusHeaderCell = importComponentFromFELibrary('StatusHeaderCell', null, 'function')
const getUserTypeToFetchFromSelectedConfigOptions = importComponentFromFELibrary(
    'getUserTypeToFetchFromSelectedConfigOptions',
    null,
    'function',
)

const showStatus = !!StatusHeaderCell

const UserPermissionList = () => {
    const [bulkSelectionModalConfig, setBulkSelectionModalConfig] = useState<BulkSelectionModalConfig>({
        type: null,
    })

    const { status, ...urlFilters } = useUrlFilters<UserListSortableKeys, UserListFilter>({
        initialSortKey: UserListSortableKeys.email,
        parseSearchParams,
    })

    const updateStatusFilter = (_status: UserStatus[]) => {
        urlFilters.updateSearchParams({
            status: _status,
        })
    }

    const _urlFilters = {
        ...urlFilters,
        status,
        updateStatusFilter,
    }

    const { pageSize, offset, searchKey, sortBy, sortOrder } = _urlFilters
    const filterConfig = useMemo(
        () => ({
            size: pageSize,
            offset,
            searchKey,
            sortBy,
            sortOrder,
            status,
        }),
        // Using stringify as the status is a array to avoid infinite re-renders
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

    const getUserDataForExport: UserPermissionContainerProps['getUserDataForExport'] = (selectedConfig) =>
        getUserList({
            ...filterConfig,
            showAll: true,
            offset: null,
            size: null,
            sortBy: UserListSortableKeys.email,
            sortOrder: SortingOrder.ASC,
            ...(getUserTypeToFetchFromSelectedConfigOptions && {
                typeToFetch: getUserTypeToFetchFromSelectedConfigOptions(selectedConfig),
            }),
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
                totalCount={result?.totalCount ?? 0}
                users={result?.users ?? []}
                refetchUserPermissionList={reload}
                urlFilters={_urlFilters}
                bulkSelectionModalConfig={bulkSelectionModalConfig}
                setBulkSelectionModalConfig={setBulkSelectionModalConfig}
            />
        </BulkSelectionProvider>
    )
}

export default UserPermissionList
