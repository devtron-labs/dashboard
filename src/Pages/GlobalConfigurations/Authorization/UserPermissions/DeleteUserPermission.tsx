import {
    USER_PERMISSION_DELETE_CONFIRMATION_MESSAGE,
    DeleteComponentsName,
    USER_PERMISSION_GROUP_DELETE_CONFIRMATION_MESSAGE,
} from '@Config/constantMessaging'
import { DeleteConfirmationModal } from '@Config/DeleteConfigurationModal'
import { DeleteUserPermissionProps } from '../types'

export const DeleteUserPermission = ({
    title,
    onDelete,
    reload,
    showConfirmationModal,
    closeConfirmationModal,
    isUserGroup,
}: DeleteUserPermissionProps) => (
    <DeleteConfirmationModal
        title={title}
        description={
            isUserGroup
                ? USER_PERMISSION_GROUP_DELETE_CONFIRMATION_MESSAGE
                : USER_PERMISSION_DELETE_CONFIRMATION_MESSAGE
        }
        component={isUserGroup ? DeleteComponentsName.GROUP : DeleteComponentsName.USER}
        onDelete={onDelete}
        reload={reload}
        showConfirmationModal={showConfirmationModal}
        closeConfirmationModal={closeConfirmationModal}
        dataTestId="dialog"
    />
)
