import { DOCUMENTATION, URLS } from '../../config'

export type ComponentStates = 'loading' | 'success' | 'failed'

export interface SectionHeadingType {
    title: string
    subtitle: string
    learnMoreLink: string
}

export const SECTION_HEADING_INFO: Record<string, SectionHeadingType> = {
    [URLS.APP_CM_CONFIG]: {
        title: 'ConfigMaps',
        subtitle:
            'ConfigMap is used to store common configuration variables, allowing users to unify environment variables for different modules in a distributed system into one object.',
        learnMoreLink: DOCUMENTATION.APP_CREATE_CONFIG_MAP,
    },
    [URLS.APP_CS_CONFIG]: {
        title: 'Secrets',
        subtitle: 'A Secret is an object that contains sensitive data such as passwords, OAuth tokens, and SSH keys.',
        learnMoreLink: DOCUMENTATION.APP_CREATE_SECRET,
    },
}
