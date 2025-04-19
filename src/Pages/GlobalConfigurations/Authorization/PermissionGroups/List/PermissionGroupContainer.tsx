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
import { useAuthorizationContext } from '../../AuthorizationProvider'
import { BulkSelectionModalTypes, useAuthorizationBulkSelection } from '../../Shared/components/BulkSelection'
import BulkSelectionActionWidget from '../../Shared/components/BulkSelection/BulkSelectionActionWidget'
import BulkSelectionModal from '../../Shared/components/BulkSelection/BulkSelectionModal'
import { BulkSelectionEntityTypes } from '../../Shared/components/BulkSelection/constants'
import NoPermissionGroups from './NoPermissionGroups'
import PermissionGroupListHeader from './PermissionGroupListHeader'
import PermissionGroupTable from './PermissionGroupTable'
import { PermissionGroupContainerProps } from './types'

const PermissionGroupInfoBar = importComponentFromFELibrary('PermissionGroupInfoBar', noop, 'function')

const PermissionGroupContainer = ({
    error,
    getPermissionGroupDataForExport,
    showLoadingState,
    totalCount,
    permissionGroups,
    refetchPermissionGroupList,
    urlFilters,
    bulkSelectionModalConfig,
    setBulkSelectionModalConfig,
}: PermissionGroupContainerProps) => {
    const { isAutoAssignFlowEnabled } = useAuthorizationContext()

    const isClearBulkSelectionModalOpen = !!bulkSelectionModalConfig?.type

    const { searchKey, handleSearch: _handleSearch, clearFilters } = urlFilters

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
            return <Reload reload={refetchPermissionGroupList} className="flex-grow-1" />
        }

        // The null state is shown only when filters are not applied
        if (totalCount === 0 && !searchKey) {
            return <NoPermissionGroups />
        }
    }

    // Disable the filter actions
    const isActionsDisabled = showLoadingState || !(totalCount && permissionGroups.length)

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

    return (
        <>
            <div className="flexbox-col dc__gap-8 flex-grow-1" ref={draggableRef}>
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
                {showLoadingState || (totalCount && permissionGroups.length) ? (
                    <PermissionGroupTable
                        isLoading={showLoadingState}
                        showPagination={showPagination}
                        isActionsDisabled={isActionsDisabled}
                        urlFilters={urlFilters}
                        permissionGroups={permissionGroups}
                        refetchPermissionGroupList={refetchPermissionGroupList}
                        totalCount={totalCount}
                    />
                ) : (
                    <GenericFilterEmptyState handleClearFilters={clearFilters} classname="flex-grow-1" />
                )}
                {isSomeRowChecked && selectedUsersCount > 0 && (
                    <BulkSelectionActionWidget
                        count={selectedUsersCount}
                        parentRef={draggableRef}
                        showStatus={false}
                        areActionsDisabled={showLoadingState || isClearBulkSelectionModalOpen}
                        setBulkSelectionModalConfig={setBulkSelectionModalConfig}
                        refetchList={refetchPermissionGroupList}
                        filterConfig={{
                            searchKey: urlFilters.searchKey,
                        }}
                        selectedIdentifiersCount={selectedUsersCount}
                        entityType={BulkSelectionEntityTypes.permissionGroups}
                    />
                )}
            </div>
            {isClearBulkSelectionModalOpen && (
                <BulkSelectionModal
                    {...bulkSelectionModalConfig}
                    refetchList={refetchPermissionGroupList}
                    urlFilters={urlFilters}
                    selectedIdentifiersCount={selectedUsersCount}
                    setBulkSelectionModalConfig={setBulkSelectionModalConfig}
                    entityType={BulkSelectionEntityTypes.permissionGroups}
                />
            )}
        </>
    )
}

export default PermissionGroupContainer
