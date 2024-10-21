// eslint-disable-next-line no-restricted-imports
import { toast, ToastContainer, ToastOptions } from 'react-toastify'
import { ToastProps, ToastVariantType } from './types'
import { TOAST_BASE_CONFIG, TOAST_VARIANT_TO_CONFIG_MAP } from './constants'
import { ToastContent } from './ToastContent'
import './toastManager.scss'

/**
 * Service for handling toast across the application
 *
 * Note: The application needs to have `ToastManagerContainer` at the root
 * level for the toast to work
 *
 * @example Default Usage
 * ```ts
 * ToastManager.showToast({
 *   description: 'Lorem ipsum'
 * })
 * ```
 *
 * @example Custom Title
 * ```ts
 * ToastManager.showToast({
 *   description: 'Lorem ipsum',
 *   title: 'Toast title'
 * })
 * ```
 *
 * @example With Button
 * ```ts
 * ToastManager.showToast({
 *   description: 'Lorem ipsum',
 *   buttonProps: {
 *     dataTestId: 'toast-btn',
 *     text: 'Reload',
 *     startIcon: <ICArrowClockwise />
 *   }
 * })
 * ```
 *
 * @example Auto close disabled
 * ```ts
 * ToastManager.showToast({
 *   description: 'Lorem ipsum',
 *   toastOptions: {
 *     autoClose: false,
 *   },
 * })
 * ```
 *
 * @example Custom progress bar color
 * ```ts
 * ToastManager.showToast({
 *   description: 'Lorem ipsum',
 *   progressBarBg: 'var(--N700)',
 * })
 * ```
 *
 * @example Custom icon
 * ```ts
 * ToastManager.showToast({
 *   description: 'Lorem ipsum',
 *   icon: <ICCube />,
 * })
 * ```
 */
class ToastManager {
    // eslint-disable-next-line no-use-before-define
    static #instance: ToastManager

    public static get instance(): ToastManager {
        if (!ToastManager.#instance) {
            ToastManager.#instance = new ToastManager()
        }

        return ToastManager.#instance
    }

    /**
     * Handler for showing the toast
     */
    // eslint-disable-next-line class-methods-use-this
    showToast = (
        {
            variant = ToastVariantType.info,
            icon: customIcon,
            title,
            description,
            buttonProps,
            progressBarBg: customProgressBarBg,
        }: ToastProps,
        options: Pick<ToastOptions, 'autoClose'> = {},
    ) => {
        const { icon, type, title: defaultTitle, progressBarBg } = TOAST_VARIANT_TO_CONFIG_MAP[variant]

        return toast(
            <ToastContent title={title || defaultTitle} description={description} buttonProps={buttonProps} />,
            {
                ...options,
                icon: () => (
                    <div className="dc__no-shrink flex dc__fill-available-space icon-dim-20">{customIcon ?? icon}</div>
                ),
                type,
                progressStyle: {
                    background: customProgressBarBg || progressBarBg,
                },
                // Show the progress bar if the auto close is disabled
                ...(options.autoClose === false
                    ? {
                          progress: 1,
                      }
                    : {}),
            },
        )
    }

    /**
     * Handler for dismissing an existing toast
     */
    dismissToast = toast.dismiss

    /**
     * Handler for checking if the toast is active
     */
    isToastActive = toast.isActive
}

export const ToastManagerContainer = () => <ToastContainer {...TOAST_BASE_CONFIG} />

export default ToastManager.instance
