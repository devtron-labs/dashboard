import React from 'react'
import { DeleteDialog, DeploymentAppTypes, ForceDeleteDialog } from '@devtron-labs/devtron-fe-common-lib'
import ClusterNotReachableDailog from '../common/ClusterNotReachableDailog/ClusterNotReachableDialog'
import { DELETE_ACTION } from '../../config'
import { DeleteCDNodeProps, DeleteDialogType } from './types'

// TODO: Add logic for confirmation dialog
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
}: Readonly<DeleteCDNodeProps>) {
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
            title={`Delete '${deleteTitleName}' ?`}
            description={`Are you sure you want to delete this CD Pipeline from '${appName}' ?`}
            delete={handleDeleteCDNode}
            closeDelete={hideDeleteModal}
        />
    )
}
