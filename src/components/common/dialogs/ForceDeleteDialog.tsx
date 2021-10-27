import React from 'react'
import { DeleteDialog } from '../../common';

export default function ForceDeleteDialog({ onClickDelete, closeDeleteModal, forceDeleteErrorTitle, forceDeleteErrorMessage }) {
    return (
        <div>
            <DeleteDialog title={forceDeleteErrorTitle}
                delete={onClickDelete}
                closeDelete={closeDeleteModal}
                force="Force">
                <DeleteDialog.Description >
                    <p className="mt-12 mb-12 p-8" style={{backgroundColor: '#f2f4f7'}}>Error: {forceDeleteErrorMessage}</p>
                    <p>Do you want to force delete?</p>
                </DeleteDialog.Description>
            </DeleteDialog>
        </div>
    )
}
