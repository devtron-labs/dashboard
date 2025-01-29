import { DeleteComponentsName, DC_ENVIRONMENT_CONFIRMATION_MESSAGE } from '@Config/constantMessaging'
import { DeleteConfirmationModal, ERROR_STATUS_CODE } from '@devtron-labs/devtron-fe-common-lib'
import { EnvironmentDeleteComponentProps } from './ClusterEnvironmentDrawer/types'

export const EnvironmentDeleteComponent = ({
    environmentName,
    onDelete,
    showConfirmationModal,
    closeConfirmationModal,
}: EnvironmentDeleteComponentProps) => (
    <DeleteConfirmationModal
        title={environmentName}
        component={DeleteComponentsName.Environment}
        renderCannotDeleteConfirmationSubTitle={DC_ENVIRONMENT_CONFIRMATION_MESSAGE}
        onDelete={onDelete}
        showConfirmationModal={showConfirmationModal}
        closeConfirmationModal={closeConfirmationModal}
        errorCodeToShowCannotDeleteDialog={ERROR_STATUS_CODE.BAD_REQUEST}
    />
)
