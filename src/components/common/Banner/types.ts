import { InfoBlockProps } from '@devtron-labs/devtron-fe-common-lib'

import { BannerVariant } from './constants'

export interface BannerConfigProps {
    bannerVariant: Partial<BannerVariant>
    isOnline: boolean
    licenseType?: InfoBlockProps['variant']
    enterpriseLicenseBarMessage?: string
    hideInternetConnectivityBar?: boolean
}

export interface BannerConfigType {
    text: string
    rootClassName: string
    icon?: string
    isDismissible?: boolean
}

export interface AnnouncementConfigTypes {
    message: string
    type: InfoBlockProps['variant']
    buttonText?: string
    buttonLink?: string
}
