import { useEffect, useRef, useState } from 'react'

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    getDateInMilliseconds,
    Icon,
    setActionWithExpiry,
    ToastManager,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary, useOnline } from '../helpers/Helpers'
import { AnnouncementConfig, BannerVariant, ONLINE_BANNER_TIMEOUT } from './constants'
import { useVersionUpdateReload } from './useVersionUpdateReload'
import { buttonConfig, getBannerConfig, getBannerIconName } from './utils'

import './banner.scss'

const useEnterPriceLicenseConfig = importComponentFromFELibrary('useEnterPriceLicenseConfig', null, 'function')

export const Banner = () => {
    const didMountRef = useRef(false)
    const onlineToastRef = useRef(null)
    const isOnline = useOnline()

    const [showOnlineBanner, setShowOnlineBanner] = useState(false)
    const isAnnouncementBanner = (): boolean => {
        const expiryDateOfHidingAnnouncementBanner: string =
            typeof Storage !== 'undefined' &&
            localStorage.getItem(
                // it will store date and time of next day i.e, it will hide banner until this date
                'expiryDateOfHidingAnnouncementBanner',
            )
        const showAnnouncementBannerNextDay: boolean =
            typeof Storage !== 'undefined' &&
            getDateInMilliseconds(localStorage.getItem('dashboardLoginTime')) >
                getDateInMilliseconds(expiryDateOfHidingAnnouncementBanner)

        if (showAnnouncementBannerNextDay && !expiryDateOfHidingAnnouncementBanner) {
            return true
        }
        return getDateInMilliseconds(new Date().valueOf()) > getDateInMilliseconds(expiryDateOfHidingAnnouncementBanner)
    }

    const [showAnnouncementBanner, setShowAnnouncementBanner] = useState(
        AnnouncementConfig.message ? isAnnouncementBanner() : false,
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
            ToastManager.dismissToast(onlineToastRef.current)
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

    const getHierarchialBannerView = (): BannerVariant => {
        if (!isOnline) {
            return BannerVariant.INTERNET_CONNECTIVITY
        }
        // Show online banner temporarily if needed
        if (showOnlineBanner) {
            return BannerVariant.INTERNET_CONNECTIVITY
        }
        if (showAnnouncementBanner) {
            return BannerVariant.ANNOUNCEMENT
        }
        if (enterpriseLicenseBarMessage) {
            return BannerVariant.LICENSE
        }
        if (updateToastRef.current) {
            return BannerVariant.VERSION_UPDATE
        }
        return null
    }

    const bannerView: BannerVariant = getHierarchialBannerView()
    const config = getBannerConfig(bannerView, isOnline, AnnouncementConfig, licenseType)
    if (!config) {
        return null
    }

    const getTextColor = () => {
        switch (bannerView) {
            case BannerVariant.INTERNET_CONNECTIVITY:
                return 'cn-0'
            case BannerVariant.ANNOUNCEMENT:
                return 'text-white'
            default:
                return 'cn-9'
        }
    }
    const baseClassName = `w-100 ${config.rootClassName || ''} ${getTextColor()} ${config.isDismissible ? 'banner-row' : 'flex'}`

    const buttons = buttonConfig(bannerView, handleOpenLicenseDialog)

    return (
        <div className={baseClassName}>
            {config.isDismissible && <div className="icon-dim-28" />}
            <div className="py-4 flex dc__gap-8 dc__align-center pr-16">
                <p className="flex dc__gap-8 m-0 ">
                    {!(isOnline && bannerView === BannerVariant.INTERNET_CONNECTIVITY) &&
                        getBannerIconName(bannerView, AnnouncementConfig.type, iconName)}

                    <div className="fs-12 fw-5 lh-20 dc__truncate">{config.text}</div>
                </p>

                {!(isOnline && bannerView === BannerVariant.INTERNET_CONNECTIVITY) && (
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
