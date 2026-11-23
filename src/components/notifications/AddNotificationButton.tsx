import { useLocation, useNavigate } from 'react-router-dom'

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

import { NotificationTabsTypes } from './constants'

export const AddNotificationButton = ({ disableEdit }: { disableEdit: boolean }) => {
    const navigate = useNavigate()
    const { pathname } = useLocation()

    // One button in the page header serves every tab, so the target depends on
    // which one is active. On Configurations it keeps falling through to the
    // CI/CD form, as it did before the audit log tab existed.
    const isAuditLogTab = pathname.includes(`/${NotificationTabsTypes.AUDIT_LOG}`)

    const createNewNotification = () => {
        if (disableEdit) {
            ToastManager.showToast({
                variant: ToastVariantType.notAuthorized,
                description: TOAST_ACCESS_DENIED.SUBTITLE,
            })
        } else {
            navigate(
                isAuditLogTab
                    ? ROUTER_URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS.NOTIFICATIONS_AUDIT_LOG_ADD_NEW
                    : `${ROUTER_URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS.NOTIFICATIONS}/new`,
            )
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
