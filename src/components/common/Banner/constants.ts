import { InfoBlockProps } from '@devtron-labs/devtron-fe-common-lib'

import { AnnouncementConfigTypes } from './types'

export enum BannerVariant {
    INTERNET_CONNECTIVITY = 'INTERNET_CONNECTIVITY',
    VERSION_UPDATE = 'VERSION_UPDATE',
    ANNOUNCEMENT = 'ANNOUNCEMENT',
    LICENSE = 'LICENSE',
}

export const AnnouncementConfig: AnnouncementConfigTypes = {
    message: window._env_.ANNOUNCEMENT_BANNER_MSG,
    type: window._env_.ANNOUNCEMENT_BANNER_TYPE as InfoBlockProps['variant'],
    buttonText: window._env_.ANNOUNCEMENT_BANNER_BUTTON_TEXT,
    buttonLink: window._env_.ANNOUNCEMENT_BANNER_BUTTON_LINK,
}

export const ONLINE_BANNER_TIMEOUT = 3000 // online banner timeout
