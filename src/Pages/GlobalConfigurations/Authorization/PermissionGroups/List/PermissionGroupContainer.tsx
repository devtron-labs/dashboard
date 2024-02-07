import {
    DEFAULT_BASE_PAGE_SIZE,
    ErrorScreenNotAuthorized,
    ERROR_EMPTY_SCREEN,
    noop,
    Reload,
    TOAST_ACCESS_DENIED,
} from '@devtron-labs/devtron-fe-common-lib'
import React, { useRef } from 'react'
import { importComponentFromFELibrary } from '../../../../../components/common'
import { API_STATUS_CODES } from '../../../../../config'
import { useAuthorizationContext } from '../../AuthorizationProvider'
import FiltersEmptyState from '../../shared/components/FilterEmptyState/FilterEmptyState.component'
import BulkSelectionActionWidget from '../../shared/components/BulkSelection/BulkSelectionActionWidget'
import BulkSelectionModal from '../../shared/components/BulkSelection/BulkSelectionModal'
import NoPermissionGroups from './NoPermissionGroups'
import PermissionGroupListHeader from './PermissionGroupListHeader'
import PermissionGroupTable from './PermissionGroupTable'
import { PermissionGroupContainerProps } from './types'
import { BulkSelectionModalTypes, useAuthorizationBulkSelection } from '../../shared/components/BulkSelection'

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
                    <FiltersEmptyState clearFilters={clearFilters} />
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
                        isCountApproximate={isBulkSelectionApplied}
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
                />
            )}
        </>
    )
}

export default PermissionGroupContainer
