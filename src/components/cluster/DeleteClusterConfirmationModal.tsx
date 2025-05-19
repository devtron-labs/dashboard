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

import { DeleteComponentsName } from '../../config/constantMessaging'
import { deleteCluster } from './cluster.service'
import { DeleteClusterConfirmationModalProps } from './cluster.type'

const deleteInstalledCluster = importComponentFromFELibrary('deleteInstalledCluster', null, 'function')

const DeleteClusterConfirmationModal = ({
    clusterName,
    clusterId,
    handleClose,
    installationId,
    reload,
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
