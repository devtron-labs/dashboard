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

import { useRef } from 'react'

import {
    DEFAULT_BASE_PAGE_SIZE,
    ERROR_EMPTY_SCREEN,
    ErrorScreenNotAuthorized,
    GenericFilterEmptyState,
    noop,
    Reload,
    TOAST_ACCESS_DENIED,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '../../../../../components/common'
import { API_STATUS_CODES } from '../../../../../config'
import { BulkSelectionModalTypes, useAuthorizationBulkSelection } from '../../Shared/components/BulkSelection'
import BulkSelectionActionWidget from '../../Shared/components/BulkSelection/BulkSelectionActionWidget'
import BulkSelectionModal from '../../Shared/components/BulkSelection/BulkSelectionModal'
import { BulkSelectionEntityTypes } from '../../Shared/components/BulkSelection/constants'
import NoUsers from './NoUsers'
import { UserPermissionContainerProps } from './types'
import UserPermissionListHeader from './UserPermissionListHeader'
import UserPermissionTable from './UserPermissionTable'

const UserListFilterToolbar = importComponentFromFELibrary('UserListFilterToolbar', null, 'function')

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

    const confirmApplyFilter = () =>
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
        confirmApplyFilter()
            .then(() => {
                _handleSearch(text)
            })
            .catch(noop)
    }

    const handleStatusFilterChange = (selectedStatuses: UserPermissionContainerProps['urlFilters']['status']) => {
        confirmApplyFilter()
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
                        <UserListFilterToolbar
                            filterConfig={{
                                status: urlFilters.status,
                            }}
                            clearFilters={clearFilters}
                            onRemoveFilter={handleFilterRemove}
                        />
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
                        <GenericFilterEmptyState handleClearFilters={clearFilters} classname="flex-grow-1" />
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
                            entityType={BulkSelectionEntityTypes.users}
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
