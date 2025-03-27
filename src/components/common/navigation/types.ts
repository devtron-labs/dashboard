import { URLS } from '@Config/routes'
import { customEnv, IconsProps, URLS as CommonURLS } from '@devtron-labs/devtron-fe-common-lib'

export interface NavigationListItemType {
    title: string
    dataTestId: string
    type: 'link'
    icon: IconsProps['name']
    href: (typeof URLS)[keyof typeof URLS] | (typeof CommonURLS)[keyof typeof CommonURLS]
    isAvailableInEA?: boolean
    markOnlyForSuperAdmin?: boolean
    forceHideEnvKey?: keyof customEnv
    hideNav?: boolean
    markAsBeta?: boolean
    isAvailableInDesktop?: boolean
    moduleName?: string
    moduleNameTrivy?: string
}
