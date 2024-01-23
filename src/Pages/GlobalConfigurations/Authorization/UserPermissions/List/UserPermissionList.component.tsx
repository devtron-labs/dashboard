import React, { useCallback, useMemo } from 'react'
import {
    ErrorScreenNotAuthorized,
    ERROR_EMPTY_SCREEN,
    Pagination,
    Reload,
    TOAST_ACCESS_DENIED,
    useAsync,
} from '@devtron-labs/devtron-fe-common-lib'
import { API_STATUS_CODES, DEFAULT_BASE_PAGE_SIZE, SortingOrder } from '../../../../../config'
import { ReactComponent as HelpOutlineIcon } from '../../../../../assets/icons/ic-help-outline.svg'

import { getUserList } from '../../authorization.service'
import { SortableKeys, userListLoading } from './constants'
import UserPermissionListHeader from './UserPermissionListHeader'
import UserPermissionRow from './UserPermissionRow'
import useUrlFilters from '../../shared/hooks/useUrlFilters'
import SortableTableHeaderCell from '../../../../../components/common/SortableTableHeaderCell'
import FiltersEmptyState from '../../shared/components/FilterEmptyState/FilterEmptyState.component'
import NoUsers from './NoUsers'

// TODO (v1): Replace with enterprise check
const showStatus = false

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

    // TODO (v1): Add abort controller
    const [isLoading, result, error, reload] = useAsync(() => getUserList(filterConfig), [filterConfig])

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

    if (!isLoading) {
        if (error) {
            if ([API_STATUS_CODES.PERMISSION_DENIED, API_STATUS_CODES.UNAUTHORIZED].includes(error.code)) {
                return (
                    <ErrorScreenNotAuthorized
                        subtitle={ERROR_EMPTY_SCREEN.REQUIRED_MANAGER_ACCESS}
                        title={TOAST_ACCESS_DENIED.TITLE}
                    />
                )
            }
            return <Reload reload={reload} />
        }

        // The null state is shown only when filters are not applied
        if (result.totalCount === 0 && !searchKey) {
            return <NoUsers />
        }
    }

    const sortByEmail = () => {
        handleSorting(SortableKeys.email)
    }

    const sortByLastLogin = () => {
        handleSorting(SortableKeys.lastLogin)
    }

    const handleClearFilters = () => {
        clearFilters()
    }

    return (
        <div className="flexbox-col dc__gap-8 flex-grow-1">
            <UserPermissionListHeader
                disabled={isLoading || !(result.totalCount && result.users.length)}
                showStatus={showStatus}
                handleSearch={handleSearch}
                initialSearchText={searchKey}
                getDataToExport={getUserDataForExport}
            />
            <div className="flexbox-col flex-grow-1">
                <div className="user-permission__header cn-7 fs-12 fw-6 lh-20 dc__uppercase pl-20 pr-20 dc__border-bottom">
                    <span />
                    <SortableTableHeaderCell
                        title="Email"
                        triggerSorting={sortByEmail}
                        isSorted={sortBy === SortableKeys.email}
                        sortOrder={sortOrder}
                        disabled={isLoading}
                    />
                    <SortableTableHeaderCell
                        title="Last Login"
                        triggerSorting={sortByLastLogin}
                        isSorted={sortBy === SortableKeys.lastLogin}
                        sortOrder={sortOrder}
                        disabled={isLoading}
                    />
                    {showStatus && (
                        <span className="flex dc__gap-4">
                            Status
                            <HelpOutlineIcon className="mw-16 icon-dim-16 fcn-6" />
                        </span>
                    )}
                    <span />
                </div>
                {isLoading || (result.totalCount && result.users.length) ? (
                    <>
                        {isLoading ? (
                            userListLoading.map((user) => (
                                <div
                                    className="user-permission__row pl-20 pr-20 show-shimmer-loading"
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
                                <div className="fs-13 fw-4 lh-20 cn-9 flex-grow-1">
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
                    </>
                ) : (
                    <FiltersEmptyState clearFilters={handleClearFilters} />
                )}
            </div>
        </div>
    )
}

export default UserPermissionList
