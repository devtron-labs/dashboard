import React, { useCallback, useMemo, useRef } from 'react'
import {
    SortingOrder,
    SortableTableHeaderCell,
    ErrorScreenNotAuthorized,
    ERROR_EMPTY_SCREEN,
    noop,
    Pagination,
    Reload,
    TOAST_ACCESS_DENIED,
    useAsync,
    DEFAULT_BASE_PAGE_SIZE,
    useUrlFilters,
    abortPreviousRequests,
    getIsRequestAborted,
} from '@devtron-labs/devtron-fe-common-lib'
import { API_STATUS_CODES } from '../../../../../config'

import { getPermissionGroupList } from '../../authorization.service'
import { permissionGroupLoading, SortableKeys } from './constants'
import PermissionGroupListHeader from './PermissionGroupListHeader'
import PermissionGroupRow from './PermissionGroupRow'
import { useAuthorizationContext } from '../../AuthorizationProvider'
import { importComponentFromFELibrary } from '../../../../../components/common'
import FiltersEmptyState from '../../shared/components/FilterEmptyState/FilterEmptyState.component'
import NoPermissionGroups from './NoPermissionGroups'

const PermissionGroupInfoBar = importComponentFromFELibrary('PermissionGroupInfoBar', noop, 'function')

const PermissionGroupList = () => {
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
    } = useUrlFilters<SortableKeys>({ initialSortKey: SortableKeys.name })
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
    )
    const { isAutoAssignFlowEnabled } = useAuthorizationContext()

    const showLoadingState = isLoading || getIsRequestAborted(error)

    const getPermissionGroupDataForExport = useCallback(
        () =>
            getPermissionGroupList({
                ...filterConfig,
                showAll: true,
                offset: null,
                size: null,
                sortBy: SortableKeys.name,
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
            return <NoPermissionGroups />
        }
    }

    // Disable the filter actions
    const isActionsDisabled = showLoadingState || !(result.totalCount && result.permissionGroups.length)

    const sortByName = () => {
        handleSorting(SortableKeys.name)
    }

    return (
        <div className="flexbox-col dc__gap-8 flex-grow-1">
            <PermissionGroupListHeader
                disabled={isActionsDisabled}
                handleSearch={handleSearch}
                initialSearchText={searchKey}
                getDataToExport={getPermissionGroupDataForExport}
            />
            {isAutoAssignFlowEnabled && (
                <div className="pl-20 pr-20">
                    <PermissionGroupInfoBar />
                </div>
            )}
            {isLoading || (result.totalCount && result.permissionGroups.length) ? (
                <div className="flexbox-col flex-grow-1">
                    <div className="user-permission__header cn-7 fs-12 fw-6 lh-20 dc__uppercase pl-20 pr-20 dc__border-bottom dc__position-sticky dc__top-0 bcn-0 dc__zi-1">
                        <span />
                        <SortableTableHeaderCell
                            title="Name"
                            sortOrder={sortOrder}
                            isSorted={sortBy === SortableKeys.name}
                            triggerSorting={sortByName}
                            disabled={isActionsDisabled}
                        />
                        <span>Description</span>
                        <span />
                    </div>
                    {showLoadingState ? (
                        permissionGroupLoading.map((permissionGroup) => (
                            <div
                                className="user-permission__row pl-20 pr-20 show-shimmer-loading"
                                key={`permission-group-list-${permissionGroup.id}`}
                            >
                                <span className="child child-shimmer-loading" />
                                <span className="child child-shimmer-loading" />
                                <span className="child child-shimmer-loading" />
                            </div>
                        ))
                    ) : (
                        <>
                            <div className="fs-13 fw-4 lh-20 cn-9 flex-grow-1">
                                {result.permissionGroups.map((permissionGroup, index) => (
                                    <PermissionGroupRow
                                        {...permissionGroup}
                                        index={index}
                                        key={`permission-group-${permissionGroup.id}`}
                                        refetchPermissionGroupList={reload}
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

export default PermissionGroupList
