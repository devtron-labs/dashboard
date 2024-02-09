import {
    DEFAULT_BASE_PAGE_SIZE,
    ErrorScreenNotAuthorized,
    ERROR_EMPTY_SCREEN,
    noop,
    Reload,
    TOAST_ACCESS_DENIED,
} from '@devtron-labs/devtron-fe-common-lib'
import React, { useRef } from 'react'
import { API_STATUS_CODES } from '../../../../../config'
import FiltersEmptyState from '../../shared/components/FilterEmptyState/FilterEmptyState.component'
import NoUsers from './NoUsers'
import { UserPermissionContainerProps } from './types'
import UserPermissionListHeader from './UserPermissionListHeader'
import BulkSelectionActionWidget from '../../shared/components/BulkSelection/BulkSelectionActionWidget'
import BulkSelectionModal from '../../shared/components/BulkSelection/BulkSelectionModal'
import UserPermissionTable from './UserPermissionTable'
import { BulkSelectionModalTypes, useAuthorizationBulkSelection } from '../../shared/components/BulkSelection'
import { BulkSelectionEntityTypes } from '../../shared/components/BulkSelection/constants'
import { importComponentFromFELibrary } from '../../../../../components/common'

const FilterChips = importComponentFromFELibrary('FilterChips', null, 'function')

const UserPermissionContainer = ({
    showStatus,
    error,
    getUserDataForExport,
    showLoadingState,
    totalCount,
    users,
    refetchUserPermissionList,
    urlFilters,
    bulkSelectionModalConfig,
    setBulkSelectionModalConfig,
}: UserPermissionContainerProps) => {
    const isClearBulkSelectionModalOpen = !!bulkSelectionModalConfig?.type

    const { searchKey, handleSearch: _handleSearch, clearFilters, status, updateStatusFilter } = urlFilters

    const draggableRef = useRef<HTMLDivElement>()
    const { getSelectedIdentifiersCount, isBulkSelectionApplied } = useAuthorizationBulkSelection()
    const isSomeRowChecked = getSelectedIdentifiersCount() > 0
    const selectedUsersCount = isBulkSelectionApplied ? totalCount : getSelectedIdentifiersCount()

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

        const areFiltersApplied = !(searchKey || status.length)

        // The null state is shown only when filters are not applied
        if (totalCount === 0 && areFiltersApplied) {
            return <NoUsers />
        }
    }

    // Disable the filter actions
    const isActionsDisabled = showLoadingState || !(totalCount && users.length)

    const showPagination = totalCount > DEFAULT_BASE_PAGE_SIZE

    const applyFilter = () =>
        new Promise((resolve, reject) => {
            if (isBulkSelectionApplied) {
                setBulkSelectionModalConfig({
                    type: BulkSelectionModalTypes.clearAllAcrossPages,
                    onSuccess: () => resolve(null),
                    onCancel: () => reject(),
                })
            } else {
                resolve(null)
            }
        })

    const handleSearch = (text: string) => {
        applyFilter()
            .then(() => {
                _handleSearch(text)
            })
            .catch(noop)
    }

    const handleStatusFilterChange = (selectedStatuses: UserPermissionContainerProps['urlFilters']['status']) => {
        applyFilter()
            .then(() => {
                updateStatusFilter(selectedStatuses)
            })
            .catch(noop)
    }

    const handleFilterRemove = (filterConfig) => {
        handleStatusFilterChange(filterConfig.status)
    }

    return (
        <>
            <div className="flexbox-col flex-grow-1" ref={draggableRef}>
                <div className="flexbox-col dc__gap-8 flex-grow-1">
                    <UserPermissionListHeader
                        disabled={isActionsDisabled}
                        showStatus={showStatus}
                        handleSearch={handleSearch}
                        initialSearchText={searchKey}
                        getDataToExport={getUserDataForExport}
                        handleStatusFilterChange={handleStatusFilterChange}
                        status={status}
                    />
                    {showStatus && (
                        <div className="pr-20 pl-20">
                            <FilterChips
                                filterConfig={{
                                    status: urlFilters.status,
                                }}
                                clearFilters={clearFilters}
                                handleStatusFilterRemove={handleFilterRemove}
                            />
                        </div>
                    )}
                    {showLoadingState || (totalCount && users.length) ? (
                        <UserPermissionTable
                            showStatus={showStatus}
                            isLoading={showLoadingState}
                            showPagination={showPagination}
                            isActionsDisabled={isActionsDisabled}
                            urlFilters={urlFilters}
                            users={users}
                            refetchUserPermissionList={refetchUserPermissionList}
                            totalCount={totalCount}
                        />
                    ) : (
                        <FiltersEmptyState clearFilters={clearFilters} />
                    )}
                    {isSomeRowChecked && selectedUsersCount > 0 && (
                        <BulkSelectionActionWidget
                            count={selectedUsersCount}
                            parentRef={draggableRef}
                            showStatus={showStatus}
                            areActionsDisabled={showLoadingState || isClearBulkSelectionModalOpen}
                            setBulkSelectionModalConfig={setBulkSelectionModalConfig}
                            refetchList={refetchUserPermissionList}
                            filterConfig={{
                                searchKey: urlFilters.searchKey,
                                status: urlFilters.status,
                            }}
                            selectedIdentifiersCount={selectedUsersCount}
                            isCountApproximate={isBulkSelectionApplied}
                        />
                    )}
                </div>
            </div>

            {isClearBulkSelectionModalOpen && (
                <BulkSelectionModal
                    {...bulkSelectionModalConfig}
                    refetchList={refetchUserPermissionList}
                    urlFilters={urlFilters}
                    selectedIdentifiersCount={selectedUsersCount}
                    setBulkSelectionModalConfig={setBulkSelectionModalConfig}
                    entityType={BulkSelectionEntityTypes.users}
                />
            )}
        </>
    )
}

export default UserPermissionContainer
