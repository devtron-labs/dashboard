import React from 'react'
import { DeleteDialog } from '../../common';

export default function ForceDeleteDialog({ onClickDelete, closeDeleteModal, forceDeleteDialogTitle, forceDeleteDialogMessage }) {
    return (
        <div>
            <DeleteDialog title={forceDeleteDialogTitle}
                delete={onClickDelete}
                closeDelete={closeDeleteModal}
                deletePrefix="Force ">
                <DeleteDialog.Description >
                    <p className="mt-12 mb-12 p-8" style={{backgroundColor: '#f2f4f7'}}>Error: {forceDeleteDialogMessage}</p>
                    <p>Do you want to force delete?</p>
                </DeleteDialog.Description>
            </DeleteDialog>
        </div>
    )
}
