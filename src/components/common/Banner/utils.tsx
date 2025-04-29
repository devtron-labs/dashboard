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

import {
    ButtonComponentType,
    ButtonProps,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    CONTACT_SUPPORT_LINK,
    getDateInMilliseconds,
    Icon,
    IconBaseColorType,
    IconsProps,
    InfoBlockProps,
    InfoBlockVariant,
    InfoBlockVariantType,
    refresh,
    VARIANT_TO_BG_MAP,
    VARIANT_TO_ICON_COLOR_MAP,
} from '@devtron-labs/devtron-fe-common-lib'

import { ANNOUNCEMENT_CONFIG, BannerVariant } from './constants'
import { BannerConfigProps, BannerConfigType } from './types'

export const getBannerIcon = (
    bannerVariant: BannerVariant,
    type: InfoBlockProps['variant'],
    iconName: IconsProps['name'],
) => {
    const variantWithIconMap: Record<BannerVariant, IconsProps['name']> = {
        [BannerVariant.INTERNET_CONNECTIVITY]: 'ic-disconnect',
        [BannerVariant.VERSION_UPDATE]: 'ic-sparkle-color',
        [BannerVariant.INCOMPATIBLE_MICROSERVICES]: 'ic-info-outline',
        [BannerVariant.LICENSE]: iconName,
        [BannerVariant.ANNOUNCEMENT]: 'ic-megaphone-left',
    }

    const VariantWithIconColorMap: Record<BannerVariant, IconBaseColorType | null> = {
        [BannerVariant.INTERNET_CONNECTIVITY]: null,
        [BannerVariant.VERSION_UPDATE]: null,
        [BannerVariant.INCOMPATIBLE_MICROSERVICES]: 'N0',
        [BannerVariant.LICENSE]: null,
        [BannerVariant.ANNOUNCEMENT]: VARIANT_TO_ICON_COLOR_MAP[type],
    }

    return <Icon name={variantWithIconMap[bannerVariant]} color={VariantWithIconColorMap[bannerVariant]} size={16} />
}

export const getBannerConfig = ({
    bannerVariant,
    isOnline,
    licenseType,
    enterpriseLicenseBarMessage = '',
    hideInternetConnectivityBar = false,
    microservice,
}: BannerConfigProps): BannerConfigType => {
    const bannerConfigMap: Partial<Record<BannerVariant, BannerConfigType>> = {
        ...(!hideInternetConnectivityBar
            ? {
                  [BannerVariant.INTERNET_CONNECTIVITY]: isOnline
                      ? {
                            text: 'You’re back online!',
                            rootClassName: 'bcg-5',
                        }
                      : {
                            text: 'You’re offline! Please check your internet connection.',
                            icon: 'ic-disconnected',
                            rootClassName: 'bcr-5',
                        },
              }
            : {}),

        [BannerVariant.VERSION_UPDATE]: {
            text: 'A new version is available.',
            icon: 'ic-sparkle-color',
            rootClassName: 'banner__version-update',
        },

        [BannerVariant.INCOMPATIBLE_MICROSERVICES]: {
            text: `Incompatible ${microservice} service detected.`,
            icon: 'ic-info-outline',
            rootClassName: 'bcr-5',
        },

        [BannerVariant.ANNOUNCEMENT]: {
            text: ANNOUNCEMENT_CONFIG.message,
            icon: 'ic-megaphone-left',
            rootClassName: VARIANT_TO_BG_MAP[ANNOUNCEMENT_CONFIG.type],
            isDismissible: true,
        },

        [BannerVariant.LICENSE]: {
            text: enterpriseLicenseBarMessage,
            icon: licenseType,
            rootClassName: VARIANT_TO_BG_MAP[licenseType],
        },
    }

    return bannerConfigMap[bannerVariant]
}

export const getButtonConfig = (
    bannerView: BannerVariant,
    handleOpenLicenseDialog: () => void,
    handleAppUpdate: () => void,
): ButtonProps<ButtonComponentType> | null => {
    switch (bannerView) {
        case BannerVariant.INTERNET_CONNECTIVITY:
            return {
                text: 'Retry',
                startIcon: <Icon name="ic-arrow-clockwise" color={null} />,
                variant: ButtonVariantType.text,
                size: ComponentSizeType.xxs,
                dataTestId: 'banner-offline-reload',
                onClick: refresh,
                style: ButtonStyleType.neutralN0,
            }
        case BannerVariant.VERSION_UPDATE:
            return {
                startIcon: <Icon name="ic-arrow-clockwise" color={null} />,
                text: 'Reload',
                onClick: handleAppUpdate,
                variant: ButtonVariantType.text,
                size: ComponentSizeType.xxs,
                dataTestId: 'banner-version-update-reload-button',
                style: ButtonStyleType.neutralWhite,
            }
        case BannerVariant.INCOMPATIBLE_MICROSERVICES:
            return {
                startIcon: <Icon name="ic-chat-circle-dots" color={null} />,
                text: 'Contact Support',
                variant: ButtonVariantType.text,
                size: ComponentSizeType.xxs,
                dataTestId: 'banner-incompatible-reload-button',
                style: ButtonStyleType.neutralN0,
                component: ButtonComponentType.anchor,
                anchorProps: {
                    href: CONTACT_SUPPORT_LINK,
                    target: '_blank',
                    rel: 'noreferrer noopener',
                },
            }
        case BannerVariant.ANNOUNCEMENT:
            return {
                text: ANNOUNCEMENT_CONFIG.buttonText || 'Learn more',
                variant: ButtonVariantType.text,
                size: ComponentSizeType.xxs,
                endIcon: <Icon name="ic-arrow-right" color={null} />,
                dataTestId: 'banner-announcement-action-button',
                component: ButtonComponentType.anchor,
                anchorProps: {
                    href: ANNOUNCEMENT_CONFIG.buttonLink,
                    target: '_blank',
                    rel: 'noreferrer noopener',
                },
            }
        case BannerVariant.LICENSE:
            return {
                text: 'Know more',
                variant: ButtonVariantType.text,
                size: ComponentSizeType.xxs,
                onClick: handleOpenLicenseDialog,
                dataTestId: 'banner-license-know-more-button',
            }
        default:
            return null
    }
}

export const getBannerTextColor = (bannerVariant: BannerVariant) => {
    switch (bannerVariant) {
        case BannerVariant.INTERNET_CONNECTIVITY:
        case BannerVariant.INCOMPATIBLE_MICROSERVICES:
            return 'cn-0'
        case BannerVariant.VERSION_UPDATE:
            return 'text__white'
        default:
            return 'cn-9'
    }
}

export const getValidAnnouncementType = (type): type is InfoBlockVariantType =>
    [
        InfoBlockVariant.SUCCESS,
        InfoBlockVariant.WARNING,
        InfoBlockVariant.ERROR,
        InfoBlockVariant.INFORMATION,
        InfoBlockVariant.HELP,
    ].includes(type)

export const shouldShowAnnouncementBanner = (): boolean => {
    const expiry = localStorage.getItem('expiryDateOfHidingAnnouncementBanner')
    const loginTime = localStorage.getItem('dashboardLoginTime')
    if (!expiry) return true
    return getDateInMilliseconds(loginTime) > getDateInMilliseconds(expiry)
}
