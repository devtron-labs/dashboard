import { MouseEventHandler, MutableRefObject } from 'react'
import { NavLinkProps } from 'react-router-dom'

import { customEnv, IconsProps, Never, SERVER_MODE } from '@devtron-labs/devtron-fe-common-lib'

export type NavigationItemID =
    | 'application-management-overview'
    | 'application-management-applications'
    | 'application-management-application-groups'
    | 'application-management-chart-store'
    | 'application-management-bulk-edit'
    | 'application-management-configurations'
    | 'application-management-policies'
    | 'application-management-others'
    | 'infrastructure-management-overview'
    | 'infrastructure-management-resource-browser'
    | 'infrastructure-management-intercepted-changes'
    | 'infrastructure-management-resource-watcher'
    | 'infrastructure-management-catalog-framework'
    | 'software-release-management-overview'
    | 'software-release-management-software-release'
    | 'cost-visibility-overview'
    | 'cost-visibility-trends'
    | 'cost-visibility-cost-breakdown'
    | 'cost-visibility-configurations'
    | 'security-center-overview'
    | 'security-center-application-security'
    | 'security-center-security-policies'
    | 'automation-and-enablement-jobs'
    | 'automation-and-enablement-alerting'
    | 'automation-and-enablement-incident-response'
    | 'automation-and-enablement-api-portal'
    | 'automation-and-enablement-runbook-automation'
    | 'global-configuration-sso-login-services'
    | 'global-configuration-host-urls'
    | 'global-configuration-cluster-and-environments'
    | 'global-configuration-container-oci-registry'
    | 'global-configuration-authorization'

export type NavigationSubMenuItemID =
    | 'application-management-configurations-gitops'
    | 'application-management-configurations-git-accounts'
    | 'application-management-configurations-external-links'
    | 'application-management-configurations-chart-repository'
    | 'application-management-configurations-deployment-charts'
    | 'application-management-configurations-notifications'
    | 'application-management-configurations-catalog-frameworks'
    | 'application-management-configurations-scoped-variables'
    | 'application-management-configurations-build-infra'
    | 'application-management-policies-deployment-window'
    | 'application-management-policies-approval-policy'
    | 'application-management-policies-plugin-policy'
    | 'application-management-policies-pull-image-digest'
    | 'application-management-policies-tag-policy'
    | 'application-management-policies-filter-conditions'
    | 'application-management-policies-lock-deployment-configuration'
    | 'application-management-others-application-templates'
    | 'application-management-others-projects'
    | 'cost-visibility-cost-breakdown-clusters'
    | 'cost-visibility-cost-breakdown-environments'
    | 'cost-visibility-cost-breakdown-projects'
    | 'cost-visibility-cost-breakdown-applications'
    | 'global-configuration-authorization-user-permissions'
    | 'global-configuration-authorization-permission-groups'
    | 'global-configuration-authorization-api-tokens'

export type NavigationRootItemID =
    | 'application-management'
    | 'infrastructure-management'
    | 'software-release-management'
    | 'cost-visibility'
    | 'security-center'
    | 'automation-and-enablement'
    | 'global-configuration'

type CommonNavigationItemType = {
    title: string
    dataTestId: string
    icon: IconsProps['name']
    href: string
    disabled?: boolean
}

export type NavigationItemType = Pick<CommonNavigationItemType, 'dataTestId' | 'disabled'> & {
    isAvailableInEA?: boolean
    markOnlyForSuperAdmin?: boolean
    forceHideEnvKey?: keyof customEnv
    title: string
    hideNav?: boolean
    markAsBeta?: boolean
    isAvailableInDesktop?: boolean
    moduleName?: string
    moduleNameTrivy?: string
    id: NavigationItemID
} & (
        | (Pick<CommonNavigationItemType, 'icon' | 'href'> & {
              hasSubMenu?: false
              subItems?: never
          })
        | (Never<Pick<CommonNavigationItemType, 'icon' | 'href'>> & {
              hasSubMenu: true
              subItems: (Omit<CommonNavigationItemType, 'icon'> & { id: NavigationSubMenuItemID })[]
          })
    )

export interface NavigationGroupType extends Pick<CommonNavigationItemType, 'title' | 'icon'> {
    id: NavigationRootItemID
    items: NavigationItemType[]
}

export interface NavGroupProps extends Pick<NavigationGroupType, 'icon' | 'title'> {
    isExpanded?: boolean
    isSelected?: boolean
    to?: NavLinkProps['to']
    onClick?: MouseEventHandler<HTMLButtonElement>
}

export interface NavigationProps {
    showStackManager?: boolean
    isAirgapped: boolean
    serverMode: SERVER_MODE
    moduleInInstallingState: string
    installedModuleMap: MutableRefObject<Record<string, boolean>>
    isSuperAdmin: boolean
}
