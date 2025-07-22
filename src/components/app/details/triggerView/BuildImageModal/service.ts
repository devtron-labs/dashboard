import {
    API_STATUS_CODES,
    ServerErrors,
    showError,
    TOAST_ACCESS_DENIED,
    ToastManager,
    ToastVariantType,
} from '@devtron-labs/devtron-fe-common-lib'

import { triggerCINode } from '@Components/app/service'
import { NO_TASKS_CONFIGURED_ERROR } from '@Config/constantMessaging'

import { TriggerBuildProps } from './types'

export const triggerBuild = async ({ payload, redirectToCIPipeline }: TriggerBuildProps) => {
    try {
        await triggerCINode(payload)
        ToastManager.showToast({
            variant: ToastVariantType.success,
            description: 'Pipeline Triggered',
        })
    } catch (errors) {
        if (errors.code === API_STATUS_CODES.PERMISSION_DENIED) {
            ToastManager.showToast({
                variant: ToastVariantType.notAuthorized,
                description: TOAST_ACCESS_DENIED.SUBTITLE,
            })
        } else if (
            errors instanceof ServerErrors &&
            Array.isArray(errors.errors) &&
            errors.code === API_STATUS_CODES.CONFLICT
        ) {
            errors.errors.map((err) =>
                ToastManager.showToast({
                    variant: ToastVariantType.error,
                    description: err.internalMessage,
                }),
            )
        } else {
            errors.errors.forEach((error) => {
                if (redirectToCIPipeline && error.userMessage === NO_TASKS_CONFIGURED_ERROR) {
                    ToastManager.showToast({
                        variant: ToastVariantType.error,
                        title: 'Nothing to execute',
                        description: error.userMessage,
                        buttonProps: {
                            text: 'Edit Pipeline',
                            dataTestId: 'edit-pipeline-btn',
                            onClick: redirectToCIPipeline,
                        },
                    })
                } else {
                    showError([error])
                }
            })
        }
        throw errors
    }
}
