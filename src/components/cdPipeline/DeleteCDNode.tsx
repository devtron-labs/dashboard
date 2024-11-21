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

import { DeleteDialog, DeploymentAppTypes, ForceDeleteDialog } from '@devtron-labs/devtron-fe-common-lib'
import ClusterNotReachableDailog from '../common/ClusterNotReachableDailog/ClusterNotReachableDialog'
import { DELETE_ACTION } from '../../config'
import { DeleteCDNodeProps, DeleteDialogType } from './types'
import { handleDeleteCDNodePipeline, handleDeletePipeline } from './cdpipeline.util'

const DeleteCDNode = ({
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
            title={`Delete pipeline for '${deleteTitleName}' environment ?`}
            description={`Are you sure you want to delete this CD Pipeline from '${appName}' application?`}
            delete={() => handleDeleteCDNodePipeline(deleteCD, deploymentAppType as DeploymentAppTypes)}
            closeDelete={hideDeleteModal}
            apiCallInProgress={isLoading}
            showDeleteConfirmation
            deleteConfirmationText={deleteTitleName}
        />
    )
}

export default DeleteCDNode
