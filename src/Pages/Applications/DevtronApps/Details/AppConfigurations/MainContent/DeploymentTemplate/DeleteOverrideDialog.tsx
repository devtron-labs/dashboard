import { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
    API_STATUS_CODES,
    BaseURLParams,
    DeleteDialog,
    showError,
    ToastManager,
    ToastVariantType,
} from '@devtron-labs/devtron-fe-common-lib'
import { DeleteOverrideDialogProps } from './types'
import { deleteOverrideDeploymentTemplate } from './service'

const DeleteOverrideDialog = ({
    environmentConfigId,
    handleReload,
    handleClose,
    handleProtectionError,
    reloadEnvironments,
}: DeleteOverrideDialogProps) => {
    const { appId, envId } = useParams<BaseURLParams>()
    const [isDeletingOverride, setIsDeletingOverride] = useState<boolean>(false)

    const handleDelete = async () => {
        try {
            setIsDeletingOverride(true)
            await deleteOverrideDeploymentTemplate(environmentConfigId, Number(appId), Number(envId))
            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: 'Restored to global.',
            })
            handleClose()
            handleReload()
        } catch (error) {
            showError(error)
            if (error.code === API_STATUS_CODES.LOCKED) {
                handleProtectionError()
                reloadEnvironments()
            }
        } finally {
            setIsDeletingOverride(false)
        }
    }

    return (
        <DeleteDialog
            title="Delete override"
            description="This action will result in the removal of all overrides, and the original base configurations for this file will be reinstated."
            delete={handleDelete}
            closeDelete={handleClose}
            apiCallInProgress={isDeletingOverride}
            disabled={isDeletingOverride}
            deletePostfix=" Override"
        />
    )
}

export default DeleteOverrideDialog
