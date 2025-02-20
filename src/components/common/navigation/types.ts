import { URLS } from '@Config/routes'
import { customEnv, IconsProps } from '@devtron-labs/devtron-fe-common-lib'

export interface NavigationListItemType {
    title: string
    dataTestId: string
    type: 'link'
    icon: IconsProps['name']
    href: (typeof URLS)[keyof typeof URLS]
    isAvailableInEA?: boolean
    markOnlyForSuperAdmin?: boolean
    forceHideEnvKey?: keyof customEnv
    hideNav?: boolean
    markAsBeta?: boolean
    isAvailableInDesktop?: boolean
    moduleName?: string
    moduleNameTrivy?: string
}
