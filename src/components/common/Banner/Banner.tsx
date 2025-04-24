import { MutableRefObject, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useRegisterSW } from 'virtual:pwa-register/react'

import {
    API_STATUS_CODES,
    Button,
    Icon,
    logExceptionToSentry,
    noop,
    ToastManager,
    ToastVariantType,
} from '@devtron-labs/devtron-fe-common-lib'

import { UPDATE_AVAILABLE_TOAST_PROGRESS_BG } from '@Config/constants'

import { reloadLocation, useOnline } from '../helpers/Helpers'
import { AnnouncementConfig, BANNER_VARIANT, INTERNET_CONNECTIVITY } from './constants'
import { buttonConfig, getBannerConfig, getBannerIconName } from './utils'

const ONLINE_BANNER_TIMEOUT = 5000 // 2 seconds

const dismissIfToastActive = (toastRef: MutableRefObject<any>) => {
    if (ToastManager.isToastActive(toastRef.current)) {
        ToastManager.dismissToast(toastRef.current)
    }
}

export const Banner = () => {
    const didMountRef = useRef(false)
    const onlineToastRef = useRef(null)
    const refreshing = useRef(false)
    const updateToastRef = useRef(null)

    const [bgUpdated, setBGUpdated] = useState(false)
    const [showOnlineBanner, setShowOnlineBanner] = useState(false)
    const [internetConnectivity, setInternetConnectivity] = useState<INTERNET_CONNECTIVITY>(null)
    console.log(internetConnectivity)

    const location = useLocation()

    const isOnline = useOnline()

    const getHierarchialBannerView = (): BANNER_VARIANT => {
        if (!isOnline) {
            return BANNER_VARIANT.INTERNET_CONNECTIVITY
        }
        // Show online banner temporarily if needed
        if (showOnlineBanner) {
            return BANNER_VARIANT.INTERNET_CONNECTIVITY
        }
        if (AnnouncementConfig.message) {
            return BANNER_VARIANT.ANNOUNCEMENT
        }
        return BANNER_VARIANT.VERSION_UPDATE
    }

    const bannerView: BANNER_VARIANT = getHierarchialBannerView()
    const config = getBannerConfig(bannerView, isOnline, AnnouncementConfig)
    const baseClassName = `${config.rootClassName} ${bannerView === BANNER_VARIANT.INTERNET_CONNECTIVITY || bannerView === BANNER_VARIANT.VERSION_UPDATE ? 'text__white' : 'cn-9'}`

    // Reload-----------------------

    function handleControllerChange() {
        if (refreshing.current) {
            return
        }
        if (document.visibilityState === 'visible') {
            window.location.reload()
            refreshing.current = true
        } else {
            setBGUpdated(true)
        }
    }

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
        // TODO: Why is this needed
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

    // ----------------------------

    function onlineToast(...showToastParams: Parameters<typeof ToastManager.showToast>) {
        if (onlineToastRef.current && ToastManager.isToastActive(onlineToastRef.current)) {
            ToastManager.dismissToast(onlineToastRef.current)
            setInternetConnectivity(INTERNET_CONNECTIVITY.OFFLINE)
        }
        onlineToastRef.current = ToastManager.showToast(...showToastParams)
        setInternetConnectivity(INTERNET_CONNECTIVITY.ONLINE)
    }
    useEffect(() => {
        let timer: NodeJS.Timeout
        if (didMountRef.current) {
            if (!isOnline) {
                onlineToast(
                    {
                        variant: ToastVariantType.error,
                        title: 'You are offline!',
                        description: 'You are not seeing real-time data and any changes you make will not be saved.',
                    },
                    {
                        autoClose: false,
                    },
                )
                setInternetConnectivity(INTERNET_CONNECTIVITY.OFFLINE)
                setShowOnlineBanner(false)
            } else {
                onlineToast({
                    variant: ToastVariantType.success,
                    title: 'Connected!',
                    description: "You're back online.",
                })
                setInternetConnectivity(INTERNET_CONNECTIVITY.ONLINE)
                setShowOnlineBanner(true)

                // Auto-hide online banner after timeout
                timer = setTimeout(() => setShowOnlineBanner(false), ONLINE_BANNER_TIMEOUT)
            }
        } else {
            didMountRef.current = true
            // Removing any toast explicitly due to race condition of offline toast for some users
            ToastManager.dismissToast(onlineToastRef.current)
            setInternetConnectivity(isOnline ? INTERNET_CONNECTIVITY.ONLINE : INTERNET_CONNECTIVITY.OFFLINE)
            setShowOnlineBanner(isOnline)

            if (isOnline) {
                timer = setTimeout(() => {
                    setShowOnlineBanner(false)
                }, ONLINE_BANNER_TIMEOUT)
            }
        }
        return () => clearTimeout(timer)
    }, [isOnline])

    const buttons = buttonConfig(bannerView)

    return (
        <div className={`px-20 py-4 flex w-100 dc__gap-12 ${baseClassName}`}>
            <p className="flex dc__gap-8 m-0 dc__mxw-92-per">
                {!(isOnline && bannerView === BANNER_VARIANT.INTERNET_CONNECTIVITY) &&
                    getBannerIconName(bannerView, AnnouncementConfig.type)}

                <span className="fs-12 fw-5 lh-20">{config.text}</span>
            </p>
            {Array.isArray(buttons)
                ? buttons.map((button) => <Button key={button.dataTestId} {...button} />)
                : buttons && <Button {...buttons} />}
        </div>
    )
}
