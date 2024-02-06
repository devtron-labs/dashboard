import { noop } from '@devtron-labs/devtron-fe-common-lib'
import React from 'react'
import BulkSelectionClearConfirmationModal from './BulkSelectionClearConfirmationModal'
import BulkUserDeleteModal from './BulkUserDeleteModal'
import { BulkSelectionModalProps, BulkSelectionModalTypes } from './types'

const BulkSelectionModal = ({
    type,
    refetchUserPermissionList,
    urlFilters,
    selectedUsersCount,
    setBulkSelectionModalConfig,
    onSuccess = noop,
    onCancel = noop,
}: BulkSelectionModalProps) => {
    const handleClose = () => {
        setBulkSelectionModalConfig(null)
        onCancel()
    }

    switch (type) {
        case BulkSelectionModalTypes.deleteConfirmation:
            return (
                <BulkUserDeleteModal
                    onClose={handleClose}
                    selectedUsersCount={selectedUsersCount}
                    refetchUserPermissionList={refetchUserPermissionList}
                    urlFilters={urlFilters}
                />
            )
        case BulkSelectionModalTypes.selectAllAcrossPages:
        case BulkSelectionModalTypes.clearAllAcrossPages:
            return <BulkSelectionClearConfirmationModal type={type} onClose={handleClose} onSubmit={onSuccess} />
        default:
            throw new Error(`Unknown type ${type}`)
    }
}

export default BulkSelectionModal
