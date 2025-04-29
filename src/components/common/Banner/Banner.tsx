/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useEffect, useRef, useState } from 'react'

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    Icon,
    InfoBlockVariant,
    setActionWithExpiry,
    useMainContext,
} from '@devtron-labs/devtron-fe-common-lib'

import { InstallationType } from '@Components/v2/devtronStackManager/DevtronStackManager.type'

import { importComponentFromFELibrary, useOnline } from '../helpers/Helpers'
import { InteractiveCellText } from '../helpers/InteractiveCellText/InteractiveCellText'
import { ANNOUNCEMENT_CONFIG, BannerVariant, ONLINE_BANNER_TIMEOUT } from './constants'
import { useVersionUpdateReload } from './useVersionUpdateReload'
import {
    getBannerConfig,
    getBannerIcon,
    getBannerTextColor,
    getButtonConfig,
    shouldShowAnnouncementBanner,
} from './utils'

import './banner.scss'

const isFELibAvailable = importComponentFromFELibrary('isFELibAvailable', null, 'function')
const useEnterpriseLicenseConfig = importComponentFromFELibrary('useEnterpriseLicenseConfig', () => null, 'function')

export const Banner = () => {
    const didMountRef = useRef(false)
    const isOnline = useOnline()
    const { isAirgapped, currentServerInfo } = useMainContext()

    const [showOnlineBanner, setShowOnlineBanner] = useState(false)
    const [showAnnouncementBanner, setShowAnnouncementBanner] = useState(
        ANNOUNCEMENT_CONFIG.message ? shouldShowAnnouncementBanner() : false,
    )
    const { bgUpdated, doesNeedRefresh, handleAppUpdate } = useVersionUpdateReload()

    const licenseConfig = useEnterpriseLicenseConfig()

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

    const getIncompatibleMicroserviceName = (): 'frontend' | 'backend' | null => {
        const { serverInfo } = currentServerInfo
        if (serverInfo) {
            if (serverInfo.installationType !== InstallationType.ENTERPRISE && isFELibAvailable) return 'backend'
            if (serverInfo.installationType === InstallationType.ENTERPRISE && !isFELibAvailable) return 'frontend'
        }
        return null
    }

    const {
        message: enterpriseLicenseBarMessage = '',
        type: licenseType = InfoBlockVariant.HELP,
        iconName = '',
        handleOpenLicenseDialog,
    } = licenseConfig ?? {}

    const getCurrentBanner = (): BannerVariant => {
        if (!isOnline) return BannerVariant.INTERNET_CONNECTIVITY
        if (showOnlineBanner) return BannerVariant.INTERNET_CONNECTIVITY
        if (doesNeedRefresh || bgUpdated) return BannerVariant.VERSION_UPDATE
        if (getIncompatibleMicroserviceName()?.length) return BannerVariant.INCOMPATIBLE_MICROSERVICES
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
        hideInternetConnectivityBar: isAirgapped,
    })

    if (!config) return null

    const actionButtons = getButtonConfig(bannerVariant, handleOpenLicenseDialog, handleAppUpdate)
    const baseClassName = `w-100 ${config.rootClassName || ''} ${getBannerTextColor(bannerVariant)} ${config.isDismissible ? 'dc__grid banner-row' : 'flex'}`
    const isOffline = !(isOnline && bannerVariant === BannerVariant.INTERNET_CONNECTIVITY)

    const shouldShowActionButton = () => {
        if (bannerVariant === BannerVariant.INTERNET_CONNECTIVITY) {
            return isOffline
        }
        if (bannerVariant === BannerVariant.ANNOUNCEMENT) {
            return !!ANNOUNCEMENT_CONFIG.buttonLink
        }
        if (
            bannerVariant === BannerVariant.VERSION_UPDATE ||
            bannerVariant === BannerVariant.INCOMPATIBLE_MICROSERVICES
        ) {
            return true
        }

        return false
    }

    return (
        <div className={baseClassName}>
            {config.isDismissible && <div className="icon-dim-28" />}
            <div className="py-4 flex dc__gap-12 dc__align-items-center">
                <div className="flex dc__gap-8">
                    {isOffline && getBannerIcon(bannerVariant, ANNOUNCEMENT_CONFIG.type, iconName)}
                    <InteractiveCellText text={config.text} rootClassName="fw-5" fontSize={12} interactive />
                </div>

                {shouldShowActionButton() && (
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
