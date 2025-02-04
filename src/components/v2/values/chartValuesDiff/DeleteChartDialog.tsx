import { DELETE_ACTION } from '@Config/constants'
import { ApplicationDeletionInfo } from '@Pages/Shared/ApplicationDeletionInfo/ApplicationDeletionInfo'
import { ConfirmationModal, ConfirmationModalVariantType } from '@devtron-labs/devtron-fe-common-lib'
import { DeleteChartDialogProps } from './ChartValuesView.type'

export const DeleteChartDialog = ({
    appName,
    handleDelete,
    toggleConfirmation,
    isCreateValueView,
    disableButton,
    showConfirmationModal,
}: DeleteChartDialogProps) => {
    const closeConfirmation = () => {
        toggleConfirmation(false)
    }
    const onClickDelete = async () => {
        await handleDelete(DELETE_ACTION.DELETE)
    }

    return (
        // Using Confirmation modal instead of DeleteConfirmation as handleForceDelete function is handling multiple actions in error case
        <ConfirmationModal
            title={`Delete chart '${appName}' ?`}
            variant={ConfirmationModalVariantType.delete}
            buttonConfig={{
                secondaryButtonConfig: {
                    text: 'Cancel',
                    onClick: closeConfirmation,
                },
                primaryButtonConfig: {
                    text: 'Delete',
                    onClick: onClickDelete,
                    isLoading: disableButton,
                    disabled: disableButton,
                },
            }}
            subtitle={<ApplicationDeletionInfo isPresetValue={isCreateValueView} />}
            showConfirmationModal={showConfirmationModal}
            handleClose={closeConfirmation}
        />
    )
}
