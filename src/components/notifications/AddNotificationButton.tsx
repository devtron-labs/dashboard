import { useNavigate } from 'react-router-dom'

import {
    Button,
    ButtonVariantType,
    ComponentSizeType,
    Icon,
    ROUTER_URLS,
    TOAST_ACCESS_DENIED,
    ToastManager,
    ToastVariantType,
} from '@devtron-labs/devtron-fe-common-lib'

export const AddNotificationButton = ({ disableEdit }: { disableEdit: boolean }) => {
    const navigate = useNavigate()
    const createNewNotification = () => {
        if (disableEdit) {
            ToastManager.showToast({
                variant: ToastVariantType.notAuthorized,
                description: TOAST_ACCESS_DENIED.SUBTITLE,
            })
        } else {
            navigate(`${ROUTER_URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS.NOTIFICATIONS}/new`)
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
