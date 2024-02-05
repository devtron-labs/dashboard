import {
    BulkSelection,
    BulkSelectionEvents,
    CHECKBOX_VALUE,
    DEFAULT_BASE_PAGE_SIZE,
    ErrorScreenNotAuthorized,
    ERROR_EMPTY_SCREEN,
    Pagination,
    Reload,
    SELECT_ALL_ACROSS_PAGES_LOCATOR,
    SortableTableHeaderCell,
    TOAST_ACCESS_DENIED,
    useBulkSelection,
} from '@devtron-labs/devtron-fe-common-lib'
import React, { useRef } from 'react'
import { toast } from 'react-toastify'
import { importComponentFromFELibrary } from '../../../../../components/common'
import { API_STATUS_CODES } from '../../../../../config'
import FiltersEmptyState from '../../shared/components/FilterEmptyState/FilterEmptyState.component'
import { User } from '../../types'
import { SortableKeys, userListLoading } from './constants'
import NoUsers from './NoUsers'
import { UserPermissionTableProps } from './types'
import UserPermissionListHeader from './UserPermissionListHeader'
import UserPermissionRow from './UserPermissionRow'
import BulkSelectionActionWidget from './BulkSelectionActionWidget'

const StatusHeaderCell = importComponentFromFELibrary('StatusHeaderCell', null, 'function')

const UserPermissionTable = ({
    showStatus,
    error,
    getUserDataForExport,
    showLoadingState,
    totalCount,
    users,
    refetchUserPermissionList,
    urlFilters,
}: UserPermissionTableProps) => {
    const {
        sortBy,
        sortOrder,
        searchKey,
        handleSearch,
        handleSorting,
        offset,
        pageSize,
        changePage,
        changePageSize,
        clearFilters,
    } = urlFilters

    const draggableRef = useRef<HTMLDivElement>()
    const {
        handleBulkSelection,
        selectedIdentifiers: bulkSelectionState,
        isChecked,
        // TODO: try not to use
        checkboxValue,
    } = useBulkSelection<Record<User['id'], boolean>>()
    const usersToDeleteCount =
        checkboxValue === CHECKBOX_VALUE.BULK_CHECKED
            ? // TODO: Use constant and check how to exclude admin/system when filter is applied
              totalCount - 2
            : Object.keys(bulkSelectionState).filter(Boolean).length

    if (!showLoadingState) {
        if (error) {
            if (error.code === API_STATUS_CODES.PERMISSION_DENIED) {
                return (
                    <ErrorScreenNotAuthorized
                        subtitle={ERROR_EMPTY_SCREEN.REQUIRED_MANAGER_ACCESS}
                        title={TOAST_ACCESS_DENIED.TITLE}
                    />
                )
            }
            return <Reload reload={refetchUserPermissionList} className="flex-grow-1" />
        }

        // The null state is shown only when filters are not applied
        if (totalCount === 0 && !searchKey) {
            return <NoUsers />
        }
    }

    // Disable the filter actions
    const isActionsDisabled = showLoadingState || !(totalCount && users.length)

    const showPagination = totalCount > DEFAULT_BASE_PAGE_SIZE

    const sortByEmail = () => {
        handleSorting(SortableKeys.email)
    }

    const sortByLastLogin = () => {
        handleSorting(SortableKeys.lastLogin)
    }

    const toggleCheckForBulkSelection = (id: User['id']) => {
        if (checkboxValue === CHECKBOX_VALUE.BULK_CHECKED) {
            handleBulkSelection({
                action: BulkSelectionEvents.CLEAR_IDENTIFIERS_AFTER_ACROSS_SELECTION,
                data: {
                    identifierIds: [id],
                },
            })
            toast.info('All previous selections have been cleared')
            return
        }

        handleBulkSelection(
            bulkSelectionState[id]
                ? {
                      action: BulkSelectionEvents.CLEAR_IDENTIFIERS,
                      data: {
                          identifierIds: [id],
                      },
                  }
                : {
                      action: BulkSelectionEvents.SELECT_IDENTIFIER,
                      data: {
                          identifierObject: {
                              ...bulkSelectionState,
                              [id]: true,
                          },
                      },
                  },
        )
    }

    return (
        <div className="flexbox-col dc__gap-8 flex-grow-1" ref={draggableRef}>
            <UserPermissionListHeader
                disabled={isActionsDisabled}
                showStatus={showStatus}
                handleSearch={handleSearch}
                initialSearchText={searchKey}
                getDataToExport={getUserDataForExport}
            />
            {showLoadingState || (totalCount && users.length) ? (
                <div className="flexbox-col flex-grow-1 show-shimmer-loading">
                    <div
                        className={`user-permission__header ${
                            showStatus ? 'user-permission__header--with-status' : ''
                        } cn-7 fs-12 fw-6 lh-20 dc__uppercase pl-20 pr-20 dc__border-bottom dc__position-sticky dc__top-0 bcn-0 dc__zi-1`}
                    >
                        {showLoadingState ? (
                            <span className="child child-shimmer-loading" />
                        ) : (
                            <BulkSelection showPagination={showPagination} />
                        )}
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
                                } pl-20 pr-20`}
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
                                {users.map((user, index) => (
                                    <UserPermissionRow
                                        {...user}
                                        index={index}
                                        key={`user-${user.id}`}
                                        showStatus={showStatus}
                                        refetchUserPermissionList={refetchUserPermissionList}
                                        isChecked={
                                            bulkSelectionState[SELECT_ALL_ACROSS_PAGES_LOCATOR] ||
                                            bulkSelectionState[user.id]
                                        }
                                        toggleChecked={toggleCheckForBulkSelection}
                                        showCheckbox={isChecked}
                                    />
                                ))}
                            </div>
                            {showPagination && (
                                <Pagination
                                    rootClassName="flex dc__content-space pl-20 pr-20 dc__border-top"
                                    size={totalCount}
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
            {isChecked && (
                <BulkSelectionActionWidget
                    count={usersToDeleteCount}
                    parentRef={draggableRef}
                    showStatus={showStatus}
                    urlFilters={urlFilters}
                    refetchUserPermissionList={refetchUserPermissionList}
                />
            )}
        </div>
    )
}

export default UserPermissionTable
