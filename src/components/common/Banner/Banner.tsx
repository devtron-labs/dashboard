import { useEffect, useRef, useState } from 'react'

import { Button, ToastManager, ToastVariantType } from '@devtron-labs/devtron-fe-common-lib'

import { useOnline } from '../helpers/Helpers'
import { AnnouncementConfig, BANNER_VARIANT, INTERNET_CONNECTIVITY } from './constants'
import { buttonConfig, getBannerConfig, getBannerIconName } from './utils'

const ONLINE_BANNER_TIMEOUT = 5000 // 2 seconds

export const Banner = () => {
    const didMountRef = useRef(false)
    const onlineToastRef = useRef(null)

    // const [bgUpdated, setBGUpdated] = useState(false)
    const [showOnlineBanner, setShowOnlineBanner] = useState(false)
    const [internetConnectivity, setInternetConnectivity] = useState<INTERNET_CONNECTIVITY>(null)
    console.log(internetConnectivity)

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
