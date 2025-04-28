import { useEffect, useRef, useState } from 'react'

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
import { ANNOUNCEMENT_CONFIG, BannerVariant, ONLINE_BANNER_TIMEOUT } from './constants'
import { useVersionUpdateReload } from './useVersionUpdateReload'
import { getBannerConfig, getBannerIcon, getBannerTextColor, getButtonConfig } from './utils'

import './banner.scss'

const useEnterpriseLicenseConfig = importComponentFromFELibrary('useEnterpriseLicenseConfig', null, 'function')

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
        ANNOUNCEMENT_CONFIG.message ? shouldShowAnnouncementBanner() : false,
    )

    const licenseConfig = useEnterpriseLicenseConfig()
    const { updateToastRef } = useVersionUpdateReload()

    useEffect(() => {
        let timer: NodeJS.Timeout
        if (didMountRef.current) {
            if (isOnline) {
                setShowOnlineBanner(true)

                // Auto-hide online banner after timeout
                timer = setTimeout(() => setShowOnlineBanner(false), ONLINE_BANNER_TIMEOUT)
            }
        } else {
            didMountRef.current = true
            // Removing any toast explicitly due to race condition of offline toast for some users
            setShowOnlineBanner(false)
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

    const bannerVariant: BannerVariant = getCurrentBanner()

    if (!bannerVariant) return null

    const config = getBannerConfig({
        bannerVariant,
        isOnline,
        licenseType,
        enterpriseLicenseBarMessage,
    })

    if (!config) return null

    const actionButtons = getButtonConfig(bannerVariant, handleOpenLicenseDialog)
    const baseClassName = `w-100 ${config.rootClassName || ''} ${getBannerTextColor(bannerVariant)} ${config.isDismissible ? 'dc__grid banner-row' : 'flex'}`

    return (
        <div className={baseClassName}>
            {config.isDismissible && <div className="icon-dim-28" />}
            <div className="py-4 flex dc__gap-8 dc__align-center pr-16">
                <p className="flex dc__gap-8 m-0">
                    {!(isOnline && bannerVariant === BannerVariant.INTERNET_CONNECTIVITY) &&
                        getBannerIcon(bannerVariant, ANNOUNCEMENT_CONFIG.type, iconName)}

                    <div className="fs-12 fw-5 lh-20 dc__truncate">{config.text}</div>
                </p>

                {!(isOnline && bannerVariant === BannerVariant.INTERNET_CONNECTIVITY) && (
                    <div className="dc__no-shrink">
                        <Button {...actionButtons} />
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
