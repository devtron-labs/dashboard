import { useState } from 'react'

import {
    DeleteDialog,
    DraftAction,
    showError,
    ToastManager,
    ToastVariantType,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'

import { deleteEnvSecret, deleteEnvConfigMap, deleteSecret, deleteConfig } from './ConfigMapSecret.service'
import { CM_SECRET_COMPONENT_NAME } from './constants'
import { CMSecretComponentType, ConfigMapSecretDeleteModalProps } from './types'

const DeleteModal = importComponentFromFELibrary('DeleteModal')
const DeleteOverrideDraftModal = importComponentFromFELibrary('DeleteOverrideDraftModal')

export const ConfigMapSecretDeleteModal = ({
    appId,
    envId,
    componentType,
    id,
    configName,
    openDeleteModal,
    draftData,
    closeDeleteModal,
    updateCMSecret,
    handleError,
}: ConfigMapSecretDeleteModalProps) => {
    // STATES
    const [isDeleting, setIsDeleting] = useState(false)

    // CONSTANTS
    const isDeleteOverride = !!envId

    // METHODS
    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            if (isDeleteOverride) {
                if (componentType === CMSecretComponentType.Secret) {
                    await deleteEnvSecret(id, appId, envId, configName)
                } else {
                    await deleteEnvConfigMap(id, appId, envId, configName)
                }

                ToastManager.showToast({
                    variant: ToastVariantType.success,
                    description: 'Restored to global.',
                })
            } else {
                if (componentType === CMSecretComponentType.Secret) {
                    await deleteSecret(id, appId, configName)
                } else {
                    await deleteConfig(id, appId, configName)
                }

                ToastManager.showToast({
                    variant: ToastVariantType.success,
                    description: 'Successfully deleted',
                })
            }

            setIsDeleting(false)
            updateCMSecret()
            closeDeleteModal()
        } catch (err) {
            setIsDeleting(false)
            handleError(DraftAction.Delete, err)
            showError(err)
        }
    }

    const prepareDataToDeleteOverrideDraft = () => ({ id })

    // RENDERERS
    const renderProtectedDeleteModal = () => {
        if (isDeleteOverride) {
            return DeleteOverrideDraftModal ? (
                <DeleteOverrideDraftModal
                    appId={+appId}
                    envId={envId ? +envId : -1}
                    resourceType={componentType}
                    resourceName={configName}
                    prepareDataToSave={prepareDataToDeleteOverrideDraft}
                    toggleModal={closeDeleteModal}
                    latestDraft={draftData}
                    reload={updateCMSecret}
                />
            ) : null
        }

        return DeleteModal ? (
            <DeleteModal
                id={id}
                appId={+appId}
                envId={envId ? +envId : -1}
                resourceType={componentType}
                resourceName={configName}
                latestDraft={draftData}
                toggleModal={closeDeleteModal}
                reload={updateCMSecret}
            />
        ) : null
    }

    const renderDeleteModal = () => (
        <DeleteDialog
            title={
                isDeleteOverride
                    ? 'Delete override ?'
                    : `Delete ${CM_SECRET_COMPONENT_NAME[componentType]} '${configName}' ?`
            }
            description={
                isDeleteOverride
                    ? 'Are you sure you want to delete the modified configuration. This action can’t be undone.'
                    : `'${configName}' will not be used in future deployments. Are you sure?`
            }
            closeDelete={closeDeleteModal}
            delete={handleDelete}
            apiCallInProgress={isDeleting}
        />
    )

    if (!openDeleteModal) {
        return null
    }

    return openDeleteModal === 'protectedDeleteModal' ? renderProtectedDeleteModal() : renderDeleteModal()
}
