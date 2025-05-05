import { useEffect, useRef, useState } from 'react'
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

import { VersionUpdateProps } from './types'

export const useVersionUpdateReload = ({ showVersionUpdateToast }: VersionUpdateProps) => {
    const refreshing = useRef(false)
    const [bgUpdated, setBGUpdated] = useState(false)
    const [doesNeedRefresh, setDoesNeedRefresh] = useState(false)
    const location = useLocation()

    const updateToastRef = useRef(null)

    const handleControllerChange = () => {
        if (refreshing.current) {
            return
        }
        if (document.visibilityState === 'visible') {
            refresh()
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
        if (ToastManager.isToastActive(updateToastRef.current)) {
            ToastManager.dismissToast(updateToastRef.current)
        }

        updateToastRef.current = ToastManager.showToast(
            {
                variant: ToastVariantType.info,
                title: 'Update available',
                description: 'This page has been updated. Please save any unsaved changes and refresh.',
                buttonProps: {
                    text: 'Reload',
                    dataTestId: 'reload-btn',
                    onClick: refresh,
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

    const serviceWorkerTimeout = (() => {
        const parsedTimeout = parseInt(window._env_.SERVICE_WORKER_TIMEOUT, 10)
        if (parsedTimeout) {
            return parsedTimeout
        }
        return 3
    })()

    function handleNeedRefresh() {
        setDoesNeedRefresh(true)
        if (typeof Storage !== 'undefined') {
            localStorage.removeItem('serverInfo')
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
            handleNeedRefresh()
        },
    })

    // Sync local state with the service worker's needRefresh state
    useEffect(() => {
        if (needRefresh) {
            setDoesNeedRefresh(true)
        }
    }, [needRefresh])

    const handleAppUpdate = () => {
        if (ToastManager.isToastActive(updateToastRef.current) && showVersionUpdateToast) {
            ToastManager.dismissToast(updateToastRef.current)
        }
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
                handleNeedRefresh()
            } else if (ToastManager.isToastActive(updateToastRef.current) && showVersionUpdateToast) {
                ToastManager.dismissToast(updateToastRef.current)
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
    }
}
