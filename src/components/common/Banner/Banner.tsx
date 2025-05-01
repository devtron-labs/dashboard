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

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

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
    const { bgUpdated, doesNeedRefresh, handleAppUpdate } = useVersionUpdateReload()
    const licenseConfig = useEnterpriseLicenseConfig()

    const [showOnlineBanner, setShowOnlineBanner] = useState(false)
    const [showAnnouncementBanner, setShowAnnouncementBanner] = useState(
        ANNOUNCEMENT_CONFIG.message ? shouldShowAnnouncementBanner() : false,
    )
    const [activeBannerVariant, setActiveBannerVariant] = useState<BannerVariant | null>(null)
    const [isVisible, setIsVisible] = useState(true)
    const prevBannerRef = useRef<BannerVariant | null>(null)

    useEffect(() => {
        let timer: NodeJS.Timeout
        if (didMountRef.current) {
            if (isOnline) {
                setShowOnlineBanner(true)
                timer = setTimeout(() => setShowOnlineBanner(false), ONLINE_BANNER_TIMEOUT)
                setIsVisible(false)
            }
        } else {
            didMountRef.current = true
        }
        return () => {
            if (timer) clearTimeout(timer)
        }
    }, [isOnline])

    const getIncompatibleMicroserviceName = (): 'frontend' | 'backend' | null => {
        const { serverInfo } = currentServerInfo
        if (serverInfo) {
            if (serverInfo.installationType !== InstallationType.ENTERPRISE && isFELibAvailable) return 'backend'
            if (serverInfo.installationType === InstallationType.ENTERPRISE && !isFELibAvailable) return 'frontend'
        }
        return null
    }

    const incompatibleService = useMemo(() => getIncompatibleMicroserviceName(), [currentServerInfo])
    const {
        message: enterpriseLicenseBarMessage = '',
        type: licenseType = InfoBlockVariant.HELP,
        iconName = '',
        handleOpenLicenseDialog,
    } = licenseConfig ?? {}

    const getCurrentBanner = (): BannerVariant | null => {
        if ((!isOnline || showOnlineBanner) && !isAirgapped) return BannerVariant.INTERNET_CONNECTIVITY
        if (doesNeedRefresh || bgUpdated) return BannerVariant.VERSION_UPDATE
        if (incompatibleService) return BannerVariant.INCOMPATIBLE_MICROSERVICES
        if (showAnnouncementBanner) return BannerVariant.ANNOUNCEMENT
        if (licenseConfig?.message) return BannerVariant.LICENSE
        return null
    }

    const bannerVariant = getCurrentBanner()

    useEffect(() => {
        if (bannerVariant !== prevBannerRef.current) {
            setIsVisible(true)
            setActiveBannerVariant(bannerVariant)
            prevBannerRef.current = bannerVariant
        }
    }, [bannerVariant])

    if (!activeBannerVariant) return null

    const config = getBannerConfig({
        bannerVariant: activeBannerVariant,
        isOnline,
        licenseType,
        enterpriseLicenseBarMessage,
        hideInternetConnectivityBar: isAirgapped,
        microservice: incompatibleService,
    })

    if (!config) return null

    const actionButtons = getButtonConfig(activeBannerVariant, handleOpenLicenseDialog, handleAppUpdate)
    const isOffline = !(isOnline && activeBannerVariant === BannerVariant.INTERNET_CONNECTIVITY)
    const baseClassName = `w-100 ${config.rootClassName || ''} ${getBannerTextColor(activeBannerVariant)} ${config.isDismissible ? 'dc__grid banner-row' : 'flex'} dc__position-abs`

    const shouldShowActionButton = () => {
        if (activeBannerVariant === BannerVariant.INTERNET_CONNECTIVITY) return isOffline
        if (activeBannerVariant === BannerVariant.ANNOUNCEMENT) return !!ANNOUNCEMENT_CONFIG.buttonLink
        if (
            activeBannerVariant === BannerVariant.VERSION_UPDATE ||
            activeBannerVariant === BannerVariant.INCOMPATIBLE_MICROSERVICES
        )
            return true
        return false
    }

    const onClickCloseAnnouncementBanner = () => {
        if (typeof Storage !== 'undefined' && activeBannerVariant === BannerVariant.ANNOUNCEMENT) {
            setActionWithExpiry('expiryDateOfHidingAnnouncementBanner', 1)
        }
        if (licenseConfig?.message) {
            setActiveBannerVariant(BannerVariant.LICENSE)
            setIsVisible(true)
        } else {
            setIsVisible(false)
        }
    }

    const handleAnimationComplete = () => {
        if (!isVisible && activeBannerVariant === BannerVariant.ANNOUNCEMENT) {
            setShowAnnouncementBanner(false)
            setActiveBannerVariant(null)
        }
    }

    return (
        <div className="banner-container dc__position-rel dc__overflow-hidden">
            <AnimatePresence>
                {isVisible && activeBannerVariant && (
                    <motion.div
                        key={`${activeBannerVariant}-${config?.text}`}
                        initial={{ y: -28 }}
                        animate={{ y: isVisible ? 0 : -28 }}
                        exit={{ y: -28 }}
                        transition={{
                            duration: 0.3,
                            ease: 'easeIn',
                        }}
                        className={baseClassName}
                        onAnimationComplete={handleAnimationComplete}
                    >
                        {config.isDismissible && <div className="icon-dim-28" />}
                        <div className="py-4 flex dc__gap-12 dc__align-items-center">
                            <div className="flex dc__gap-8">
                                {isOffline && getBannerIcon(activeBannerVariant, ANNOUNCEMENT_CONFIG.type, iconName)}
                                <InteractiveCellText
                                    text={config.text}
                                    rootClassName="fw-5"
                                    fontSize={12}
                                    interactive
                                />
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
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
