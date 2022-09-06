import React from 'react'
import { DeleteDialog } from '../../common';
import { ForceDeleteDialogType } from './Dialog.type';

export default function ForceDeleteDialog({ onClickDelete, closeDeleteModal, forceDeleteDialogTitle, forceDeleteDialogMessage }: ForceDeleteDialogType) {
    return (
        <div>
            <DeleteDialog title={forceDeleteDialogTitle}
                delete={onClickDelete}
                closeDelete={closeDeleteModal}
                deletePrefix="Force ">
                <DeleteDialog.Description >
                    <p className="mt-12 mb-12 p-8 break-word dc__window-bg">Error: {forceDeleteDialogMessage}</p>
                    <p>Do you want to force delete?</p>
                </DeleteDialog.Description>
            </DeleteDialog>
        </div>
    )
}
