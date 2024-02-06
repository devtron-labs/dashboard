import {
    BulkSelectionEvents,
    ConfirmationDialog,
    CustomInput,
    Progressing,
    SELECT_ALL_ACROSS_PAGES_LOCATOR,
    showError,
    useBulkSelection,
} from '@devtron-labs/devtron-fe-common-lib'
import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { ReactComponent as DeleteIcon } from '../../../../../assets/icons/ic-medium-delete.svg'
import { deleteUserInBulk } from '../../authorization.service'
import { User, UserBulkDeletePayload } from '../../types'
import { BulkUserDeleteModalProps } from './types'

const BulkUserDeleteModal = ({
    selectedUsersCount,
    onClose,
    urlFilters,
    refetchUserPermissionList,
}: BulkUserDeleteModalProps) => {
    const [isDeleteLoading, setIsDeleteLoading] = useState(false)

    const [deleteConfirmationText, setDeleteConfirmationText] = useState('')

    const { selectedIdentifiers: bulkSelectionState, handleBulkSelection } =
        // TODO: Use Type from types
        useBulkSelection<Record<User['id'], boolean>>()

    const isBulkSelectionApplied = bulkSelectionState[SELECT_ALL_ACROSS_PAGES_LOCATOR]

    const confirmationText = `delete ${selectedUsersCount} ${selectedUsersCount > 1 ? 'users' : 'user'}`
    const isDeleteDisabled = isDeleteLoading || deleteConfirmationText !== confirmationText

    const handleChange = (e) => {
        setDeleteConfirmationText(e.target.value)
    }

    const handleBulkDelete = async () => {
        setIsDeleteLoading(true)
        const selectedUserIds = Object.keys(bulkSelectionState).map(Number)

        const payload: UserBulkDeletePayload = isBulkSelectionApplied
            ? {
                  filterConfig: {
                      searchKey: urlFilters.searchKey,
                  },
              }
            : {
                  ids: selectedUserIds,
              }
        try {
            await deleteUserInBulk(payload)
            toast.success('Selected user(s) deleted successfully')
            setIsDeleteLoading(false)
            handleBulkSelection({
                action: BulkSelectionEvents.CLEAR_ALL_SELECTIONS,
            })
            refetchUserPermissionList()
            onClose()
        } catch (err) {
            showError(err)
            setIsDeleteLoading(false)
        }
    }

    const handleKeyDown = async (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
            event.preventDefault()
            await handleBulkDelete()
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
                title={`Delete ${selectedUsersCount} user account(s)`}
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
                    onKeyDown={handleKeyDown}
                />
            </ConfirmationDialog.Body>
            <ConfirmationDialog.ButtonGroup>
                <button type="button" className="cta cancel" disabled={isDeleteLoading} onClick={onClose}>
                    Cancel
                </button>
                <button type="submit" className="cta delete" disabled={isDeleteDisabled} onClick={handleBulkDelete}>
                    {isDeleteLoading ? <Progressing /> : 'Delete users'}
                </button>
            </ConfirmationDialog.ButtonGroup>
        </ConfirmationDialog>
    )
}

export default BulkUserDeleteModal
