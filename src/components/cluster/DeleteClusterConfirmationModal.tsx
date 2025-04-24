import { useState } from 'react'

import {
    Checkbox,
    CHECKBOX_VALUE,
    DC_DELETE_SUBTITLES,
    DeleteConfirmationModal,
    ERROR_STATUS_CODE,
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
    const [shouldDeleteInstalledCluster, setShouldDeleteInstalledCluster] = useState(false)

    const handleDelete = async () => {
        if (shouldDeleteInstalledCluster && deleteInstalledCluster) {
            await deleteInstalledCluster(Number(installationId))
        }
        await deleteCluster({ id: Number(clusterId) })
        reload()
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
            {!!installationId && !!deleteInstalledCluster && (
                <Checkbox
                    value={CHECKBOX_VALUE.CHECKED}
                    isChecked={shouldDeleteInstalledCluster}
                    dataTestId="delete-installed-cluster"
                    rootClassName="m-0"
                    onChange={handleToggleShouldDeleteInstalledCluster}
                >
                    Delete cluster from AWS
                </Checkbox>
            )}
        </DeleteConfirmationModal>
    )
}

export default DeleteClusterConfirmationModal
