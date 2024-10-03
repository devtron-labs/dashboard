import { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
    BaseURLParams,
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ConfirmationDialog,
    showError,
    ToastManager,
    ToastVariantType,
} from '@devtron-labs/devtron-fe-common-lib'
import warningIcon from '@Images/warning-medium.svg'
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
            if (error.code === 423) {
                handleProtectionError()
                reloadEnvironments()
            }
        } finally {
            setIsDeletingOverride(false)
        }
    }

    return (
        <ConfirmationDialog>
            <ConfirmationDialog.Icon src={warningIcon} />
            <ConfirmationDialog.Body
                title="This action will cause permanent removal."
                subtitle="This action will cause all overrides to erase and app level configuration will be applied"
            />
            <ConfirmationDialog.ButtonGroup>
                <button
                    data-testid="cancel-changes-button"
                    type="button"
                    className="cta cancel"
                    onClick={handleClose}
                    disabled={isDeletingOverride}
                >
                    Cancel
                </button>

                <Button
                    dataTestId="confirm-changes-button"
                    variant={ButtonVariantType.primary}
                    onClick={handleDelete}
                    style={ButtonStyleType.negative}
                    isLoading={isDeletingOverride}
                    text="Confirm"
                />
            </ConfirmationDialog.ButtonGroup>
        </ConfirmationDialog>
    )
}

export default DeleteOverrideDialog
