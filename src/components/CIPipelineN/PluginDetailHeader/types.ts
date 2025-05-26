import { DOCUMENTATION, PluginDetailType } from '@devtron-labs/devtron-fe-common-lib'

export interface PluginDetailTypes extends Pick<PluginDetailType, 'name' | 'description' | 'icon' | 'tags'> {
    isExternalLink?: boolean
    docLink: string | keyof typeof DOCUMENTATION
}
