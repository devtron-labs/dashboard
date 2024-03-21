import React, { useState } from 'react'
import { CustomInput, DeleteDialog, ForceDeleteDialog } from '@devtron-labs/devtron-fe-common-lib'
import ClusterNotReachableDailog from '../common/ClusterNotReachableDailog/ClusterNotReachableDialog'
import { DELETE_ACTION } from '../../config'
import { DeleteCDNodeProps, DeleteDialogType } from './types'
import { handleDeleteCDNodePipeline, handleDeletePipeline } from './cdpipeline.util'

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
    const deleteTitle = showConfirmationBar
        ? `Delete Pipeline for '${deleteTitleName}' ?`
        : `Delete '${deleteTitleName}' ?`

    const handleDeleteInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDeleteInput(e.target.value)
    }

    const onClickHideNonCascadeDeletePopup = () => {
        setDeleteDialog(DeleteDialogType.showNormalDeleteDialog)
    }

    const onClickNonCascadeDelete = () => {
        onClickHideNonCascadeDeletePopup()
        handleDeletePipeline(DELETE_ACTION.NONCASCADE_DELETE, deleteCD, deploymentAppType)
    }

    const handleForceDeleteCDNode = () => {
        handleDeletePipeline(DELETE_ACTION.FORCE_DELETE, deleteCD, deploymentAppType)
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
            delete={() => handleDeleteCDNodePipeline(deleteCD, deploymentAppType)}
            closeDelete={hideDeleteModal}
            apiCallInProgress={isLoading}
            disabled={showConfirmationBar && deleteInput !== deleteTitleName}
        >
            {showConfirmationBar && (
                <CustomInput
                    disabled={isLoading}
                    rootClassName="mt-12"
                    data-testId="delete-dialog-input"
                    placeholder={`Please type ${deleteTitleName} to confirm`}
                    value={deleteInput}
                    name="delete-input"
                    onChange={handleDeleteInputChange}
                />
            )}
        </DeleteDialog>
    )
}
