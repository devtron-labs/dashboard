import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { ConfirmationDialog, DeleteDialog, showError } from '../components/common';
import { ServerErrors } from '../modals/commonTypes';
import info from '../assets/icons/ic-info-filled.svg';

function DeleteComponent({
    setDeleting,
    toggleConfirmation,
    deleteComponent,
    title,
    component,
    payload,
    confirmationDialogDescription,
}) {
    const [showConfirmationDialogModal, setConfirmationDialogModal] = useState(false);

    async function handleDelete() {
        setDeleting(true);
        try {
            await deleteComponent(payload);
            toast.success('Successfully deleted');
            toggleConfirmation(false);
        } catch (serverError) {
            if (serverError instanceof ServerErrors && serverError.code === 500) {
                showError(serverError);
                setConfirmationDialogModal(true);
            }
        } finally {
            setDeleting(false);
        }
    }

    const confirmationDialogModal = () => {
        return (
            <ConfirmationDialog className='confirmation-dialog__body--w-360'>
                <ConfirmationDialog.Icon src={info} />
                <ConfirmationDialog.Body title={`Cannot delete ${component}`} />
                <p className="fs-13 cn-7 ">{confirmationDialogDescription}</p>
                <ConfirmationDialog.ButtonGroup>
                    <button
                        type="button"
                        className="cta"
                        onClick={() => {
                            toggleConfirmation(false);
                            setConfirmationDialogModal(true);
                        }}
                    >
                        Okay
                    </button>
                </ConfirmationDialog.ButtonGroup>
            </ConfirmationDialog>
        );
    };

    return (
        <div>
            <DeleteDialog title={title} delete={handleDelete} closeDelete={() => toggleConfirmation(false)}>
                <DeleteDialog.Description>
                    <p>Are you sure you want to delete this {component}? </p>
                </DeleteDialog.Description>
            </DeleteDialog>

            {showConfirmationDialogModal && confirmationDialogModal()}
        </div>
    );
}

export default DeleteComponent;
