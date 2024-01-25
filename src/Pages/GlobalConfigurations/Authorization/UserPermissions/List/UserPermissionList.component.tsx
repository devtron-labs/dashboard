import React, { useCallback, useMemo, useRef } from 'react'
import {
    SortingOrder,
    SortableTableHeaderCell,
    ErrorScreenNotAuthorized,
    ERROR_EMPTY_SCREEN,
    Pagination,
    Reload,
    TOAST_ACCESS_DENIED,
    useAsync,
    DEFAULT_BASE_PAGE_SIZE,
    useUrlFilters,
} from '@devtron-labs/devtron-fe-common-lib'
import { API_STATUS_CODES } from '../../../../../config'

import { getUserList } from '../../authorization.service'
import { SortableKeys, userListLoading } from './constants'
import UserPermissionListHeader from './UserPermissionListHeader'
import UserPermissionRow from './UserPermissionRow'
import FiltersEmptyState from '../../shared/components/FilterEmptyState/FilterEmptyState.component'
import NoUsers from './NoUsers'
import { importComponentFromFELibrary } from '../../../../../components/common'
import { abortPreviousRequests, getIsRequestAborted } from '../../utils'

const StatusHeaderCell = importComponentFromFELibrary('StatusHeaderCell', null, 'function')

const showStatus = !!StatusHeaderCell

const UserPermissionList = () => {
    const {
        pageSize,
        offset,
        changePage,
        changePageSize,
        searchKey,
        handleSearch,
        sortBy,
        handleSorting,
        sortOrder,
        clearFilters,
    } = useUrlFilters<SortableKeys>({ initialSortKey: SortableKeys.email })
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

    const showLoadingState = isLoading || getIsRequestAborted(error)

    const getUserDataForExport = useCallback(
        () =>
            getUserList({
                ...filterConfig,
                showAll: true,
                offset: null,
                size: null,
                sortBy: SortableKeys.email,
                sortOrder: SortingOrder.ASC,
            }),
        [filterConfig],
    )

    if (!showLoadingState) {
        if (error) {
            if ([API_STATUS_CODES.PERMISSION_DENIED, API_STATUS_CODES.UNAUTHORIZED].includes(error.code)) {
                return (
                    <ErrorScreenNotAuthorized
                        subtitle={ERROR_EMPTY_SCREEN.REQUIRED_MANAGER_ACCESS}
                        title={TOAST_ACCESS_DENIED.TITLE}
                    />
                )
            }
            return <Reload reload={reload} className="flex-grow-1" />
        }

        // The null state is shown only when filters are not applied
        if (result.totalCount === 0 && !searchKey) {
            return <NoUsers />
        }
    }

    // Disable the filter actions
    const isActionsDisabled = showLoadingState || !(result.totalCount && result.users.length)

    const sortByEmail = () => {
        handleSorting(SortableKeys.email)
    }

    const sortByLastLogin = () => {
        handleSorting(SortableKeys.lastLogin)
    }

    return (
        <div className="flexbox-col dc__gap-8 flex-grow-1">
            <UserPermissionListHeader
                disabled={isActionsDisabled}
                showStatus={showStatus}
                handleSearch={handleSearch}
                initialSearchText={searchKey}
                getDataToExport={getUserDataForExport}
            />
            {showLoadingState || (result.totalCount && result.users.length) ? (
                <div className="flexbox-col flex-grow-1">
                    <div
                        className={`user-permission__header ${
                            showStatus ? 'user-permission__header--with-status' : ''
                        } cn-7 fs-12 fw-6 lh-20 dc__uppercase pl-20 pr-20 dc__border-bottom`}
                    >
                        <span />
                        <SortableTableHeaderCell
                            title="Email"
                            triggerSorting={sortByEmail}
                            isSorted={sortBy === SortableKeys.email}
                            sortOrder={sortOrder}
                            disabled={isActionsDisabled}
                        />
                        <SortableTableHeaderCell
                            title="Last Login"
                            triggerSorting={sortByLastLogin}
                            isSorted={sortBy === SortableKeys.lastLogin}
                            sortOrder={sortOrder}
                            disabled={isActionsDisabled}
                        />
                        {showStatus && <StatusHeaderCell />}
                        <span />
                    </div>
                    {showLoadingState ? (
                        userListLoading.map((user) => (
                            <div
                                className={`user-permission__row ${
                                    showStatus ? 'user-permission__row--with-status' : ''
                                } pl-20 pr-20 show-shimmer-loading`}
                                key={`user-list-${user.id}`}
                            >
                                <span className="child child-shimmer-loading" />
                                <span className="child child-shimmer-loading" />
                                <span className="child child-shimmer-loading" />
                                {showStatus && <span className="child child-shimmer-loading" />}
                            </div>
                        ))
                    ) : (
                        <>
                            <div className="fs-13 fw-4 lh-20 cn-9 flex-grow-1" id="user-permissions-list">
                                {result.users.map((user, index) => (
                                    <UserPermissionRow
                                        {...user}
                                        index={index}
                                        key={`user-${user.id}`}
                                        showStatus={showStatus}
                                        refetchUserPermissionList={reload}
                                    />
                                ))}
                            </div>
                            {result.totalCount > DEFAULT_BASE_PAGE_SIZE && (
                                <Pagination
                                    rootClassName="flex dc__content-space pl-20 pr-20 dc__border-top"
                                    size={result.totalCount}
                                    offset={offset}
                                    pageSize={pageSize}
                                    changePage={changePage}
                                    changePageSize={changePageSize}
                                />
                            )}
                        </>
                    )}
                </div>
            ) : (
                <FiltersEmptyState clearFilters={clearFilters} />
            )}
        </div>
    )
}

export default UserPermissionList
