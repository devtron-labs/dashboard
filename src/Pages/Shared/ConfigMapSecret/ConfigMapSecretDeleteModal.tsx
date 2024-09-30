import { useState } from 'react'

import { DeleteDialog, showError, ToastManager, ToastVariantType } from '@devtron-labs/devtron-fe-common-lib'

import {
    deleteEnvSecret,
    deleteEnvConfigMap,
    deleteSecret,
    deleteConfig,
} from '../ConfigMapSecretOld/ConfigMapSecret.service'

import { CM_SECRET_COMPONENT_NAME } from './constants'
import { CMSecretComponentType, ConfigMapSecretDeleteModalProps } from './types'

export const ConfigMapSecretDeleteModal = ({
    appId,
    envId,
    componentType,
    id,
    configMapSecretData,
    closeDeleteModal,
    updateCMSecret,
}: ConfigMapSecretDeleteModalProps) => {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            if (!envId) {
                if (componentType === CMSecretComponentType.Secret) {
                    await deleteSecret(id, appId, configMapSecretData.name)
                } else {
                    await deleteConfig(id, appId, configMapSecretData.name)
                }
            } else if (componentType === CMSecretComponentType.Secret) {
                await deleteEnvSecret(id, appId, envId, configMapSecretData.name)
            } else {
                await deleteEnvConfigMap(id, appId, envId, configMapSecretData.name)
            }

            setIsDeleting(false)
            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: 'Successfully deleted',
            })
            updateCMSecret()
        } catch (err) {
            setIsDeleting(false)
            showError(err)
        }
    }

    return (
        <DeleteDialog
            title={`Delete ${CM_SECRET_COMPONENT_NAME[componentType]} '${configMapSecretData.name}' ?`}
            description={`'${configMapSecretData.name}' will not be used in future deployments. Are you sure?`}
            closeDelete={closeDeleteModal}
            delete={handleDelete}
            apiCallInProgress={isDeleting}
        />
    )
}
