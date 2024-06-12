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

import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { ServerErrors, ConfirmationDialog, DeleteDialog, showError } from '@devtron-labs/devtron-fe-common-lib'
import { useHistory } from 'react-router'
import { DeleteComponentProps } from '../components/app/types'
import info from '../assets/icons/ic-info-filled.svg'

const DeleteComponent = ({
    setDeleting,
    toggleConfirmation,
    deleteComponent,
    title,
    component,
    payload,
    confirmationDialogDescription = '',
    redirectTo = false,
    url = '',
    reload,
    configuration = '',
    closeCustomComponent,
}: DeleteComponentProps) => {
    const [showCannotDeleteDialogModal, setCannotDeleteDialogModal] = useState(false)
    const { push } = useHistory()

    async function handleDelete() {
        setDeleting(true)
        try {
            await deleteComponent(payload)
            toast.success('Successfully deleted')
            toggleConfirmation(false)
            if (redirectTo) {
                push(url)
            } else {
                reload()
            }
            if (typeof closeCustomComponent === 'function') {
                closeCustomComponent()
            }
        } catch (serverError) {
            if (serverError instanceof ServerErrors && serverError.code === 500) {
                setCannotDeleteDialogModal(true)
            } else {
                showError(serverError)
            }
        } finally {
            setDeleting(false)
        }
    }

    const handleConfirmation = () => {
        setCannotDeleteDialogModal(false)
        toggleConfirmation(false)
        if (typeof closeCustomComponent === 'function') {
            closeCustomComponent()
        }
    }

    const renderCannotDeleteDialogModal = () => {
        return (
            <ConfirmationDialog className="confirmation-dialog__body--w-360">
                <ConfirmationDialog.Icon src={info} />
                <ConfirmationDialog.Body title={`Cannot delete ${component} '${title}'`} />
                <p className="fs-13 cn-7 ">{confirmationDialogDescription}</p>
                <ConfirmationDialog.ButtonGroup>
                    <button
                        data-testid="delete_warning_popup"
                        type="button"
                        className="cta"
                        onClick={handleConfirmation}
                    >
                        Okay
                    </button>
                </ConfirmationDialog.ButtonGroup>
            </ConfirmationDialog>
        )
    }

    const renderDeleteDialog = () => {
        return (
            <DeleteDialog
                title={`Delete ${component} '${title}'`}
                delete={handleDelete}
                closeDelete={() => toggleConfirmation(false)}
                dataTestId="delete-dialog"
            >
                <DeleteDialog.Description>
                    <p>Are you sure you want to delete this {configuration || component}? </p>
                </DeleteDialog.Description>
            </DeleteDialog>
        )
    }
    return <div>{showCannotDeleteDialogModal ? renderCannotDeleteDialogModal() : renderDeleteDialog()}</div>
}

export default DeleteComponent
