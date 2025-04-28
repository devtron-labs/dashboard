import { InfoBlockProps } from '@devtron-labs/devtron-fe-common-lib'

import { BannerVariant } from './constants'

export interface BannerConfigProps {
    bannerVariant: BannerVariant
    isOnline: boolean
    announcementConfig?: AnnouncementConfigTypes
    licenseType?: InfoBlockProps['variant']
    enterpriseLicenseBarMessage?: string
}

export interface BannerConfigType {
    text: string
    rootClassName: string
    icon?: string
    licenseType?: InfoBlockProps['variant']
    isDismissible?: boolean
}

export interface AnnouncementConfigTypes {
    message: string
    type: InfoBlockProps['variant']
    buttonText?: string
    buttonLink?: string
}
