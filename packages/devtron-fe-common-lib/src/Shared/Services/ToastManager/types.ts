import { ButtonProps } from '@Shared/Components'
import { ReactElement } from 'react'

export enum ToastVariantType {
    info = 'info',
    success = 'success',
    error = 'error',
    warn = 'warn',
    notAuthorized = 'notAuthorized',
}

export interface ToastProps {
    /**
     * Title for the toast
     * If not provided, defaults to a value based on the selected variant
     */
    title?: string
    /**
     * Description for the toast
     */
    description: string
    /**
     * Custom icon for the toast to override the icon based on variant
     */
    icon?: ReactElement
    /**
     * Variant for the toast
     *
     * @default ToastVariantType.info
     */
    variant?: ToastVariantType
    /**
     * Props for the action button to be displayed in the toast
     *
     * Note: Size, variant and style are hard-coded and cannot be overriden
     */
    buttonProps?: ButtonProps
    /**
     * Custom progress bar color
     */
    progressBarBg?: string
}
