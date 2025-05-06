import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useRegisterSW } from 'virtual:pwa-register/react'

import {
    API_STATUS_CODES,
    Icon,
    logExceptionToSentry,
    noop,
    ToastManager,
    ToastVariantType,
} from '@devtron-labs/devtron-fe-common-lib'

import { UPDATE_AVAILABLE_TOAST_PROGRESS_BG } from '@Config/constants'

import { VersionUpdateProps } from './types'

export const dismissToast = ({ updateToastRef }: { updateToastRef: React.MutableRefObject<null> }) => {
    if (ToastManager.isToastActive(updateToastRef.current)) {
        ToastManager.dismissToast(updateToastRef.current)
    }
}

export const useVersionUpdateReload = ({ showVersionUpdateToast, toastEligibleRoutes }: VersionUpdateProps) => {
    const refreshing = useRef(false)
    const [bgUpdated, setBGUpdated] = useState(false)
    const [doesNeedRefresh, setDoesNeedRefresh] = useState(false)
    const location = useLocation()

    const updateToastRef = useRef(null)

    const serviceWorkerTimeout = (() => {
        const parsedTimeout = parseInt(window._env_.SERVICE_WORKER_TIMEOUT, 10)
        if (parsedTimeout) {
            return parsedTimeout
        }
        return 3
    })()

    const handleUpdateServiceWorker = (updatedServiceWorker: (reloadPage?: boolean) => Promise<void>) => {
        dismissToast({ updateToastRef })
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        updatedServiceWorker(true)
    }

    const handleNeedRefresh = (updateServiceWorker: (reloadPage?: boolean) => Promise<void>) => {
        if (doesNeedRefresh) return
        setDoesNeedRefresh(true)
        if (typeof Storage !== 'undefined') {
            localStorage.removeItem('serverInfo')
        }
        dismissToast({ updateToastRef })
        if (toastEligibleRoutes.includes(location.pathname)) {
            updateToastRef.current = ToastManager.showToast(
                {
                    variant: ToastVariantType.info,
                    title: 'Update available',
                    description: 'You are viewing an outdated version of Devtron UI.',
                    buttonProps: {
                        text: 'Reload',
                        dataTestId: 'reload-btn',
                        onClick: () => handleUpdateServiceWorker(updateServiceWorker),
                        startIcon: <Icon name="ic-arrow-clockwise" color={null} />,
                    },
                    icon: <Icon name="ic-sparkle-color" color={null} />,
                    progressBarBg: UPDATE_AVAILABLE_TOAST_PROGRESS_BG,
                },
                {
                    autoClose: false,
                },
            )
        }
    }

    const {
        needRefresh: [needRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegisteredSW(swUrl, swRegistration) {
            console.log(`Service Worker at: ${swUrl}`)
            if (swRegistration) {
                const intervalId = setInterval(
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
                return () => clearInterval(intervalId)
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
        if (showVersionUpdateToast) {
            dismissToast({ updateToastRef })
        }

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        updateServiceWorker(true)
    }

    const handleControllerChange = () => {
        if (refreshing.current) {
            return
        }
        if (document.visibilityState === 'visible') {
            handleAppUpdate()
            refreshing.current = true
        } else {
            if (typeof setBGUpdated !== 'function') return
            setBGUpdated(true)
        }
    }

    useEffect(() => {
        if (!bgUpdated) {
            return
        }
        dismissToast({ updateToastRef })
        console.log(toastEligibleRoutes.includes(location.pathname), 'toast inside use effect')
        if (toastEligibleRoutes.includes(location.pathname)) {
            updateToastRef.current = ToastManager.showToast(
                {
                    variant: ToastVariantType.info,
                    title: 'Update available',
                    description: 'This page has been updated. Please save any unsaved changes and refresh.',
                    buttonProps: {
                        text: 'Reload',
                        dataTestId: 'reload-btn',
                        onClick: handleAppUpdate,
                        startIcon: <Icon name="ic-arrow-clockwise" color={null} />,
                    },
                    icon: <Icon name="ic-sparkle-color" color={null} />,
                    progressBarBg: UPDATE_AVAILABLE_TOAST_PROGRESS_BG,
                },
                {
                    autoClose: false,
                },
            )
        }
    }, [bgUpdated])

    // Sync local state with the service worker's needRefresh state
    useEffect(() => {
        if (needRefresh) {
            setDoesNeedRefresh(true)
        }
    }, [needRefresh])

    useEffect(() => {
        if (navigator.serviceWorker) {
            navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)
        }
        return () => {
            if (navigator.serviceWorker) {
                navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
            }
        }
    }, [])

    useEffect(() => {
        if (window.isSecureContext && navigator.serviceWorker) {
            // check for sw updates on page change
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            navigator.serviceWorker
                .getRegistrations()
                .then((registrations) => registrations.forEach((reg) => reg.update()))
            if (doesNeedRefresh && !refreshing.current) {
                handleNeedRefresh(updateServiceWorker)
            } else if (showVersionUpdateToast) {
                dismissToast({ updateToastRef })
            }
        }
    }, [location])

    return {
        bgUpdated,
        handleAppUpdate,
        doesNeedRefresh,
        updateServiceWorker,
        handleControllerChange,
        updateToastRef,
        isRefreshing: refreshing.current,
    }
}
