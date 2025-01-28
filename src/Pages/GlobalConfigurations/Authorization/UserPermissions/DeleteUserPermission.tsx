import {
    USER_PERMISSION_DELETE_CONFIRMATION_MESSAGE,
    DeleteComponentsName,
    USER_PERMISSION_GROUP_DELETE_CONFIRMATION_MESSAGE,
} from '@Config/constantMessaging'
import { DeleteConfirmationModal } from '@devtron-labs/devtron-fe-common-lib'
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
        subtitle={
            isUserGroup
                ? USER_PERMISSION_GROUP_DELETE_CONFIRMATION_MESSAGE
                : USER_PERMISSION_DELETE_CONFIRMATION_MESSAGE
        }
        component={isUserGroup ? DeleteComponentsName.GROUP : DeleteComponentsName.USER}
        onDelete={onDelete}
        reload={reload}
        showConfirmationModal={showConfirmationModal}
        closeConfirmationModal={closeConfirmationModal}
    />
)
