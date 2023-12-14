import React, { useState } from 'react'
import { DeleteDialog, DeploymentAppTypes, ForceDeleteDialog } from '@devtron-labs/devtron-fe-common-lib'
import ClusterNotReachableDailog from '../common/ClusterNotReachableDailog/ClusterNotReachableDialog'
import { DELETE_ACTION } from '../../config'
import { DeleteCDNodeProps, DeleteDialogType } from './types'

export default function DeleteCDNode({
    deleteDialog,
    setDeleteDialog,
    clusterName,
    appName,
    hideDeleteModal,
    deleteCD,
    deploymentAppType,
    forceDeleteData,
    deleteTitleName,
    isLoading,
    showConfirmationBar,
}: Readonly<DeleteCDNodeProps>) {
    const [deleteInput, setDeleteInput] = useState<string>('')
    const confirmationText = 'Delete'
    const deleteTitle = showConfirmationBar ? `Delete Pipeline for '${deleteTitleName}' ?` : `Delete '${deleteTitleName}' ?`

    const handleDeleteInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDeleteInput(e.target.value)
    }

    const handleDeletePipeline = (deleteAction: DELETE_ACTION) => {
        switch (deleteAction) {
            case DELETE_ACTION.DELETE:
                return deleteCD(false, true)
            case DELETE_ACTION.NONCASCADE_DELETE:
                return deploymentAppType === DeploymentAppTypes.GITOPS ? deleteCD(false, false) : deleteCD(false, true)
            case DELETE_ACTION.FORCE_DELETE:
                return deleteCD(true, false)
        }
    }

    const onClickHideNonCascadeDeletePopup = () => {
        setDeleteDialog(DeleteDialogType.showNormalDeleteDialog)
    }

    const onClickNonCascadeDelete = () => {
        onClickHideNonCascadeDeletePopup()
        handleDeletePipeline(DELETE_ACTION.NONCASCADE_DELETE)
    }

    const handleDeleteCDNode = () => {
        handleDeletePipeline(DELETE_ACTION.DELETE)
    }

    const handleForceDeleteCDNode = () => {
        handleDeletePipeline(DELETE_ACTION.FORCE_DELETE)
    }

    if (deleteDialog === DeleteDialogType.showForceDeleteDialog) {
        return (
            <ForceDeleteDialog
                forceDeleteDialogTitle={forceDeleteData.forceDeleteDialogTitle}
                onClickDelete={handleForceDeleteCDNode}
                closeDeleteModal={hideDeleteModal}
                forceDeleteDialogMessage={forceDeleteData.forceDeleteDialogMessage}
            />
        )
    }

    if (deleteDialog === DeleteDialogType.showNonCascadeDeleteDialog) {
        return (
            <ClusterNotReachableDailog
                clusterName={clusterName}
                onClickCancel={onClickHideNonCascadeDeletePopup}
                onClickDelete={onClickNonCascadeDelete}
            />
        )
    }

    return (
        <DeleteDialog
            title={deleteTitle}
            description={`Are you sure you want to delete this CD Pipeline from '${appName}' ?`}
            delete={handleDeleteCDNode}
            closeDelete={hideDeleteModal}
            apiCallInProgress={isLoading}
            disabled={showConfirmationBar && deleteInput !== confirmationText}
        >
            {showConfirmationBar && (
                <input
                    type="text"
                    disabled={isLoading}
                    className="form__input mt-12"
                    data-testId="delete-dialog-input"
                    placeholder="Type Delete to confirm"
                    value={deleteInput}
                    onChange={handleDeleteInputChange}
                />
            )}
        </DeleteDialog>
    )
}
