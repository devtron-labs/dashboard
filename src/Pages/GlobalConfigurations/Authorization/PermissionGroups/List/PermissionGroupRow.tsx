import React, { useState } from 'react'
import {
    BulkSelectionEvents,
    Checkbox,
    CHECKBOX_VALUE,
    DeleteDialog,
    getRandomColor,
    showError,
} from '@devtron-labs/devtron-fe-common-lib'
import { Link, useRouteMatch } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ReactComponent as Edit } from '../../../../../assets/icons/ic-pencil.svg'
import { ReactComponent as Trash } from '../../../../../assets/icons/ic-delete-interactive.svg'

import { PermissionGroupRowProps } from './types'
import { deletePermissionGroup } from '../../authorization.service'
import { useAuthorizationBulkSelection } from '../../shared/components/BulkSelection'

const PermissionGroupRow = ({
    id,
    name,
    description,
    index,
    refetchPermissionGroupList,
    isChecked = false,
    toggleChecked,
    showCheckbox: _showCheckbox,
}: PermissionGroupRowProps) => {
    const { path } = useRouteMatch()
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isModalLoading, setIsModalLoading] = useState(false)
    const { isBulkSelectionApplied, handleBulkSelection } = useAuthorizationBulkSelection()

    const showCheckbox = _showCheckbox || isChecked

    const toggleDeleteModal = () => {
        setIsDeleteModalOpen(!isDeleteModalOpen)
    }

    const handleDelete = async () => {
        setIsModalLoading(true)
        try {
            await deletePermissionGroup(id)
            toast.success('Group deleted')
            refetchPermissionGroupList()
            setIsDeleteModalOpen(false)

            // Clearing the selection on single delete since the selected one might be removed
            if (!isBulkSelectionApplied) {
                handleBulkSelection({
                    action: BulkSelectionEvents.CLEAR_ALL_SELECTIONS,
                })
                toast.info('All previous selections have been cleared')
            }
        } catch (err) {
            showError(err)
        } finally {
            setIsModalLoading(false)
        }
    }

    const handleChecked = () => {
        toggleChecked(id)
    }

    return (
        <>
            <div
                className={`user-permission__row dc__visible-hover dc__visible-hover--parent pl-20 pr-20  dc__hover-n50 ${
                    isChecked ? 'bc-b50' : ''
                }`}
            >
                <div className="flex dc__content-start">
                    {!showCheckbox && (
                        <span
                            className="icon-dim-20 mw-20 flex dc__border-radius-50-per dc__uppercase cn-0 fw-4 dc__visible-hover--hide-child"
                            style={{
                                backgroundColor: getRandomColor(name),
                            }}
                        >
                            {name[0]}
                        </span>
                    )}
                    <Checkbox
                        isChecked={isChecked}
                        onChange={handleChecked}
                        rootClassName={`mb-0 ${showCheckbox ? '' : 'dc__visible-hover--child'}`}
                        value={CHECKBOX_VALUE.CHECKED}
                    />
                </div>
                <span className="dc__ellipsis-right">
                    <Link className="anchor dc__ellipsis-right" to={`${path}/${id}`}>
                        {name}
                    </Link>
                </span>
                <span className="dc__ellipsis-right">{description || '-'}</span>
                <div className="flex dc__gap-12">
                    <Link
                        type="button"
                        className="dc__visible-hover--child dc__transparent"
                        data-testid={`user-permission__edit-button-${index}`}
                        aria-label="Edit permission group"
                        to={`${path}/${id}`}
                    >
                        <Edit className="scn-6 icon-dim-16 mw-16" />
                    </Link>
                    <button
                        type="button"
                        className="dc__visible-hover--child dc__transparent"
                        data-testid={`permission-group__delete-button-${index}`}
                        onClick={toggleDeleteModal}
                        aria-label="Delete permission group"
                    >
                        <Trash className="scn-6 icon-dim-16 mw-16 icon-delete" />
                    </button>
                </div>
            </div>
            {isDeleteModalOpen && (
                <DeleteDialog
                    title={`Delete group '${name}'?`}
                    description="Deleting this group will revoke permissions from users added to this group."
                    closeDelete={toggleDeleteModal}
                    delete={handleDelete}
                    apiCallInProgress={isModalLoading}
                />
            )}
        </>
    )
}

export default PermissionGroupRow
