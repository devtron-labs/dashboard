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

import {
    ConfirmationModal,
    ConfirmationModalVariantType,
    DeploymentAppTypes,
    ForceDeleteConfirmationModal,
} from '@devtron-labs/devtron-fe-common-lib'
import { DELETE_ACTION } from '../../config'
import { DeleteCDNodeProps, DeleteDialogType } from './types'
import { handleDeleteCDNodePipeline, handleDeletePipeline } from './cdpipeline.util'

const DeleteCDNode = ({
    showDeleteDialog,
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
}: Readonly<DeleteCDNodeProps>) => {
    const onClickHideNonCascadeDeletePopup = () => {
        setDeleteDialog(DeleteDialogType.showNormalDeleteDialog)
    }

    const onClickNonCascadeDelete = () => {
        handleDeletePipeline(DELETE_ACTION.NONCASCADE_DELETE, deleteCD, deploymentAppType)
    }

    const handleForceDeleteCDNode = () => {
        onClickHideNonCascadeDeletePopup()
        handleDeletePipeline(DELETE_ACTION.FORCE_DELETE, deleteCD, deploymentAppType)
    }

    const renderForceDeleteConfirmationModal = () => {
        const showForceDeleteModal: boolean = deleteDialog === DeleteDialogType.showForceDeleteDialog
        if (!showForceDeleteModal) return null
        return (
            <ForceDeleteConfirmationModal
                title={forceDeleteData.forceDeleteDialogTitle}
                onDelete={handleForceDeleteCDNode}
                closeConfirmationModal={hideDeleteModal}
                description={forceDeleteData.forceDeleteDialogMessage}
                showConfirmationModal={showForceDeleteModal}
            />
        )
    }

    const renderNonCascadeDescription = () => (
        <div className="flexbox dc__gap-12">
            <p className="fs-14 cn-7 lh-20">
                The underlying resources cannot be deleted as the cluster is not reachable at the moment.
            </p>
            <p className="fs-14 cn-7 lh-20">
                Do you still want to delete the deployment without deleting the resources?
            </p>
        </div>
    )

    const renderUnreachableClusterModal = () => {
        const showUnreachableContainerModal = deleteDialog === DeleteDialogType.showNonCascadeDeleteDialog
        if (!showUnreachableContainerModal) return null
        return (
            <ConfirmationModal
                variant={ConfirmationModalVariantType.warning}
                title={`The cluster ${clusterName} is not reachable`}
                buttonConfig={{
                    secondaryButtonConfig: {
                        text: 'Cancel',
                        onClick: onClickHideNonCascadeDeletePopup,
                    },
                    primaryButtonConfig: {
                        text: 'Force Delete',
                        onClick: onClickNonCascadeDelete,
                        isLoading,
                    },
                }}
                subtitle={renderNonCascadeDescription()}
                showConfirmationModal={showUnreachableContainerModal}
                handleClose={onClickHideNonCascadeDeletePopup}
            />
        )
    }

    const renderConfirmationDeleteModal = () => {
        if (deleteDialog !== DeleteDialogType.showNormalDeleteDialog) return null
        return (
            <ConfirmationModal
                variant={ConfirmationModalVariantType.delete}
                title={`Delete pipeline for '${deleteTitleName}' environment ?`}
                subtitle={`Are you sure you want to delete this CD Pipeline from '${appName}' application?`}
                buttonConfig={{
                    secondaryButtonConfig: {
                        text: 'Cancel',
                        onClick: hideDeleteModal,
                        disabled: isLoading,
                    },
                    primaryButtonConfig: {
                        text: 'Delete',
                        onClick: () => handleDeleteCDNodePipeline(deleteCD, deploymentAppType as DeploymentAppTypes),
                        isLoading,
                    },
                }}
                customInputConfig={{
                    identifier: 'delete-cd-node-input',
                    confirmationKeyword: deleteTitleName,
                }}
                showConfirmationModal={showDeleteDialog}
                handleClose={hideDeleteModal}
            />
        )
    }

    return (
        showDeleteDialog && (
            <>
                {renderConfirmationDeleteModal()}
                {renderForceDeleteConfirmationModal()}
                {renderUnreachableClusterModal()}
            </>
        )
    )
}

export default DeleteCDNode
