import { ConfirmationDialog, CustomInput, Progressing, showError } from '@devtron-labs/devtron-fe-common-lib'
import React, { useState } from 'react'
import { ReactComponent as DeleteIcon } from '../../../../../assets/icons/ic-medium-delete.svg'

const BulkUserDeleteModal = ({
    usersCountToDelete,
    // TODO: Fix isLoading
    isLoading,
    onClose,
    onSubmit,
}: {
    usersCountToDelete: number
    isLoading: boolean
    onClose: () => void
    onSubmit: () => void
}) => {
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('')
    const confirmationText = `delete ${usersCountToDelete} users`
    const isDeleteDisabled = isLoading || deleteConfirmationText !== confirmationText

    const handleChange = (e) => {
        setDeleteConfirmationText(e.target.value)
    }

    const handleSubmit = () => {
        if (!isDeleteDisabled) {
            onSubmit()
        } else {
            showError('Enter the confirmation text to delete')
        }
    }

    const getLabel = () => (
        <span>
            Type <span className="fw-6">‘{confirmationText}’</span> to confirm
        </span>
    )

    return (
        <ConfirmationDialog className="w-400">
            <DeleteIcon className="icon-dim-48" />
            <ConfirmationDialog.Body
                title={`Delete ${usersCountToDelete} user accounts`}
                subtitle="Selected user accounts will be deleted and their permissions will be revoked. Are you sure?"
            >
                <CustomInput
                    name="user-delete-confirmation"
                    value={deleteConfirmationText}
                    onChange={handleChange}
                    label={getLabel()}
                    inputWrapClassName="mt-12 w-100"
                    placeholder="Type to confirm"
                    isRequiredField
                />
            </ConfirmationDialog.Body>
            <ConfirmationDialog.ButtonGroup>
                <button type="button" className="cta cancel" disabled={isLoading} onClick={onClose}>
                    Cancel
                </button>
                <button type="submit" className="cta delete" disabled={isDeleteDisabled} onClick={handleSubmit}>
                    {isLoading ? <Progressing /> : 'Delete users'}
                </button>
            </ConfirmationDialog.ButtonGroup>
        </ConfirmationDialog>
    )
}

export default BulkUserDeleteModal
