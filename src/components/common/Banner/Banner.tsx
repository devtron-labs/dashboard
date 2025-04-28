import { useEffect, useMemo, useRef, useState } from 'react'

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    getDateInMilliseconds,
    Icon,
    setActionWithExpiry,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary, useOnline } from '../helpers/Helpers'
import { AnnouncementConfig, BannerVariant, ONLINE_BANNER_TIMEOUT } from './constants'
import { useVersionUpdateReload } from './useVersionUpdateReload'
import { buttonConfig, getBannerConfig, getBannerIconName, getBannerTextColor } from './utils'

import './banner.scss'

const useEnterPriceLicenseConfig = importComponentFromFELibrary('useEnterPriceLicenseConfig', null, 'function')

const shouldShowAnnouncementBanner = (): boolean => {
    const expiry = localStorage.getItem('expiryDateOfHidingAnnouncementBanner')
    const loginTime = localStorage.getItem('dashboardLoginTime')
    if (!expiry) return true
    return getDateInMilliseconds(loginTime) > getDateInMilliseconds(expiry)
}

export const Banner = () => {
    const didMountRef = useRef(false)
    const isOnline = useOnline()

    const [showOnlineBanner, setShowOnlineBanner] = useState(false)
    const [showAnnouncementBanner, setShowAnnouncementBanner] = useState(
        AnnouncementConfig.message ? shouldShowAnnouncementBanner() : false,
    )

    const licenseConfig = useEnterPriceLicenseConfig()
    const { updateToastRef } = useVersionUpdateReload()

    useEffect(() => {
        let timer: NodeJS.Timeout
        if (didMountRef.current) {
            if (!isOnline) {
                setShowOnlineBanner(false)
            } else {
                setShowOnlineBanner(true)

                // Auto-hide online banner after timeout
                timer = setTimeout(() => setShowOnlineBanner(false), ONLINE_BANNER_TIMEOUT)
            }
        } else {
            didMountRef.current = true
            // Removing any toast explicitly due to race condition of offline toast for some users
            setShowOnlineBanner(false)

            if (isOnline) {
                timer = setTimeout(() => {
                    setShowOnlineBanner(false)
                }, ONLINE_BANNER_TIMEOUT)
            }
        }
        return () => clearTimeout(timer)
    }, [isOnline])

    const onClickCloseAnnouncementBanner = () => {
        setShowAnnouncementBanner(false)
        if (typeof Storage !== 'undefined') {
            setActionWithExpiry('expiryDateOfHidingAnnouncementBanner', 1)
        }
    }

    const {
        message: enterpriseLicenseBarMessage = '',
        type: licenseType = 'help',
        iconName = '',
        handleOpenLicenseDialog,
    } = licenseConfig || {}

    const getCurrentBanner = (): BannerVariant => {
        if (!isOnline) return BannerVariant.INTERNET_CONNECTIVITY
        if (showOnlineBanner) return BannerVariant.INTERNET_CONNECTIVITY
        if (updateToastRef.current) return BannerVariant.VERSION_UPDATE
        if (showAnnouncementBanner) return BannerVariant.ANNOUNCEMENT
        if (licenseConfig?.message) return BannerVariant.LICENSE
        return null
    }

    const bannerVariant: BannerVariant = useMemo(
        () => getCurrentBanner(),
        [isOnline, showOnlineBanner, updateToastRef.current, showAnnouncementBanner, enterpriseLicenseBarMessage],
    )
    if (!bannerVariant) return null

    const config = getBannerConfig(
        bannerVariant,
        isOnline,
        AnnouncementConfig,
        licenseType,
        enterpriseLicenseBarMessage,
    )

    if (!config) return null

    const buttons = buttonConfig(bannerVariant, handleOpenLicenseDialog)
    const baseClassName = `w-100 ${config.rootClassName || ''} ${getBannerTextColor(bannerVariant)} ${config.isDismissible ? 'banner-row' : 'flex'}`

    return (
        <div className={baseClassName}>
            {config.isDismissible && <div className="icon-dim-28" />}
            <div className="py-4 flex dc__gap-8 dc__align-center pr-16">
                <p className="flex dc__gap-8 m-0 ">
                    {!(isOnline && bannerVariant === BannerVariant.INTERNET_CONNECTIVITY) &&
                        getBannerIconName(bannerVariant, AnnouncementConfig.type, iconName)}

                    <div className="fs-12 fw-5 lh-20 dc__truncate">{config.text}</div>
                </p>

                {!(isOnline && bannerVariant === BannerVariant.INTERNET_CONNECTIVITY) && (
                    <div className="dc__no-shrink">
                        <Button {...buttons} />
                    </div>
                )}
            </div>
            {config.isDismissible && (
                <Button
                    icon={<Icon name="ic-close-small" color="N700" />}
                    variant={ButtonVariantType.borderLess}
                    style={ButtonStyleType.negativeGrey}
                    size={ComponentSizeType.small}
                    onClick={onClickCloseAnnouncementBanner}
                    dataTestId="banner-dismiss-button"
                    ariaLabel="Close banner"
                    showAriaLabelInTippy={false}
                />
            )}
        </div>
    )
}
