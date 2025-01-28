import { DELETE_ACTION } from '@Config/constants'
import { ApplicationDeletionInfo } from '@Pages/Shared/ApplicationDeletionInfo'
import { ConfirmationModal, ConfirmationModalVariantType } from '@devtron-labs/devtron-fe-common-lib'
import { DeleteChartDialogProps } from './ChartValuesView.type'
import { DELETE_PRESET_VALUE_DESCRIPTION_LINES } from './ChartValuesView.constants'

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
    const handleForceDelete = async () => {
        await handleDelete(DELETE_ACTION.DELETE)
    }

    const renderDeletionInfo = () =>
        isCreateValueView ? (
            <div className="fs-13 cn-7 flexbox-col dc__gap-12">
                <p className="lh-20 m-0">{DELETE_PRESET_VALUE_DESCRIPTION_LINES.First}</p>
                <p className="lh-20 m-0">{DELETE_PRESET_VALUE_DESCRIPTION_LINES.Second}</p>
            </div>
        ) : (
            <ApplicationDeletionInfo />
        )

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
                    onClick: handleForceDelete,
                    isLoading: disableButton,
                    disabled: disableButton,
                },
            }}
            subtitle={renderDeletionInfo()}
            showConfirmationModal={showConfirmationModal}
            handleClose={closeConfirmation}
        />
    )
}
