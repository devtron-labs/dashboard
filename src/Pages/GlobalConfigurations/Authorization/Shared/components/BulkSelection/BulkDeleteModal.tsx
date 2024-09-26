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

import {
    BulkSelectionEvents,
    ConfirmationDialog,
    CustomInput,
    Progressing,
    showError,
    ToastManager,
    ToastVariantType,
} from '@devtron-labs/devtron-fe-common-lib'
import { useState } from 'react'
import { ReactComponent as DeleteIcon } from '../../../../../../assets/icons/ic-medium-delete.svg'
import { deletePermissionGroupInBulk, deleteUserInBulk } from '../../../authorization.service'
import { UserBulkDeletePayload, PermissionGroupBulkDeletePayload } from '../../../types'
import { BulkSelectionEntityTypes } from './constants'
import { BulkDeleteModalProps } from './types'
import useAuthorizationBulkSelection from './useAuthorizationBulkSelection'

const getModalConfig = ({ selectedIdentifiersCount }: Pick<BulkDeleteModalProps, 'selectedIdentifiersCount'>) =>
    ({
        [BulkSelectionEntityTypes.users]: {
            title: `Delete ${selectedIdentifiersCount} user account(s)`,
            subTitle: 'Selected user account(s) will be deleted and their permissions will be revoked. Are you sure?',
            buttonText: 'Delete User(s)',
            successToastText: 'Selected user(s) deleted successfully',
            confirmationText: `delete ${selectedIdentifiersCount} ${selectedIdentifiersCount > 1 ? 'users' : 'user'}`,
        },
        [BulkSelectionEntityTypes.permissionGroups]: {
            title: `Delete ${selectedIdentifiersCount} groups(s)`,
            subTitle:
                'Selected group(s) will be deleted and revoke permissions from users added to these groups. Are you sure?',
            buttonText: 'Delete Group(s)',
            successToastText: 'Selected group(s) deleted successfully',
            confirmationText: `delete ${selectedIdentifiersCount} ${selectedIdentifiersCount > 1 ? 'groups' : 'group'}`,
        },
    }) as const

const BulkDeleteModal = ({
    entityType,
    selectedIdentifiersCount,
    onClose,
    urlFilters,
    refetchList,
}: BulkDeleteModalProps) => {
    const [isDeleteLoading, setIsDeleteLoading] = useState(false)

    const [deleteConfirmationText, setDeleteConfirmationText] = useState('')

    const { bulkSelectionState, handleBulkSelection, isBulkSelectionApplied } = useAuthorizationBulkSelection()

    const { title, subTitle, buttonText, successToastText, confirmationText } = getModalConfig({
        selectedIdentifiersCount,
    })[entityType]

    const isDeleteDisabled = isDeleteLoading || deleteConfirmationText !== confirmationText

    const handleChange = (e) => {
        setDeleteConfirmationText(e.target.value)
    }

    const handleBulkDelete = async () => {
        setIsDeleteLoading(true)
        const selectedUserIds = Object.keys(bulkSelectionState).map(Number)

        try {
            if (entityType === BulkSelectionEntityTypes.users) {
                const payload: UserBulkDeletePayload = isBulkSelectionApplied
                    ? {
                          filterConfig: {
                              searchKey: urlFilters.searchKey,
                              // added this check for type compatibility
                              status: 'status' in urlFilters ? urlFilters.status : [],
                          },
                      }
                    : {
                          ids: selectedUserIds,
                      }
                await deleteUserInBulk(payload)
            } else {
                const payload: PermissionGroupBulkDeletePayload = isBulkSelectionApplied
                    ? {
                          filterConfig: {
                              searchKey: urlFilters.searchKey,
                          },
                      }
                    : {
                          ids: selectedUserIds,
                      }
                await deletePermissionGroupInBulk(payload)
            }
            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: successToastText,
            })
            setIsDeleteLoading(false)
            handleBulkSelection({
                action: BulkSelectionEvents.CLEAR_ALL_SELECTIONS,
            })
            refetchList()
            onClose()
        } catch (err) {
            showError(err)
            setIsDeleteLoading(false)
        }
    }

    const handleKeyDown = async (event: KeyboardEvent) => {
        if (event.key === 'Enter' && !isDeleteDisabled) {
            event.preventDefault()
            await handleBulkDelete()
        }
    }

    const getLabel = () => (
        <span>
            Type <span className="fw-6">&apos;{confirmationText}&apos;</span> to confirm
        </span>
    )

    return (
        <ConfirmationDialog className="w-400">
            <DeleteIcon className="icon-dim-48" />
            <ConfirmationDialog.Body title={title} subtitle={subTitle}>
                <CustomInput
                    name="bulk-delete-confirmation"
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
                <button
                    type="submit"
                    className="cta delete dc__no-text-transform"
                    disabled={isDeleteDisabled}
                    onClick={handleBulkDelete}
                >
                    {isDeleteLoading ? <Progressing /> : buttonText}
                </button>
            </ConfirmationDialog.ButtonGroup>
        </ConfirmationDialog>
    )
}

export default BulkDeleteModal
