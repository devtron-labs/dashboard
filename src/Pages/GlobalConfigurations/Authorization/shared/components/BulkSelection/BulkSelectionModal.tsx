import { noop } from '@devtron-labs/devtron-fe-common-lib'
import React from 'react'
import BulkSelectionClearConfirmationModal from './BulkSelectionClearConfirmationModal'
import BulkDeleteModal from './BulkDeleteModal'
import { BulkSelectionModalProps } from './types'
import { BulkSelectionModalTypes } from './constants'

const BulkSelectionModal = ({
    type,
    refetchList,
    urlFilters,
    selectedIdentifiersCount,
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
                <BulkDeleteModal
                    onClose={handleClose}
                    selectedIdentifiersCount={selectedIdentifiersCount}
                    refetchList={refetchList}
                    urlFilters={urlFilters}
                    // TODO: Add support for permission groups as well
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
