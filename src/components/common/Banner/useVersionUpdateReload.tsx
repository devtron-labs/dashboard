import { MutableRefObject, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useRegisterSW } from 'virtual:pwa-register/react'

import {
    API_STATUS_CODES,
    Icon,
    logExceptionToSentry,
    noop,
    refresh,
    ToastManager,
    ToastVariantType,
} from '@devtron-labs/devtron-fe-common-lib'

import { UPDATE_AVAILABLE_TOAST_PROGRESS_BG } from '@Config/constants'

import { reloadLocation } from '../helpers/Helpers'

const dismissIfToastActive = (toastRef: MutableRefObject<any>) => {
    if (ToastManager.isToastActive(toastRef.current)) {
        ToastManager.dismissToast(toastRef.current)
    }
}

export const useVersionUpdateReload = () => {
    const refreshing = useRef(false)
    const updateToastRef = useRef(null)

    const [bgUpdated, setBGUpdated] = useState(false)

    const location = useLocation()

    function handleControllerChange() {
        if (refreshing.current) {
            return
        }
        if (document.visibilityState === 'visible') {
            refresh()
            refreshing.current = true
        } else {
            setBGUpdated(true)
        }
    }

    const serviceWorkerTimeout = (() => {
        const parsedTimeout = parseInt(window._env_.SERVICE_WORKER_TIMEOUT, 10)

        if (parsedTimeout) {
            return parsedTimeout
        }
        return 3
    })()

    function handleNeedRefresh(_updateServiceWorker) {
        dismissIfToastActive(updateToastRef)

        updateToastRef.current = ToastManager.showToast(
            {
                variant: ToastVariantType.info,
                title: 'Update available',
                description: 'You are viewing an outdated version of Devtron UI.',
                buttonProps: {
                    text: 'Reload',
                    dataTestId: 'reload-btn',
                    onClick: () => {
                        // Inline handleAppUpdate
                        dismissIfToastActive(updateToastRef)
                        // eslint-disable-next-line @typescript-eslint/no-floating-promises
                        _updateServiceWorker(true)
                    },
                    startIcon: <Icon name="ic-arrow-clockwise" color={null} />,
                },
                icon: <Icon name="ic-sparkle-color" color={null} />,
                progressBarBg: UPDATE_AVAILABLE_TOAST_PROGRESS_BG,
            },
            {
                autoClose: false,
            },
        )
        if (typeof Storage !== 'undefined') {
            localStorage.removeItem('serverInfo')
        }
    }

    const {
        needRefresh: [doesNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegisteredSW(swUrl, swRegistration) {
            console.log(`Service Worker at: ${swUrl}`)
            if (swRegistration) {
                setInterval(
                    async () => {
                        if (
                            swRegistration.installing ||
                            !navigator ||
                            ('connection' in navigator && !navigator.onLine)
                        ) {
                            return
                        }

                        try {
                            const resp = await fetch(swUrl, {
                                cache: 'no-store',
                                headers: {
                                    cache: 'no-store',
                                    'cache-control': 'no-cache',
                                },
                            })
                            if (resp?.status === API_STATUS_CODES.OK) {
                                await swRegistration.update()
                            }
                        } catch {
                            // Do nothing
                        }
                    },
                    serviceWorkerTimeout * 60 * 1000,
                )
            }
            return noop
        },
        onRegisterError(error) {
            console.error('SW registration error', error)
            logExceptionToSentry(error)
        },
        onNeedRefresh() {
            handleNeedRefresh(updateServiceWorker)
        },
    })

    const handleAppUpdate = () => {
        dismissIfToastActive(updateToastRef)

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        updateServiceWorker(true)
    }

    useEffect(() => {
        if (window.isSecureContext && navigator.serviceWorker) {
            // check for sw updates on page change
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            navigator.serviceWorker
                .getRegistrations()
                .then((registrations) => registrations.forEach((reg) => reg.update()))
            if (doesNeedRefresh) {
                handleAppUpdate()
            } else {
                dismissIfToastActive(updateToastRef)
            }
        }
    }, [location])

    useEffect(() => {
        if (!bgUpdated) {
            return
        }
        dismissIfToastActive(updateToastRef)

        updateToastRef.current = ToastManager.showToast(
            {
                variant: ToastVariantType.info,
                title: 'Update available',
                description: 'This page has been updated. Please save any unsaved changes and refresh.',
                buttonProps: {
                    text: 'Reload',
                    dataTestId: 'reload-btn',
                    onClick: reloadLocation,
                    startIcon: <Icon name="ic-arrow-clockwise" color={null} />,
                },
                icon: <Icon name="ic-sparkle-color" color={null} />,
                progressBarBg: UPDATE_AVAILABLE_TOAST_PROGRESS_BG,
            },
            {
                autoClose: false,
            },
        )
    }, [bgUpdated])

    return {
        updateToastRef,
        bgUpdated,
        handleAppUpdate,
        doesNeedRefresh,
        updateServiceWorker,
        handleControllerChange,
    }
}
