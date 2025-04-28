import { Link } from 'react-router-dom'

import {
    ButtonProps,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    Icon,
    IconBaseColorType,
    IconsProps,
    InfoBlockProps,
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
    const variantWithIconMap: Record<BannerVariant, IconsProps['name'] | null> = {
        [BannerVariant.INTERNET_CONNECTIVITY]: 'ic-disconnect',
        [BannerVariant.VERSION_UPDATE]: 'ic-sparkle-color',
        [BannerVariant.LICENSE]: iconName,
        [BannerVariant.ANNOUNCEMENT]: 'ic-megaphone-left',
    }

    return (
        <Icon
            name={variantWithIconMap[bannerVariant]}
            color={
                bannerVariant === BannerVariant.ANNOUNCEMENT
                    ? (VARIANT_TO_ICON_COLOR_MAP[type] as IconBaseColorType)
                    : null
            }
            size={16}
        />
    )
}

export const getBannerConfig = ({
    bannerVariant,
    isOnline,
    licenseType,
    enterpriseLicenseBarMessage = '',
}: BannerConfigProps): BannerConfigType => {
    const bannerConfigMap: Record<BannerVariant, BannerConfigType> = {
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

        [BannerVariant.VERSION_UPDATE]: {
            text: 'A new version is available. Please refresh the page to get the latest features.',
            icon: 'ic-sparkle-color',
            rootClassName: 'banner__version-update',
        },

        [BannerVariant.LICENSE]: {
            text: enterpriseLicenseBarMessage,
            icon: licenseType,
            rootClassName: VARIANT_TO_BG_MAP[licenseType],
        },

        [BannerVariant.ANNOUNCEMENT]: {
            text: ANNOUNCEMENT_CONFIG.message,
            icon: 'ic-megaphone-left',
            rootClassName: VARIANT_TO_BG_MAP[ANNOUNCEMENT_CONFIG.type as InfoBlockProps['variant']],
            isDismissible: true,
        },
    }

    return bannerConfigMap[bannerVariant]
}

export const getButtonConfig = (bannerView: BannerVariant, handleOpenLicenseDialog: () => void): ButtonProps => {
    switch (bannerView) {
        case BannerVariant.VERSION_UPDATE:
            return {
                startIcon: <Icon name="ic-arrow-clockwise" color={null} />,
                text: 'Reload',
                onClick: refresh,
                variant: ButtonVariantType.text,
                size: ComponentSizeType.xxs,
                dataTestId: 'banner-version-update-reload-button',
                style: ButtonStyleType.neutralWhite,
            }
        case BannerVariant.LICENSE:
            return {
                text: 'Know more',
                variant: ButtonVariantType.text,
                size: ComponentSizeType.xxs,
                onClick: handleOpenLicenseDialog,
                dataTestId: 'banner-license-know-more-button',
            }
        case BannerVariant.ANNOUNCEMENT:
            return {
                text: ANNOUNCEMENT_CONFIG.buttonText || 'Learn more',
                variant: ButtonVariantType.text,
                size: ComponentSizeType.xxs,
                endIcon: <Icon name="ic-arrow-right" color={null} />,
                onClick: () => <Link to={ANNOUNCEMENT_CONFIG.buttonLink} />,
                dataTestId: 'banner-announcement-action-button',
            }
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
        default:
            return null
    }
}

export const getBannerTextColor = (bannerVariant: BannerVariant) => {
    switch (bannerVariant) {
        case BannerVariant.INTERNET_CONNECTIVITY:
            return 'cn-0'
        case BannerVariant.ANNOUNCEMENT:
            return 'text-white'
        default:
            return 'cn-9'
    }
}
