import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { ConfirmationDialog, DeleteDialog, noop, showError } from '../components/common';
import { ServerErrors } from '../modals/commonTypes';
import { useHistory } from 'react-router';
import { DeleteComponentProps } from '../components/app/types';

function DeleteComponent({
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
    toggleRepoSelectionTippy = noop,
    setRepo = noop,
}: DeleteComponentProps) {
    const [showDeleteDialogModal, setDeleteDialogModal] = useState(false);
    const { push } = useHistory();

    async function handleDelete() {
        setDeleting(true);
        try {
            await deleteComponent(payload);
            toast.success('Successfully deleted');
            toggleConfirmation(false);
            setDeleting(false);
            if (redirectTo) {
                push(url);
            } else {
                reload();
            }
        } catch (serverError) {
            if (serverError instanceof ServerErrors && serverError.code === 500) {
                setDeleteDialogModal(true)
                toggleRepoSelectionTippy()
                setRepo(title)
            }
        } finally {
            setDeleting(false);
        }
    }

    const renderDeleteDialog = () => {
        return (
            <DeleteDialog
                title={`Delete ${component} '${title}'`}
                delete={handleDelete}
                closeDelete={() => toggleConfirmation(false)}
            >
                <DeleteDialog.Description>
                    <p>Are you sure you want to delete this {configuration ? configuration : component}? </p>
                </DeleteDialog.Description>
            </DeleteDialog>
        );
    };
    return (
        <div>
            {!showDeleteDialogModal && renderDeleteDialog()}
        </div>
    );
}

export default DeleteComponent;
