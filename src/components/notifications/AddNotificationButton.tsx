import { useHistory } from 'react-router-dom'

import {
    Button,
    ButtonVariantType,
    ComponentSizeType,
    Icon,
    TOAST_ACCESS_DENIED,
    ToastManager,
    ToastVariantType,
} from '@devtron-labs/devtron-fe-common-lib'

import { URLS } from '@Config/routes'

export const AddNotificationButton = ({ disableEdit }: { disableEdit: boolean }) => {
    const history = useHistory()
    const createNewNotification = () => {
        if (disableEdit) {
            ToastManager.showToast({
                variant: ToastVariantType.notAuthorized,
                description: TOAST_ACCESS_DENIED.SUBTITLE,
            })
        } else {
            history.push(URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS_NOTIFICATIONS_ADD_NEW)
        }
    }

    return (
        <Button
            text="Add Notification"
            variant={ButtonVariantType.primary}
            size={ComponentSizeType.medium}
            onClick={createNewNotification}
            dataTestId="add-notification-button"
            startIcon={<Icon name="ic-add" color={null} />}
        />
    )
}
