import { InfoBlockProps } from '@devtron-labs/devtron-fe-common-lib'

export enum BANNER_VARIANT {
    INTERNET_CONNECTIVITY = 'INTERNET_CONNECTIVITY',
    VERSION_UPDATE = 'VERSION_UPDATE',
    ANNOUNCEMENT = 'ANNOUNCEMENT',
    LICENSE = 'LICENSE',
}

export enum INTERNET_CONNECTIVITY {
    ONLINE = 'ONLINE',
    OFFLINE = 'OFFLINE',
}

export const VARIANT_TO_BG_MAP: Record<InfoBlockProps['variant'], string> = {
    error: 'bcr-1',
    help: 'bcv-1',
    information: 'bcb-1',
    success: 'bcg-1',
    warning: 'bcy-1',
    neutral: 'bcn-1',
}

export const VARIANT_TO_ICON_COLOR_MAP: Record<InfoBlockProps['variant'], string> = {
    error: 'R500',
    help: 'V500',
    information: 'B500',
    success: 'G500',
    warning: 'Y700',
    neutral: 'N500',
}

// TO BE REPLACED With CM
export const AnnouncementConfig = {
    message: 'Announcement message comes here',
    type: 'help',
    buttonText: 'Learn more',
    buttonLink: 'https://devtron.ai',
}
