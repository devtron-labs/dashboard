import { InfoBlockProps } from '@devtron-labs/devtron-fe-common-lib'

export interface BannerConfigType {
    text: string
    rootClassName: string
    type?: 'offline' | 'online'
    icon?: string
    licenseType?: InfoBlockProps['variant']
    isDismissible?: boolean
}

export interface AnnouncementConfigTypes {
    message: string
    type: InfoBlockProps['variant']
    buttonText: string
    buttonLink: string
}
