import {
    ButtonProps,
    ButtonVariantType,
    ComponentSizeType,
    Icon,
    IconsProps,
    InfoBlockProps,
} from '@devtron-labs/devtron-fe-common-lib'

import { BANNER_VARIANT, INTERNET_CONNECTIVITY, VARIANT_TO_BG_MAP, VARIANT_TO_ICON_COLOR_MAP } from './constants'
import { BannerConfigType } from './types'

export const getBannerIconName = (bannerVariant: BANNER_VARIANT, type) => {
    const variantWithIconMap: Record<BANNER_VARIANT, IconsProps['name'] | null> = {
        [BANNER_VARIANT.INTERNET_CONNECTIVITY]: 'ic-disconnect',
        [BANNER_VARIANT.VERSION_UPDATE]: 'ic-sparkle-color',
        [BANNER_VARIANT.LICENSE]: 'ic-error',
        [BANNER_VARIANT.ANNOUNCEMENT]: 'ic-megaphone-left',
    }

    return (
        <Icon
            name={variantWithIconMap[bannerVariant]}
            color={bannerVariant === BANNER_VARIANT.ANNOUNCEMENT ? VARIANT_TO_ICON_COLOR_MAP[type] : null}
            size={16}
        />
    )
}

export const getBannerConfig = (
    variant: BANNER_VARIANT,
    isOnline?: boolean,
    _announcementConfig?: { message: string; type: string },
): BannerConfigType => {
    const bannerConfigMap: Record<BANNER_VARIANT, BannerConfigType> = {
        [BANNER_VARIANT.INTERNET_CONNECTIVITY]: isOnline
            ? {
                  text: 'You’re back online!',
                  rootClassName: 'bcg-5',
                  type: INTERNET_CONNECTIVITY.ONLINE,
              }
            : {
                  text: 'You’re offline! Please check your internet connection.',
                  icon: 'ic-disconnected',
                  rootClassName: 'bcr-5',
                  type: INTERNET_CONNECTIVITY.OFFLINE,
              },

        [BANNER_VARIANT.VERSION_UPDATE]: {
            text: 'A new version is available. Please refresh the page to get the latest features.',
            icon: 'ic-warning',
            rootClassName: 'bcy-1',
        },

        [BANNER_VARIANT.LICENSE]: {
            text: 'You’re using unlicensed version of Devtron',
            icon: 'ic-error',
            rootClassName: 'bcr-1',
        },

        [BANNER_VARIANT.ANNOUNCEMENT]: {
            text: _announcementConfig.message,
            icon: 'ic-megaphone-left',
            rootClassName: VARIANT_TO_BG_MAP[_announcementConfig.type as InfoBlockProps['variant']],
        },
    }

    return bannerConfigMap[variant]
}

export const buttonConfig = (bannerView: BANNER_VARIANT): ButtonProps[] | ButtonProps | null => {
    switch (bannerView) {
        case BANNER_VARIANT.VERSION_UPDATE:
            return [
                {
                    startIcon: <Icon name="ic-gift" color={null} />,
                    text: 'What’s New',
                    onClick: () => window.location.reload(), // TODO: need to replace
                    variant: ButtonVariantType.borderLess,
                    size: ComponentSizeType.small,
                    dataTestId: 'banner-what-is-new',
                },
                {
                    startIcon: <Icon name="ic-arrow-clockwise" color={null} />,
                    text: 'Reload',
                    onClick: () => window.location.reload(),
                    variant: ButtonVariantType.borderLess,
                    size: ComponentSizeType.small,
                    dataTestId: 'banner-reload',
                },
            ]
        case BANNER_VARIANT.LICENSE:
            return null
        case BANNER_VARIANT.ANNOUNCEMENT:
            return {
                text: 'Learn more',
                variant: ButtonVariantType.text,
                size: ComponentSizeType.small,
                endIcon: <Icon name="ic-arrow-right" color={null} />,
                onClick: () => window.open('https://devtron.ai', '_blank'),
                dataTestId: 'banner-learn-more',
            }
        default:
            return null
    }
}
