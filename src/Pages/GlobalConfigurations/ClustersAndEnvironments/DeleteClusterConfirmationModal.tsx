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

import { useState } from 'react'

import {
    Checkbox,
    CHECKBOX_VALUE,
    DC_DELETE_SUBTITLES,
    DeleteConfirmationModal,
    ERROR_STATUS_CODE,
    Tooltip,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'

import { DeleteComponentsName } from '../../../config/constantMessaging'
import { deleteCluster } from './cluster.service'
import { DeleteClusterConfirmationModalProps } from './cluster.type'

const deleteInstalledCluster = importComponentFromFELibrary('deleteInstalledCluster', null, 'function')

const DeleteClusterConfirmationModal = ({
    clusterName,
    clusterId,
    handleClose,
    installationId,
    reload,
    handleSuccess,
}: DeleteClusterConfirmationModalProps) => {
    const isClusterInCreationPhase = Number(clusterId) === 0

    const [shouldDeleteInstalledCluster, setShouldDeleteInstalledCluster] = useState(isClusterInCreationPhase)

    const handleDelete = async () => {
        if (shouldDeleteInstalledCluster && deleteInstalledCluster) {
            await deleteInstalledCluster(Number(installationId))
        }
        const numberedClusterId = Number(clusterId)
        // NOTE: suppose we are in cluster creation phase in that case
        // the cluster wouldn't have been added to cluster DB
        // In this case the clusterId will be 0
        if (!Number.isNaN(numberedClusterId) && numberedClusterId) {
            await deleteCluster({ id: numberedClusterId })
        }
        reload?.()
        handleSuccess?.()
    }

    const handleToggleShouldDeleteInstalledCluster = () => {
        setShouldDeleteInstalledCluster(!shouldDeleteInstalledCluster)
    }

    return (
        <DeleteConfirmationModal
            title={clusterName}
            component={DeleteComponentsName.Cluster}
            subtitle={DC_DELETE_SUBTITLES.DELETE_CLUSTER_SUBTITLES}
            onDelete={handleDelete}
            confirmationConfig={{ confirmationKeyword: clusterName, identifier: 'delete-cluster-confirmation-input' }}
            closeConfirmationModal={handleClose}
            errorCodeToShowCannotDeleteDialog={ERROR_STATUS_CODE.BAD_REQUEST}
        >
            {!!Number(installationId) && !!deleteInstalledCluster && (
                <Checkbox
                    value={CHECKBOX_VALUE.CHECKED}
                    isChecked={shouldDeleteInstalledCluster}
                    dataTestId="delete-installed-cluster"
                    disabled={isClusterInCreationPhase}
                    rootClassName="m-0"
                    onChange={handleToggleShouldDeleteInstalledCluster}
                >
                    <Tooltip
                        content="Since this cluster is being created, you can only delete the request and prevent its creation."
                        alwaysShowTippyOnHover={isClusterInCreationPhase}
                        placement="right"
                    >
                        <span>Delete cluster from AWS</span>
                    </Tooltip>
                </Checkbox>
            )}
        </DeleteConfirmationModal>
    )
}

export default DeleteClusterConfirmationModal
