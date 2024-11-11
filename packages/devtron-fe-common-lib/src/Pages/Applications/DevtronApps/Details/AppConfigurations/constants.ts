import { ConfigHeaderTabType } from './types'

export const CONFIG_HEADER_TAB_VALUES = {
    BASE_DEPLOYMENT_TEMPLATE: [ConfigHeaderTabType.VALUES, ConfigHeaderTabType.DRY_RUN],
    OVERRIDE: [ConfigHeaderTabType.INHERITED, ConfigHeaderTabType.VALUES, ConfigHeaderTabType.DRY_RUN],
}
