import { ConfirmationModal, ConfirmationModalVariantType } from '@devtron-labs/devtron-fe-common-lib'

import { SSO_CONFIG } from './constants'
import { UserPermissionConfirmationModalProps } from './types'

const UserPermissionConfirmationModal = ({
    handleCancel,
    handleSave,
    isLoading,
    ssoType,
}: UserPermissionConfirmationModalProps) => {
    if (!SSO_CONFIG[ssoType]) {
        return null
    }
    return (
        <ConfirmationModal
            variant={ConfirmationModalVariantType.warning}
            title="Existing user permissions (if any) will be removed"
            subtitle={`After saving, user permissions will be managed via Permission Groups mapped with Groups on ${SSO_CONFIG[ssoType].permissionGroupName}.`}
            buttonConfig={{
                secondaryButtonConfig: {
                    text: 'Cancel',
                    onClick: handleCancel,
                    disabled: isLoading,
                },
                primaryButtonConfig: {
                    text: 'Save changes',
                    onClick: handleSave,
                    isLoading,
                },
            }}
            handleClose={handleCancel}
        >
            <span className="fs-13 lh-21 cn-7 fw-4">Are you sure you want to save the changes?</span>
        </ConfirmationModal>
    )
}

export default UserPermissionConfirmationModal
