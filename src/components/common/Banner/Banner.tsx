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

import { useCallback, useEffect, useRef, useState } from 'react'

import {
    AnimatePresence,
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    Icon,
    InfoBlockVariant,
    MotionDiv,
    noop,
    setActionWithExpiry,
    useMainContext,
} from '@devtron-labs/devtron-fe-common-lib'

import { InstallationType } from '@Components/v2/devtronStackManager/DevtronStackManager.type'

import { importComponentFromFELibrary } from '../helpers/Helpers'
import { InteractiveCellText } from '../helpers/InteractiveCellText/InteractiveCellText'
import { useOnline } from '../hooks'
import { ONLINE_BANNER_TIMEOUT } from '../hooks/constants'
import { ANNOUNCEMENT_CONFIG, BannerVariant } from './constants'
import {
    getBannerConfig,
    getBannerIcon,
    getBannerTextColor,
    getButtonConfig,
    shouldShowAnnouncementBanner,
} from './utils'

import './banner.scss'

const isFELibAvailable = importComponentFromFELibrary('isFELibAvailable', null, 'function')
const useEnterpriseLicenseConfig = importComponentFromFELibrary('useEnterpriseLicenseConfig', noop, 'function')

const bannerVariants = {
    enter: {
        y: -40,
        opacity: 0,
        height: 0,
    },
    center: {
        y: 0,
        opacity: 1,
        height: 'auto',
    },
    exitUp: (isBannerReplaced: boolean) =>
        !isBannerReplaced
            ? {
                  y: -40,
                  opacity: 0,
                  height: 0,
              }
            : {
                  y: 40,
                  opacity: 0,
                  height: 0,
              },
}

export const Banner = () => {
    const { isAirgapped, currentServerInfo, doesNeedRefresh, handleAppUpdate, bgUpdated } = useMainContext()
    const licenseConfig = useEnterpriseLicenseConfig()

    const [showOnlineBanner, setShowOnlineBanner] = useState(false)
    const [showAnnouncementBanner, setShowAnnouncementBanner] = useState(
        ANNOUNCEMENT_CONFIG.message ? shouldShowAnnouncementBanner() : false,
    )

    const onlineTimer = useRef<ReturnType<typeof setTimeout>>(null)

    const onOnline = useCallback(() => {
        setShowOnlineBanner(true)

        // Clear any existing timer before setting a new one
        if (onlineTimer.current) {
            clearTimeout(onlineTimer.current)
        }

        onlineTimer.current = setTimeout(() => setShowOnlineBanner(false), ONLINE_BANNER_TIMEOUT)
    }, [])

    const isOnline = useOnline({ onOnline })

    useEffect(
        () => () => {
            if (onlineTimer.current) {
                clearTimeout(onlineTimer.current)
            }
        },
        [],
    )

    const getIncompatibleMicroserviceName = (): 'frontend' | 'backend' | null => {
        const { serverInfo } = currentServerInfo
        if (serverInfo) {
            if (serverInfo.installationType !== InstallationType.ENTERPRISE && isFELibAvailable) return 'backend'
            if (serverInfo.installationType === InstallationType.ENTERPRISE && !isFELibAvailable) return 'frontend'
        }
        return null
    }

    const incompatibleService = getIncompatibleMicroserviceName()
    const {
        message: enterpriseLicenseBarMessage = '',
        type: licenseType = InfoBlockVariant.HELP,
        iconName = '',
        handleOpenLicenseDialog,
    } = licenseConfig ?? {}

    const getCurrentBanner = (): BannerVariant | null => {
        if ((!isOnline || showOnlineBanner) && !isAirgapped) {
            if (!isOnline) {
                return BannerVariant.OFFLINE
            }

            if (showOnlineBanner) {
                return BannerVariant.ONLINE
            }
        }
        if (doesNeedRefresh || bgUpdated) return BannerVariant.VERSION_UPDATE
        if (incompatibleService) return BannerVariant.INCOMPATIBLE_MICROSERVICES
        if (showAnnouncementBanner) return BannerVariant.ANNOUNCEMENT
        if (licenseConfig?.message) return BannerVariant.LICENSE
        return null
    }
    const bannerVariant = getCurrentBanner()

    const config = getBannerConfig({
        bannerVariant,
        licenseType,
        enterpriseLicenseBarMessage,
        hideInternetConnectivityBar: isAirgapped,
        microservice: incompatibleService,
    })

    const actionButtons = getButtonConfig(bannerVariant, handleOpenLicenseDialog, handleAppUpdate)
    const baseClassName = `w-100 ${config?.rootClassName || ''} ${getBannerTextColor(bannerVariant)} ${config?.isDismissible ? 'dc__grid banner--row dc__column-gap-16' : 'flex'}`

    const shouldShowActionButton = () => {
        if (bannerVariant === BannerVariant.OFFLINE) return true
        if (bannerVariant === BannerVariant.ANNOUNCEMENT) return !!ANNOUNCEMENT_CONFIG.buttonLink
        if (
            bannerVariant === BannerVariant.VERSION_UPDATE ||
            bannerVariant === BannerVariant.INCOMPATIBLE_MICROSERVICES
        )
            return true
        return false
    }

    const onClickCloseAnnouncementBanner = () => {
        if (typeof Storage !== 'undefined' && bannerVariant === BannerVariant.ANNOUNCEMENT) {
            setActionWithExpiry('expiryDateOfHidingAnnouncementBanner', 1)
        }
        setShowAnnouncementBanner(false)
    }

    return (
        <AnimatePresence custom={!!bannerVariant}>
            {bannerVariant && config && (
                <MotionDiv
                    layout
                    key={bannerVariant}
                    variants={bannerVariants}
                    initial="enter"
                    animate="center"
                    exit="exitUp"
                    custom={!!bannerVariant}
                    transition={{
                        duration: 0.3,
                        ease: 'easeOut',
                    }}
                    className={baseClassName}
                >
                    {config.isDismissible && <div className="icon-dim-28 dc__no-shrink" />}
                    <div className="py-4 flex dc__gap-12 dc__align-items-center">
                        <div className="flex dc__gap-8">
                            {bannerVariant !== BannerVariant.ONLINE &&
                                getBannerIcon(bannerVariant, ANNOUNCEMENT_CONFIG.type, iconName)}
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
                </MotionDiv>
            )}
        </AnimatePresence>
    )
}
